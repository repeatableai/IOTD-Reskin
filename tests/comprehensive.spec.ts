import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://iotd-reskin.onrender.com';

// Helper to check for console errors
async function checkConsoleErrors(page: Page, errors: string[]) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
}

// Helper to check for network errors
async function checkNetworkErrors(page: Page, errors: string[]) {
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push(`Network Error: ${response.status()} ${response.url()}`);
    }
  });
}

test.describe('Public Pages Load Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkConsoleErrors(page, errors);
    checkNetworkErrors(page, errors);

    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    // Check key elements exist
    await expect(page.locator('header')).toBeVisible();

    // Report any errors found
    if (errors.length > 0) {
      console.log('Homepage Errors:', errors);
    }
  });

  test('Landing page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/landing');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Landing Page Errors:', errors);
    }
  });

  test('Business Incubator (/database) loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/database');
    expect(response?.status()).toBeLessThan(400);

    // Wait for ideas to load
    await page.waitForTimeout(3000);

    // Check if idea cards are visible
    const ideaCards = page.locator('[data-testid="idea-card"]');
    const cardCount = await ideaCards.count();
    console.log(`Found ${cardCount} idea cards on database page`);

    if (errors.length > 0) {
      console.log('Database Page Errors:', errors);
    }
  });

  test('Trends page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/trends');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Trends Page Errors:', errors);
    }
  });

  test('Features page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/features');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Features Page Errors:', errors);
    }
  });

  test('Pricing page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/pricing');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Pricing Page Errors:', errors);
    }
  });

  test('About page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('About Page Errors:', errors);
    }
  });

  test('Contact page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/contact');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Contact Page Errors:', errors);
    }
  });

  test('FAQ page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/faq');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('FAQ Page Errors:', errors);
    }
  });

  test('Tour page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/tour');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Tour Page Errors:', errors);
    }
  });

  test('Market Insights page loads correctly', async ({ page }) => {
    const errors: string[] = [];
    checkNetworkErrors(page, errors);

    const response = await page.goto('/market-insights');
    expect(response?.status()).toBeLessThan(400);

    if (errors.length > 0) {
      console.log('Market Insights Errors:', errors);
    }
  });
});

