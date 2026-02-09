import { useRef, useEffect, useCallback } from 'react';

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      // Draw background
      ctx.fillStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--canvas-bg')
        .trim();
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [resize]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          touchAction: 'none',
        }}
      />
    </div>
  );
}
