import type { DurableOp } from '@dexdraw/shared-protocol';
import { encodeEnvelope, PROTOCOL_VERSION } from '@dexdraw/shared-protocol';
import { v4 as uuid } from 'uuid';
import { transportManager } from '../TransportManager';
import { getAllOps, putOp, removeOp } from './OutboxDB';

export class Outbox {
  private clientSeqCounter = 0;
  private boardId: string;
  private clientId: string;

  constructor(boardId: string, clientId: string) {
    this.boardId = boardId;
    this.clientId = clientId;
  }

  /** Submit a durable op: apply optimistically, persist to IDB, send via transport. */
  async submit(ops: DurableOp[]): Promise<number> {
    const clientSeqStart = this.clientSeqCounter;
    this.clientSeqCounter += ops.length;

    const envelope = {
      v: PROTOCOL_VERSION as 1,
      type: 'durable' as const,
      roomId: this.boardId,
      clientId: this.clientId,
      msgId: uuid(),
      ts: Date.now(),
      payload: {
        kind: 'opBatch' as const,
        clientSeqStart,
        ops,
      },
    };

    const encoded = encodeEnvelope(envelope);

    // Persist to IndexedDB
    try {
      await putOp({
        clientSeq: clientSeqStart,
        boardId: this.boardId,
        envelope: encoded,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.warn('Failed to persist op to IndexedDB:', err);
    }

    // Send via transport
    transportManager.send(encoded);

    return clientSeqStart;
  }

  /** Acknowledge a server-confirmed op, removing it from outbox. */
  async acknowledge(clientSeq: number): Promise<void> {
    try {
      await removeOp(clientSeq);
    } catch (err) {
      console.warn('Failed to remove op from outbox:', err);
    }
  }

  /** Resend all pending ops (after reconnect). */
  async resendPending(): Promise<void> {
    try {
      const pending = await getAllOps(this.boardId);
      for (const entry of pending) {
        transportManager.send(entry.envelope);
      }
    } catch (err) {
      console.warn('Failed to resend pending ops:', err);
    }
  }

  get ownClientId(): string {
    return this.clientId;
  }

  get nextClientSeq(): number {
    return this.clientSeqCounter;
  }
}
