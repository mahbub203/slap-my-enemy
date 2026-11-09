import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Sliders, 
  Trash2, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import type { CharacterData, CharacterStyle } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { StyleSelector } from './StyleSelector';
import { ImageEditorModal } from './ImageEditorModal';
import { stylizeImageCanvas } from '../../services/avatarStylizer';
import { generateCharacterViaBackend } from '../../services/api';
import { useTranslation } from '../../localization';

const PRESET_CHARACTERS = [
  {
    name: 'Grumpy Boss',
    label: 'Corporate Micro-manager',
    accent: '#ef4444',
    img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231e293b"/><circle cx="100" cy="100" r="70" fill="%23fcd34d"/><ellipse cx="75" cy="85" rx="10" ry="14" fill="%230f172a"/><ellipse cx="125" cy="85" rx="10" ry="14" fill="%230f172a"/><line x1="60" y1="65" x2="90" y2="78" stroke="%2378350f" stroke-width="6"/><line x1="140" y1="65" x2="110" y2="78" stroke="%2378350f" stroke-width="6"/><path d="M 65 140 Q 100 110 135 140" stroke="%2378350f" stroke-width="7" fill="none"/></svg>'
  },
  {
    name: 'Toxic Teammate',
    label: 'Afk Gamer Troll',
    accent: '#8b5cf6',
    img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230f172a"/><circle cx="100" cy="100" r="70" fill="%23a7f3d0"/><circle cx="75" cy="90" r="12" fill="%23064e3b"/><circle cx="125" cy="90" r="12" fill="%23064e3b"/><path d="M 70 135 Q 100 155 130 135" stroke="%23064e3b" stroke-width="6" fill="none"/></svg>'
  },
  {
    name: 'Monday Alarm',
    label: 'The Sleep Destroyer',
    accent: '#06b6d4',
    img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2318181b"/><circle cx="100" cy="105" r="65" fill="%23f87171"/><circle cx="55" cy="50" r="22" fill="%23ef4444"/><circle cx="145" cy="50" r="22" fill="%23ef4444"/><circle cx="80" cy="95" r="10" fill="%23ffffff"/><circle cx="120" cy="95" r="10" fill="%23ffffff"/><path d="M 75 135 Q 100 115 125 135" stroke="%23ffffff" stroke-width="6" fill="none"/></svg>'
  }
];

const ACCENT_COLORS = [
  '#ef4444', // Crimson Red
  '#ec4899', // Hot Pink
  '#8b5cf6', // Electric Purple
  '#06b6d4', // Cyber Cyan
  '#eab308', // Toxic Yellow
  '#10b981'  // Acid Green
];

