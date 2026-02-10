import { describe, expect, it } from 'vitest';
import { ClientRateLimiter, isPayloadSizeOk, LIMITS } from '../auth/limits.js';

describe('ClientRateLimiter', () => {
  it('allows requests under the limit', () => {
    const limiter = new ClientRateLimiter();
    for (let i = 0; i < LIMITS.MAX_OPS_PER_SEC_PER_CLIENT; i++) {
      expect(limiter.isAllowed('client-1')).toBe(true);
    }
  });

  it('denies requests over the limit', () => {
    const limiter = new ClientRateLimiter();
    for (let i = 0; i < LIMITS.MAX_OPS_PER_SEC_PER_CLIENT; i++) {
      limiter.isAllowed('client-1');
    }
    expect(limiter.isAllowed('client-1')).toBe(false);
  });

  it('tracks clients independently', () => {
    const limiter = new ClientRateLimiter();
    for (let i = 0; i < LIMITS.MAX_OPS_PER_SEC_PER_CLIENT; i++) {
      limiter.isAllowed('client-1');
    }
    expect(limiter.isAllowed('client-1')).toBe(false);
    expect(limiter.isAllowed('client-2')).toBe(true);
  });
});

describe('isPayloadSizeOk', () => {
  it('accepts small payloads', () => {
    expect(isPayloadSizeOk({ type: 'createObject', objectId: '123' })).toBe(true);
  });

  it('rejects oversized payloads', () => {
    const largePayload = { data: 'x'.repeat(LIMITS.MAX_OP_PAYLOAD_BYTES + 1) };
    expect(isPayloadSizeOk(largePayload)).toBe(false);
  });
});
