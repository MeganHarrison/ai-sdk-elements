import { test as base, expect, Page } from '@playwright/test';

export const test = base.extend({
  // Auto-navigate to home page before each test
  page: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
});

export { expect };

export class TestHelpers {
  constructor(private page: Page) {}

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async checkConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async checkAccessibility() {
    const violations = await this.page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images without alt text`);
      }

      // Check for ARIA labels on buttons
      const buttons = document.querySelectorAll('button:not([aria-label])');
      if (buttons.length > 0) {
        issues.push(`${buttons.length} buttons without aria-label`);
      }

      // Check for form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
      if (inputs.length > 0) {
        issues.push(`${inputs.length} inputs without labels`);
      }

      return issues;
    });

    return violations;
  }

  async checkResponsive() {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-small' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await this.page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      await this.page.waitForTimeout(500);
      await this.takeScreenshot(`responsive-${viewport.name}`);
    }
  }

  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });

    return metrics;
  }
}

// Mandatory test checklist
export async function runMandatoryChecks(page: Page, featureName: string) {
  const helpers = new TestHelpers(page);
  const results = {
    feature: featureName,
    passed: true,
    checks: {
      consoleErrors: false,
      accessibility: false,
      responsive: false,
      performance: false,
      loadTime: 0
    }
  };

  // Check for console errors
  const errors = await helpers.checkConsoleErrors();
  if (errors.length === 0) {
    results.checks.consoleErrors = true;
  } else {
    console.error('Console errors found:', errors);
    results.passed = false;
  }

  // Check accessibility
  const violations = await helpers.checkAccessibility();
  if (violations.length === 0) {
    results.checks.accessibility = true;
  } else {
    console.error('Accessibility issues:', violations);
    results.passed = false;
  }

  // Check responsive design
  try {
    await helpers.checkResponsive();
    results.checks.responsive = true;
  } catch (error) {
    console.error('Responsive check failed:', error);
    results.passed = false;
  }

  // Check performance
  const metrics = await helpers.measurePerformance();
  results.checks.loadTime = metrics.loadTime;
  if (metrics.loadTime < 3000) {
    results.checks.performance = true;
  } else {
    console.error('Page load too slow:', metrics.loadTime, 'ms');
    results.passed = false;
  }

  return results;
}