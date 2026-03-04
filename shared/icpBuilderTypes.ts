/**
 * ICP Builder + Market Validation Types
 * Module for generating ICPs, managing validation contacts, and creating call scripts
 */

// ─── Phase & State Types ───────────────────────────────────────────────────────

export type IcpBuilderPhase = 'icp_generation' | 'contact_discovery' | 'script_generation' | 'export';

export type PhaseStatus = 'idle' | 'loading' | 'complete' | 'error';

export interface IcpBuilderState {
  currentPhase: IcpBuilderPhase;
  phaseStatuses: Record<IcpBuilderPhase, PhaseStatus>;
  icpProfiles: IcpProfile[];
  contacts: ValidationContact[];
  scripts: ValidationScript[];
  selectedIcpId: string | null;
}

// ─── ICP Profile Types ─────────────────────────────────────────────────────────

export interface IcpDemographics {
  companySize: string;
  industry: string[];
  geography: string[];
  revenue: string;
}

export interface IcpPsychographics {
  painPoints: string[];
  goals: string[];
  objections: string[];
}

export interface IcpBuyingBehavior {
  decisionMakers: string[];  // Job titles
  budget: string;
  buyingCycle: string;
  channels: string[];
}

export interface IcpProfile {
  id: string;
  ideaId: string;
  userId: string;
  name: string;
  description: string;
  demographics: IcpDemographics;
  psychographics: IcpPsychographics;
  buyingBehavior: IcpBuyingBehavior;
  validationPriority: 'high' | 'medium' | 'low';
  confidence: number;  // 0-100
  createdAt: string;
}

export interface IcpGenerationRequest {
  ideaId: string;
  title: string;
  description: string;
  content?: string;
  market?: string;
  type?: string;
  targetAudience?: string;
  mainCompetitor?: string;
  revenuePotential?: string;
  maxProfiles?: number;  // 1-3, default 3
}

export interface IcpGenerationResult {
  profiles: IcpProfile[];
  metadata: {
    generatedAt: string;
    ideaId: string;
    profileCount: number;
    averageConfidence: number;
  };
}

// ─── Validation Contact Types ──────────────────────────────────────────────────

export type ComplianceType = 'gdpr' | 'tcpa' | 'ccpa' | 'casl';
export type ComplianceSeverity = 'high' | 'medium' | 'low';

export interface ComplianceFlag {
  type: ComplianceType;
  region: string;
  severity: ComplianceSeverity;
  requirements: string[];
}

export interface ComplianceCheckResult {
  flags: ComplianceFlag[];
  isCompliant: boolean;
  warnings: string[];
  recommendations: string[];
}

export type ContactSource = 'manual' | 'custom_api' | 'imported';
export type ValidationStatus = 'pending' | 'contacted' | 'responded' | 'completed';
export type ConsentStatus = 'unknown' | 'pending' | 'granted' | 'denied';

