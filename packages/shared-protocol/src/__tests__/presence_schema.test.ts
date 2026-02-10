import { describe, expect, it } from 'vitest';
import { CursorPayload, EphemeralPayload } from '../schemas/presence.js';

describe('Presence Schemas', () => {
  describe('CursorPayload', () => {
    it('validates a cursor payload', () => {
      const payload = {
        kind: 'cursor',
        x: 100,
        y: 200,
        name: 'Alice',
      };
      expect(CursorPayload.safeParse(payload).success).toBe(true);
    });

    it('rejects missing coordinates', () => {
      const payload = {
        kind: 'cursor',
        name: 'Alice',
      };
      expect(CursorPayload.safeParse(payload).success).toBe(false);
    });
  });

  describe('EphemeralPayload Union', () => {
    it('validates laser payload via union', () => {
      const laser = {
        kind: 'laser',
        x: 50,
        y: 50,
        active: true,
      };
      expect(EphemeralPayload.safeParse(laser).success).toBe(true);
    });
  });
});
