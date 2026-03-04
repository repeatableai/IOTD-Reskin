/**
 * Custom Data Source Adapter
 * Pluggable interface for external contact data sources
 * Ready for integration with proprietary data endpoints
 */

import type { IDataSourceAdapter, DataSourceQuery, RawContact } from '@shared/scrapingTypes';

/**
 * Custom Data Source Adapter Implementation
 * This adapter connects to an external data source API when configured.
 * When CUSTOM_DATA_SOURCE_URL is set, it will POST queries and receive RawContact[] responses.
 */
class CustomDataSourceAdapterImpl implements IDataSourceAdapter {
  name = 'custom_data_source';

  /**
   * Check if the custom data source is configured
   * Returns true if CUSTOM_DATA_SOURCE_URL environment variable is set
   */
  isConfigured(): boolean {
    return !!process.env.CUSTOM_DATA_SOURCE_URL;
  }

  /**
   * Search for contacts using the custom data source
   * Posts the query to the configured endpoint and returns raw contacts
   */
  async searchContacts(query: DataSourceQuery): Promise<RawContact[]> {
    // If not configured, return empty results
    if (!this.isConfigured()) {
      console.log('[CustomDataSource] Not configured - CUSTOM_DATA_SOURCE_URL not set');
      return [];
    }

    const endpoint = process.env.CUSTOM_DATA_SOURCE_URL!;
    const apiKey = process.env.CUSTOM_DATA_SOURCE_API_KEY;

    console.log('[CustomDataSource] Searching with query:', {
      icp_name: query.icp.name,
      market_category: query.market_category,
      decision_authority_levels: query.decision_authority_levels,
      max_results: query.max_results,
    });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key header if configured
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: {
            icp: {
              name: query.icp.name,
              description: query.icp.description,
              demographics: query.icp.demographics,
              buying_behavior: query.icp.buyingBehavior,
            },
            market_category: query.market_category,
            decision_authority_levels: query.decision_authority_levels,
            max_results: query.max_results,
          },
        }),
      });

      if (!response.ok) {
        console.error(`[CustomDataSource] HTTP error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();

      // Handle different response formats
      let rawContacts: any[] = [];

      if (Array.isArray(data)) {
        rawContacts = data;
      } else if (data.contacts && Array.isArray(data.contacts)) {
        rawContacts = data.contacts;
      } else if (data.results && Array.isArray(data.results)) {
        rawContacts = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        rawContacts = data.data;
      }

      // Map to RawContact format
      const contacts: RawContact[] = rawContacts.map((item: any) => ({
        full_name: item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        first_name: item.first_name || item.firstName,
        last_name: item.last_name || item.lastName,
        title: item.title || item.job_title || item.jobTitle,
        company_name: item.company_name || item.company || item.organization,
        linkedin_url: item.linkedin_url || item.linkedinUrl || item.linkedin,
        email: item.email || item.email_address,
        email_confidence: item.email_confidence || item.emailConfidence,
        business_phone: item.business_phone || item.phone || item.businessPhone,
        cell_phone: item.cell_phone || item.mobile || item.cellPhone,
        location: item.location || item.region || item.city,
        data_quality_score: item.data_quality_score || item.quality_score || 60,
        source: {
          method: 'custom' as const,
          confidence: item.confidence || 70,
          scraped_at: new Date(),
          urls: item.source_urls || [],
        },
        raw_data: item,
      }));

      console.log(`[CustomDataSource] Returned ${contacts.length} raw contacts`);

      return contacts;

    } catch (error) {
      console.error('[CustomDataSource] Error fetching contacts:', error);
      return [];
    }
  }
}

/**
 * Singleton instance of the custom data source adapter
 */
export const customDataSourceAdapter = new CustomDataSourceAdapterImpl();

/**
 * Factory function for creating custom adapters with different configurations
 */
export function createCustomAdapter(config: {
  name: string;
  endpoint: string;
  apiKey?: string;
  transformResponse?: (data: any) => RawContact[];
}): IDataSourceAdapter {
  return {
    name: config.name,

    isConfigured(): boolean {
      return !!config.endpoint;
    },

    async searchContacts(query: DataSourceQuery): Promise<RawContact[]> {
      if (!this.isConfigured()) {
        return [];
      }

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (config.apiKey) {
          headers['Authorization'] = `Bearer ${config.apiKey}`;
          headers['X-API-Key'] = config.apiKey;
        }

        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(query),
        });

        if (!response.ok) {
          console.error(`[${config.name}] HTTP error: ${response.status}`);
          return [];
        }

        const data = await response.json();

        if (config.transformResponse) {
          return config.transformResponse(data);
        }

        // Default transformation
        const contacts = Array.isArray(data) ? data : (data.contacts || data.results || data.data || []);

        return contacts.map((item: any) => ({
          full_name: item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
          first_name: item.first_name,
          last_name: item.last_name,
          title: item.title,
          company_name: item.company_name || item.company,
          linkedin_url: item.linkedin_url,
          email: item.email,
          email_confidence: item.email_confidence,
          business_phone: item.business_phone || item.phone,
          cell_phone: item.cell_phone,
          location: item.location,
          data_quality_score: item.data_quality_score || 60,
          source: {
            method: 'custom' as const,
            confidence: 70,
            scraped_at: new Date(),
          },
        }));

      } catch (error) {
        console.error(`[${config.name}] Error:`, error);
        return [];
      }
    },
  };
}

export default customDataSourceAdapter;
