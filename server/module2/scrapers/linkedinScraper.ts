/**
 * LinkedIn Profile Scraper
 * Scrapes PUBLIC LinkedIn profiles with rate limiting and stealth
 * Does NOT attempt login - only extracts publicly visible data
 */

import type { RawContact } from '@shared/scrapingTypes';
import { USER_AGENTS } from '@shared/scrapingTypes';

// Rate limiting state
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 8000; // 8 seconds minimum
const MAX_REQUEST_INTERVAL = 12000; // 12 seconds maximum
const MAX_PROFILES_PER_SESSION = 50;

/**
 * Random delay generator for rate limiting
 */
function getRandomDelay(): number {
  return MIN_REQUEST_INTERVAL + Math.random() * (MAX_REQUEST_INTERVAL - MIN_REQUEST_INTERVAL);
}

/**
 * Get random user agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Wait for rate limit
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const delay = getRandomDelay();

  if (elapsed < delay) {
    await new Promise(resolve => setTimeout(resolve, delay - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Check if LinkedIn returned a login wall or rate limit
 */
function isBlockedResponse(html: string): boolean {
  const blockedIndicators = [
    'authwall',
    'login-form',
    'sign in',
    'Join LinkedIn',
    'uas-signin',
    'challenge/verify',
    '999',
  ];
  return blockedIndicators.some(indicator =>
    html.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Parse LinkedIn profile from public HTML
 */
function parseLinkedInProfile(html: string, url: string): Partial<RawContact> | null {
  const profile: Partial<RawContact> = {
    linkedin_url: url,
    source: {
      method: 'linkedin',
      confidence: 70,
      scraped_at: new Date(),
      urls: [url],
    },
  };

  // Extract name from og:title or profile header
  const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  if (ogTitleMatch) {
    const ogTitle = ogTitleMatch[1];
    // LinkedIn format: "Name - Title | LinkedIn" or "Name | LinkedIn"
    const namePart = ogTitle.split(' - ')[0].split(' | ')[0].trim();
    profile.full_name = namePart;

    // Split into first/last name
    const nameParts = namePart.split(' ');
    if (nameParts.length >= 2) {
      profile.first_name = nameParts[0];
      profile.last_name = nameParts.slice(1).join(' ');
    }
  }

  // Extract title from og:title or description
  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="[^"]+\s*-\s*([^|"]+)/i);
  if (titleMatch) {
    profile.title = titleMatch[1].trim();
  }

  // Try meta description for more context
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  if (descMatch) {
    const description = descMatch[1];

    // Extract company if mentioned
    const atMatch = description.match(/\bat\s+([^\.]+)/i);
    if (atMatch) {
      profile.company_name = atMatch[1].trim();
    }

    // Extract location
    const locationMatch = description.match(/(?:located in|based in|from)\s+([^\.]+)/i);
    if (locationMatch) {
      profile.location = locationMatch[1].trim();
    }
  }

  // Parse structured data if available
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd['@type'] === 'Person') {
        profile.full_name = profile.full_name || jsonLd.name;
        profile.title = profile.title || jsonLd.jobTitle;

        if (jsonLd.worksFor) {
          profile.company_name = profile.company_name || jsonLd.worksFor.name;
        }

        if (jsonLd.address) {
          profile.location = profile.location ||
            (jsonLd.address.addressLocality
              ? `${jsonLd.address.addressLocality}, ${jsonLd.address.addressCountry}`
              : jsonLd.address.addressCountry);
        }
      }
    } catch {
      // JSON-LD parsing failed, continue with regex extraction
    }
  }

  // Look for headline in profile header area
  if (!profile.title) {
    const headlineMatch = html.match(/class="[^"]*headline[^"]*"[^>]*>([^<]+)</i);
    if (headlineMatch) {
      const headlineText = headlineMatch[1].trim();
      // Extract title part (usually before "at" or "|")
      const titlePart = headlineText.split(/\s+at\s+|\s*\|\s*/)[0];
      profile.title = titlePart;
    }
  }

  // Look for location
  if (!profile.location) {
    const locationMatch = html.match(/class="[^"]*location[^"]*"[^>]*>([^<]+)</i);
    if (locationMatch) {
      profile.location = locationMatch[1].trim();
    }
  }

  // Validate we got minimum required data
  if (!profile.full_name) {
    return null;
  }

  // Calculate initial data quality score
  let score = 0;
  if (profile.full_name) score += 15;
  if (profile.title) score += 20;
  if (profile.company_name) score += 10;
  if (profile.linkedin_url) score += 15;
  if (profile.location) score += 5;

  profile.data_quality_score = score;

  return profile;
}

