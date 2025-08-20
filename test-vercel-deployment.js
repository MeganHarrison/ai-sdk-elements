const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Testing Vercel deployment...\n');
  
  // Test 1: Homepage
  console.log('1. Testing homepage...');
  const homeResponse = await page.goto('https://ai-sdk-elements.vercel.app', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  console.log(`   Status: ${homeResponse?.status()}`);
  console.log(`   URL: ${page.url()}`);
  
  // Capture homepage screenshot
  await page.screenshot({ path: 'test-results/vercel-homepage.png' });
  
  // Test 2: Check if there are any console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  // Test 3: Projects Dashboard
  console.log('\n2. Testing projects-dashboard...');
  try {
    const dashResponse = await page.goto('https://ai-sdk-elements.vercel.app/projects-dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    console.log(`   Status: ${dashResponse?.status()}`);
    console.log(`   Final URL: ${page.url()}`);
    
    // Wait a bit for any client-side rendering
    await page.waitForTimeout(3000);
    
    // Check for key elements
    const hasProjectInsights = await page.locator('text=/Project.*Insights/i').count() > 0;
    const hasProjectMeetings = await page.locator('text=/Project.*Meetings/i').count() > 0;
    
    console.log(`   Has ProjectInsights: ${hasProjectInsights}`);
    console.log(`   Has ProjectMeetings: ${hasProjectMeetings}`);
    
    // Capture screenshot
    await page.screenshot({ path: 'test-results/vercel-dashboard.png', fullPage: true });
    
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    await page.screenshot({ path: 'test-results/vercel-error.png' });
  }
  
  // Test 4: Check page title
  const title = await page.title();
  console.log(`\n3. Page title: ${title}`);
  
  // Report errors
  if (errors.length > 0) {
    console.log('\n4. Console errors found:');
    errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n4. No console errors');
  }
  
  await browser.close();
  console.log('\nTest complete. Screenshots saved to test-results/');
})();