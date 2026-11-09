import React from 'react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Clock, 
  Heart, 
  RotateCcw, 
  Compass, 
  Sparkles, 
  X 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from '../../localization';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    score, 
    maxCombo, 
    totalHits, 
    sessionSeconds, 
    stressReliefLevel, 
    achievements, 
    resetStats, 
    setActiveTab,
    character 
  } = useGameStore();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handlePlayAgain = () => {
    resetStats();
    onClose();
  };

  const handleSwitchScenario = () => {
    onClose();
    setActiveTab('scenarios');
  };

  const handleNewAvatar = () => {
    onClose();
    setActiveTab('create');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-pink-500/50 shadow-2xl flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-600 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-950/50">
              🏆
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {t.summary.title}
              </h2>
              <p className="text-xs text-yellow-400 font-medium">
                {t.summary.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rival Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold">Rival:</span>
          <span className="text-sm font-black text-white">{character.name}</span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 ml-auto">
            {character.style}
          </span>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Score */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> {t.summary.totalScore}
            </span>
            <span className="text-2xl font-black text-white mt-1 text-glow-purple">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Highest Combo */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> {t.summary.highestCombo}
            </span>
            <span className="text-2xl font-black text-orange-400 mt-1">
              {maxCombo}x
            </span>
          </div>

          {/* Total Actions */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> {t.summary.totalActions}
            </span>
            <span className="text-2xl font-black text-cyan-400 mt-1">
              {totalHits}
            </span>
          </div>

          {/* Session Duration */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> {t.summary.sessionDuration}
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1">
              {formatTime(sessionSeconds)}
            </span>
          </div>
        </div>

        {/* Stress Relief Meter Status */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-400" /> {t.summary.stressRelieved}:
          </span>
          <span className="text-base font-black text-emerald-400">
            {stressReliefLevel}%
          </span>
        </div>

        {/* Badges Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t.summary.badgesEarned}</span>
            <span className="text-yellow-400">{unlockedCount} / {achievements.length}</span>
          </div>
          <div className="flex gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${
                  ach.unlocked
                    ? 'bg-yellow-950/40 border-yellow-500/50 shadow'
                    : 'bg-slate-900 border-white/5 opacity-40'
                }`}
                title={`${ach.title}: ${ach.description}`}
              >
                {ach.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={handlePlayAgain}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 transition-all hover:scale-[1.01]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.summary.playAgainBtn}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSwitchScenario}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.summary.changeScenarioBtn}</span>
            </button>
            <button
              onClick={handleNewAvatar}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.summary.newAvatarBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
