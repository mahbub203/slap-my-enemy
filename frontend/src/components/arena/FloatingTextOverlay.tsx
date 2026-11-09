import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export const FloatingTextOverlay: React.FC = () => {
  const { floatingTexts, dismissFloatingText } = useGameStore();

  useEffect(() => {
    if (floatingTexts.length === 0) return;

    const timer = setTimeout(() => {
      const oldest = floatingTexts[0];
      if (oldest) dismissFloatingText(oldest.id);
    }, 1100);

    return () => clearTimeout(timer);
  }, [floatingTexts, dismissFloatingText]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className={`absolute animate-float-pop select-none font-black drop-shadow-lg tracking-wider ${item.fontSize}`}
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            color: item.color,
            textShadow: item.crit
              ? '0 0 16px rgba(239, 68, 68, 0.9), 0 2px 4px black'
              : '0 0 10px rgba(0,0,0,0.8), 0 2px 4px black'
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};
