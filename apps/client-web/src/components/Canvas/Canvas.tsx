import { useCallback, useEffect, useRef } from 'react';
import { InkEngine } from '../../engine/InkEngine';
import { InputEngine } from '../../engine/InputEngine';
import { CanvasRenderer } from '../../renderer/CanvasRenderer';
import { useAppStore } from '../../store/useAppStore';

// Module-level singletons (survive re-renders)
const inputEngine = new InputEngine();
const inkEngine = new InkEngine();
const renderer = new CanvasRenderer();

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeTool = useAppStore((s) => s.activeTool);

  const resize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    for (const canvas of [bgCanvasRef.current, activeCanvasRef.current]) {
      if (!canvas) continue;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    renderer.invalidate();
  }, []);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const activeCanvas = activeCanvasRef.current;
    if (!bgCanvas || !activeCanvas) return;

    renderer.attach(bgCanvas, activeCanvas, inkEngine);

    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      renderer.detach();
    };
  }, [resize]);

  // Attach input engine when tool is 'pen'
  useEffect(() => {
    const activeCanvas = activeCanvasRef.current;
    if (!activeCanvas) return;

    if (activeTool === 'pen') {
      inputEngine.attach(activeCanvas, inkEngine);
      return () => inputEngine.detach();
    }
  }, [activeTool]);

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    touchAction: 'none',
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Layer 0+1: Background + committed objects */}
      <canvas ref={bgCanvasRef} style={canvasStyle} />
      {/* Layer 2+3: Active stroke + cursors */}
      <canvas ref={activeCanvasRef} style={canvasStyle} />
    </div>
  );
}
