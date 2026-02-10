import type React from 'react';
import { useCallback, useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useCommentStore } from '../../store/useCommentStore';
import { useBoardStore } from '../../store/useBoardStore';
import { exportPng, downloadBlob } from '../../export/exportPng';
import { exportPdf } from '../../export/exportPdf';
import { exportMarkdown, downloadMarkdown } from '../../export/exportMarkdown';

interface ExportMenuProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ canvasRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPng = useCallback(
    async (mode: 'viewport' | 'full') => {
      if (!canvasRef.current) return;
      setExporting(true);
      try {
        const objects = useCanvasStore.getState().objects;
        const blob = await exportPng(mode, canvasRef.current, objects, 1, 0, 0);
        if (blob) {
          downloadBlob(blob, `dexdraw-${mode}-${Date.now()}.png`);
        }
      } finally {
        setExporting(false);
        setIsOpen(false);
      }
    },
    [canvasRef],
  );

  const handleExportPdf = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const objects = useCanvasStore.getState().objects;
      const boardId = useBoardStore.getState().boardId;
      const blob = await exportPdf(canvasRef.current, objects, boardId ?? 'Board');
      downloadBlob(blob, `dexdraw-${Date.now()}.pdf`);
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  }, [canvasRef]);

  const handleExportMarkdown = useCallback(() => {
    const objects = useCanvasStore.getState().objects;
    const threads = useCommentStore.getState().threads;
    const boardId = useBoardStore.getState().boardId;
    const md = exportMarkdown(objects, threads, boardId ?? 'Board');
    downloadMarkdown(md, `dexdraw-summary-${Date.now()}.md`);
    setIsOpen(false);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '4px 10px',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {exporting ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 4,
            minWidth: 180,
            zIndex: 1001,
            marginTop: 4,
          }}
        >
          <ExportItem label="PNG (Viewport)" onClick={() => handleExportPng('viewport')} />
          <ExportItem label="PNG (Full Board)" onClick={() => handleExportPng('full')} />
          <ExportItem label="PDF (Board + Text)" onClick={handleExportPdf} />
          <ExportItem label="Markdown Summary" onClick={handleExportMarkdown} />
        </div>
      )}
    </div>
  );
};

const ExportItem: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'transparent',
      color: 'var(--text)',
      border: 'none',
      borderRadius: 4,
      padding: '6px 8px',
      cursor: 'pointer',
      fontSize: 12,
    }}
    onMouseEnter={(e) => {
      (e.target as HTMLElement).style.background = 'var(--hover)';
    }}
    onMouseLeave={(e) => {
      (e.target as HTMLElement).style.background = 'transparent';
    }}
  >
    {label}
  </button>
);
