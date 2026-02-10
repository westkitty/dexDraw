/** Messages from main thread -> worker */
export type WorkerInbound =
  | {
      type: 'connect';
      url: string;
      roomId: string;
      clientId: string;
      displayName: string;
      lastSeenServerSeq: number;
    }
  | { type: 'send'; data: string }
  | { type: 'disconnect' };

/** Messages from worker -> main thread */
export type WorkerOutbound =
  | { type: 'connected' }
  | { type: 'disconnected'; reason: string }
  | { type: 'message'; data: string }
  | { type: 'status'; state: ConnectionState; transport: TransportType; rtt: number }
  | { type: 'error'; message: string };

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'fallback_polling';
export type TransportType = 'websocket' | 'longpoll' | 'none';
