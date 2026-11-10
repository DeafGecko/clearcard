import { Page } from '@playwright/test';
import { createPasscodeRecord } from '../lib/passcode';
import { hashRecoveryKey, normalizeRecoveryKey } from '../lib/recovery';
import { newVaultKey, wrapVaultKey, sealVault } from '../lib/vault';
import { DEFAULT_VAULT_CARDS } from '../lib/storage';

// Starts every test from a known state so tests do not depend on each other.
// extra holds raw localStorage values, such as the encrypted Vault blob.
export const resetStorage = async (
  page: Page,
  prefs: Record<string, unknown> = {},
  extra: Record<string, string> = {}
) => {
  await page.addInitScript((seed) => {
    if (!sessionStorage.getItem('e2e-seeded')) {
      localStorage.clear();
      if (seed.prefs) localStorage.setItem('visio_prefs', JSON.stringify(seed.prefs));
      for (const [key, value] of Object.entries(seed.extra)) localStorage.setItem(key, value);
      sessionStorage.setItem('e2e-seeded', '1');
    }
  }, { prefs, extra });
};

// Builds a real Vault the same way the app does: a wrapped vault key for the Secret Code
// and for the recovery key, plus the encrypted card blob.
export const vaultSeed = async (code: string, recoveryKey: string) => {
  const vaultKey = await newVaultKey();
  return {
    prefs: {
      ...(await createPasscodeRecord(code)),
      vaultWrapCode: await wrapVaultKey(vaultKey, code),
      vaultWrapRecovery: await wrapVaultKey(vaultKey, normalizeRecoveryKey(recoveryKey)),
      recoveryKeyHash: await hashRecoveryKey(recoveryKey),
    },
    extra: { visio_vault: await sealVault(vaultKey, DEFAULT_VAULT_CARDS) },
  };
};

export const openSettings = async (page: Page) => {
  // Phones show Settings inside the header menu; desktops show the Settings button directly.
  const menuButton = page.getByRole('button', { name: 'Open menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
  }
  await page.getByRole('dialog').waitFor();
};
