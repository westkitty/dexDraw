import { describe, it, expect } from 'vitest';
import { isOpAllowed, canSendPresence, canSendHybrid } from '../auth/roles.js';

describe('Role enforcement', () => {
  describe('isOpAllowed', () => {
    it('edit role allows all ops', () => {
      expect(isOpAllowed('edit', 'createObject', 'stroke')).toBe(true);
      expect(isOpAllowed('edit', 'deleteObject')).toBe(true);
      expect(isOpAllowed('edit', 'checkpointCreate')).toBe(true);
    });

    it('view role denies all durable ops', () => {
      expect(isOpAllowed('view', 'createObject')).toBe(false);
      expect(isOpAllowed('view', 'deleteObject')).toBe(false);
      expect(isOpAllowed('view', 'updateObject')).toBe(false);
    });

    it('comment role allows CRUD on comment objects only', () => {
      expect(isOpAllowed('comment', 'createObject', 'comment')).toBe(true);
      expect(isOpAllowed('comment', 'updateObject', 'comment')).toBe(true);
      expect(isOpAllowed('comment', 'deleteObject', 'comment')).toBe(true);
    });

    it('comment role denies CRUD on non-comment objects', () => {
      expect(isOpAllowed('comment', 'createObject', 'stroke')).toBe(false);
      expect(isOpAllowed('comment', 'createObject', 'shape')).toBe(false);
    });

    it('comment role denies non-CRUD ops', () => {
      expect(isOpAllowed('comment', 'checkpointCreate')).toBe(false);
      expect(isOpAllowed('comment', 'undo')).toBe(false);
    });
  });

  describe('canSendPresence', () => {
    it('edit and comment can send presence', () => {
      expect(canSendPresence('edit')).toBe(true);
      expect(canSendPresence('comment')).toBe(true);
    });

    it('view cannot send presence', () => {
      expect(canSendPresence('view')).toBe(false);
    });
  });

  describe('canSendHybrid', () => {
    it('only edit can send hybrid (Yjs)', () => {
      expect(canSendHybrid('edit')).toBe(true);
      expect(canSendHybrid('comment')).toBe(false);
      expect(canSendHybrid('view')).toBe(false);
    });
  });
});
