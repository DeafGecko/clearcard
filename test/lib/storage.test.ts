import { describe, it, expect, beforeEach } from 'vitest';
import { storage, DEFAULT_VAULT_CARDS } from '../../lib/storage';
import { SystemCategories } from '../../types';

describe('storage: defaults', () => {
  beforeEach(() => localStorage.clear());

  it('returns the built-in cards on first run', () => {
    const cards = storage.getCards();
    expect(cards).toHaveLength(9);
    expect(cards[0].title).toBe('Doctor Appointment');
  });

  it('keeps the Personal ID card out of plain-text storage, as a Vault template', () => {
    expect(storage.getCards().find(c => c.id === '10')).toBeUndefined();
    const personal = DEFAULT_VAULT_CARDS[0];
    expect(personal.category).toBe(SystemCategories.VAULT);
    expect(personal.isSensitive).toBe(true);
    expect(personal.isLocked).toBe(true);
  });

  it('returns default preferences with no passcode set', () => {
    const prefs = storage.getPrefs();
    expect(prefs.passcodeHash).toBeUndefined();
    expect(prefs.themeMode).toBe('light');
    expect(prefs.displaySize).toBe('normal');
  });
});

describe('storage: round trips', () => {
  beforeEach(() => localStorage.clear());

  it('saves and reads back cards', () => {
    const cards = storage.getCards();
    storage.saveCards(cards.slice(0, 2));
    expect(storage.getCards()).toHaveLength(2);
  });

  it('saves and reads back preferences', () => {
    storage.savePrefs({ ...storage.getPrefs(), themeMode: 'dark', displaySize: 'enlarged' });
    const prefs = storage.getPrefs();
    expect(prefs.themeMode).toBe('dark');
    expect(prefs.displaySize).toBe('enlarged');
  });

  it('migrates the legacy highContrast flag to themeMode', () => {
    localStorage.setItem('visio_prefs', JSON.stringify({ highContrast: true }));
    expect(storage.getPrefs().themeMode).toBe('highContrast');
  });
});

describe('storage: robustness', () => {
  beforeEach(() => localStorage.clear());

  it('falls back to defaults when saved preferences are corrupt', () => {
    localStorage.setItem('visio_prefs', '{not json');
    expect(() => storage.getPrefs()).not.toThrow();
    expect(storage.getPrefs().themeMode).toBe('light');
  });

  it('falls back to defaults when saved cards are corrupt', () => {
    localStorage.setItem('visio_cards', '[{broken');
    expect(storage.getCards()).toHaveLength(9);
  });

  it('ignores saved values with the wrong shape', () => {
    localStorage.setItem('visio_cards', JSON.stringify({ not: 'an array' }));
    localStorage.setItem('visio_prefs', JSON.stringify(['not', 'an', 'object']));
    expect(storage.getCards()).toHaveLength(9);
    expect(storage.getPrefs().displaySize).toBe('normal');
  });
});

describe('storage: legacy plain-text Secret Code', () => {
  beforeEach(() => localStorage.clear());

  it('reads the old plain-text code and keeps it out of loaded preferences', () => {
    localStorage.setItem('visio_prefs', JSON.stringify({ passcode: '123456', themeMode: 'dark' }));
    expect(storage.getLegacyPasscode()).toBe('123456');
    const prefs = storage.getPrefs() as unknown as Record<string, unknown>;
    expect(prefs.passcode).toBeUndefined();
    expect(prefs.themeMode).toBe('dark');
  });

  it('returns nothing when no old code is stored', () => {
    localStorage.setItem('visio_prefs', JSON.stringify({ themeMode: 'light' }));
    expect(storage.getLegacyPasscode()).toBeUndefined();
  });
});
