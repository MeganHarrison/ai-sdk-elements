const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to insights page...');
  await page.goto('http://localhost:3003/insights', { waitUntil: 'domcontentloaded' });
  
  console.log('Waiting for content to load...');
  await page.waitForTimeout(5000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'test-results/insights-live-screenshot.png', fullPage: true });
  
  console.log('Screenshot saved to test-results/insights-live-screenshot.png');
  
  await browser.close();
})();
