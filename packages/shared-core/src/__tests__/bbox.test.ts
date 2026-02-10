import { describe, it, expect } from 'vitest';
import { computeBBox, bboxIntersects, bboxUnion } from '../geometry/bbox.js';

describe('bbox', () => {
  it('computes bbox from points', () => {
    const points = [
      { x: 10, y: 20 },
      { x: 50, y: 60 },
      { x: 30, y: 10 },
    ];
    const bbox = computeBBox(points);
    expect(bbox).toEqual({ x: 10, y: 10, width: 40, height: 50 });
  });

  it('returns zero bbox for single point', () => {
    const bbox = computeBBox([{ x: 5, y: 5 }]);
    expect(bbox.width).toBe(0);
    expect(bbox.height).toBe(0);
  });

  it('returns zero bbox for empty array', () => {
    const bbox = computeBBox([]);
    expect(bbox.width).toBe(0);
  });

  it('detects intersecting bboxes', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 50, y: 50, width: 100, height: 100 };
    expect(bboxIntersects(a, b)).toBe(true);
  });

  it('detects non-intersecting bboxes', () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 100, y: 100, width: 50, height: 50 };
    expect(bboxIntersects(a, b)).toBe(false);
  });

  it('computes union of two bboxes', () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 100, y: 100, width: 50, height: 50 };
    const union = bboxUnion(a, b);
    expect(union).toEqual({ x: 0, y: 0, width: 150, height: 150 });
  });
});
