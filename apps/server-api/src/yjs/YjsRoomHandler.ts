import * as Y from 'yjs';
import type { YjsPersistence } from './YjsPersistence.js';
import type { Logger } from '../lib/logger.js';

/**
 * Manages Yjs documents per text object within a board room.
 * Handles state vector exchange, compaction, and persistence.
 */
export class YjsRoomHandler {
  private docs = new Map<string, Y.Doc>();
  private boardId: string;

  constructor(
    boardId: string,
    private persistence: YjsPersistence,
    private log: Logger,
  ) {
    this.boardId = boardId;
  }

  /** Get or load a Y.Doc for a text object. */
  async getDoc(textObjectId: string): Promise<Y.Doc> {
    let doc = this.docs.get(textObjectId);
    if (!doc) {
      doc = new Y.Doc();
      this.docs.set(textObjectId, doc);

      // Load persisted updates
      try {
        const updates = await this.persistence.loadUpdates(this.boardId, textObjectId);
        for (const update of updates) {
          Y.applyUpdate(doc, new Uint8Array(update));
        }
      } catch (err) {
        this.log.error({ err, boardId: this.boardId, textObjectId }, 'Failed to load Yjs updates');
      }
    }
    return doc;
  }

  /** Apply a remote update from a client and persist it. */
  async applyUpdate(textObjectId: string, base64Update: string, serverSeqRef: number): Promise<void> {
    const doc = await this.getDoc(textObjectId);

    const binaryStr = Buffer.from(base64Update, 'base64');
    Y.applyUpdate(doc, new Uint8Array(binaryStr));

    await this.persistence.persistUpdate(this.boardId, textObjectId, serverSeqRef, binaryStr);
  }

  /** Get the current state as a single merged update (for new clients). */
  async getStateUpdate(textObjectId: string): Promise<string> {
    const doc = await this.getDoc(textObjectId);
    const state = Y.encodeStateAsUpdate(doc);
    return Buffer.from(state).toString('base64');
  }

  /** Destroy all docs when room is destroyed. */
  destroyAll(): void {
    for (const doc of this.docs.values()) {
      doc.destroy();
    }
    this.docs.clear();
  }
}
