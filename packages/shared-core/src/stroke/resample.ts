import { distance } from '../math/distance.js';
import { lerp } from '../math/lerp.js';
import type { RawPoint } from './types.js';

/**
 * Resample points to fixed spacing along the path.
 * Ensures deterministic point density regardless of input sampling rate.
 */
export function resample(points: RawPoint[], minDistance: number = 3): RawPoint[] {
  if (points.length < 2) return [...points];

  const result: RawPoint[] = [points[0]];
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const d = distance(prev.x, prev.y, curr.x, curr.y);

    accumulated += d;

    if (accumulated >= minDistance) {
      // Interpolate to place the point at exactly minDistance
      const overshoot = accumulated - minDistance;
      const t = d > 0 ? 1 - overshoot / d : 1;

      const resampled: RawPoint = {
        x: lerp(prev.x, curr.x, t),
        y: lerp(prev.y, curr.y, t),
        t: lerp(prev.t, curr.t, t),
        pressure:
          prev.pressure !== undefined && curr.pressure !== undefined
            ? lerp(prev.pressure, curr.pressure, t)
            : curr.pressure,
      };

      result.push(resampled);
      accumulated = overshoot;

      // Handle case where segment is much longer than minDistance
      while (accumulated >= minDistance) {
        const remaining = accumulated - minDistance;
        const t2 = d > 0 ? 1 - remaining / d : 1;
        result.push({
          x: lerp(prev.x, curr.x, t2),
          y: lerp(prev.y, curr.y, t2),
          t: lerp(prev.t, curr.t, t2),
          pressure:
            prev.pressure !== undefined && curr.pressure !== undefined
              ? lerp(prev.pressure, curr.pressure, t2)
              : curr.pressure,
        });
        accumulated = remaining;
      }
    }
  }

  // Always include the last point
  const last = points[points.length - 1];
  const prevResult = result[result.length - 1];
  if (distance(prevResult.x, prevResult.y, last.x, last.y) > 0.1) {
    result.push(last);
  }

  return result;
}
