import React from 'react';
import { MousePointer, Smartphone, Check } from 'lucide-react';
import { useTranslation } from '../../localization';
import { useSettingsStore } from '../../store/settingsStore';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { setHasSeenTutorial } = useSettingsStore();

  if (!isOpen) return null;

  const handleDismiss = () => {
    setHasSeenTutorial(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-500/50 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-purple-950/50">
            🥊
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
            {t.tutorial.title}
          </h2>
        </div>

        {/* Desktop Controls Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <MousePointer className="w-4 h-4" /> {t.tutorial.desktopTitle}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            • {t.tutorial.desktop1}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            • {t.tutorial.desktop2}
          </p>
        </div>

        {/* Mobile Touch Controls Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" /> {t.tutorial.mobileTitle}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            • {t.tutorial.mobile1}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            • {t.tutorial.mobile2}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 transition-all hover:scale-105 active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>{t.tutorial.gotItBtn}</span>
        </button>
      </div>
    </div>
  );
};
