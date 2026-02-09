import type { Point2D } from '../stroke/types.js';

/**
 * 2D affine transform matrix [a, b, c, d, tx, ty]
 * Represents: | a  c  tx |
 *             | b  d  ty |
 *             | 0  0  1  |
 */
export type AffineMatrix = [number, number, number, number, number, number];

export const IDENTITY_MATRIX: AffineMatrix = [1, 0, 0, 1, 0, 0];

export function translate(tx: number, ty: number): AffineMatrix {
  return [1, 0, 0, 1, tx, ty];
}

export function scale(sx: number, sy: number): AffineMatrix {
  return [sx, 0, 0, sy, 0, 0];
}

export function rotate(radians: number): AffineMatrix {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [cos, sin, -sin, cos, 0, 0];
}

/** Multiply two affine matrices: a * b. */
export function multiply(a: AffineMatrix, b: AffineMatrix): AffineMatrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/** Apply affine transform to a point. */
export function applyTransform(m: AffineMatrix, p: Point2D): Point2D {
  return {
    x: m[0] * p.x + m[2] * p.y + m[4],
    y: m[1] * p.x + m[3] * p.y + m[5],
  };
}

/** Compute the inverse of an affine matrix. */
export function invert(m: AffineMatrix): AffineMatrix {
  const det = m[0] * m[3] - m[2] * m[1];
  if (Math.abs(det) < 1e-10) {
    return IDENTITY_MATRIX;
  }
  const invDet = 1 / det;
  return [
    m[3] * invDet,
    -m[1] * invDet,
    -m[2] * invDet,
    m[0] * invDet,
    (m[2] * m[5] - m[3] * m[4]) * invDet,
    (m[1] * m[4] - m[0] * m[5]) * invDet,
  ];
}
