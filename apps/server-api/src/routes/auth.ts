import type { FastifyPluginAsync } from 'fastify';
import { createBoardToken, verifyBoardToken } from '../auth/token.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  /** Generate a board access token. */
  app.post<{
    Body: { boardId: string; userId: string; role: 'view' | 'comment' | 'edit'; ttl?: number };
  }>('/api/auth/token', async (req) => {
    const { boardId, userId, role, ttl } = req.body;

    if (!boardId || !userId || !role) {
      return { error: 'boardId, userId, and role are required' };
    }

    if (!['view', 'comment', 'edit'].includes(role)) {
      return { error: 'role must be view, comment, or edit' };
    }

    const token = await createBoardToken(boardId, userId, role, ttl);
    return { token };
  });

  /** Verify a token (for debugging/testing). */
  app.post<{ Body: { token: string } }>('/api/auth/verify', async (req) => {
    try {
      const payload = await verifyBoardToken(req.body.token);
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'Invalid or expired token' };
    }
  });
};
