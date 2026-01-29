import { useCallback, useEffect } from 'react';
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