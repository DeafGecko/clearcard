import { test, expect, Page } from '@playwright/test';
import { resetStorage } from './helpers';

const SECRET = '123456';

const enter = async (page: Page, code: string) => {
  for (const digit of code) await page.getByRole('button', { name: digit, exact: true }).click();
};

// Seeds the plain-text format that older versions saved.
test('an older plain-text Secret Code is replaced by a hash and still works', async ({ page }) => {
  await resetStorage(page, { passcode: SECRET, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' });
  await page.goto('/');

  await expect.poll(async () => page.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem('visio_prefs') ?? '{}');
    return 'passcode' in prefs ? 'plain' : prefs.passcodeHash ? 'hashed' : 'none';
  })).toBe('hashed');

  const stored = await page.evaluate(() => localStorage.getItem('visio_prefs') ?? '');
  expect(stored).not.toContain(SECRET);

  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  await enter(page, SECRET);
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toBeVisible();
});
