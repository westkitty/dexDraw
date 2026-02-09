import type { DurableOp } from '@dexdraw/shared-protocol';
import { create } from 'zustand';

/**
 * Op-based undo/redo.
 * Each action produces a forward op and its inverse.
 * Undo dispatches the inverse op to the server.
 */
interface UndoEntry {
  forwardOps: DurableOp[];
  inverseOps: DurableOp[];
}

interface UndoState {
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  push: (entry: UndoEntry) => void;
  undo: () => DurableOp[] | null;
  redo: () => DurableOp[] | null;
  clear: () => void;
}

export const useUndoStore = create<UndoState>()((set, get) => ({
  undoStack: [],
  redoStack: [],

  push: (entry) =>
    set((state) => ({
      undoStack: [...state.undoStack, entry],
      redoStack: [], // clear redo on new action
    })),

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;

    const entry = undoStack[undoStack.length - 1];
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, entry],
    }));

    return entry.inverseOps;
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;

    const entry = redoStack[redoStack.length - 1];
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, entry],
    }));

    return entry.forwardOps;
  },

  clear: () => set({ undoStack: [], redoStack: [] }),
}));

/**
 * Create inverse ops for common operations.
 */
export function createInverseOp(op: DurableOp, previousState?: Record<string, unknown>): DurableOp | null {
  switch (op.type) {
    case 'createObject':
      return { type: 'deleteObject', objectId: op.objectId };
    case 'deleteObject':
      if (previousState) {
        return {
          type: 'createObject',
          objectId: op.objectId,
          objectType: (previousState.type as string) ?? 'unknown',
          data: previousState,
        };
      }
      return null;
    case 'updateObject':
      if (previousState) {
        return {
          type: 'updateObject',
          objectId: op.objectId,
          patch: previousState,
        };
      }
      return null;
    default:
      return null;
  }
}
