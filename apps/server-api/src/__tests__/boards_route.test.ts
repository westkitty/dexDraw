import fastify from 'fastify';
import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../db/client.js';
import { createBoardRoutes } from '../routes/boards.js';

describe('Board Routes', () => {
  it('GET /api/templates returns templates', async () => {
    const app = fastify();
    const mockDb = {} as Database;

    app.register(createBoardRoutes(mockDb));
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/api/templates',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.templates).toBeInstanceOf(Array);
    expect(body.templates.length).toBeGreaterThan(0);
  });

  it('POST /api/boards creates a board', async () => {
    const app = fastify();

    // Mock DB insert
    const insertMock = vi.fn().mockReturnValue({ values: vi.fn() });
    const mockDb = {
      insert: insertMock,
    } as unknown as Database;

    app.register(createBoardRoutes(mockDb));
    await app.ready();

    const response = await app.inject({
      method: 'POST',
      url: '/api/boards',
      payload: {
        name: 'New Board',
        ownerId: 'user-1',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('New Board');
    expect(body.boardId).toBeDefined();

    // Verify DB call
    expect(insertMock).toHaveBeenCalled();
  });
});
