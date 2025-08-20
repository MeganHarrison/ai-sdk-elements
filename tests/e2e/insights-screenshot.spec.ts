import { test, expect } from '@playwright/test';

test.describe('Insights Page Screenshot', () => {
  test('capture insights page screenshot', async ({ page }) => {
    // Navigate directly to the insights page
    await page.goto('http://localhost:3003/insights', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a bit for data to load
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/insights-page-screenshot.png', 
      fullPage: true 
    });
    
    // Check if the page has the insights heading
    const heading = page.locator('h1:has-text("AI Insights Dashboard")');
    await expect(heading).toBeVisible({ timeout: 5000 });
    
    // Check if table or no data message is visible
    const table = page.locator('[role="table"]');
    const noData = page.locator('text=No insights found');
    
    const hasTable = await table.isVisible().catch(() => false);
    const hasNoData = await noData.isVisible().catch(() => false);
    
    expect(hasTable || hasNoData).toBeTruthy();
    
    console.log('Screenshot saved to test-results/insights-page-screenshot.png');
  });
});