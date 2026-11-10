import { test, expect } from '@playwright/test';
import { resetStorage } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetStorage(page);
  await page.goto('/');
});

test('shows the brand and the built-in cards', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'ShowCard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Doctor Appointment' })).toBeVisible();
});

test('filters cards by category', async ({ page }) => {
  await page.getByRole('navigation').getByRole('button', { name: 'Services' }).click();
  await expect(page.getByRole('heading', { name: 'Oil Change Request' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Doctor Appointment' })).toHaveCount(0);
});

test('opens a card full screen and closes it', async ({ page }) => {
  await page.getByRole('heading', { name: 'Doctor Appointment' }).click();
  await expect(page.getByText(/I have an appointment/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Doctor Appointment' })).toBeVisible();
});

test('keeps the Vault private card hidden until the Secret Code is entered', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Personal ID' })).toHaveCount(0);
});
