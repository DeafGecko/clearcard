import { test, expect } from '@playwright/test';
import { resetStorage, vaultSeed } from './helpers';

const SECRET = '123456';

const enter = async (page: import('@playwright/test').Page, code: string) => {
  for (const digit of code) await page.getByRole('button', { name: digit, exact: true }).click();
};

test('one click on the lock button locks the Vault and opens the Secret Code screen', async ({ page }) => {
  const seed = await vaultSeed(SECRET, 'ABCD-EFGH-JKMN-PQRS');
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, seed.extra);
  await page.goto('/');

  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  await enter(page, SECRET);
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toBeVisible();

  const menuButton = page.getByRole('button', { name: 'Open menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('button', { name: 'Log out' }).click();
  } else {
    await page.getByRole('button', { name: 'Log out' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toHaveCount(0);
});
