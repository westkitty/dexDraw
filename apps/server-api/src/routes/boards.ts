import { getTemplateById, TEMPLATES } from '@dexdraw/shared-protocol';
import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { v4 as uuid } from 'uuid';
import type { Database } from '../db/client.js';
import { boards, ops } from '../db/schema/index.js';

export function createBoardRoutes(db: Database): FastifyPluginAsync {
  return async (app) => {
    /** List available templates. */
    app.get('/api/templates', async () => {
      return {
        templates: TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          objectCount: t.objects.length,
        })),
      };
    });

    /** Create a new board, optionally from a template. */
    app.post<{
      Body: { name: string; ownerId: string; templateId?: string };
    }>('/api/boards', async (req) => {
      const { name, ownerId, templateId } = req.body;

      const boardId = uuid();
      await db.insert(boards).values({
        id: boardId,
        name,
        ownerId,
      });

      // Apply template objects if specified
      if (templateId && templateId !== 'blank') {
        const template = getTemplateById(templateId);
        if (template) {
          let serverSeq = 0;
          for (const tmplObj of template.objects) {
            serverSeq++;
            const objectId = uuid();
            await db.insert(ops).values({
              boardId,
              serverSeq,
              clientId: 'system',
              clientSeq: serverSeq,
              opType: 'createObject',
              payload: {
                type: 'createObject',
                objectId,
                objectType: tmplObj.objectType,
                data: tmplObj.data,
              },
            });
          }
        }
      }

      return { boardId, name, templateId: templateId ?? 'blank' };
    });

    /** List boards for an owner. */
    app.get<{ Querystring: { ownerId: string } }>('/api/boards', async (req) => {
      const { ownerId } = req.query;
      const rows = await db.select().from(boards).where(eq(boards.ownerId, ownerId));
      return { boards: rows };
    });
  };
}
