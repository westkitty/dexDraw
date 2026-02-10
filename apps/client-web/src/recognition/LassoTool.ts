import { computeBBox, type Point2D, pointInPolygon } from '@dexdraw/shared-core';
import { useCanvasStore } from '../store/useCanvasStore';

/**
 * Lasso tool: freeform polygon selection region.
 * Collects points during drag, then finds objects within the lasso polygon.
 */
export class LassoTool {
  private lassoPoints: Point2D[] = [];
  private isActive = false;

  start(point: Point2D): void {
    this.lassoPoints = [point];
    this.isActive = true;
  }

  addPoint(point: Point2D): void {
    if (!this.isActive) return;
    this.lassoPoints.push(point);
  }

  /** Finish lasso and return selected object IDs. */
  finish(): string[] {
    this.isActive = false;
    if (this.lassoPoints.length < 3) {
      this.lassoPoints = [];
      return [];
    }

    const lassoPoly = this.lassoPoints;
    const objects = useCanvasStore.getState().objects;
    const selectedIds: string[] = [];

    for (const obj of objects.values()) {
      if (obj.type === 'stroke') {
        const data = obj.data as { polygonPoints?: Point2D[] };
        if (data.polygonPoints) {
          // Check if the stroke's centroid is inside the lasso
          const bbox = computeBBox(data.polygonPoints);
          const centroid: Point2D = {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2,
          };
          if (pointInPolygon(centroid, lassoPoly)) {
            selectedIds.push(obj.id);
          }
        }
      }
    }

    this.lassoPoints = [];
    return selectedIds;
  }

  /** Get current lasso points for rendering. */
  getPoints(): Point2D[] {
    return this.lassoPoints;
  }

  get active(): boolean {
    return this.isActive;
  }
}
