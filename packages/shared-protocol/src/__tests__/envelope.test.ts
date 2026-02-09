import { describe, it, expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { validateEnvelopeWithDirection, C2SEnvelope, S2CEnvelope } from '../schemas/envelope.js';
import { PROTOCOL_VERSION } from '../wire/constants.js';

function makeC2SDurable() {
  return {
    v: PROTOCOL_VERSION,
    type: 'durable' as const,
    roomId: 'room-1',
    clientId: uuid(),
    msgId: uuid(),
    ts: Date.now(),
    payload: {
      kind: 'opBatch' as const,
      clientSeqStart: 0,
      ops: [
        {
          type: 'createObject' as const,
          objectId: uuid(),
          objectType: 'stroke',
          data: { points: [] },
        },
      ],
    },
  };
}

describe('Envelope validation', () => {
  it('parses a valid c2s durable envelope', () => {
    const msg = makeC2SDurable();
    const result = validateEnvelopeWithDirection(msg, 'c2s');
    expect(result.type).toBe('durable');
  });

  it('parses a valid c2s ephemeral envelope', () => {
    const msg = {
      v: PROTOCOL_VERSION,
      type: 'ephemeral' as const,
      roomId: 'room-1',
      clientId: uuid(),
      msgId: uuid(),
      ts: Date.now(),
      payload: {
        kind: 'cursor' as const,
        x: 100,
        y: 200,
        name: 'Alice',
      },
    };
    const result = validateEnvelopeWithDirection(msg, 'c2s');
    expect(result.type).toBe('ephemeral');
  });

  it('parses a valid c2s hybrid envelope', () => {
    const msg = {
      v: PROTOCOL_VERSION,
      type: 'hybrid' as const,
      roomId: 'room-1',
      clientId: uuid(),
      msgId: uuid(),
      ts: Date.now(),
      payload: {
        kind: 'textCRDT' as const,
        textObjectId: uuid(),
        update: 'base64encodeddata',
        serverSeqRef: 5,
      },
    };
    const result = validateEnvelopeWithDirection(msg, 'c2s');
    expect(result.type).toBe('hybrid');
  });

  it('s2c durable requires serverSeq', () => {
    const msg = makeC2SDurable();
    // Missing serverSeq should fail for s2c
    expect(() => validateEnvelopeWithDirection(msg, 's2c')).toThrow();
  });

  it('parses s2c durable with serverSeq', () => {
    const msg = { ...makeC2SDurable(), serverSeq: 42 };
    const result = validateEnvelopeWithDirection(msg, 's2c');
    expect(result.type).toBe('durable');
    expect((result as S2CEnvelope & { serverSeq: number }).serverSeq).toBe(42);
  });

  it('rejects invalid protocol version', () => {
    const msg = { ...makeC2SDurable(), v: 999 };
    expect(() => validateEnvelopeWithDirection(msg, 'c2s')).toThrow();
  });

  it('rejects empty ops array in opBatch', () => {
    const msg = makeC2SDurable();
    msg.payload.ops = [];
    expect(() => validateEnvelopeWithDirection(msg, 'c2s')).toThrow();
  });

  it('parses all durable op types', () => {
    const clientId = uuid();
    const ops = [
      { type: 'createObject', objectId: uuid(), objectType: 'stroke', data: {} },
      { type: 'updateObject', objectId: uuid(), patch: { color: 'red' } },
      { type: 'deleteObject', objectId: uuid() },
      {
        type: 'convertInkToText',
        inkObjectIds: [uuid()],
        chosenText: 'Hello',
        newTextObjectId: uuid(),
        bbox: { x: 0, y: 0, width: 100, height: 50 },
        style: { strokeColor: '#fff' },
        keepInk: false,
      },
      { type: 'undo' },
      { type: 'redo', count: 2 },
      { type: 'checkpointCreate', checkpointId: uuid(), name: 'v1' },
      { type: 'checkpointRestore', checkpointId: uuid() },
    ];

    for (const op of ops) {
      const msg = {
        v: PROTOCOL_VERSION,
        type: 'durable' as const,
        roomId: 'room-1',
        clientId,
        msgId: uuid(),
        ts: Date.now(),
        payload: {
          kind: 'opBatch' as const,
          clientSeqStart: 0,
          ops: [op],
        },
      };
      const result = validateEnvelopeWithDirection(msg, 'c2s');
      expect(result.type).toBe('durable');
    }
  });
});
