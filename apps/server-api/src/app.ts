import Fastify from 'fastify';
import { loadEnv } from './config/env.js';
import { registerCors } from './plugins/cors.js';
import { registerRateLimit } from './plugins/rateLimit.js';
import { registerWebSocket } from './plugins/websocket.js';
import { healthRoutes } from './routes/health.js';
import { createWsRoutes } from './routes/ws.js';
import { createCheckpointRoutes } from './routes/checkpoints.js';
import { getDb } from './db/client.js';
import { RoomManager } from './rooms/RoomManager.js';

export async function buildApp() {
  const env = loadEnv();

  const app = Fastify({
    logger:
      env.NODE_ENV === 'production'
        ? { level: 'info' }
        : {
            level: 'debug',
            transport: {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
            },
          },
  });

  // Database
  const db = getDb(env.DATABASE_URL);

  // Room manager
  const roomManager = new RoomManager(db, app.log);

  // Plugins
  await registerCors(app, env);
  await registerRateLimit(app);
  await registerWebSocket(app);

  // Routes
  await app.register(healthRoutes);
  await app.register(createWsRoutes(roomManager));
  await app.register(createCheckpointRoutes(roomManager));

  // Long-poll fallback routes (for P08)
  app.get('/api/poll', async (req) => {
    const { roomId, since } = req.query as { roomId: string; since: string };
    // Placeholder — P08 will implement full long-poll
    return { roomId, since: Number(since), ops: [] };
  });

  app.post('/api/ops', async (req) => {
    // Placeholder — P08 will implement
    return { ok: true };
  });

  return { app, env, roomManager };
}
