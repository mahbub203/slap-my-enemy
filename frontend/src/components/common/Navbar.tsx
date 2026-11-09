import React, { useState } from 'react';
import { Sparkles, Gamepad2, Settings, Compass } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation, LANGUAGE_OPTIONS } from '../../localization';
import type { LanguageCode } from '../../types';
import { SettingsModal } from '../settings/SettingsModal';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useGameStore();
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <nav className="w-full max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between z-30">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 group transition-transform active:scale-95"
        >
          <span className="text-2xl sm:text-3xl transition-transform group-hover:scale-110">🥊</span>
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-red-500 via-pink-500 to-purple-400 bg-clip-text text-transparent leading-none">
              {t.common.brandName}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mt-0.5">
              {t.common.edition}
            </span>
          </div>
        </button>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/10">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'landing'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t.common.home}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{t.common.createAvatar}</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'scenarios'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.common.scenarios}</span>
          </button>

          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'arena'
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
            <span>{t.common.arena}</span>
          </button>
        </div>

        {/* Right Language Quick-Switch & Settings */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl glass-panel border border-white/10">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code as LanguageCode)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === opt.code
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl glass-panel hover:bg-slate-800 border border-white/10 text-slate-300 transition-all hover:scale-105"
            title={t.common.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
