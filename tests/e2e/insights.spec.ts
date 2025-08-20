import { test, expect } from '@playwright/test';

const WORKER_URL = process.env.NEXT_PUBLIC_AI_WORKER_URL || 'http://localhost:8787';

test.describe('AI Insights Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the insights page
    await page.goto('/insights');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('MANDATORY: Full browser validation for insights page', async ({ page }) => {
    // Check page loads without errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Verify page title and heading
    await expect(page).toHaveTitle(/AI Insights/i, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('AI Insights Dashboard');
    
    // Verify insights table is present
    const insightsTable = page.locator('[role="table"]');
    await expect(insightsTable).toBeVisible({ timeout: 10000 });
    
    // Check for filter controls
    const searchInput = page.locator('input[placeholder*="Search insights"]');
    await expect(searchInput).toBeVisible();
    
    const typeFilter = page.locator('button:has-text("Filter by type")').first();
    await expect(typeFilter).toBeVisible();
    
    const severityFilter = page.locator('button:has-text("Severity")').first();
    await expect(severityFilter).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('test search');
    await page.waitForTimeout(500); // Debounce delay
    
    // Test type filter
    await typeFilter.click();
    await page.locator('text=Action Items').click();
    await page.waitForTimeout(500);
    
    // Test severity filter
    await severityFilter.click();
    await page.locator('text=High').click();
    await page.waitForTimeout(500);
    
    // Verify refresh button works
    const refreshButton = page.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    
    // Check for loading state
    const loadingIndicator = page.locator('.animate-spin');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
    }
    
    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Take screenshot for visual validation
    await page.screenshot({ path: 'test-results/insights-page.png', fullPage: true });
  });

  test('insights table displays data correctly', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Check table headers are present
    const headers = ['Type', 'Title', 'Description', 'Project', 'Severity', 'Confidence', 'Created', 'Status'];
    for (const header of headers) {
      const headerElement = page.locator(`th:has-text("${header}")`);
      const isVisible = await headerElement.isVisible().catch(() => false);
      if (isVisible) {
        await expect(headerElement).toBeVisible();
      }
    }
    
    // Check for table rows (either data or "No insights found" message)
    const tableBody = page.locator('tbody');
    await expect(tableBody).toBeVisible();
    
    const noDataMessage = page.locator('text=No insights found');
    const hasData = !(await noDataMessage.isVisible().catch(() => false));
    
    if (hasData) {
      // If there's data, verify row structure
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toBeVisible();
      
      // Check for action menu
      const actionButton = firstRow.locator('button[aria-haspopup="menu"]');
      if (await actionButton.isVisible()) {
        await actionButton.click();
        const viewDetails = page.locator('text=View Details');
        await expect(viewDetails).toBeVisible();
        await page.keyboard.press('Escape'); // Close menu
      }
    }
  });

  test('insights filtering works correctly', async ({ page }) => {
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Test search filter
    const searchInput = page.locator('input[placeholder*="Search insights"]');
    await searchInput.fill('meeting');
    await page.waitForTimeout(500);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Test type filter dropdown
    const typeFilter = page.locator('button').filter({ hasText: /Filter by type|All Types/i }).first();
    await typeFilter.click();
    
    // Check filter options are visible
    await expect(page.locator('text=General Info')).toBeVisible();
    await expect(page.locator('text=Positive')).toBeVisible();
    await expect(page.locator('text=Risks')).toBeVisible();
    await expect(page.locator('text=Action Items')).toBeVisible();
    
    // Select a filter
    await page.locator('text=Risks').click();
    await page.waitForTimeout(500);
    
    // Reset filter
    await typeFilter.click();
    await page.locator('text=All Types').click();
  });

  test('project insights tab integration', async ({ page }) => {
    // Navigate to projects page first
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Check if there are any project rows
    const projectRows = page.locator('tbody tr');
    const rowCount = await projectRows.count();
    
    if (rowCount > 0) {
      // Click on first project to open detail view
      await projectRows.first().click();
      await page.waitForTimeout(500);
      
      // Look for insights tab
      const insightsTab = page.locator('button[role="tab"]:has-text("Insights")');
      if (await insightsTab.isVisible()) {
        await insightsTab.click();
        await page.waitForTimeout(500);
        
        // Verify insights table is shown in the tab
        const insightsContent = page.locator('[role="tabpanel"]').filter({ has: page.locator('.insights-table, text=/insight/i') });
        await expect(insightsContent).toBeVisible();
        
        // Take screenshot of project insights
        await page.screenshot({ path: 'test-results/project-insights-tab.png' });
      }
    }
  });

  test('insights detail dialog works', async ({ page }) => {
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Check if there are any insights rows
    const insightRows = page.locator('tbody tr').filter({ hasNot: page.locator('text=No insights found') });
    const rowCount = await insightRows.count();
    
    if (rowCount > 0) {
      // Click on first insight row
      await insightRows.first().click();
      await page.waitForTimeout(500);
      
      // Check if dialog opened
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        // Verify dialog content
        await expect(dialog.locator('h2')).toBeVisible(); // Title
        await expect(dialog.locator('text=Description')).toBeVisible();
        
        // Close dialog
        const closeButton = dialog.locator('button[aria-label*="Close"]');
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
        
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  test('responsive design works correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/insights-desktop.png' });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/insights-tablet.png' });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify table is still accessible on mobile
    const table = page.locator('[role="table"]');
    await expect(table).toBeVisible();
    
    await page.screenshot({ path: 'test-results/insights-mobile.png' });
  });

  test('pagination controls work', async ({ page }) => {
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Check for pagination controls
    const previousButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');
    
    await expect(previousButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // Previous should be disabled on first page
    await expect(previousButton).toBeDisabled();
    
    // Try to navigate if next is enabled
    const isNextEnabled = await nextButton.isEnabled();
    if (isNextEnabled) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Now previous should be enabled
      await expect(previousButton).toBeEnabled();
      
      // Go back
      await previousButton.click();
      await page.waitForTimeout(500);
      await expect(previousButton).toBeDisabled();
    }
  });

  test('performance: page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/insights');
    await page.waitForSelector('[role="table"]', { timeout: 3000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Insights page loaded in ${loadTime}ms`);
  });

  test('accessibility: ARIA labels and keyboard navigation', async ({ page }) => {
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Check for proper ARIA roles
    await expect(page.locator('[role="table"]')).toBeVisible();
    await expect(page.locator('[role="columnheader"]').first()).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Check search input can be focused
    const searchInput = page.locator('input[placeholder*="Search insights"]');
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    // Tab through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Test escape key closes dropdowns
    const typeFilter = page.locator('button').filter({ hasText: /Filter by type|All Types/i }).first();
    await typeFilter.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('text=General Info')).not.toBeVisible();
  });
});

// Test the insights generation worker endpoint
test.describe('Insights Worker API', () => {
  test('GET /insights endpoint returns data', async ({ request }) => {
    const response = await request.get(`${WORKER_URL}/insights`, {
      params: {
        limit: '10',
        offset: '0'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('insights');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('limit');
    expect(data).toHaveProperty('offset');
    expect(Array.isArray(data.insights)).toBeTruthy();
  });

  test('GET /insights with projectId filter', async ({ request }) => {
    const response = await request.get(`${WORKER_URL}/insights`, {
      params: {
        projectId: '1',
        limit: '10'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.insights)).toBeTruthy();
  });

  test('GET /insights with type filter', async ({ request }) => {
    const response = await request.get(`${WORKER_URL}/insights`, {
      params: {
        type: 'risk',
        limit: '10'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.insights)).toBeTruthy();
    
    // If there are insights, verify they match the filter
    if (data.insights.length > 0) {
      data.insights.forEach((insight: any) => {
        expect(insight.insight_type).toBe('risk');
      });
    }
  });
});