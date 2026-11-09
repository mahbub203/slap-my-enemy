import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements } = useGameStore();

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-yellow-500/30 shadow-2xl flex flex-col gap-6 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-950/80 border border-yellow-500/40 text-yellow-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Stress Badges</h2>
              <p className="text-xs text-yellow-400/90 font-medium">
                {unlockedCount} of {achievements.length} Badges Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of badges */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  ach.unlocked
                    ? 'bg-yellow-950/20 border-yellow-500/40 shadow-yellow-950/20 shadow-md'
                    : 'bg-slate-900/50 border-white/5 opacity-75'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                    ach.unlocked
                      ? 'bg-gradient-to-tr from-yellow-600/40 to-amber-500/20 border-yellow-400/50 text-glow-yellow'
                      : 'bg-slate-800/80 border-slate-700 text-slate-500'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-extrabold truncate ${ach.unlocked ? 'text-yellow-300' : 'text-slate-300'}`}>
                      {ach.title}
                    </h3>
                    {ach.unlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Lock className="w-3 h-3" /> {ach.progress}/{ach.maxProgress}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ach.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.unlocked ? 'bg-yellow-400' : 'bg-purple-500/60'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
