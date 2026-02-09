import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

export async function registerWebSocket(app: FastifyInstance) {
  await app.register(fastifyWebsocket, {
    options: {
      maxPayload: 1024 * 1024, // 1MB max payload
    },
  });
}
