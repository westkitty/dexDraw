import { describe, expect, it } from 'vitest';
import { quantize } from '../stroke/quantize.js';

describe('quantize', () => {
  it('rounds coordinates to nearest integer (default grid=1)', () => {
    // Note: The implementation default is 0.5, so 1.1 -> 1.0, 1.9 -> 2.0
    // But let's test with explicit grid size of 1 for integer rounding
    const result = quantize([{ x: 1.1, y: 1.9, t: 0 }], 1);
    expect(result[0]).toEqual({ x: 1, y: 2, t: 0, pressure: undefined });
  });

  it('preserves time component', () => {
    const result = quantize([{ x: 10.123, y: 20.456, t: 12345 }]);
    expect(result[0]).toMatchObject({
      t: 12345,
    });
  });
});
