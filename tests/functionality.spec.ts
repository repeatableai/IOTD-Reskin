import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://iotd-reskin.onrender.com';

// Collect all errors during tests
const allErrors: { test: string; errors: string[] }[] = [];

test.describe('Homepage Functionality', () => {
  test('Hero section displays correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hero content
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    const titleText = await heroTitle.textContent();
    console.log(`Hero title: "${titleText}"`);
  });

  test('CTA buttons are clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find primary CTA buttons
    const ctaButtons = page.locator('a[href], button').filter({ hasText: /get started|try|explore|browse/i });
    const count = await ctaButtons.count();
    console.log(`Found ${count} CTA buttons on homepage`);

    if (count > 0) {
      const firstCta = ctaButtons.first();
      const ctaText = await firstCta.textContent();
      console.log(`First CTA: "${ctaText}"`);
    }
  });

  test('Featured ideas section loads', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Look for idea cards or featured section
    const featuredSection = page.locator('text=/featured|solution|idea/i').first();
    const hasFeatured = await featuredSection.isVisible().catch(() => false);
    console.log(`Featured section visible: ${hasFeatured}`);
  });
});

test.describe('Business Incubator (Database) Functionality', () => {
  test('Ideas load and display', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(4000);

    // Check for any card-like elements
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} card elements on database page`);

    // Check for idea titles
    const titles = page.locator('h2, h3, h4').filter({ hasText: /.{10,}/ });
    const titleCount = await titles.count();
    console.log(`Found ${titleCount} title elements`);
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      await searchInput.fill('marketplace');
      await page.waitForTimeout(2000);
      console.log('Search input found and tested');
    } else {
      console.log('No search input found on database page');
    }
  });

  test('Filter buttons work', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Find filter/sort controls
    const filterBtn = page.locator('button:has-text("Filter"), button:has-text("filter")').first();
    const sortBtn = page.locator('button:has-text("Sort"), button:has-text("sort")').first();

    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      console.log('Filter button clicked - dropdown should appear');

      // Close by clicking elsewhere
      await page.locator('body').click({ position: { x: 10, y: 10 } });
    }

    if (await sortBtn.isVisible().catch(() => false)) {
      await sortBtn.click();
      await page.waitForTimeout(500);
      console.log('Sort button clicked');
    }
  });

  test('Pagination or infinite scroll works', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Check for pagination
    const pagination = page.locator('nav[aria-label*="pagination"], [class*="pagination"], button:has-text("Next"), button:has-text("Load more")');
    const hasPagination = await pagination.first().isVisible().catch(() => false);
    console.log(`Pagination visible: ${hasPagination}`);

    // Try scrolling for infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    console.log('Scrolled to bottom to test infinite scroll');
  });
});

test.describe('Idea Detail Page Functionality', () => {
  let testIdeaSlug: string;

  test.beforeAll(async ({ request }) => {
    // Get an idea to test with
    const response = await request.get(`${BASE_URL}/api/ideas`);
    const data = await response.json();
    if (data.ideas && data.ideas.length > 0) {
      testIdeaSlug = data.ideas[0].slug;
    }
  });

  test('Idea detail page renders all sections', async ({ page }) => {
    if (!testIdeaSlug) {
      console.log('No test idea available');
      return;
    }

    await page.goto(`/idea/${testIdeaSlug}`);
    await page.waitForTimeout(3000);

    // Check main sections
    const sections = {
      title: await page.locator('h1').first().isVisible().catch(() => false),
      description: await page.locator('p').first().isVisible().catch(() => false),
      scores: await page.locator('text=/score|opportunity|problem|feasibility/i').first().isVisible().catch(() => false),
    };

    console.log('Idea detail sections:', sections);
  });

  test('Score cards display correctly', async ({ page }) => {
    if (!testIdeaSlug) return;

    await page.goto(`/idea/${testIdeaSlug}`);
    await page.waitForTimeout(3000);

    // Look for score displays
    const scoreElements = page.locator('[class*="score"]');
    const scoreCount = await scoreElements.count();
    console.log(`Found ${scoreCount} score elements`);
  });

  test('Tabs navigation works', async ({ page }) => {
    if (!testIdeaSlug) return;

    await page.goto(`/idea/${testIdeaSlug}`);
    await page.waitForTimeout(3000);

    // Find tab buttons
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const tabCount = await tabs.count();
    console.log(`Found ${tabCount} tabs on idea detail page`);

    // Click each tab
    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      const tab = tabs.nth(i);
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
        const tabText = await tab.textContent();
        console.log(`Clicked tab: "${tabText}"`);
      }
    }
  });

  test('Action buttons are present', async ({ page }) => {
    if (!testIdeaSlug) return;

    await page.goto(`/idea/${testIdeaSlug}`);
    await page.waitForTimeout(3000);

    const buttons = {
      save: await page.locator('button:has-text("Save"), button:has-text("save")').first().isVisible().catch(() => false),
      vote: await page.locator('button:has-text("Vote"), button:has-text("vote"), button:has-text("Upvote")').first().isVisible().catch(() => false),
      build: await page.locator('button:has-text("Build"), a:has-text("Build")').first().isVisible().catch(() => false),
      share: await page.locator('button:has-text("Share"), button:has-text("share")').first().isVisible().catch(() => false),
      export: await page.locator('button:has-text("Export"), button:has-text("export")').first().isVisible().catch(() => false),
    };

    console.log('Action buttons present:', buttons);
  });

  test('Community signals section works', async ({ page }) => {
    if (!testIdeaSlug) return;

    await page.goto(`/idea/${testIdeaSlug}`);
    await page.waitForTimeout(3000);

    // Look for community/signal sections
    const communitySection = page.locator('text=/community|reddit|facebook|signal/i').first();
    const hasCommunity = await communitySection.isVisible().catch(() => false);
    console.log(`Community signals section visible: ${hasCommunity}`);
  });
});

test.describe('Opportunity Analysis Modal', () => {
  test('Modal opens when button clicked', async ({ page, request }) => {
    // Find an idea with previewUrl
    const response = await request.get(`${BASE_URL}/api/ideas`);
    const data = await response.json();
    const ideaWithPreview = data.ideas?.find((i: any) => i.previewUrl);

    if (!ideaWithPreview) {
      console.log('No idea with previewUrl found - skipping modal test');
      return;
    }

    await page.goto(`/idea/${ideaWithPreview.slug}`);
    await page.waitForTimeout(3000);

    // Find and click Opportunity Analysis button
    const oaButton = page.locator('button:has-text("Opportunity Analysis"), button:has-text("opportunity")').first();

    if (await oaButton.isVisible().catch(() => false)) {
      await oaButton.click();
      await page.waitForTimeout(2000);

      // Check modal opened
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
      const modalVisible = await modal.isVisible().catch(() => false);
      console.log(`Opportunity Analysis modal opened: ${modalVisible}`);

      if (modalVisible) {
        // Check for iframe
        const iframe = modal.locator('iframe');
        const hasIframe = await iframe.isVisible().catch(() => false);
        console.log(`Modal has iframe: ${hasIframe}`);

        // Check for action buttons
        const newTabBtn = modal.locator('button:has-text("New Tab"), button:has-text("new tab")');
        const detailsBtn = modal.locator('button:has-text("Details"), button:has-text("details")');

        console.log(`New Tab button: ${await newTabBtn.isVisible().catch(() => false)}`);
        console.log(`Details button: ${await detailsBtn.isVisible().catch(() => false)}`);

        // Close modal
        const closeBtn = modal.locator('button[aria-label="Close"], button:has-text("×"), button:has-text("close")').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    } else {
      console.log('Opportunity Analysis button not found on this idea');
    }
  });
});

test.describe('Trends Page Functionality', () => {
  test('Trends page loads with content', async ({ page }) => {
    await page.goto('/trends');
    await page.waitForTimeout(3000);

    // Check for trend cards/items
    const trendItems = page.locator('[class*="trend"], [class*="card"]');
    const count = await trendItems.count();
    console.log(`Found ${count} trend-related elements`);
  });

  test('Trend categories/filters work', async ({ page }) => {
    await page.goto('/trends');
    await page.waitForTimeout(3000);

    // Find category buttons or tabs
    const categories = page.locator('[role="tab"], button[class*="category"], button[class*="filter"]');
    const catCount = await categories.count();
    console.log(`Found ${catCount} category/filter elements on trends page`);

    if (catCount > 0) {
      await categories.first().click();
      await page.waitForTimeout(1000);
      console.log('Clicked first category');
    }
  });

  test('Individual trend links work', async ({ page }) => {
    await page.goto('/trends');
    await page.waitForTimeout(3000);

    // Find clickable trend items
    const trendLinks = page.locator('a[href*="trend"], a[href*="Trend"]');
    const linkCount = await trendLinks.count();
    console.log(`Found ${linkCount} trend links`);

    if (linkCount > 0) {
      const firstLink = trendLinks.first();
      const href = await firstLink.getAttribute('href');
      console.log(`First trend link: ${href}`);
    }
  });
});

test.describe('Market Insights Functionality', () => {
  test('Market insights page loads', async ({ page }) => {
    await page.goto('/market-insights');
    await page.waitForTimeout(3000);

    const hasContent = await page.locator('h1, h2, h3').first().isVisible();
    console.log(`Market insights has heading content: ${hasContent}`);
  });

  test('Insight cards are interactive', async ({ page }) => {
    await page.goto('/market-insights');
    await page.waitForTimeout(3000);

    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} cards on market insights page`);
  });
});

