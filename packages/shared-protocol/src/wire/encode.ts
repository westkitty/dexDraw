import type { C2SEnvelope, Envelope, S2CEnvelope } from '../schemas/envelope.js';

/** Encode an envelope to a JSON string for wire transport. */
export function encodeEnvelope(envelope: Envelope | S2CEnvelope | C2SEnvelope): string {
  return JSON.stringify(envelope);
}