/**
 * Scrape a single LinkedIn profile
 */
async function scrapeSingleProfile(url: string): Promise<RawContact | null> {
  await waitForRateLimit();

  const userAgent = getRandomUserAgent();

  console.log(`[LinkedInScraper] Scraping: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      redirect: 'follow',
    });

    // Check for rate limit response (999)
    if (response.status === 999 || response.status === 429) {
      console.warn(`[LinkedInScraper] Rate limited on: ${url}`);
      return null;
    }

    if (!response.ok) {
      console.warn(`[LinkedInScraper] HTTP ${response.status} on: ${url}`);
      return null;
    }

    const html = await response.text();

    // Check for login wall
    if (isBlockedResponse(html)) {
      console.warn(`[LinkedInScraper] Login wall on: ${url}`);
      return null;
    }

    const profile = parseLinkedInProfile(html, url);

    if (profile && profile.full_name) {
      return profile as RawContact;
    }

    return null;

  } catch (error) {
    console.error(`[LinkedInScraper] Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Main LinkedIn profile scraper function
 * Scrapes multiple profiles with rate limiting
 */
export async function scrapeLinkedInProfiles(linkedinUrls: string[]): Promise<RawContact[]> {
  const contacts: RawContact[] = [];
  const rateLimited: string[] = [];

  // Limit to max profiles per session
  const urlsToScrape = linkedinUrls.slice(0, MAX_PROFILES_PER_SESSION);

  console.log(`[LinkedInScraper] Starting to scrape ${urlsToScrape.length} profiles`);

  for (const url of urlsToScrape) {
    const contact = await scrapeSingleProfile(url);

    if (contact) {
      contacts.push(contact);
      console.log(`[LinkedInScraper] Successfully scraped: ${contact.full_name}`);
    } else {
      rateLimited.push(url);
    }

    // Additional random delay between profiles
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );
  }

  console.log(`[LinkedInScraper] Completed: ${contacts.length} scraped, ${rateLimited.length} blocked/rate-limited`);

  return contacts;
}

/**
 * Fallback: Create contact from search result data when LinkedIn is blocked
 */
export function createContactFromSearchResult(
  title: string,
  snippet: string,
  linkedinUrl: string
): RawContact | null {
  // Parse name from LinkedIn URL or title
  const urlSlug = linkedinUrl.match(/linkedin\.com\/in\/([^/?]+)/)?.[1];
  const titleParts = title.split(' - ');

  let fullName = '';

  // Try to get name from title
  if (titleParts.length > 0) {
    const namePart = titleParts[0].trim();
    // Check if it's a name (Title Case, no special chars)
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(namePart)) {
      fullName = namePart;
    }
  }

  // Fallback: try to humanize URL slug
  if (!fullName && urlSlug) {
    const slugName = urlSlug
      .replace(/-/g, ' ')
      .replace(/\d+$/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();

    if (slugName.split(' ').length >= 2) {
      fullName = slugName;
    }
  }

  if (!fullName) {
    return null;
  }

  // Extract title/company from snippet
  let jobTitle = '';
  let company = '';

  // Common pattern: "Title at Company"
  const atMatch = snippet.match(/^([^-|]+?)\s+at\s+([^-|\.]+)/i);
  if (atMatch) {
    jobTitle = atMatch[1].trim();
    company = atMatch[2].trim();
  }

  // Split name
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return {
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    title: jobTitle || undefined,
    company_name: company || undefined,
    linkedin_url: linkedinUrl,
    data_quality_score: 30, // Lower score for search-derived data
    source: {
      method: 'search',
      confidence: 40,
      scraped_at: new Date(),
      urls: [linkedinUrl],
    },
  };
}

export default scrapeLinkedInProfiles;
