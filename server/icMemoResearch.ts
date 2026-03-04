/**
 * IC Memo Research Service
 *
 * Calculates weighted data completeness score from venture fields to auto-detect tier.
 * Builds research queries for web search based on venture data.
 *
 * Enhanced with OA (Opportunity Analysis) framework sections:
 * - USP Cards (§3)
 * - Monetization Strategy (§11)
 * - Problems Solved (§7)
 * - Research Checklist (§13)
 */

import { Idea } from "../shared/schema";

// ─── OA Framework Type Definitions ───────────────────────────────────────────

/**
 * USP Card (OA §3) - Unique Selling Proposition with measurable proof
 */
export interface USPCard {
  id: string;
  title: string;
  valueProposition: string;
  measurableProofAngle: string;
  competitiveDifferentiation: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

/**
 * Monetization Strategy (OA §11) - Revenue model and projections
 */
export interface MonetizationStrategy {
  revenueModelType: 'subscription' | 'transactional' | 'freemium' | 'marketplace' | 'advertising' | 'licensing' | 'hybrid';
  pricingTiers: Array<{
    name: string;
    price: string;
    billingCycle: 'monthly' | 'annual' | 'one-time' | 'usage-based';
    features: string[];
    targetSegment: string;
  }>;
  pricingRationale: 'value-based' | 'competitive' | 'cost-plus' | 'penetration' | 'premium';
  pricingRationaleExplanation: string;
  unitEconomics: {
    cac: string;
    cacSource: string;
    ltv: string;
    ltvSource: string;
    ltvCacRatio: number;
    paybackPeriodMonths: number;
    assumptions: string[];
  };
  revenueProjections: {
    year1: { revenue: string; assumptions: string[] };
    year2: { revenue: string; assumptions: string[] };
    year3: { revenue: string; assumptions: string[] };
  };
  expansionOpportunities: string[];
}

/**
 * Problem Solved (OA §7) - Pain point with before/after quantification
 */
export interface ProblemSolved {
  id: string;
  title: string;
  painIntensity: number; // 1-10
  currentState: {
    description: string;
    metrics: string;
    source: string;
  };
  futureState: {
    description: string;
    projectedMetrics: string;
    confidenceLevel: 'high' | 'medium' | 'low';
  };
  timeToValue: string;
  impactedPersonas: string[];
}

/**
 * Research Checklist Item (OA §13) - Outstanding diligence verification
 */
export interface ResearchChecklistItem {
  id: string;
  claimSummary: string;
  category: 'market' | 'technical' | 'financial' | 'legal' | 'team' | 'competitive';
  priority: 'high' | 'medium' | 'low';
  verificationMethod: 'interview' | 'data_request' | 'public_source' | 'third_party' | 'primary_research';
  responsibleParty: string;
  deadlineRecommendation: string;
  status: 'pending' | 'in_progress' | 'verified' | 'flagged';
}

/**
 * IC Memo Verdict (Enhanced with OA framework)
 */
export type ICMemoVerdict = 'EXCEPTIONAL' | 'STRONG' | 'MODERATE' | 'WEAK';

/**
 * Enhanced IC Memo Result with OA framework sections
 */
export interface EnhancedICMemoResult {
  // Core sections
  sections: Array<{
    id: string;
    title: string;
    content: string;
    confidenceTags: { verified: number; estimated: number; unverified: number };
  }>;

  // OA Framework additions
  uspCards: USPCard[];
  monetizationStrategy: MonetizationStrategy;
  problemsSolved: ProblemSolved[];
  researchChecklist: ResearchChecklistItem[];

  // Enhanced recommendation
  recommendation: {
    verdict: ICMemoVerdict;
    confidence: number;
    conditions?: string[];
    summary: string;
    keyStrengths: string[];
    criticalRisks: string[];
  };

  // Expert panel
  expertPanel: Array<{
    name: string;
    credentials: string;
    framework: string;
    rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
    analysis: string;
  }>;

