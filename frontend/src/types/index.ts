export type LanguageCode = 'bn' | 'banglish' | 'en';

export type CharacterStyle = 
  | 'cartoon-3d' 
  | 'caricature' 
  | 'comic' 
  | 'low-poly';

export type ScenarioId = 
  | 'dhaka-street' 
  | 'village' 
  | 'campus' 
  | 'bazar' 
  | 'rooftop' 
  | 'eid-festival';

export type GameActionType = 
  | 'slap' 
  | 'punch' 
  | 'push' 
  | 'tomato' 
  | 'water' 
  | 'tickle' 
  | 'reset';

export type AnimationState = 
  | 'IDLE' 
  | 'SLAP_REACTION' 
  | 'PUNCH_REACTION' 
  | 'PUSH_REACTION' 
  | 'TOMATO_REACTION' 
  | 'WATER_REACTION' 
  | 'TICKLE_REACTION'
  | 'DIZZY'
  | 'CELEBRATE';

export interface StyleOption {
  id: CharacterStyle;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  color: string;
  previewGradient: string;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  nameKey: 'dhakaStreet' | 'village' | 'campus' | 'bazar' | 'rooftop' | 'eidFestival';
  icon: string;
  badge: string;
  skyColor: string;
  groundColor: string;
  ringColor: string;
  fogColor: string;
  previewGradient: string;
  previewAsset: string;
}

export interface CharacterData {
  id: string;
  name: string;
  style: CharacterStyle;
  originalImage: string; // Base64 or URL
  faceTextureUrl: string; // Processed face texture
  avatarUrl?: string; // Fullbody generation if available
  accentColor: string;
  createdAt: string;
  expression: 'neutral' | 'shocked' | 'dizzy' | 'funny_smile' | 'crying_laugh';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: string;
  crit?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface GameSettings {
  language: LanguageCode;
  soundEnabled: boolean;
  sfxVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  ambienceEnabled: boolean;
  ambienceVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
  cameraTiltEnabled: boolean;
  consentAccepted: boolean;
  hasSeenTutorial: boolean;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  totalHits: number;
  actionCounts: Record<GameActionType, number>;
  stressReliefLevel: number; // 0 - 100%
  sessionSeconds: number;
  lastReactionMessage: string;
}
