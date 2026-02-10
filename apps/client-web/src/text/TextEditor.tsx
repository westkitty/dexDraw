import { useCallback, useEffect, useRef } from 'react';
import type * as Y from 'yjs';

interface TextEditorProps {
  yText: Y.Text;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  onBlur: () => void;
}

/**
 * In-place text editor overlay positioned on canvas.
 * Binds a textarea to a Y.Text for collaborative editing.
 */
export function TextEditor({
  yText,
  x,
  y,
  width,
  height,
  fontSize,
  color,
  onBlur,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync Y.Text -> textarea
  const syncFromYjs = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = yText.toString();
    }
  }, [yText]);

  useEffect(() => {
    syncFromYjs();

    const observer = () => syncFromYjs();
    yText.observe(observer);

    // Focus the textarea
    textareaRef.current?.focus();

    return () => {
      yText.unobserve(observer);
    };
  }, [yText, syncFromYjs]);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newValue = textarea.value;
    const currentValue = yText.toString();

    // Simple diff: delete all and insert new
    // A more sophisticated diff would preserve cursor positions better
    if (newValue !== currentValue) {
      yText.delete(0, currentValue.length);
      yText.insert(0, newValue);
    }
  }, [yText]);

  return (
    <textarea
      ref={textareaRef}
      onInput={handleInput}
      onBlur={onBlur}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: Math.max(width, 100),
        height: Math.max(height, 30),
        fontSize,
        color,
        background: 'rgba(30, 30, 46, 0.9)',
        border: '1px solid var(--accent)',
        borderRadius: 2,
        padding: '4px 6px',
        resize: 'both',
        outline: 'none',
        fontFamily: 'var(--font-sans)',
        overflow: 'auto',
      }}
    />
  );
}
