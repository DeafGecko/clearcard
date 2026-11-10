import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resetStorage, openSettings } from './helpers';

const themes = ['light', 'dark', 'highContrast'] as const;

for (const theme of themes) {
  test.describe(`axe: ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await resetStorage(page, { themeMode: theme, displaySize: 'normal', accentColor: '#FACC15', passcode: '' });
      await page.goto('/');
    });

    test('main screen has no serious or critical violations', async ({ page }) => {
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map(v => `${v.id}: ${v.help} :: ${v.nodes.map(n => n.html).join(' | ')}`)).toEqual([]);
    });

    test('settings screen has no serious or critical violations', async ({ page }) => {
      await openSettings(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map(v => `${v.id}: ${v.help} :: ${v.nodes.map(n => n.html).join(' | ')}`)).toEqual([]);
    });
  });
}
