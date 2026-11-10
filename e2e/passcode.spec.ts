import { test, expect } from '@playwright/test';
import { resetStorage, vaultSeed } from './helpers';

const SECRET = '123456';

test.beforeEach(async ({ page }) => {
  const seed = await vaultSeed(SECRET, 'ABCD-EFGH-JKMN-PQRS');
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, seed.extra);
  await page.goto('/');
});

const openVault = async (page: import('@playwright/test').Page) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
};

const enter = async (page: import('@playwright/test').Page, code: string) => {
  for (const digit of code) await page.getByRole('button', { name: digit, exact: true }).click();
};

test('the correct Secret Code opens the Vault', async ({ page }) => {
  await openVault(page);
  await enter(page, SECRET);
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toBeVisible();
});

test('a wrong Secret Code keeps the Vault locked', async ({ page }) => {
  await openVault(page);
  await enter(page, '000000');
  await expect(page.getByText('Wrong Code')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toHaveCount(0);
});

test('five wrong codes lock the keypad', async ({ page }) => {
  await openVault(page);
  for (let i = 0; i < 5; i++) {
    await enter(page, '000000');
    await page.waitForTimeout(200);
  }
  await expect(page.getByText('Too many tries')).toBeVisible();
  await expect(page.getByRole('button', { name: '1', exact: true })).toBeDisabled();
});
