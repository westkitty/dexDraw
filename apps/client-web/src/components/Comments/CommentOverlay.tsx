import type React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCommentStore } from '../../store/useCommentStore';
import { CommentPin } from './CommentPin';

export const CommentOverlay: React.FC = () => {
  const threads = useCommentStore((s) => s.threads);
  const zoom = useAppStore((s) => s.zoom);
  const panX = useAppStore((s) => s.panX);
  const panY = useAppStore((s) => s.panY);

  const threadList = Array.from(threads.values());

  if (threadList.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {threadList.map((thread) => (
        <div key={thread.id} style={{ pointerEvents: 'auto' }}>
          <CommentPin thread={thread} zoom={zoom} panX={panX} panY={panY} />
        </div>
      ))}
    </div>
  );
};
