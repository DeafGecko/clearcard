
export type Category = string;

export const SystemCategories = {
  MEDICAL: 'Medical',
  SERVICES: 'Services',
  DAILY: 'Daily',
  EMERGENCY: 'Emergency',
  VAULT: 'Vault'
} as const;

export interface VisioCard {
  id: string;
  title: string;
  content: string;
  category: Category;
  isSensitive: boolean;
  isLocked: boolean;
  createdAt: number;
}

export interface UserPreferences {
  fontSize: number;
  highContrast: boolean;
  vaultLocked: boolean;
  accentColor: string;
  displayTextColor: string;
  passcode: string;
  appLanguage: string;
}
