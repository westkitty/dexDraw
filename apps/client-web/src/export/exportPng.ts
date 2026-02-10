import type { CanvasObject } from '../store/useCanvasStore';

/**
 * Export the current board as a PNG blob.
 *
 * @param mode - 'viewport' exports what's visible, 'full' exports the entire board
 * @param canvasEl - The background canvas element
 * @param objects - All canvas objects (for computing full board bounds)
 * @param zoom - Current zoom level
 * @param panX - Current pan X offset
 * @param panY - Current pan Y offset
 */
export function exportPng(
  mode: 'viewport' | 'full',
  canvasEl: HTMLCanvasElement,
  objects: Map<string, CanvasObject>,
  zoom: number,
  panX: number,
  panY: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (mode === 'viewport') {
      // Export what's currently visible on the canvas
      canvasEl.toBlob(
        (blob) => resolve(blob),
        'image/png',
      );
    } else {
      // Compute full board bounds from all objects
      const bounds = computeBoardBounds(objects);
      if (!bounds) {
        // Empty board: export viewport
        canvasEl.toBlob((blob) => resolve(blob), 'image/png');
        return;
      }

      // Create an offscreen canvas covering the full board
      const padding = 40;
      const width = bounds.maxX - bounds.minX + padding * 2;
      const height = bounds.maxY - bounds.minY + padding * 2;

      const offscreen = document.createElement('canvas');
      offscreen.width = Math.min(width, 8192); // cap at 8K
      offscreen.height = Math.min(height, 8192);

      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Fill background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);

      // Draw from the source canvas with appropriate transform
      ctx.drawImage(
        canvasEl,
        0,
        0,
        canvasEl.width,
        canvasEl.height,
        (panX - bounds.minX + padding) * (offscreen.width / width),
        (panY - bounds.minY + padding) * (offscreen.height / height),
        canvasEl.width * (offscreen.width / width),
        canvasEl.height * (offscreen.height / height),
      );

      offscreen.toBlob((blob) => resolve(blob), 'image/png');
    }
  });
}

function computeBoardBounds(
  objects: Map<string, CanvasObject>,
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (objects.size === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const obj of objects.values()) {
    const data = obj.data;
    const x = (data.x as number) ?? 0;
    const y = (data.y as number) ?? 0;
    const w = (data.width as number) ?? 100;
    const h = (data.height as number) ?? 100;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }

  return { minX, minY, maxX, maxY };
}

/** Trigger a browser download for a blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
