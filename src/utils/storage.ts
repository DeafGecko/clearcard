import { NoteCard, PersonalInfo } from '../types';

const CARDS_KEY = 'clearcard_cards';
const PERSONAL_INFO_KEY = 'clearcard_personal_info';
const THEME_KEY = 'clearcard_theme';

// Simple obfuscation for personal info (not cryptographic, but provides basic privacy)
function encode(data: string): string {
  return btoa(encodeURIComponent(data));
}

function decode(data: string): string {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
}

export const storageUtils = {
  // Cards
  getCards(): NoteCard[] {
    try {
      const raw = localStorage.getItem(CARDS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCards(cards: NoteCard[]): void {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },

  // Personal Info
  getPersonalInfo(): Partial<PersonalInfo> {
    try {
      const raw = localStorage.getItem(PERSONAL_INFO_KEY);
      if (!raw) return {};
      return JSON.parse(decode(raw));
    } catch {
      return {};
    }
  },

  savePersonalInfo(info: Partial<PersonalInfo>): void {
    localStorage.setItem(PERSONAL_INFO_KEY, encode(JSON.stringify(info)));
  },

  // Theme
  getTheme(): string {
    return localStorage.getItem(THEME_KEY) || 'high-contrast';
  },

  saveTheme(theme: string): void {
    localStorage.setItem(THEME_KEY, theme);
  },

  clearAll(): void {
    localStorage.removeItem(CARDS_KEY);
    localStorage.removeItem(PERSONAL_INFO_KEY);
    localStorage.removeItem(THEME_KEY);
  },
};
