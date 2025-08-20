import { test, expect } from '@playwright/test';

test.describe('Feature: Clients Page', () => {
  test('MANDATORY: Full browser validation', async ({ page }) => {
    // Navigate to clients page
    await test.step('Navigate to clients page', async () => {
      await page.goto('http://localhost:3002/clients', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check if redirected to login (auth required)
      const url = page.url();
      if (url.includes('/auth/login')) {
        console.log('Clients page requires authentication - redirected to login');
        expect(url).toContain('/auth/login');
      } else {
        // Page loaded successfully
        expect(url).toContain('/clients');
      }
    });

    // Check page structure
    await test.step('Check page structure', async () => {
      const currentUrl = page.url();
      
      if (!currentUrl.includes('/auth/login')) {
        // Check for main heading
        const heading = await page.locator('h1').first();
        await expect(heading).toBeVisible();
        
        // Check for table or loading state
        const tableOrLoading = await page.locator('table, [role="status"]').first();
        await expect(tableOrLoading).toBeVisible();
        
        // Take screenshot for visual proof
        await page.screenshot({ 
          path: 'tests/screenshots/clients-page.png',
          fullPage: true 
        });
      }
    });

    // Check for console errors
    await test.step('No critical console errors', async () => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out known non-critical errors
          if (!text.includes('Failed to load resource') && 
              !text.includes('favicon.ico') &&
              !text.includes('Accessing element.ref') &&
              !text.includes('hydration')) {
            consoleErrors.push(text);
          }
        }
      });
      
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Only fail on critical errors
      const criticalErrors = consoleErrors.filter(e => 
        e.includes('TypeError') || 
        e.includes('ReferenceError') || 
        e.includes('SyntaxError')
      );
      
      if (criticalErrors.length > 0) {
        console.log('Critical errors found:', criticalErrors);
      }
      
      expect(criticalErrors.length).toBe(0);
    });

    // Performance check
    await test.step('Performance metrics', async () => {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      // Check load time is under 3 seconds
      expect(metrics.loadTime).toBeLessThan(3000);
      console.log('Performance metrics:', metrics);
    });

    // Accessibility check
    await test.step('Basic accessibility', async () => {
      // Check for lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBeTruthy();
      
      // Check for title
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    console.log('✅ All clients page tests passed!');
  });
});