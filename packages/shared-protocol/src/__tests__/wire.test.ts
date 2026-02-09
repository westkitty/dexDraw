import { describe, it, expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { encodeEnvelope } from '../wire/encode.js';
import { decodeC2S, decodeS2C } from '../wire/decode.js';
import { PROTOCOL_VERSION } from '../wire/constants.js';

describe('Wire encode/decode roundtrip', () => {
  it('roundtrips a c2s durable envelope', () => {
    const msg = {
      v: PROTOCOL_VERSION as 1,
      type: 'durable' as const,
      roomId: 'room-1',
      clientId: uuid(),
      msgId: uuid(),
      ts: Date.now(),
      payload: {
        kind: 'opBatch' as const,
        clientSeqStart: 5,
        ops: [
          {
            type: 'createObject' as const,
            objectId: uuid(),
            objectType: 'stroke',
            data: { points: [[1, 2, 0.5]] },
          },
        ],
      },
    };

    const encoded = encodeEnvelope(msg);
    expect(typeof encoded).toBe('string');

    const decoded = decodeC2S(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.envelope.type).toBe('durable');
      expect(decoded.envelope.roomId).toBe('room-1');
    }
  });

  it('roundtrips an s2c durable envelope with serverSeq', () => {
    const msg = {
      v: PROTOCOL_VERSION as 1,
      type: 'durable' as const,
      roomId: 'room-1',
      clientId: uuid(),
      msgId: uuid(),
      ts: Date.now(),
      serverSeq: 99,
      payload: {
        kind: 'opBatch' as const,
        clientSeqStart: 5,
        ops: [{ type: 'deleteObject' as const, objectId: uuid() }],
      },
    };

    const encoded = encodeEnvelope(msg);
    const decoded = decodeS2C(encoded);
    expect(decoded.ok).toBe(true);
  });

  it('returns error for invalid JSON', () => {
    const decoded = decodeC2S('not json');
    expect(decoded.ok).toBe(false);
  });

  it('returns error for invalid envelope shape', () => {
    const decoded = decodeC2S(JSON.stringify({ foo: 'bar' }));
    expect(decoded.ok).toBe(false);
  });
});
