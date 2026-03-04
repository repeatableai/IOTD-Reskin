/**
 * Search Engine Scraper
 * Uses DuckDuckGo and Bing (rotating) with rate limiting and stealth
 */

import type { RawSearchResult, USER_AGENTS } from '@shared/scrapingTypes';
import { USER_AGENTS as userAgents } from '@shared/scrapingTypes';

// Track search engine rotation state
let lastEngine: 'duckduckgo' | 'bing' = 'bing';

/**
 * Get random delay between min and max milliseconds
 */
function randomDelay(min: number, max: number): Promise<void> {
  const delay = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Get random user agent
 */
function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Rotate between search engines
 */
function getNextEngine(): 'duckduckgo' | 'bing' {
  lastEngine = lastEngine === 'duckduckgo' ? 'bing' : 'duckduckgo';
  return lastEngine;
}

/**
 * Build search URL for engine
 */
function buildSearchUrl(query: string, engine: 'duckduckgo' | 'bing'): string {
  const encodedQuery = encodeURIComponent(query);
  if (engine === 'duckduckgo') {
    return `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  }
  return `https://www.bing.com/search?q=${encodedQuery}`;
}

/**
 * Check if response contains CAPTCHA
 */
function detectCaptcha(html: string): boolean {
  const captchaIndicators = [
    'captcha',
    'CAPTCHA',
    'robot',
    'verify you are human',
    'unusual traffic',
    'automated queries',
    'solve this puzzle',
  ];
  return captchaIndicators.some(indicator => html.includes(indicator));
}

/**
 * Parse DuckDuckGo HTML results
 */
function parseDuckDuckGoResults(html: string, sourceQuery: string): RawSearchResult[] {
  const results: RawSearchResult[] = [];

  // Match result blocks - DuckDuckGo uses specific class names
  const resultRegex = /<a class="result__a" href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = resultRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    const snippet = match[3].replace(/<[^>]+>/g, '').trim();

    if (url && title) {
      const extracted = extractFromSnippet(snippet);
      results.push({
        url,
        title,
        snippet,
        extracted_name: extracted.name,
        extracted_email: extracted.email,
        source_query: sourceQuery,
      });
    }
  }

  // Fallback parsing if regex didn't match
  if (results.length === 0) {
    const altRegex = /<div class="result[^"]*"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      const snippet = match[3].replace(/<[^>]+>/g, '').trim();

      if (url && title && !url.includes('duckduckgo.com')) {
        const extracted = extractFromSnippet(snippet);
        results.push({
          url,
          title,
          snippet,
          extracted_name: extracted.name,
          extracted_email: extracted.email,
          source_query: sourceQuery,
        });
      }
    }
  }

  return results;
}

/**
 * Parse Bing HTML results
 */
function parseBingResults(html: string, sourceQuery: string): RawSearchResult[] {
  const results: RawSearchResult[] = [];

  // Match Bing result blocks
  const resultRegex = /<li class="b_algo"[\s\S]*?<h2><a href="([^"]+)"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/a><\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = resultRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].replace(/<[^>]+>/g, '').trim();
    const snippet = match[3].replace(/<[^>]+>/g, '').trim();

    if (url && title) {
      const extracted = extractFromSnippet(snippet);
      results.push({
        url,
        title,
        snippet,
        extracted_name: extracted.name,
        extracted_email: extracted.email,
        source_query: sourceQuery,
      });
    }
  }

  return results;
}

/**
 * Extract name/email from snippet text
 */
function extractFromSnippet(snippet: string): { name?: string; email?: string } {
  const result: { name?: string; email?: string } = {};

  // Extract email with RFC 5322 compatible regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const emailMatch = snippet.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // Extract potential name patterns (Title Case names near LinkedIn context)
  const nameRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/;
  const nameMatch = snippet.match(nameRegex);
  if (nameMatch) {
    result.name = nameMatch[1];
  }

  return result;
}

/**
 * Perform a single search query
 */
