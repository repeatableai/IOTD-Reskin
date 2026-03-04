import type {
  ContactDiscoveryAdapter,
  ContactSearchQuery,
  ContactSearchResult,
} from '@shared/icpBuilderTypes';

/**
 * Custom Data Source Adapter
 *
 * This is a stub implementation ready for integration with external
 * contact data APIs like Apollo, ZoomInfo, Lusha, or similar services.
 *
 * To enable this adapter:
 * 1. Set CONTACT_DATA_API_KEY environment variable
 * 2. Set CONTACT_DATA_API_URL if needed (defaults to Apollo)
 * 3. Implement the search logic for your chosen provider
 */

// ─── Configuration ─────────────────────────────────────────────────────────────

interface CustomDataSourceConfig {
  apiKey: string;
  apiUrl: string;
  provider: 'apollo' | 'zoominfo' | 'lusha' | 'custom';
}

function getConfig(): CustomDataSourceConfig | null {
  const apiKey = process.env.CONTACT_DATA_API_KEY;
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    apiUrl: process.env.CONTACT_DATA_API_URL || 'https://api.apollo.io/v1',
    provider: (process.env.CONTACT_DATA_PROVIDER as CustomDataSourceConfig['provider']) || 'apollo',
  };
}

// ─── Adapter Implementation ────────────────────────────────────────────────────

export const customDataSourceAdapter: ContactDiscoveryAdapter = {
  name: 'custom_api',
  displayName: 'External Contact Database',
  description: 'Search contacts from Apollo, ZoomInfo, or other contact databases',

  isAvailable: (): boolean => {
    const config = getConfig();
    return config !== null;
  },

  search: async (query: ContactSearchQuery): Promise<ContactSearchResult> => {
    const config = getConfig();
    if (!config) {
      throw new Error('Custom data source not configured - set CONTACT_DATA_API_KEY');
    }

    console.log('[CustomDataSource] Search query:', {
      jobTitles: query.jobTitles,
      industries: query.industries,
      companySizes: query.companySizes,
      locations: query.locations,
      limit: query.limit,
    });

    // ─── STUB IMPLEMENTATION ───────────────────────────────────────────────
    // This returns empty results. Replace with actual API integration.
    //
    // The search should:
    // 1. Call the external API with the query parameters
    // 2. Map the response to our ValidationContact format
    // 3. Return the results with pagination info

    return {
      contacts: [],
      total: 0,
      hasMore: false,
      source: 'custom_api',
    };

    // ─── EXAMPLE APOLLO IMPLEMENTATION ─────────────────────────────────────
    /*
    try {
      const response = await fetch(`${config.apiUrl}/people/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': config.apiKey,
        },
        body: JSON.stringify({
          person_titles: query.jobTitles,
          organization_industry_tag_ids: mapIndustriesToApolloIds(query.industries),
          organization_num_employees_ranges: mapCompanySizesToApolloRanges(query.companySizes),
          person_locations: query.locations,
          per_page: query.limit || 25,
        }),
      });

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        contacts: data.people.map((person: any) => ({
          firstName: person.first_name,
          lastName: person.last_name,
          email: person.email,
          phone: person.phone_number,
          linkedInUrl: person.linkedin_url,
          jobTitle: person.title,
          company: person.organization?.name,
          companySize: person.organization?.num_employees_string,
          industry: person.organization?.industry,
          region: formatLocation(person.city, person.state, person.country),
          source: 'custom_api' as const,
        })),
        total: data.pagination.total_entries,
        hasMore: data.pagination.page < data.pagination.total_pages,
        source: 'custom_api',
      };
    } catch (error) {
      console.error('[CustomDataSource] API error:', error);
      throw error;
    }
    */
  },
};

// ─── Helper Functions (for future implementation) ──────────────────────────────

/**
 * Map generic industry names to Apollo industry IDs
 */
function _mapIndustriesToApolloIds(_industries?: string[]): string[] {
  // Apollo uses specific industry tag IDs
  // This would need a mapping table
  return [];
}

/**
 * Map company size strings to Apollo's employee range format
 */
function _mapCompanySizesToApolloRanges(_sizes?: string[]): string[] {
  // Apollo uses ranges like "1,10", "11,20", etc.
  return [];
}

/**
 * Format location string from components
 */
function _formatLocation(city?: string, state?: string, country?: string): string {
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ');
}

export default customDataSourceAdapter;
