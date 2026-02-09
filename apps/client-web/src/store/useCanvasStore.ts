import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface CanvasObject {
  id: string;
  type: string;
  zIndex: number;
  data: Record<string, unknown>;
}

interface CanvasState {
  objects: Map<string, CanvasObject>;
  selectedIds: Set<string>;

  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  immer((set) => ({
    objects: new Map(),
    selectedIds: new Set(),

    addObject: (obj) =>
      set((state) => {
        state.objects.set(obj.id, obj);
      }),

    updateObject: (id, patch) =>
      set((state) => {
        const existing = state.objects.get(id);
        if (existing) {
          state.objects.set(id, { ...existing, ...patch });
        }
      }),

    removeObject: (id) =>
      set((state) => {
        state.objects.delete(id);
        state.selectedIds.delete(id);
      }),

    setSelection: (ids) =>
      set((state) => {
        state.selectedIds = new Set(ids);
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedIds = new Set();
      }),
  })),
);
