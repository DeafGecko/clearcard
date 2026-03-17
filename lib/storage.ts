
import { VisioCard, Category, SystemCategories, UserPreferences } from '../types';

const CARDS_KEY = 'visio_cards';
const PREFS_KEY = 'visio_prefs';
const CATS_KEY = 'visio_categories';

const DEFAULT_CATS: Category[] = Object.values(SystemCategories);

const DEFAULT_CARDS: VisioCard[] = [
  {
    id: '1',
    title: 'Appointment Check-in',
    content: 'I have an appointment at 10:30 AM. My name is [Your Name].',
    category: SystemCategories.MEDICAL,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Oil Change Request',
    content: 'I need a full synthetic oil change and a tire pressure check. Please text me when it is ready.',
    category: SystemCategories.SERVICES,
    isSensitive: false,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '3',
    title: 'Emergency Contact',
    content: 'I am Deaf. Please contact my emergency contact: Jane Doe at 555-0199.',
    category: SystemCategories.EMERGENCY,
    isSensitive: true,
    isLocked: false,
    createdAt: Date.now(),
  },
  {
    id: '4',
    title: 'ID Number',
    content: 'ID: 882-991-002\nAddress: 123 Vision Way, CA 90210',
    category: SystemCategories.VAULT,
    isSensitive: true,
    isLocked: true,
    createdAt: Date.now(),
  }
];

const DEFAULT_PREFS: UserPreferences = { 
  fontSize: 48, 
  highContrast: true, 
  vaultLocked: true,
  accentColor: '#FACC15', // Tailwind yellow-400
  displayTextColor: '#FFFFFF', // Default set to white
  passcode: '123456',
  theme: 'dark'
};

export const storage = {
  getCards: (): VisioCard[] => {
    const data = localStorage.getItem(CARDS_KEY);
    return data ? JSON.parse(data) : DEFAULT_CARDS;
  },
  saveCards: (cards: VisioCard[]) => {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem(CATS_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATS;
  },
  saveCategories: (cats: Category[]) => {
    localStorage.setItem(CATS_KEY, JSON.stringify(cats));
  },
  getPrefs: (): UserPreferences => {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
  },
  savePrefs: (prefs: UserPreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};
