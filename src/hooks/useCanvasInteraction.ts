import { useCallback, useEffect, useRef } from 'react';
import useCanvasStore from '../store/canvasStore';

export const useClipboard = () => {
  const handlePaste = useCanvasStore((state) => state.handlePaste);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        handlePaste(text);
      }
    } catch (error) {
      console.warn('Could not read clipboard:', error);
    }
  }, [handlePaste]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handleClipboardPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClipboardPaste]);

  return { handleClipboardPaste };
};

export const useKeyboardShortcuts = () => {
  const {
    selectedNodeIds,
    removeNode,
    clearSelection,
    exportState,
    setMode,
    mode,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected nodes
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          event.preventDefault();
          selectedNodeIds.forEach(removeNode);
        }
      }

      // Escape to clear selection and reset mode
      if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
        setMode('select');
      }

      // Export canvas (Ctrl/Cmd + E)
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        const state = exportState();
        console.log('Canvas State:', state);
        // You can implement download here if needed
      }

      // Mode switching
      if (event.key === 's' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setMode('select');
      }

      if (event.key === 'c' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setMode('connect');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, removeNode, clearSelection, exportState, setMode, mode]);
};

export const useCanvasInteraction = () => {
  const {
    zoom,
    panOffset,
    setZoom,
    setPanOffset,
    clearSelection,
  } = useCanvasStore();

  const isDragging = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Zoom
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    } else {
      // Pan
      setPanOffset({
        x: panOffset.x - event.deltaX,
        y: panOffset.y - event.deltaY,
      });
    }
  }, [zoom, panOffset, setZoom, setPanOffset]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      // Middle mouse button or Shift+left click for panning
      isDragging.current = true;
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
      event.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging.current) {
      const deltaX = event.clientX - lastPanPoint.current.x;
      const deltaY = event.clientY - lastPanPoint.current.y;
      
      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      });
      
      lastPanPoint.current = { x: event.clientX, y: event.clientY };
    }
  }, [panOffset, setPanOffset]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    // Clear selection when clicking on empty canvas
    if (event.target === event.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
  };
};