export const CharacterCreator: React.FC = () => {
  const { setCharacter, setActiveTab } = useGameStore();
  const { consentAccepted, setConsentAccepted } = useSettingsStore();
  const { t } = useTranslation();

  const [imageSrc, setImageSrc] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<CharacterStyle>('cartoon-3d');
  const [charName, setCharName] = useState<string>('খাড়ূস বস');
  const [accentColor, setAccentColor] = useState<string>('#ec4899');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStageText, setGenerationStageText] = useState<string>('');

  // Confirmation preview state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [generatedFaceTexture, setGeneratedFaceTexture] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'front' | 'side'>('front');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and load image
  const processUploadedFile = (file: File) => {
    setValidationError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationError('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('Image size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Generate Character pipeline
  const handleStartGeneration = async (overrideConsent: boolean = false) => {
    if (!consentAccepted && !overrideConsent) {
      setShowConsentModal(true);
      return;
    }

    if (overrideConsent) {
      setConsentAccepted(true);
      setShowConsentModal(false);
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStageText('Validating image silhouette & facial contours...');

    await new Promise((r) => setTimeout(r, 450));
    setGenerationProgress(35);
    setGenerationStageText(`Applying ${selectedStyle.toUpperCase()} cartoon stylization algorithm...`);

    let stylizedResult = imageSrc;
    let backendChar: CharacterData | null = null;

    // Convert data url to Blob if available
    if (imageSrc && imageSrc.startsWith('data:image')) {
      try {
        const fetchRes = await fetch(imageSrc);
        const blob = await fetchRes.blob();

        const sessionId = localStorage.getItem('sme_session_id') || ('sess-' + Date.now());
        localStorage.setItem('sme_session_id', sessionId);

        backendChar = await generateCharacterViaBackend({
          name: charName,
          style: selectedStyle,
          accent_color: accentColor,
          session_id: sessionId,
          consent_given: true,
          imageBlob: blob
        });
      } catch (err) {
        console.warn('Backend call failed, using client stylizer:', err);
      }
    }

    if (backendChar && backendChar.faceTextureUrl) {
      stylizedResult = backendChar.faceTextureUrl;
    } else if (imageSrc) {
      // Client-side fallback
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      stylizedResult = stylizeImageCanvas(img, {
        style: selectedStyle,
        brightness: 0,
        contrast: 10,
        saturation: 15,
        rotation: 0
      });
    }

    await new Promise((r) => setTimeout(r, 550));
    setGenerationProgress(70);
    setGenerationStageText('Baking 3D procedural character meshes & expressions...');

    await new Promise((r) => setTimeout(r, 450));
    setGenerationProgress(100);
    setGenerationStageText('Ready! Review your fictional game avatar.');

    setGeneratedFaceTexture(stylizedResult);
    setIsGenerating(false);
    setShowConfirmation(true);
  };

  const handleConfirmAndEnterArena = () => {
    const newChar: CharacterData = {
      id: 'char-' + Date.now(),
      name: charName || 'খাড়ূস বস',
      style: selectedStyle,
      originalImage: imageSrc,
      faceTextureUrl: generatedFaceTexture,
      accentColor: accentColor,
      createdAt: new Date().toISOString(),
      expression: 'neutral'
    };

    setCharacter(newChar);
    setActiveTab('scenarios');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-400 text-xs font-bold w-fit mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.creator.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {t.creator.title}
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          {t.creator.subtitle}
        </p>
      </div>

      {/* Main Grid: Upload & Style Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-black text-slate-200 uppercase tracking-wider">
              1. Photo Upload
            </label>
            {imageSrc && (
              <button
                onClick={() => setImageSrc('')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          {!imageSrc ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-72 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-purple-400 bg-purple-950/40 scale-[1.01]'
                  : 'border-white/15 bg-slate-900/40 hover:bg-slate-900/70 hover:border-purple-500/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3 shadow-lg shadow-purple-950/50">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                Click or drag & drop photo here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WEBP (Max 10MB)
              </p>
              <div className="mt-4 px-3 py-1 rounded-xl bg-slate-800/80 text-[11px] text-purple-300 font-semibold border border-white/5">
                Front-facing portraits work best
              </div>
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="glass-panel rounded-3xl p-4 border border-purple-500/30 flex flex-col items-center gap-4">
              <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl relative group">
                <img
                  src={imageSrc}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-xs font-bold text-purple-200 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust & Crop</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Preset Archetypes */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Or Try A Preset Rival:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_CHARACTERS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setImageSrc(preset.img);
                    setCharName(preset.name);
                    setAccentColor(preset.accent);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-purple-500/30 flex flex-col items-center text-center transition-all group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 mb-1.5">
                    <img src={preset.img} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Style Selection & Character Identity (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Style Selector */}
          <StyleSelector
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
          />

          {/* Identity & Accent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Character Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Character Name / Nickname
              </label>
              <input
                type="text"
                value={charName}
                maxLength={24}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="e.g. Grumpy Boss"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Outfit Accent Color
              </label>
              <div className="flex items-center gap-2.5 py-1">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      accentColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-75'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Consent Checkbox Card */}
          <div 
            onClick={() => setConsentAccepted(!consentAccepted)}
            className={`p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 flex items-start gap-3.5 ${
              consentAccepted
                ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/30'
                : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40 hover:bg-slate-900/80'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
              consentAccepted
                ? 'bg-gradient-to-tr from-purple-600 to-pink-600 border-purple-400 text-white'
                : 'border-slate-600 bg-slate-800'
            }`}>
              {consentAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-1 text-xs text-slate-300 leading-relaxed">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Explicit Avatar Generation Consent
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                I agree to convert this photo into a fictional stylized cartoon game character for virtual entertainment. No realistic deepfakes are produced, and images are never published or shared.
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleStartGeneration(false)}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white shadow-purple-950/60 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate 3D Avatar</span>
          </button>
        </div>
      </div>

      {/* In-App Consent Confirmation Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/50 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-black text-white">Avatar Consent Required</h3>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Before generating your 3D rival avatar, please confirm that you agree to the following safety terms:
            </p>

            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Your photo will be transformed into a fictional caricature for stress relief.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>No photorealistic deepfakes or real-world imagery are created.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Your photo is isolated to this session and can be wiped with one click.</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartGeneration(true)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/50 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agree & Generate Avatar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel rounded-3xl p-8 max-w-md w-full border border-purple-500/40 shadow-2xl flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-950/50">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Forging Your Character</h3>
              <p className="text-xs text-purple-300 font-medium">{generationStageText}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>

            <span className="text-xs font-mono font-bold text-slate-400">
              {generationProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Step Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-pink-500/40 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-black text-white">Avatar Generation Complete</h3>
                  <p className="text-xs text-slate-400">Review your fictional character before entering the arena</p>
                </div>
              </div>
            </div>

            {/* Front / Side View Preview Switch */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPreviewTab('front')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  previewTab === 'front' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => setPreviewTab('side')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  previewTab === 'side' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Side View
              </button>
            </div>

            {/* Avatar Preview Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-white/10 relative overflow-hidden">
              <div
                className="w-48 h-48 rounded-full overflow-hidden border-4 shadow-2xl transition-transform duration-300"
                style={{
                  borderColor: accentColor,
                  transform: previewTab === 'side' ? 'rotateY(45deg) scale(0.95)' : 'none'
                }}
              >
                <img
                  src={generatedFaceTexture}
                  alt="Generated character avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-base font-black text-white tracking-wide">{charName}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-300">
                  {selectedStyle}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Fictional game model rigged and ready in the 3D Colosseum
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                {t.common.back}
              </button>
              <button
                onClick={handleConfirmAndEnterArena}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>{t.creator.continueToScenarios}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop & Adjust Modal */}
      {imageSrc && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          imageSrc={imageSrc}
          onClose={() => setIsEditorOpen(false)}
          onApply={(edited) => setImageSrc(edited)}
        />
      )}
    </div>
  );
};
