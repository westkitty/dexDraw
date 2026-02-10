import { encodeEnvelope, PROTOCOL_VERSION } from '@dexdraw/shared-protocol';
import { v4 as uuid } from 'uuid';
import * as Y from 'yjs';
import { transportManager } from '../collab/TransportManager';
import { useBoardStore } from '../store/useBoardStore';

/**
 * Manages Y.Doc instances per text object.
 * Each text object gets its own Y.Doc for collaborative editing.
 * Yjs updates flow over the same WebSocket, multiplexed by objectId.
 */
export class YjsProvider {
  private docs = new Map<string, Y.Doc>();
  private roomId: string;
  private clientId: string;

  constructor(roomId: string, clientId: string) {
    this.roomId = roomId;
    this.clientId = clientId;
  }

  /** Get or create a Y.Doc for a text object. */
  getDoc(textObjectId: string): Y.Doc {
    let doc = this.docs.get(textObjectId);
    if (!doc) {
      doc = new Y.Doc();
      this.docs.set(textObjectId, doc);

      // Listen for local updates and send them
      doc.on('update', (update: Uint8Array, origin: unknown) => {
        if (origin === 'remote') return; // Don't echo remote updates

        const serverSeqRef = useBoardStore.getState().lastSeenServerSeq;
        const envelope = {
          v: PROTOCOL_VERSION as 1,
          type: 'hybrid' as const,
          roomId: this.roomId,
          clientId: this.clientId,
          msgId: uuid(),
          ts: Date.now(),
          payload: {
            kind: 'textCRDT' as const,
            textObjectId,
            update: btoa(String.fromCharCode(...update)),
            serverSeqRef,
          },
        };
        transportManager.send(encodeEnvelope(envelope));
      });
    }
    return doc;
  }

  /** Get the Y.Text for a text object (creates if needed). */
  getText(textObjectId: string): Y.Text {
    const doc = this.getDoc(textObjectId);
    return doc.getText('content');
  }

  /** Apply a remote Yjs update to a document. */
  applyRemoteUpdate(textObjectId: string, base64Update: string): void {
    const doc = this.getDoc(textObjectId);
    const binaryStr = atob(base64Update);
    const update = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      update[i] = binaryStr.charCodeAt(i);
    }
    Y.applyUpdate(doc, update, 'remote');
  }

  /** Destroy a Y.Doc when text object is deleted. */
  destroyDoc(textObjectId: string): void {
    const doc = this.docs.get(textObjectId);
    if (doc) {
      doc.destroy();
      this.docs.delete(textObjectId);
    }
  }

  /** Destroy all docs (on disconnect). */
  destroyAll(): void {
    for (const doc of this.docs.values()) {
      doc.destroy();
    }
    this.docs.clear();
  }
}
