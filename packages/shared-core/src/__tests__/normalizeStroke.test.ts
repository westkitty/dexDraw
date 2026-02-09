import { describe, it, expect } from 'vitest';
import { normalizeStroke } from '../stroke/normalizeStroke.js';
import type { RawPoint } from '../stroke/types.js';

function makeLine(length: number, speed: number = 1): RawPoint[] {
  const points: RawPoint[] = [];
  for (let i = 0; i < length; i++) {
    points.push({
      x: i * speed * 3,
      y: 50,
      t: i * 16, // ~60fps
    });
  }
  return points;
}

describe('normalizeStroke', () => {
  it('returns empty for fewer than 2 points', () => {
    expect(normalizeStroke([])).toEqual([]);
    expect(normalizeStroke([{ x: 0, y: 0, t: 0 }])).toEqual([]);
  });

  it('produces polygon output for a simple line', () => {
    const points = makeLine(20);
    const polygon = normalizeStroke(points);

    expect(polygon.length).toBeGreaterThan(0);
    for (const p of polygon) {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it('is deterministic: same input produces same output', () => {
    const points = makeLine(30);
    const result1 = normalizeStroke(points);
    const result2 = normalizeStroke(points);

    expect(result1).toEqual(result2);
  });

  it('is deterministic across multiple runs', () => {
    const points: RawPoint[] = [
      { x: 10, y: 20, t: 0 },
      { x: 15, y: 25, t: 16 },
      { x: 30, y: 40, t: 32 },
      { x: 50, y: 60, t: 48 },
      { x: 80, y: 70, t: 64 },
      { x: 120, y: 65, t: 80 },
    ];

    const results = Array.from({ length: 5 }, () => normalizeStroke(points));
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(results[0]);
    }
  });
});
