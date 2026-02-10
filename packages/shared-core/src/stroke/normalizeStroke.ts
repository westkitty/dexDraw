import { polygonFromStroke } from './polygonFromStroke.js';
import { quantize } from './quantize.js';
import { resample } from './resample.js';
import type { Point2D, RawPoint } from './types.js';
import { velocityPressureShim } from './velocityPressureShim.js';

export interface NormalizeStrokeOptions {
  /** Minimum distance between resampled points. Default: 3 */
  minDistance?: number;
  /** Quantization grid size. Default: 0.5 */
  gridSize?: number;
  /** Stroke size for perfect-freehand. Default: 8 */
  size?: number;
}

/**
 * Full normalization pipeline:
 * raw input -> resample -> quantize -> velocity pressure shim -> perfect-freehand -> polygon
 *
 * Produces deterministic output: same input always yields same polygon points.
 */
export function normalizeStroke(points: RawPoint[], options?: NormalizeStrokeOptions): Point2D[] {
  if (points.length < 2) return [];

  const resampled = resample(points, options?.minDistance ?? 3);
  const quantized = quantize(resampled, options?.gridSize ?? 0.5);
  const withPressure = velocityPressureShim(quantized);
  const polygon = polygonFromStroke(withPressure, { size: options?.size ?? 8 });

  return polygon;
}
