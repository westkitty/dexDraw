interface ToolButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function ToolButton({ label, active, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
