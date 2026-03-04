/**
 * Company Website Parser
 * Enriches contacts with email/phone from company websites
 * Includes email pattern discovery
 */

import type { RawContact, EmailPattern, EmailPatternResult } from '@shared/scrapingTypes';
import { USER_AGENTS } from '@shared/scrapingTypes';

// Rate limiting
const REQUEST_INTERVAL_MIN = 3000; // 3 seconds
const REQUEST_INTERVAL_MAX = 4000; // 4 seconds
const MAX_PAGES_PER_DOMAIN = 3;

/**
 * Get random user agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Random delay between requests
 */
async function rateLimit(): Promise<void> {
  const delay = REQUEST_INTERVAL_MIN + Math.random() * (REQUEST_INTERVAL_MAX - REQUEST_INTERVAL_MIN);
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Validate E.164 phone format
 */
function isValidE164(phone: string): boolean {
  // E.164: starts with +, 7-15 digits
  return /^\+[1-9]\d{6,14}$/.test(phone.replace(/[\s.-]/g, ''));
}

/**
 * Validate RFC 5322 email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Normalize phone to E.164 format
 */
function normalizePhone(phone: string): string | null {
  // Remove all non-digit except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle US numbers
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    cleaned = '+' + cleaned;
  } else if (/^\d{10}$/.test(cleaned)) {
    // Assume US if 10 digits
    cleaned = '+1' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return isValidE164(cleaned) ? cleaned : null;
}

/**
 * Extract all phone numbers from text
 */
function extractPhones(text: string): string[] {
  const phones: string[] = [];

  // Common phone patterns
  const phonePatterns = [
    /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,  // US format
    /\+\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g,  // International
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,  // Simple US
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,  // (xxx) xxx-xxxx
  ];

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      const normalized = normalizePhone(match);
      if (normalized && !phones.includes(normalized)) {
        phones.push(normalized);
      }
    }
  }

  return phones;
}

/**
 * Extract all emails from text
 */
function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];

  return matches
    .map(e => e.toLowerCase())
    .filter(e => isValidEmail(e))
    .filter((e, i, arr) => arr.indexOf(e) === i); // Dedupe
}

/**
 * Discover email pattern from found emails
 */
function discoverEmailPattern(emails: string[], domain: string): EmailPatternResult | null {
  const domainEmails = emails.filter(e => e.endsWith(`@${domain}`));

  if (domainEmails.length === 0) {
    return null;
  }

  // Extract local parts (before @)
  const localParts = domainEmails.map(e => e.split('@')[0]);

  // Pattern detection
  const patterns: Record<EmailPattern, number> = {
    'firstname': 0,
    'lastname': 0,
    'firstnamelastname': 0,
    'firstname.lastname': 0,
    'f.lastname': 0,
    'firstnamel': 0,
    'firstname_lastname': 0,
  };

  // Heuristics based on local part format
  for (const local of localParts) {
    if (local.includes('.')) {
      const parts = local.split('.');
      if (parts.length === 2) {
        if (parts[0].length === 1) {
          patterns['f.lastname']++;
        } else {
          patterns['firstname.lastname']++;
        }
      }
    } else if (local.includes('_')) {
      patterns['firstname_lastname']++;
    } else if (/^[a-z]{2,}[a-z]+$/.test(local)) {
      // Check if it's a single name or combined
      if (local.length > 12) {
        patterns['firstnamelastname']++;
      } else if (local.length < 8) {
        patterns['firstname']++;
      } else {
        patterns['firstnamel']++;
      }
    }
  }

  // Find most common pattern
  let maxCount = 0;
  let detectedPattern: EmailPattern = 'firstname.lastname';

  for (const [pattern, count] of Object.entries(patterns)) {
    if (count > maxCount) {
      maxCount = count;
      detectedPattern = pattern as EmailPattern;
    }
  }

  // Calculate confidence based on sample size
  const confidence = domainEmails.length === 1 ? 50 : Math.min(80, 50 + domainEmails.length * 10);

  return {
    pattern: detectedPattern,
    domain,
    confidence,
    samples: domainEmails.slice(0, 5),
  };
}

/**
 * Construct email from pattern
 */
function constructEmail(
  firstName: string,
  lastName: string,
  pattern: EmailPattern,
  domain: string
): string {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const last = lastName.toLowerCase().replace(/[^a-z]/g, '');

  switch (pattern) {
    case 'firstname':
      return `${first}@${domain}`;
    case 'lastname':
      return `${last}@${domain}`;
    case 'firstnamelastname':
      return `${first}${last}@${domain}`;
    case 'firstname.lastname':
      return `${first}.${last}@${domain}`;
    case 'f.lastname':
      return `${first.charAt(0)}.${last}@${domain}`;
    case 'firstnamel':
      return `${first}${last.charAt(0)}@${domain}`;
    case 'firstname_lastname':
      return `${first}_${last}@${domain}`;
    default:
      return `${first}.${last}@${domain}`;
  }
}

/**
 * Find company website via search
 */
