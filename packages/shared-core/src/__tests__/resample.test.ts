import { describe, expect, it } from 'vitest';
import { resample } from '../stroke/resample.js';
import type { RawPoint } from '../stroke/types.js';

describe('resample', () => {
    it('returns empty array for empty input', () => {
        expect(resample([])).toEqual([]);
    });

    it('returns single point for single input', () => {
        const input: RawPoint[] = [{ x: 0, y: 0, t: 0 }];
        expect(resample(input)).toEqual(input);
    });

    it('interpolates points based on distance', () => {
        const input: RawPoint[] = [
            { x: 0, y: 0, t: 0 },
            { x: 10, y: 0, t: 10 },
        ];
        // Asking for step=2 should produce roughly 0, 2, 4, 6, 8, 10
        const result = resample(input, 2);
        expect(result.length).toBeGreaterThan(2);
        expect(result[0].x).toBe(0);
        expect(result[result.length - 1].x).toBe(10);
    });
});
