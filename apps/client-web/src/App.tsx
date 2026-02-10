import { Canvas } from './components/Canvas/Canvas';
import { CommentOverlay } from './components/Comments/CommentOverlay';
import { CommentPanel } from './components/Comments/CommentPanel';
import { ParkingLot } from './components/ParkingLot/ParkingLot';
import { StatusBar } from './components/StatusBar';
import { TimelineScrubber } from './components/Timeline/TimelineScrubber';
import { Toolbar } from './components/Toolbar/Toolbar';

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
        <div style={{ position: 'relative', flex: 1 }}>
          <Canvas />
          <CommentOverlay />
        </div>
        {/* Right sidebar */}
        <div
          style={{
            width: 240,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: 12,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Properties</div>
          <ParkingLot />
        </div>
      </div>
      <CommentPanel onAddReply={() => {}} onResolve={() => {}} onDelete={() => {}} />
      <TimelineScrubber />
      <StatusBar />
    </div>
  );
}
