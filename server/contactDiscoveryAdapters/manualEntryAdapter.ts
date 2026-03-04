import type {
  ContactDiscoveryAdapter,
  ContactSearchQuery,
  ContactSearchResult,
} from '@shared/icpBuilderTypes';

/**
 * Manual Entry Adapter
 *
 * This adapter handles contacts that are manually entered through the UI form.
 * It's always available and doesn't perform any search operations -
 * contacts are added directly through the API.
 */

export const manualEntryAdapter: ContactDiscoveryAdapter = {
  name: 'manual',
  displayName: 'Manual Entry',
  description: 'Add contacts manually through the form interface',

  isAvailable: (): boolean => {
    // Manual entry is always available
    return true;
  },

  search: async (_query: ContactSearchQuery): Promise<ContactSearchResult> => {
    // Manual entry doesn't search - contacts are added via the form
    // This search method exists for interface compliance
    return {
      contacts: [],
      total: 0,
      hasMore: false,
      source: 'manual',
    };
  },
};

export default manualEntryAdapter;
