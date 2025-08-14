import { useRef, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  target?: string;
  scale?: number;
}

interface UseTouchProps {
  onSwipe?: (gesture: TouchGesture) => void;
  onPinch?: (scale: number) => void;
  onTap?: (gesture: TouchGesture) => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export const useTouch = ({
  onSwipe,
  onPinch,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500
}: UseTouchProps) => {
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);
  const currentDistance = useRef<number>(0);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      currentDistance.current = getDistance(e.touches[0], e.touches[1]);
      if (initialDistance.current > 0) {
        const scale = currentDistance.current / initialDistance.current;
        onPinch(scale);
      }
    }
  }, [onPinch]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.timestamp - touchStart.current.timestamp;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for tap gesture
    if (distance < 10 && deltaTime < 300) {
      if (onTap) {
        onTap({ type: 'tap' });
      }
      return;
    }

    // Check for swipe gesture
    if (distance > swipeThreshold && onSwipe) {
      let direction: 'up' | 'down' | 'left' | 'right';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up';
      }

      onSwipe({
        type: 'swipe',
        direction
      });
    }

    // Reset
    touchStart.current = null;
    touchEnd.current = null;
    initialDistance.current = 0;
    currentDistance.current = 0;
  }, [onSwipe, onTap, swipeThreshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};