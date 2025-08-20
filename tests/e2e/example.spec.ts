import { test, expect, runMandatoryChecks } from './test-base';

test.describe('MANDATORY BROWSER TESTING TEMPLATE', () => {
  test('Feature must pass ALL browser checks', async ({ page }) => {
    // STEP 1: Navigate to the feature
    await page.goto('/');
    
    // STEP 2: Verify page loads without errors
    await expect(page).toHaveTitle(/AI Chatbot/i);
    
    // STEP 3: Check for critical UI elements
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // STEP 4: Test interactive elements
    // Example: Click a button if it exists
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      await button.click();
      // Verify the action worked
      await page.waitForTimeout(500);
    }
    
    // STEP 5: Run MANDATORY checks
    const results = await runMandatoryChecks(page, 'Homepage');
    
    // STEP 6: Assert all checks passed
    expect(results.passed).toBe(true);
    expect(results.checks.consoleErrors).toBe(true);
    expect(results.checks.accessibility).toBe(true);
    expect(results.checks.responsive).toBe(true);
    expect(results.checks.performance).toBe(true);
  });

  test('Mobile responsiveness check', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify mobile layout
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    // Check if mobile menu exists or main content adapts
    
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('Desktop functionality check', async ({ page }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verify desktop layout
    await page.screenshot({ path: 'test-results/desktop-view.png' });
  });
});