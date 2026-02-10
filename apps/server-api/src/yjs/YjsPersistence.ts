import { and, eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { yjsUpdates } from '../db/schema/index.js';
import type { Logger } from '../lib/logger.js';

export class YjsPersistence {
  constructor(
    private db: Database,
    private log: Logger,
  ) {}

  /** Persist a Yjs update for a text object. */
  async persistUpdate(
    boardId: string,
    textObjectId: string,
    serverSeqRef: number,
    update: Buffer,
  ): Promise<void> {
    try {
      await this.db.insert(yjsUpdates).values({
        boardId,
        textObjectId,
        serverSeqRef,
        update,
      });
    } catch (err) {
      this.log.error({ err, boardId, textObjectId }, 'Failed to persist Yjs update');
    }
  }

  /** Load all Yjs updates for a text object up to a given serverSeq. */
  async loadUpdates(boardId: string, textObjectId: string): Promise<Buffer[]> {
    const rows = await this.db
      .select({ update: yjsUpdates.update })
      .from(yjsUpdates)
      .where(and(eq(yjsUpdates.boardId, boardId), eq(yjsUpdates.textObjectId, textObjectId)))
      .orderBy(yjsUpdates.serverSeqRef);

    return rows.map((r) => r.update);
  }
}
