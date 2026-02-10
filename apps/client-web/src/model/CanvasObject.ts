import type { AffineMatrix, BBox, Point2D } from '@dexdraw/shared-core';
import { IDENTITY_MATRIX } from '@dexdraw/shared-core';

export interface StrokeData {
  polygonPoints: Point2D[];
  color: string;
  size: number;
}

export interface ShapeData {
  shapeType: 'rect' | 'ellipse' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface TextData {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseCanvasObject {
  id: string;
  type: string;
  zIndex: number;
  transform: AffineMatrix;
  bbox: BBox;
}

export interface StrokeObject extends BaseCanvasObject {
  type: 'stroke';
  data: StrokeData;
}

export interface ShapeObject extends BaseCanvasObject {
  type: 'shape';
  data: ShapeData;
}

export interface TextObject extends BaseCanvasObject {
  type: 'text';
  data: TextData;
}

export type CanvasObjectTyped = StrokeObject | ShapeObject | TextObject;

export function createDefaultTransform(): AffineMatrix {
  return [...IDENTITY_MATRIX] as AffineMatrix;
}
