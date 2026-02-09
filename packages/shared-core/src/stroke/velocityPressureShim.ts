import { clamp } from '../math/clamp.js';
import { distance } from '../math/distance.js';
import type { RawPoint, NormalizedPoint } from './types.js';

/**
 * Determine if pressure data is meaningful.
 * Returns false if pressure is missing, constant, or always 0.5 (low variance).
 */
function hasMeaningfulPressure(points: RawPoint[]): boolean {
  const pressures = points.map((p) => p.pressure).filter((p): p is number => p !== undefined);

  if (pressures.length < 2) return false;

  const mean = pressures.reduce((a, b) => a + b, 0) / pressures.length;
  const variance =
    pressures.reduce((sum, p) => sum + (p - mean) ** 2, 0) / pressures.length;

  // Variance threshold: if all values are ~0.5 (constant), variance is near 0
  return variance > 0.001;
}

/**
 * Synthesize pressure from velocity.
 * Slow movement → higher pressure (thicker), fast movement → lower pressure (thinner).
 */
export function velocityPressureShim(points: RawPoint[]): NormalizedPoint[] {
  if (points.length === 0) return [];

  // If hardware pressure is meaningful, use it directly
  if (hasMeaningfulPressure(points)) {
    return points.map((p) => ({
      x: p.x,
      y: p.y,
      t: p.t,
      pressure: p.pressure ?? 0.5,
    }));
  }

  // Compute velocities
  const velocities: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dt = points[i].t - points[i - 1].t;
    if (dt <= 0) {
      velocities.push(velocities[velocities.length - 1]);
      continue;
    }
    const d = distance(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
    velocities.push(d / dt);
  }

  // Find max velocity for normalization
  const maxVelocity = Math.max(...velocities, 0.01);

  // Map velocity to pressure: slow => high pressure, fast => low pressure
  return points.map((p, i) => {
    const normalizedVelocity = velocities[i] / maxVelocity;
    // Invert: slow (0) => pressure 0.8, fast (1) => pressure 0.2
    const pressure = clamp(0.8 - normalizedVelocity * 0.6, 0.1, 0.9);

    return {
      x: p.x,
      y: p.y,
      t: p.t,
      pressure,
    };
  });
}
