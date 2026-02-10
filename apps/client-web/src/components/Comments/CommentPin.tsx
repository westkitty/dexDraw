import type React from 'react';
import { useCallback } from 'react';
import type { CommentThread } from '../../store/useCommentStore';
import { useCommentStore } from '../../store/useCommentStore';

interface CommentPinProps {
  thread: CommentThread;
  zoom: number;
  panX: number;
  panY: number;
}

export const CommentPin: React.FC<CommentPinProps> = ({ thread, zoom, panX, panY }) => {
  const setActiveThread = useCommentStore((s) => s.setActiveThread);
  const activeThreadId = useCommentStore((s) => s.activeThreadId);

  const isActive = activeThreadId === thread.id;
  const screenX = thread.anchorX * zoom + panX;
  const screenY = thread.anchorY * zoom + panY;

  const handleClick = useCallback(() => {
    setActiveThread(isActive ? null : thread.id);
  }, [setActiveThread, isActive, thread.id]);

  return (
    <button
      type="button"
      style={{
        position: 'absolute',
        left: screenX - 12,
        top: screenY - 12,
        width: 24,
        height: 24,
        borderRadius: '50% 50% 50% 0',
        background: thread.resolved ? 'var(--text-muted)' : 'var(--accent)',
        border: isActive ? '2px solid #fff' : '2px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-45deg)',
        transition: 'transform 0.15s',
        zIndex: 500,
        fontSize: 11,
        color: '#fff',
        fontWeight: 600,
        padding: 0,
      }}
      onClick={handleClick}
      title={`Comment thread (${thread.replies.length} replies)`}
    >
      <span style={{ transform: 'rotate(45deg)' }}>{thread.replies.length}</span>
    </button>
  );
};
