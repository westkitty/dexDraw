import { usePresenceStore } from './PresenceProvider';

/**
 * Renders remote cursors as an overlay on the canvas.
 * Lightweight component that reads from presence store.
 */
export function CursorOverlay() {
  const cursors = usePresenceStore((s) => s.remoteCursors);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.clientId}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            transition: 'left 80ms linear, top 80ms linear',
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
          >
            <path
              d="M0 0L12 10L5 10L8 18L5 19L2 11L0 14Z"
              fill={cursor.color}
            />
          </svg>
          {/* Name label */}
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              background: cursor.color,
              color: '#fff',
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
}
