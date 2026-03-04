import type {
  ContactDiscoveryAdapter,
  ContactSearchQuery,
  ContactSearchResult,
  ValidationContact,
} from '@shared/icpBuilderTypes';

/**
 * Contact Discovery Service
 * Pluggable adapter registry for contact data sources
 */

// ─── Adapter Registry ──────────────────────────────────────────────────────────

class ContactDiscoveryRegistry {
  private adapters: Map<string, ContactDiscoveryAdapter> = new Map();

  /**
   * Register a new contact discovery adapter
   */
  registerAdapter(adapter: ContactDiscoveryAdapter): void {
    this.adapters.set(adapter.name, adapter);
    console.log(`[ContactDiscovery] Registered adapter: ${adapter.displayName}`);
  }

  /**
   * Get all available adapters (those that have required configuration)
   */
  getAvailableAdapters(): ContactDiscoveryAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.isAvailable());
  }

  /**
   * Get all registered adapters (including unavailable ones)
   */
  getAllAdapters(): ContactDiscoveryAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get a specific adapter by name
   */
  getAdapter(name: string): ContactDiscoveryAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Search contacts using a specific adapter
   */
  async searchContacts(
    adapterName: string,
    query: ContactSearchQuery
  ): Promise<ContactSearchResult> {
    const adapter = this.adapters.get(adapterName);

    if (!adapter) {
      throw new Error(`Adapter "${adapterName}" not found`);
    }

    if (!adapter.isAvailable()) {
      throw new Error(`Adapter "${adapter.displayName}" is not available - check configuration`);
    }

    console.log(`[ContactDiscovery] Searching with adapter: ${adapter.displayName}`);
    return adapter.search(query);
  }

  /**
   * Search across all available adapters
   */
  async searchAllAdapters(query: ContactSearchQuery): Promise<{
    results: Map<string, ContactSearchResult>;
    totalContacts: number;
  }> {
    const availableAdapters = this.getAvailableAdapters();
    const results = new Map<string, ContactSearchResult>();
    let totalContacts = 0;

    await Promise.all(
      availableAdapters.map(async (adapter) => {
        try {
          const result = await adapter.search(query);
          results.set(adapter.name, result);
          totalContacts += result.contacts.length;
        } catch (error) {
          console.error(`[ContactDiscovery] Error with adapter ${adapter.name}:`, error);
          results.set(adapter.name, {
            contacts: [],
            total: 0,
            hasMore: false,
            source: adapter.name,
          });
        }
      })
    );

    return { results, totalContacts };
  }
}

// ─── Manual Entry Adapter ──────────────────────────────────────────────────────

const manualEntryAdapter: ContactDiscoveryAdapter = {
  name: 'manual',
  displayName: 'Manual Entry',
  description: 'Manually add contacts through the form interface',

  isAvailable: () => true, // Always available

  search: async (_query: ContactSearchQuery): Promise<ContactSearchResult> => {
    // Manual entry doesn't search - it's handled through the form
    return {
      contacts: [],
      total: 0,
      hasMore: false,
      source: 'manual',
    };
  },
};

// ─── Custom Data Source Adapter (Stub) ─────────────────────────────────────────

/**
 * Stub adapter for custom data source API integration
 * Ready to be connected to Apollo, ZoomInfo, or other contact databases
 */
const customDataSourceAdapter: ContactDiscoveryAdapter = {
  name: 'custom_api',
  displayName: 'Custom Data Source',
  description: 'Connect to external contact databases (Apollo, ZoomInfo, etc.)',

  isAvailable: () => {
    // Check if the custom data source API key is configured
    return !!process.env.CONTACT_DATA_API_KEY;
  },

  search: async (query: ContactSearchQuery): Promise<ContactSearchResult> => {
    // This is a stub implementation
    // In production, this would call the actual API
    console.log('[ContactDiscovery] Custom data source search (stub):', query);

    // Return empty results - ready for API integration
    return {
      contacts: [],
      total: 0,
      hasMore: false,
      source: 'custom_api',
    };

    // Example implementation for Apollo API:
    /*
    const response = await fetch('https://api.apollo.io/v1/people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.CONTACT_DATA_API_KEY!,
      },
      body: JSON.stringify({
        person_titles: query.jobTitles,
        organization_industry_tag_ids: query.industries,
        organization_num_employees_ranges: query.companySizes,
        person_locations: query.locations,
        per_page: query.limit || 25,
      }),
    });

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
        region: person.city ? `${person.city}, ${person.country}` : person.country,
        source: 'custom_api',
      })),
      total: data.pagination.total_entries,
      hasMore: data.pagination.page < data.pagination.total_pages,
      source: 'custom_api',
    };
    */
  },
};

// ─── CSV Import Adapter (Stub) ─────────────────────────────────────────────────

const csvImportAdapter: ContactDiscoveryAdapter = {
  name: 'imported',
  displayName: 'CSV Import',
  description: 'Import contacts from CSV files',

  isAvailable: () => true, // Always available - import handled separately

  search: async (_query: ContactSearchQuery): Promise<ContactSearchResult> => {
    // CSV import doesn't search - it's handled through file upload
    return {
      contacts: [],
      total: 0,
      hasMore: false,
      source: 'imported',
    };
  },
};

// ─── Web Search Adapter ────────────────────────────────────────────────────────

import { webSearchAdapter } from './contactDiscoveryAdapters/webSearchAdapter';

// ─── Web Scraping Pipeline Adapter ─────────────────────────────────────────────

import { scrapingPipelineAdapter } from './contactDiscoveryAdapters/scrapingPipelineAdapter';

// ─── Initialize Registry ───────────────────────────────────────────────────────

export const contactDiscoveryRegistry = new ContactDiscoveryRegistry();

// Register default adapters
contactDiscoveryRegistry.registerAdapter(manualEntryAdapter);
contactDiscoveryRegistry.registerAdapter(customDataSourceAdapter);
contactDiscoveryRegistry.registerAdapter(csvImportAdapter);
contactDiscoveryRegistry.registerAdapter(webSearchAdapter);
contactDiscoveryRegistry.registerAdapter(scrapingPipelineAdapter);

// ─── Export Helper Functions ───────────────────────────────────────────────────

/**
 * Get information about available contact discovery adapters
 */
export function getAdapterInfo(): Array<{
  name: string;
  displayName: string;
  description: string;
  isAvailable: boolean;
}> {
  return contactDiscoveryRegistry.getAllAdapters().map(adapter => ({
    name: adapter.name,
    displayName: adapter.displayName,
    description: adapter.description,
    isAvailable: adapter.isAvailable(),
  }));
}

/**
 * Search for contacts using a specific adapter
 */
export async function searchContacts(
  adapterName: string,
  query: ContactSearchQuery
): Promise<ContactSearchResult> {
  return contactDiscoveryRegistry.searchContacts(adapterName, query);
}
