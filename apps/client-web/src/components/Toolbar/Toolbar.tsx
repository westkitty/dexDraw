import { type Tool, useAppStore } from '../../store/useAppStore';
import { ToolButton } from './ToolButton';

const tools: { id: Tool; label: string }[] = [
  { id: 'pen', label: 'Pen' },
  { id: 'select', label: 'Select' },
  { id: 'shape', label: 'Shape' },
  { id: 'text', label: 'Text' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'lasso', label: 'Lasso' },
  { id: 'laser', label: 'Laser' },
];

export function Toolbar() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setTool = useAppStore((s) => s.setTool);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        background: 'var(--toolbar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 15,
          marginRight: 12,
          color: 'var(--accent)',
        }}
      >
        dexDraw
      </span>
      {tools.map((t) => (
        <ToolButton
          key={t.id}
          label={t.label}
          active={activeTool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}
    </div>
  );
}
