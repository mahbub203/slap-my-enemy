import React from 'react';
import { 
  Volume2, 
  ArrowRight, 
  CheckCircle2,
  Compass
} from 'lucide-react';
import type { ScenarioId } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from '../../localization';
import { soundEngine } from '../../audio/soundEngine';

interface ScenarioCardData {
  id: ScenarioId;
  key: 'dhakaStreet' | 'village' | 'campus' | 'bazar' | 'rooftop' | 'eidFestival';
  icon: string;
  badge: string;
  bannerGradient: string;
  borderColor: string;
  bgGlow: string;
  visualEmoji: string;
}

const SCENARIOS: ScenarioCardData[] = [
  {
    id: 'dhaka-street',
    key: 'dhakaStreet',
    icon: '🛺',
    badge: 'আইকনিক ঢাকা',
    bannerGradient: 'from-amber-600 via-red-600 to-purple-900',
    borderColor: 'border-red-500/40 hover:border-red-400',
    bgGlow: 'shadow-red-950/40',
    visualEmoji: '🛺 🚌 🚦'
  },
  {
    id: 'village',
    key: 'village',
    icon: '🌴',
    badge: 'সবুজ বাংলা',
    bannerGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgGlow: 'shadow-emerald-950/40',
    visualEmoji: '🏡 🌾 🦆'
  },
  {
    id: 'campus',
    key: 'campus',
    icon: '🏛️',
    badge: 'ক্যাম্পাস লাইফ',
    bannerGradient: 'from-rose-700 via-purple-800 to-slate-950',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    bgGlow: 'shadow-purple-950/40',
    visualEmoji: '🏛️ 🎓 ☕'
  },
  {
    id: 'bazar',
    key: 'bazar',
    icon: '🛒',
    badge: 'ব্যস্ত কাঁচাবাজার',
    bannerGradient: 'from-orange-600 via-amber-700 to-slate-950',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgGlow: 'shadow-amber-950/40',
    visualEmoji: '🍅 🥬 🐟'
  },
  {
    id: 'rooftop',
    key: 'rooftop',
    icon: '🌆',
    badge: 'গোধূলির আকাশ',
    bannerGradient: 'from-indigo-600 via-purple-700 to-pink-900',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    bgGlow: 'shadow-indigo-950/40',
    visualEmoji: '🌆 🪁 🌤️'
  },
  {
    id: 'eid-festival',
    key: 'eidFestival',
    icon: '🌙',
    badge: 'ঈদ মোবারক',
    bannerGradient: 'from-emerald-500 via-yellow-600 to-purple-900',
    borderColor: 'border-yellow-500/40 hover:border-yellow-400',
    bgGlow: 'shadow-yellow-950/40',
    visualEmoji: '🌙 ⭐ ✨'
  }
];

export const ScenarioSelector: React.FC = () => {
  const { selectedScenario, setSelectedScenario, setActiveTab, character } = useGameStore();
  const { t } = useTranslation();

  const handleSelectAndPlay = (id: ScenarioId) => {
    setSelectedScenario(id);
    setActiveTab('arena');
  };

  const playPreviewAudio = (e: React.MouseEvent, id: ScenarioId) => {
    e.stopPropagation();
    soundEngine.startAmbience(id);
    setTimeout(() => {
      // preview burst
    }, 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/70 border border-red-500/30 text-red-400 text-xs font-bold w-fit mx-auto sm:mx-0">
          <Compass className="w-3.5 h-3.5" />
          <span>{t.scenarios.pageTitle}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Choose Your <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-400 bg-clip-text text-transparent">Bangladesh Arena</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl font-medium">
          {t.scenarios.pageSubtitle}
        </p>

        {character && (
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 mt-1">
            <span>Selected Rival:</span>
            <span className="font-bold text-white px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30">
              {character.name}
            </span>
          </div>
        )}
      </div>

      {/* Grid of 6 Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SCENARIOS.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          const data = t.scenarios[sc.key];

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`relative glass-panel rounded-3xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between group overflow-hidden ${
                isSelected
                  ? `border-purple-500 ring-2 ring-purple-500/60 shadow-2xl ${sc.bgGlow} scale-[1.02]`
                  : `${sc.borderColor} hover:bg-slate-900/80 hover:scale-[1.01]`
              }`}
            >
              {/* Top Banner with Decorative Gradient & Emoji Header */}
              <div>
                <div className={`h-24 rounded-2xl bg-gradient-to-tr ${sc.bannerGradient} p-4 flex items-center justify-between relative overflow-hidden shadow-inner`}>
                  <div className="text-4xl drop-shadow-md z-10">{sc.icon}</div>
                  <div className="text-2xl opacity-75 z-10">{sc.visualEmoji}</div>
                  {/* Subtle noise backdrop overlay */}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Scenario Title & Badge */}
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-base font-black text-white tracking-wide">
                    {data.name}
                  </h3>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-white/5">
                      {sc.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-purple-300 mt-1">
                  {data.tagline}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {data.desc}
                </p>
              </div>

              {/* Bottom Row: Ambient Audio Tag & Select Button */}
              <div className="mt-5 pt-3 border-t border-white/10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{data.ambience}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => playPreviewAudio(e, sc.id)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 ml-2"
                    title="Audio Preview"
                  >
                    🔊
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectAndPlay(sc.id)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 text-white shadow-purple-950/60 hover:scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{t.scenarios.selectBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
