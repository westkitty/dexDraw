import type { FastifyPluginAsync } from 'fastify';
import type { RoomManager } from '../rooms/RoomManager.js';

export function createCheckpointRoutes(roomManager: RoomManager): FastifyPluginAsync {
  return async (app) => {
    /** List all checkpoints for a board. */
    app.get<{ Params: { boardId: string } }>('/api/boards/:boardId/checkpoints', async (req) => {
      const { boardId } = req.params;
      const room = await roomManager.getOrCreate(boardId);
      const list = await room.listCheckpoints();
      return { checkpoints: list };
    });

    /** Get ops for time-travel replay between two serverSeq values. */
    app.get<{ Params: { boardId: string }; Querystring: { from: string; to: string } }>(
      '/api/boards/:boardId/replay',
      async (req) => {
        const { boardId } = req.params;
        const from = Number(req.query.from) || 0;
        const to = Number(req.query.to) || 0;

        if (to <= from || to - from > 5000) {
          return { error: 'Invalid range (max 5000 ops per request)' };
        }

        const room = await roomManager.getOrCreate(boardId);
        const replayOps = await room.getOpsForReplay(from, to);
        return { ops: replayOps };
      },
    );

    /** Get snapshot at or before a given serverSeq. */
    app.get<{ Params: { boardId: string }; Querystring: { at: string } }>(
      '/api/boards/:boardId/snapshot',
      async (req) => {
        const { boardId } = req.params;
        const at = Number(req.query.at) || 0;
        const room = await roomManager.getOrCreate(boardId);
        const snap = await room.getSnapshotAt(at);
        return snap ?? { error: 'No snapshot found' };
      },
    );
  };
}
