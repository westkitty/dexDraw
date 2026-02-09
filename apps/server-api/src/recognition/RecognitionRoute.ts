import type { FastifyInstance } from 'fastify';
import { OcrService } from './OcrService.js';

export function createRecognitionRoutes(ocrService: OcrService) {
  return async function recognitionRoutes(app: FastifyInstance) {
    app.post('/api/ocr', async (req, reply) => {
      // Handle multipart file upload
      // For now, accept raw body as image data
      const body = req.body as Buffer;
      if (!body || body.length === 0) {
        return reply.status(400).send({ error: 'No image data provided' });
      }

      try {
        const result = await ocrService.recognize(body);
        return result;
      } catch (err) {
        req.log.error({ err }, 'OCR recognition failed');
        return reply.status(500).send({ error: 'Recognition failed' });
      }
    });
  };
}
