// Schemas
export {
  Envelope,
  C2SEnvelope,
  S2CEnvelope,
  validateEnvelopeWithDirection,
} from './schemas/envelope.js';
export type { OpBatchPayload } from './schemas/envelope.js';

export {
  DurableOp,
  CreateObjectOp,
  UpdateObjectOp,
  DeleteObjectOp,
  ConvertInkToTextOp,
  UndoOp,
  RedoOp,
  CheckpointCreateOp,
  CheckpointRestoreOp,
} from './schemas/op.js';

export { StyleSchema } from './schemas/style.js';
export type { Style } from './schemas/style.js';

export { CursorPayload, LaserPayload, EphemeralPayload } from './schemas/presence.js';
export { TextCRDTPayload, HybridPayload } from './schemas/hybrid.js';

export { JoinRequest, JoinResponse, BoardRole } from './schemas/auth.js';
export { BoardSnapshot, BoardObjectSnapshot } from './schemas/snapshot.js';

// Wire
export { PROTOCOL_VERSION, EnvelopeType, OpType, ObjectType } from './wire/constants.js';
export { encodeEnvelope } from './wire/encode.js';
export { decodeC2S, decodeS2C } from './wire/decode.js';
export type { DecodeResult } from './wire/decode.js';
