import fastifyWebsocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

export async function registerWebSocket(app: FastifyInstance) {
  await app.register(fastifyWebsocket, {
    options: {
      maxPayload: 1024 * 1024, // 1MB max payload
    },
  });
}
