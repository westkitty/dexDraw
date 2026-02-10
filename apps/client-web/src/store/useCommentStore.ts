import { enableMapSet } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

enableMapSet();

export interface CommentThread {
  id: string;
  anchorX: number;
  anchorY: number;
  anchorObjectId: string | null;
  resolved: boolean;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  threadId: string;
  author: string;
  text: string;
  createdAt: number;
}

interface CommentState {
  threads: Map<string, CommentThread>;
  activeThreadId: string | null;

  addThread: (thread: CommentThread) => void;
  removeThread: (id: string) => void;
  addReply: (threadId: string, reply: CommentReply) => void;
  resolveThread: (id: string) => void;
  unresolveThread: (id: string) => void;
  setActiveThread: (id: string | null) => void;
  updateThreadAnchor: (id: string, x: number, y: number) => void;
}

export const useCommentStore = create<CommentState>()(
  immer((set) => ({
    threads: new Map(),
    activeThreadId: null,

    addThread: (thread) =>
      set((state) => {
        state.threads.set(thread.id, thread);
      }),

    removeThread: (id) =>
      set((state) => {
        state.threads.delete(id);
        if (state.activeThreadId === id) {
          state.activeThreadId = null;
        }
      }),

    addReply: (threadId, reply) =>
      set((state) => {
        const thread = state.threads.get(threadId);
        if (thread) {
          thread.replies.push(reply);
        }
      }),

    resolveThread: (id) =>
      set((state) => {
        const thread = state.threads.get(id);
        if (thread) {
          thread.resolved = true;
        }
      }),

    unresolveThread: (id) =>
      set((state) => {
        const thread = state.threads.get(id);
        if (thread) {
          thread.resolved = false;
        }
      }),

    setActiveThread: (id) =>
      set((state) => {
        state.activeThreadId = id;
      }),

    updateThreadAnchor: (id, x, y) =>
      set((state) => {
        const thread = state.threads.get(id);
        if (thread) {
          thread.anchorX = x;
          thread.anchorY = y;
        }
      }),
  })),
);
