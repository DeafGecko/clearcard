import { test, expect } from '@playwright/test';
import { resetStorage, openSettings } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetStorage(page);
  await page.goto('/');
});

test('display size applies immediately and survives reload', async ({ page }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'enlarged' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-display-size', 'enlarged');

  await page.reload();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-display-size', 'enlarged');
});

test('theme applies immediately and survives reload', async ({ page }) => {
  await openSettings(page);
  await page.getByRole('button', { name: /^Dark/ }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'dark');
});

test('choosing an accent color marks it as selected', async ({ page }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Accent color Cyan' }).click();
  await expect(page.getByRole('button', { name: 'Accent color Cyan' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Accent color Yellow' })).toHaveAttribute('aria-pressed', 'false');
});
