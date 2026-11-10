import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../lib/storage';
import { SystemCategories } from '../../types';

describe('storage: defaults', () => {
  beforeEach(() => localStorage.clear());

  it('returns the built-in cards on first run', () => {
    const cards = storage.getCards();
    expect(cards).toHaveLength(10);
    expect(cards[0].title).toBe('Doctor Appointment');
  });

  it('marks the Personal ID card as sensitive and in the Vault', () => {
    const personal = storage.getCards().find(c => c.id === '10');
    expect(personal?.category).toBe(SystemCategories.VAULT);
    expect(personal?.isSensitive).toBe(true);
    expect(personal?.isLocked).toBe(true);
  });

  it('returns default preferences with no passcode set', () => {
    const prefs = storage.getPrefs();
    expect(prefs.passcode).toBe('');
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
    expect(storage.getCards()).toHaveLength(10);
  });

  it('ignores saved values with the wrong shape', () => {
    localStorage.setItem('visio_cards', JSON.stringify({ not: 'an array' }));
    localStorage.setItem('visio_prefs', JSON.stringify(['not', 'an', 'object']));
    expect(storage.getCards()).toHaveLength(10);
    expect(storage.getPrefs().displaySize).toBe('normal');
  });
});
