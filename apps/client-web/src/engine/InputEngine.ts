import type { RawPoint } from '@dexdraw/shared-core';

export type InputEventHandler = {
  onStrokeStart: (point: RawPoint) => void;
  onStrokeMove: (points: RawPoint[]) => void;
  onStrokeEnd: () => void;
};

/**
 * Captures pointer events from a canvas element, coalesces them,
 * and forwards raw points to the handler.
 */
export class InputEngine {
  private handler: InputEventHandler | null = null;
  private isDrawing = false;
  private canvas: HTMLCanvasElement | null = null;

  attach(canvas: HTMLCanvasElement, handler: InputEventHandler): void {
    this.canvas = canvas;
    this.handler = handler;

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerUp);
  }

  detach(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.onPointerDown);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerup', this.onPointerUp);
      this.canvas.removeEventListener('pointercancel', this.onPointerUp);
      this.canvas.removeEventListener('pointerleave', this.onPointerUp);
      this.canvas = null;
    }
    this.handler = null;
  }

  private extractPoint(e: PointerEvent): RawPoint {
    const rect = this.canvas?.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: e.timeStamp,
      pressure: e.pressure > 0 ? e.pressure : undefined,
    };
  }

  private extractCoalesced(e: PointerEvent): RawPoint[] {
    const coalesced = e.getCoalescedEvents?.() ?? [e];
    const rect = this.canvas?.getBoundingClientRect();
    return coalesced.map((ce) => ({
      x: ce.clientX - rect.left,
      y: ce.clientY - rect.top,
      t: ce.timeStamp,
      pressure: ce.pressure > 0 ? ce.pressure : undefined,
    }));
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return; // left button only
    this.isDrawing = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.handler?.onStrokeStart(this.extractPoint(e));
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDrawing) return;
    this.handler?.onStrokeMove(this.extractCoalesced(e));
  };

  private onPointerUp = (_e: PointerEvent): void => {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.handler?.onStrokeEnd();
  };
}
