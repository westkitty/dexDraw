import type { WorkerInbound, WorkerOutbound } from '../workers/WorkerProtocol';
import { useBoardStore } from '../store/useBoardStore';

type MessageHandler = (data: string) => void;

export class TransportManager {
  private worker: Worker | null = null;
  private messageHandlers: MessageHandler[] = [];

  connect(config: {
    url: string;
    roomId: string;
    clientId: string;
    displayName: string;
    lastSeenServerSeq: number;
  }): void {
    this.disconnect();

    this.worker = new Worker(
      new URL('../workers/connection.worker.ts', import.meta.url),
      { type: 'module' },
    );

    this.worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (err) => {
      console.error('Connection worker error:', err);
    };

    const msg: WorkerInbound = { type: 'connect', ...config };
    this.worker.postMessage(msg);
  }

  send(data: string): void {
    if (this.worker) {
      const msg: WorkerInbound = { type: 'send', data };
      this.worker.postMessage(msg);
    }
  }

  disconnect(): void {
    if (this.worker) {
      const msg: WorkerInbound = { type: 'disconnect' };
      this.worker.postMessage(msg);
      this.worker.terminate();
      this.worker = null;
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  private handleWorkerMessage(msg: WorkerOutbound): void {
    const store = useBoardStore.getState();

    switch (msg.type) {
      case 'connected':
        store.setConnectionStatus('connected');
        break;

      case 'disconnected':
        store.setConnectionStatus('disconnected');
        break;

      case 'status':
        if (msg.state === 'reconnecting') {
          store.setConnectionStatus('reconnecting');
        } else if (msg.state === 'connecting') {
          store.setConnectionStatus('connecting');
        }
        store.setTransportMode(msg.transport === 'longpoll' ? 'longpoll' : msg.transport === 'websocket' ? 'websocket' : 'none');
        store.setPing(msg.rtt);
        break;

      case 'message':
        for (const handler of this.messageHandlers) {
          handler(msg.data);
        }
        break;

      case 'error':
        console.error('Transport error:', msg.message);
        break;
    }
  }
}

// Singleton
export const transportManager = new TransportManager();
