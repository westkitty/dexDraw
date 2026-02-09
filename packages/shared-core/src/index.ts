// Stroke
export { normalizeStroke } from './stroke/normalizeStroke.js';
export type { NormalizeStrokeOptions } from './stroke/normalizeStroke.js';
export { resample } from './stroke/resample.js';
export { quantize } from './stroke/quantize.js';
export { velocityPressureShim } from './stroke/velocityPressureShim.js';
export { polygonFromStroke } from './stroke/polygonFromStroke.js';
export type { RawPoint, NormalizedPoint, Point2D } from './stroke/types.js';

// Geometry
export { computeBBox, bboxIntersects, bboxUnion } from './geometry/bbox.js';
export type { BBox } from './geometry/bbox.js';
export { pointInPolygon, pointNearSegment } from './geometry/hitTest.js';
export {
  translate,
  scale,
  rotate,
  multiply,
  applyTransform,
  invert,
  IDENTITY_MATRIX,
} from './geometry/transform.js';
export type { AffineMatrix } from './geometry/transform.js';

// Math
export { clamp } from './math/clamp.js';
export { lerp } from './math/lerp.js';
export { distance } from './math/distance.js';
