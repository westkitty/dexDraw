import { jsPDF } from 'jspdf';
import type { CanvasObject } from '../store/useCanvasStore';

/**
 * Export the board as a PDF containing:
 * 1. Board image (from canvas)
 * 2. List of all text objects (extracted text)
 * 3. Comments summary
 */
export async function exportPdf(
  canvasEl: HTMLCanvasElement,
  objects: Map<string, CanvasObject>,
  boardName: string,
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 60);
  doc.text(boardName || 'dexDraw Board', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 28);

  // Board image from canvas
  try {
    const imgData = canvasEl.toDataURL('image/png');
    const imgWidth = pageWidth - 28;
    const imgHeight = (canvasEl.height / canvasEl.width) * imgWidth;
    const maxImgHeight = pageHeight - 50;

    doc.addImage(imgData, 'PNG', 14, 35, imgWidth, Math.min(imgHeight, maxImgHeight));
  } catch {
    doc.setFontSize(12);
    doc.text('(Board image could not be captured)', 14, 50);
  }

  // Extract text objects
  addTextContent(doc, objects, pageWidth, pageHeight);
}

function addTextContent(
  doc: jsPDF,
  objects: Map<string, CanvasObject>,
  pageWidth: number,
  pageHeight: number,
) {
  const textObjects = getTextObjects(objects);
  if (textObjects.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 60);
    doc.text('Text Content', 14, 20);

    let yPos = 30;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    for (const textObj of textObjects) {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      const text = (textObj.data.text as string) ?? (textObj.data.chosenText as string) ?? '';
      const label = (textObj.data.label as string) ?? '';
      const displayText = label ? `${label}: ${text}` : text;

      if (displayText) {
        const lines = doc.splitTextToSize(displayText, pageWidth - 28);
        doc.text(lines, 14, yPos);
        yPos += lines.length * 5 + 4;
      }
    }
  }

  return doc.output('blob');
}

function getTextObjects(objects: Map<string, CanvasObject>): CanvasObject[] {
  return Array.from(objects.values())
    .filter((obj) => obj.type === 'text' || obj.type === 'shape')
    .sort((a, b) => {
      const ay = (a.data.y as number) ?? 0;
      const by = (b.data.y as number) ?? 0;
      if (Math.abs(ay - by) < 50) {
        const ax = (a.data.x as number) ?? 0;
        const bx = (b.data.x as number) ?? 0;
        return ax - bx;
      }
      return ay - by;
    });
}
