import React from 'react';
import type { CharacterStyle, StyleOption } from '../../types';

interface StyleSelectorProps {
  selectedStyle: CharacterStyle;
  onSelectStyle: (style: CharacterStyle) => void;
}

export const STYLES: StyleOption[] = [
  {
    id: 'cartoon-3d',
    name: 'Realistic 3D Cartoon',
    tagline: 'Pixar / Dreamworks Animation Look',
    description: 'Smooth 3D animated studio avatar with warm glossy lighting and realistic cartoon proportions.',
    badge: 'Popular',
    color: '#8b5cf6',
    previewGradient: 'from-purple-600 via-indigo-600 to-pink-500'
  },
  {
    id: 'caricature',
    name: 'Funny Caricature',
    tagline: 'Exaggerated Comedic Avatar',
    description: 'Humorous cartoon distortion with oversized facial expressions, big nose, and rosy cheeks.',
    badge: 'Hilarious',
    color: '#ef4444',
    previewGradient: 'from-red-600 via-pink-600 to-amber-500'
  },
  {
    id: 'comic',
    name: 'Comic Character',
    tagline: 'Graphic Novel Pop-Art Ink',
    description: 'Bold black ink outlines, dramatic shadows, and vintage Ben-Day pop dots.',
    badge: 'Stylized',
    color: '#f59e0b',
    previewGradient: 'from-amber-500 via-orange-600 to-rose-600'
  },
  {
    id: 'low-poly',
    name: 'Low-Poly Character',
    tagline: 'Geometric Faceted Fighter',
    description: 'Modern indie gaming aesthetic with sharp geometric polygon mesh facets.',
    badge: 'Indie 3D',
    color: '#10b981',
    previewGradient: 'from-emerald-500 via-teal-600 to-cyan-700'
  }
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-200 uppercase tracking-wider">
          Choose Character Style (কার্টুন আর্ট স্টাইল)
        </label>
        <span className="text-[11px] text-purple-400 font-bold">4 Game Aesthetics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'border-purple-500 bg-purple-950/40 ring-2 ring-purple-500/50 shadow-purple-950/40 shadow-lg scale-[1.02]'
                  : 'border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-white/20'
              }`}
            >
              {/* Top Row: Name & Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-black tracking-wide ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {style.name}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-purple-500 text-white shadow'
                    : 'bg-slate-800 text-slate-400 border border-white/5'
                }`}>
                  {style.badge}
                </span>
              </div>

              {/* Tagline & Description */}
              <p className="text-xs font-bold text-purple-300/90 mt-1 line-clamp-1">
                {style.tagline}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                {style.description}
              </p>

              {/* Gradient Bottom Stripe */}
              <div className={`h-1 w-full rounded-full mt-3 bg-gradient-to-r ${style.previewGradient} ${
                isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
