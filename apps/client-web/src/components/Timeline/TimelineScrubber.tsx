import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCheckpoints, fetchReplayOps, fetchSnapshotAt } from '../../collab/CheckpointService';
import { ReplayEngine } from '../../collab/ReplayEngine';
import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useCheckpointStore } from '../../store/useCheckpointStore';

const REPLAY_INTERVAL_MS = 100; // 10 ops/sec during playback

export const TimelineScrubber: React.FC = () => {
  const boardId = useBoardStore((s) => s.boardId);
  const {
    checkpoints,
    isReplaying,
    replaySeq,
    replayStartSeq,
    replayEndSeq,
    setCheckpoints,
    setReplaying,
    setReplaySeq,
    setReplayData,
    clearReplay,
  } = useCheckpointStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const replayEngineRef = useRef<ReplayEngine | null>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load checkpoints on mount
  useEffect(() => {
    if (boardId) {
      fetchCheckpoints(boardId).then(setCheckpoints).catch(console.error);
    }
  }, [boardId, setCheckpoints]);

  /** Apply replay state at a given serverSeq to the canvas store (read-only overlay). */
  const applyReplayState = useCallback(
    (seq: number) => {
      if (!replayEngineRef.current) return;
      const objects = replayEngineRef.current.getStateAt(seq);
      const store = useCanvasStore.getState();

      // Clear and rebuild objects (during replay, canvas is read-only)
      const currentObjects = store.objects;
      for (const id of currentObjects.keys()) {
        store.removeObject(id);
      }
      for (const [id, data] of objects) {
        store.addObject({
          id,
          type: (data.objectType as string) ?? (data.type as string) ?? 'unknown',
          zIndex: (data.zIndex as number) ?? 0,
          data,
        });
      }

      setReplaySeq(seq);
    },
    [setReplaySeq],
  );

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  /** Enter replay mode: load snapshot + ops from seq 0 to current serverSeq. */
  const startReplay = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const lastSeq = useBoardStore.getState().lastSeenServerSeq;
      const snap = await fetchSnapshotAt(boardId, 0);
      const snapSeq = snap?.atServerSeq ?? 0;
      const snapData = (snap?.data?.objects ?? null) as Record<
        string,
        Record<string, unknown>
      > | null;

      const ops = await fetchReplayOps(boardId, 0, lastSeq);
      setReplayData({
        ops,
        snapshot: snapData,
        startSeq: 0,
        endSeq: lastSeq,
      });

      replayEngineRef.current = new ReplayEngine(snapData, snapSeq, ops);
      setReplaying(true);

      // Apply initial state (seq 0 = empty or snapshot)
      applyReplayState(0);
    } catch (err) {
      console.error('Failed to start replay:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId, setReplayData, setReplaying, applyReplayState]);

  /** Exit replay mode and restore live state. */
  const exitReplay = useCallback(() => {
    stopPlayback();
    clearReplay();
    replayEngineRef.current = null;
  }, [clearReplay, stopPlayback]);

  /** Scrubber input change. */
  const onScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const seq = Number(e.target.value);
      applyReplayState(seq);
    },
    [applyReplayState],
  );

  /** Play/pause auto-advance. */
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        const current = useCheckpointStore.getState().replaySeq;
        const end = useCheckpointStore.getState().replayEndSeq;
        if (current >= end) {
          stopPlayback();
          return;
        }
        const allOps = useCheckpointStore.getState().replayOps;
        const nextOp = allOps.find((op) => op.serverSeq > current);
        if (nextOp) {
          applyReplayState(nextOp.serverSeq);
        } else {
          applyReplayState(end);
          stopPlayback();
        }
      }, REPLAY_INTERVAL_MS);
    }
  }, [isPlaying, applyReplayState, stopPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  if (!boardId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 1000,
        minWidth: 400,
      }}
    >
      {!isReplaying ? (
        <>
          <button
            type="button"
            onClick={startReplay}
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: 13,
            }}
          >
            {loading ? 'Loading...' : 'Replay'}
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
          </span>
          {checkpoints.map((cp) => (
            <span
              key={cp.checkpointId}
              title={cp.name ?? `Checkpoint at seq ${cp.atServerSeq}`}
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          ))}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={togglePlayback}
            style={{
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min={replayStartSeq}
            max={replayEndSeq}
            value={replaySeq}
            onChange={onScrub}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <span style={{ color: 'var(--text)', fontSize: 12, minWidth: 60, textAlign: 'right' }}>
            {replaySeq} / {replayEndSeq}
          </span>
          <button
            type="button"
            onClick={exitReplay}
            style={{
              background: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Exit
          </button>
        </>
      )}
    </div>
  );
};
