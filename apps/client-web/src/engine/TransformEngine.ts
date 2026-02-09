import type { Point2D } from '@dexdraw/shared-core';
import { useCanvasStore } from '../store/useCanvasStore';

export type TransformAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'resize'; scaleX: number; scaleY: number; originX: number; originY: number }
  | { type: 'rotate'; angle: number; originX: number; originY: number };

/**
 * Apply a transform to all selected objects.
 * Returns the patches for each affected object (for op generation).
 */
export function applyTransformToSelection(
  action: TransformAction,
): Array<{ objectId: string; patch: Record<string, unknown> }> {
  const { objects, selectedIds, updateObject } = useCanvasStore.getState();
  const patches: Array<{ objectId: string; patch: Record<string, unknown> }> = [];

  for (const id of selectedIds) {
    const obj = objects.get(id);
    if (!obj) continue;

    const data = obj.data as Record<string, unknown>;
    let patch: Record<string, unknown> = {};

    if (action.type === 'move') {
      if (obj.type === 'stroke') {
        // Move polygon points
        const points = (data.polygonPoints as Point2D[]) ?? [];
        const moved = points.map((p) => ({ x: p.x + action.dx, y: p.y + action.dy }));
        patch = { polygonPoints: moved };
      } else {
        // Move x,y
        const x = ((data.x as number) ?? 0) + action.dx;
        const y = ((data.y as number) ?? 0) + action.dy;
        patch = { x, y };
      }
    }

    if (Object.keys(patch).length > 0) {
      updateObject(id, { data: { ...data, ...patch } });
      patches.push({ objectId: id, patch });
    }
  }

  return patches;
}
