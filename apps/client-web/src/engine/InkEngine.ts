import { v4 as uuid } from 'uuid';
import { normalizeStroke, type RawPoint, type Point2D } from '@dexdraw/shared-core';
import type { InputEventHandler } from './InputEngine';
import { useCanvasStore } from '../store/useCanvasStore';
import { useAppStore } from '../store/useAppStore';

export type StrokeCommitHandler = (objectId: string, polygonPoints: Point2D[], color: string, size: number) => void;

/**
 * Manages the active stroke during drawing.
 * Collects raw points, incrementally renders, and commits on end.
 */
export class InkEngine implements InputEventHandler {
  private rawPoints: RawPoint[] = [];
  private activeObjectId: string | null = null;
  private onCommit: StrokeCommitHandler | null = null;

  /** Set the callback for when a stroke is finalized. */
  setCommitHandler(handler: StrokeCommitHandler): void {
    this.onCommit = handler;
  }

  onStrokeStart(point: RawPoint): void {
    this.rawPoints = [point];
    this.activeObjectId = uuid();
  }

  onStrokeMove(points: RawPoint[]): void {
    this.rawPoints.push(...points);
    // Incremental rendering is done by CanvasRenderer reading activeStroke
  }

  onStrokeEnd(): void {
    if (this.rawPoints.length < 2 || !this.activeObjectId) {
      this.rawPoints = [];
      this.activeObjectId = null;
      return;
    }

    const { strokeColor, strokeWidth } = useAppStore.getState();

    // Run normalization pipeline
    const polygon = normalizeStroke(this.rawPoints, { size: strokeWidth });

    if (polygon.length === 0) {
      this.rawPoints = [];
      this.activeObjectId = null;
      return;
    }

    const objectId = this.activeObjectId;

    // Add to local canvas store (optimistic)
    useCanvasStore.getState().addObject({
      id: objectId,
      type: 'stroke',
      zIndex: useCanvasStore.getState().objects.size,
      data: {
        polygonPoints: polygon,
        color: strokeColor,
        size: strokeWidth,
        rawPointCount: this.rawPoints.length,
      },
    });

    // Notify commit handler (sends op to outbox)
    this.onCommit?.(objectId, polygon, strokeColor, strokeWidth);

    // Reset
    this.rawPoints = [];
    this.activeObjectId = null;
  }

  /** Get the current in-progress raw points (for live rendering). */
  getActivePoints(): RawPoint[] {
    return this.rawPoints;
  }

  /** Get active object ID if currently drawing. */
  getActiveObjectId(): string | null {
    return this.activeObjectId;
  }
}
