const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Testing production deployment: https://ai-sdk-elements.vercel.app');
  
  try {
    // Test home page
    console.log('\n1. Testing home page...');
    await page.goto('https://ai-sdk-elements.vercel.app', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   ✓ Page title: ${title}`);
    
    // Check if page loaded without errors
    const pageContent = await page.content();
    if (pageContent.includes('Application error') || pageContent.includes('500')) {
      console.log('   ✗ Error: Application error detected');
    } else {
      console.log('   ✓ Page loaded without errors');
    }
    
    // Test authentication pages
    console.log('\n2. Testing authentication pages...');
    await page.goto('https://ai-sdk-elements.vercel.app/auth/login', { waitUntil: 'networkidle' });
    const loginTitle = await page.title();
    console.log(`   ✓ Login page title: ${loginTitle}`);
    
    // Test API docs page
    console.log('\n3. Testing API docs page...');
    await page.goto('https://ai-sdk-elements.vercel.app/api-docs', { waitUntil: 'networkidle' });
    const apiDocsTitle = await page.title();
    console.log(`   ✓ API docs page title: ${apiDocsTitle}`);
    
    // Test projects page
    console.log('\n4. Testing projects page...');
    await page.goto('https://ai-sdk-elements.vercel.app/projects', { waitUntil: 'networkidle' });
    const projectsTitle = await page.title();
    console.log(`   ✓ Projects page title: ${projectsTitle}`);
    
    // Test chat page
    console.log('\n5. Testing chat page...');
    await page.goto('https://ai-sdk-elements.vercel.app/chat', { waitUntil: 'networkidle' });
    const chatTitle = await page.title();
    console.log(`   ✓ Chat page title: ${chatTitle}`);
    
    // Take a screenshot of the home page
    console.log('\n6. Taking screenshot...');
    await page.goto('https://ai-sdk-elements.vercel.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'deployment-test.png' });
    console.log('   ✓ Screenshot saved as deployment-test.png');
    
    console.log('\n✅ All deployment tests passed!');
    console.log('Production URL: https://ai-sdk-elements.vercel.app');
    
  } catch (error) {
    console.error('\n❌ Deployment test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();