
import { VisioCard, Category, SystemCategories, UserPreferences } from '../types';

const CARDS_KEY = 'visio_cards';
const PREFS_KEY = 'visio_prefs';
const CATS_KEY = 'visio_categories';

const DEFAULT_CATS: Category[] = Object.values(SystemCategories);

const DEFAULT_CARDS: VisioCard[] = [
  {
    id: '1',
    title: 'Doctor Appointment',
    content: 'I have an appointment at [Time]. My name is [Your Name]. I am Deaf — please write to communicate.',
    category: SystemCategories.MEDICAL,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Prescription Pickup',
    content: 'I am here to pick up my prescription. My name is [Your Name]. I am Deaf — please write or type.',
    category: SystemCategories.MEDICAL,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Restaurant Order',
    content: 'I am Deaf. I would like to order [item]. Please write to communicate. Thank you!',
    category: SystemCategories.DAILY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'Table for Two',
    content: 'I am Deaf. I have a reservation for [Name] at [Time]. Please seat us — writing works best for me.',
    category: SystemCategories.DAILY,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '5',
    title: 'Oil Change Request',
    content: 'I need a full synthetic oil change and a tire pressure check. I am Deaf — please text me when it is ready.',
    category: SystemCategories.SERVICES,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '6',
    title: 'Hair Appointment',
    content: 'I am Deaf. I have an appointment at [Time]. I would like [haircut/style]. Please write to communicate.',
    category: SystemCategories.SERVICES,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '7',
    title: 'Coffee Order',
    content: 'I am Deaf. Can I get a [size] [drink] please? Thank you!',
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
  },
  {
    id: '10',
    title: 'Personal ID',
    content: 'ID: [Your ID]\nAddress: [Your Address]',
    category: SystemCategories.VAULT,
    isSensitive: true,
    isLocked: true,
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
  passcode: '',
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
    readStored(CARDS_KEY, DEFAULT_CARDS, Array.isArray),
  saveCards: (cards: VisioCard[]) => {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },
  getCategories: (): Category[] =>
    readStored(CATS_KEY, DEFAULT_CATS, Array.isArray),
  saveCategories: (cats: Category[]) => {
    localStorage.setItem(CATS_KEY, JSON.stringify(cats));
  },
  getPrefs: (): UserPreferences => {
    const saved = readStored<Record<string, unknown> | null>(PREFS_KEY, null, isObject);
    if (!saved) return DEFAULT_PREFS;

    const themeMode = (saved.themeMode as UserPreferences['themeMode']) || (saved.highContrast ? 'highContrast' : 'light');
    const { highContrast: _legacyHighContrast, ...currentPrefs } = saved;
    return { ...DEFAULT_PREFS, ...currentPrefs, themeMode };
  },
  savePrefs: (prefs: UserPreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};