async function findCompanyWebsite(companyName: string): Promise<string | null> {
  const query = encodeURIComponent(`${companyName} official website`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract first result URL that's likely the company site
    const urlMatch = html.match(/<a[^>]*href="(https?:\/\/(?:www\.)?([^/]+)[^"]*)"[^>]*class="result__a/);

    if (urlMatch) {
      const resultUrl = urlMatch[1];
      const domain = urlMatch[2];

      // Exclude common non-company sites
      const excludedDomains = [
        'linkedin.com', 'facebook.com', 'twitter.com', 'wikipedia.org',
        'crunchbase.com', 'glassdoor.com', 'indeed.com', 'bloomberg.com',
        'yelp.com', 'yellowpages.com',
      ];

      if (!excludedDomains.some(ex => domain.includes(ex))) {
        return resultUrl;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Scrape a single page for contact info
 */
async function scrapePage(url: string): Promise<{
  emails: string[];
  phones: string[];
  html: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return { emails: [], phones: [], html: '' };
    }

    const html = await response.text();
    const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    return {
      emails: extractEmails(textContent),
      phones: extractPhones(textContent),
      html,
    };
  } catch {
    return { emails: [], phones: [], html: '' };
  }
}

/**
 * Find contact pages on a website
 */
function findContactPages(html: string, baseUrl: string): string[] {
  const pages: string[] = [];
  const base = new URL(baseUrl);

  // Common contact page paths
  const contactPaths = [
    '/contact', '/contact-us', '/about', '/about-us',
    '/team', '/our-team', '/leadership', '/management',
    '/company', '/company/about', '/company/team',
  ];

  // Check for explicit links
  const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]*(?:contact|about|team|leadership)[^<]*)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      const fullUrl = new URL(href, baseUrl).toString();
      if (fullUrl.startsWith(base.origin) && !pages.includes(fullUrl)) {
        pages.push(fullUrl);
      }
    } catch {
      // Invalid URL
    }
  }

  // Add common paths
  for (const path of contactPaths) {
    const fullUrl = `${base.origin}${path}`;
    if (!pages.includes(fullUrl)) {
      pages.push(fullUrl);
    }
  }

  return pages.slice(0, MAX_PAGES_PER_DOMAIN);
}

/**
 * Main enrichment function
 * Takes a contact and attempts to find email/phone from company website
 */
export async function enrichFromCompanyWebsite(contact: RawContact): Promise<RawContact> {
  if (!contact.company_name) {
    return contact;
  }

  console.log(`[WebsiteParser] Enriching contact: ${contact.full_name} at ${contact.company_name}`);

  const enriched = { ...contact };

  try {
    // Find company website
    await rateLimit();
    const websiteUrl = await findCompanyWebsite(contact.company_name);

    if (!websiteUrl) {
      console.log(`[WebsiteParser] Could not find website for: ${contact.company_name}`);
      return contact;
    }

    console.log(`[WebsiteParser] Found website: ${websiteUrl}`);

    // Scrape main page
    await rateLimit();
    const mainPage = await scrapePage(websiteUrl);

    // Find and scrape contact/team pages
    const contactPages = findContactPages(mainPage.html, websiteUrl);
    const allEmails = [...mainPage.emails];
    const allPhones = [...mainPage.phones];

    let pagesScraped = 1;
    for (const pageUrl of contactPages) {
      if (pagesScraped >= MAX_PAGES_PER_DOMAIN) break;

      await rateLimit();
      const pageData = await scrapePage(pageUrl);

      for (const email of pageData.emails) {
        if (!allEmails.includes(email)) {
          allEmails.push(email);
        }
      }

      for (const phone of pageData.phones) {
        if (!allPhones.includes(phone)) {
          allPhones.push(phone);
        }
      }

      pagesScraped++;
    }

    console.log(`[WebsiteParser] Found ${allEmails.length} emails, ${allPhones.length} phones`);

    // Try to discover email pattern
    const domain = new URL(websiteUrl).hostname.replace('www.', '');

    if (allEmails.length > 0 && contact.first_name && contact.last_name) {
      const patternResult = discoverEmailPattern(allEmails, domain);

      if (patternResult) {
        const constructedEmail = constructEmail(
          contact.first_name,
          contact.last_name,
          patternResult.pattern,
          domain
        );

        enriched.email = constructedEmail;
        enriched.email_confidence = patternResult.confidence;

        console.log(`[WebsiteParser] Constructed email: ${constructedEmail} (confidence: ${patternResult.confidence}%)`);
      }
    }

    // Check if we found a direct email match
    if (contact.first_name && contact.last_name) {
      const firstName = contact.first_name.toLowerCase();
      const lastName = contact.last_name.toLowerCase();

      for (const email of allEmails) {
        const local = email.split('@')[0];
        if (local.includes(firstName) || local.includes(lastName)) {
          enriched.email = email;
          enriched.email_confidence = 90; // High confidence for direct match
          break;
        }
      }
    }

    // Add business phone if found
    if (allPhones.length > 0 && !enriched.business_phone) {
      enriched.business_phone = allPhones[0];
      console.log(`[WebsiteParser] Found phone: ${allPhones[0]}`);
    }

    // Update data quality score
    let additionalScore = 0;
    if (enriched.email && enriched.email_confidence && enriched.email_confidence >= 60) {
      additionalScore += 15;
    }
    if (enriched.business_phone) {
      additionalScore += 15;
    }

    enriched.data_quality_score = (enriched.data_quality_score || 0) + additionalScore;

    // Update source
    enriched.source = {
      ...enriched.source,
      method: 'merged' as const,
      urls: [...(enriched.source.urls || []), websiteUrl],
    };

  } catch (error) {
    console.error(`[WebsiteParser] Error enriching ${contact.full_name}:`, error);
  }

  return enriched;
}

export default enrichFromCompanyWebsite;
