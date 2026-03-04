import Anthropic from '@anthropic-ai/sdk';

// ─── OA Framework Type Definitions ───────────────────────────────────────────

/**
 * Target Audience Tier (OA §4)
 */
export interface TargetAudienceTier {
  tier: 1 | 2 | 3;
  tierLabel: 'Primary' | 'Secondary' | 'Expansion';
  personaDescription: string;
  painIntensity: number; // 1-10
  segmentSize: string;
  segmentSizeSource: string; // (Source: ...) or (Assumption: ...)
  beforeState: {
    description: string;
    metrics: string;
  };
  afterState: {
    description: string;
    projectedMetrics: string;
    confidenceLevel: 'high' | 'medium' | 'low';
  };
  willingnessToPayEstimate: string;
  willingnessToPaySource: string;
  ltv: string;
  ltvSource: string;
}

/**
 * Key Features & Deployment Assessment (OA §8)
 */
export interface FeaturesDeploymentAssessment {
  uiUxAssessment: {
    usabilityScore: number; // 1-10
    accessibilityScore: number; // 1-10
    mobileReadiness: 'native' | 'responsive' | 'limited' | 'none';
    designMaturity: 'polished' | 'functional' | 'mvp' | 'prototype';
    evidence: string;
    evidenceSource: string;
  };
  securityPosture: {
    complianceCertifications: string[];
    dataHandling: 'encrypted_at_rest_and_transit' | 'encrypted_in_transit' | 'basic' | 'unknown';
    auditStatus: 'soc2_certified' | 'soc2_in_progress' | 'internal_only' | 'none';
    securityScore: number; // 1-10
    evidence: string;
    evidenceSource: string;
  };
  integrationDepth: {
    apiAvailability: 'public_documented' | 'partner_only' | 'internal' | 'none';
    ecosystemConnections: string[];
    dataPortability: 'full_export' | 'partial_export' | 'limited' | 'locked';
    integrationScore: number; // 1-10
    evidence: string;
    evidenceSource: string;
  };
  performanceCharacteristics: {
    latencyProfile: 'real_time' | 'near_real_time' | 'batch' | 'unknown';
    scalabilityLimit: string;
    reliabilitySLA: string;
    performanceScore: number; // 1-10
    evidence: string;
    evidenceSource: string;
  };
  overallDeploymentReadiness: number; // Average of all scores
}

// Types for Bell-Mason Diagnostic
export interface BellMasonResearchParams {
  ventureName: string;
  sector: string;
  description?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  type: 'funding' | 'team' | 'product' | 'ip' | 'market' | 'traction' | 'news' | 'financials';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'N/A';
  findings: string;
}

export interface BellMasonResearchResult {
  sources: ResearchSource[];
  summary: {
    funding: string;
    team: string;
    product: string;
    ip: string;
    market: string;
    traction: string;
    news: string;
    financials: string;
  };
  dataGapAreas: string[];
  researchTimestamp: string;
}

export interface BellMasonDiagnosticParams {
  ventureName: string;
  sector: string;
  stage: 'Concept' | 'Seed' | 'Product Development' | 'Market Development' | 'Steady State';
  description?: string;
  teamSize?: number;
  funding?: string;
  revenue?: string;
  existingScores?: {
    problemScore?: number;
    solutionScore?: number;
    marketScore?: number;
    teamScore?: number;
  };
  research: BellMasonResearchResult;
}

export interface DiagnosticQuestion {
  question: string;
  answer: 'YES' | 'NO' | 'UNKNOWN' | 'PARTIALLY';
  evidence: string;
  sourceIds: string[];
  dataGap: boolean;
}

export interface DimensionScore {
  dimension: string;
  category: 'operational' | 'market' | 'managerial' | 'financial';
  score: number;
  ideal: number;
  status: 'AHEAD' | 'ON_TRACK' | 'SLIGHT_GAP' | 'GAP' | 'CRITICAL_GAP';
  narrative: string;
  diagnosticQuestions: DiagnosticQuestion[];
}

export interface RedFlag {
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedDimensions: string[];
  recommendation: string;
  timeline: string;
  estimatedBudget?: string;
}

export interface ExpertVerdict {
  name: string;
  credentials: string;
  frameworkLens: string;
  verdict: string;
  rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
  keyQuestion: string;
}

export interface FrameworkScore {
  framework: string;
  score: number;
  methodology: string;
  keyFindings: string[];
}

export interface BellMasonDiagnosticResult {
  dimensions: DimensionScore[];
  overallScore: number;
  stageAssessment: {
    currentStage: string;
    readinessForNext: number;
    blockers: string[];
  };
  redFlags: RedFlag[];
  expertPanel: ExpertVerdict[];
  frameworkFusion: {
    bellMason: FrameworkScore;
    bessemer: FrameworkScore;
    sequoia: FrameworkScore;
    a16z: FrameworkScore;
    agreements: string[];
    divergences: string[];
  };
  recommendations: string[];
  diagnosticTimestamp: string;

  // ─── OA Framework Additions ───────────────────────────────────────────────

  /**
   * Target Audience Tiers (OA §4)
   * Tier 1/2/3 segmentation with quantified before/after impact
   */
  targetAudienceTiers: TargetAudienceTier[];

  /**
   * Key Features & Deployment Assessment (OA §8)
   * UI/UX, security, integrations, performance
   */
  featuresDeployment: FeaturesDeploymentAssessment;

  /**
   * Research verification items for unconfirmed claims
   */
  researchVerification: Array<{
    claim: string;
    category: 'team' | 'product' | 'market' | 'financial' | 'technical';
    priority: 'high' | 'medium' | 'low';
    verificationMethod: string;
  }>;

  /**
   * OA Framework metadata
   */
  oaFramework: {
    version: string;
    sectionsIncluded: string[];
    dataFreshness: string;
  };
}

// Bell-Mason 12 Dimensions with category mapping
const BELL_MASON_DIMENSIONS = [
  { name: 'technology', category: 'operational' as const, description: 'Technical foundation, architecture, scalability, IP protection' },
  { name: 'product', category: 'operational' as const, description: 'Product-market fit, user experience, feature completeness' },
  { name: 'manufacturing', category: 'operational' as const, description: 'Production capability, supply chain, quality control (or service delivery for SaaS)' },
  { name: 'businessPlan', category: 'market' as const, description: 'Business model clarity, unit economics, revenue strategy' },
  { name: 'marketing', category: 'market' as const, description: 'Brand positioning, go-to-market strategy, demand generation' },
  { name: 'sales', category: 'market' as const, description: 'Sales process, pipeline, conversion rates, customer acquisition' },
  { name: 'ceo', category: 'managerial' as const, description: 'Leadership vision, execution capability, industry expertise' },
  { name: 'team', category: 'managerial' as const, description: 'Team composition, skills coverage, culture, hiring pipeline' },
  { name: 'board', category: 'managerial' as const, description: 'Board composition, governance, strategic guidance' },
  { name: 'cash', category: 'financial' as const, description: 'Cash position, burn rate, runway, capital efficiency' },
  { name: 'fundability', category: 'financial' as const, description: 'Investor appeal, valuation support, funding trajectory' },
  { name: 'control', category: 'financial' as const, description: 'Financial controls, reporting, compliance, risk management' },
];

