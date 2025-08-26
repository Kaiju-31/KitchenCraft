import { useEffect } from 'react';

interface KeyboardCallbacks {
  onEnter?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useKeyboard = ({ onEnter, onEscape, enabled = true }: KeyboardCallbacks) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnter, onEscape, enabled]);
};

export default useKeyboard;