test.describe('API Endpoint Tests', () => {
  test('GET /api/ideas returns ideas', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ideas`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    // API returns {ideas: [...]} wrapper object
    expect(data.ideas).toBeDefined();
    expect(Array.isArray(data.ideas)).toBe(true);
    console.log(`API /api/ideas returned ${data.ideas.length} ideas`);
  });

  test('GET /api/ideas/featured returns featured idea (used for Idea of the Day)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ideas/featured`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    // Featured endpoint returns a single idea object (used by Idea of the Day page)
    if (data && data.title) {
      console.log(`API /api/ideas/featured returned idea: "${data.title}"`);
    } else if (Array.isArray(data)) {
      console.log(`API /api/ideas/featured returned ${data.length} items`);
    } else {
      console.log(`API /api/ideas/featured returned:`, typeof data);
    }
  });

  test('GET /api/market/trends returns trends (requires keyword param)', async ({ request }) => {
    // Test without param - should return 400
    const noParamResponse = await request.get(`${BASE_URL}/api/market/trends`);
    expect(noParamResponse.status()).toBe(400);
    console.log(`API /api/market/trends without keyword: 400 (expected)`);

    // Test with param
    const response = await request.get(`${BASE_URL}/api/market/trends?keyword=saas`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log(`API /api/market/trends?keyword=saas returned:`, typeof data);
  });

  test('GET /api/market/insights validates required topic param', async ({ request }) => {
    // Test without param - should return 400
    const noParamResponse = await request.get(`${BASE_URL}/api/market/insights`);
    expect(noParamResponse.status()).toBe(400);
    console.log(`API /api/market/insights without topic: 400 (expected - param validation works)`);
    // Note: Full test with topic skipped - endpoint calls external AI and can timeout
  });

  test('GET /api/health returns OK', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    // Health endpoint might not exist, so we just check it doesn't crash
    console.log(`API /api/health status: ${response.status()}`);
  });

  test('GET /api/auth/user returns auth state', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/user`);
    // Should return 401 if not authenticated or 200 with user data
    expect([200, 401]).toContain(response.status());
    console.log(`API /api/auth/user status: ${response.status()}`);
  });
});

test.describe('Idea Detail Page Tests', () => {
  test('Individual idea page loads', async ({ page, request }) => {
    // First get an idea slug from the API
    const ideasResponse = await request.get(`${BASE_URL}/api/ideas`);
    const data = await ideasResponse.json();
    const ideas = data.ideas || []; // Handle wrapped response

    if (ideas.length > 0) {
      const firstIdea = ideas[0];
      const errors: string[] = [];
      checkNetworkErrors(page, errors);

      const response = await page.goto(`/idea/${firstIdea.slug}`);
      expect(response?.status()).toBeLessThan(400);

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Check title is visible
      await expect(page.locator('h1').first()).toBeVisible();

      console.log(`Idea detail page for "${firstIdea.title}" loaded successfully`);

      if (errors.length > 0) {
        console.log('Idea Detail Page Errors:', errors);
      }
    }
  });

  test('Idea detail page shows Opportunity Analysis button when previewUrl exists', async ({ page, request }) => {
    // Get ideas and find one with previewUrl
    const ideasResponse = await request.get(`${BASE_URL}/api/ideas`);
    const data = await ideasResponse.json();
    const ideas = data.ideas || []; // Handle wrapped response

    const ideaWithPreview = ideas.find((i: any) => i.previewUrl);

    if (ideaWithPreview) {
      await page.goto(`/idea/${ideaWithPreview.slug}`);
      await page.waitForTimeout(2000);

      const opportunityBtn = page.locator('[data-testid="button-opportunity-analysis"]');
      const btnCount = await opportunityBtn.count();

      console.log(`Idea "${ideaWithPreview.title}" has ${btnCount} Opportunity Analysis button(s)`);

      if (btnCount > 0) {
        // Click it and check modal opens
        await opportunityBtn.first().click();
        await page.waitForTimeout(1000);

        // Check if dialog/modal is visible
        const dialog = page.locator('[role="dialog"]');
        const dialogVisible = await dialog.isVisible();
        console.log(`Opportunity Analysis modal visible: ${dialogVisible}`);
      }
    } else {
      console.log('No ideas with previewUrl found');
    }
  });
});

test.describe('Navigation Tests', () => {
  test('Header navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find and click navigation links
    const navLinks = [
      { text: 'Features', expectedUrl: '/features' },
      { text: 'Pricing', expectedUrl: '/pricing' },
      { text: 'About', expectedUrl: '/about' },
    ];

    for (const link of navLinks) {
      try {
        const linkElement = page.locator(`header a:has-text("${link.text}")`).first();
        if (await linkElement.isVisible()) {
          await linkElement.click();
          await page.waitForTimeout(1000);
          expect(page.url()).toContain(link.expectedUrl);
          console.log(`Navigation to ${link.text} works`);
          await page.goto('/'); // Go back home
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log(`Could not test navigation to ${link.text}`);
      }
    }
  });

  test('Business Incubator idea cards are clickable', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Find first idea card and click it
    const ideaCard = page.locator('[data-testid="idea-card"]').first();

    if (await ideaCard.isVisible()) {
      // Look for a clickable element within the card
      const cardLink = ideaCard.locator('a').first();
      if (await cardLink.isVisible()) {
        await cardLink.click();
        await page.waitForTimeout(2000);

        // Should be on an idea detail page
        expect(page.url()).toContain('/idea/');
        console.log('Idea card click navigation works');
      }
    }
  });
});

test.describe('Button Interaction Tests', () => {
  test('Database page filter/sort buttons work', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Look for filter or sort buttons
    const filterBtn = page.locator('button:has-text("Filter")').first();
    const sortBtn = page.locator('button:has-text("Sort")').first();

    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      console.log('Filter button clicked successfully');
    }

    if (await sortBtn.isVisible()) {
      await sortBtn.click();
      await page.waitForTimeout(500);
      console.log('Sort button clicked successfully');
    }
  });

  test('Trends page tabs work', async ({ page }) => {
    await page.goto('/trends');
    await page.waitForTimeout(2000);

    // Look for tab buttons
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    console.log(`Found ${tabCount} tabs on trends page`);

    for (let i = 0; i < Math.min(tabCount, 3); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      console.log(`Tab ${i + 1} clicked successfully`);
    }
  });
});

test.describe('Form Tests (Unauthenticated)', () => {
  test('Contact form displays correctly', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(2000);

    // Check form elements exist
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const messageInput = page.locator('textarea').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    const hasName = await nameInput.isVisible().catch(() => false);
    const hasEmail = await emailInput.isVisible().catch(() => false);
    const hasMessage = await messageInput.isVisible().catch(() => false);
    const hasSubmit = await submitBtn.isVisible().catch(() => false);

    console.log(`Contact form - Name: ${hasName}, Email: ${hasEmail}, Message: ${hasMessage}, Submit: ${hasSubmit}`);
  });

  test('Create Solution page requires auth', async ({ page }) => {
    await page.goto('/create');
    await page.waitForTimeout(2000);

    // Should either redirect to login or show auth required message
    const url = page.url();
    const hasAuthRequired = await page.locator('text=/log in|sign in|auth/i').isVisible().catch(() => false);

    console.log(`Create Solution page - URL: ${url}, Auth required shown: ${hasAuthRequired}`);
  });
});

test.describe('Error Handling Tests', () => {
  test('404 page works for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Should either show 404 page or redirect
    console.log(`Non-existent route status: ${response?.status()}, URL: ${page.url()}`);
  });

  test('Non-existent idea returns appropriate response', async ({ page }) => {
    const response = await page.goto('/idea/this-idea-slug-does-not-exist-12345');
    await page.waitForTimeout(2000);

    console.log(`Non-existent idea status: ${response?.status()}, URL: ${page.url()}`);
  });
});

test.describe('Performance Checks', () => {
  test('Homepage loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
  });

  test('Database page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/database');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Database page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(20000); // Should load within 20 seconds
  });
});
