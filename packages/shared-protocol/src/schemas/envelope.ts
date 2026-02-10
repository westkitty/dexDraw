import { z } from 'zod';
import { PROTOCOL_VERSION } from '../wire/constants.js';
import { HybridPayload } from './hybrid.js';
import { DurableOp } from './op.js';
import { EphemeralPayload } from './presence.js';

const OpBatchPayload = z.object({
  kind: z.literal('opBatch'),
  clientSeqStart: z.number().int().nonnegative(),
  ops: z.array(DurableOp).min(1),
});

export type OpBatchPayload = z.infer<typeof OpBatchPayload>;

const DurableEnvelope = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('durable'),
  roomId: z.string(),
  clientId: z.string().uuid(),
  msgId: z.string().uuid(),
  ts: z.number(),
  payload: OpBatchPayload,
});

const EphemeralEnvelope = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('ephemeral'),
  roomId: z.string(),
  clientId: z.string().uuid(),
  msgId: z.string().uuid(),
  ts: z.number(),
  payload: EphemeralPayload,
});

const HybridEnvelope = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('hybrid'),
  roomId: z.string(),
  clientId: z.string().uuid(),
  msgId: z.string().uuid(),
  ts: z.number(),
  payload: HybridPayload,
});

export const Envelope = z.discriminatedUnion('type', [
  DurableEnvelope,
  EphemeralEnvelope,
  HybridEnvelope,
]);

export type Envelope = z.infer<typeof Envelope>;

/** Client-to-server envelope: durable requires clientSeq on payload */
const C2SDurableEnvelope = DurableEnvelope;

/** Server-to-client durable broadcast includes serverSeq */
const S2CDurableEnvelope = DurableEnvelope.extend({
  serverSeq: z.number().int().nonnegative(),
});

const C2SEphemeralEnvelope = EphemeralEnvelope;
const S2CEphemeralEnvelope = EphemeralEnvelope;

const C2CHybridEnvelope = HybridEnvelope;
const S2CHybridEnvelope = HybridEnvelope.extend({
  serverSeq: z.number().int().nonnegative(),
});

export const C2SEnvelope = z.discriminatedUnion('type', [
  C2SDurableEnvelope,
  C2SEphemeralEnvelope,
  C2CHybridEnvelope,
]);

export const S2CEnvelope = z.discriminatedUnion('type', [
  S2CDurableEnvelope,
  S2CEphemeralEnvelope,
  S2CHybridEnvelope,
]);

export type C2SEnvelope = z.infer<typeof C2SEnvelope>;
export type S2CEnvelope = z.infer<typeof S2CEnvelope>;

/**
 * Validate an envelope with directional constraints.
 * c2s: client-to-server (durable requires clientSeqStart on payload)
 * s2c: server-to-client (durable requires serverSeq on envelope)
 */
export function validateEnvelopeWithDirection(
  input: unknown,
  direction: 'c2s' | 's2c',
): C2SEnvelope | S2CEnvelope {
  if (direction === 'c2s') {
    return C2SEnvelope.parse(input);
  }
  return S2CEnvelope.parse(input);
}
