
import React, { useState, useEffect } from 'react';

interface AudioLevelIndicatorProps {
  isActive: boolean;
  audioLevel?: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({
  isActive,
  audioLevel = 0,
  size = 'md',
  color = 'bg-primary'
}) => {
  const [level, setLevel] = useState(audioLevel);
  
  // Simulate audio level changes when active
  useEffect(() => {
    if (!isActive) {
      setLevel(0);
      return;
    }
    
    const interval = setInterval(() => {
      // Simulate audio levels fluctuating between 20-80
      const randomLevel = Math.floor(Math.random() * 60) + 20;
      setLevel(randomLevel);
    }, 300);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // Determine ring size
  const getRingSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-16 w-16';
      case 'md':
      default: return 'h-8 w-8';
    }
  };
  
  // Calculate stroke width based on audio level (0-100)
  const calculateStrokeWidth = () => {
    const minWidth = 2;
    const maxWidth = 6;
    return minWidth + ((maxWidth - minWidth) * level / 100);
  };
  
  // Calculate opacity based on audio level (0-100)
  const calculateOpacity = () => {
    const minOpacity = 0.3;
    const maxOpacity = 0.9;
    return minOpacity + ((maxOpacity - minOpacity) * level / 100);
  };
  
  if (!isActive) return null;
  
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none`}
      style={{ 
        opacity: calculateOpacity(),
        transition: 'opacity 0.2s ease-out'
      }}
    >
      <div className="relative">
        <svg 
          viewBox="0 0 100 100" 
          className={`animate-pulse ${getRingSize()}`}
          style={{ 
            animation: `pulse ${1.5 - (level/100)}s cubic-bezier(0.4, 0, 0.6, 1) infinite`
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color.replace('bg-', 'var(--')}
            strokeWidth={calculateStrokeWidth()}
            strokeLinecap="round"
            strokeDasharray={280}
            strokeDashoffset={280 - ((280 * level) / 100)}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
          />
        </svg>
      </div>
    </div>
  );
};

export default AudioLevelIndicator;
