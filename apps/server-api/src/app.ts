import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { initTokenSecret } from './auth/token.js';
import { loadEnv } from './config/env.js';
import { getDb } from './db/client.js';
import { registerCors } from './plugins/cors.js';
import { registerRateLimit } from './plugins/rateLimit.js';
import { registerWebSocket } from './plugins/websocket.js';
import { RoomManager } from './rooms/RoomManager.js';
import { authRoutes } from './routes/auth.js';
import { createBoardRoutes } from './routes/boards.js';
import { createCheckpointRoutes } from './routes/checkpoints.js';
import { createHealthRoutes } from './routes/health.js';
import { createWsRoutes } from './routes/ws.js';

export async function buildApp() {
  const env = loadEnv();

  // Initialize JWT signing key
  initTokenSecret(env.TOKEN_SECRET);

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

  // Security: CSP headers (relaxed for WebSocket + dev)
  await app.register(helmet, {
    contentSecurityPolicy:
      env.NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              connectSrc: ["'self'", 'wss:'],
              imgSrc: ["'self'", 'data:', 'blob:'],
            },
          }
        : false,
  });

  // Plugins
  await registerCors(app, env);
  await registerRateLimit(app);
  await registerWebSocket(app);

  // Routes
  await app.register(createHealthRoutes(roomManager));
  await app.register(authRoutes);
  await app.register(createWsRoutes(roomManager));
  await app.register(createCheckpointRoutes(roomManager));
  await app.register(createBoardRoutes(db));

  // Long-poll fallback routes (for P08)
  app.get('/api/poll', async (req) => {
    const { roomId, since } = req.query as { roomId: string; since: string };
    // Placeholder — P08 will implement full long-poll
    return { roomId, since: Number(since), ops: [] };
  });

  app.post('/api/ops', async () => {
    // Placeholder — P08 will implement
    return { ok: true };
  });

  return { app, env, roomManager };
}