// Stage-appropriate ideal scores
const STAGE_IDEALS: Record<string, Record<string, number>> = {
  'Concept': {
    technology: 3, product: 2, manufacturing: 1, businessPlan: 4, marketing: 2, sales: 1,
    ceo: 5, team: 3, board: 1, cash: 3, fundability: 4, control: 2
  },
  'Seed': {
    technology: 5, product: 4, manufacturing: 2, businessPlan: 5, marketing: 4, sales: 3,
    ceo: 6, team: 5, board: 3, cash: 5, fundability: 6, control: 4
  },
  'Product Development': {
    technology: 7, product: 6, manufacturing: 4, businessPlan: 6, marketing: 5, sales: 4,
    ceo: 7, team: 6, board: 5, cash: 6, fundability: 7, control: 5
  },
  'Market Development': {
    technology: 8, product: 8, manufacturing: 6, businessPlan: 7, marketing: 7, sales: 7,
    ceo: 8, team: 7, board: 6, cash: 7, fundability: 8, control: 7
  },
  'Steady State': {
    technology: 9, product: 9, manufacturing: 8, businessPlan: 8, marketing: 8, sales: 8,
    ceo: 9, team: 8, board: 8, cash: 8, fundability: 9, control: 8
  }
};

// Research system prompt
const RESEARCH_SYSTEM_PROMPT = `You are an institutional-grade venture research analyst. Your task is to conduct deep web research on a venture/company to gather evidence for a Bell-Mason diagnostic assessment.

## RESEARCH OBJECTIVES
Gather comprehensive information across 8 categories:
1. **Funding**: Investment rounds, investors, valuations, cap table insights
2. **Team**: Founders, key executives, backgrounds, LinkedIn profiles, team size
3. **Product**: Product details, features, user reviews, product-market fit signals
4. **IP**: Patents, trademarks, proprietary technology, defensibility
5. **Market**: Market size, growth rates, competitive landscape, industry trends
6. **Traction**: Revenue, users, growth metrics, customer testimonials, case studies
7. **News**: Recent press coverage, announcements, partnerships, awards
8. **Financials**: Revenue estimates, burn rate, profitability indicators

## OUTPUT REQUIREMENTS
For each source found, provide:
- A unique ID (S1, S2, etc.)
- Title of the source
- URL (if available)
- Type (funding/team/product/ip/market/traction/news/financials)
- Confidence level (HIGH/MEDIUM/LOW/N/A)
- Key findings from this source

Be explicit about data gaps - areas where you could not find reliable information.

Return a JSON object with this structure:
{
  "sources": [
    {
      "id": "S1",
      "title": "Source title",
      "url": "https://...",
      "type": "funding",
      "confidence": "HIGH",
      "findings": "Key findings from this source..."
    }
  ],
  "summary": {
    "funding": "Summary of funding information...",
    "team": "Summary of team information...",
    "product": "Summary of product information...",
    "ip": "Summary of IP information...",
    "market": "Summary of market information...",
    "traction": "Summary of traction information...",
    "news": "Summary of news information...",
    "financials": "Summary of financial information..."
  },
  "dataGapAreas": ["List of areas with insufficient data"]
}`;

