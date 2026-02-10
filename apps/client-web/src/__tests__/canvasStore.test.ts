import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../store/useCanvasStore';

describe('useCanvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      objects: new Map(),
      selectedIds: new Set(),
    });
  });

  it('adds an object', () => {
    useCanvasStore.getState().addObject({
      id: 'obj-1',
      type: 'stroke',
      zIndex: 0,
      data: { points: [] },
    });
    expect(useCanvasStore.getState().objects.size).toBe(1);
  });

  it('updates an object', () => {
    useCanvasStore.getState().addObject({
      id: 'obj-1',
      type: 'stroke',
      zIndex: 0,
      data: { color: 'red' },
    });
    useCanvasStore.getState().updateObject('obj-1', {
      data: { color: 'blue' },
    });
    const obj = useCanvasStore.getState().objects.get('obj-1');
    expect(obj?.data.color).toBe('blue');
  });

  it('removes an object', () => {
    useCanvasStore.getState().addObject({
      id: 'obj-1',
      type: 'stroke',
      zIndex: 0,
      data: {},
    });
    useCanvasStore.getState().removeObject('obj-1');
    expect(useCanvasStore.getState().objects.size).toBe(0);
  });

  it('removes from selection when object is deleted', () => {
    useCanvasStore.getState().addObject({
      id: 'obj-1',
      type: 'stroke',
      zIndex: 0,
      data: {},
    });
    useCanvasStore.getState().setSelection(['obj-1']);
    expect(useCanvasStore.getState().selectedIds.has('obj-1')).toBe(true);

    useCanvasStore.getState().removeObject('obj-1');
    expect(useCanvasStore.getState().selectedIds.has('obj-1')).toBe(false);
  });

  it('sets and clears selection', () => {
    useCanvasStore.getState().setSelection(['a', 'b', 'c']);
    expect(useCanvasStore.getState().selectedIds.size).toBe(3);

    useCanvasStore.getState().clearSelection();
    expect(useCanvasStore.getState().selectedIds.size).toBe(0);
  });

  it('handles multiple objects', () => {
    for (let i = 0; i < 10; i++) {
      useCanvasStore.getState().addObject({
        id: `obj-${i}`,
        type: 'stroke',
        zIndex: i,
        data: {},
      });
    }
    expect(useCanvasStore.getState().objects.size).toBe(10);

    useCanvasStore.getState().removeObject('obj-5');
    expect(useCanvasStore.getState().objects.size).toBe(9);
    expect(useCanvasStore.getState().objects.has('obj-5')).toBe(false);
  });
});
