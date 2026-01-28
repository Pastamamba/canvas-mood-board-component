import { useCallback } from 'react';

// Debounce function for input performance
export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  
  return useCallback((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Throttle function for scroll/resize events
export const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  let lastCall = 0;
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  }, [callback, delay]);
};

// Memoized selector hook for complex state
export const useShallowSelector = <T, U>(
  selector: (state: T) => U,
  equalityFn: (prev: U, next: U) => boolean = Object.is
) => {
  // This would be implemented with the actual store
  return selector;
};