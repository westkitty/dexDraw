import type { Point2D } from '@dexdraw/shared-core';
import { normalizeStroke } from '@dexdraw/shared-core';
import type { InkEngine } from '../engine/InkEngine';
import { useAppStore } from '../store/useAppStore';
import { type CanvasObject, useCanvasStore } from '../store/useCanvasStore';

/**
 * Imperative canvas renderer using requestAnimationFrame.
 * Reads from Zustand store directly (not React re-renders).
 */
export class CanvasRenderer {
  private bgCanvas: HTMLCanvasElement | null = null;
  private activeCanvas: HTMLCanvasElement | null = null;
  private bgCtx: CanvasRenderingContext2D | null = null;
  private activeCtx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private inkEngine: InkEngine | null = null;
  private needsRedraw = true;

  attach(bgCanvas: HTMLCanvasElement, activeCanvas: HTMLCanvasElement, inkEngine: InkEngine): void {
    this.bgCanvas = bgCanvas;
    this.activeCanvas = activeCanvas;
    this.bgCtx = bgCanvas.getContext('2d');
    this.activeCtx = activeCanvas.getContext('2d');
    this.inkEngine = inkEngine;

    // Subscribe to store changes
    useCanvasStore.subscribe(() => {
      this.needsRedraw = true;
    });

    this.startLoop();
  }

  detach(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private startLoop(): void {
    const loop = () => {
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private render(): void {
    if (!this.bgCtx || !this.activeCtx || !this.bgCanvas || !this.activeCanvas) return;

    // Render committed objects (only when dirty)
    if (this.needsRedraw) {
      this.renderCommitted();
      this.needsRedraw = false;
    }

    // Always render active stroke layer (lightweight)
    this.renderActiveStroke();
  }

  private renderCommitted(): void {
    if (!this.bgCtx || !this.bgCanvas) return;
    const ctx = this.bgCtx;
    const canvas = this.bgCanvas;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid dots
    ctx.fillStyle = '#2a2a3e';
    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw all committed objects
    const objects = useCanvasStore.getState().objects;
    const sorted = Array.from(objects.values()).sort((a, b) => a.zIndex - b.zIndex);

    for (const obj of sorted) {
      if (obj.type === 'stroke') {
        this.renderStroke(ctx, obj);
      }
      // Other object types will be added in P11+
    }
  }

  private renderStroke(ctx: CanvasRenderingContext2D, obj: CanvasObject): void {
    const data = obj.data as { polygonPoints?: Point2D[]; color?: string };
    const points = data.polygonPoints;
    if (!points || points.length < 3) return;

    ctx.fillStyle = data.color ?? '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private renderActiveStroke(): void {
    if (!this.activeCtx || !this.activeCanvas) return;
    const ctx = this.activeCtx;
    const canvas = this.activeCanvas;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    if (!this.inkEngine) return;
    const rawPoints = this.inkEngine.getActivePoints();
    if (rawPoints.length < 2) return;

    const { strokeColor, strokeWidth } = useAppStore.getState();

    // Run incremental normalization for live preview
    const polygon = normalizeStroke(rawPoints, { size: strokeWidth });
    if (polygon.length < 3) return;

    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  /** Force a full redraw. */
  invalidate(): void {
    this.needsRedraw = true;
  }
}
