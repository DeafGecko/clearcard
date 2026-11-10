export type Category = string;
export type DisplaySize = 'compact' | 'normal' | 'enlarged';
export type ThemeMode = 'light' | 'dark' | 'highContrast';

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

// A vault key wrapped with a secret (the Secret Code or the recovery key). All values are base64.
export interface VaultWrap {
  salt: string;
  iv: string;
  data: string;
}

export interface UserPreferences {
  fontSize: number;
  displaySize: DisplaySize;
  themeMode: ThemeMode;
  vaultLocked: boolean;
  accentColor: string;
  displayTextColor: string;
  // Salted PBKDF2 hash of the Secret Code. The code itself is never stored.
  passcodeHash?: string;
  passcodeSalt?: string;
  // The vault key, wrapped with the Secret Code and with the recovery key.
  vaultWrapCode?: VaultWrap;
  vaultWrapRecovery?: VaultWrap;
  // SHA-256 hash of the recovery key shown when the Secret Code was set.
  recoveryKeyHash?: string;
  appLanguage: string;
}