  // Diligence items
  diligenceItems: Array<{
    category: 'gating' | 'pre_close' | 'supplementary';
    item: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Confidence stats
  confidenceStats: {
    verified: number;
    estimated: number;
    unverified: number;
  };

  // Metadata
  tier: 1 | 2 | 3;
  tierLabel: string;
  oaFrameworkVersion: string;
}

// ─── OA Section Prompt Builders ──────────────────────────────────────────────

/**
 * Build USP Cards prompt guidance
 */
export function buildUSPCardsPromptBlock(): string {
  return `
### Unique Selling Propositions (USP Cards)
Generate 4-6 USP cards with the following structure for each:
- **USP Title**: Concise, memorable name for this advantage
- **Value Proposition**: 1-2 sentence description of the value delivered
- **Measurable Proof Angle**: Specific metric or outcome that proves this USP (e.g., "3x faster onboarding", "50% cost reduction")
- **Competitive Differentiation**: How this beats alternatives specifically
- **Confidence Level**: high | medium | low based on data availability

Important: Count should be dynamic based on actual unique advantages found (typically 4-6).
Each USP must have source attribution: (Source: ...) or (Assumption: ...)`;
}

/**
 * Build Monetization Strategy prompt guidance
 */
export function buildMonetizationPromptBlock(): string {
  return `
### Monetization Strategy (OA §11)
Generate comprehensive monetization analysis with:

**Revenue Model Type**: subscription | transactional | freemium | marketplace | advertising | licensing | hybrid

**Pricing Tiers** (3-4 tiers):
For each tier: name, price, billing cycle, features (3-5), target segment

**Pricing Rationale**: value-based | competitive | cost-plus | penetration | premium
Include explanation of why this rationale fits the market

**Unit Economics**:
- CAC: Customer Acquisition Cost with source/assumption
- LTV: Lifetime Value with calculation methodology
- LTV/CAC Ratio: Must be >3 for healthy business
- Payback Period: In months
- Key Assumptions: List 3-5 assumptions underpinning these calculations

**Revenue Projections** (Year 1-3):
For each year: Revenue estimate with clear assumptions
All figures must have (Source: ...) or (Assumption: ...) attribution

**Expansion Opportunities**: 3-5 growth vectors beyond core offering`;
}

/**
 * Build Problems Solved prompt guidance
 */
export function buildProblemsSolvedPromptBlock(): string {
  return `
### Problems Solved (OA §7)
For each problem addressed (dynamic count based on actual problems):

**Problem Title**: Clear, specific problem statement

**Pain Intensity**: 1-10 score with justification

**Current State (Before)**:
- Description of the problem today
- Quantified metrics (time lost, money wasted, etc.)
- Source for these metrics

**Future State (After)**:
- Description with solution in place
- Projected metrics with improvement
- Confidence level: high | medium | low

**Time to Value**: How long to realize the benefit

**Impacted Personas**: Which user segments experience this pain

All numeric claims require (Source: ...) or (Assumption: ...) attribution`;
}

/**
 * Build Research Checklist prompt guidance
 */
export function buildResearchChecklistPromptBlock(): string {
  return `
### Research Checklist (OA §13)
For each unverified claim in the analysis, generate a diligence item:

**Claim Summary**: What needs to be verified

**Category**: market | technical | financial | legal | team | competitive

**Priority**: high (gating) | medium (pre-close) | low (nice-to-have)

**Verification Method**:
- interview (customer/expert)
- data_request (company data room)
- public_source (filings, reports)
- third_party (analyst report, survey)
- primary_research (conduct study)

**Responsible Party**: Who should own this verification

**Deadline Recommendation**: Based on deal timeline

Group items by category for easy triage by IC`;
}

// ─── Enhanced Tier Configuration ─────────────────────────────────────────────

export interface TierConfig {
  maxTokens: number;
  sections: string[];
  sectionNames: Record<string, string>;
  oaSections: {
    uspCards: boolean;
    monetizationStrategy: boolean;
    problemsSolved: boolean;
    researchChecklist: boolean;
  };
  expertCount: number;
}

export const ENHANCED_TIER_CONFIG: Record<1 | 2 | 3, TierConfig> = {
  1: {
    maxTokens: 8000,
    sections: [
      'thesis_summary',
      'market_opportunity',
      'timing_analysis',
      'competitive_landscape',
      'problems_solved', // OA §7
      'investment_conditions',
      'diligence_requirements',
    ],
    sectionNames: {
      thesis_summary: 'Thesis Summary',
      market_opportunity: 'Market Opportunity',
      timing_analysis: 'Timing Analysis',
      competitive_landscape: 'Competitive Landscape',
      problems_solved: 'Problems Solved',
      investment_conditions: 'Investment Conditions',
      diligence_requirements: 'Outstanding Diligence',
    },
    oaSections: {
      uspCards: true,
      monetizationStrategy: false, // Tier 1 doesn't have enough data
      problemsSolved: true,
      researchChecklist: true,
    },
    expertCount: 2,
  },
  2: {
    maxTokens: 12000,
    sections: [
      'executive_summary',
      'thesis_summary',
      'market_opportunity',
      'timing_analysis',
      'usp_cards', // OA §3
      'competitive_landscape',
      'problems_solved', // OA §7
      'risk_factors',
      'scenario_analysis',
      'diligence_requirements',
    ],
    sectionNames: {
      executive_summary: 'Executive Summary',
      thesis_summary: 'Investment Thesis',
      market_opportunity: 'Market Opportunity',
      timing_analysis: 'Timing & Market Catalysts',
      usp_cards: 'Unique Selling Propositions',
      competitive_landscape: 'Competitive Landscape',
      problems_solved: 'Problems Solved',
      risk_factors: 'Risk Factors',
      scenario_analysis: 'Scenario Analysis',
      diligence_requirements: 'Outstanding Diligence',
    },
    oaSections: {
      uspCards: true,
      monetizationStrategy: true,
      problemsSolved: true,
      researchChecklist: true,
    },
    expertCount: 3,
  },
  3: {
    maxTokens: 20000,
    sections: [
      'executive_summary',
      'thesis_summary',
      'market_opportunity',
      'timing_analysis',
      'usp_cards', // OA §3
      'competitive_landscape',
      'problems_solved', // OA §7
      'monetization_strategy', // OA §11
      'team_assessment',
      'traction_metrics',
      'wwhtbt',
      'risk_factors',
      'scenario_analysis',
      'expert_panel',
      'research_checklist', // OA §13
      'diligence_requirements',
    ],
    sectionNames: {
      executive_summary: 'Executive Summary',
      thesis_summary: 'Investment Thesis',
      market_opportunity: 'Market Opportunity & TAM Analysis',
      timing_analysis: 'Timing & Market Catalysts',
      usp_cards: 'Unique Selling Propositions',
      competitive_landscape: 'Competitive Dynamics',
      problems_solved: 'Problems Solved',
      monetization_strategy: 'Monetization Strategy',
      team_assessment: 'Team Assessment',
      traction_metrics: 'Traction & Proof Points',
      wwhtbt: 'What Would Have To Be True',
      risk_factors: 'Risk Factors & Mitigants',
      scenario_analysis: 'Scenario Analysis',
      expert_panel: 'Expert Panel Assessment',
      research_checklist: 'Research Checklist',
      diligence_requirements: 'Outstanding Diligence',
    },
    oaSections: {
      uspCards: true,
      monetizationStrategy: true,
      problemsSolved: true,
      researchChecklist: true,
    },
    expertCount: 5,
  },
};

/**
 * Build enhanced system prompt with OA framework sections
 */
export function buildEnhancedICMemoSystemPrompt(tier: 1 | 2 | 3): string {
  const config = ENHANCED_TIER_CONFIG[tier];
  const tierLabel = tier === 1 ? 'Thesis Assessment' : tier === 2 ? 'Preliminary Memo' : 'Full IC Memorandum';

  let prompt = `You are a senior investment analyst at a top-tier venture capital firm (Bessemer, Sequoia, a16z caliber). You produce institutional-grade Investment Committee memoranda following the Opportunity Analysis (OA) framework.

CRITICAL RULES:
1. **Expert Panel**: Use ONLY real, named experts who are published, peer-reviewed, or NYT bestseller-level recognizable. Never fabricate experts.
2. **Never Fabricate Data**: Use industry benchmarks, comparable transactions, or clearly state "data not available" — never invent figures.
3. **Source Attribution**: Tag EVERY numeric claim with:
   - (Source: [specific source]) — Verified from cited source
   - (Assumption: [basis]) — Estimated based on methodology
   - (Estimate: [methodology]) — Calculated from benchmarks
4. **No Placeholders**: NEVER use [PLACEHOLDER], [TBD], or similar tokens. If data is unknown, state "data not available" or provide a reasoned estimate.
5. **Dense Narrative Prose**: Write in analytical prose. Bullets only for lists of items.
6. **Verdict Format**: Use EXCEPTIONAL | STRONG | MODERATE | WEAK (not INVEST/PASS)
7. **Dissent Requirement**: At least one expert MUST dissent or express significant caution.

TIER ${tier} MEMO (${tierLabel})
- Generate ${config.sections.length} sections
- Target ${Math.round(config.maxTokens * 0.7)} words
- Expert panel: ${config.expertCount} experts
${tier >= 2 ? '- Web search intelligence available for market data' : '- Base analysis solely on provided venture data'}

SECTIONS TO GENERATE:
${config.sections.map((s, i) => `${i + 1}. ${config.sectionNames[s]}`).join('\n')}`;

  // Add OA section guidance
  if (config.oaSections.uspCards) {
    prompt += '\n\n' + buildUSPCardsPromptBlock();
  }
  if (config.oaSections.problemsSolved) {
    prompt += '\n\n' + buildProblemsSolvedPromptBlock();
  }
  if (config.oaSections.monetizationStrategy && tier >= 2) {
    prompt += '\n\n' + buildMonetizationPromptBlock();
  }
  if (config.oaSections.researchChecklist) {
    prompt += '\n\n' + buildResearchChecklistPromptBlock();
  }

  return prompt;
}

// Field weights for completeness calculation
const FIELD_WEIGHTS: Record<string, number> = {
  // High weight (5 points) - Core investment thesis fields
  description: 5,
  whyNowAnalysis: 5,
  proofSignals: 5,

  // Medium-high weight (4 points) - Market positioning
  market: 4,
  targetAudience: 4,
  mainCompetitor: 4,
  marketGap: 4,

  // Medium weight (3 points) - Business model & community
  title: 3,
  revenuePotential: 3,
  frameworkData: 3,
  communitySignals: 3,
  executionPlan: 3,

  // Lower weight (2 points) - Scores and metadata
  opportunityScore: 2,
  problemScore: 2,
  feasibilityScore: 2,
  timingScore: 2,
  executionScore: 2,
  gtmScore: 2,
  type: 2,
  executionDifficulty: 2,
  gtmStrength: 2,

  // Low weight (1 point) - Optional enrichments
  content: 1,
  trendAnalysis: 1,
  keywordData: 1,
  offerTiers: 1,
  storytellingNarrative: 1,
};

// Total possible points
const MAX_SCORE = Object.values(FIELD_WEIGHTS).reduce((sum, w) => sum + w, 0);

export interface CompletenessResult {
  score: number; // 0-100 percentage
  rawScore: number; // Actual weighted points
  maxScore: number; // Maximum possible points
  tier: 1 | 2 | 3;
  tierLabel: string;
  tierDescription: string;
  populated: string[];
  missing: string[];
  researchQueries: string[];
}

/**
 * Check if a field has meaningful data
 */
function isFieldPopulated(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // For JSONB fields, check if object has meaningful content
    const obj = value as Record<string, unknown>;
    return Object.keys(obj).length > 0 && Object.values(obj).some(v => isFieldPopulated(v));
  }
  return false;
}

/**
 * Calculate weighted data completeness score
 */
export function calculateCompleteness(idea: Partial<Idea>): CompletenessResult {
  const populated: string[] = [];
  const missing: string[] = [];
  let rawScore = 0;

  // Check each weighted field
  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    const value = idea[field as keyof Idea];
    if (isFieldPopulated(value)) {
      populated.push(field);
      rawScore += weight;
    } else {
      missing.push(field);
    }
  }

