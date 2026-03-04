/**
 * Scraping Pipeline Contact Discovery Adapter
 * Uses the full web scraping pipeline with DuckDuckGo/Bing search,
 * LinkedIn scraping, and company website enrichment
 */

import type {
  ContactDiscoveryAdapter,
  ContactSearchQuery,
  ContactSearchResult,
  ValidationContact,
  IcpDemographics,
  IcpPsychographics,
  IcpBuyingBehavior,
} from '@shared/icpBuilderTypes';
import { discoverContacts } from '../module2/scrapers';

// Simplified ICP type for scraping (without DB fields)
interface ScrapingIcpProfile {
  id: string;
  name: string;
  description: string;
  demographics: IcpDemographics;
  psychographics: IcpPsychographics;
  buyingBehavior: IcpBuyingBehavior;
  validationPriority: 'high' | 'medium' | 'low';
  confidence: number;
}

/**
 * Convert RawContact from scraping pipeline to ValidationContact format
 */
function rawContactToValidationContact(raw: any): Partial<ValidationContact> {
  // Split full name if not already split
  let firstName = raw.first_name || '';
  let lastName = raw.last_name || '';

  if (!firstName && raw.full_name) {
    const parts = raw.full_name.split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }

  return {
    firstName,
    lastName,
    email: raw.email,
    phone: raw.business_phone || raw.cell_phone,
    linkedInUrl: raw.linkedin_url,
    jobTitle: raw.title || '',
    company: raw.company_name || '',
    companySize: undefined, // Not always available from scraping
    industry: undefined, // Not always available from scraping
    region: raw.location || 'Unknown',
    source: 'web_scrape' as any,
    notes: raw.source?.urls
      ? `Found via: ${raw.source.urls.join(', ')}\nQuality Score: ${raw.data_quality_score}/100`
      : `Quality Score: ${raw.data_quality_score}/100`,
  };
}

export const scrapingPipelineAdapter: ContactDiscoveryAdapter = {
  name: 'web_scrape',
  displayName: 'Web Scraping Pipeline',
  description: 'Full scraping pipeline: DuckDuckGo/Bing search, LinkedIn profiles, company website enrichment',

  isAvailable: (): boolean => {
    // Always available - no API key required for basic scraping
    return true;
  },

  search: async (query: ContactSearchQuery): Promise<ContactSearchResult> => {
    console.log('[ScrapingPipeline] Starting contact discovery pipeline');

    const { icpProfile, jobTitles, industries, companySizes, locations, limit = 20 } = query;

    // Build ICP from query parameters
    const icp: ScrapingIcpProfile = {
      id: icpProfile?.id || 'temp-icp',
      name: icpProfile?.name || 'Search Query',
      description: icpProfile?.description || '',
      demographics: {
        companySize: companySizes?.[0] || icpProfile?.demographics?.companySize || '',
        industry: industries || icpProfile?.demographics?.industry || [],
        geography: locations || icpProfile?.demographics?.geography || [],
        revenue: icpProfile?.demographics?.revenue || '',
      },
      psychographics: icpProfile?.psychographics || {
        painPoints: [],
        goals: [],
        objections: [],
      },
      buyingBehavior: {
        decisionMakers: jobTitles || icpProfile?.buyingBehavior?.decisionMakers || ['CEO', 'CTO', 'VP'],
        budget: icpProfile?.buyingBehavior?.budget || '',
        buyingCycle: icpProfile?.buyingBehavior?.buyingCycle || '',
        channels: icpProfile?.buyingBehavior?.channels || [],
      },
      validationPriority: icpProfile?.validationPriority || 'medium',
      confidence: icpProfile?.confidence || 50,
    };

    try {
      const result = await discoverContacts(icp, 'search-query', {
        maxResults: limit,
        includeCustomSource: true,
        enrichFromWebsites: true,
        onProgress: (progress) => {
          console.log(`[ScrapingPipeline] ${progress.message} (${progress.current}/${progress.total})`);
        },
      });

      // Convert raw contacts to ValidationContact format
      const contacts: Partial<ValidationContact>[] = result.contacts.map(rawContactToValidationContact);

      console.log(`[ScrapingPipeline] Pipeline complete: ${contacts.length} contacts found`);
      console.log(`[ScrapingPipeline] Metadata:`, result.metadata);

      return {
        contacts,
        total: contacts.length,
        hasMore: result.metadata.total_scraped > result.metadata.returned,
        source: 'web_scrape',
        metadata: result.metadata,
      };

    } catch (error) {
      console.error('[ScrapingPipeline] Pipeline error:', error);
      throw error;
    }
  },
};

export default scrapingPipelineAdapter;
