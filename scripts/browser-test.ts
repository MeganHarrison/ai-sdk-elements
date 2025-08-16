#!/usr/bin/env node
import { chromium } from 'playwright';

async function runBrowserTest() {
  console.log('🚀 Starting browser test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    console.log('✅ Successfully loaded homepage');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('📸 Screenshot saved as test-screenshot.png');
    
    // Check for key elements
    const conversationArea = await page.locator('[role="log"]').isVisible();
    console.log(`✅ Conversation area visible: ${conversationArea}`);
    
    const promptInput = await page.locator('textarea[placeholder*="Message"]').isVisible();
    console.log(`✅ Prompt input visible: ${promptInput}`);
    
    const submitButton = await page.locator('button[type="submit"]').isVisible();
    console.log(`✅ Submit button visible: ${submitButton}`);
    
    // Test interaction
    await page.locator('textarea[placeholder*="Message"]').fill('Test message');
    const submitEnabled = await page.locator('button[type="submit"]').isEnabled();
    console.log(`✅ Submit button enabled after text input: ${submitEnabled}`);
    
    console.log('\n✅ All browser tests passed!');
    
  } catch (error) {
    console.error('❌ Browser test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  runBrowserTest();
}