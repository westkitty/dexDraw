import type { ReplayOp } from '../store/useCheckpointStore';

/**
 * ReplayEngine: reconstructs board state at any serverSeq by applying ops
 * on top of a base snapshot. Used for time-travel scrubber (read-only).
 */
export class ReplayEngine {
  private baseObjects: Map<string, Record<string, unknown>>;
  private ops: ReplayOp[];
  private baseSeq: number;

  constructor(
    snapshot: Record<string, Record<string, unknown>> | null,
    snapshotSeq: number,
    ops: ReplayOp[],
  ) {
    this.baseObjects = new Map();
    if (snapshot) {
      for (const [id, obj] of Object.entries(snapshot)) {
        this.baseObjects.set(id, { ...obj });
      }
    }
    this.ops = ops;
    this.baseSeq = snapshotSeq;
  }

  /** Get the board state at a given serverSeq. */
  getStateAt(targetSeq: number): Map<string, Record<string, unknown>> {
    const objects = new Map<string, Record<string, unknown>>();

    // Start with base snapshot
    for (const [id, obj] of this.baseObjects) {
      objects.set(id, { ...obj });
    }

    // Apply ops up to targetSeq
    for (const op of this.ops) {
      if (op.serverSeq > targetSeq) break;
      if (op.serverSeq <= this.baseSeq) continue;

      this.applyOp(objects, op);
    }

    return objects;
  }

  private applyOp(objects: Map<string, Record<string, unknown>>, op: ReplayOp): void {
    const payload = op.payload as Record<string, unknown>;
    switch (op.opType) {
      case 'createObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          objects.set(objectId, { ...payload });
        }
        break;
      }
      case 'updateObject': {
        const objectId = payload.objectId as string;
        const existing = objects.get(objectId);
        if (existing && payload.patch) {
          objects.set(objectId, { ...existing, ...(payload.patch as Record<string, unknown>) });
        }
        break;
      }
      case 'deleteObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          objects.delete(objectId);
        }
        break;
      }
      case 'convertInkToText': {
        const inkIds = payload.inkObjectIds as string[];
        if (inkIds) {
          for (const id of inkIds) {
            if (!payload.keepInk) objects.delete(id);
          }
        }
        const newTextId = payload.newTextObjectId as string;
        if (newTextId) {
          objects.set(newTextId, { ...payload, type: 'text' });
        }
        break;
      }
      // checkpointCreate/checkpointRestore are meta-ops that don't change objects
    }
  }

  get totalOps(): number {
    return this.ops.length;
  }

  get firstSeq(): number {
    return this.ops.length > 0 ? this.ops[0].serverSeq : this.baseSeq;
  }

  get lastSeq(): number {
    return this.ops.length > 0 ? this.ops[this.ops.length - 1].serverSeq : this.baseSeq;
  }
}