export interface ValidationContact {
  id: string;
  ideaId: string;
  userId: string;
  icpProfileId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  jobTitle: string;
  company: string;
  companySize?: string;
  industry?: string;
  region: string;
  complianceFlags: ComplianceFlag[];
  consentStatus: ConsentStatus;
  matchScore?: number;  // 0-100, how well they match the ICP
  source: ContactSource;
  validationStatus: ValidationStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactCreateRequest {
  ideaId: string;
  icpProfileId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  jobTitle: string;
  company: string;
  companySize?: string;
  industry?: string;
  region: string;
  notes?: string;
}

export interface ContactUpdateRequest {
  icpProfileId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  jobTitle?: string;
  company?: string;
  companySize?: string;
  industry?: string;
  region?: string;
  consentStatus?: ConsentStatus;
  validationStatus?: ValidationStatus;
  notes?: string;
}

export interface ContactFilters {
  icpProfileId?: string;
  validationStatus?: ValidationStatus;
  hasComplianceFlags?: boolean;
  source?: ContactSource;
}

// ─── Validation Script Types ───────────────────────────────────────────────────

export type ScriptType = 'discovery' | 'validation' | 'follow_up';

export interface ScriptSection {
  id: string;
  title: string;
  content: string;
  speakerNotes: string;
  duration: string;  // e.g., "2-3 minutes"
  order: number;
}

export interface ScriptBranch {
  id: string;
  parentSectionId: string;
  condition: string;  // e.g., "If they express price concerns"
  content: string;
  followUpQuestions: string[];
}

export interface ValidationScript {
  id: string;
  ideaId: string;
  userId: string;
  icpProfileId: string;
  title: string;
  scriptType: ScriptType;
  objective: string;
  totalDuration: string;  // e.g., "15-20 minutes"
  sections: ScriptSection[];
  branches: ScriptBranch[];
  keyQuestions: string[];
  hypothesesToValidate: string[];
  closingTechniques: string[];
  createdAt: string;
}

export interface ScriptGenerationRequest {
  ideaId: string;
  icpProfileId: string;
  icpProfile: IcpProfile;
  ideaTitle: string;
  ideaDescription: string;
  scriptType: ScriptType;
}

export interface ScriptGenerationResult {
  script: ValidationScript;
  metadata: {
    generatedAt: string;
    icpProfileId: string;
    scriptType: ScriptType;
    estimatedDuration: string;
    questionCount: number;
  };
}

// ─── Contact Discovery Adapter Types ───────────────────────────────────────────

export interface ContactDiscoveryAdapter {
  name: string;
  displayName: string;
  description: string;
  isAvailable: () => boolean;
  search: (query: ContactSearchQuery) => Promise<ContactSearchResult>;
}

export interface ContactSearchQuery {
  icpProfile?: IcpProfile;
  jobTitles?: string[];
  industries?: string[];
  companySizes?: string[];
  locations?: string[];
  limit?: number;
}

export interface ContactSearchResult {
  contacts: Partial<ValidationContact>[];
  total: number;
  hasMore: boolean;
  source: string;
  metadata?: {
    total_scraped?: number;
    excluded?: number;
    returned?: number;
    by_source?: Record<string, number>;
    duration_ms?: number;
  };
}

// ─── Export Types ──────────────────────────────────────────────────────────────

export interface ContactExportOptions {
  includeComplianceFlags: boolean;
  includeNotes: boolean;
  format: 'csv' | 'json';
  filters?: ContactFilters;
}

export interface ContactExportResult {
  data: string;
  filename: string;
  mimeType: string;
  recordCount: number;
}

// ─── Region Mapping for Compliance ─────────────────────────────────────────────

export const REGION_COMPLIANCE_MAP: Record<string, ComplianceType[]> = {
  // EU/EEA - GDPR
  'EU': ['gdpr'],
  'Austria': ['gdpr'],
  'Belgium': ['gdpr'],
  'Bulgaria': ['gdpr'],
  'Croatia': ['gdpr'],
  'Cyprus': ['gdpr'],
  'Czech Republic': ['gdpr'],
  'Denmark': ['gdpr'],
  'Estonia': ['gdpr'],
  'Finland': ['gdpr'],
  'France': ['gdpr'],
  'Germany': ['gdpr'],
  'Greece': ['gdpr'],
  'Hungary': ['gdpr'],
  'Ireland': ['gdpr'],
  'Italy': ['gdpr'],
  'Latvia': ['gdpr'],
  'Lithuania': ['gdpr'],
  'Luxembourg': ['gdpr'],
  'Malta': ['gdpr'],
  'Netherlands': ['gdpr'],
  'Poland': ['gdpr'],
  'Portugal': ['gdpr'],
  'Romania': ['gdpr'],
  'Slovakia': ['gdpr'],
  'Slovenia': ['gdpr'],
  'Spain': ['gdpr'],
  'Sweden': ['gdpr'],
  // EEA
  'Iceland': ['gdpr'],
  'Liechtenstein': ['gdpr'],
  'Norway': ['gdpr'],
  // UK (post-Brexit)
  'UK': ['gdpr'],
  'United Kingdom': ['gdpr'],

  // US - TCPA (all), CCPA (California)
  'US': ['tcpa'],
  'USA': ['tcpa'],
  'United States': ['tcpa'],
  'California': ['tcpa', 'ccpa'],
  'US-CA': ['tcpa', 'ccpa'],

  // Canada - CASL
  'CA': ['casl'],
  'Canada': ['casl'],
};

// ─── Compliance Requirements ───────────────────────────────────────────────────

export const COMPLIANCE_REQUIREMENTS: Record<ComplianceType, string[]> = {
  gdpr: [
    'Explicit consent required before contact',
    'Must document lawful basis for processing',
    'Right to erasure must be honored',
    'Data minimization principle applies',
    'Cannot transfer data outside EEA without adequate safeguards',
  ],
  tcpa: [
    'Prior express consent required for automated calls',
    'Must honor Do-Not-Call registry',
    'Identification requirements at start of call',
    'Time restrictions apply (8am-9pm local time)',
    'Written consent required for autodialed marketing calls',
  ],
  ccpa: [
    'Must provide notice at collection',
    'Consumer has right to opt-out of sale of data',
    'Must respond to access requests within 45 days',
    'Cannot discriminate against consumers exercising rights',
    'Requires clear privacy policy disclosure',
  ],
  casl: [
    'Express or implied consent required',
    'Must identify sender and provide contact info',
    'Must include unsubscribe mechanism',
    'Records of consent must be maintained',
    'Consent can be withdrawn at any time',
  ],
};