async function performSearch(
  query: string,
  engine: 'duckduckgo' | 'bing',
  retryOnCaptcha = true
): Promise<RawSearchResult[]> {
  const url = buildSearchUrl(query, engine);
  const userAgent = getRandomUserAgent();

  console.log(`[SearchScraper] Searching ${engine}: ${query}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!response.ok) {
      console.error(`[SearchScraper] HTTP error: ${response.status}`);
      return [];
    }

    const html = await response.text();

    // Check for CAPTCHA
    if (detectCaptcha(html)) {
      console.warn(`[SearchScraper] CAPTCHA detected on ${engine}`);
      if (retryOnCaptcha) {
        console.log('[SearchScraper] Waiting 30 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        return performSearch(query, engine, false);
      }
      return [];
    }

    // Parse results based on engine
    const results = engine === 'duckduckgo'
      ? parseDuckDuckGoResults(html, query)
      : parseBingResults(html, query);

    console.log(`[SearchScraper] Found ${results.length} results from ${engine}`);
    return results;

  } catch (error) {
    console.error(`[SearchScraper] Error searching ${engine}:`, error);
    return [];
  }
}

/**
 * Build search queries from ICP profile
 */
export function buildSearchQueries(icp: {
  name?: string;
  description?: string;
  demographics?: {
    industry?: string[];
    geography?: string[];
    companySize?: string;
  };
  buyingBehavior?: {
    decisionMakers?: string[];
  };
}): string[] {
  const queries: string[] = [];

  const titles = icp.buyingBehavior?.decisionMakers || ['CEO', 'CTO', 'VP'];
  const industries = icp.demographics?.industry || [];
  const geographies = icp.demographics?.geography || [];

  // Generate queries combining titles with industries/locations
  for (const title of titles.slice(0, 3)) {
    // Title + Industry queries
    for (const industry of industries.slice(0, 2)) {
      queries.push(`"${title}" "${industry}" site:linkedin.com/in`);
    }

    // Title + Geography queries
    for (const geo of geographies.slice(0, 2)) {
      queries.push(`"${title}" "${geo}" site:linkedin.com/in`);
    }

    // Generic title query
    if (industries.length === 0 && geographies.length === 0) {
      queries.push(`"${title}" site:linkedin.com/in`);
    }
  }

  // Add company size context
  if (icp.demographics?.companySize) {
    const title = titles[0] || 'CEO';
    queries.push(`"${title}" "${icp.demographics.companySize}" startup site:linkedin.com/in`);
  }

  return queries.slice(0, 10); // Limit total queries
}

/**
 * Extract LinkedIn URLs from search results
 */
export function extractLinkedInUrls(results: RawSearchResult[]): string[] {
  const urls = new Set<string>();

  for (const result of results) {
    if (result.url.includes('linkedin.com/in/')) {
      // Normalize LinkedIn URL
      const match = result.url.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/);
      if (match) {
        urls.add(match[0].replace('http://', 'https://').replace('www.', ''));
      }
    }
  }

  return Array.from(urls);
}

/**
 * Main search scraper function
 * Executes all queries with rate limiting and engine rotation
 */
export async function scrapeSearchResults(queries: string[]): Promise<RawSearchResult[]> {
  const allResults: RawSearchResult[] = [];
  const seenUrls = new Set<string>();

  // Process queries with concurrency limit of 2
  const concurrency = 2;
  const chunks: string[][] = [];
  for (let i = 0; i < queries.length; i += concurrency) {
    chunks.push(queries.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(async (query) => {
        const engine = getNextEngine();
        const results = await performSearch(query, engine);

        // Random delay between requests (2500-5500ms)
        await randomDelay(2500, 5500);

        return results;
      })
    );

    // Deduplicate and collect results
    for (const results of chunkResults) {
      for (const result of results) {
        if (!seenUrls.has(result.url)) {
          seenUrls.add(result.url);
          allResults.push(result);
        }
      }
    }
  }

  console.log(`[SearchScraper] Total unique results: ${allResults.length}`);
  return allResults;
}

export default scrapeSearchResults;
