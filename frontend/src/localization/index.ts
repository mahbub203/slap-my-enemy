import { bn } from './bn';
import { banglish } from './banglish';
import { en } from './en';
import { useSettingsStore } from '../store/settingsStore';

export type LanguageCode = 'bn' | 'banglish' | 'en';

export const translations = {
  bn,
  banglish,
  en,
};

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; nativeName: string }[] = [
  { code: 'bn', label: 'বাংলা', nativeName: 'বাংলা' },
  { code: 'banglish', label: 'Banglish', nativeName: 'Banglish' },
  { code: 'en', label: 'English', nativeName: 'English' },
];

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const t = translations[language] || translations.bn;
  return { t, language };
}
