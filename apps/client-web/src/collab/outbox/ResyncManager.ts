import { useBoardStore } from '../../store/useBoardStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import type { Outbox } from './Outbox';

export class ResyncManager {
  constructor(private outbox: Outbox) {}

  /**
   * Handle server message: apply ops, update lastSeenServerSeq, ACK outbox entries.
   */
  handleServerMessage(data: string): void {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    const boardStore = useBoardStore.getState();

    if (msg.type === 'joinAck') {
      const currentSeq = msg.currentServerSeq as number;
      boardStore.setLastSeenServerSeq(currentSeq);

      if (msg.users && Array.isArray(msg.users)) {
        boardStore.setUsers(
          (msg.users as Array<{ clientId: string; displayName: string; color: string }>),
        );
      }
      return;
    }

    if (msg.type === 'opBroadcast') {
      const serverSeq = msg.serverSeq as number;
      const clientId = msg.clientId as string;
      const clientSeq = msg.clientSeq as number;
      const opType = msg.opType as string;
      const payload = msg.payload as Record<string, unknown>;

      // Update lastSeenServerSeq
      if (serverSeq > boardStore.lastSeenServerSeq) {
        boardStore.setLastSeenServerSeq(serverSeq);
      }

      // ACK if this is our own op
      if (clientId === this.outbox['clientId']) {
        this.outbox.acknowledge(clientSeq);
      }

      // Apply op to canvas state
      this.applyOp(opType, payload);
      return;
    }

    if (msg.type === 'userJoined') {
      const users = [...boardStore.users];
      users.push({
        clientId: msg.clientId as string,
        displayName: msg.displayName as string,
        color: msg.color as string,
      });
      boardStore.setUsers(users);
      return;
    }

    if (msg.type === 'userLeft') {
      const leftId = msg.clientId as string;
      boardStore.setUsers(boardStore.users.filter((u) => u.clientId !== leftId));
      return;
    }
  }

  private applyOp(opType: string, payload: Record<string, unknown>): void {
    const canvasStore = useCanvasStore.getState();

    switch (opType) {
      case 'createObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          canvasStore.addObject({
            id: objectId,
            type: (payload.objectType as string) ?? 'unknown',
            zIndex: canvasStore.objects.size,
            data: payload.data as Record<string, unknown> ?? {},
          });
        }
        break;
      }
      case 'updateObject': {
        const objectId = payload.objectId as string;
        const patch = payload.patch as Record<string, unknown>;
        if (objectId && patch) {
          const existing = canvasStore.objects.get(objectId);
          if (existing) {
            canvasStore.updateObject(objectId, {
              data: { ...existing.data, ...patch },
            });
          }
        }
        break;
      }
      case 'deleteObject': {
        const objectId = payload.objectId as string;
        if (objectId) {
          canvasStore.removeObject(objectId);
        }
        break;
      }
      case 'convertInkToText': {
        const inkIds = payload.inkObjectIds as string[];
        const keepInk = payload.keepInk as boolean;
        if (inkIds && !keepInk) {
          for (const id of inkIds) {
            canvasStore.removeObject(id);
          }
        }
        const newTextId = payload.newTextObjectId as string;
        if (newTextId) {
          canvasStore.addObject({
            id: newTextId,
            type: 'text',
            zIndex: canvasStore.objects.size,
            data: {
              text: payload.chosenText,
              bbox: payload.bbox,
              style: payload.style,
            },
          });
        }
        break;
      }
    }
  }

  /** Called on reconnect: resend pending outbox ops. */
  async onReconnect(): Promise<void> {
    await this.outbox.resendPending();
  }
}
