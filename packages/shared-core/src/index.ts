// Stroke

export type { BBox } from './geometry/bbox.js';
// Geometry
export { bboxIntersects, bboxUnion, computeBBox } from './geometry/bbox.js';
export { pointInPolygon, pointNearSegment } from './geometry/hitTest.js';
export type { AffineMatrix } from './geometry/transform.js';
export {
  applyTransform,
  IDENTITY_MATRIX,
  invert,
  multiply,
  rotate,
  scale,
  translate,
} from './geometry/transform.js';
// Math
export { clamp } from './math/clamp.js';
export { distance } from './math/distance.js';
export { lerp } from './math/lerp.js';
export type { NormalizeStrokeOptions } from './stroke/normalizeStroke.js';
export { normalizeStroke } from './stroke/normalizeStroke.js';
export { polygonFromStroke } from './stroke/polygonFromStroke.js';
export { quantize } from './stroke/quantize.js';
export { resample } from './stroke/resample.js';
export type { NormalizedPoint, Point2D, RawPoint } from './stroke/types.js';
export { velocityPressureShim } from './stroke/velocityPressureShim.js';
