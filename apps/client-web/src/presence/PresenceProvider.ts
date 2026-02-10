import { encodeEnvelope, PROTOCOL_VERSION } from '@dexdraw/shared-protocol';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { transportManager } from '../collab/TransportManager';

export interface RemoteCursor {
  clientId: string;
  x: number;
  y: number;
  name: string;
  color: string;
  lastUpdate: number;
}

interface PresenceState {
  remoteCursors: Map<string, RemoteCursor>;
  followingClientId: string | null;
  followerViewport: { x: number; y: number; zoom: number } | null;

  updateCursor: (cursor: RemoteCursor) => void;
  removeCursor: (clientId: string) => void;
  setFollowing: (clientId: string | null) => void;
  setFollowerViewport: (viewport: { x: number; y: number; zoom: number } | null) => void;
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  remoteCursors: new Map(),
  followingClientId: null,
  followerViewport: null,

  updateCursor: (cursor) =>
    set((state) => {
      const cursors = new Map(state.remoteCursors);
      cursors.set(cursor.clientId, cursor);
      return { remoteCursors: cursors };
    }),

  removeCursor: (clientId) =>
    set((state) => {
      const cursors = new Map(state.remoteCursors);
      cursors.delete(clientId);
      return { remoteCursors: cursors };
    }),

  setFollowing: (clientId) => set({ followingClientId: clientId }),
  setFollowerViewport: (viewport) => set({ followerViewport: viewport }),
}));

const CURSOR_THROTTLE_MS = 50; // 20Hz
let lastCursorSend = 0;

/**
 * Send local cursor position to other clients.
 * Throttled to 20Hz.
 */
export function sendCursorUpdate(
  roomId: string,
  clientId: string,
  x: number,
  y: number,
  name: string,
): void {
  const now = Date.now();
  if (now - lastCursorSend < CURSOR_THROTTLE_MS) return;
  lastCursorSend = now;

  const envelope = {
    v: PROTOCOL_VERSION as 1,
    type: 'ephemeral' as const,
    roomId,
    clientId,
    msgId: uuid(),
    ts: now,
    payload: {
      kind: 'cursor' as const,
      x,
      y,
      name,
    },
  };
  transportManager.send(encodeEnvelope(envelope));
}

/**
 * Send laser pointer update.
 */
export function sendLaserUpdate(
  roomId: string,
  clientId: string,
  x: number,
  y: number,
  active: boolean,
): void {
  const envelope = {
    v: PROTOCOL_VERSION as 1,
    type: 'ephemeral' as const,
    roomId,
    clientId,
    msgId: uuid(),
    ts: Date.now(),
    payload: {
      kind: 'laser' as const,
      x,
      y,
      active,
    },
  };
  transportManager.send(encodeEnvelope(envelope));
}

/**
 * Handle incoming ephemeral messages (cursor/laser updates from others).
 */
export function handlePresenceMessage(msg: Record<string, unknown>): void {
  if (msg.type !== 'ephemeral') return;

  const clientId = msg.clientId as string;
  const payload = msg.payload as Record<string, unknown>;
  if (!payload) return;

  if (payload.kind === 'cursor') {
    usePresenceStore.getState().updateCursor({
      clientId,
      x: payload.x as number,
      y: payload.y as number,
      name: payload.name as string,
      color: '#4a9eff', // Color will come from user info
      lastUpdate: Date.now(),
    });
  }

  // Laser trail is handled in the renderer (ephemeral, not stored)
}

/**
 * Clean up stale cursors (not updated in 5 seconds).
 */
export function cleanupStaleCursors(): void {
  const cursors = usePresenceStore.getState().remoteCursors;
  const now = Date.now();
  for (const [clientId, cursor] of cursors) {
    if (now - cursor.lastUpdate > 5000) {
      usePresenceStore.getState().removeCursor(clientId);
    }
  }
}