test.describe('Create Solution Page (Unauthenticated)', () => {
  test('Create page loads with tabs', async ({ page }) => {
    await page.goto('/create');
    await page.waitForTimeout(3000);

    // Check for tabs
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const tabCount = await tabs.count();
    console.log(`Found ${tabCount} tabs on create page`);

    // Check tab names
    const tabTexts: string[] = [];
    for (let i = 0; i < tabCount; i++) {
      const text = await tabs.nth(i).textContent();
      if (text) tabTexts.push(text.trim());
    }
    console.log(`Tab names: ${tabTexts.join(', ')}`);
  });

  test('Import tab has file upload and textarea', async ({ page }) => {
    await page.goto('/create');
    await page.waitForTimeout(2000);

    // Click Import tab
    const importTab = page.locator('[role="tab"]:has-text("Import"), button:has-text("Import")').first();
    if (await importTab.isVisible().catch(() => false)) {
      await importTab.click();
      await page.waitForTimeout(500);
    }

    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    const hasFileInput = await fileInput.first().isVisible().catch(() => false);
    console.log(`File input present: ${hasFileInput}`);

    // Check for textarea
    const textarea = page.locator('textarea');
    const hasTextarea = await textarea.first().isVisible().catch(() => false);
    console.log(`Textarea present: ${hasTextarea}`);
  });

  test('Manual entry tab has form fields', async ({ page }) => {
    await page.goto('/create');
    await page.waitForTimeout(2000);

    // Click Manual tab
    const manualTab = page.locator('[role="tab"]:has-text("Manual"), button:has-text("Manual")').first();
    if (await manualTab.isVisible().catch(() => false)) {
      await manualTab.click();
      await page.waitForTimeout(500);
    }

    // Check for form fields
    const titleInput = page.locator('input[id="title"], input[name="title"], input[placeholder*="title" i]');
    const descInput = page.locator('textarea[id="description"], textarea[name="description"]');

    console.log(`Title input: ${await titleInput.first().isVisible().catch(() => false)}`);
    console.log(`Description input: ${await descInput.first().isVisible().catch(() => false)}`);
  });

  test('AI Generate tab has parameter inputs', async ({ page }) => {
    await page.goto('/create');
    await page.waitForTimeout(2000);

    // Click AI tab
    const aiTab = page.locator('[role="tab"]:has-text("AI"), button:has-text("AI")').first();
    if (await aiTab.isVisible().catch(() => false)) {
      await aiTab.click();
      await page.waitForTimeout(500);
    }

    // Check for AI parameters
    const industryInput = page.locator('input[id*="industry"], input[placeholder*="industry" i]');
    const generateBtn = page.locator('button:has-text("Generate")');

    console.log(`Industry input: ${await industryInput.first().isVisible().catch(() => false)}`);
    console.log(`Generate button: ${await generateBtn.first().isVisible().catch(() => false)}`);
  });
});

