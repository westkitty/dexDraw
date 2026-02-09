import type { FastifyInstance } from 'fastify';
import { v4 as uuid } from 'uuid';
import type { RoomManager } from '../rooms/RoomManager.js';

export function createWsRoutes(roomManager: RoomManager) {
  return async function wsRoutes(app: FastifyInstance) {
    app.get('/ws/:boardId', { websocket: true }, async (socket, req) => {
      const { boardId } = req.params as { boardId: string };
      const log = req.log.child({ boardId });

      // Wait for the first message (join request)
      const joinPromise = new Promise<void>((resolve) => {
        const onFirstMessage = async (data: Buffer | ArrayBuffer | Buffer[]) => {
          socket.off('message', onFirstMessage);
          try {
            const msg = JSON.parse(data.toString()) as Record<string, unknown>;
            if (msg.type === 'join') {
              const clientId = (msg.clientId as string) ?? uuid();
              const displayName = (msg.displayName as string) ?? 'Anonymous';
              const lastSeenServerSeq = (msg.lastSeenServerSeq as number) ?? 0;

              log.info({ clientId, displayName, lastSeenServerSeq }, 'Join request');
              await roomManager.handleConnection(
                boardId,
                clientId,
                socket,
                displayName,
                lastSeenServerSeq,
              );
            } else {
              log.warn('First message must be a join request');
              socket.close(4001, 'Expected join message');
            }
          } catch (err) {
            log.error({ err }, 'Error handling join');
            socket.close(4002, 'Join failed');
          }
          resolve();
        };
        socket.on('message', onFirstMessage);
      });

      await joinPromise;
    });
  };
}
