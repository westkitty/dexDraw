import { describe, expect, it } from 'vitest';
import {
  CheckpointCreateOp,
  CheckpointRestoreOp,
  ConvertInkToTextOp,
  CreateObjectOp,
  DeleteObjectOp,
  DurableOp,
  UpdateObjectOp,
} from '../schemas/op.js';

describe('DurableOp schema validation', () => {
  it('validates createObject op', () => {
    const result = CreateObjectOp.safeParse({
      type: 'createObject',
      objectId: '00000000-0000-0000-0000-000000000001',
      objectType: 'stroke',
      data: { points: [] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects createObject without uuid', () => {
    const result = CreateObjectOp.safeParse({
      type: 'createObject',
      objectId: 'not-a-uuid',
      objectType: 'stroke',
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it('validates updateObject op', () => {
    const result = UpdateObjectOp.safeParse({
      type: 'updateObject',
      objectId: '00000000-0000-0000-0000-000000000001',
      patch: { color: 'red' },
    });
    expect(result.success).toBe(true);
  });

  it('validates deleteObject op', () => {
    const result = DeleteObjectOp.safeParse({
      type: 'deleteObject',
      objectId: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('validates checkpointCreate op', () => {
    const result = CheckpointCreateOp.safeParse({
      type: 'checkpointCreate',
      checkpointId: '00000000-0000-0000-0000-000000000001',
      name: 'Mid-meeting',
    });
    expect(result.success).toBe(true);
  });

  it('validates checkpointRestore op', () => {
    const result = CheckpointRestoreOp.safeParse({
      type: 'checkpointRestore',
      checkpointId: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('discriminated union selects correct type', () => {
    const createResult = DurableOp.safeParse({
      type: 'createObject',
      objectId: '00000000-0000-0000-0000-000000000001',
      objectType: 'stroke',
      data: {},
    });
    expect(createResult.success).toBe(true);

    const unknownResult = DurableOp.safeParse({
      type: 'unknownOp',
      data: {},
    });
    expect(unknownResult.success).toBe(false);
  });

  it('validates convertInkToText with all required fields', () => {
    const result = ConvertInkToTextOp.safeParse({
      type: 'convertInkToText',
      inkObjectIds: ['00000000-0000-0000-0000-000000000001'],
      chosenText: 'hello',
      newTextObjectId: '00000000-0000-0000-0000-000000000002',
      bbox: { x: 0, y: 0, width: 100, height: 50 },
      style: {},
      keepInk: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects convertInkToText with negative bbox', () => {
    const result = ConvertInkToTextOp.safeParse({
      type: 'convertInkToText',
      inkObjectIds: ['00000000-0000-0000-0000-000000000001'],
      chosenText: 'hello',
      newTextObjectId: '00000000-0000-0000-0000-000000000002',
      bbox: { x: 0, y: 0, width: -10, height: 50 },
      style: {},
      keepInk: false,
    });
    expect(result.success).toBe(false);
  });
});
