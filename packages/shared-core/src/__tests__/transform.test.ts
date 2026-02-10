import { describe, expect, it } from 'vitest';
import {
  applyTransform,
  IDENTITY_MATRIX,
  invert,
  multiply,
  rotate,
  translate,
} from '../geometry/transform.js';

describe('AffineMatrix', () => {
  it('identity preserves points', () => {
    const p = { x: 5, y: 10 };
    expect(applyTransform(IDENTITY_MATRIX, p)).toEqual(p);
  });

  it('translate moves points', () => {
    const m = translate(10, 20);
    expect(applyTransform(m, { x: 0, y: 0 })).toEqual({ x: 10, y: 20 });
  });

  it('rotate 90 degrees works correctly', () => {
    const m = rotate(Math.PI / 2);
    const result = applyTransform(m, { x: 1, y: 0 });
    expect(result.x).toBeCloseTo(0, 10);
    expect(result.y).toBeCloseTo(1, 10);
  });

  it('multiply composes transforms', () => {
    const t = translate(5, 0);
    const r = rotate(Math.PI / 2);
    const combined = multiply(t, r); // translate then rotate
    const result = applyTransform(combined, { x: 0, y: 0 });
    // translate (0,0) by (5,0) = (5,0), then rotate is not how multiply works
    // Actually multiply(t, r) means apply r first, then t
    // So: rotate (0,0) = (0,0), then translate = (5,0)
    expect(result.x).toBeCloseTo(5, 10);
    expect(result.y).toBeCloseTo(0, 10);
  });

  it('invert produces identity when multiplied', () => {
    const m = translate(10, 20);
    const inv = invert(m);
    const product = multiply(m, inv);
    expect(product[0]).toBeCloseTo(1);
    expect(product[1]).toBeCloseTo(0);
    expect(product[2]).toBeCloseTo(0);
    expect(product[3]).toBeCloseTo(1);
    expect(product[4]).toBeCloseTo(0);
    expect(product[5]).toBeCloseTo(0);
  });
});
