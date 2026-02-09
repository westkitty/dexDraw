import { create } from 'zustand';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
export type TransportMode = 'websocket' | 'longpoll' | 'none';

interface BoardUser {
  clientId: string;
  displayName: string;
  color: string;
}

interface BoardState {
  boardId: string | null;
  connectionStatus: ConnectionStatus;
  transportMode: TransportMode;
  ping: number;
  lastSeenServerSeq: number;
  users: BoardUser[];

  setBoardId: (id: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setTransportMode: (mode: TransportMode) => void;
  setPing: (ms: number) => void;
  setLastSeenServerSeq: (seq: number) => void;
  setUsers: (users: BoardUser[]) => void;
}

export const useBoardStore = create<BoardState>()((set) => ({
  boardId: null,
  connectionStatus: 'disconnected',
  transportMode: 'none',
  ping: 0,
  lastSeenServerSeq: 0,
  users: [],

  setBoardId: (id) => set({ boardId: id }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setTransportMode: (mode) => set({ transportMode: mode }),
  setPing: (ms) => set({ ping: ms }),
  setLastSeenServerSeq: (seq) => set({ lastSeenServerSeq: seq }),
  setUsers: (users) => set({ users }),
}));
