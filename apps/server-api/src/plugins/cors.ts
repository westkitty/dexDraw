import fastifyCors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';

export async function registerCors(app: FastifyInstance, env: Env) {
  const origins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? false : origins, // same-origin in prod
    credentials: true,
  });
}
