import type React from 'react';
import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useBoardStore } from '../../store/useBoardStore';
import { useCheckpointStore } from '../../store/useCheckpointStore';

interface CheckpointControlsProps {
  onCreateCheckpoint: (checkpointId: string, name: string | null) => void;
  onRestoreCheckpoint: (checkpointId: string) => void;
}

export const CheckpointControls: React.FC<CheckpointControlsProps> = ({
  onCreateCheckpoint,
  onRestoreCheckpoint,
}) => {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const isReplaying = useCheckpointStore((s) => s.isReplaying);
  const connectionStatus = useBoardStore((s) => s.connectionStatus);
  const [showList, setShowList] = useState(false);

  const handleCreate = useCallback(() => {
    const name = prompt('Checkpoint name (optional):');
    const checkpointId = uuid();
    onCreateCheckpoint(checkpointId, name || null);
  }, [onCreateCheckpoint]);

  const handleRestore = useCallback(
    (checkpointId: string) => {
      if (confirm('Restore board to this checkpoint? All changes since will remain in history.')) {
        onRestoreCheckpoint(checkpointId);
        setShowList(false);
      }
    },
    [onRestoreCheckpoint],
  );

  if (isReplaying) return null;

  const isConnected = connectionStatus === 'connected';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', gap: 4 }}>
      <button
        type="button"
        onClick={handleCreate}
        disabled={!isConnected}
        title="Create checkpoint"
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '4px 8px',
          cursor: isConnected ? 'pointer' : 'not-allowed',
          fontSize: 13,
          opacity: isConnected ? 1 : 0.5,
        }}
      >
        + Checkpoint
      </button>
      {checkpoints.length > 0 && (
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Restore ({checkpoints.length})
        </button>
      )}
      {showList && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 4,
            minWidth: 200,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 1001,
          }}
        >
          {checkpoints.map((cp) => (
            <div
              key={cp.checkpointId}
              role="button"
              tabIndex={0}
              onClick={() => handleRestore(cp.checkpointId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleRestore(cp.checkpointId);
              }}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 12,
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'var(--hover)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              <div style={{ fontWeight: 500 }}>{cp.name ?? 'Unnamed checkpoint'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                Seq {cp.atServerSeq} &middot; {new Date(cp.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
