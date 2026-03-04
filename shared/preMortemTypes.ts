/**
 * Pre-Mortem Engine Types
 * Deep failure analysis module for venture risk assessment
 */

/**
 * Context data extracted from venture for pre-mortem analysis
 */
export interface PreMortemContext {
  ventureName: string;
  ventureCategory: 'Healthcare' | 'Fintech' | 'B2B SaaS' | 'Consumer' | 'Hardware' | 'Other';
  industryTags: string[];
  revenueModel: string;
  executionComplexity: 'simple' | 'moderate' | 'complex';
  competitors: string[];
  tamSamSom?: { tam?: string; sam?: string; som?: string };
  riskFactors: string[];
  financialProjections?: string;
  regulatoryMentions?: string[];
  ventureSlug: string;
  description?: string;
  targetAudience?: string;
  marketGap?: string;
  whyNowAnalysis?: string;
}

/**
 * Risk domains for failure categorization
 */
export type RiskDomain = 'market' | 'execution' | 'financial' | 'regulatory' | 'competitive' | 'team';

/**
 * Risk level classification
 */
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Confidence level for analysis
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Severity tier classification for composite score
 */
export type SeverityTier = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MANAGEABLE';

/**
 * Failure point removal analysis showing risk reduction potential
 */
export interface FailurePointRemoval {
  currentRiskLevel: RiskLevel;
  mitigatedRiskLevel: RiskLevel;
  estimatedRiskReduction: number;  // 0-100 percentage
  confidenceLevel: ConfidenceLevel;
}

/**
 * Individual failure perspective with narrative and mitigations
 */
export interface PreMortemPerspective {
  perspectiveId: string;
  perspectiveName: string;
  criticLens: string;
  riskDomain: RiskDomain;
  failureNarrative: string;        // 150-200 words, past tense
  rootCause: string;               // 1-2 sentences
  mitigationActions: string[];     // 2-3 direct instructions
  failurePointRemoval: FailurePointRemoval;
}

/**
 * Complete pre-mortem analysis result
 */
export interface PreMortemResult {
  perspectives: PreMortemPerspective[];
  compositeSeverityScore: number;    // 0-100
  severityTier: SeverityTier;
  executiveSummary: string;          // 3 sentences
  perspectivesConfidenceRating: ConfidenceLevel;
  metadata: {
    generatedAt: string;
    ventureSlug: string;
    completenessScore: number;
  };
}

/**
 * Data completeness check result
 */
export interface CompletenessResult {
  score: number;  // 0-100
  level: 'blocked' | 'partial' | 'none';  // blocked < 50, partial 50-79, none 80+
  missingFields: string[];
  warnings: string[];
}

/**
 * Completeness scoring weights
 */
export const COMPLETENESS_WEIGHTS = {
  revenueModel: 10,      // required
  competitors: 20,       // required (2+ named)
  executionTimeline: 15, // required
  marketSize: 20,        // required (TAM)
  industryCategory: 15,  // required
  riskFactors: 20,       // optional
} as const;

/**
 * OA Framework scores from venture context
 * (matches VentureScores from ventureContextService)
 */
export interface OAFrameworkScores {
  opportunity?: number;
  problem?: number;
  feasibility?: number;
  timing?: number;
  execution?: number;
  gtm?: number;
}

/**
 * Prior analyses from other tools in the OA framework
 * (matches PriorAnalyses from ventureContextService)
 */
export interface OAPriorAnalyses {
  // Disruption Scanner results
  disruptionScore?: number;
  disruptionClassification?: 'HIGH_RISK' | 'MODERATE' | 'RESILIENT';
  disruptionArchetype?: 'CREATOR' | 'DISRUPTOR' | 'ENABLER' | 'ADAPTOR' | 'DISRUPTED';

  // Market Sizing results
  marketSizingTAM?: string;
  marketSizingSAM?: string;
  marketSizingSOM?: string;
  marketSizingGrowthRate?: string;

  // Bell-Mason results
  bellMasonStage?: string;
  bellMasonOverallScore?: number;
  bellMasonReadinessForNext?: number;

  // IC Memo results
  icMemoTier?: 1 | 2 | 3;
  icMemoVerdict?: 'EXCEPTIONAL' | 'STRONG' | 'MODERATE' | 'WEAK';
  icMemoConfidenceScore?: number;

  // Future Cast results
  futureCastOutlook?: 'highly_favorable' | 'favorable' | 'mixed' | 'challenging' | 'highly_challenging';
  futureCastConfidence?: number;
  futureCastTimeHorizon?: string;
}

/**
 * Request payload for pre-mortem API
 */
export interface PreMortemRequest {
  ideaId: string;
  ventureName: string;
  ventureSlug: string;
  description?: string;
  market?: string;
  type?: string;
  targetAudience?: string;
  mainCompetitor?: string;
  revenueModel?: string;
  competitors?: string[];
  riskFactors?: string[];
  tamSamSom?: { tam?: string; sam?: string; som?: string };
  regulatoryMentions?: string[];
  executionComplexity?: 'simple' | 'moderate' | 'complex';
  financialProjections?: string;
  marketGap?: string;
  whyNowAnalysis?: string;
  content?: string;
  frameworkData?: any;
  // OA Framework integration
  scores?: OAFrameworkScores;
  priorAnalyses?: OAPriorAnalyses;
  oaCompletenessScore?: number;
}
