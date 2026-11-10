import { Page } from '@playwright/test';

// Starts every test from a known state so tests do not depend on each other.
export const resetStorage = async (page: Page, prefs: Record<string, unknown> = {}) => {
  await page.addInitScript((seed) => {
    if (!sessionStorage.getItem('e2e-seeded')) {
      localStorage.clear();
      if (seed.prefs) localStorage.setItem('visio_prefs', JSON.stringify(seed.prefs));
      sessionStorage.setItem('e2e-seeded', '1');
    }
  }, { prefs });
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
