import Fastify from 'fastify';
import { loadEnv } from './config/env.js';
import { registerCors } from './plugins/cors.js';
import { registerRateLimit } from './plugins/rateLimit.js';
import { registerWebSocket } from './plugins/websocket.js';
import { healthRoutes } from './routes/health.js';
import { wsRoutes } from './routes/ws.js';

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

  // Plugins
  await registerCors(app, env);
  await registerRateLimit(app);
  await registerWebSocket(app);

  // Routes
  await app.register(healthRoutes);
  await app.register(wsRoutes);

  return { app, env };
}
