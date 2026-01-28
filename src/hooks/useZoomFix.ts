import { useEffect, useCallback, useRef } from 'react';

// Hook to handle smooth zoom behavior
export const useSmoothZoom = () => {
  const lastScrollTime = useRef(0);
  const scrollDirection = useRef(0);
  
  const handleWheel = useCallback((event: WheelEvent) => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime.current;
    
    // Prevent rapid scroll changes that cause lag
    if (timeDelta < 16) { // ~60fps throttling
      event.preventDefault();
      return false;
    }
    
    // Track consistent scroll direction
    const newDirection = event.deltaY > 0 ? 1 : -1;
    if (scrollDirection.current !== newDirection && timeDelta < 100) {
      // Ignore rapid direction changes within 100ms
      event.preventDefault();
      return false;
    }
    
    scrollDirection.current = newDirection;
    lastScrollTime.current = now;
    
    return true;
  }, []);
  
  const enableSmoothZoom = useCallback((container: HTMLElement) => {
    const wheelHandler = (e: WheelEvent) => {
      if (!handleWheel(e)) {
        return;
      }
      // Let React Flow handle the zoom
    };
    
    container.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);
  
  return { enableSmoothZoom };
};

// Hook for preventing scroll conflicts
export const useScrollPrevention = () => {
  useEffect(() => {
    // Prevent page scroll when interacting with canvas
    const preventScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we're scrolling on the React Flow canvas
      if (target.closest('.react-flow') || target.closest('.canvas-container')) {
        // Only prevent default if we're not in a node input field
        if (!target.closest('input') && !target.closest('textarea')) {
          e.preventDefault();
          return false;
        }
      }
    };
    
    // Add passive: false to be able to preventDefault
    document.addEventListener('wheel', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventScroll);
    };
  }, []);
};

export default {
  useSmoothZoom,
  useScrollPrevention
};