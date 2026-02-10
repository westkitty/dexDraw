import { describe, expect, it } from 'vitest';
import { clamp } from '../math/clamp.js';
import { distance } from '../math/distance.js';
import { lerp } from '../math/lerp.js';

describe('math utilities', () => {
  describe('clamp', () => {
    it('clamps value below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('clamps value above max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('handles edge case of min === max', () => {
      expect(clamp(5, 3, 3)).toBe(3);
    });
  });

  describe('lerp', () => {
    it('returns start at t=0', () => {
      expect(lerp(10, 20, 0)).toBe(10);
    });

    it('returns end at t=1', () => {
      expect(lerp(10, 20, 1)).toBe(20);
    });

    it('returns midpoint at t=0.5', () => {
      expect(lerp(10, 20, 0.5)).toBe(15);
    });
  });

  describe('distance', () => {
    it('returns 0 for same point', () => {
      expect(distance(0, 0, 0, 0)).toBe(0);
    });

    it('returns correct distance for 3-4-5 triangle', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
    });

    it('returns correct horizontal distance', () => {
      expect(distance(0, 0, 10, 0)).toBe(10);
    });
  });
});
