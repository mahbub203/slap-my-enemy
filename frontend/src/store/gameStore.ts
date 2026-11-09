import { create } from 'zustand';
import type { 
  CharacterData, 
  GameActionType, 
  AnimationState, 
  FloatingText, 
  Achievement,
  ScenarioId
} from '../types';
import { soundEngine } from '../audio/soundEngine';
import { translations } from '../localization';
import { useSettingsStore } from './settingsStore';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_hit',
    title: 'First Strike (প্রথম আঘাত)',
    description: 'Perform your very first stress relief interaction.',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'combo_10',
    title: 'Combo Maestro (কম্বো ওস্তাদ)',
    description: 'Reach a blistering 10x combo streak.',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'tomato_barrage',
    title: 'Tomato Expert (টমেটো বিশেষজ্ঞ)',
    description: 'Splat the character with 10 ripe tomatoes.',
    icon: '🍅',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'hydro_splash',
    title: 'Water Splash Champion (ওয়াটার ব্লাস্টার)',
    description: 'Drench the avatar with 10 water blasts.',
    icon: '💦',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'tickle_fest',
    title: 'Tickle Tactician (সুরসুরি স্পেশালিস্ট)',
    description: 'Induce cartoon laughter 12 times.',
    icon: '🪶',
    unlocked: false,
    progress: 0,
    maxProgress: 12
  },
  {
    id: 'zen_master',
    title: 'Stress Free Zone (১০০% টেনশন মুক্ত)',
    description: 'Reach 100% stress relief level.',
    icon: '🧘',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'century_club',
    title: 'Relentless Reliever (সেঞ্চুরি ক্লাব)',
    description: 'Perform 100 total interactions in the arena.',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  }
];

// Default default character for immediate play
const DEFAULT_AVATAR: CharacterData = {
  id: 'boss-smirk',
  name: 'খাড়ূস বস (Strict Boss)',
  style: 'cartoon-3d',
  originalImage: '',
  faceTextureUrl: '',
  accentColor: '#ec4899',
  createdAt: new Date().toISOString(),
  expression: 'neutral'
};

interface GameStore {
  activeTab: 'landing' | 'create' | 'scenarios' | 'arena';
  selectedScenario: ScenarioId;
  character: CharacterData;
  score: number;
  combo: number;
  maxCombo: number;
  comboMultiplier: number;
  totalHits: number;
  actionCounts: Record<GameActionType, number>;
  stressReliefLevel: number;
  sessionSeconds: number;
  currentAnimation: AnimationState;
  lastReactionMessage: string;
  floatingTexts: FloatingText[];
  achievements: Achievement[];
  isScreenShaking: boolean;
  recentAction: GameActionType | null;
  isSummaryOpen: boolean;

  // Actions
  setActiveTab: (tab: 'landing' | 'create' | 'scenarios' | 'arena') => void;
  setSelectedScenario: (scenario: ScenarioId) => void;
  setCharacter: (char: CharacterData) => void;
  clearCharacter: () => void;
  triggerAction: (action: GameActionType, coords?: { x: number; y: number }) => void;
  resetStats: () => void;
  tickSessionTime: () => void;
  dismissFloatingText: (id: string) => void;
  unlockAchievement: (id: string) => void;
  setIsSummaryOpen: (isOpen: boolean) => void;
}

