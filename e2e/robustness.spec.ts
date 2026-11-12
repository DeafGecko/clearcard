import { test, expect, Page } from '@playwright/test';
import { resetStorage, vaultSeed } from './helpers';

// Watches for uncaught errors while a test runs.
const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  return errors;
};

test('a broken settings value does not stop the app', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('visio_prefs', '{not json');
      sessionStorage.setItem('seeded', '1');
    }
  });
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ShowCard' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('saved cards that are not a list fall back to the starter cards', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('visio_cards', JSON.stringify({ oops: true }));
      sessionStorage.setItem('seeded', '1');
    }
  });
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Doctor Appointment' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a damaged Vault does not crash when unlocked', async ({ page }) => {
  const seed = await vaultSeed('123456', 'ABCD-EFGH-JKMN-PQRS');
  await resetStorage(page, { ...seed.prefs, themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' }, { visio_vault: '{"iv":"AAAA","data":"AAAA"}' });
  const errors = watchErrors(page);
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  for (const digit of '123456') await page.getByRole('button', { name: digit, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Private cards cannot open' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'USE BACKUP KEY' })).toBeVisible();
  await expect(page.getByText('Wrong Code')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('broken lockout data does not block the code keypad', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('visio_passcode_attempts', 'nonsense');
      sessionStorage.setItem('seeded', '1');
    }
  });
  const errors = watchErrors(page);
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
  await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Enter your code' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a normal session through the main screens has no page errors', async ({ page }) => {
  await resetStorage(page, { themeMode: 'light', displaySize: 'normal', accentColor: '#FACC15' });
  const errors = watchErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Quick message' }).click();
  await page.getByRole('textbox').fill('Test note');
  await page.getByRole('button', { name: 'Show now' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'New Card' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  const menuButton = page.getByRole('button', { name: 'Open menu' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
  }
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});
