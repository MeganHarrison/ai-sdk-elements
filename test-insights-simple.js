const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', err => console.log('Page error:', err.message));
  
  try {
    console.log('1. Going to homepage first...');
    const homeResponse = await page.goto('http://localhost:3003', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    console.log('   Homepage status:', homeResponse?.status());
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/1-homepage.png' });
    
    console.log('2. Navigating to insights page...');
    const insightsResponse = await page.goto('http://localhost:3003/insights', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    console.log('   Insights page status:', insightsResponse?.status());
    console.log('   Current URL:', page.url());
    
    // Wait a bit for any redirects or data loading
    await page.waitForTimeout(2000);
    
    console.log('3. Final URL after wait:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/2-insights-page.png', fullPage: true });
    console.log('4. Screenshot saved to test-results/2-insights-page.png');
    
    // Check for specific elements
    const hasHeading = await page.locator('h1').count();
    const hasTable = await page.locator('table').count();
    const hasCard = await page.locator('.card').count();
    
    console.log('5. Page elements found:');
    console.log('   - H1 headings:', hasHeading);
    console.log('   - Tables:', hasTable);
    console.log('   - Cards:', hasCard);
    
    // Get page title
    const title = await page.title();
    console.log('6. Page title:', title);
    
  } catch (error) {
    console.error('Error occurred:', error.message);
    await page.screenshot({ path: 'test-results/error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
})();