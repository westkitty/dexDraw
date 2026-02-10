// Schemas

export { BoardRole, JoinRequest, JoinResponse } from './schemas/auth.js';
export type { OpBatchPayload } from './schemas/envelope.js';
export {
  C2SEnvelope,
  Envelope,
  S2CEnvelope,
  validateEnvelopeWithDirection,
} from './schemas/envelope.js';
export { HybridPayload, TextCRDTPayload } from './schemas/hybrid.js';
export {
  CheckpointCreateOp,
  CheckpointRestoreOp,
  ConvertInkToTextOp,
  CreateObjectOp,
  DeleteObjectOp,
  DurableOp,
  RedoOp,
  UndoOp,
  UpdateObjectOp,
} from './schemas/op.js';

export { CursorPayload, EphemeralPayload, LaserPayload } from './schemas/presence.js';
export { BoardObjectSnapshot, BoardSnapshot } from './schemas/snapshot.js';
export type { Style } from './schemas/style.js';
export { StyleSchema } from './schemas/style.js';
export type { BoardTemplate, TemplateObject } from './templates/index.js';
// Templates
export { getTemplateById, TEMPLATES } from './templates/index.js';
// Wire
export { EnvelopeType, ObjectType, OpType, PROTOCOL_VERSION } from './wire/constants.js';
export type { DecodeResult } from './wire/decode.js';
export { decodeC2S, decodeS2C } from './wire/decode.js';
export { encodeEnvelope } from './wire/encode.js';
