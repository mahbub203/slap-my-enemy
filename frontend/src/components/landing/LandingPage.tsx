import React from 'react';
import { 
  Sparkles, 
  Gamepad2, 
  ArrowRight,
  Layers,
  Compass
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useTranslation } from '../../localization';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useGameStore();
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col items-center animate-fade-in overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-16 sm:pb-24 flex flex-col items-center text-center">
        {/* Glow backdrop orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider mb-5 shadow-lg shadow-red-950/40 animate-pulse">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{t.landing.heroBadge}</span>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-none">
            {t.landing.heroTitle}{' '}
            <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-400 bg-clip-text text-transparent text-glow-red">
              {t.landing.heroTitleHighlight}
            </span>
          </h1>
          <span className="text-sm sm:text-lg font-black tracking-widest text-yellow-400 mt-2 uppercase">
            {t.common.edition}
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
            "{t.common.tagline}"
          </p>
        </div>

        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('create')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/60 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.landing.uploadBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-300 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>{t.common.scenarios}</span>
          </button>

          <button
            onClick={() => setActiveTab('arena')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass-panel hover:bg-slate-800/90 border border-white/15 text-slate-100 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Gamepad2 className="w-4 h-4 text-pink-400" />
            <span>{t.landing.quickPlayBtn}</span>
          </button>
        </div>

        {/* Feature Highlights Ribbon */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          {[
            { icon: '🛺', label: '৬টি বাংলাদেশ সিনারিও' },
            { icon: '🥊', label: '৭টি কার্টুন অ্যাকশন' },
            { icon: '🎭', label: 'বাংলা ও বাংলিশ সংলাপ' },
            { icon: '🔒', label: '১০০% নিরাপদ ও গোপনীয়' }
          ].map((item, i) => (
            <div key={i} className="glass-panel px-3 py-2.5 rounded-2xl border border-white/5 flex items-center justify-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bangladesh Scenarios Preview Teaser */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12 border-t border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">
              ৬টি খাঁটি বাংলাদেশি পরিবেশ
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t.scenarios.pageTitle}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('scenarios')}
            className="px-5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>সবগুলো দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'dhaka-street', name: t.scenarios.dhakaStreet.name, icon: '🛺', desc: t.scenarios.dhakaStreet.tagline, gradient: 'from-amber-600 via-red-600 to-purple-900' },
            { id: 'village', name: t.scenarios.village.name, icon: '🌴', desc: t.scenarios.village.tagline, gradient: 'from-emerald-600 via-teal-700 to-slate-900' },
            { id: 'campus', name: t.scenarios.campus.name, icon: '🏛️', desc: t.scenarios.campus.tagline, gradient: 'from-rose-700 via-purple-800 to-slate-950' },
            { id: 'bazar', name: t.scenarios.bazar.name, icon: '🛒', desc: t.scenarios.bazar.tagline, gradient: 'from-orange-600 via-amber-700 to-slate-950' },
            { id: 'rooftop', name: t.scenarios.rooftop.name, icon: '🌆', desc: t.scenarios.rooftop.tagline, gradient: 'from-indigo-600 via-purple-700 to-pink-900' },
            { id: 'eid-festival', name: t.scenarios.eidFestival.name, icon: '🌙', desc: t.scenarios.eidFestival.tagline, gradient: 'from-emerald-500 via-yellow-600 to-purple-900' }
          ].map((sc) => (
            <div
              key={sc.id}
              onClick={() => {
                useGameStore.getState().setSelectedScenario(sc.id as any);
                setActiveTab('arena');
              }}
              className="glass-panel p-4 rounded-3xl border border-white/5 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3.5 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${sc.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                {sc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                  {sc.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {sc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-14 border-t border-white/5">
        <div className="text-center mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-purple-400">
            {t.landing.howItWorksTitle}
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {t.landing.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '০১',
              title: t.landing.step1Title,
              desc: t.landing.step1Desc,
              icon: <Layers className="w-5 h-5 text-purple-400" />
            },
            {
              step: '০২',
              title: t.landing.step2Title,
              desc: t.landing.step2Desc,
              icon: <Sparkles className="w-5 h-5 text-pink-400" />
            },
            {
              step: '০৩',
              title: t.landing.step3Title,
              desc: t.landing.step3Desc,
              icon: <Gamepad2 className="w-5 h-5 text-red-400" />
            }
          ].map((card) => (
            <div
              key={card.step}
              className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between relative group hover:border-purple-500/40 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-950/70 border border-purple-500/30">
                  {card.icon}
                </div>
                <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-purple-400/50 transition-colors">
                  {card.step}
                </span>
              </div>
              <h3 className="text-base font-black text-white mb-2">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-8 px-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
        <p className="font-bold text-slate-300">
          {t.common.brandName}: {t.common.edition} © ২০২৬
        </p>
        <p className="text-[11px] max-w-lg leading-relaxed text-slate-400">
          {t.landing.footerText}
        </p>
      </footer>
    </div>
  );
};
