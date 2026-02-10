import { create } from 'zustand';

export interface Checkpoint {
  checkpointId: string;
  name: string | null;
  atServerSeq: number;
  createdBy: string;
  createdAt: string;
}

export interface ReplayOp {
  serverSeq: number;
  clientId: string;
  clientSeq: number;
  opType: string;
  payload: unknown;
}

interface CheckpointState {
  checkpoints: Checkpoint[];
  isReplaying: boolean;
  replaySeq: number; // current replay position
  replayOps: ReplayOp[];
  replaySnapshot: Record<string, Record<string, unknown>> | null;
  replayStartSeq: number;
  replayEndSeq: number;

  setCheckpoints: (cps: Checkpoint[]) => void;
  addCheckpoint: (cp: Checkpoint) => void;
  setReplaying: (replaying: boolean) => void;
  setReplaySeq: (seq: number) => void;
  setReplayData: (data: {
    ops: ReplayOp[];
    snapshot: Record<string, Record<string, unknown>> | null;
    startSeq: number;
    endSeq: number;
  }) => void;
  clearReplay: () => void;
}

export const useCheckpointStore = create<CheckpointState>()((set) => ({
  checkpoints: [],
  isReplaying: false,
  replaySeq: 0,
  replayOps: [],
  replaySnapshot: null,
  replayStartSeq: 0,
  replayEndSeq: 0,

  setCheckpoints: (cps) => set({ checkpoints: cps }),
  addCheckpoint: (cp) => set((state) => ({ checkpoints: [...state.checkpoints, cp] })),
  setReplaying: (replaying) => set({ isReplaying: replaying }),
  setReplaySeq: (seq) => set({ replaySeq: seq }),
  setReplayData: (data) =>
    set({
      replayOps: data.ops,
      replaySnapshot: data.snapshot,
      replayStartSeq: data.startSeq,
      replayEndSeq: data.endSeq,
      replaySeq: data.startSeq,
    }),
  clearReplay: () =>
    set({
      isReplaying: false,
      replaySeq: 0,
      replayOps: [],
      replaySnapshot: null,
      replayStartSeq: 0,
      replayEndSeq: 0,
    }),
}));
