import {
  type BBox,
  bboxIntersects,
  computeBBox,
  type Point2D,
  pointInPolygon,
} from '@dexdraw/shared-core';
import { type CanvasObject, useCanvasStore } from '../store/useCanvasStore';

/**
 * Hit test a point against all canvas objects.
 * Returns the topmost (highest zIndex) object that contains the point.
 */
export function hitTest(point: Point2D): CanvasObject | null {
  const objects = useCanvasStore.getState().objects;
  const sorted = Array.from(objects.values()).sort((a, b) => b.zIndex - a.zIndex);

  for (const obj of sorted) {
    if (obj.type === 'stroke') {
      const data = obj.data as { polygonPoints?: Point2D[] };
      if (data.polygonPoints && pointInPolygon(point, data.polygonPoints)) {
        return obj;
      }
    } else {
      // For shapes/text, use bounding box
      const data = obj.data as { x?: number; y?: number; width?: number; height?: number };
      if (
        data.x !== undefined &&
        data.y !== undefined &&
        data.width !== undefined &&
        data.height !== undefined
      ) {
        const bbox: BBox = { x: data.x, y: data.y, width: data.width, height: data.height };
        if (
          point.x >= bbox.x &&
          point.x <= bbox.x + bbox.width &&
          point.y >= bbox.y &&
          point.y <= bbox.y + bbox.height
        ) {
          return obj;
        }
      }
    }
  }
  return null;
}

/**
 * Marquee/rectangle selection: find all objects whose bounding boxes
 * intersect the given selection rectangle.
 */
export function marqueeSelect(selectionRect: BBox): string[] {
  const objects = useCanvasStore.getState().objects;
  const ids: string[] = [];

  for (const obj of objects.values()) {
    let objBBox: BBox | null = null;

    if (obj.type === 'stroke') {
      const data = obj.data as { polygonPoints?: Point2D[] };
      if (data.polygonPoints) {
        objBBox = computeBBox(data.polygonPoints);
      }
    } else {
      const data = obj.data as { x?: number; y?: number; width?: number; height?: number };
      if (data.x !== undefined) {
        objBBox = { x: data.x!, y: data.y!, width: data.width!, height: data.height! };
      }
    }

    if (objBBox && bboxIntersects(selectionRect, objBBox)) {
      ids.push(obj.id);
    }
  }

  return ids;
}
