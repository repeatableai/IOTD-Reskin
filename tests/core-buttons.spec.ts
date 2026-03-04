import { test, expect } from '@playwright/test';

// Test core buttons on Business Builder page
test.describe('Core Buttons - Business Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/idea/wealthnurture/build/bolt');
    await page.waitForLoadState('networkidle');
  });

  test('Build This Solution button is visible and clickable', async ({ page }) => {
    const button = page.locator('button:has-text("Build This Solution")');
    await expect(button).toBeVisible();
    // Just verify it's clickable (don't click as it triggers complex action)
    await expect(button).toBeEnabled();
  });

  test('Torpedo button opens dialog', async ({ page }) => {
    const button = page.locator('[data-testid="button-roast-idea"]');
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Export button opens dialog', async ({ page }) => {
    const button = page.locator('[data-testid="button-export-data"]');
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Collaboration Portal button is visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-collaboration-portal"]');
    await expect(button).toBeVisible();
  });

  test('Back to Templates button works', async ({ page }) => {
    const button = page.locator('button:has-text("Back to Templates")');
    await expect(button).toBeVisible();
  });
});

// Test core buttons on Venture Details page
test.describe('Core Buttons - Venture Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/idea/wealthnurture');
    await page.waitForLoadState('networkidle');
  });

  test('Interested button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Interested")').first();
    await expect(button).toBeVisible();
  });

  test('Not Interested button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Not Interested")');
    await expect(button).toBeVisible();
  });

  test('Save button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Save")').first();
    await expect(button).toBeVisible();
  });

  test('Build This Solution button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Build This Solution")');
    await expect(button).toBeVisible();
  });

  test('Torpedo button opens dialog', async ({ page }) => {
    const button = page.locator('[data-testid="button-roast-idea"]');
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Export button opens dialog', async ({ page }) => {
    const button = page.locator('[data-testid="button-export-data"]');
    await expect(button).toBeVisible();
    await button.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('Collaboration Portal button is visible', async ({ page }) => {
    const button = page.locator('[data-testid="button-collaboration-portal"]');
    await expect(button).toBeVisible();
  });

  test('Claim This Idea button is visible', async ({ page }) => {
    const button = page.locator('button:has-text("Claim This Idea")');
    await expect(button).toBeVisible();
  });
});
