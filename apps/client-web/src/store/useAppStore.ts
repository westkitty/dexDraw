import { create } from 'zustand';

export type Tool = 'pen' | 'select' | 'shape' | 'text' | 'eraser' | 'laser' | 'lasso';

interface AppState {
  activeTool: Tool;
  strokeColor: string;
  strokeWidth: number;
  zoom: number;
  panX: number;
  panY: number;

  setTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  activeTool: 'pen',
  strokeColor: '#e0e0e0',
  strokeWidth: 3,
  zoom: 1,
  panX: 0,
  panY: 0,

  setTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (x, y) => set({ panX: x, panY: y }),
}));