  // Calculate percentage score
  const score = Math.round((rawScore / MAX_SCORE) * 100);

  // Determine tier based on score
  let tier: 1 | 2 | 3;
  let tierLabel: string;
  let tierDescription: string;

  if (score < 30) {
    tier = 1;
    tierLabel = "Thesis Assessment";
    tierDescription = "Pre-seed/concept venture with limited data. Focuses on core thesis validation.";
  } else if (score < 65) {
    tier = 2;
    tierLabel = "Preliminary Memo";
    tierDescription = "Seed-stage venture with moderate data. Web search enabled for market intelligence.";
  } else {
    tier = 3;
    tierLabel = "Full IC Memorandum";
    tierDescription = "Comprehensive Bessemer-grade analysis with full web research and expert simulation.";
  }

  // Build research queries based on available data
  const researchQueries = buildResearchQueries(idea, tier);

  return {
    score,
    rawScore,
    maxScore: MAX_SCORE,
    tier,
    tierLabel,
    tierDescription,
    populated,
    missing,
    researchQueries,
  };
}

/**
 * Build research queries for web search based on venture data
 */
function buildResearchQueries(idea: Partial<Idea>, tier: 1 | 2 | 3): string[] {
  const queries: string[] = [];

  const title = idea.title || '';
  const market = idea.market || 'B2C';
  const type = idea.type || 'software';
  const targetAudience = idea.targetAudience || '';
  const mainCompetitor = idea.mainCompetitor || '';
  const description = idea.description || '';

  // Extract key terms from description for more targeted queries
  const keyTerms = extractKeyTerms(description, title);
  const industryTerms = keyTerms.slice(0, 3).join(' ');

  // Market sizing queries (all tiers)
  queries.push(`${industryTerms} market size 2024 2025 TAM SAM`);
  queries.push(`${industryTerms} ${market} market growth rate CAGR`);

  // Competitor intelligence (tier 2+)
  if (tier >= 2) {
    if (mainCompetitor) {
      queries.push(`${mainCompetitor} company valuation funding revenue`);
      queries.push(`${mainCompetitor} competitors alternatives market share`);
    }
    queries.push(`${industryTerms} top startups companies funding 2024`);
    queries.push(`${industryTerms} competitive landscape analysis`);
  }

  // Sector landscape (tier 2+)
  if (tier >= 2) {
    queries.push(`${industryTerms} industry trends 2024 2025`);
    queries.push(`${industryTerms} ${type} market analysis report`);
    if (targetAudience) {
      queries.push(`${targetAudience} spending habits market research`);
    }
  }

  // Comparable transactions (tier 3)
  if (tier === 3) {
    queries.push(`${industryTerms} startup acquisitions exits 2023 2024`);
    queries.push(`${industryTerms} Series A B funding rounds 2024`);
    queries.push(`${industryTerms} venture capital investment thesis`);
    queries.push(`${industryTerms} unit economics benchmarks SaaS ${market}`);
  }

  // Technology & regulatory (tier 3)
  if (tier === 3) {
    queries.push(`${industryTerms} technology stack architecture best practices`);
    queries.push(`${industryTerms} regulatory compliance requirements`);
  }

  // Filter out empty or duplicate queries
  const filteredQueries = queries.filter(q => q.trim().length > 10);
  const uniqueQueries = Array.from(new Set(filteredQueries));
  return uniqueQueries.slice(0, 14);
}

