import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expects a title "to contain" a substring.
  await expect(page).toHaveTitle(/Create Next App/i);
});