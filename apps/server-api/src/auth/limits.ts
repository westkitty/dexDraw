/**
 * Payload and rate limits for board operations.
 */

export const LIMITS = {
  /** Maximum payload size per op (1 MB) */
  MAX_OP_PAYLOAD_BYTES: 1_048_576,

  /** Maximum ops per second per client */
  MAX_OPS_PER_SEC_PER_CLIENT: 100,

  /** Maximum objects per board */
  MAX_OBJECTS_PER_BOARD: 500,

  /** Maximum message size for WebSocket (1 MB) */
  MAX_WS_MESSAGE_BYTES: 1_048_576,

  /** Maximum text length in a single text object */
  MAX_TEXT_LENGTH: 50_000,

  /** Maximum number of ops in a single batch */
  MAX_BATCH_SIZE: 50,
} as const;

/**
 * Simple per-client rate limiter using a sliding window.
 */
export class ClientRateLimiter {
  private windows = new Map<string, { count: number; resetAt: number }>();

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    let entry = this.windows.get(clientId);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + 1000 };
      this.windows.set(clientId, entry);
    }

    entry.count++;
    return entry.count <= LIMITS.MAX_OPS_PER_SEC_PER_CLIENT;
  }

  /** Cleanup old entries (call periodically). */
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, entry] of this.windows) {
      if (now >= entry.resetAt + 5000) {
        this.windows.delete(clientId);
      }
    }
  }
}

/**
 * Check if payload size is within limits.
 */
export function isPayloadSizeOk(payload: unknown): boolean {
  const size = JSON.stringify(payload).length;
  return size <= LIMITS.MAX_OP_PAYLOAD_BYTES;
}
