import Anthropic from '@anthropic-ai/sdk';
import type {
  ContactDiscoveryAdapter,
  ContactSearchQuery,
  ContactSearchResult,
  ValidationContact,
} from '@shared/icpBuilderTypes';

/**
 * Web Search Contact Discovery Adapter
 * Uses Anthropic Claude with web search to find contacts matching ICP criteria
 */

// Lazy-load Anthropic client
let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export const webSearchAdapter: ContactDiscoveryAdapter = {
  name: 'web_search',
  displayName: 'AI Web Search',
  description: 'Use AI-powered web search to find contacts matching your ICP',

  isAvailable: (): boolean => {
    return !!process.env.ANTHROPIC_API_KEY;
  },

  search: async (query: ContactSearchQuery): Promise<ContactSearchResult> => {
    console.log('[WebSearchAdapter] Starting contact search with query:', query);

    const { icpProfile, jobTitles, industries, companySizes, locations, limit = 10 } = query;

    // Build search context from ICP or direct parameters
    const searchJobTitles = jobTitles || icpProfile?.buyingBehavior?.decisionMakers || [];
    const searchIndustries = industries || icpProfile?.demographics?.industry || [];
    const searchLocations = locations || icpProfile?.demographics?.geography || [];
    const searchCompanySizes = companySizes || (icpProfile?.demographics?.companySize ? [icpProfile.demographics.companySize] : []);

    if (searchJobTitles.length === 0 && searchIndustries.length === 0) {
      console.log('[WebSearchAdapter] No search criteria provided');
      return {
        contacts: [],
        total: 0,
        hasMore: false,
        source: 'web_search',
      };
    }

    const searchPrompt = `You are a B2B sales lead researcher. Search the web for real professionals matching this profile:

TARGET: ${searchJobTitles.join(' OR ') || 'CMO, VP Marketing, Director'} in ${searchIndustries.join(', ') || 'Technology/SaaS'} companies${searchLocations.length ? ` located in ${searchLocations.join(', ')}` : ''}.

SEARCH STRATEGY (do all of these):
1. Search LinkedIn for people with these titles
2. For EACH person found, search their company website for contact info:
   - Search "[company name] team page" or "[company name] leadership"
   - Search "[company name] contact" for phone numbers
   - Look for email patterns like firstname@company.com or firstname.lastname@company.com
3. Search "[person name] email" or "[person name] contact"
4. Check company press releases that often list executive emails
5. Search industry directories (Crunchbase, ZoomInfo profiles, etc.)

Find up to ${limit} real people WITH as much contact info as possible.

CRITICAL: You MUST return a JSON array. Include anyone you find with at least name + title + company. Try hard to find emails and phones!

OUTPUT FORMAT - Return ONLY this JSON array, nothing else:
[
  {
    "firstName": "John",
    "lastName": "Smith",
    "jobTitle": "CMO",
    "company": "Acme Corp",
    "companySize": "51-200",
    "industry": "SaaS",
    "region": "San Francisco, CA",
    "linkedInUrl": "https://linkedin.com/in/johnsmith",
    "email": "john.smith@acmecorp.com",
    "phone": "+1-555-123-4567",
    "sourceUrl": "https://acmecorp.com/team"
  }
]

RULES:
- Real people only, no fabrication
- Partial data is OK (use null for missing fields)
- For emails: check company websites, press releases, speaker bios
- For phones: check company contact pages, press releases
- Common email patterns: firstname@, firstname.lastname@, first.last@
- LinkedIn URLs are always valuable
- Return empty array [] only if you truly find nobody`;

    try {
      // Use Claude with web search tool enabled
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        tools: [
          {
            type: 'web_search_20250305' as const,
            name: 'web_search',
          },
        ],
        messages: [
          {
            role: 'user',
            content: searchPrompt,
          },
        ],
      });

      // Extract text from response (may include tool use results)
      let textContent = '';
      console.log('[WebSearchAdapter] Response content blocks:', response.content.length);
      for (const block of response.content) {
        console.log('[WebSearchAdapter] Block type:', block.type);
        if (block.type === 'text') {
          textContent += block.text;
        }
      }
      console.log('[WebSearchAdapter] Extracted text length:', textContent.length);
      console.log('[WebSearchAdapter] Text preview:', textContent.substring(0, 500));

      // Parse the JSON response
      let contacts: Partial<ValidationContact>[] = [];
      try {
        // Try to extract JSON from the response
        const jsonMatch = textContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          contacts = parsed.map((contact: any) => ({
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            jobTitle: contact.jobTitle || '',
            company: contact.company || '',
            companySize: contact.companySize || undefined,
            industry: contact.industry || undefined,
            region: contact.region || 'Unknown',
            linkedInUrl: contact.linkedInUrl || undefined,
            email: contact.email || undefined,
            phone: contact.phone || undefined,
            source: 'web_search' as const,
            notes: contact.sourceUrl ? `Found via: ${contact.sourceUrl}` : undefined,
          }));
        }
      } catch (parseError) {
        console.error('[WebSearchAdapter] Failed to parse response:', parseError);
        console.log('[WebSearchAdapter] Raw response:', textContent);
      }

      console.log(`[WebSearchAdapter] Found ${contacts.length} contacts`);

      return {
        contacts,
        total: contacts.length,
        hasMore: false,
        source: 'web_search',
      };
    } catch (error) {
      console.error('[WebSearchAdapter] Search error:', error);
      throw error;
    }
  },
};

export default webSearchAdapter;
