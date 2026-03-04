/**
 * Types for Contact Discovery Scraping Pipeline
 */

export interface RawSearchResult {
  url: string;
  title: string;
  snippet: string;
  extracted_name?: string;
  extracted_email?: string;
  source_query: string;
}

export interface RawContact {
  id?: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company_name?: string;
  linkedin_url?: string;
  email?: string;
  email_confidence?: number;
  business_phone?: string;
  cell_phone?: string;
  location?: string;
  data_quality_score: number;
  source: ContactSource;
  raw_data?: Record<string, any>;
}

export interface ContactSource {
  method: 'search' | 'linkedin' | 'website' | 'custom' | 'merged';
  search_engine?: 'duckduckgo' | 'bing';
  confidence: number;
  scraped_at: Date;
  urls?: string[];
}

export interface DataSourceQuery {
  icp: {
    name: string;
    description?: string;
    demographics?: {
      companySize?: string;
      industry?: string[];
      geography?: string[];
      revenue?: string;
    };
    buyingBehavior?: {
      decisionMakers?: string[];
    };
  };
  market_category: string;
  decision_authority_levels: string[];
  max_results: number;
}

export interface IDataSourceAdapter {
  name: string;
  isConfigured(): boolean;
  searchContacts(query: DataSourceQuery): Promise<RawContact[]>;
}

export interface DiscoveryMetadata {
  total_scraped: number;
  excluded: number;
  returned: number;
  by_source: Record<string, number>;
  duration_ms: number;
}

export interface DiscoveryProgress {
  stage: 'search' | 'linkedin' | 'enrich' | 'filter' | 'complete';
  current: number;
  total: number;
  message: string;
}

// User agent rotation list
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0',
];

// Decision maker title patterns
export const DECISION_MAKER_TITLES = [
  'CEO', 'COO', 'CTO', 'CFO', 'CMO', 'CRO', 'CIO', 'CISO',
  'President', 'Vice President', 'VP',
  'Director', 'Head of', 'Chief',
  'Founder', 'Co-Founder', 'Owner',
  'Partner', 'Managing Partner', 'General Partner',
  'Managing Director', 'Executive Director',
  'SVP', 'EVP', 'Senior Vice President', 'Executive Vice President',
];

// Email pattern types
export type EmailPattern =
  | 'firstname'           // john@company.com
  | 'lastname'            // smith@company.com
  | 'firstnamelastname'   // johnsmith@company.com
  | 'firstname.lastname'  // john.smith@company.com
  | 'f.lastname'          // j.smith@company.com
  | 'firstnamel'          // johns@company.com
  | 'firstname_lastname'; // john_smith@company.com

export interface EmailPatternResult {
  pattern: EmailPattern;
  domain: string;
  confidence: number;
  samples: string[];
}
