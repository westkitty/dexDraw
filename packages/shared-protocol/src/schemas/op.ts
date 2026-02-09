import { z } from 'zod';
import { StyleSchema } from './style.js';

const BboxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
});

export const CreateObjectOp = z.object({
  type: z.literal('createObject'),
  objectId: z.string().uuid(),
  objectType: z.string(),
  data: z.record(z.unknown()),
});

export const UpdateObjectOp = z.object({
  type: z.literal('updateObject'),
  objectId: z.string().uuid(),
  patch: z.record(z.unknown()),
});

export const DeleteObjectOp = z.object({
  type: z.literal('deleteObject'),
  objectId: z.string().uuid(),
});

export const ConvertInkToTextOp = z.object({
  type: z.literal('convertInkToText'),
  inkObjectIds: z.array(z.string().uuid()),
  chosenText: z.string(),
  newTextObjectId: z.string().uuid(),
  bbox: BboxSchema,
  style: StyleSchema,
  keepInk: z.boolean(),
});

export const UndoOp = z.object({
  type: z.literal('undo'),
  count: z.number().int().positive().optional(),
});

export const RedoOp = z.object({
  type: z.literal('redo'),
  count: z.number().int().positive().optional(),
});

export const CheckpointCreateOp = z.object({
  type: z.literal('checkpointCreate'),
  checkpointId: z.string().uuid(),
  name: z.string().optional(),
});

export const CheckpointRestoreOp = z.object({
  type: z.literal('checkpointRestore'),
  checkpointId: z.string().uuid(),
});

export const DurableOp = z.discriminatedUnion('type', [
  CreateObjectOp,
  UpdateObjectOp,
  DeleteObjectOp,
  ConvertInkToTextOp,
  UndoOp,
  RedoOp,
  CheckpointCreateOp,
  CheckpointRestoreOp,
]);

export type DurableOp = z.infer<typeof DurableOp>;
export type CreateObjectOp = z.infer<typeof CreateObjectOp>;
export type UpdateObjectOp = z.infer<typeof UpdateObjectOp>;
export type DeleteObjectOp = z.infer<typeof DeleteObjectOp>;
export type ConvertInkToTextOp = z.infer<typeof ConvertInkToTextOp>;