// Diagnostic system prompt
const DIAGNOSTIC_SYSTEM_PROMPT = `You are a senior partner at McKinsey & Company conducting an institutional-grade venture diagnostic using the Bell-Mason methodology for a $10B+ VC firm. This is a $50,000 consulting deliverable.

## CRITICAL WRITING STYLE - ELITE NARRATIVE STANDARD
1. **DENSE ANALYTICAL PROSE**: All expert verdicts must be flowing, connected narrative paragraphs. NO bullet lists in verdict sections. Build cohesive analytical arguments through prose.
2. **DATA IN NARRATIVE**: Weave scores and metrics INTO sentences naturally. Write "The venture's technology score of 7.5 reflects strong architectural foundations, though the 2-point gap from the Series A ideal of 9.5 signals scaling readiness concerns" — NOT isolated metrics.
3. **EXPERT VOICE**: Each expert's verdict must sound authentic to their known analytical style and frameworks. The reader should recognize the expert's perspective through the prose.
4. **READABLE FORMAT**: Use clear paragraph breaks. Each expert verdict should flow logically from observation through analysis to recommendation.

## CRITICAL OA FRAMEWORK RULES
1. **No Placeholders**: NEVER use [PLACEHOLDER], [TBD], [INSERT], [Sector Expert], or any bracketed placeholders. ALL experts must be REAL, NAMED individuals.
2. **Source Attribution**: Every numeric claim must have:
   - (Source: [specific source, date]) — Verified data
   - (Assumption: [basis]) — Reasoned estimate
   - (Estimate: [methodology]) — Calculated value
3. **Dynamic Counts**: Do NOT force counts. Find actual audience segments/features as they exist.

## BELL-MASON FRAMEWORK BACKGROUND
The Bell-Mason Diagnostic was developed by Heidi Mason and Gordon Bell to evaluate venture readiness across 12 interdependent dimensions. The framework recognizes that ventures must achieve stage-appropriate scores, and identifies dysfunction patterns where dimensional gaps predict specific failure modes.

## THE 12 DIMENSIONS
1. **Technology** (Operational): Technical foundation, architecture, scalability, IP protection
2. **Product** (Operational): Product-market fit, user experience, feature completeness
3. **Manufacturing** (Operational): Production/delivery capability, supply chain, quality
4. **Business Plan** (Market): Model clarity, unit economics, revenue strategy
5. **Marketing** (Market): Brand positioning, GTM strategy, demand generation
6. **Sales** (Market): Sales process, pipeline, conversion, customer acquisition
7. **CEO** (Managerial): Leadership vision, execution, industry expertise
8. **Team** (Managerial): Composition, skills coverage, culture, hiring
9. **Board** (Managerial): Composition, governance, strategic guidance
10. **Cash** (Financial): Position, burn rate, runway, capital efficiency
11. **Fundability** (Financial): Investor appeal, valuation support, trajectory
12. **Control** (Financial): Financial controls, reporting, compliance, risk

## SCORING RULES
- Score each dimension 1-10 based on evidence
- Compare to stage-appropriate ideals
- Status: AHEAD (≥ideal+1), ON_TRACK (ideal±1), SLIGHT_GAP (ideal-2), GAP (ideal-3), CRITICAL_GAP (≤ideal-4)
- Every claim must cite sources using [S1], [S2] notation
- Mark questions as dataGap: true when evidence is insufficient

## EXPERT PANEL - ALL MUST BE REAL NAMED EXPERTS
Generate verdicts from 5 REAL, VERIFIABLE experts with full names and credentials:
1. **Heidi Mason** (Bell-Mason Co-founder, 700+ venture assessments) - Dimensional balance, dysfunction patterns, stage readiness
2. **Gordon Bell** (Bell-Mason Co-founder, Microsoft Research pioneer) - Technical depth, product architecture, scaling readiness
3. **Bill Gurley** (Benchmark General Partner, enterprise SaaS expert) - Unit economics, market dynamics, competitive positioning
4. **For sector expert #4**: Choose a REAL, NAMED expert relevant to the venture's specific sector (e.g., for healthcare: Eric Topol; for fintech: Angela Strange; for AI: Andrew Ng). NEVER use "[Sector Expert]" as a name.
5. **For sector expert #5**: Choose another REAL, NAMED expert with a contrarian perspective relevant to the sector. This expert MUST express substantive caution or dissent.

CRITICAL: Every expert name must be a real person who could be verified via Google search. NEVER output placeholder names like "Expert", "[Sector Expert 1]", or similar.

Each expert MUST provide 2-4 paragraphs of DENSE ANALYTICAL PROSE in their authentic voice - NO bullet lists in verdicts.

## FRAMEWORK FUSION
Also score using:
- **Bessemer 10 Laws**: Enterprise sales, capital efficiency, net retention
- **Sequoia Arc**: Team, market timing, business model, competitive moat
- **a16z PMF Framework**: Product-market fit signals, growth trajectory

## RED FLAGS
Identify dysfunction patterns:
- Technical debt without corresponding product traction
- Marketing spend without sales conversion
- Team gaps in critical functions
- Cash/fundability misalignment
- Board composition issues for stage

## OA FRAMEWORK ADDITIONS

### Target Audience Tiers (OA §4)
Generate 3 audience tiers with quantified before/after impact:

**Tier 1 (Primary)**: Core target with highest LTV
- Persona description
- Pain intensity (1-10)
- Segment size with source
- Before state (current metrics)
- After state (projected metrics with confidence level)
- Willingness to pay estimate with source
- LTV estimate with source

**Tier 2 (Secondary)**: Adjacent market opportunity
**Tier 3 (Expansion)**: Future growth market

### Key Features & Deployment Assessment (OA §8)
Assess across 4 dimensions:

**UI/UX Assessment**:
- Usability score (1-10)
- Accessibility score (1-10)
- Mobile readiness: native | responsive | limited | none
- Design maturity: polished | functional | mvp | prototype

**Security Posture**:
- Compliance certifications (SOC2, HIPAA, etc.)
- Data handling: encrypted_at_rest_and_transit | encrypted_in_transit | basic | unknown
- Audit status: soc2_certified | soc2_in_progress | internal_only | none
- Security score (1-10)

**Integration Depth**:
- API availability: public_documented | partner_only | internal | none
- Ecosystem connections (list)
- Data portability: full_export | partial_export | limited | locked
- Integration score (1-10)

**Performance Characteristics**:
- Latency profile: real_time | near_real_time | batch | unknown
- Scalability limit estimate
- Reliability SLA
- Performance score (1-10)

### Research Verification
For each unverified claim, provide:
- Claim summary
- Category: team | product | market | financial | technical
- Priority: high | medium | low
- Verification method

## OUTPUT FORMAT
Return a JSON object matching BellMasonDiagnosticResult schema with all 12 dimensions scored plus OA framework sections.`;

// Initialize Anthropic client
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

// ─── Sanitization Functions ───────────────────────────────────────────────────

/**
 * Ensures a value is a non-null string, with fallback
 */
function ensureString(value: any, fallback: string = 'N/A'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  return String(value);
}

/**
 * Ensures a value is a valid enum value, with fallback
 */
function ensureEnum<T extends string>(value: any, validValues: T[], fallback: T): T {
  if (validValues.includes(value)) return value;
  return fallback;
}

/**
 * Ensures a value is a number, with fallback
 */
function ensureNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Sanitize research results to ensure all fields match expected types
 * This prevents Zod validation failures when AI returns null/undefined values
 */
function sanitizeResearchResult(raw: any): Omit<BellMasonResearchResult, 'researchTimestamp'> {
  const validSourceTypes = ['funding', 'team', 'product', 'ip', 'market', 'traction', 'news', 'financials'] as const;
  const validConfidenceLevels = ['HIGH', 'MEDIUM', 'LOW', 'N/A'] as const;

  // Sanitize sources array
  const sources: ResearchSource[] = Array.isArray(raw?.sources)
    ? raw.sources.map((s: any, index: number) => ({
        id: ensureString(s?.id, `S${index + 1}`),
        title: ensureString(s?.title, 'Unknown Source'),
        url: ensureString(s?.url, ''),  // Empty string for missing URLs
        type: ensureEnum(s?.type, [...validSourceTypes], 'news'),
        confidence: ensureEnum(s?.confidence, [...validConfidenceLevels], 'N/A'),
        findings: ensureString(s?.findings, 'No findings available'),
      }))
    : [];

  // Sanitize summary object
  const summary = {
    funding: ensureString(raw?.summary?.funding, 'No funding information found'),
    team: ensureString(raw?.summary?.team, 'No team information found'),
    product: ensureString(raw?.summary?.product, 'No product information found'),
    ip: ensureString(raw?.summary?.ip, 'No IP information found'),
    market: ensureString(raw?.summary?.market, 'No market information found'),
    traction: ensureString(raw?.summary?.traction, 'No traction information found'),
    news: ensureString(raw?.summary?.news, 'No news information found'),
    financials: ensureString(raw?.summary?.financials, 'No financial information found'),
  };

  // Sanitize dataGapAreas
  const dataGapAreas: string[] = Array.isArray(raw?.dataGapAreas)
    ? raw.dataGapAreas.filter((item: any) => typeof item === 'string')
    : [];

  return { sources, summary, dataGapAreas };
}

/**
 * Sanitize diagnostic results to ensure all fields match expected types
 */
