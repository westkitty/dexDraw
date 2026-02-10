import type React from 'react';
import { useCallback, useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

/**
 * Parking Lot: off-canvas sidebar region where users can "park" items
 * for later discussion. Items parked here are regular canvas objects
 * with a `parked: true` data flag.
 */

export const ParkingLot: React.FC = () => {
  const objects = useCanvasStore((s) => s.objects);
  const [isExpanded, setIsExpanded] = useState(false);

  const parkedItems = Array.from(objects.values()).filter((obj) => obj.data?.parked === true);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: 8,
      }}
    >
      <button
        type="button"
        onClick={toggleExpand}
        style={{
          background: 'transparent',
          color: 'var(--text)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          width: '100%',
          padding: '4px 0',
        }}
      >
        <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.15s' }}>
          ▸
        </span>
        Parking Lot ({parkedItems.length})
      </button>

      {isExpanded && (
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginTop: 4,
          }}
        >
          {parkedItems.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: '4px 0' }}>
              Drag items here to park them for later discussion
            </div>
          )}
          {parkedItems.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '4px 8px',
                background: 'var(--bg)',
                borderRadius: 4,
                fontSize: 11,
                color: 'var(--text)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                {item.type} &middot; {item.id.slice(0, 8)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>parked</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
