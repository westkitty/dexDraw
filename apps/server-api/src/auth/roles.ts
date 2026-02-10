/**
 * Role-based permission enforcement for board operations.
 *
 * Roles (ascending privilege):
 * - view: receive ops and presence only (read-only)
 * - comment: view + can create/update/delete comment objects
 * - edit: all operations
 */

export type BoardRole = 'view' | 'comment' | 'edit';

const COMMENT_OP_TYPES = new Set(['createObject', 'updateObject', 'deleteObject']);
const COMMENT_OBJECT_TYPES = new Set(['comment']);

/**
 * Check if a role is allowed to perform a given op.
 * Returns true if allowed, false if denied.
 */
export function isOpAllowed(role: BoardRole, opType: string, objectType?: string): boolean {
  // Edit role can do everything
  if (role === 'edit') return true;

  // View role can't send any durable ops
  if (role === 'view') return false;

  // Comment role: can only do CRUD on comment objects
  if (role === 'comment') {
    if (!COMMENT_OP_TYPES.has(opType)) return false;
    if (objectType && !COMMENT_OBJECT_TYPES.has(objectType)) return false;
    return true;
  }

  return false;
}

/**
 * Check if a role can send ephemeral (presence) messages.
 * All roles can receive presence; only comment and edit can send.
 */
export function canSendPresence(role: BoardRole): boolean {
  return role !== 'view';
}

/**
 * Check if a role can send hybrid (Yjs text) messages.
 * Only edit role can modify text content.
 */
export function canSendHybrid(role: BoardRole): boolean {
  return role === 'edit';
}
