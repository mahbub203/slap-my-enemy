import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const ReactionMessageBanner: React.FC = () => {
  const { lastReactionMessage, character, currentAnimation } = useGameStore();

  const isDizzyOrShocked = currentAnimation !== 'IDLE';

  return (
    <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-md px-4">
      <div className={`transition-all duration-300 flex items-center justify-center text-center px-4 py-2 rounded-2xl glass-panel border ${
        isDizzyOrShocked ? 'border-pink-500/50 scale-105 shadow-pink-900/30 shadow-lg' : 'border-purple-500/20'
      }`}>
        <span className="text-xs sm:text-sm font-bold text-slate-200">
          <span className="text-pink-400 font-extrabold mr-1.5">
            [{character.name}]:
          </span>
          "{lastReactionMessage}"
        </span>
      </div>
    </div>
  );
};
