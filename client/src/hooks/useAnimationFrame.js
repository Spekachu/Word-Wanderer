// hooks/useAnimationFrame.js
import { useRef, useEffect } from 'react';

export const useAnimationFrame = () => {
  const requestRef = useRef();
  const stateUpdatesRef = useRef([]);

  const queueUpdate = (updateFn) => {
    stateUpdatesRef.current.push(updateFn);
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(executeUpdates);
    }
  };

  const executeUpdates = () => {
    const updates = stateUpdatesRef.current;
    stateUpdatesRef.current = [];
    requestRef.current = null;
    
    // Execute all queued updates
    updates.forEach(update => update());
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return queueUpdate;
};