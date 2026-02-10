import type { FastifyInstance } from 'fastify';
import type { RoomManager } from '../rooms/RoomManager.js';

export function createHealthRoutes(roomManager: RoomManager) {
  return async (app: FastifyInstance) => {
    app.get('/health', async () => {
      return { status: 'ok', timestamp: Date.now(), uptime: process.uptime() };
    });

    app.get('/version', async () => {
      return { name: 'dexDraw', version: '0.1.0-meeting' };
    });

    app.get('/metrics', async () => {
      const mem = process.memoryUsage();
      const metrics = roomManager.getMetrics();
      return {
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: {
          rss: mem.rss,
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
        },
        rooms: metrics.rooms,
        clients: metrics.clients,
        roomDetails: metrics.roomDetails,
      };
    });
  };
}

/** @deprecated Use createHealthRoutes(roomManager) instead */
export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  app.get('/version', async () => {
    return { name: 'dexDraw', version: '0.1.0-meeting' };
  });
}
