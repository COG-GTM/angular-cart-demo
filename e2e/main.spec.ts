import { test, expect } from '@playwright/test';

/**
 * Ported from the original Protractor suite (`e2e/main/main.spec.js`):
 * the home page must load with the expected title, and the app must be able
 * to navigate to the cart view.
 */
test.describe('Main view', () => {
  test('loads the home page with the expected title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Angular Cart Demo');
    await expect(page.locator('app-root')).toBeVisible();
  });

  test('navigates to the cart view', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.locator('app-root')).toBeVisible();
  });
});
