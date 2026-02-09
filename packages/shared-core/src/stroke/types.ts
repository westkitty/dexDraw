/** Raw pointer sample from input. */
export interface RawPoint {
  x: number;
  y: number;
  t: number;
  pressure?: number;
}

/** Point with guaranteed pressure value (after shim). */
export interface NormalizedPoint {
  x: number;
  y: number;
  t: number;
  pressure: number;
}

/** 2D point for polygon output. */
export interface Point2D {
  x: number;
  y: number;
}
