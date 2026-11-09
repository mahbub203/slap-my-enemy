import { create } from 'zustand';
import type { GameSettings, LanguageCode } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface SettingsStore extends GameSettings {
  setLanguage: (lang: LanguageCode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSfxVolume: (vol: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (vol: number) => void;
  setAmbienceEnabled: (enabled: boolean) => void;
  setAmbienceVolume: (vol: number) => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high') => void;
  setParticlesEnabled: (enabled: boolean) => void;
  setScreenShakeEnabled: (enabled: boolean) => void;
  setCameraTiltEnabled: (enabled: boolean) => void;
  setConsentAccepted: (accepted: boolean) => void;
  setHasSeenTutorial: (seen: boolean) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  language: 'bn', // Default: বাংলা
  soundEnabled: true,
  sfxVolume: 0.8,
  musicEnabled: false,
  musicVolume: 0.4,
  ambienceEnabled: true,
  ambienceVolume: 0.5,
  graphicsQuality: 'high',
  particlesEnabled: true,
  screenShakeEnabled: true,
  cameraTiltEnabled: true,
  consentAccepted: false,
  hasSeenTutorial: false,
  viewMode: '2d', // Default: Full 2D interactive cartoon mode!
};

const loadPersistedSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem('sme_bd_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Could not read settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
};

const initialSettings = loadPersistedSettings();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialSettings,

  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), language }));
  },

  setSoundEnabled: (soundEnabled) => {
    soundEngine.setSoundEnabled(soundEnabled);
    set({ soundEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), soundEnabled }));
  },

  setSfxVolume: (sfxVolume) => {
    soundEngine.setSfxVolume(sfxVolume);
    set({ sfxVolume });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), sfxVolume }));
  },

  setMusicEnabled: (musicEnabled) => {
    soundEngine.toggleMusic(musicEnabled);
    set({ musicEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), musicEnabled }));
  },

  setMusicVolume: (musicVolume) => {
    soundEngine.setMusicVolume(musicVolume);
    set({ musicVolume });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), musicVolume }));
  },

  setAmbienceEnabled: (ambienceEnabled) => {
    soundEngine.toggleAmbience(ambienceEnabled);
    set({ ambienceEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), ambienceEnabled }));
  },

  setAmbienceVolume: (ambienceVolume) => {
    soundEngine.setAmbienceVolume(ambienceVolume);
    set({ ambienceVolume });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), ambienceVolume }));
  },

  setGraphicsQuality: (graphicsQuality) => {
    set({ graphicsQuality });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), graphicsQuality }));
  },

  setParticlesEnabled: (particlesEnabled) => {
    set({ particlesEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), particlesEnabled }));
  },

  setScreenShakeEnabled: (screenShakeEnabled) => {
    set({ screenShakeEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), screenShakeEnabled }));
  },

  setCameraTiltEnabled: (cameraTiltEnabled) => {
    set({ cameraTiltEnabled });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), cameraTiltEnabled }));
  },

  setConsentAccepted: (consentAccepted) => {
    set({ consentAccepted });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), consentAccepted }));
  },

  setHasSeenTutorial: (hasSeenTutorial) => {
    set({ hasSeenTutorial });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), hasSeenTutorial }));
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
    localStorage.setItem('sme_bd_settings', JSON.stringify({ ...get(), viewMode }));
  },

  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    localStorage.removeItem('sme_bd_settings');
  },
}));
