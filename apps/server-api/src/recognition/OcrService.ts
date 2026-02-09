import type { Logger } from '../lib/logger.js';

interface OcrResult {
  candidates: Array<{ text: string; confidence: number }>;
}

/**
 * Server-side OCR service.
 * Placeholder: will integrate Tesseract.js or an external OCR API.
 */
export class OcrService {
  constructor(private log: Logger) {}

  async recognize(_imageBuffer: Buffer): Promise<OcrResult> {
    this.log.info('OCR recognition requested (placeholder)');

    // Placeholder: return empty candidates
    // Will be replaced with actual Tesseract.js integration
    return {
      candidates: [
        { text: '[OCR not configured]', confidence: 0.1 },
      ],
    };
  }
}