function sanitizeDiagnosticResult(raw: any, stage: string = 'Seed'): BellMasonDiagnosticResult {
  const validStatuses = ['AHEAD', 'ON_TRACK', 'SLIGHT_GAP', 'GAP', 'CRITICAL_GAP'] as const;
  const validCategories = ['operational', 'market', 'managerial', 'financial'] as const;
  const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM'] as const;
  const validRatings = ['STRONG_INVEST', 'INVEST', 'CONDITIONAL', 'CAUTIOUS', 'PASS'] as const;
  const validAnswers = ['YES', 'NO', 'UNKNOWN', 'PARTIALLY'] as const;

  // Get stage ideals for fallback dimensions
  const stageIdeals = STAGE_IDEALS[stage] || STAGE_IDEALS['Seed'];

  // Helper to extract dimension name from various possible field names
  const getDimensionName = (d: any, index: number): string => {
    // Check common field names the AI might use
    const possibleNames = [d?.dimension, d?.name, d?.dimensionName, d?.key, d?.id];
    for (const name of possibleNames) {
      if (typeof name === 'string' && name.trim().length > 0 && name !== 'unknown') {
        // Normalize the name to match our expected dimension names
        const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
        // Map common variations to standard names
        const nameMap: Record<string, string> = {
          'tech': 'technology',
          'techology': 'technology',
          'prod': 'product',
          'mfg': 'manufacturing',
          'manufacturing': 'manufacturing',
          'delivery': 'manufacturing',
          'manufacturingdelivery': 'manufacturing',
          'bizplan': 'businessPlan',
          'businessplan': 'businessPlan',
          'business': 'businessPlan',
          'plan': 'businessPlan',
          'mkt': 'marketing',
          'gtm': 'marketing',
          'ceo': 'ceo',
          'ceoleadership': 'ceo',
          'leadership': 'ceo',
          'founder': 'ceo',
          'board': 'board',
          'boardofdirectors': 'board',
          'directors': 'board',
          'fundability': 'fundability',
          'funding': 'fundability',
          'investors': 'fundability',
          'ctrl': 'control',
          'controls': 'control',
          'financialcontrols': 'control',
        };
        return nameMap[normalized] || name.toLowerCase();
      }
    }
    // If we still don't have a name, try to infer from index based on standard order
    const orderedDimensions = ['technology', 'product', 'manufacturing', 'businessPlan', 'marketing', 'sales', 'ceo', 'team', 'board', 'cash', 'fundability', 'control'];
    if (index >= 0 && index < orderedDimensions.length) {
      return orderedDimensions[index];
    }
    return 'unknown';
  };

  // Sanitize dimensions with initial parsing
  let dimensions = Array.isArray(raw?.dimensions)
    ? raw.dimensions.map((d: any, index: number) => ({
        dimension: getDimensionName(d, index),
        category: ensureEnum(d?.category?.toLowerCase(), [...validCategories], 'operational'),
        // Ensure minimum score of 2 for visibility on radar chart (20% from center minimum)
        score: Math.max(2, ensureNumber(d?.score, 5)),
        // Handle both 'ideal' and 'idealScore' field names from AI
        ideal: ensureNumber(d?.ideal ?? d?.idealScore, 7),
        status: ensureEnum(d?.status, [...validStatuses], 'GAP'),
        narrative: ensureString(d?.narrative, 'Assessment pending - insufficient data to generate detailed analysis'),
        diagnosticQuestions: Array.isArray(d?.diagnosticQuestions)
          ? d.diagnosticQuestions.map((q: any) => ({
              question: ensureString(q?.question, 'Question unavailable'),
              answer: ensureEnum(q?.answer, [...validAnswers], 'UNKNOWN'),
              evidence: ensureString(q?.evidence, 'No evidence available'),
              sourceIds: Array.isArray(q?.sourceIds) ? q.sourceIds.filter((id: any) => typeof id === 'string') : [],
              dataGap: Boolean(q?.dataGap),
            }))
          : [],
      }))
    : [];

  // Log what we received for debugging
  console.log(`[BellMason Sanitize] Received ${raw?.dimensions?.length || 0} raw dimensions`);
  if (raw?.dimensions?.[0]) {
    console.log(`[BellMason Sanitize] First dimension keys:`, Object.keys(raw.dimensions[0]));
    console.log(`[BellMason Sanitize] First dimension sample:`, JSON.stringify(raw.dimensions[0]).substring(0, 200));
  }

  // INDEX-BASED DIMENSION ASSIGNMENT: Map dimensions to standard Bell-Mason order
  // This ensures all 12 dimensions get proper names AND correct categories regardless of AI output structure
  console.log(`[BellMason Sanitize] Applying index-based dimension assignment for ${dimensions.length} dimensions`);

  dimensions = dimensions.map((d: any, index: number) => {
    // Use the standard Bell-Mason dimension order
    if (index < BELL_MASON_DIMENSIONS.length) {
      const bmDim = BELL_MASON_DIMENSIONS[index];
      return {
        ...d,
        dimension: bmDim.name,
        category: bmDim.category,
        ideal: stageIdeals[bmDim.name] || d.ideal,
        // Re-apply minimum score of 2 for visibility
        score: Math.max(2, d.score),
      };
    }
    return d;
  });

  console.log(`[BellMason Sanitize] Assigned dimensions: ${dimensions.map(d => `${d.dimension}(${d.category})`).join(', ')}`);

  // Log category distribution for verification
  const categoryCount = { operational: 0, market: 0, managerial: 0, financial: 0 };
  dimensions.forEach(d => {
    if (categoryCount[d.category as keyof typeof categoryCount] !== undefined) {
      categoryCount[d.category as keyof typeof categoryCount]++;
    }
  });
  console.log(`[BellMason Sanitize] Category distribution:`, categoryCount);

  // If dimensions are empty or incomplete, generate fallback dimensions from BELL_MASON_DIMENSIONS
  if (dimensions.length < 12) {
    console.warn(`[BellMason Sanitize] Only ${dimensions.length} dimensions found, generating fallbacks`);

    const existingDimensionNames = new Set(dimensions.map((d: any) => d.dimension));

    for (const bmDim of BELL_MASON_DIMENSIONS) {
      if (!existingDimensionNames.has(bmDim.name)) {
        dimensions.push({
          dimension: bmDim.name,
          category: bmDim.category,
          score: 5,  // Default middle score (already meets minimum of 2)
          ideal: stageIdeals[bmDim.name] || 5,
          status: 'GAP' as const,
          narrative: `Assessment for ${bmDim.description.toLowerCase()} is pending. Insufficient data was available to generate a detailed analysis for this dimension.`,
          diagnosticQuestions: [{
            question: `Does the venture demonstrate strength in ${bmDim.description.toLowerCase()}?`,
            answer: 'UNKNOWN' as const,
            evidence: 'Insufficient data available to assess this dimension',
            sourceIds: [],
            dataGap: true,
          }],
        });
      }
    }

    // Re-sort dimensions to match standard Bell-Mason order
    const dimensionOrder = BELL_MASON_DIMENSIONS.map(d => d.name);
    dimensions.sort((a, b) => {
      const aIndex = dimensionOrder.indexOf(a.dimension);
      const bIndex = dimensionOrder.indexOf(b.dimension);
      return aIndex - bIndex;
    });

    console.log(`[BellMason Sanitize] Now have ${dimensions.length} dimensions after fallbacks`);
  }

  // Sanitize red flags
  const redFlags = Array.isArray(raw?.redFlags)
    ? raw.redFlags.map((f: any) => ({
        title: ensureString(f?.title, 'Unspecified Issue'),
        description: ensureString(f?.description, 'Details unavailable'),
        severity: ensureEnum(f?.severity, [...validSeverities], 'MEDIUM'),
        affectedDimensions: Array.isArray(f?.affectedDimensions) ? f.affectedDimensions.filter((d: any) => typeof d === 'string') : [],
        recommendation: ensureString(f?.recommendation, 'Review recommended'),
        timeline: ensureString(f?.timeline, 'TBD'),
        estimatedBudget: f?.estimatedBudget ? ensureString(f.estimatedBudget) : undefined,
      }))
    : [];

  // Sanitize expert panel
  const expertPanel = Array.isArray(raw?.expertPanel)
    ? raw.expertPanel.map((e: any) => ({
        name: ensureString(e?.name, 'Expert'),
        credentials: ensureString(e?.credentials, 'Industry Expert'),
        frameworkLens: ensureString(e?.frameworkLens, 'General Assessment'),
        verdict: ensureString(e?.verdict, 'Assessment pending'),
        rating: ensureEnum(e?.rating, [...validRatings], 'CONDITIONAL'),
        keyQuestion: ensureString(e?.keyQuestion, 'What are the key risks?'),
      }))
    : [];

  // Sanitize framework fusion
  const sanitizeFrameworkScore = (f: any, name: string) => ({
    framework: ensureString(f?.framework, name),
    score: ensureNumber(f?.score, 50),
    methodology: ensureString(f?.methodology, 'Standard assessment methodology'),
    keyFindings: Array.isArray(f?.keyFindings) ? f.keyFindings.filter((finding: any) => typeof finding === 'string') : [],
  });

  const frameworkFusion = {
    bellMason: sanitizeFrameworkScore(raw?.frameworkFusion?.bellMason, 'Bell-Mason Diagnostic'),
    bessemer: sanitizeFrameworkScore(raw?.frameworkFusion?.bessemer, 'Bessemer 10 Laws'),
    sequoia: sanitizeFrameworkScore(raw?.frameworkFusion?.sequoia, 'Sequoia Arc'),
    a16z: sanitizeFrameworkScore(raw?.frameworkFusion?.a16z, 'a16z PMF Framework'),
    agreements: Array.isArray(raw?.frameworkFusion?.agreements) ? raw.frameworkFusion.agreements.filter((a: any) => typeof a === 'string') : [],
    divergences: Array.isArray(raw?.frameworkFusion?.divergences) ? raw.frameworkFusion.divergences.filter((d: any) => typeof d === 'string') : [],
  };

  // Sanitize OA framework additions (with defaults if missing)
  const validConfidenceLevels = ['high', 'medium', 'low'] as const;
  const validMobileReadiness = ['native', 'responsive', 'limited', 'none'] as const;
  const validDesignMaturity = ['polished', 'functional', 'mvp', 'prototype'] as const;
  const validDataHandling = ['encrypted_at_rest_and_transit', 'encrypted_in_transit', 'basic', 'unknown'] as const;
  const validAuditStatus = ['soc2_certified', 'soc2_in_progress', 'internal_only', 'none'] as const;
  const validApiAvailability = ['public_documented', 'partner_only', 'internal', 'none'] as const;
  const validDataPortability = ['full_export', 'partial_export', 'limited', 'locked'] as const;
  const validLatencyProfile = ['real_time', 'near_real_time', 'batch', 'unknown'] as const;
  const validVerificationCategories = ['team', 'product', 'market', 'financial', 'technical'] as const;
  const validPriorities = ['high', 'medium', 'low'] as const;

  const targetAudienceTiers = Array.isArray(raw?.targetAudienceTiers)
    ? raw.targetAudienceTiers.map((t: any, index: number) => ({
        tier: [1, 2, 3].includes(t?.tier) ? t.tier : (index + 1 as 1 | 2 | 3),
        tierLabel: ensureEnum(t?.tierLabel, ['Primary', 'Secondary', 'Expansion'], index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Expansion'),
        personaDescription: ensureString(t?.personaDescription, 'Target persona description pending'),
        painIntensity: Math.min(10, Math.max(1, ensureNumber(t?.painIntensity, 5))),
        segmentSize: ensureString(t?.segmentSize, 'Unknown'),
        segmentSizeSource: ensureString(t?.segmentSizeSource, '(Assumption: needs verification)'),
        beforeState: {
          description: ensureString(t?.beforeState?.description, 'Current state unknown'),
          metrics: ensureString(t?.beforeState?.metrics, 'Metrics unavailable'),
        },
        afterState: {
          description: ensureString(t?.afterState?.description, 'Projected state pending'),
          projectedMetrics: ensureString(t?.afterState?.projectedMetrics, 'Projections unavailable'),
          confidenceLevel: ensureEnum(t?.afterState?.confidenceLevel, [...validConfidenceLevels], 'low'),
        },
        willingnessToPayEstimate: ensureString(t?.willingnessToPayEstimate, 'Unknown'),
        willingnessToPaySource: ensureString(t?.willingnessToPaySource, '(Assumption: needs verification)'),
        ltv: ensureString(t?.ltv, 'Unknown'),
        ltvSource: ensureString(t?.ltvSource, '(Assumption: needs verification)'),
      }))
    : [];

  const featuresDeployment: FeaturesDeploymentAssessment = {
    uiUxAssessment: {
      usabilityScore: Math.min(10, Math.max(1, ensureNumber(raw?.featuresDeployment?.uiUxAssessment?.usabilityScore, 5))),
      accessibilityScore: Math.min(10, Math.max(1, ensureNumber(raw?.featuresDeployment?.uiUxAssessment?.accessibilityScore, 5))),
      mobileReadiness: ensureEnum(raw?.featuresDeployment?.uiUxAssessment?.mobileReadiness, [...validMobileReadiness], 'unknown' as any) || 'limited',
      designMaturity: ensureEnum(raw?.featuresDeployment?.uiUxAssessment?.designMaturity, [...validDesignMaturity], 'mvp'),
      evidence: ensureString(raw?.featuresDeployment?.uiUxAssessment?.evidence, 'No evidence available'),
      evidenceSource: ensureString(raw?.featuresDeployment?.uiUxAssessment?.evidenceSource, '(Assumption: based on limited data)'),
    },
    securityPosture: {
      complianceCertifications: Array.isArray(raw?.featuresDeployment?.securityPosture?.complianceCertifications)
        ? raw.featuresDeployment.securityPosture.complianceCertifications.filter((c: any) => typeof c === 'string')
        : [],
      dataHandling: ensureEnum(raw?.featuresDeployment?.securityPosture?.dataHandling, [...validDataHandling], 'unknown'),
      auditStatus: ensureEnum(raw?.featuresDeployment?.securityPosture?.auditStatus, [...validAuditStatus], 'none'),
      securityScore: Math.min(10, Math.max(1, ensureNumber(raw?.featuresDeployment?.securityPosture?.securityScore, 5))),
      evidence: ensureString(raw?.featuresDeployment?.securityPosture?.evidence, 'No evidence available'),
      evidenceSource: ensureString(raw?.featuresDeployment?.securityPosture?.evidenceSource, '(Assumption: based on limited data)'),
    },
    integrationDepth: {
      apiAvailability: ensureEnum(raw?.featuresDeployment?.integrationDepth?.apiAvailability, [...validApiAvailability], 'none'),
      ecosystemConnections: Array.isArray(raw?.featuresDeployment?.integrationDepth?.ecosystemConnections)
        ? raw.featuresDeployment.integrationDepth.ecosystemConnections.filter((c: any) => typeof c === 'string')
        : [],
      dataPortability: ensureEnum(raw?.featuresDeployment?.integrationDepth?.dataPortability, [...validDataPortability], 'limited'),
      integrationScore: Math.min(10, Math.max(1, ensureNumber(raw?.featuresDeployment?.integrationDepth?.integrationScore, 5))),
      evidence: ensureString(raw?.featuresDeployment?.integrationDepth?.evidence, 'No evidence available'),
      evidenceSource: ensureString(raw?.featuresDeployment?.integrationDepth?.evidenceSource, '(Assumption: based on limited data)'),
    },
    performanceCharacteristics: {
      latencyProfile: ensureEnum(raw?.featuresDeployment?.performanceCharacteristics?.latencyProfile, [...validLatencyProfile], 'unknown'),
      scalabilityLimit: ensureString(raw?.featuresDeployment?.performanceCharacteristics?.scalabilityLimit, 'Unknown'),
      reliabilitySLA: ensureString(raw?.featuresDeployment?.performanceCharacteristics?.reliabilitySLA, 'Unknown'),
      performanceScore: Math.min(10, Math.max(1, ensureNumber(raw?.featuresDeployment?.performanceCharacteristics?.performanceScore, 5))),
      evidence: ensureString(raw?.featuresDeployment?.performanceCharacteristics?.evidence, 'No evidence available'),
      evidenceSource: ensureString(raw?.featuresDeployment?.performanceCharacteristics?.evidenceSource, '(Assumption: based on limited data)'),
    },
    overallDeploymentReadiness: ensureNumber(raw?.featuresDeployment?.overallDeploymentReadiness, 5),
  };

  const researchVerification = Array.isArray(raw?.researchVerification)
    ? raw.researchVerification.map((v: any) => ({
        claim: ensureString(v?.claim, 'Claim needs verification'),
        category: ensureEnum(v?.category, [...validVerificationCategories], 'market'),
        priority: ensureEnum(v?.priority, [...validPriorities], 'medium'),
        verificationMethod: ensureString(v?.verificationMethod, 'Manual verification required'),
      }))
    : [];

  const oaFramework = {
    version: ensureString(raw?.oaFramework?.version, '1.0'),
    sectionsIncluded: Array.isArray(raw?.oaFramework?.sectionsIncluded)
      ? raw.oaFramework.sectionsIncluded.filter((s: any) => typeof s === 'string')
      : ['Bell-Mason 12 Dimensions', 'Expert Panel', 'Framework Fusion'],
    dataFreshness: ensureString(raw?.oaFramework?.dataFreshness, new Date().toISOString()),
  };

  // Calculate overall score from actual dimension scores (average of 12 dimensions, scaled to 0-100)
  // This ensures the overall score matches what the radar chart displays
  const calculatedOverallScore = dimensions.length > 0
    ? Math.round((dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length) * 10)
    : ensureNumber(raw?.overallScore, 50);

  console.log(`[BellMason Sanitize] Calculated overall score: ${calculatedOverallScore} from dimension scores: [${dimensions.map(d => d.score).join(', ')}]`);

  return {
    dimensions,
    overallScore: calculatedOverallScore,
    stageAssessment: {
      currentStage: ensureString(raw?.stageAssessment?.currentStage, 'Seed'),
      readinessForNext: ensureNumber(raw?.stageAssessment?.readinessForNext, 50),
      blockers: Array.isArray(raw?.stageAssessment?.blockers) ? raw.stageAssessment.blockers.filter((b: any) => typeof b === 'string') : [],
    },
    redFlags,
    expertPanel,
    frameworkFusion,
    recommendations: Array.isArray(raw?.recommendations) ? raw.recommendations.filter((r: any) => typeof r === 'string') : [],
    diagnosticTimestamp: ensureString(raw?.diagnosticTimestamp, new Date().toISOString()),
    targetAudienceTiers,
    featuresDeployment,
    researchVerification,
    oaFramework,
  };
}

/**
 * Phase 1: Deep Web Research using Claude Opus with web_search tool
 */
export async function conductBellMasonResearch(params: BellMasonResearchParams): Promise<BellMasonResearchResult> {
  const client = getAnthropic();

  console.log(`[BellMason Research] Starting research for: ${params.ventureName}`);
  console.log(`[BellMason Research] Sector: ${params.sector}`);

  const userPrompt = `Research the following venture comprehensively:

**Venture Name**: ${params.ventureName}
**Sector**: ${params.sector}
${params.description ? `**Description**: ${params.description}` : ''}

Conduct thorough web research across all 8 categories. Use multiple search queries to find:
1. Crunchbase/PitchBook for funding history
2. LinkedIn for team composition
3. USPTO for patents and IP
4. Industry reports for market data
5. G2/Capterra for product reviews
6. News sources for recent coverage
7. SEC filings if applicable
8. Company website and blog

Be explicit about what you found and what you could NOT find (data gaps).

Return ONLY valid JSON matching the schema described.`;

  try {
    // Use streaming with web_search tool to prevent timeout
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      tools: [{
        type: 'web_search_20250305' as const,
        name: 'web_search',
        max_uses: 12,  // Allow up to 12 searches for comprehensive research
      }],
      system: RESEARCH_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Track progress for heartbeat
    let chunkCount = 0;
    stream.on('text', () => {
      chunkCount++;
      if (chunkCount % 50 === 0) {
        console.log(`[BellMason Research] Progress: ${chunkCount} chunks...`);
      }
    });

    // Wait for completion
    const finalMessage = await stream.finalMessage();
    console.log(`[BellMason Research] Complete: ${chunkCount} chunks, stop_reason: ${finalMessage.stop_reason}`);

    // Extract text from response
    let fullText = '';
    for (const block of finalMessage.content) {
      if (block.type === 'text') {
        fullText += block.text;
      }
    }

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in research response');
    }

    const rawResult = JSON.parse(jsonMatch[0]);

    // Sanitize the result to ensure all fields match expected types
    // This prevents Zod validation failures when AI returns null/undefined values
    const sanitizedResult = sanitizeResearchResult(rawResult);
    console.log(`[BellMason Research] Sanitized ${sanitizedResult.sources.length} sources`);

    return {
      ...sanitizedResult,
      researchTimestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[BellMason Research] Error:', error?.message || error);

    if (error?.status === 529) {
      throw new Error('AI service temporarily overloaded. Please try again in 30 seconds.');
    }
    if (error?.status === 504 || error?.message?.includes('timeout')) {
      throw new Error('Research timed out. This can happen with complex ventures. Please try again.');
    }
    if (error?.message?.includes('web_search')) {
      throw new Error('Web search failed. Please try again.');
    }

    throw new Error(`Research failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Phase 2: Diagnostic Analysis using Claude Opus with Extended Thinking
 */
export async function conductBellMasonDiagnostic(params: BellMasonDiagnosticParams): Promise<BellMasonDiagnosticResult> {
  const client = getAnthropic();

  console.log(`[BellMason Diagnostic] Starting diagnostic for: ${params.ventureName}`);
  console.log(`[BellMason Diagnostic] Stage: ${params.stage}`);

  const stageIdeals = STAGE_IDEALS[params.stage] || STAGE_IDEALS['Seed'];

  const userPrompt = `Conduct a comprehensive Bell-Mason Diagnostic assessment for:

**Venture Name**: ${params.ventureName}
**Sector**: ${params.sector}
**Stage**: ${params.stage}
${params.description ? `**Description**: ${params.description}` : ''}
${params.teamSize ? `**Team Size**: ${params.teamSize}` : ''}
${params.funding ? `**Funding**: ${params.funding}` : ''}
${params.revenue ? `**Revenue**: ${params.revenue}` : ''}

## STAGE-APPROPRIATE IDEALS (${params.stage})
${JSON.stringify(stageIdeals, null, 2)}

## RESEARCH DATA
${JSON.stringify(params.research, null, 2)}

## EXISTING SCORES (if available)
${params.existingScores ? JSON.stringify(params.existingScores, null, 2) : 'None provided'}

## REQUIREMENTS
1. Score all 12 dimensions with detailed NARRATIVE PROSE (2-4 paragraphs each, NO bullet lists)
2. Provide 4-6 diagnostic questions per dimension with evidence citations
3. Identify red flags with severity, recommendations, and timeline
4. Generate 5 expert verdicts with REAL NAMED EXPERTS (Heidi Mason, Gordon Bell, Bill Gurley, plus 2 sector-relevant experts with FULL REAL NAMES - NEVER use "[Sector Expert]" or "Expert" as a name). Each verdict must be 2-4 paragraphs of DENSE ANALYTICAL PROSE.
5. Score using Bessemer, Sequoia, and a16z frameworks
6. Identify agreements and divergences across frameworks

CRITICAL: All expert names must be real, verifiable people. NEVER output placeholder names.

Return ONLY valid JSON matching the BellMasonDiagnosticResult schema:

{
  "dimensions": [
    {
      "dimension": "technology",
      "category": "operational",
      "score": 7,
      "ideal": ${stageIdeals.technology},
      "status": "ON_TRACK",
      "narrative": "2-4 paragraph assessment...",
      "diagnosticQuestions": [
        {
          "question": "Is the technical architecture scalable to 10x current load?",
          "answer": "YES",
          "evidence": "Based on [S1], the company uses cloud-native architecture...",
          "sourceIds": ["S1", "S3"],
          "dataGap": false
        }
      ]
    }
  ],
  "overallScore": 65,
  "stageAssessment": {
    "currentStage": "${params.stage}",
    "readinessForNext": 45,
    "blockers": ["Team gaps in sales leadership", "Need to close Series A"]
  },
  "redFlags": [
    {
      "title": "Sales Leadership Gap",
      "description": "No VP Sales with enterprise experience...",
      "severity": "HIGH",
      "affectedDimensions": ["sales", "team"],
      "recommendation": "Hire experienced VP Sales within 90 days",
      "timeline": "90 days",
      "estimatedBudget": "$200-300K base + equity"
    }
  ],
  "expertPanel": [
    {
      "name": "Heidi Mason",
      "credentials": "Bell-Mason Co-founder, 700+ venture assessments",
      "frameworkLens": "Dimensional balance and dysfunction patterns",
      "verdict": "2-4 paragraph expert analysis in their authentic voice...",
      "rating": "CONDITIONAL",
      "keyQuestion": "How will you address the technology-product imbalance before Series A?"
    }
  ],
  "frameworkFusion": {
    "bellMason": {
      "framework": "Bell-Mason Diagnostic",
      "score": 65,
      "methodology": "12-dimension stage-appropriate assessment",
      "keyFindings": ["Strong technology foundation", "Sales process immature for stage"]
    },
    "bessemer": {
      "framework": "Bessemer 10 Laws",
      "score": 60,
      "methodology": "Enterprise SaaS best practices",
      "keyFindings": ["CAC payback needs improvement", "Net retention above 100%"]
    },
    "sequoia": {
      "framework": "Sequoia Arc",
      "score": 68,
      "methodology": "Team, market, model, moat assessment",
      "keyFindings": ["Strong founding team", "Large addressable market"]
    },
    "a16z": {
      "framework": "a16z PMF Framework",
      "score": 55,
      "methodology": "Product-market fit signals",
      "keyFindings": ["Early PMF indicators present", "Need stronger retention data"]
    },
    "agreements": ["Strong technical foundation", "Large market opportunity"],
    "divergences": ["Bessemer concerned about CAC, others less so"]
  },
  "recommendations": [
    "Prioritize VP Sales hire",
    "Formalize board governance",
    "Extend runway to 18 months before Series A"
  ],
  "diagnosticTimestamp": "${new Date().toISOString()}"
}`;

  try {
    // Use streaming with extended thinking for deep analysis
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 32000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      system: DIAGNOSTIC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Track progress
    let chunkCount = 0;
    stream.on('text', () => {
      chunkCount++;
      if (chunkCount % 100 === 0) {
        console.log(`[BellMason Diagnostic] Progress: ${chunkCount} chunks...`);
      }
    });

    // Wait for completion
    const finalMessage = await stream.finalMessage();
    console.log(`[BellMason Diagnostic] Complete: ${chunkCount} chunks, stop_reason: ${finalMessage.stop_reason}`);

    // Extract text from response (ignore thinking blocks)
    let fullText = '';
    for (const block of finalMessage.content) {
      if (block.type === 'text') {
        fullText += block.text;
      } else if (block.type === 'thinking') {
        // Safely access thinking content - structure may vary
        const thinkingContent = (block as any).thinking || (block as any).content || '';
        const thinkingLength = typeof thinkingContent === 'string' ? thinkingContent.length : 0;
        console.log(`[BellMason Diagnostic] Extended thinking used ${thinkingLength} chars of reasoning`);
      }
    }

    // Parse JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in diagnostic response');
    }

    const rawResult = JSON.parse(jsonMatch[0]);

    // Sanitize the result to ensure all fields match expected types
    // This prevents validation failures when AI returns null/undefined values
    // Pass the stage to generate proper fallback dimensions with stage-appropriate ideals
    const result = sanitizeDiagnosticResult(rawResult, params.stage);
    console.log(`[BellMason Diagnostic] Sanitized result with ${result.dimensions.length} dimensions, ${result.redFlags.length} red flags`);

    return result;
  } catch (error: any) {
    console.error('[BellMason Diagnostic] Error:', error?.message || error);

    if (error?.status === 529) {
      throw new Error('AI service temporarily overloaded. Please try again in 30 seconds.');
    }
    if (error?.status === 504 || error?.message?.includes('timeout')) {
      throw new Error('Diagnostic timed out. This can happen with complex ventures. Please try again.');
    }

    throw new Error(`Diagnostic failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Phase 2 (Streaming): Diagnostic Analysis with SSE streaming to client
 * Streams progress and chunks to keep the connection alive
 */
export async function conductBellMasonDiagnosticStreaming(
  params: BellMasonDiagnosticParams,
  res: any  // Express Response object
): Promise<void> {
  const client = getAnthropic();

  console.log(`[BellMason Diagnostic SSE] Starting streaming diagnostic for: ${params.ventureName}`);
  console.log(`[BellMason Diagnostic SSE] Stage: ${params.stage}`);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');  // Disable nginx buffering
  res.flushHeaders();

  // Helper to send SSE events
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const stageIdeals = STAGE_IDEALS[params.stage] || STAGE_IDEALS['Seed'];

  const userPrompt = `Conduct a comprehensive Bell-Mason Diagnostic assessment for:

**Venture Name**: ${params.ventureName}
**Sector**: ${params.sector}
**Stage**: ${params.stage}
${params.description ? `**Description**: ${params.description}` : ''}
${params.teamSize ? `**Team Size**: ${params.teamSize}` : ''}
${params.funding ? `**Funding**: ${params.funding}` : ''}
${params.revenue ? `**Revenue**: ${params.revenue}` : ''}

## STAGE-APPROPRIATE IDEALS (${params.stage})
${JSON.stringify(stageIdeals, null, 2)}

## RESEARCH DATA
${JSON.stringify(params.research, null, 2)}

## EXISTING SCORES (if available)
${params.existingScores ? JSON.stringify(params.existingScores, null, 2) : 'None provided'}

## REQUIREMENTS
1. Score all 12 dimensions with detailed NARRATIVE PROSE (2-4 paragraphs each, NO bullet lists)
2. Provide 4-6 diagnostic questions per dimension with evidence citations
3. Identify red flags with severity, recommendations, and timeline
4. Generate 5 expert verdicts with REAL NAMED EXPERTS (Heidi Mason, Gordon Bell, Bill Gurley, plus 2 sector-relevant experts with FULL REAL NAMES - NEVER use "[Sector Expert]" or "Expert" as a name). Each verdict must be 2-4 paragraphs of DENSE ANALYTICAL PROSE.
5. Score using Bessemer, Sequoia, and a16z frameworks
6. Identify agreements and divergences across frameworks

CRITICAL: All expert names must be real, verifiable people. NEVER output placeholder names.

Return ONLY valid JSON matching the BellMasonDiagnosticResult schema.`;

  try {
    sendEvent('status', { message: 'Starting diagnostic analysis...', phase: 'init' });

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 32000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      system: DIAGNOSTIC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let chunkCount = 0;
    let fullText = '';
    let thinkingChars = 0;

    // Stream text chunks to client as they arrive
    stream.on('text', (text) => {
      chunkCount++;
      fullText += text;

      // Send progress every 50 chunks to keep connection alive
      if (chunkCount % 50 === 0) {
        sendEvent('progress', {
          chunks: chunkCount,
          chars: fullText.length,
          message: `Processing... ${chunkCount} chunks received`
        });
      }
    });

    // Track thinking blocks
    stream.on('contentBlockStart', (block: any) => {
      if (block?.content_block?.type === 'thinking') {
        sendEvent('status', { message: 'Extended thinking in progress...', phase: 'thinking' });
      }
    });

    // Send heartbeat every 10 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      sendEvent('heartbeat', { timestamp: Date.now(), chunks: chunkCount });
    }, 10000);

    try {
      // Wait for completion
      const finalMessage = await stream.finalMessage();

      clearInterval(heartbeatInterval);

      console.log(`[BellMason Diagnostic SSE] Complete: ${chunkCount} chunks, stop_reason: ${finalMessage.stop_reason}`);
      sendEvent('status', { message: 'Processing complete, parsing results...', phase: 'parsing' });

      // Extract text from response (ignore thinking blocks)
      fullText = '';
      for (const block of finalMessage.content) {
        if (block.type === 'text') {
          fullText += block.text;
        } else if (block.type === 'thinking') {
          const thinkingContent = (block as any).thinking || (block as any).content || '';
          thinkingChars = typeof thinkingContent === 'string' ? thinkingContent.length : 0;
          console.log(`[BellMason Diagnostic SSE] Extended thinking used ${thinkingChars} chars of reasoning`);
        }
      }

      // Parse JSON from response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in diagnostic response');
      }

      const rawResult = JSON.parse(jsonMatch[0]);
      // Pass the stage to generate proper fallback dimensions with stage-appropriate ideals
      const result = sanitizeDiagnosticResult(rawResult, params.stage);

      console.log(`[BellMason Diagnostic SSE] Sanitized result with ${result.dimensions.length} dimensions, ${result.redFlags.length} red flags`);

      // Send the final result
      sendEvent('complete', { result });
      res.end();

    } catch (streamError) {
      clearInterval(heartbeatInterval);
      throw streamError;
    }

  } catch (error: any) {
    console.error('[BellMason Diagnostic SSE] Error:', error?.message || error);

    let errorMessage = 'Diagnostic failed';
    if (error?.status === 529) {
      errorMessage = 'AI service temporarily overloaded. Please try again in 30 seconds.';
    } else if (error?.status === 504 || error?.message?.includes('timeout')) {
      errorMessage = 'Diagnostic timed out. This can happen with complex ventures. Please try again.';
    } else {
      errorMessage = `Diagnostic failed: ${error?.message || 'Unknown error'}`;
    }

    sendEvent('error', { message: errorMessage });
    res.end();
  }
}