let comboTimer: ReturnType<typeof setTimeout> | null = null;
let animationResetTimer: ReturnType<typeof setTimeout> | null = null;
let screenShakeTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  activeTab: 'landing',
  selectedScenario: 'dhaka-street',
  character: DEFAULT_AVATAR,
  score: 0,
  combo: 0,
  maxCombo: 0,
  comboMultiplier: 1,
  totalHits: 0,
  actionCounts: {
    slap: 0,
    punch: 0,
    push: 0,
    tomato: 0,
    water: 0,
    tickle: 0,
    reset: 0
  },
  stressReliefLevel: 0,
  sessionSeconds: 0,
  currentAnimation: 'IDLE',
  lastReactionMessage: 'স্ক্রিনে সোয়াইপ করুন বা অ্যাকশন বাটনে চাপুন!',
  floatingTexts: [],
  achievements: INITIAL_ACHIEVEMENTS,
  isScreenShaking: false,
  recentAction: null,
  isSummaryOpen: false,

  setActiveTab: (activeTab) => set({ activeTab }),

  setSelectedScenario: (selectedScenario) => {
    set({ selectedScenario });
    soundEngine.startAmbience(selectedScenario);
  },

  setCharacter: (character) => {
    set({ character, activeTab: 'scenarios' });
  },

  clearCharacter: () => {
    set({ character: DEFAULT_AVATAR });
  },

  setIsSummaryOpen: (isSummaryOpen) => set({ isSummaryOpen }),

  triggerAction: (action, coords) => {
    const state = get();
    const currentLang = useSettingsStore.getState().language;
    const langDict = translations[currentLang] || translations.bn;

    if (action === 'reset') {
      soundEngine.playReset();
      if (animationResetTimer) clearTimeout(animationResetTimer);
      const resetMsg = langDict.dialogues.reset[
        Math.floor(Math.random() * langDict.dialogues.reset.length)
      ];
      set({
        currentAnimation: 'CELEBRATE',
        recentAction: 'reset',
        lastReactionMessage: resetMsg,
        character: {
          ...state.character,
          expression: 'neutral'
        }
      });
      animationResetTimer = setTimeout(() => {
        set({ currentAnimation: 'IDLE', recentAction: null });
      }, 1000);
      return;
    }

    // Sound effect
    switch (action) {
      case 'slap':
        soundEngine.playSlap();
        break;
      case 'punch':
        soundEngine.playPunch();
        break;
      case 'push':
        soundEngine.playPush();
        break;
      case 'tomato':
        soundEngine.playTomatoSplat();
        break;
      case 'water':
        soundEngine.playWaterSplash();
        break;
      case 'tickle':
        soundEngine.playTickle();
        break;
    }

    // Calculate Combo & Score
    const newCombo = state.combo + 1;
    const maxCombo = Math.max(state.maxCombo, newCombo);
    const multiplier = Math.min(5, 1 + Math.floor(newCombo / 5) * 0.5);

    const basePoints: Record<GameActionType, number> = {
      slap: 150,
      punch: 250,
      push: 100,
      tomato: 200,
      water: 180,
      tickle: 120,
      reset: 0
    };

    const isCrit = Math.random() < 0.25;
    const critBonus = isCrit ? 1.5 : 1;
    const addedPoints = Math.round(basePoints[action] * multiplier * critBonus);
    const newScore = state.score + addedPoints;
    const newTotalHits = state.totalHits + 1;

    // Reset combo timer (resets after 3.2s of inactivity)
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      set({ combo: 0, comboMultiplier: 1 });
    }, 3200);

    // Audio chime on combo milestones
    if (newCombo % 5 === 0) {
      soundEngine.playComboChime(newCombo);
    }

    // Animation Mapping
    const animMap: Record<GameActionType, AnimationState> = {
      slap: 'SLAP_REACTION',
      punch: 'PUNCH_REACTION',
      push: 'PUSH_REACTION',
      tomato: 'TOMATO_REACTION',
      water: 'WATER_REACTION',
      tickle: 'TICKLE_REACTION',
      reset: 'IDLE'
    };

    const targetAnim = animMap[action];

    // Funny expression changes
    const expressions: Array<CharacterData['expression']> = [
      'shocked', 'dizzy', 'funny_smile', 'crying_laugh'
    ];
    const randomExpression = isCrit ? 'dizzy' : expressions[Math.floor(Math.random() * expressions.length)];

    // Multilingual Reaction messages
    const dialogueList = langDict.dialogues[action] || langDict.dialogues.slap;
    const pickedMessage = isCrit
      ? `💥 ${dialogueList[Math.floor(Math.random() * dialogueList.length)]}`
      : dialogueList[Math.floor(Math.random() * dialogueList.length)];

    // Stress relief calculation
    const newStressRelief = Math.min(100, Math.round(state.stressReliefLevel + (action === 'punch' ? 4 : 2.5)));

    // Screen shake trigger
    if (action === 'punch' || action === 'slap' || isCrit) {
      set({ isScreenShaking: true });
      if (screenShakeTimer) clearTimeout(screenShakeTimer);
      screenShakeTimer = setTimeout(() => {
        set({ isScreenShaking: false });
      }, 280);
    }

    // Floating text item
    const actionColorMap: Record<GameActionType, string> = {
      slap: '#f43f5e',
      punch: '#ef4444',
      push: '#06b6d4',
      tomato: '#ea580c',
      water: '#38bdf8',
      tickle: '#facc15',
      reset: '#a855f7'
    };

    const floatingId = 'flt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const textLabel = isCrit 
      ? `CRIT! +${addedPoints}` 
      : (newCombo > 1 ? `x${newCombo} +${addedPoints}` : `+${addedPoints}`);

    const newFloatingText: FloatingText = {
      id: floatingId,
      text: textLabel,
      x: coords ? coords.x : window.innerWidth / 2 + (Math.random() * 80 - 40),
      y: coords ? coords.y : window.innerHeight / 2 - 40 + (Math.random() * 60 - 30),
      color: actionColorMap[action],
      fontSize: isCrit ? 'text-2xl font-black' : 'text-xl font-extrabold',
      crit: isCrit
    };

    // Update action counts
    const updatedActionCounts = {
      ...state.actionCounts,
      [action]: state.actionCounts[action] + 1
    };

    // Update achievements progress
    const updatedAchievements = state.achievements.map((ach) => {
      let progress = ach.progress;
      let unlocked = ach.unlocked;

      if (ach.id === 'first_hit') {
        progress = Math.min(1, newTotalHits);
      } else if (ach.id === 'combo_10') {
        progress = Math.max(progress, newCombo);
      } else if (ach.id === 'tomato_barrage') {
        progress = updatedActionCounts.tomato;
      } else if (ach.id === 'hydro_splash') {
        progress = updatedActionCounts.water;
      } else if (ach.id === 'tickle_fest') {
        progress = updatedActionCounts.tickle;
      } else if (ach.id === 'zen_master') {
        progress = newStressRelief;
      } else if (ach.id === 'century_club') {
        progress = newTotalHits;
      }

      if (!unlocked && progress >= ach.maxProgress) {
        unlocked = true;
        soundEngine.playBadgeUnlock();
      }

      return { ...ach, progress, unlocked };
    });

    // Set state
    set({
      score: newScore,
      combo: newCombo,
      maxCombo,
      comboMultiplier: multiplier,
      totalHits: newTotalHits,
      actionCounts: updatedActionCounts,
      stressReliefLevel: newStressRelief,
      currentAnimation: targetAnim,
      recentAction: action,
      lastReactionMessage: pickedMessage,
      floatingTexts: [...state.floatingTexts.slice(-10), newFloatingText],
      achievements: updatedAchievements,
      character: {
        ...state.character,
        expression: randomExpression
      }
    });

    // Return to idle animation after reaction duration
    if (animationResetTimer) clearTimeout(animationResetTimer);
    const duration = action === 'punch' || action === 'push' ? 850 : 650;
    animationResetTimer = setTimeout(() => {
      set({ currentAnimation: 'IDLE', recentAction: null });
    }, duration);
  },

  dismissFloatingText: (id) => {
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((t) => t.id !== id)
    }));
  },

  unlockAchievement: (id) => {
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === id ? { ...a, unlocked: true } : a
      )
    }));
  },

  resetStats: () => {
    set({
      score: 0,
      combo: 0,
      maxCombo: 0,
      totalHits: 0,
      stressReliefLevel: 0,
      actionCounts: {
        slap: 0,
        punch: 0,
        push: 0,
        tomato: 0,
        water: 0,
        tickle: 0,
        reset: 0
      },
      floatingTexts: []
    });
  },

  tickSessionTime: () => {
    set((state) => ({ sessionSeconds: state.sessionSeconds + 1 }));
  }
}));