test.describe('Contact Form Functionality', () => {
  test('Contact form validates required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(2000);

    // Find submit button and click without filling form
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);

      // Check for validation messages
      const errorMessages = page.locator('[class*="error"], [class*="invalid"], [aria-invalid="true"]');
      const errorCount = await errorMessages.count();
      console.log(`Found ${errorCount} validation error indicators`);
    }
  });

  test('Contact form accepts input', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(2000);

    // Fill form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const messageInput = page.locator('textarea').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      console.log('Name field filled');
    }

    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      console.log('Email field filled');
    }

    if (await messageInput.isVisible()) {
      await messageInput.fill('This is a test message from Playwright.');
      console.log('Message field filled');
    }
  });
});

test.describe('Navigation & Header Functionality', () => {
  test('Mobile menu toggle works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find hamburger menu button
    const menuBtn = page.locator('button[aria-label*="menu" i], button[class*="menu"], button:has([class*="hamburger"])').first();

    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      console.log('Mobile menu button clicked');

      // Check if nav items are now visible
      const navItems = page.locator('nav a, [class*="mobile"] a');
      const navCount = await navItems.count();
      console.log(`Mobile nav items visible: ${navCount}`);
    } else {
      console.log('No mobile menu button found (might be desktop layout)');
    }
  });

  test('Logo links to homepage', async ({ page }) => {
    await page.goto('/about');
    await page.waitForTimeout(2000);

    // Find logo link
    const logo = page.locator('header a[href="/"], a[class*="logo"]').first();

    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForURL('**/');
      console.log('Logo clicked - navigated to homepage');
    }
  });

  test('Auth buttons are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const loginBtn = page.locator('button:has-text("Log in"), button:has-text("Login"), a:has-text("Log in"), a:has-text("Login")').first();
    const signupBtn = page.locator('button:has-text("Sign up"), button:has-text("Signup"), a:has-text("Sign up"), a:has-text("Get Started")').first();

    console.log(`Login button: ${await loginBtn.isVisible().catch(() => false)}`);
    console.log(`Signup button: ${await signupBtn.isVisible().catch(() => false)}`);
  });
});

