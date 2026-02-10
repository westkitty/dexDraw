import { v4 as uuid } from 'uuid';

interface RecognitionResult {
  candidates: Array<{ text: string; confidence: number }>;
  source: 'local' | 'server';
}

const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Orchestrates ink-to-text recognition:
 * 1. Try local TF.js worker
 * 2. If confidence < threshold or stub, fall back to server OCR
 */
export class RecognitionPipeline {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, (result: RecognitionResult) => void>();

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    try {
      this.worker = new Worker(new URL('../workers/recognition.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event) => {
        const { id, candidates, used } = event.data;
        const resolve = this.pendingRequests.get(id);
        if (resolve) {
          this.pendingRequests.delete(id);

          const maxConfidence = Math.max(
            ...candidates.map((c: { confidence: number }) => c.confidence),
            0,
          );

          if (maxConfidence >= CONFIDENCE_THRESHOLD && used !== 'stub') {
            resolve({ candidates, source: 'local' });
          } else {
            // Fall back to server — resolved by the caller
            resolve({ candidates, source: 'local' });
          }
        }
      };
    } catch {
      console.warn('Failed to initialize recognition worker');
    }
  }

  /**
   * Recognize ink from a canvas region.
   * Returns candidates from local worker (may be stub/low confidence).
   */
  async recognizeLocal(canvas: HTMLCanvasElement): Promise<RecognitionResult> {
    if (!this.worker) {
      return { candidates: [], source: 'local' };
    }

    const id = uuid();
    return new Promise((resolve) => {
      this.pendingRequests.set(id, resolve);
      this.worker?.postMessage({
        type: 'recognize',
        id,
        width: canvas.width,
        height: canvas.height,
      });

      // Timeout after 5s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          resolve({ candidates: [], source: 'local' });
        }
      }, 5000);
    });
  }

  /**
   * Fall back to server OCR.
   * Rasterizes selected ink to offscreen canvas, sends PNG to server.
   */
  async recognizeServer(canvas: HTMLCanvasElement): Promise<RecognitionResult> {
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return { candidates: [], source: 'server' };

      const formData = new FormData();
      formData.append('image', blob, 'ink.png');

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return { candidates: [], source: 'server' };
      }

      const data = await response.json();
      return {
        candidates: data.candidates ?? [],
        source: 'server',
      };
    } catch {
      return { candidates: [], source: 'server' };
    }
  }

  /**
   * Full pipeline: try local first, fall back to server if needed.
   */
  async recognize(canvas: HTMLCanvasElement): Promise<RecognitionResult> {
    const localResult = await this.recognizeLocal(canvas);

    const maxLocalConfidence = Math.max(...localResult.candidates.map((c) => c.confidence), 0);

    if (maxLocalConfidence >= CONFIDENCE_THRESHOLD) {
      return localResult;
    }

    // Fall back to server OCR
    return this.recognizeServer(canvas);
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
