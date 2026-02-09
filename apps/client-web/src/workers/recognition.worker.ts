/**
 * TensorFlow.js recognition worker.
 * Phase 1: Stub recognizer returns placeholder candidates.
 * The actual TF.js model will be integrated later.
 */

interface RecognizeRequest {
  type: 'recognize';
  id: string;
  imageData?: ImageData;
  width: number;
  height: number;
}

interface RecognizeResponse {
  type: 'result';
  id: string;
  candidates: Array<{ text: string; confidence: number }>;
  used: 'stub' | 'model';
}

// Stub recognizer: returns placeholder candidates with low confidence
function stubRecognize(): Array<{ text: string; confidence: number }> {
  return [
    { text: '', confidence: 0.0 },
    { text: '', confidence: 0.0 },
    { text: '', confidence: 0.0 },
  ];
}

self.onmessage = (event: MessageEvent<RecognizeRequest>) => {
  const req = event.data;

  if (req.type === 'recognize') {
    // Stub: always returns low-confidence results
    // This will be replaced with actual TF.js model inference
    const candidates = stubRecognize();

    const response: RecognizeResponse = {
      type: 'result',
      id: req.id,
      candidates,
      used: 'stub',
    };

    self.postMessage(response);
  }
};
