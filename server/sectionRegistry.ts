/**
 * Section Registry
 *
 * Defines all OA (Opportunity Analysis) framework sections and their applicability
 * to each analysis tool. This ensures consistent section handling across tools.
 *
 * Note: Section 12 (Build Process) is EXCLUDED from all tools as per requirements.
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export type AnalysisTool =
  | 'disruption-scanner'
  | 'future-cast'
  | 'ic-memo'
  | 'market-sizing'
  | 'bell-mason';

export interface SectionDefinition {
  id: string;
  heading: string;
  oaSection: number | null; // OA framework section number (1-13, null if not from OA)
  required: boolean;
  order: number;
  applicableTo: AnalysisTool[] | 'all';
  description: string;
  promptGuidance: string;
}

// ─── Section Registry ────────────────────────────────────────────────────────

export const SECTION_REGISTRY: SectionDefinition[] = [
  // ─── §1 Executive Summary ─────────────────────────────────────────────────
  {
    id: 'executive-summary',
    heading: 'Executive Summary',
    oaSection: 1,
    required: true,
    order: 1,
    applicableTo: 'all',
    description: 'High-level synthesis with verdict and confidence score',
    promptGuidance: `Generate an executive summary with:
- 2-3 paragraph synthesis of key findings
- Clear verdict: EXCEPTIONAL | STRONG | MODERATE | WEAK
- Confidence score (0-100) with justification
- 3-5 key takeaways as bullet points`,
  },

  // ─── §2 Market Demand ─────────────────────────────────────────────────────
  {
    id: 'market-demand',
    heading: 'Market Demand',
    oaSection: 2,
    required: true,
    order: 2,
    applicableTo: ['market-sizing', 'future-cast', 'ic-memo'],
    description: '2x2 metric cards with TAM, growth rate, adoption, timing',
    promptGuidance: `Generate market demand analysis with 2x2 metric card structure:
- TAM/SAM/SOM with sources or assumptions labeled
- Market growth rate (CAGR) with timeframe
- Current adoption % and trajectory
- Timing score (1-10) with convergence trends
- User behavior alignment statistics
Each metric must have (Source: ...) or (Assumption: ...) attribution`,
  },

  // ─── §3 USP Cards ─────────────────────────────────────────────────────────
  {
    id: 'usp-cards',
    heading: 'Unique Selling Propositions',
    oaSection: 3,
    required: true,
    order: 3,
    applicableTo: ['ic-memo', 'bell-mason', 'disruption-scanner'],
    description: '4-6 USPs with value prop and measurable proof angle',
    promptGuidance: `Generate 4-6 USP cards, each containing:
- USP title (concise, memorable)
- Value proposition (1-2 sentences)
- Measurable proof angle (specific metric or outcome)
- Competitive differentiation (how this beats alternatives)
Dynamic count based on actual unique advantages found`,
  },

  // ─── §4 Target Audience Tiers ─────────────────────────────────────────────
  {
    id: 'target-audience-tiers',
    heading: 'Target Audience Tiers',
    oaSection: 4,
    required: true,
    order: 4,
    applicableTo: ['bell-mason', 'ic-memo', 'market-sizing'],
    description: 'Tier 1/2/3 segmentation with quantified before/after impact',
    promptGuidance: `Generate 3 audience tiers:
Tier 1 (Primary): Core target with highest LTV
- Persona description
- Pain intensity (1-10)
- Before/after quantified impact
- Estimated segment size

Tier 2 (Secondary): Adjacent market opportunity
- Same structure as Tier 1

Tier 3 (Expansion): Future growth market
- Same structure as Tier 1

Include willingness-to-pay estimates per tier`,
  },

  // ─── §5 Community Signals ─────────────────────────────────────────────────
  {
    id: 'community-signals',
    heading: 'Community Signals',
    oaSection: 5,
    required: false,
    order: 5,
    applicableTo: ['ic-memo', 'market-sizing'],
    description: 'Social proof from Reddit, communities, forums',
    promptGuidance: `Analyze community signals across platforms:
- Reddit: Relevant subreddits, member counts, engagement
- Facebook: Groups, activity levels
- Discord/Slack: Community size, activity
- Forums: Industry-specific discussions
Score each 1-10 with evidence citations`,
  },

  // ─── §6 Competitor Analysis ───────────────────────────────────────────────
  {
    id: 'competitor-analysis',
    heading: 'Competitor Analysis',
    oaSection: 6,
    required: true,
    order: 6,
    applicableTo: ['market-sizing', 'disruption-scanner', 'ic-memo'],
    description: 'Dynamic competitor count with positioning, features, pricing',
    promptGuidance: `Generate competitor analysis with dynamic count (find actual competitors, not forced 10):
For each competitor:
- Name and positioning statement
- Key features (3-5)
- Pricing (with source URL if available)
- Strengths (2-3)
- Limitations (2-3)
- Key integrations
- "Last reviewed" date
- Funding/revenue if known (with source)
Include homepage + pricing page URLs as sources`,
  },

  // ─── §7 Problems Solved ───────────────────────────────────────────────────
  {
    id: 'problems-solved',
    heading: 'Problems Solved',
    oaSection: 7,
    required: true,
    order: 7,
    applicableTo: ['ic-memo', 'bell-mason', 'disruption-scanner'],
    description: 'Pain points with before/after quantification',
    promptGuidance: `List problems solved with before/after quantification:
For each problem (dynamic count based on actual problems):
- Problem title
- Pain intensity (1-10)
- Current state (before) with metrics
- Future state (after) with projected metrics
- Time to value
- Confidence level in projection`,
  },

  // ─── §8 Key Features & Deployment ─────────────────────────────────────────
  {
    id: 'key-features-deployment',
    heading: 'Key Features & Deployment',
    oaSection: 8,
    required: true,
    order: 8,
    applicableTo: ['bell-mason', 'ic-memo'],
    description: 'UI/UX, security, integrations, performance',
    promptGuidance: `Assess key features and deployment:
- UI/UX Assessment: Usability score, accessibility, mobile-readiness
- Security Posture: Compliance certifications, data handling, audit status
- Integration Depth: API availability, ecosystem connections, data portability
- Performance Characteristics: Latency, scalability limits, reliability (SLA)
Each dimension scored 1-10 with evidence`,
  },

  // ─── §9 Market Gap Analysis ───────────────────────────────────────────────
  {
    id: 'market-gap-analysis',
    heading: 'Market Gap Analysis',
    oaSection: 9,
    required: true,
    order: 9,
    applicableTo: ['disruption-scanner', 'market-sizing', 'ic-memo'],
    description: 'Gap-to-UVP mapping with severity and coverage',
    promptGuidance: `Generate market gap analysis with Gap-to-UVP mapping:
For each gap (dynamic count):
- Gap title
- Severity (1-5)
- Frequency: high | medium | low
- Impacted personas (list)
- Workflow trigger (when does this gap hurt)
- Root cause
- Quantified impact (with source/assumption)
- Competitor coverage: Record<competitor, 'full' | 'partial' | 'none'>
- Corresponding UVP that addresses this gap`,
  },

  // ─── §10 Competitive Landscape Matrix ─────────────────────────────────────
  {
    id: 'competitive-landscape',
    heading: 'Competitive Landscape Matrix',
    oaSection: 10,
    required: true,
    order: 10,
    applicableTo: ['market-sizing', 'disruption-scanner'],
    description: 'Feature comparison matrix across competitors',
    promptGuidance: `Create competitive landscape matrix:
- Define 8-12 key comparison dimensions
- Score each competitor on each dimension (1-5 or Yes/No)
- Identify white space opportunities
- Note moat strength per competitor
Format as structured data suitable for visualization`,
  },

  // ─── §11 Monetization Strategy ────────────────────────────────────────────
  {
    id: 'monetization-strategy',
    heading: 'Monetization Strategy',
    oaSection: 11,
    required: true,
    order: 11,
    applicableTo: ['ic-memo', 'bell-mason'],
    description: 'Revenue model tiers, pricing rationale, projections',
    promptGuidance: `Define monetization strategy:
- Revenue model type (subscription, transactional, freemium, etc.)
- Pricing tiers (3-4 tiers with features per tier)
- Pricing rationale (value-based, competitive, cost-plus)
- Unit economics: CAC, LTV, LTV/CAC ratio, payback period
- Revenue projection assumptions (clearly labeled)
- Expansion revenue opportunities`,
  },

  // ─── §12 Build Process - EXCLUDED ─────────────────────────────────────────
  // Note: Section 12 is intentionally excluded from all tools as per requirements

  // ─── §13 Research Checklist ───────────────────────────────────────────────
  {
    id: 'research-checklist',
    heading: 'Research Checklist',
    oaSection: 13,
    required: true,
    order: 12,
    applicableTo: ['future-cast', 'ic-memo'],
    description: 'Verification TODOs for unconfirmed claims',
    promptGuidance: `Generate research checklist for outstanding diligence:
For each unverified claim in the analysis:
- Claim summary
- Priority: high | medium | low
- Verification method (interview, data request, public source)
- Responsible party suggestion
- Deadline recommendation
Group by category: Market, Technical, Financial, Legal`,
  },

  // ─── Tool-Specific Sections ───────────────────────────────────────────────

  // Disruption Scanner specific
  {
    id: 'disruption-vectors',
    heading: 'Disruption Vectors',
    oaSection: null,
    required: true,
    order: 20,
    applicableTo: ['disruption-scanner'],
    description: 'Five AI disruption vectors with threat assessment',
    promptGuidance: `Assess 5 AI disruption vectors:
1. Process Automation
2. Knowledge Commoditization
3. Decision Intelligence
4. Customer Disintermediation
5. Cost Structure Disruption
Each with score (0-100), analysis, and named threats`,
  },

  {
    id: 'moat-assessment',
    heading: 'Moat Assessment',
    oaSection: null,
    required: true,
    order: 21,
    applicableTo: ['disruption-scanner'],
    description: 'Helfert 5-pillar moat analysis',
    promptGuidance: `Assess 5 moat pillars:
1. Network Effects
2. Switching Costs
3. Brand/Trust
4. Cost Advantages
5. Regulatory/IP Protection
Each with holds (boolean), durability score, evidence, AI vulnerability`,
  },

  {
    id: 'torpedo-analysis',
    heading: 'Torpedo Analysis',
    oaSection: null,
    required: true,
    order: 22,
    applicableTo: ['disruption-scanner'],
    description: 'Premortem failure mode analysis',
    promptGuidance: `Identify 3-5 torpedo scenarios (existential risks):
- Evocative title
- 3-4 paragraph narrative
- Probability: high | medium | low
- Severity: catastrophic | severe | moderate
- Specific mitigant strategy
Include cascade warning for correlated risks`,
  },

  // Bell-Mason specific
  {
    id: 'dimensional-assessment',
    heading: 'Dimensional Assessment',
    oaSection: null,
    required: true,
    order: 23,
    applicableTo: ['bell-mason'],
    description: '12 Bell-Mason dimensions with diagnostic questions',
    promptGuidance: `Score all 12 Bell-Mason dimensions:
Technology, Product, Manufacturing, Business Plan, Marketing, Sales,
CEO, Team, Board, Cash, Fundability, Control
Each with score, ideal, status, narrative, and diagnostic questions`,
  },

  // Future Cast specific
  {
    id: 'three-horizons',
    heading: 'Three Horizons Analysis',
    oaSection: null,
    required: true,
    order: 24,
    applicableTo: ['future-cast'],
    description: 'Horizon 1/2/3 future scenarios',
    promptGuidance: `Generate Three Horizons analysis:
- Horizon 1 (0-2 years): Core business defense
- Horizon 2 (2-5 years): Emerging opportunities
- Horizon 3 (5-10 years): Transformational possibilities
Each with narrative, key developments, probability, impact`,
  },

  {
    id: 'scenario-planning',
    heading: 'Strategic Scenarios',
    oaSection: null,
    required: true,
    order: 25,
    applicableTo: ['future-cast'],
    description: '2x2 scenario matrix with strategic responses',
    promptGuidance: `Create 4 scenarios using 2x2 matrix:
Based on top 2 critical uncertainties
Each scenario with:
- Evocative name
- Probability
- Detailed narrative
- Opportunities and threats
- Strategic positioning
- Recommended moves`,
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get sections applicable to a specific tool
 */