/**
 * Extract key terms from description for research queries
 */
function extractKeyTerms(description: string, title: string): string[] {
  // Combine title and description
  const text = `${title} ${description}`.toLowerCase();

  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
    'app', 'platform', 'solution', 'tool', 'service', 'product', 'system',
    'users', 'customers', 'people', 'businesses', 'companies',
  ]);

  // Extract words, filter stop words, and get most relevant terms
  const words = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // Sort by frequency and return top terms
  const entries = Array.from(wordCount.entries());
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Get field display name for UI
 */
export function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    description: 'Description',
    whyNowAnalysis: 'Why Now Analysis',
    proofSignals: 'Proof Signals',
    market: 'Market Type',
    targetAudience: 'Target Audience',
    mainCompetitor: 'Main Competitor',
    marketGap: 'Market Gap',
    title: 'Title',
    revenuePotential: 'Revenue Potential',
    frameworkData: 'Framework Data',
    communitySignals: 'Community Signals',
    executionPlan: 'Execution Plan',
    opportunityScore: 'Opportunity Score',
    problemScore: 'Problem Score',
    feasibilityScore: 'Feasibility Score',
    timingScore: 'Timing Score',
    executionScore: 'Execution Score',
    gtmScore: 'GTM Score',
    type: 'Business Type',
    executionDifficulty: 'Execution Difficulty',
    gtmStrength: 'GTM Strength',
    content: 'Detailed Content',
    trendAnalysis: 'Trend Analysis',
    keywordData: 'Keyword Data',
    offerTiers: 'Offer Tiers',
    storytellingNarrative: 'Storytelling Narrative',
  };
  return displayNames[field] || field;
}
