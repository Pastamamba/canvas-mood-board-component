import { useCallback, useRef } from 'react';

// Hook for creating keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  const activeRef = useRef(true);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!activeRef.current) return;

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    let shortcutKey = '';
    if (ctrl) shortcutKey += 'ctrl+';
    if (shift) shortcutKey += 'shift+';
    if (alt) shortcutKey += 'alt+';
    shortcutKey += key;

    const handler = shortcuts[shortcutKey];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }, [shortcuts]);

  const enable = useCallback(() => {
    activeRef.current = true;
    document.addEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const disable = useCallback(() => {
    activeRef.current = false;
    document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { enable, disable };
};

// Hook for context menu functionality
export const useContextMenu = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const showMenu = useCallback((event: React.MouseEvent, items: Array<{
    label: string;
    onClick: () => void;
    icon?: string;
    danger?: boolean;
  }>) => {
    event.preventDefault();
    event.stopPropagation();

    const menu = menuRef.current;
    if (!menu) return;

    menu.innerHTML = '';
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.display = 'block';

    items.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = `context-menu-item ${item.danger ? 'danger' : ''}`;
      menuItem.innerHTML = `${item.icon || ''} ${item.label}`;
      menuItem.onclick = () => {
        item.onClick();
        hideMenu();
      };
      menu.appendChild(menuItem);
    });

    // Hide menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        hideMenu();
        document.removeEventListener('click', handleClickOutside);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  }, []);

  const hideMenu = useCallback(() => {
    const menu = menuRef.current;
    if (menu) {
      menu.style.display = 'none';
    }
  }, []);

  return { menuRef, showMenu, hideMenu };
};

// Hook for managing node selection state
export const useNodeSelection = () => {
  const selectedNodes = useRef(new Set<string>());

  const selectNode = useCallback((nodeId: string) => {
    selectedNodes.current.add(nodeId);
  }, []);

  const deselectNode = useCallback((nodeId: string) => {
    selectedNodes.current.delete(nodeId);
  }, []);

  const clearSelection = useCallback(() => {
    selectedNodes.current.clear();
  }, []);

  const isSelected = useCallback((nodeId: string) => {
    return selectedNodes.current.has(nodeId);
  }, []);

  const getSelectedNodes = useCallback(() => {
    return Array.from(selectedNodes.current);
  }, []);

  return {
    selectNode,
    deselectNode,
    clearSelection,
    isSelected,
    getSelectedNodes
  };
};

// Hook for undo/redo functionality
export const useUndoRedo = <T>(initialState: T) => {
  const history = useRef<T[]>([initialState]);
  const currentIndex = useRef(0);

  const pushState = useCallback((state: T) => {
    // Remove any states after current index (when we were in the middle of history)
    history.current = history.current.slice(0, currentIndex.current + 1);
    
    // Add new state
    history.current.push(state);
    currentIndex.current = history.current.length - 1;

    // Limit history size to prevent memory issues
    if (history.current.length > 50) {
      history.current.shift();
      currentIndex.current--;
    }
  }, []);

  const undo = useCallback((): T | undefined => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
      return history.current[currentIndex.current];
    }
    return undefined;
  }, []);

  const redo = useCallback((): T | undefined => {
    if (currentIndex.current < history.current.length - 1) {
      currentIndex.current++;
      return history.current[currentIndex.current];
    }
    return undefined;
  }, []);

  const canUndo = useCallback(() => {
    return currentIndex.current > 0;
  }, []);

  const canRedo = useCallback(() => {
    return currentIndex.current < history.current.length - 1;
  }, []);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

// Hook for managing loading states
export const useAsyncOperation = () => {
  const loadingOperations = useRef(new Set<string>());

  const startOperation = useCallback((operationId: string) => {
    loadingOperations.current.add(operationId);
    return () => {
      loadingOperations.current.delete(operationId);
    };
  }, []);

  const isLoading = useCallback((operationId?: string) => {
    if (operationId) {
      return loadingOperations.current.has(operationId);
    }
    return loadingOperations.current.size > 0;
  }, []);

  return {
    startOperation,
    isLoading
  };
};

export default {
  useKeyboardShortcuts,
  useContextMenu,
  useNodeSelection,
  useUndoRedo,
  useAsyncOperation
};