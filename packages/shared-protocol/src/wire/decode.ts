import {
  type C2SEnvelope,
  type S2CEnvelope,
  validateEnvelopeWithDirection,
} from '../schemas/envelope.js';

export type DecodeResult<T> = { ok: true; envelope: T } | { ok: false; error: string };

/** Decode and validate a JSON string as a client-to-server envelope. */
export function decodeC2S(raw: string): DecodeResult<C2SEnvelope> {
  try {
    const parsed = JSON.parse(raw);
    const envelope = validateEnvelopeWithDirection(parsed, 'c2s');
    return { ok: true, envelope: envelope as C2SEnvelope };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Decode and validate a JSON string as a server-to-client envelope. */
export function decodeS2C(raw: string): DecodeResult<S2CEnvelope> {
  try {
    const parsed = JSON.parse(raw);
    const envelope = validateEnvelopeWithDirection(parsed, 's2c');
    return { ok: true, envelope: envelope as S2CEnvelope };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
