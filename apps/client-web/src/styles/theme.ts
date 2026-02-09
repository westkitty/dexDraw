/** Dark mode high-contrast color tokens. */
export const theme = {
  bg: '#1a1a2e',
  surface: '#16213e',
  surfaceHover: '#1a2744',
  border: '#2a3a5c',
  text: '#e0e0e0',
  textMuted: '#8892a4',
  accent: '#4a9eff',
  accentHover: '#6bb3ff',
  danger: '#ff4d6a',
  success: '#4ade80',
  warning: '#fbbf24',
  canvasBg: '#1e1e2e',
  gridDot: '#2a2a3e',
  inkDefault: '#e0e0e0',
  toolbar: '#0f1729',
  statusBar: '#0a0f1e',
} as const;

export type ThemeColors = typeof theme;
