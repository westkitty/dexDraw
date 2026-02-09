import { describe, it, expect } from 'vitest';
import { pointInPolygon, pointNearSegment } from '../geometry/hitTest.js';

describe('pointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ];

  it('detects point inside', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('detects point outside', () => {
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });
});

describe('pointNearSegment', () => {
  it('detects point near segment', () => {
    expect(pointNearSegment({ x: 5, y: 1 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 2)).toBe(true);
  });

  it('detects point far from segment', () => {
    expect(pointNearSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 2)).toBe(false);
  });
});
