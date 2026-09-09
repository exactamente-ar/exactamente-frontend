import { useState, useEffect } from 'react';

const KEYBOARD_THRESHOLD_PX = 150;

export function useKeyboardViewport() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return null;
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.innerHeight - window.visualViewport.height > KEYBOARD_THRESHOLD_PX;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const visualViewport = window.visualViewport;

    const handleResize = () => {
      const currentHeight = visualViewport.height;
      const isOpen = window.innerHeight - currentHeight > KEYBOARD_THRESHOLD_PX;
      setViewportHeight(currentHeight);
      setIsKeyboardOpen(isOpen);
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return {
    viewportHeight,
    isKeyboardOpen,
    keyboardHeight:
      isKeyboardOpen && viewportHeight !== null
        ? Math.max(0, window.innerHeight - viewportHeight)
        : 0,
  };
}
