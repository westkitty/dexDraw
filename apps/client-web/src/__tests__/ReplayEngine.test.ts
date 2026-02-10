import { describe, expect, it } from 'vitest';
import { ReplayEngine } from '../collab/ReplayEngine';
import type { ReplayOp } from '../store/useCheckpointStore';

describe('ReplayEngine', () => {
  const makeOps = (): ReplayOp[] => [
    {
      serverSeq: 1,
      clientId: 'c1',
      clientSeq: 0,
      opType: 'createObject',
      payload: { objectId: 'obj-1', objectType: 'stroke', type: 'createObject' },
    },
    {
      serverSeq: 2,
      clientId: 'c1',
      clientSeq: 1,
      opType: 'createObject',
      payload: { objectId: 'obj-2', objectType: 'shape', type: 'createObject' },
    },
    {
      serverSeq: 3,
      clientId: 'c1',
      clientSeq: 2,
      opType: 'updateObject',
      payload: { objectId: 'obj-1', patch: { color: 'red' }, type: 'updateObject' },
    },
    {
      serverSeq: 4,
      clientId: 'c1',
      clientSeq: 3,
      opType: 'deleteObject',
      payload: { objectId: 'obj-2', type: 'deleteObject' },
    },
    {
      serverSeq: 5,
      clientId: 'c1',
      clientSeq: 4,
      opType: 'checkpointCreate',
      payload: { checkpointId: 'cp-1', name: 'test', type: 'checkpointCreate' },
    },
  ];

  it('starts with empty state at seq 0', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    const state = engine.getStateAt(0);
    expect(state.size).toBe(0);
  });

  it('creates objects at their serverSeq', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    const state1 = engine.getStateAt(1);
    expect(state1.size).toBe(1);
    expect(state1.has('obj-1')).toBe(true);

    const state2 = engine.getStateAt(2);
    expect(state2.size).toBe(2);
    expect(state2.has('obj-2')).toBe(true);
  });

  it('applies updates correctly', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    const state3 = engine.getStateAt(3);
    expect(state3.size).toBe(2);
    const obj1 = state3.get('obj-1');
    expect(obj1).toBeDefined();
    expect(obj1?.color).toBe('red');
  });

  it('deletes objects correctly', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    const state4 = engine.getStateAt(4);
    expect(state4.size).toBe(1);
    expect(state4.has('obj-2')).toBe(false);
  });

  it('handles checkpoint ops as no-ops for state', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    const state5 = engine.getStateAt(5);
    // Checkpoint doesn't change object state
    expect(state5.size).toBe(1);
    expect(state5.has('obj-1')).toBe(true);
  });

  it('starts from a snapshot base', () => {
    const snapshot = {
      'existing-1': { objectType: 'stroke', color: 'blue' },
    };
    const ops: ReplayOp[] = [
      {
        serverSeq: 11,
        clientId: 'c1',
        clientSeq: 0,
        opType: 'createObject',
        payload: { objectId: 'obj-new', objectType: 'shape', type: 'createObject' },
      },
    ];
    const engine = new ReplayEngine(snapshot, 10, ops);

    const stateBase = engine.getStateAt(10);
    expect(stateBase.size).toBe(1);
    expect(stateBase.has('existing-1')).toBe(true);

    const stateAfter = engine.getStateAt(11);
    expect(stateAfter.size).toBe(2);
  });

  it('reports firstSeq and lastSeq', () => {
    const engine = new ReplayEngine(null, 0, makeOps());
    expect(engine.firstSeq).toBe(1);
    expect(engine.lastSeq).toBe(5);
    expect(engine.totalOps).toBe(5);
  });

  it('handles convertInkToText ops', () => {
    const ops: ReplayOp[] = [
      {
        serverSeq: 1,
        clientId: 'c1',
        clientSeq: 0,
        opType: 'createObject',
        payload: { objectId: 'ink-1', objectType: 'stroke', type: 'createObject' },
      },
      {
        serverSeq: 2,
        clientId: 'c1',
        clientSeq: 1,
        opType: 'convertInkToText',
        payload: {
          type: 'convertInkToText',
          inkObjectIds: ['ink-1'],
          newTextObjectId: 'text-1',
          chosenText: 'hello',
          keepInk: false,
        },
      },
    ];

    const engine = new ReplayEngine(null, 0, ops);
    const state = engine.getStateAt(2);
    expect(state.size).toBe(1);
    expect(state.has('ink-1')).toBe(false);
    expect(state.has('text-1')).toBe(true);
  });
});
