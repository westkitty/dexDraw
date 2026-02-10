import { describe, expect, it } from 'vitest';
import { polygonFromStroke } from '../stroke/polygonFromStroke.js';
import type { NormalizedPoint } from '../stroke/types.js';

describe('polygonFromStroke', () => {
  it('generates a closed polygon from stroke points', () => {
    const stroke: NormalizedPoint[] = [
      { x: 0, y: 0, t: 0, pressure: 0.5 },
      { x: 10, y: 0, t: 10, pressure: 0.5 },
      { x: 10, y: 10, t: 20, pressure: 0.5 },
      { x: 0, y: 10, t: 30, pressure: 0.5 },
    ];
    const polygon = polygonFromStroke(stroke, { size: 2 });

    // Should be an array of points {x, y}
    expect(Array.isArray(polygon)).toBe(true);
    expect(polygon.length).toBeGreaterThan(stroke.length);

    // Check format
    expect(polygon[0]).toHaveProperty('x');
    expect(polygon[0]).toHaveProperty('y');
  });

  it('handles single point stroke', () => {
    const stroke: NormalizedPoint[] = [{ x: 50, y: 50, t: 0, pressure: 0.5 }];
    const polygon = polygonFromStroke(stroke, { size: 5 });
    expect(polygon.length).toBeGreaterThan(0);
  });
});
