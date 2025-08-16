import { test, expect } from '@playwright/test';

test.describe('AI Chatbot', () => {
  test('should load homepage and display chat interface', async ({ page }) => {
    await page.goto('/');
    
    // Check for conversation area
    await expect(page.locator('[role="log"]')).toBeVisible();
    
    // Check for prompt input
    const promptInput = page.locator('textarea[placeholder*="Message"]');
    await expect(promptInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled(); // Should be disabled when input is empty
  });

  test('should enable submit button when text is entered', async ({ page }) => {
    await page.goto('/');
    
    const promptInput = page.locator('textarea[placeholder*="Message"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Type a message
    await promptInput.fill('Hello, AI!');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should toggle web search option', async ({ page }) => {
    await page.goto('/');
    
    // Find and click the search button
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();
    
    // Click to activate
    await searchButton.click();
    await expect(searchButton).toHaveAttribute('data-state', 'active');
    
    // Click to deactivate
    await searchButton.click();
    await expect(searchButton).not.toHaveAttribute('data-state', 'active');
  });

  test('should switch between AI models', async ({ page }) => {
    await page.goto('/');
    
    // Find model selector
    const modelSelector = page.locator('button[role="combobox"]');
    await expect(modelSelector).toBeVisible();
    
    // Click to open dropdown
    await modelSelector.click();
    
    // Check for model options
    await expect(page.locator('text=GPT 4o')).toBeVisible();
    await expect(page.locator('text=Deepseek R1')).toBeVisible();
    
    // Select Deepseek R1
    await page.locator('text=Deepseek R1').click();
    
    // Verify selection
    await expect(modelSelector).toContainText('Deepseek R1');
  });
});