import { describe, it, expect, beforeEach } from 'vitest';
import { useCheckpointStore } from '../store/useCheckpointStore';

describe('useCheckpointStore', () => {
  beforeEach(() => {
    useCheckpointStore.setState({
      checkpoints: [],
      isReplaying: false,
      replaySeq: 0,
      replayOps: [],
      replaySnapshot: null,
      replayStartSeq: 0,
      replayEndSeq: 0,
    });
  });

  it('sets checkpoints', () => {
    const cps = [
      {
        checkpointId: 'cp-1',
        name: 'First',
        atServerSeq: 10,
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
    useCheckpointStore.getState().setCheckpoints(cps);
    expect(useCheckpointStore.getState().checkpoints).toEqual(cps);
  });

  it('adds a checkpoint', () => {
    useCheckpointStore.getState().addCheckpoint({
      checkpointId: 'cp-1',
      name: 'Test',
      atServerSeq: 5,
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
    });
    expect(useCheckpointStore.getState().checkpoints).toHaveLength(1);
  });

  it('sets replay data', () => {
    const ops = [
      { serverSeq: 1, clientId: 'c1', clientSeq: 0, opType: 'createObject', payload: {} },
    ];
    useCheckpointStore.getState().setReplayData({
      ops,
      snapshot: { 'obj-1': { type: 'stroke' } },
      startSeq: 0,
      endSeq: 10,
    });

    const state = useCheckpointStore.getState();
    expect(state.replayOps).toHaveLength(1);
    expect(state.replaySnapshot).toBeDefined();
    expect(state.replayStartSeq).toBe(0);
    expect(state.replayEndSeq).toBe(10);
    expect(state.replaySeq).toBe(0);
  });

  it('clears replay', () => {
    useCheckpointStore.getState().setReplaying(true);
    useCheckpointStore.getState().setReplaySeq(5);
    useCheckpointStore.getState().clearReplay();

    const state = useCheckpointStore.getState();
    expect(state.isReplaying).toBe(false);
    expect(state.replaySeq).toBe(0);
    expect(state.replayOps).toHaveLength(0);
  });
});
