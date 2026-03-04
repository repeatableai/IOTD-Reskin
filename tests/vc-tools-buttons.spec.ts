import { test, expect } from '@playwright/test';

// Test VC Tools buttons in the Business Builder sidebar
test.describe('VC Tools Buttons - Business Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a business builder page (using wealthnurture as test venture)
    await page.goto('http://localhost:4000/idea/wealthnurture/build/bolt');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('VC Tools section is visible in sidebar', async ({ page }) => {
    // Check that VC Tools card exists
    const vcToolsCard = page.locator('text=VC Tools').first();
    await expect(vcToolsCard).toBeVisible();
  });

  test('AI Disruption Scanner button opens dialog', async ({ page }) => {
    const button = page.locator('button:has-text("AI Disruption Scanner")').first();
    await expect(button).toBeVisible();
    await button.click();

    // Check dialog opened (look for dialog content)
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Future Cast button opens dialog', async ({ page }) => {
    const button = page.locator('button:has-text("Future Cast")').first();
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('IC Memo button opens dialog', async ({ page }) => {
    const button = page.locator('button:has-text("IC Memo")').first();
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Market Sizing V2 button opens dialog', async ({ page }) => {
    const button = page.locator('button:has-text("Market Sizing V2")').first();
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Bell-Mason Diagnostic button opens dialog', async ({ page }) => {
    const button = page.locator('button:has-text("Bell-Mason Diagnostic")').first();
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});

// Test that VC Tools buttons are NOT on venture details page
test.describe('VC Tools Buttons - Venture Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/idea/wealthnurture');
    await page.waitForLoadState('networkidle');
  });

  test('IC Memo button should NOT be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-ic-memo"]');
    await expect(button).not.toBeVisible();
  });

  test('Market Sizing V2 button should NOT be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-market-sizing"]');
    await expect(button).not.toBeVisible();
  });

  test('Bell-Mason Diagnostic button should NOT be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-bell-mason"]');
    await expect(button).not.toBeVisible();
  });

  test('Future Cast button should NOT be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-future-cast"]');
    await expect(button).not.toBeVisible();
  });

  test('Torpedo button should still be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-roast-idea"]');
    await expect(button).toBeVisible();
  });

  test('Export button should still be visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-export-data"]');
    await expect(button).toBeVisible();
  });
});
