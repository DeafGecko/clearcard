import { test, expect, Page } from '@playwright/test';
import { resetStorage, openSettings, vaultSeed } from './helpers';

const SECRET = '123456';
const RECOVERY_KEY = 'ABCD-EFGH-JKMN-PQRS';

const enter = async (page: Page, code: string) => {
  for (const digit of code) await page.getByRole('button', { name: digit, exact: true }).click();
};

test('forgot code: the recovery key opens the Vault', async ({ page }) => {
  const seed = await vaultSeed(SECRET, RECOVERY_KEY);
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, seed.extra);
  await page.goto('/');

  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot code?' }).click();
  await page.getByPlaceholder('XXXX-XXXX-XXXX-XXXX').fill(RECOVERY_KEY);
  await page.getByRole('button', { name: 'Open Private' }).click();

  await expect(page.getByRole('heading', { name: 'Personal ID' })).toBeVisible();
});

test('forgot code: a wrong recovery key does not open the Vault', async ({ page }) => {
  const seed = await vaultSeed(SECRET, RECOVERY_KEY);
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, seed.extra);
  await page.goto('/');

  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot code?' }).click();
  await page.getByPlaceholder('XXXX-XXXX-XXXX-XXXX').fill('WXYZ-WXYZ-WXYZ-WXYZ');
  await page.getByRole('button', { name: 'Open Private' }).click();

  await expect(page.getByRole('alert')).toHaveText('That backup key does not match.');
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toHaveCount(0);
});

test('setting a new Secret Code shows a recovery key once', async ({ page }) => {
  const seed = await vaultSeed(SECRET, RECOVERY_KEY);
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, seed.extra);
  await page.goto('/');

  await openSettings(page);
  await page.getByRole('button', { name: 'Change code', exact: true }).click();
  await page.getByPlaceholder('Current code').fill(SECRET);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('New code, 6 digits').fill('654321');
  await page.getByRole('button', { name: 'Set', exact: true }).click();
  await page.getByRole('button', { name: 'SAVE CHANGES' }).click();

  await expect(page.getByRole('heading', { name: 'Save your backup key' })).toBeVisible();
  const key = await page.locator('p[aria-label^="Backup key"]').textContent();
  expect(key?.trim()).toMatch(/^[A-HJ-KM-NP-Z2-9]{4}(-[A-HJ-KM-NP-Z2-9]{4}){3}$/);

  await page.getByRole('button', { name: 'I saved it' }).click();
  await expect(page.getByRole('heading', { name: 'Save your backup key' })).toHaveCount(0);
});
