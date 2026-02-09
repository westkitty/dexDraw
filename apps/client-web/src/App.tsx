import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StatusBar } from './components/StatusBar';

export function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Canvas />
        {/* Right sidebar placeholder */}
        <div
          style={{
            width: 240,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: 12,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Properties</div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
