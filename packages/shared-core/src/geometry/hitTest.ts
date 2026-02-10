import type { Point2D } from '../stroke/types.js';

/** Point-in-polygon test using ray casting algorithm. */
export function pointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/** Check if a point is within a given distance of a line segment. */
export function pointNearSegment(
  point: Point2D,
  a: Point2D,
  b: Point2D,
  threshold: number,
): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    // a and b are the same point
    const d = Math.sqrt((point.x - a.x) ** 2 + (point.y - a.y) ** 2);
    return d <= threshold;
  }

  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  const d = Math.sqrt((point.x - closestX) ** 2 + (point.y - closestY) ** 2);

  return d <= threshold;
}
