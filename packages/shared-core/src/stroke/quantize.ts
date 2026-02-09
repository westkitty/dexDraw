import type { RawPoint } from './types.js';

/**
 * Quantize point coordinates to a grid for determinism.
 * Timestamps are also quantized to 1ms resolution.
 */
export function quantize(points: RawPoint[], gridSize: number = 0.5): RawPoint[] {
  return points.map((p) => ({
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
    t: Math.round(p.t),
    pressure: p.pressure,
  }));
}
