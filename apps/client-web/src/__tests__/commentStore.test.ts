import { beforeEach, describe, expect, it } from 'vitest';
import { useCommentStore } from '../store/useCommentStore';

describe('useCommentStore', () => {
  beforeEach(() => {
    useCommentStore.setState({
      threads: new Map(),
      activeThreadId: null,
    });
  });

  it('adds a thread', () => {
    useCommentStore.getState().addThread({
      id: 'thread-1',
      anchorX: 100,
      anchorY: 200,
      anchorObjectId: null,
      resolved: false,
      replies: [],
    });
    expect(useCommentStore.getState().threads.size).toBe(1);
  });

  it('removes a thread', () => {
    useCommentStore.getState().addThread({
      id: 'thread-1',
      anchorX: 0,
      anchorY: 0,
      anchorObjectId: null,
      resolved: false,
      replies: [],
    });
    useCommentStore.getState().removeThread('thread-1');
    expect(useCommentStore.getState().threads.size).toBe(0);
  });

  it('adds a reply to a thread', () => {
    useCommentStore.getState().addThread({
      id: 'thread-1',
      anchorX: 0,
      anchorY: 0,
      anchorObjectId: null,
      resolved: false,
      replies: [],
    });
    useCommentStore.getState().addReply('thread-1', {
      id: 'reply-1',
      threadId: 'thread-1',
      author: 'Alice',
      text: 'Great idea!',
      createdAt: Date.now(),
    });
    const thread = useCommentStore.getState().threads.get('thread-1');
    expect(thread?.replies).toHaveLength(1);
    expect(thread?.replies[0].text).toBe('Great idea!');
  });

  it('resolves and unresolves a thread', () => {
    useCommentStore.getState().addThread({
      id: 'thread-1',
      anchorX: 0,
      anchorY: 0,
      anchorObjectId: null,
      resolved: false,
      replies: [],
    });
    useCommentStore.getState().resolveThread('thread-1');
    expect(useCommentStore.getState().threads.get('thread-1')?.resolved).toBe(true);

    useCommentStore.getState().unresolveThread('thread-1');
    expect(useCommentStore.getState().threads.get('thread-1')?.resolved).toBe(false);
  });

  it('sets active thread and clears on remove', () => {
    useCommentStore.getState().addThread({
      id: 'thread-1',
      anchorX: 0,
      anchorY: 0,
      anchorObjectId: null,
      resolved: false,
      replies: [],
    });
    useCommentStore.getState().setActiveThread('thread-1');
    expect(useCommentStore.getState().activeThreadId).toBe('thread-1');

    useCommentStore.getState().removeThread('thread-1');
    expect(useCommentStore.getState().activeThreadId).toBe(null);
  });
});
