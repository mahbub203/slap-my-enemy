import React, { useEffect } from 'react';
import { 
  Hand, 
  Flame, 
  MoveRight, 
  Droplets, 
  Feather, 
  RotateCcw 
} from 'lucide-react';
import type { GameActionType } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from '../../localization';

interface ActionItem {
  id: GameActionType;
  hotkey: string;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  bgGlowClass: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'slap',
    hotkey: '1',
    icon: <Hand className="w-5 h-5" />,
    colorClass: 'text-rose-400 group-hover:text-white',
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    bgGlowClass: 'from-rose-600/30 to-rose-950/40 hover:from-rose-600/60 hover:to-rose-900/60 shadow-rose-900/30',
  },
  {
    id: 'punch',
    hotkey: '2',
    icon: <Flame className="w-5 h-5" />,
    colorClass: 'text-red-400 group-hover:text-white',
    borderClass: 'border-red-500/50 hover:border-red-400',
    bgGlowClass: 'from-red-600/40 to-red-950/50 hover:from-red-600/70 hover:to-red-900/70 shadow-red-900/40',
  },
  {
    id: 'push',
    hotkey: '3',
    icon: <MoveRight className="w-5 h-5" />,
    colorClass: 'text-cyan-400 group-hover:text-white',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    bgGlowClass: 'from-cyan-600/30 to-cyan-950/40 hover:from-cyan-600/60 hover:to-cyan-900/60 shadow-cyan-900/30',
  },
  {
    id: 'tomato',
    hotkey: '4',
    icon: <span className="text-xl leading-none">🍅</span>,
    colorClass: 'text-amber-400 group-hover:text-white',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    bgGlowClass: 'from-orange-600/30 to-amber-950/40 hover:from-orange-600/60 hover:to-amber-900/60 shadow-orange-900/30',
  },
  {
    id: 'water',
    hotkey: '5',
    icon: <Droplets className="w-5 h-5" />,
    colorClass: 'text-sky-400 group-hover:text-white',
    borderClass: 'border-sky-500/40 hover:border-sky-400',
    bgGlowClass: 'from-sky-600/30 to-blue-950/40 hover:from-sky-600/60 hover:to-blue-900/60 shadow-sky-900/30',
  },
  {
    id: 'tickle',
    hotkey: '6',
    icon: <Feather className="w-5 h-5" />,
    colorClass: 'text-yellow-400 group-hover:text-white',
    borderClass: 'border-yellow-500/40 hover:border-yellow-400',
    bgGlowClass: 'from-yellow-600/30 to-amber-950/40 hover:from-yellow-600/60 hover:to-amber-900/60 shadow-yellow-900/30',
  },
  {
    id: 'reset',
    hotkey: 'R',
    icon: <RotateCcw className="w-5 h-5" />,
    colorClass: 'text-purple-400 group-hover:text-white',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    bgGlowClass: 'from-purple-600/30 to-indigo-950/40 hover:from-purple-600/60 hover:to-indigo-900/60 shadow-purple-900/30',
  }
];

export const ActionControls: React.FC = () => {
  const { triggerAction, recentAction } = useGameStore();
  const { t } = useTranslation();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      const matched = ACTIONS.find(
        (a) => a.hotkey.toUpperCase() === key || (key === '7' && a.id === 'reset')
      );
      if (matched) {
        e.preventDefault();
        triggerAction(matched.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerAction]);

  return (
    <footer className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 pointer-events-none px-2 sm:px-3 flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2.5 max-w-4xl pointer-events-auto">
        {ACTIONS.map((action) => {
          const isActive = recentAction === action.id;
          const label = t.arena.actions[action.id];
          const desc = t.arena.actionDescriptions[action.id];

          return (
            <button
              key={action.id}
              onClick={() => triggerAction(action.id)}
              className={`group relative btn-action flex flex-col items-center justify-center min-w-[64px] sm:min-w-[82px] h-14 sm:h-18 px-2 py-1 rounded-2xl border backdrop-blur-md transition-all shadow-lg select-none ${
                action.borderClass
              } ${
                isActive 
                  ? 'scale-95 ring-2 ring-white/60 bg-gradient-to-t from-white/20 to-purple-600/40' 
                  : `bg-gradient-to-b ${action.bgGlowClass}`
              }`}
              title={`${label} (${desc}) - [${action.hotkey}]`}
            >
              {/* Hotkey Tag */}
              <span className="absolute top-1 right-1.5 px-1 rounded bg-black/50 text-[8px] sm:text-[9px] font-mono font-bold text-slate-300">
                {action.hotkey}
              </span>

              {/* Action Icon */}
              <div className={`transition-transform duration-200 group-hover:scale-110 ${action.colorClass}`}>
                {action.icon}
              </div>

              {/* Action Label */}
              <span className="mt-1 text-[10px] sm:text-xs font-black tracking-wide text-slate-100 group-hover:text-white truncate max-w-[70px] sm:max-w-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium tracking-wide drop-shadow hidden sm:block">
        {t.arena.tipDesktop}
      </p>
    </footer>
  );
};
