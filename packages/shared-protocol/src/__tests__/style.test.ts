import { describe, expect, it } from 'vitest';
import { StyleSchema } from '../schemas/style.js';

describe('StyleSchema', () => {
  it('parses valid style', () => {
    const result = StyleSchema.parse({
      strokeColor: '#ffffff',
      fillColor: '#000000',
      strokeWidth: 2,
      opacity: 0.8,
    });
    expect(result.strokeColor).toBe('#ffffff');
  });

  it('parses empty style (all optional)', () => {
    const result = StyleSchema.parse({});
    expect(result).toEqual({});
  });

  it('rejects unknown properties (no passthrough)', () => {
    const result = StyleSchema.parse({
      strokeColor: '#fff',
      unknownProp: 'should be stripped',
    });
    // Zod strips unknown keys by default (no passthrough)
    expect('unknownProp' in result).toBe(false);
  });

  it('rejects negative strokeWidth', () => {
    expect(() => StyleSchema.parse({ strokeWidth: -1 })).toThrow();
  });

  it('rejects opacity > 1', () => {
    expect(() => StyleSchema.parse({ opacity: 1.5 })).toThrow();
  });
});
