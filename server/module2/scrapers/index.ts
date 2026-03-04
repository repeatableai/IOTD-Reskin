/**
 * Contact Discovery Pipeline
 * Orchestrates all scrapers to find and enrich contacts
 */

import type { RawContact, DiscoveryMetadata, DiscoveryProgress, DataSourceQuery } from '@shared/scrapingTypes';
import type { IcpDemographics, IcpPsychographics, IcpBuyingBehavior } from '@shared/icpBuilderTypes';

// Simplified ICP type for scraping (without DB fields)
interface ScrapingIcpProfile {
  id: string;
  name: string;
  description?: string;
  demographics?: IcpDemographics;
  psychographics?: IcpPsychographics;
  buyingBehavior?: IcpBuyingBehavior;
  validationPriority?: 'high' | 'medium' | 'low';
  confidence?: number;
}

import { scrapeSearchResults, buildSearchQueries, extractLinkedInUrls } from './searchScraper';
import { scrapeLinkedInProfiles, createContactFromSearchResult } from './linkedinScraper';
import { enrichFromCompanyWebsite } from './websiteParser';
import { customDataSourceAdapter } from './customDataSource';
import { filterAndDeduplicate, meetsMinimumDataRequirements, calculateDataQualityScore } from './contactFilter';

// p-limit-like concurrency limiter (simple implementation)
function createLimiter(concurrency: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (queue.length > 0 && active < concurrency) {
      active++;
      const fn = queue.shift()!;
      fn();
    }
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          active--;
          next();
        }
      };

      queue.push(run);
      next();
    });
  };
}

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: DiscoveryProgress) => void;

/**
 * Discovery options
 */
export interface DiscoveryOptions {
  maxResults?: number;
  includeCustomSource?: boolean;
  enrichFromWebsites?: boolean;
  onProgress?: ProgressCallback;
}

/**
 * Main contact discovery function
 * Orchestrates the full scraping pipeline
 */
export async function discoverContacts(
  icp: ScrapingIcpProfile,
  ventureId: string,
  options: DiscoveryOptions = {}
): Promise<{
  contacts: RawContact[];
  metadata: DiscoveryMetadata;
}> {
  const startTime = Date.now();
  const {
    maxResults = 50,
    includeCustomSource = true,
    enrichFromWebsites = true,
    onProgress,
  } = options;

  const emitProgress = (stage: DiscoveryProgress['stage'], current: number, total: number, message: string) => {
    if (onProgress) {
      onProgress({ stage, current, total, message });
    }
    console.log(`[ContactDiscovery] ${message}`);
  };

  let totalScraped = 0;
  const bySource: Record<string, number> = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Build search queries from primary ICP
  // ═══════════════════════════════════════════════════════════════════════════
  emitProgress('search', 0, 100, 'Building search queries from ICP...');

  const queries = buildSearchQueries({
    name: icp.name,
    description: icp.description,
    demographics: icp.demographics,
    buyingBehavior: icp.buyingBehavior,
  });

  console.log(`[ContactDiscovery] Generated ${queries.length} search queries`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Execute search and custom source in parallel
  // ═══════════════════════════════════════════════════════════════════════════
  emitProgress('search', 10, 100, 'Searching DuckDuckGo and Bing...');

  const [searchResults, customResults] = await Promise.all([
    scrapeSearchResults(queries),
    includeCustomSource
      ? customDataSourceAdapter.searchContacts({
          icp: {
            name: icp.name,
            description: icp.description,
            demographics: icp.demographics,
            buyingBehavior: icp.buyingBehavior,
          },
          market_category: icp.demographics?.industry?.[0] || 'Technology',
          decision_authority_levels: icp.buyingBehavior?.decisionMakers || ['CEO', 'CTO'],
          max_results: maxResults,
        })
      : Promise.resolve([]),
  ]);

  console.log(`[ContactDiscovery] Search results: ${searchResults.length}, Custom source: ${customResults.length}`);
  bySource['search'] = searchResults.length;
  bySource['custom'] = customResults.length;

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Extract LinkedIn URLs from search results
  // ═══════════════════════════════════════════════════════════════════════════
  emitProgress('linkedin', 30, 100, 'Extracting LinkedIn profiles...');

  const linkedInUrls = extractLinkedInUrls(searchResults);
  console.log(`[ContactDiscovery] Found ${linkedInUrls.length} unique LinkedIn profiles`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: Scrape LinkedIn profiles
  // ═══════════════════════════════════════════════════════════════════════════
  emitProgress('linkedin', 40, 100, `Scraping ${linkedInUrls.length} LinkedIn profiles...`);

  const rawLinkedIn = await scrapeLinkedInProfiles(linkedInUrls.slice(0, 50));
  bySource['linkedin'] = rawLinkedIn.length;

  // Create fallback contacts from search results for profiles we couldn't scrape
  const scrapedUrls = new Set(rawLinkedIn.map(c => c.linkedin_url).filter(Boolean));

  for (const result of searchResults) {
    if (result.url.includes('linkedin.com/in/')) {
      const normalizedUrl = result.url.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/)?.[0];
      if (normalizedUrl && !scrapedUrls.has(normalizedUrl)) {
        const fallback = createContactFromSearchResult(result.title, result.snippet, normalizedUrl);
        if (fallback) {
          rawLinkedIn.push(fallback);
        }
      }
    }
  }

  totalScraped = rawLinkedIn.length + customResults.length;

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 5: Enrich contacts from company websites
  // ═══════════════════════════════════════════════════════════════════════════
  let enrichedContacts: RawContact[] = [...rawLinkedIn, ...customResults];

  if (enrichFromWebsites) {
    emitProgress('enrich', 60, 100, 'Enriching contacts from company websites...');

    const limiter = createLimiter(3); // Max 3 concurrent enrichments

    const enrichPromises = enrichedContacts.map((contact, index) =>
      limiter(async () => {
        emitProgress('enrich', 60 + Math.floor((index / enrichedContacts.length) * 20), 100,
          `Enriching ${contact.full_name} (${index + 1}/${enrichedContacts.length})...`);
        return enrichFromCompanyWebsite(contact);
      })
    );

    enrichedContacts = await Promise.all(enrichPromises);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 6: Filter and deduplicate
  // ═══════════════════════════════════════════════════════════════════════════
  emitProgress('filter', 85, 100, 'Filtering and deduplicating contacts...');

  const { filtered, excluded, byReason } = filterAndDeduplicate(enrichedContacts);

  console.log(`[ContactDiscovery] Filtered: ${filtered.length}, Excluded: ${excluded}`);
  console.log(`[ContactDiscovery] Exclusion reasons:`, byReason);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 7: Sort by data quality and limit results
  // ═══════════════════════════════════════════════════════════════════════════
  const finalContacts = filtered
    .sort((a, b) => b.data_quality_score - a.data_quality_score)
    .slice(0, maxResults);

  emitProgress('complete', 100, 100, `Found ${finalContacts.length} qualified contacts`);

  const duration = Date.now() - startTime;

  return {
    contacts: finalContacts,
    metadata: {
      total_scraped: totalScraped,
      excluded,
      returned: finalContacts.length,
      by_source: bySource,
      duration_ms: duration,
    },
  };
}

/**
 * Export individual components for testing/custom pipelines
 */
export {
  scrapeSearchResults,
  buildSearchQueries,
  extractLinkedInUrls,
  scrapeLinkedInProfiles,
  enrichFromCompanyWebsite,
  customDataSourceAdapter,
  filterAndDeduplicate,
  meetsMinimumDataRequirements,
  calculateDataQualityScore,
};

export default discoverContacts;
