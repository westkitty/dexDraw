import type { FastifyInstance } from 'fastify';

export async function wsRoutes(app: FastifyInstance) {
  app.get('/ws/:boardId', { websocket: true }, (socket, req) => {
    const { boardId } = req.params as { boardId: string };
    const log = req.log.child({ boardId });

    log.info('WebSocket client connected');

    socket.on('message', (data) => {
      log.debug({ size: (data as Buffer).length }, 'WS message received');
      // Room manager will handle messages in P07
    });

    socket.on('close', () => {
      log.info('WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      log.error({ err }, 'WebSocket error');
    });
  });
}
