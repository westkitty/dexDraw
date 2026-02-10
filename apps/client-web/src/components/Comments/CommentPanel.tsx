import type React from 'react';
import { useCallback, useState } from 'react';
import { useCommentStore } from '../../store/useCommentStore';

interface CommentPanelProps {
  onAddReply: (threadId: string, text: string) => void;
  onResolve: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({ onAddReply, onResolve, onDelete }) => {
  const activeThreadId = useCommentStore((s) => s.activeThreadId);
  const threads = useCommentStore((s) => s.threads);
  const setActiveThread = useCommentStore((s) => s.setActiveThread);
  const [replyText, setReplyText] = useState('');

  const thread = activeThreadId ? threads.get(activeThreadId) : null;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeThreadId || !replyText.trim()) return;
      onAddReply(activeThreadId, replyText.trim());
      setReplyText('');
    },
    [activeThreadId, replyText, onAddReply],
  );

  if (!thread) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 260,
        top: 60,
        width: 280,
        maxHeight: 400,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 12,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Comment Thread</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => onResolve(thread.id)}
            style={{
              background: 'transparent',
              color: thread.resolved ? 'var(--accent)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            {thread.resolved ? 'Reopen' : 'Resolve'}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(thread.id);
              setActiveThread(null);
            }}
            style={{
              background: 'transparent',
              color: '#ff6b6b',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setActiveThread(null)}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            x
          </button>
        </div>
      </div>

      {thread.replies.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No replies yet</div>
      )}

      {thread.replies.map((reply) => (
        <div
          key={reply.id}
          style={{
            padding: '6px 8px',
            background: 'var(--bg)',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 500, color: 'var(--accent)', marginBottom: 2 }}>
            {reply.author}
          </div>
          <div style={{ color: 'var(--text)' }}>{reply.text}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>
            {new Date(reply.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 4 }}>
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Add a reply..."
          style={{
            flex: 1,
            background: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 12,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: replyText.trim() ? 'pointer' : 'not-allowed',
            fontSize: 12,
            opacity: replyText.trim() ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
