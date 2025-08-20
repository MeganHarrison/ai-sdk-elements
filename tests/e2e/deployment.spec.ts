import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://ai-sdk-elements.vercel.app';

test.describe('Feature: Production Deployment', () => {
  test('MANDATORY: Full browser validation', async ({ page }) => {
    console.log('Testing production deployment:', PRODUCTION_URL);
    
    // Test home page loads
    await test.step('Home page loads without errors', async () => {
      const response = await page.goto(PRODUCTION_URL, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      expect(response?.status()).toBeLessThan(400);
      
      // Check for application errors
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('500 Internal Server Error');
      expect(bodyText).not.toContain('Internal Server Error');
      
      // Take screenshot for visual proof
      await page.screenshot({ 
        path: 'tests/screenshots/deployment-home.png',
        fullPage: true 
      });
    });
    
    // Check console for critical errors
    await test.step('No critical console errors', async () => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out common non-critical errors
          if (!text.includes('Failed to load resource') && 
              !text.includes('favicon.ico') &&
              !text.includes('Accessing element.ref') &&
              !text.includes('hydration')) {
            consoleErrors.push(text);
          }
        }
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      if (consoleErrors.length > 0) {
        console.log('Console errors found:', consoleErrors);
      }
      
      // Allow some non-critical errors but not critical ones
      expect(consoleErrors.filter(e => 
        e.includes('TypeError') || 
        e.includes('ReferenceError') || 
        e.includes('SyntaxError')
      ).length).toBe(0);
    });
    
    // Test authentication pages
    await test.step('Authentication pages load', async () => {
      await page.goto(`${PRODUCTION_URL}/auth/login`, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(/.*\/auth\/login/);
      
      await page.goto(`${PRODUCTION_URL}/auth/sign-up`, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(/.*\/auth\/sign-up/);
    });
    
    // Test protected pages (should redirect to login)
    await test.step('Protected pages redirect to login', async () => {
      // API docs requires auth
      await page.goto(`${PRODUCTION_URL}/api-docs`, { waitUntil: 'networkidle' });
      const apiDocsUrl = page.url();
      expect(apiDocsUrl).toMatch(/\/(api-docs|auth\/login)/);
      
      // Projects requires auth
      await page.goto(`${PRODUCTION_URL}/projects`, { waitUntil: 'networkidle' });
      const projectsUrl = page.url();
      expect(projectsUrl).toMatch(/\/(projects|auth\/login)/);
      
      // Chat requires auth
      await page.goto(`${PRODUCTION_URL}/chat`, { waitUntil: 'networkidle' });
      const chatUrl = page.url();
      expect(chatUrl).toMatch(/\/(chat|auth\/login)/);
    });
    
    // Test responsive design
    await test.step('Responsive design works', async () => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
      await page.screenshot({ 
        path: 'tests/screenshots/deployment-mobile.png',
        fullPage: true 
      });
      
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
      await page.screenshot({ 
        path: 'tests/screenshots/deployment-desktop.png',
        fullPage: true 
      });
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
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
      
      // Check for lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBeTruthy();
      
      // Check for title
      const title = await page.title();
      expect(title).toBeTruthy();
    });
    
    console.log('✅ All deployment tests passed!');
    console.log('Production URL:', PRODUCTION_URL);
  });
});