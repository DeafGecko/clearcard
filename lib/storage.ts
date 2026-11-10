
import { VisioCard, Category, SystemCategories, UserPreferences } from '../types';

const CARDS_KEY = 'visio_cards';
const PREFS_KEY = 'visio_prefs';
const CATS_KEY = 'visio_categories';
const VAULT_KEY = 'visio_vault';

// Starter card for the Vault. It is written into the encrypted Vault the first
// time a Secret Code is set, and never saved in plain text.
export const DEFAULT_VAULT_CARDS: VisioCard[] = [
  {
    id: '10',
    title: 'Personal ID',
    content: 'ID: [Your ID]\nAddress: [Your Address]',
    category: SystemCategories.VAULT,
    isSensitive: true,
    isLocked: true,
    createdAt: Date.now(),
  },
];

const DEFAULT_CATS: Category[] = Object.values(SystemCategories);

const DEFAULT_CARDS: VisioCard[] = [
  {
    id: '1',
    title: 'Doctor Appointment',
    content: 'I have an appointment at [Time]. My name is [Your Name].',
    category: SystemCategories.MEDICAL,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Prescription Pickup',
    content: 'I am here to pick up my prescription. My name is [Your Name].',
    category: SystemCategories.MEDICAL,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Restaurant Order',
    content: 'I would like to order [item]. Thank you!',
    category: SystemCategories.DAILY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'Table for Two',
    content: 'I have a reservation for [Name] at [Time]. Please seat us.',
    category: SystemCategories.DAILY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '5',
    title: 'Oil Change Request',
    content: 'I need a full synthetic oil change and a tire pressure check. Please text me when it is ready.',
    category: SystemCategories.SERVICES,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '6',
    title: 'Hair Appointment',
    content: 'I have an appointment at [Time]. I would like [haircut/style].',
    category: SystemCategories.SERVICES,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '7',
    title: 'Coffee Order',
    content: 'Can I get a [size] [drink] please? Thank you!',
    category: SystemCategories.DAILY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '8',
    title: 'Emergency Alert',
    content: 'I AM DEAF. THIS IS AN EMERGENCY. PLEASE CALL 911 AND STAY WITH ME.',
    category: SystemCategories.EMERGENCY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '9',
    title: 'Emergency Contact',
    content: 'I am Deaf. Please contact my emergency contact: [Name] at [Phone Number].',
    category: SystemCategories.EMERGENCY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  }
];

const DEFAULT_PREFS: UserPreferences = { 
  fontSize: 48, 
  displaySize: 'normal',
  themeMode: 'light',
  vaultLocked: true,
  accentColor: '#FACC15', // Tailwind yellow-400
  displayTextColor: '#FFFFFF', // Default set to white
  appLanguage: 'en',
};

// Reads and parses a stored value. Corrupt JSON or an unexpected shape returns
// the fallback instead of throwing, so a bad value cannot crash the app.
const readStored = <T>(key: string, fallback: T, isValid: (value: unknown) => boolean): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const storage = {
  getCards: (): VisioCard[] =>
    readStored(CARDS_KEY, DEFAULT_CARDS, Array.isArray).map(card => {
      // Cards saved by older versions still have the old "I am Deaf" text. Use the current text for those starter cards.
      // Emergency cards keep "I am Deaf" on purpose.
      const starter = DEFAULT_CARDS.find(d => d.id === card.id);
      const isEmergency = card.category === SystemCategories.EMERGENCY;
      return starter && !isEmergency && /deaf/i.test(card.content) ? { ...card, content: starter.content } : card;
    }),
  saveCards: (cards: VisioCard[]) => {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },
  getCategories: (): Category[] =>
    readStored(CATS_KEY, DEFAULT_CATS, Array.isArray),
  // The Vault is one encrypted string. See lib/vault.ts.
  getVault: (): string | null => localStorage.getItem(VAULT_KEY),
  saveVault: (blob: string) => {
    localStorage.setItem(VAULT_KEY, blob);
  },
  saveCategories: (cats: Category[]) => {
    localStorage.setItem(CATS_KEY, JSON.stringify(cats));
  },
  getPrefs: (): UserPreferences => {
    const saved = readStored<Record<string, unknown> | null>(PREFS_KEY, null, isObject);
    if (!saved) return DEFAULT_PREFS;

    const themeMode = (saved.themeMode as UserPreferences['themeMode']) || (saved.highContrast ? 'highContrast' : 'light');
    const { highContrast: _legacyHighContrast, passcode: _legacyPasscode, ...currentPrefs } = saved;
    return { ...DEFAULT_PREFS, ...currentPrefs, themeMode };
  },
  // Older versions saved the Secret Code in plain text. Returns it so it can be
  // hashed once; the next savePrefs call drops it from storage.
  getLegacyPasscode: (): string | undefined => {
    const saved = readStored<Record<string, unknown> | null>(PREFS_KEY, null, isObject);
    return typeof saved?.passcode === 'string' && saved.passcode ? saved.passcode : undefined;
  },
  savePrefs: (prefs: UserPreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};
