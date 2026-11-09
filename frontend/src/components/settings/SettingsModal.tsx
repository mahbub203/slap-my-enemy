import React from 'react';
import { 
  X, 
  Volume2, 
  Monitor, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  RotateCcw,
  Globe,
  Radio
} from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store/gameStore';
import { cleanupSessionViaBackend } from '../../services/api';
import { useTranslation, LANGUAGE_OPTIONS } from '../../localization';
import type { LanguageCode } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    sfxVolume,
    setSfxVolume,
    musicEnabled,
    setMusicEnabled,
    musicVolume,
    setMusicVolume,
    ambienceEnabled,
    setAmbienceEnabled,
    ambienceVolume,
    setAmbienceVolume,
    graphicsQuality,
    setGraphicsQuality,
    particlesEnabled,
    setParticlesEnabled,
    screenShakeEnabled,
    setScreenShakeEnabled,
    cameraTiltEnabled,
    setCameraTiltEnabled,
    resetSettings
  } = useSettingsStore();

  const { t } = useTranslation();
  const [wipeNotice, setWipeNotice] = React.useState<string | null>(null);
  const { clearCharacter, resetStats } = useGameStore();

  if (!isOpen) return null;

  const handleClearData = async () => {
    const sessionId = localStorage.getItem('sme_session_id');
    if (sessionId) {
      await cleanupSessionViaBackend(sessionId);
    }
    clearCharacter();
    resetStats();
    localStorage.removeItem('sme_character');
    localStorage.removeItem('sme_session_id');
    setWipeNotice(t.settings.wipeSuccess);
    setTimeout(() => setWipeNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {t.settings.title}
              </h2>
              <p className="text-xs text-slate-400">{t.settings.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Language Selection */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> {t.settings.languageTitle}
          </h3>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code as LanguageCode)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  language === opt.code
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Audio Controls */}
        <div className="flex flex-col gap-3.5 border-t border-white/10 pt-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" /> {t.settings.audioTitle}
          </h3>

          {/* Action SFX */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>{t.settings.sfxLabel}</span>
              <span>{soundEnabled ? `${Math.round(sfxVolume * 100)}%` : 'Muted'}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundEnabled ? sfxVolume : 0}
                onChange={(e) => {
                  setSoundEnabled(true);
                  setSfxVolume(parseFloat(e.target.value));
                }}
                className="flex-1 accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  soundEnabled
                    ? 'bg-purple-900/40 border-purple-500/40 text-purple-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Bangladesh Scenario Ambience */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> {t.settings.ambienceLabel}
              </span>
              <span>{ambienceEnabled ? `${Math.round(ambienceVolume * 100)}%` : 'Off'}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambienceEnabled ? ambienceVolume : 0}
                onChange={(e) => {
                  setAmbienceEnabled(true);
                  setAmbienceVolume(parseFloat(e.target.value));
                }}
                className="flex-1 accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setAmbienceEnabled(!ambienceEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  ambienceEnabled
                    ? 'bg-cyan-900/40 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {ambienceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Synth-Groove Music */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>{t.settings.musicLabel}</span>
              <span>{musicEnabled ? `${Math.round(musicVolume * 100)}%` : 'Off'}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicEnabled ? musicVolume : 0}
                onChange={(e) => {
                  setMusicEnabled(true);
                  setMusicVolume(parseFloat(e.target.value));
                }}
                className="flex-1 accent-pink-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  musicEnabled
                    ? 'bg-pink-900/40 border-pink-500/40 text-pink-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Graphics & Performance */}
        <div className="flex flex-col gap-3.5 border-t border-white/10 pt-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> {t.settings.graphicsTitle}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">{t.settings.graphicsPreset}</span>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setGraphicsQuality(q)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                    graphicsQuality === q
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-white/5 cursor-pointer hover:border-white/10">
              <span className="text-xs text-slate-300">{t.settings.particlesLabel}</span>
              <input
                type="checkbox"
                checked={particlesEnabled}
                onChange={(e) => setParticlesEnabled(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-white/5 cursor-pointer hover:border-white/10">
              <span className="text-xs text-slate-300">{t.settings.screenShakeLabel}</span>
              <input
                type="checkbox"
                checked={screenShakeEnabled}
                onChange={(e) => setScreenShakeEnabled(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-white/5 cursor-pointer hover:border-white/10">
            <span className="text-xs text-slate-300">{t.settings.cameraTiltLabel}</span>
            <input
              type="checkbox"
              checked={cameraTiltEnabled}
              onChange={(e) => setCameraTiltEnabled(e.target.checked)}
              className="accent-purple-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        {/* 4. Privacy & Safety Controls */}
        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {t.settings.privacyTitle}
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {t.settings.privacyText}
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleClearData}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-bold text-red-300 transition-all hover:scale-[1.01]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.wipeDataBtn}</span>
            </button>
            <button
              onClick={resetSettings}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
              title="Reset Settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.common.defaults}</span>
            </button>
          </div>

          {wipeNotice && (
            <p className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-center">
              ✓ {wipeNotice}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
