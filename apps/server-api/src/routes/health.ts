import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  app.get('/version', async () => {
    return { name: 'dexDraw', version: '0.0.0' };
  });
}
