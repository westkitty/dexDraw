import { useBoardStore } from '../store/useBoardStore';

const statusColors: Record<string, string> = {
  connected: 'var(--success)',
  connecting: 'var(--warning)',
  reconnecting: 'var(--warning)',
  disconnected: 'var(--danger)',
};

export function StatusBar() {
  const status = useBoardStore((s) => s.connectionStatus);
  const transport = useBoardStore((s) => s.transportMode);
  const ping = useBoardStore((s) => s.ping);
  const lastSeq = useBoardStore((s) => s.lastSeenServerSeq);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '4px 12px',
        background: 'var(--status-bar)',
        borderTop: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[status] ?? 'var(--text-muted)',
          }}
        />
        {status}
      </span>
      <span>Transport: {transport}</span>
      <span>Ping: {ping}ms</span>
      <span>ServerSeq: {lastSeq}</span>
    </div>
  );
}
