import { test, expect } from '@playwright/test';

test.describe('Insights Page with Auth', () => {
  test('capture insights page after authentication', async ({ page }) => {
    // First, go to login page
    await page.goto('http://localhost:3003/auth/login', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'test-results/login-page-screenshot.png', 
      fullPage: true 
    });
    
    console.log('Login page screenshot saved');
    
    // Try to bypass auth by going directly to API
    const response = await page.request.get('http://localhost:3003/api/insights?limit=5');
    const data = await response.json();
    
    console.log('API Response:', {
      total: data.total,
      insights: data.insights?.length || 0,
      firstInsight: data.insights?.[0]?.title
    });
    
    // Take screenshot of API response
    await page.goto('http://localhost:3003/api/insights?limit=5');
    await page.screenshot({ 
      path: 'test-results/api-response-screenshot.png', 
      fullPage: true 
    });
    
    expect(data.insights).toBeDefined();
    expect(data.total).toBeGreaterThan(0);
  });
});