export function getSectionsForTool(tool: AnalysisTool): SectionDefinition[] {
  return SECTION_REGISTRY.filter(
    section => section.applicableTo === 'all' || section.applicableTo.includes(tool)
  ).sort((a, b) => a.order - b.order);
}

/**
 * Get required sections for a specific tool
 */
export function getRequiredSectionsForTool(tool: AnalysisTool): string[] {
  return getSectionsForTool(tool)
    .filter(section => section.required)
    .map(section => section.heading);
}

/**
 * Get section by ID
 */
export function getSectionById(id: string): SectionDefinition | undefined {
  return SECTION_REGISTRY.find(section => section.id === id);
}

/**
 * Get all OA framework sections (excluding tool-specific)
 */
export function getOASections(): SectionDefinition[] {
  return SECTION_REGISTRY.filter(section => section.oaSection !== null)
    .sort((a, b) => (a.oaSection || 0) - (b.oaSection || 0));
}

/**
 * Build prompt injection for a tool's sections
 */
export function buildSectionPromptBlock(tool: AnalysisTool): string {
  const sections = getSectionsForTool(tool);
  const lines: string[] = ['## REQUIRED SECTIONS'];

  for (const section of sections) {
    if (section.required) {
      lines.push(`\n### ${section.heading}`);
      lines.push(section.promptGuidance);
    }
  }

  const optionalSections = sections.filter(s => !s.required);
  if (optionalSections.length > 0) {
    lines.push('\n## OPTIONAL SECTIONS (include if data available)');
    for (const section of optionalSections) {
      lines.push(`\n### ${section.heading}`);
      lines.push(section.promptGuidance);
    }
  }

  return lines.join('\n');
}

/**
 * Mapping of tools to their display names
 */
export const TOOL_DISPLAY_NAMES: Record<AnalysisTool, string> = {
  'disruption-scanner': 'Disruption Scanner',
  'future-cast': 'Future Cast',
  'ic-memo': 'IC Memo',
  'market-sizing': 'Market Sizing V2',
  'bell-mason': 'Bell-Mason Diagnostic',
};
