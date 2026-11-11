import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resetStorage } from './helpers';

const themes = ['light', 'dark', 'highContrast'] as const;

for (const theme of themes) {
  test.describe(`axe on more screens: ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await resetStorage(page, { themeMode: theme, displaySize: 'normal', accentColor: '#FACC15' });
      await page.goto('/');
    });

    const check = async (page: import('@playwright/test').Page, name: string) => {
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map(v => `${name}: ${v.id}: ${v.help}`)).toEqual([]);
    };

    test('write a note dialog', async ({ page }) => {
      await page.getByRole('button', { name: 'Write a note' }).click();
      await check(page, 'write a note');
    });

    test('card editor', async ({ page }) => {
      await page.getByRole('button', { name: 'New Card' }).click();
      await check(page, 'card editor');
    });

    test('edit list', async ({ page }) => {
      await page.getByRole('navigation').getByRole('button', { name: 'Edit list' }).click();
      await check(page, 'edit list');
    });

    test('code keypad', async ({ page }) => {
      await page.getByRole('navigation').getByRole('button', { name: 'Private' }).click();
      await page.getByRole('button', { name: 'UNLOCK PRIVATE', exact: true }).click();
      await check(page, 'code keypad');
    });
  });
}
