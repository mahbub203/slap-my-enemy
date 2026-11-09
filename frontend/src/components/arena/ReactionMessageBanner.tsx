import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ReactionMessageBanner: React.FC = () => {
  const { lastReactionMessage, character, currentAnimation } = useGameStore();

  if (!lastReactionMessage) return null;

  const isDizzyOrShocked = currentAnimation !== 'IDLE';

  return (
    <div className="absolute top-24 sm:top-20 right-4 sm:right-8 z-20 pointer-events-none max-w-[260px] sm:max-w-xs">
      <div
        className={`relative transition-all duration-300 px-4 py-2.5 rounded-2xl glass-panel border bg-slate-900/90 backdrop-blur-md shadow-xl ${
          isDizzyOrShocked
            ? 'border-pink-500/60 scale-105 shadow-pink-900/40'
            : 'border-purple-500/30'
        }`}
      >
        <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-start gap-1.5">
          <span className="text-pink-400 font-extrabold whitespace-nowrap">
            💬 {character.name}:
          </span>
          <span className="italic text-yellow-300 font-semibold leading-snug">
            "{lastReactionMessage}"
          </span>
        </div>
      </div>
    </div>
  );
};
