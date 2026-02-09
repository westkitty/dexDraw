import { create } from 'zustand';

interface LaserPoint {
  x: number;
  y: number;
  ts: number;
}

interface LaserState {
  trails: Map<string, LaserPoint[]>; // clientId -> trail points
  addPoint: (clientId: string, x: number, y: number) => void;
  clearClient: (clientId: string) => void;
  cleanup: () => void;
}

const TRAIL_DURATION_MS = 500;

export const useLaserStore = create<LaserState>()((set) => ({
  trails: new Map(),

  addPoint: (clientId, x, y) =>
    set((state) => {
      const trails = new Map(state.trails);
      const trail = trails.get(clientId) ?? [];
      trail.push({ x, y, ts: Date.now() });
      trails.set(clientId, trail);
      return { trails };
    }),

  clearClient: (clientId) =>
    set((state) => {
      const trails = new Map(state.trails);
      trails.delete(clientId);
      return { trails };
    }),

  cleanup: () =>
    set((state) => {
      const now = Date.now();
      const trails = new Map(state.trails);
      for (const [clientId, trail] of trails) {
        const filtered = trail.filter((p) => now - p.ts < TRAIL_DURATION_MS);
        if (filtered.length === 0) {
          trails.delete(clientId);
        } else {
          trails.set(clientId, filtered);
        }
      }
      return { trails };
    }),
}));