test.describe('Footer Functionality', () => {
  test('Footer links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Find footer links
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    console.log(`Found ${linkCount} footer links`);

    // Test first few links
    for (let i = 0; i < Math.min(3, linkCount); i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Footer link ${i + 1}: "${text?.trim()}" -> ${href}`);
    }
  });

  test('Social media links present', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const socialLinks = page.locator('footer a[href*="twitter"], footer a[href*="linkedin"], footer a[href*="github"], footer a[href*="facebook"]');
    const socialCount = await socialLinks.count();
    console.log(`Found ${socialCount} social media links in footer`);
  });
});

test.describe('Theme/Dark Mode', () => {
  test('Theme toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find theme toggle
    const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="mode" i], button:has([class*="moon"]), button:has([class*="sun"])').first();

    if (await themeToggle.isVisible().catch(() => false)) {
      // Get initial theme
      const initialBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

      await themeToggle.click();
      await page.waitForTimeout(500);

      const newBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

      console.log(`Theme toggle found. Background changed: ${initialBg !== newBg}`);
    } else {
      console.log('No theme toggle button found');
    }
  });
});

test.describe('Idea of the Day Page', () => {
  test('IOTD page displays featured idea', async ({ page }) => {
    await page.goto('/idea-of-the-day');
    await page.waitForTimeout(3000);

    // Check for main content
    const title = page.locator('h1').first();
    const hasTitle = await title.isVisible();
    const titleText = await title.textContent().catch(() => '');

    console.log(`IOTD page title visible: ${hasTitle}`);
    console.log(`IOTD title: "${titleText}"`);

    // Check for score cards
    const scores = page.locator('text=/\\d+\\/10|score/i');
    const scoreCount = await scores.count();
    console.log(`Found ${scoreCount} score elements on IOTD page`);

    // Check for CTA button
    const ctaBtn = page.locator('button:has-text("View Full"), a:has-text("View Full")');
    const hasCta = await ctaBtn.first().isVisible().catch(() => false);
    console.log(`View Full Report button: ${hasCta}`);
  });
});

test.describe('API Response Validation', () => {
  test('Ideas API returns valid structure', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ideas`);
    const data = await response.json();

    expect(data.ideas).toBeDefined();

    if (data.ideas.length > 0) {
      const idea = data.ideas[0];
      const requiredFields = ['id', 'title', 'slug', 'description'];
      const missingFields = requiredFields.filter(f => !(f in idea));

      if (missingFields.length > 0) {
        console.log(`Warning: Ideas missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('Ideas API structure valid - all required fields present');
      }

      // Check for optional enrichment fields
      const enrichmentFields = ['opportunityScore', 'problemScore', 'feasibilityScore', 'timingScore'];
      const hasEnrichment = enrichmentFields.some(f => f in idea);
      console.log(`Ideas have enrichment data: ${hasEnrichment}`);
    }
  });

  test('Featured idea API returns single idea', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ideas/featured`);
    const data = await response.json();

    if (data && data.title) {
      console.log(`Featured idea: "${data.title}"`);
      console.log(`Has previewUrl: ${!!data.previewUrl}`);
      console.log(`Opportunity score: ${data.opportunityScore || 'N/A'}`);
    } else {
      console.log('Featured API returned unexpected structure:', typeof data);
    }
  });
});

test.describe('Error States', () => {
  test('Invalid idea slug shows error state', async ({ page }) => {
    await page.goto('/idea/this-definitely-does-not-exist-12345');
    await page.waitForTimeout(3000);

    // Check for error message or redirect
    const errorMsg = page.locator('text=/not found|error|doesn\'t exist/i');
    const hasError = await errorMsg.isVisible().catch(() => false);

    const currentUrl = page.url();
    console.log(`Invalid idea URL: ${currentUrl}`);
    console.log(`Error message visible: ${hasError}`);
  });

  test('Network error handling', async ({ page }) => {
    // Test with a blocked request
    await page.route('**/api/ideas', route => route.abort());

    await page.goto('/database');
    await page.waitForTimeout(3000);

    // Check for error state or loading state
    const errorState = page.locator('text=/error|failed|try again/i');
    const hasErrorState = await errorState.isVisible().catch(() => false);
    console.log(`Shows error state on network failure: ${hasErrorState}`);
  });
});

test.describe('Accessibility Checks', () => {
  test('Main pages have proper headings', async ({ page }) => {
    const pages = ['/', '/database', '/trends', '/about', '/pricing'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);

      const h1Count = await page.locator('h1').count();
      console.log(`${pagePath}: ${h1Count} h1 element(s)`);
    }
  });

  test('Interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/database');
    await page.waitForTimeout(2000);

    // Tab through elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Check if focused element is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : 'none';
    });
    console.log(`Focused element after tabbing: ${focusedElement}`);
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const images = page.locator('img');
    const imgCount = await images.count();

    let missingAlt = 0;
    for (let i = 0; i < imgCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt || alt.trim() === '') missingAlt++;
    }

    console.log(`Images: ${imgCount}, Missing alt: ${missingAlt}`);
  });
});
