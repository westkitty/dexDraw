import { describe, it, expect } from 'vitest';
import { velocityPressureShim } from '../stroke/velocityPressureShim.js';
import type { RawPoint } from '../stroke/types.js';

describe('velocityPressureShim', () => {
  it('returns empty for empty input', () => {
    expect(velocityPressureShim([])).toEqual([]);
  });

  it('passes through meaningful hardware pressure', () => {
    const points: RawPoint[] = [
      { x: 0, y: 0, t: 0, pressure: 0.1 },
      { x: 10, y: 0, t: 16, pressure: 0.9 },
      { x: 20, y: 0, t: 32, pressure: 0.3 },
      { x: 30, y: 0, t: 48, pressure: 0.7 },
    ];
    const result = velocityPressureShim(points);
    expect(result[0].pressure).toBe(0.1);
    expect(result[1].pressure).toBe(0.9);
  });

  it('synthesizes pressure from velocity when pressure is constant 0.5', () => {
    const points: RawPoint[] = [
      { x: 0, y: 0, t: 0, pressure: 0.5 },
      { x: 10, y: 0, t: 16, pressure: 0.5 },
      { x: 20, y: 0, t: 32, pressure: 0.5 },
      { x: 30, y: 0, t: 48, pressure: 0.5 },
    ];
    const result = velocityPressureShim(points);
    // Should NOT just return 0.5 for all — should vary
    const pressures = result.map((p) => p.pressure);
    const allSame = pressures.every((p) => p === pressures[0]);
    // First point has velocity 0 (highest pressure), others have constant velocity
    expect(allSame).toBe(false);
  });

  it('synthesizes pressure from velocity when pressure is missing', () => {
    const points: RawPoint[] = [
      { x: 0, y: 0, t: 0 },
      { x: 5, y: 0, t: 16 },   // slow
      { x: 10, y: 0, t: 32 },  // slow
      { x: 50, y: 0, t: 48 },  // fast
      { x: 100, y: 0, t: 64 }, // fast
    ];
    const result = velocityPressureShim(points);

    // Slow points should have higher pressure than fast points
    const slowPressure = result[1].pressure;
    const fastPressure = result[4].pressure;
    expect(slowPressure).toBeGreaterThan(fastPressure);
  });

  it('all output pressures are in valid range [0.1, 0.9]', () => {
    const points: RawPoint[] = Array.from({ length: 20 }, (_, i) => ({
      x: i * Math.random() * 10,
      y: i * Math.random() * 10,
      t: i * 16,
    }));
    const result = velocityPressureShim(points);
    for (const p of result) {
      expect(p.pressure).toBeGreaterThanOrEqual(0.1);
      expect(p.pressure).toBeLessThanOrEqual(0.9);
    }
  });
});
