import fastifyRateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

export async function registerRateLimit(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });
}
