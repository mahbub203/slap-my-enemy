import React, { useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Award, 
  Settings, 
  Sparkles,
  Flame,
  Compass,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation, LANGUAGE_OPTIONS } from '../../localization';
import type { LanguageCode } from '../../types';

interface ScoreboardHUDProps {
  onOpenSettings: () => void;
  onOpenAchievements: () => void;
  onOpenTutorial: () => void;
  onOpenSummary: () => void;
  onNavigateLanding: () => void;
  onNavigateCreate: () => void;
  onNavigateScenarios: () => void;
}

export const ScoreboardHUD: React.FC<ScoreboardHUDProps> = ({
  onOpenSettings,
  onOpenAchievements,
  onOpenTutorial,
  onOpenSummary,
  onNavigateLanding,
  onNavigateCreate,
  onNavigateScenarios
}) => {
  const { 
    score, 
    combo, 
    comboMultiplier, 
    stressReliefLevel, 
    sessionSeconds, 
    tickSessionTime,
    triggerAction,
    achievements,
    selectedScenario
  } = useGameStore();

  const { 
    language,
    setLanguage,
    soundEnabled, 
    setSoundEnabled
  } = useSettingsStore();

  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Session timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      tickSessionTime();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickSessionTime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-4 flex flex-col gap-2">
      {/* Top Bar: Brand, Language Quick-Toggle, Navigation & System Controls */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onNavigateLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Return to Home"
          >
            <span className="text-xl">🥊</span>
            <div className="flex flex-col text-left">
              <span className="font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                {t.common.brandName}
              </span>
              <span className="text-[9px] font-extrabold text-yellow-400 -mt-0.5">
                {t.common.edition}
              </span>
            </div>
          </button>

          {/* Scenarios Switcher Button */}
          <button
            onClick={onNavigateScenarios}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 backdrop-blur-md text-xs font-bold text-cyan-300 hover:text-white transition-all shadow-md"
            title="Change Bangladesh Environment"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{selectedScenario.replace('-', ' ')}</span>
          </button>

          {/* New Avatar Button */}
          <button
            onClick={onNavigateCreate}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{t.common.createAvatar}</span>
          </button>
        </div>

        {/* Center: Language Switcher Pill */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass-panel border border-white/10 pointer-events-auto mx-auto sm:mx-0">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code as LanguageCode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === opt.code
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Right: Quick Action Stats, Summary, Tutorial & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Tutorial Help Button */}
          <button
            onClick={onOpenTutorial}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-slate-300 hover:text-white transition-all hover:scale-105"
            title="How to Play / Tutorial"
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </button>

          {/* Session Summary Button */}
          <button
            onClick={onOpenSummary}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-yellow-400 transition-all hover:scale-105"
            title="Session Stats & Summary"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Badges Button */}
          <button
            onClick={onOpenAchievements}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-yellow-400 transition-all hover:scale-105"
            title="Badges"
          >
            <Award className="w-4 h-4" />
            {unlockedCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full text-[9px] font-bold text-black leading-tight">
                {unlockedCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all hover:scale-105 ${
              soundEnabled 
                ? 'bg-purple-950/70 border-purple-500/40 text-purple-300' 
                : 'bg-slate-900/80 border-slate-700/60 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-slate-300 transition-all hover:scale-105"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Reset Arena */}
          <button
            onClick={() => triggerAction('reset')}
            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 backdrop-blur-md text-red-300 transition-all hover:scale-105 active:scale-95"
            title="Reset Character & Clean"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md text-slate-300 transition-all hover:scale-105"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Bar: Score, Combo & Stress Relief Progress Meter */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto flex flex-col gap-1.5">
        {/* Score & Combo */}
        <div className="flex items-center justify-between px-3 py-1 rounded-xl glass-panel border border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.common.score}:</span>
            <span className="text-base sm:text-lg font-black text-white text-glow-purple">
              {score.toLocaleString()}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1.5 animate-pulse">
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span className="text-xs font-black text-yellow-300">
                {comboMultiplier}x {t.common.combo} ({combo} {t.common.hits})
              </span>
            </div>
          )}

          <span className="text-xs font-mono font-bold text-slate-400">
            {formatTime(sessionSeconds)}
          </span>
        </div>

        {/* Stress Meter */}
        <div className="glass-panel px-3 py-1 rounded-xl border border-white/10 flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 whitespace-nowrap">
            {t.arena.stressReliefLabel}
          </span>
          <div className="flex-1 h-2 bg-slate-950/90 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400"
              style={{ width: `${stressReliefLevel}%` }}
            />
          </div>
          <span className="text-xs font-black text-emerald-400 w-9 text-right">
            {stressReliefLevel}%
          </span>
        </div>
      </div>
    </header>
  );
};
