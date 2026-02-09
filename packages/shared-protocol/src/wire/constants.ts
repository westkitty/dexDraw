export const PROTOCOL_VERSION = 1;

export const EnvelopeType = {
  Durable: 'durable',
  Ephemeral: 'ephemeral',
  Hybrid: 'hybrid',
} as const;

export type EnvelopeType = (typeof EnvelopeType)[keyof typeof EnvelopeType];

export const DurableOpKind = {
  OpBatch: 'opBatch',
} as const;

export const OpType = {
  CreateObject: 'createObject',
  UpdateObject: 'updateObject',
  DeleteObject: 'deleteObject',
  ConvertInkToText: 'convertInkToText',
  Undo: 'undo',
  Redo: 'redo',
  CheckpointCreate: 'checkpointCreate',
  CheckpointRestore: 'checkpointRestore',
} as const;

export type OpType = (typeof OpType)[keyof typeof OpType];

export const EphemeralKind = {
  Cursor: 'cursor',
  Laser: 'laser',
} as const;

export const HybridKind = {
  TextCRDT: 'textCRDT',
} as const;

export const ObjectType = {
  Stroke: 'stroke',
  Shape: 'shape',
  Text: 'text',
  Comment: 'comment',
  Image: 'image',
} as const;

export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];
