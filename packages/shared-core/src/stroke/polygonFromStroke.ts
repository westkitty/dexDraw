import getStroke from 'perfect-freehand';
import type { NormalizedPoint, Point2D } from './types.js';

/** Fixed perfect-freehand options for deterministic output. */
const STROKE_OPTIONS = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: false, // We provide real or synthesized pressure
  start: { taper: 0, cap: true },
  end: { taper: 0, cap: true },
} as const;

/**
 * Generate polygon outline points from normalized stroke points
 * using perfect-freehand. Output is ready for Canvas polygon fill.
 */
export function polygonFromStroke(
  points: NormalizedPoint[],
  options?: { size?: number },
): Point2D[] {
  if (points.length === 0) return [];

  const inputPoints: [number, number, number][] = points.map((p) => [p.x, p.y, p.pressure]);

  const strokePoints = getStroke(inputPoints, {
    ...STROKE_OPTIONS,
    ...(options?.size !== undefined ? { size: options.size } : {}),
  });

  return strokePoints.map(([x, y]) => ({ x, y }));
}
