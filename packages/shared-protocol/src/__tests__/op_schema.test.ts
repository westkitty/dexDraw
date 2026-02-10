import { v4 as uuid } from 'uuid';
import { describe, expect, it } from 'vitest';
import { CreateObjectOp, DurableOp } from '../schemas/op.js';

describe('Op Schemas', () => {
  describe('CreateObjectOp', () => {
    it('validates valid create op', () => {
      const op = {
        type: 'createObject',
        objectId: uuid(),
        objectType: 'stroke',
        data: { points: [] },
      };
      expect(CreateObjectOp.safeParse(op).success).toBe(true);
    });

    it('rejects missing fields', () => {
      const op = {
        type: 'createObject',
        objectId: uuid(),
        // missing objectType
        data: {},
      };
      expect(CreateObjectOp.safeParse(op).success).toBe(false);
    });
  });

  describe('DurableOp Union', () => {
    it('disciminates correctly based on type', () => {
      const undoOp = {
        type: 'undo',
        count: 1,
      };
      const result = DurableOp.safeParse(undoOp);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('undo');
      }
    });

    it('rejects unknown op types', () => {
      const unknownOp = {
        type: 'destroyWorld',
      };
      expect(DurableOp.safeParse(unknownOp).success).toBe(false);
    });
  });
});
