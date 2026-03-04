import Anthropic from '@anthropic-ai/sdk';
import { getJson } from 'serpapi';

// Lazy-load Anthropic client
let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
    }
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

// ─── OA Framework Type Definitions ───────────────────────────────────────────

/**
 * Market Demand 2x2 Metric Card (OA §2)
 */
export interface MarketDemandMetric {
  metric: 'TAM' | 'Growth Rate' | 'Current Adoption' | 'Timing Score';
  value: string;
  source: string; // (Source: ...) or (Assumption: ...)
  confidence: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface MarketDemandAnalysis {
  metricCards: MarketDemandMetric[];
  convergenceTrends: Array<{
    trend: string;
    impact: 'high' | 'medium' | 'low';
    timeline: string;
    source: string;
  }>;
  userBehaviorAlignment: {
    alignmentScore: number; // 1-10
    keyBehaviors: string[];
    evidence: string;
    evidenceSource: string;
  };
  marketReadinessIndicators: Array<{
    indicator: string;
    status: 'ready' | 'emerging' | 'early' | 'not_ready';
    evidence: string;
  }>;
}

/**
 * Research Checklist Item (OA §13)
 */
export interface ResearchChecklistItem {
  id: string;
  claimSummary: string;
  category: 'market' | 'technical' | 'financial' | 'regulatory' | 'competitive';
  priority: 'high' | 'medium' | 'low';
  verificationMethod: 'interview' | 'data_request' | 'public_source' | 'third_party' | 'primary_research';
  responsibleParty: string;
  deadlineRecommendation: string;
  status: 'pending' | 'in_progress' | 'verified' | 'flagged';
}

// ── Type Definitions ─────────────────────────────────────────────────────────

export interface FutureCastIdeaInput {
  id: string;
  title: string;
  description: string;
  content?: string;
  market?: string;
  type?: string;
  targetAudience?: string;
  mainCompetitor?: string;
  opportunityScore?: number;
  problemScore?: number;
  feasibilityScore?: number;
  timingScore?: number;
  executionScore?: number;
  gtmScore?: number;
  revenuePotential?: string;
}

export interface SerpSearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface FutureCastResearchResult {
  phase: 1;
  title: 'Strategic Research Foundation';
  serpResults?: {
    marketTrends: SerpSearchResult[];
    competitorIntel: SerpSearchResult[];
    emergingTech: SerpSearchResult[];
  };
  research: {
    marketLandscape: string;
    competitiveIntelligence: string;
    technologyTrends: string;
    regulatoryEnvironment: string;
    consumerBehaviorShifts: string;
    keyUncertainties: string[];
    criticalAssumptions: string[];
  };
  // OA Framework Addition: Market Demand (§2)
  marketDemand: MarketDemandAnalysis;
  wordCount: number;
  timestamp: string;
}

export interface FutureCastHorizonsResult {
  phase: 2;
  title: 'Future Horizons Analysis';
  horizons: {
    horizon1: {
      timeframe: '0-2 years';
      title: string;
      narrative: string;
      keyDevelopments: string[];
      probabilityRange: string;
      impactOnVenture: string;
    };
    horizon2: {
      timeframe: '2-5 years';
      title: string;
      narrative: string;
      keyDevelopments: string[];
      probabilityRange: string;
      impactOnVenture: string;
    };
    horizon3: {
      timeframe: '5-10 years';
      title: string;
      narrative: string;
      keyDevelopments: string[];
      probabilityRange: string;
      impactOnVenture: string;
    };
  };
  drivingForces: Array<{
    force: string;
    certainty: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    description: string;
  }>;
  criticalUncertainties: Array<{
    uncertainty: string;
    possibleOutcomes: string[];
    strategicImplication: string;
  }>;
  wordCount: number;
  timestamp: string;
}

export interface FutureCastScenariosResult {
  phase: 3;
  title: 'Strategic Scenario Planning';
  scenarios: Array<{
    id: string;
    name: string;
    probability: number;
    narrative: string;
    keyAssumptions: string[];
    opportunitiesInScenario: string[];
    threatsInScenario: string[];
    venturePositioning: string;
    strategicMoves: string[];
  }>;
  scenarioMatrix: {
    xAxis: { label: string; lowEnd: string; highEnd: string };
    yAxis: { label: string; lowEnd: string; highEnd: string };
  };
  robustStrategies: string[];
  contingentStrategies: Array<{
    trigger: string;
    strategy: string;
    scenario: string;
  }>;
  wordCount: number;
  timestamp: string;
}

export interface FutureCastPanelResult {
  phase: 4;
  title: 'Strategic Expert Panel';
  panelists: Array<{
    name: string;
    credentials: string;
    expertise: string;
    framework: string;
    perspectiveAnalysis: string;
    keyInsights: string[];
    recommendations: string[];
    dissent?: string;
    confidence: number;
  }>;
  consensusPoints: string[];
  divergencePoints: Array<{
    topic: string;
    positions: Array<{ expert: string; position: string }>;
  }>;
  synthesizedRecommendations: string[];
  wordCount: number;
  timestamp: string;
}

export interface FutureCastSynthesisResult {
  phase: 5;
  title: 'Strategic Intelligence Synthesis';
  disclaimer?: string; // Executive-level disclaimer about data verification status
  executiveSummary: {
    ventureOutlook: 'highly_favorable' | 'favorable' | 'mixed' | 'challenging' | 'highly_challenging';
    confidenceLevel: number;
    timeHorizon: string;
    summaryNarrative: string;
  };
  strategicImperatives: Array<{
    priority: number;
    imperative: string;
    rationale: string;
    timeframe: string;
    resourceRequirements: string;
    successMetrics: string[];
  }>;
  futureReadinessAssessment: {
    overallScore: number;
    dimensions: Array<{
      dimension: string;
      score: number;
      assessment: string;
      gapAnalysis: string;
    }>;
  };
  riskMitigation: {
    primaryRisks: Array<{
      risk: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      mitigationStrategy: string;
      contingencyPlan: string;
    }>;
    earlyWarningIndicators: string[];
  };
  opportunityCapture: {
    primaryOpportunities: Array<{
      opportunity: string;
      timeWindow: string;
      captureStrategy: string;
      requiredCapabilities: string[];
    }>;
  };
  implementationRoadmap: {
    immediate: { timeframe: '0-3 months'; actions: string[] };
    shortTerm: { timeframe: '3-12 months'; actions: string[] };
    mediumTerm: { timeframe: '1-3 years'; actions: string[] };
    longTerm: { timeframe: '3-5 years'; actions: string[] };
  };
  appendix: {
    sourcesConsulted: string[];
    methodologyNotes: string;
    confidenceIntervals: string;
  };
  // OA Framework Addition: Research Checklist (§13)
  researchChecklist: ResearchChecklistItem[];
  // OA Framework metadata
  oaFramework: {
    version: string;
    sectionsIncluded: string[];
    dataFreshness: string;
  };
  wordCount: number;
  timestamp: string;
}

// ── Service Implementation ───────────────────────────────────────────────────

class FutureCastService {

  // Helper: Build business context string from idea
  private buildBusinessContext(idea: FutureCastIdeaInput): string {
    const sections = [
      `**Title:** ${idea.title}`,
      `**Description:** ${idea.description}`,
    ];

    if (idea.content) sections.push(`**Detailed Content:** ${idea.content}`);
    if (idea.market) sections.push(`**Market:** ${idea.market}`);
    if (idea.type) sections.push(`**Type:** ${idea.type}`);
    if (idea.targetAudience) sections.push(`**Target Audience:** ${idea.targetAudience}`);
    if (idea.mainCompetitor) sections.push(`**Main Competitor:** ${idea.mainCompetitor}`);
    if (idea.revenuePotential) sections.push(`**Revenue Potential:** ${idea.revenuePotential}`);

    const scores = [];
    if (idea.opportunityScore) scores.push(`Opportunity: ${idea.opportunityScore}/100`);
    if (idea.problemScore) scores.push(`Problem: ${idea.problemScore}/100`);
    if (idea.feasibilityScore) scores.push(`Feasibility: ${idea.feasibilityScore}/100`);
    if (idea.timingScore) scores.push(`Timing: ${idea.timingScore}/100`);
    if (idea.executionScore) scores.push(`Execution: ${idea.executionScore}/100`);
    if (idea.gtmScore) scores.push(`GTM: ${idea.gtmScore}/100`);

    if (scores.length > 0) {
      sections.push(`**Assessment Scores:** ${scores.join(', ')}`);
    }

    return sections.join('\n');
  }

  // Helper: Run Google search via SerpAPI
  private async searchGoogle(query: string, num: number = 10): Promise<SerpSearchResult[]> {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      console.log('[FutureCast] SERP_API_KEY not set, skipping web search');
      return [];
    }

    try {
      const results = await getJson({
        engine: 'google',
        q: query,
        api_key: apiKey,
        num,
      });

      return (results.organic_results || []).slice(0, num).map((r: any) => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || '',
      }));
    } catch (error) {
      console.error('[FutureCast] SerpAPI search error:', error);
      return [];
    }
  }

  // Helper: Parse JSON from Claude response
  private parseJsonResponse<T>(text: string): T {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/```\s*([\s\S]*?)\s*```/) ||
                      text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr) as T;
    }

    // If no JSON found, try parsing the whole response
    return JSON.parse(text) as T;
  }

  // Helper: Count words in an object (rough estimate)
  private countWords(obj: any): number {
    const text = JSON.stringify(obj);
    return text.split(/\s+/).length;
  }

  // ── Phase 1: Strategic Research ───────────────────────────────────────────

  async generateResearch(idea: FutureCastIdeaInput): Promise<FutureCastResearchResult> {
    console.log(`[FutureCast] Phase 1: Strategic Research for "${idea.title}"`);
    const startTime = Date.now();

    // Run 3 parallel SerpAPI searches
    const marketQuery = `${idea.market || idea.title} market trends 2024 2025 forecast analysis`;
    const competitorQuery = `${idea.mainCompetitor || idea.title} competitors funding startups market`;
    const techQuery = `${idea.market || idea.title} emerging technology AI disruption innovation`;

    console.log('[FutureCast] Running 3 parallel Google searches...');
    const [marketTrends, competitorIntel, emergingTech] = await Promise.all([
      this.searchGoogle(marketQuery, 8),
      this.searchGoogle(competitorQuery, 8),
      this.searchGoogle(techQuery, 8),
    ]);

    const serpResults = {
      marketTrends,
      competitorIntel,
      emergingTech,
    };

    const hasSerpData = marketTrends.length > 0 || competitorIntel.length > 0 || emergingTech.length > 0;

    const businessContext = this.buildBusinessContext(idea);

    const systemPrompt = `You are a senior partner at McKinsey & Company preparing institutional-grade strategic research for a $10B+ venture capital firm considering a $20M+ investment. Partners reviewing this have commissioned thousands of such analyses and expect elite consultant-grade output.

## CRITICAL WRITING STYLE - ELITE IC MEMO STANDARD
1. **DENSE ANALYTICAL PROSE**: Write in dense, flowing narrative paragraphs. NO bullet lists for analysis sections. Every insight must be woven into connected prose that builds a cohesive strategic argument.
2. **DATA IN NARRATIVE**: Numbers belong IN sentences, not isolated. Write "The $4.2B market expanded to $7.8B by 2025, reflecting a 23% CAGR that materially outpaces the broader enterprise software sector's 14% baseline (Source: Gartner, 2025)" — NOT bullet points with figures.
3. **STORYTELLING**: Each section tells a story with beginning (context), middle (analysis), and end (strategic implication). The reader should feel the market landscape unfolding through your prose.
4. **EXPERT AUTHORITY**: Write with the conviction and sophistication of a senior consultant. Use frameworks naturally woven into analysis, not as labels.

## CRITICAL OA FRAMEWORK RULES
1. **No Placeholders**: NEVER use [PLACEHOLDER], [TBD], [INSERT]. If unknown, state "data not available" or provide reasoned estimate.
2. **Source Attribution**: Every numeric claim must have inline attribution:
   - (Source: [specific source, date]) — Verified data
   - (Assumption: [basis]) — Reasoned estimate
   - (Estimate: [methodology]) — Calculated value

## SECTION-SPECIFIC WORD TARGETS (CRITICAL - vary depth by importance)
- marketLandscape: 800-1200 words (HEAVY - comprehensive market state analysis in DENSE PROSE)
- competitiveIntelligence: 700-1000 words (HEAVY - deep competitive analysis in NARRATIVE form)
- technologyTrends: 500-700 words (emerging tech, disruption potential - FLOWING PROSE)
- regulatoryEnvironment: 400-600 words (compliance, policy trends - ANALYTICAL NARRATIVE)
- consumerBehaviorShifts: 400-600 words (customer behavior changes - STORYTELLING)
- keyUncertainties: 5-7 items with specific detail (brief bullets acceptable here only)
- criticalAssumptions: 5-7 items with validation criteria (brief bullets acceptable here only)

TOTAL TARGET: 4,000-5,500 words of DENSE ANALYTICAL PROSE

You must return your response as valid JSON matching the exact schema specified.`;

    const userPrompt = `Generate comprehensive strategic research foundation for:

## VENTURE CONTEXT
${businessContext}

${hasSerpData ? `
## LIVE MARKET INTELLIGENCE (from web search)
### Market Trends:
${marketTrends.slice(0, 5).map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

### Competitor Intelligence:
${competitorIntel.slice(0, 5).map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

### Emerging Technology:
${emergingTech.slice(0, 5).map(r => `- ${r.title}: ${r.snippet}`).join('\n')}
` : ''}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "research": {
    "marketLandscape": "Comprehensive analysis of the current market state, size, growth rate, key segments, and dynamics (800-1200 words - HEAVY SECTION)",
    "competitiveIntelligence": "Deep analysis of competitive forces, key players, their strategies, strengths, weaknesses, and market positioning (700-1000 words - HEAVY SECTION)",
    "technologyTrends": "Analysis of relevant technology trends, innovations, adoption curves, and potential disruptions (500-700 words)",
    "regulatoryEnvironment": "Current and emerging regulatory considerations, compliance requirements, and policy trends (400-600 words)",
    "consumerBehaviorShifts": "Analysis of changing customer behaviors, preferences, expectations, and decision drivers (400-600 words)",
    "keyUncertainties": ["List of 5-7 key uncertainties that could significantly impact the venture - each with specific detail"],
    "criticalAssumptions": ["List of 5-7 critical assumptions underlying the venture's success - each with validation criteria"]
  },
  "marketDemand": {
    "metricCards": [
      {
        "metric": "TAM",
        "value": "$XXB",
        "source": "(Source: [research firm, year])",
        "confidence": "high|medium|low",
        "trend": "increasing|stable|decreasing"
      },
      {
        "metric": "Growth Rate",
        "value": "XX% CAGR",
        "source": "(Source: [research firm, year])",
        "confidence": "high|medium|low",
        "trend": "increasing|stable|decreasing"
      },
      {
        "metric": "Current Adoption",
        "value": "XX%",
        "source": "(Source: [research firm, year]) or (Assumption: [basis])",
        "confidence": "high|medium|low",
        "trend": "increasing|stable|decreasing"
      },
      {
        "metric": "Timing Score",
        "value": "X/10",
        "source": "(Estimate: based on convergence analysis)",
        "confidence": "high|medium|low",
        "trend": "increasing|stable|decreasing"
      }
    ],
    "convergenceTrends": [
      {
        "trend": "Trend name and description",
        "impact": "high|medium|low",
        "timeline": "When this trend peaks",
        "source": "(Source: ...)"
      }
    ],
    "userBehaviorAlignment": {
      "alignmentScore": 8,
      "keyBehaviors": ["Behavior 1", "Behavior 2"],
      "evidence": "Evidence of alignment",
      "evidenceSource": "(Source: ...)"
    },
    "marketReadinessIndicators": [
      {
        "indicator": "Indicator name",
        "status": "ready|emerging|early|not_ready",
        "evidence": "Supporting evidence"
      }
    ]
  }
}

CRITICAL WRITING REQUIREMENTS:
- Write in DENSE ANALYTICAL PROSE throughout - NO bullet lists in marketLandscape, competitiveIntelligence, technologyTrends, regulatoryEnvironment, or consumerBehaviorShifts
- Weave all data INTO narrative sentences naturally
- Use clear paragraph breaks for readability - each paragraph should develop one key idea
- Be specific with data points, company names, market figures, and trend trajectories
- ALL numeric claims must have inline source attribution
- This must read like a $50,000 McKinsey deliverable`;

    try {
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 12000, // Increased for proper depth - 4,000-5,500 word research
        temperature: 0.7,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJsonResponse<{
        research: FutureCastResearchResult['research'];
        marketDemand?: MarketDemandAnalysis;
      }>(textContent);

      // Provide default marketDemand if not present (for backwards compatibility)
      const defaultMarketDemand: MarketDemandAnalysis = {
        metricCards: [],
        convergenceTrends: [],
        userBehaviorAlignment: {
          alignmentScore: 0,
          keyBehaviors: [],
          evidence: 'Data not available',
          evidenceSource: '(Assumption: insufficient data)',
        },
        marketReadinessIndicators: [],
      };

      const result: FutureCastResearchResult = {
        phase: 1,
        title: 'Strategic Research Foundation',
        serpResults: hasSerpData ? serpResults : undefined,
        research: parsed.research,
        marketDemand: parsed.marketDemand || defaultMarketDemand,
        wordCount: this.countWords(parsed.research),
        timestamp: new Date().toISOString(),
      };

      console.log(`[FutureCast] Phase 1 completed in ${Date.now() - startTime}ms, ~${result.wordCount} words`);
      return result;
    } catch (error) {
      console.error('[FutureCast] Phase 1 error:', error);
      throw new Error('Failed to generate strategic research');
    }
  }

  // ── Phase 2: Future Horizons ──────────────────────────────────────────────

  async generateHorizons(
    idea: FutureCastIdeaInput,
    research: FutureCastResearchResult
  ): Promise<FutureCastHorizonsResult> {
    console.log(`[FutureCast] Phase 2: Future Horizons for "${idea.title}"`);
    const startTime = Date.now();

    const businessContext = this.buildBusinessContext(idea);

    const systemPrompt = `You are a senior partner at McKinsey & Company specializing in strategic foresight, preparing horizon analysis for a $10B+ VC firm. You apply the Three Horizons Framework (Baghai, Coley, White) with the rigor expected of a $50,000 consulting engagement.

## CRITICAL WRITING STYLE - ELITE NARRATIVE STANDARD
1. **DENSE ANALYTICAL PROSE**: Write in flowing narrative paragraphs. NO bullet lists in narrative sections. Each horizon's narrative must read as cohesive storytelling that unfolds the future.
2. **DATA IN NARRATIVE**: Weave all figures, timelines, and probabilities INTO sentences naturally. Write "By 2027, we project the market will reach $12.4B, representing a 340% expansion from today's $2.8B base" — NOT isolated data points.
3. **STORYTELLING**: Each horizon tells a compelling story of how the future unfolds. The reader should visualize the trajectory through your prose.
4. **READABLE FORMAT**: Use clear paragraph breaks between ideas. Headings structure the content, but analysis flows as connected prose within each section.

The Three Horizons Framework:
- Horizon 1 (0-2 years): Core business today - managing and defending current position
- Horizon 2 (2-5 years): Emerging opportunities - nurturing and building new capabilities
- Horizon 3 (5-10 years): Transformational possibilities - options and experiments

## SECTION-SPECIFIC WORD TARGETS (CRITICAL)
- Horizon 1 narrative: 600-800 words (DENSE PROSE - comprehensive near-term analysis)
- Horizon 1 impactOnVenture: 200-300 words (NARRATIVE form)
- Horizon 2 narrative: 700-900 words (HEAVIEST - emerging opportunities in STORYTELLING style)
- Horizon 2 impactOnVenture: 250-350 words (ANALYTICAL PROSE)
- Horizon 3 narrative: 600-800 words (transformational possibilities - VISIONARY NARRATIVE)
- Horizon 3 impactOnVenture: 200-300 words (STRATEGIC PROSE)
- Each driving force description: 150-200 words (CONNECTED PROSE)
- Each critical uncertainty strategicImplication: 150-200 words (ANALYTICAL NARRATIVE)

TOTAL TARGET: 4,500-6,000 words of DENSE ANALYTICAL PROSE

Return your response as valid JSON matching the exact schema specified.`;

    const userPrompt = `Based on the strategic research foundation, generate a comprehensive Three Horizons analysis.

## VENTURE CONTEXT
${businessContext}

## STRATEGIC RESEARCH FOUNDATION (Phase 1)
${JSON.stringify(research.research, null, 2)}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "horizons": {
    "horizon1": {
      "timeframe": "0-2 years",
      "title": "Descriptive title for this horizon",
      "narrative": "Detailed narrative of what will happen in this timeframe (600-800 words - comprehensive near-term analysis)",
      "keyDevelopments": ["7-10 specific developments expected with timeline indicators"],
      "probabilityRange": "Probability assessment (e.g., 'High confidence - 80-90%')",
      "impactOnVenture": "How this horizon affects the venture (200-300 words - specific strategic implications)"
    },
    "horizon2": {
      "timeframe": "2-5 years",
      "title": "Descriptive title for this horizon",
      "narrative": "Detailed narrative (700-900 words - HEAVIEST SECTION, emerging opportunities)",
      "keyDevelopments": ["7-10 specific developments with probability indicators"],
      "probabilityRange": "Probability assessment",
      "impactOnVenture": "Impact analysis (250-350 words - detailed strategic positioning)"
    },
    "horizon3": {
      "timeframe": "5-10 years",
      "title": "Descriptive title for this horizon",
      "narrative": "Detailed narrative (600-800 words - transformational possibilities)",
      "keyDevelopments": ["7-10 specific developments with scenario dependencies"],
      "probabilityRange": "Probability assessment",
      "impactOnVenture": "Impact analysis (200-300 words - long-term strategic options)"
    }
  },
  "drivingForces": [
    {
      "force": "Name of driving force",
      "certainty": "high|medium|low",
      "impact": "high|medium|low",
      "description": "Detailed description of this force and its trajectory (150-200 words each)"
    }
  ],
  "criticalUncertainties": [
    {
      "uncertainty": "Name of uncertainty",
      "possibleOutcomes": ["Outcome A with probability", "Outcome B with probability", "Outcome C with probability"],
      "strategicImplication": "What this means for strategy (150-200 words - specific action implications)"
    }
  ]
}

Include 6-8 driving forces and 4-5 critical uncertainties. Be specific and substantive with each entry.`;

    try {
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 14000, // Increased for proper depth - 4,500-6,000 word horizons
        temperature: 0.7,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJsonResponse<Omit<FutureCastHorizonsResult, 'phase' | 'title' | 'wordCount' | 'timestamp'>>(textContent);

      const result: FutureCastHorizonsResult = {
        phase: 2,
        title: 'Future Horizons Analysis',
        horizons: parsed.horizons,
        drivingForces: parsed.drivingForces,
        criticalUncertainties: parsed.criticalUncertainties,
        wordCount: this.countWords(parsed),
        timestamp: new Date().toISOString(),
      };

      console.log(`[FutureCast] Phase 2 completed in ${Date.now() - startTime}ms, ~${result.wordCount} words`);
      return result;
    } catch (error) {
      console.error('[FutureCast] Phase 2 error:', error);
      throw new Error('Failed to generate horizons analysis');
    }
  }

  // ── Phase 3: Scenario Planning ────────────────────────────────────────────

  async generateScenarios(
    idea: FutureCastIdeaInput,
    research: FutureCastResearchResult,
    horizons: FutureCastHorizonsResult
  ): Promise<FutureCastScenariosResult> {
    console.log(`[FutureCast] Phase 3: Scenario Planning for "${idea.title}"`);
    const startTime = Date.now();

    const businessContext = this.buildBusinessContext(idea);

    // Extract top 2 critical uncertainties for scenario matrix
    const topUncertainties = horizons.criticalUncertainties.slice(0, 2);

    const systemPrompt = `You are a senior partner at McKinsey & Company trained in the Shell/GBN scenario methodology developed by Pierre Wack and Peter Schwartz. You are preparing scenario analysis for a $10B+ VC firm with the rigor of a $50,000 consulting engagement.

## CRITICAL WRITING STYLE - ELITE NARRATIVE STANDARD
1. **DENSE ANALYTICAL PROSE**: Write scenario narratives as flowing, immersive stories. NO bullet lists in narratives. The reader should be transported into each future world through your prose.
2. **WORLD-BUILDING THROUGH NARRATIVE**: Each scenario narrative must paint a vivid, specific picture of that future. Describe how customers behave, how competitors have evolved, what technologies dominate, and how regulations have shaped the landscape—all woven into connected prose.
3. **DATA IN CONTEXT**: Embed projections and figures naturally into the narrative. Write "In this future, the market has consolidated to three dominant players controlling 78% of the $14B market" — NOT isolated statistics.
4. **READABLE FORMAT**: Use clear paragraph breaks. Each scenario should flow logically from setup through implications.

Scenario Planning Principles:
- Create 4 distinct, plausible futures based on critical uncertainties
- Each scenario must be internally consistent
- Scenarios should be challengingly different from each other
- Names should be memorable and evocative (not "optimistic/pessimistic")
- Focus on strategic relevance to the venture

## SECTION-SPECIFIC WORD TARGETS (CRITICAL)
- Each scenario narrative: 600-800 words (DENSE IMMERSIVE PROSE - detailed world-building)
- Each scenario venturePositioning: 150-200 words (STRATEGIC NARRATIVE)
- Each scenario keyAssumptions: 6-8 items (brief items acceptable here)
- Each scenario strategicMoves: 6-8 concrete actions (brief items acceptable here)
- robustStrategies: 6-8 strategies with rationale (brief items acceptable here)
- Each contingentStrategy: specific trigger + response

TOTAL TARGET: 4,500-6,000 words of scenario content

Return your response as valid JSON matching the exact schema specified.`;

    const userPrompt = `Generate four strategic scenarios using the 2x2 matrix method.

## VENTURE CONTEXT
${businessContext}

## CRITICAL UNCERTAINTIES FOR SCENARIO MATRIX
Uncertainty 1: ${topUncertainties[0]?.uncertainty || 'Technology adoption pace'}
Uncertainty 2: ${topUncertainties[1]?.uncertainty || 'Market consolidation'}

## STRATEGIC RESEARCH FOUNDATION
Key findings: ${research.research.marketLandscape.substring(0, 500)}...

## FUTURE HORIZONS CONTEXT
${JSON.stringify(horizons.horizons.horizon2, null, 2)}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "scenarios": [
    {
      "id": "scenario_1",
      "name": "Evocative scenario name (e.g., 'Digital Renaissance', 'Fragmented Future')",
      "probability": 25,
      "narrative": "Detailed narrative of this future world (600-800 words). Describe the market conditions, competitive landscape, technology state, customer behaviors, and regulatory environment in this scenario with rich detail.",
      "keyAssumptions": ["6-8 specific assumptions that make this scenario true - each with measurable indicators"],
      "opportunitiesInScenario": ["5-7 opportunities available in this scenario with timing windows"],
      "threatsInScenario": ["5-7 threats present in this scenario with severity assessment"],
      "venturePositioning": "How the venture should position in this scenario (150-200 words - specific strategic posture)",
      "strategicMoves": ["6-8 strategic moves to thrive in this scenario - each with resource implications"]
    }
  ],
  "scenarioMatrix": {
    "xAxis": {
      "label": "Name of first uncertainty",
      "lowEnd": "What low end means (specific description)",
      "highEnd": "What high end means (specific description)"
    },
    "yAxis": {
      "label": "Name of second uncertainty",
      "lowEnd": "What low end means (specific description)",
      "highEnd": "What high end means (specific description)"
    }
  },
  "robustStrategies": ["6-8 strategies that work well across all scenarios - each with rationale"],
  "contingentStrategies": [
    {
      "trigger": "Specific, measurable signal indicating this scenario is emerging",
      "strategy": "Detailed response action with timeline",
      "scenario": "Which scenario this applies to"
    }
  ]
}

Create 4 scenarios, one for each quadrant of the matrix. Include 5-7 contingent strategies with specific triggers.`;

    try {
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 14000, // Increased for proper depth - 4,500-6,000 word scenarios
        temperature: 0.7,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJsonResponse<Omit<FutureCastScenariosResult, 'phase' | 'title' | 'wordCount' | 'timestamp'>>(textContent);

      const result: FutureCastScenariosResult = {
        phase: 3,
        title: 'Strategic Scenario Planning',
        scenarios: parsed.scenarios,
        scenarioMatrix: parsed.scenarioMatrix,
        robustStrategies: parsed.robustStrategies,
        contingentStrategies: parsed.contingentStrategies,
        wordCount: this.countWords(parsed),
        timestamp: new Date().toISOString(),
      };

      console.log(`[FutureCast] Phase 3 completed in ${Date.now() - startTime}ms, ~${result.wordCount} words`);
      return result;
    } catch (error) {
      console.error('[FutureCast] Phase 3 error:', error);
      throw new Error('Failed to generate scenario planning');
    }
  }

  // ── Phase 4: Expert Panel ─────────────────────────────────────────────────

  async generatePanel(
    idea: FutureCastIdeaInput,
    research: FutureCastResearchResult,
    horizons: FutureCastHorizonsResult,
    scenarios: FutureCastScenariosResult
  ): Promise<FutureCastPanelResult> {
    console.log(`[FutureCast] Phase 4: Expert Panel for "${idea.title}"`);
    const startTime = Date.now();

    const businessContext = this.buildBusinessContext(idea);

    const systemPrompt = `You are a senior partner at McKinsey & Company facilitating a strategic advisory panel of world-renowned experts for a $10B+ VC firm considering a $20M+ investment.

## CRITICAL WRITING STYLE - ELITE NARRATIVE STANDARD
1. **DENSE ANALYTICAL PROSE**: Each expert's perspectiveAnalysis must be flowing, connected narrative. NO bullet lists in analysis sections. The expert's thinking should unfold as cohesive intellectual argument.
2. **FRAMEWORK APPLICATION IN NARRATIVE**: Write "Through the lens of Christensen's disruption theory, this venture exhibits classic low-end disruption characteristics. The incumbents' reluctance to cannibalize their high-margin enterprise offerings creates a strategic opening..." — NOT "Disruption framework: [bullet points]"
3. **EXPERT VOICE**: Each expert should sound like their published work. Their analysis should reflect their known perspectives, frameworks, and analytical style woven into narrative prose.
4. **READABLE FORMAT**: Use clear paragraph breaks. Each expert's analysis should flow logically from observation through framework application to conclusion.

Panel Composition Guidelines:
- Each panelist must be a REAL, verifiable expert with published work
- Include diverse perspectives: industry, technology, strategy, investment, behavioral
- Each expert should apply their known frameworks and methodologies
- At least one panelist MUST express substantive dissent or caution with detailed reasoning
- Perspectives should be deep and analytical, not superficial

## SECTION-SPECIFIC WORD TARGETS (CRITICAL)
- Each panelist perspectiveAnalysis: 400-500 words (DENSE ANALYTICAL PROSE - framework-based narrative)
- Each panelist keyInsights: 5-7 specific insights (brief items acceptable here)
- Each panelist recommendations: 4-6 concrete recommendations (brief items acceptable here)
- Each panelist dissent (if applicable): 100-150 words (NARRATIVE form with reasoning)
- consensusPoints: 6-8 points (brief items acceptable here)
- Each divergencePoint: 2-3 contrasting positions with nuance (50+ words each in PROSE)
- synthesizedRecommendations: 6-8 recommendations (brief items acceptable here)

TOTAL TARGET: 4,500-6,000 words of expert perspectives (5 panelists × 500+ words + synthesis)

Return your response as valid JSON matching the exact schema specified.`;

    const userPrompt = `Generate a strategic expert panel discussion with 5 real-world experts.

## VENTURE CONTEXT
${businessContext}

## STRATEGIC CONTEXT SUMMARY
Market Landscape: ${research.research.marketLandscape.substring(0, 300)}...
Key Uncertainties: ${research.research.keyUncertainties.slice(0, 3).join(', ')}
Horizon 2 Outlook: ${horizons.horizons.horizon2.title}
Most Likely Scenario: ${scenarios.scenarios[0]?.name || 'Unknown'}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "panelists": [
    {
      "name": "Full name of a REAL expert (e.g., 'Clayton Christensen', 'Rita McGrath', 'Ben Thompson')",
      "credentials": "Real credentials and affiliations (detailed)",
      "expertise": "Their specific area of expertise",
      "framework": "The framework/methodology they are known for applying",
      "perspectiveAnalysis": "Their detailed analysis of this venture from their perspective (400-500 words - HEAVY SECTION). Apply their known frameworks, cite their typical thinking patterns, and provide specific venture-relevant insights.",
      "keyInsights": ["5-7 key insights from this expert's perspective - each specific and actionable"],
      "recommendations": ["4-6 specific recommendations with rationale"],
      "dissent": "If this expert has concerns or disagrees with optimistic views, state them here (100-150 words with specific reasoning)",
      "confidence": 75
    }
  ],
  "consensusPoints": ["6-8 points where all experts agree - each with specific detail"],
  "divergencePoints": [
    {
      "topic": "Topic of disagreement",
      "positions": [
        {"expert": "Expert name", "position": "Their position with nuanced reasoning (50+ words)"},
        {"expert": "Another expert", "position": "Their contrasting position with rationale (50+ words)"}
      ]
    }
  ],
  "synthesizedRecommendations": ["6-8 prioritized recommendations that emerge from the panel discussion - each with implementation guidance"]
}

Include 5 panelists with diverse perspectives. Ensure at least 3-4 divergence points and meaningful dissent from at least 2 panelists.`;

    try {
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 14000, // Increased for proper depth - 4,500-6,000 word expert panel
        temperature: 0.8,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJsonResponse<Omit<FutureCastPanelResult, 'phase' | 'title' | 'wordCount' | 'timestamp'>>(textContent);

      const result: FutureCastPanelResult = {
        phase: 4,
        title: 'Strategic Expert Panel',
        panelists: parsed.panelists,
        consensusPoints: parsed.consensusPoints,
        divergencePoints: parsed.divergencePoints,
        synthesizedRecommendations: parsed.synthesizedRecommendations,
        wordCount: this.countWords(parsed),
        timestamp: new Date().toISOString(),
      };

      console.log(`[FutureCast] Phase 4 completed in ${Date.now() - startTime}ms, ~${result.wordCount} words`);
      return result;
    } catch (error) {
      console.error('[FutureCast] Phase 4 error:', error);
      throw new Error('Failed to generate expert panel');
    }
  }

  // ── Phase 5: Final Synthesis ──────────────────────────────────────────────

  async generateSynthesis(
    idea: FutureCastIdeaInput,
    research: FutureCastResearchResult,
    horizons: FutureCastHorizonsResult,
    scenarios: FutureCastScenariosResult,
    panel: FutureCastPanelResult
  ): Promise<FutureCastSynthesisResult> {
    console.log(`[FutureCast] Phase 5: Final Synthesis for "${idea.title}"`);
    const startTime = Date.now();

    const businessContext = this.buildBusinessContext(idea);

    const systemPrompt = `You are a senior partner at McKinsey & Company synthesizing all strategic intelligence into an institutional-grade report for a $10B+ VC firm. This is a $50,000 consulting deliverable that integrates insights from market research, horizon scanning, scenario planning, and expert panel perspectives.

## CRITICAL WRITING STYLE - ELITE NARRATIVE STANDARD
1. **DENSE ANALYTICAL PROSE**: The executive summary and all rationale/assessment sections must be flowing, connected narrative. NO bullet lists in analytical sections. Build cohesive arguments through prose.
2. **DATA IN NARRATIVE**: Weave all figures and projections INTO sentences naturally. Write "The venture's 72% future readiness score reflects strong technology adaptability but reveals critical gaps in market positioning that require immediate attention" — NOT isolated metrics.
3. **STORYTELLING**: The summaryNarrative must tell a compelling strategic story that synthesizes all findings into a coherent investment narrative. The reader should understand the opportunity, the risks, and the path forward through connected prose.
4. **READABLE FORMAT**: Use clear paragraph breaks between ideas. Headings structure the content, but analysis flows as connected prose within each section.

## CRITICAL OA FRAMEWORK RULES
1. **No Placeholders**: NEVER use [PLACEHOLDER], [TBD], [INSERT]. If unknown, state "data not available" or provide reasoned estimate.
2. **Source Attribution**: Every numeric claim must have (Source: ...) or (Assumption: ...) or (Estimate: ...)
3. **Research Checklist**: Include verification TODOs for ALL unconfirmed claims
4. **Disclaimer**: Include a professional disclaimer about data verification status

## SECTION-SPECIFIC WORD TARGETS (CRITICAL)
- disclaimer: 2-3 executive-clarity sentences
- executiveSummary.summaryNarrative: 800-1200 words (HEAVIEST - COMPELLING STRATEGIC NARRATIVE - this is the most important prose section)
- Each strategicImperative rationale: 150-200 words (DENSE ANALYTICAL PROSE)
- Each futureReadinessAssessment dimension assessment: 150-200 words (NARRATIVE form)
- Each futureReadinessAssessment dimension gapAnalysis: 100-150 words (ANALYTICAL PROSE)
- Each primaryRisk mitigationStrategy: 150-200 words (STRATEGIC NARRATIVE)
- Each primaryOpportunity captureStrategy: 150-200 words (ACTIONABLE PROSE)
- implementationRoadmap: 6-8 actions per timeframe (brief items acceptable here)
- researchChecklist: 8-12 items (brief items acceptable here)

TOTAL TARGET: 7,000-10,000 words of SYNTHESIZED INTELLIGENCE in ELITE NARRATIVE PROSE

This document should read as an institutional-grade strategic brief that could be presented to a board or investment committee at Sequoia, a16z, or Bessemer.

Return your response as valid JSON matching the exact schema specified.`;

    const userPrompt = `Generate the final strategic intelligence synthesis.

## VENTURE CONTEXT
${businessContext}

## PHASE 1: RESEARCH HIGHLIGHTS
- Market: ${research.research.marketLandscape.substring(0, 400)}
- Competition: ${research.research.competitiveIntelligence.substring(0, 300)}
- Key Uncertainties: ${research.research.keyUncertainties.join('; ')}

## PHASE 2: HORIZONS HIGHLIGHTS
- Horizon 1: ${horizons.horizons.horizon1.title} - ${horizons.horizons.horizon1.narrative.substring(0, 200)}
- Horizon 2: ${horizons.horizons.horizon2.title} - ${horizons.horizons.horizon2.narrative.substring(0, 200)}
- Horizon 3: ${horizons.horizons.horizon3.title}
- Critical Uncertainties: ${horizons.criticalUncertainties.map(u => u.uncertainty).join('; ')}

## PHASE 3: SCENARIOS HIGHLIGHTS
${scenarios.scenarios.map(s => `- ${s.name} (${s.probability}%): ${s.narrative.substring(0, 150)}`).join('\n')}
- Robust Strategies: ${scenarios.robustStrategies.slice(0, 3).join('; ')}

## PHASE 4: PANEL HIGHLIGHTS
- Consensus: ${panel.consensusPoints.slice(0, 3).join('; ')}
- Recommendations: ${panel.synthesizedRecommendations.slice(0, 3).join('; ')}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "disclaimer": "This strategic intelligence report presents preliminary findings that have not been subjected to formal pre-mortem review. Data sources are cited where available; claims marked as requiring verification should be validated prior to major strategic decisions. All projections represent analytical estimates based on available data, not audited findings.",
  "executiveSummary": {
    "ventureOutlook": "highly_favorable|favorable|mixed|challenging|highly_challenging",
    "confidenceLevel": 75,
    "timeHorizon": "Assessment timeframe (e.g., '3-5 year outlook')",
    "summaryNarrative": "Executive summary of the strategic intelligence (800-1200 words - HEAVIEST SECTION). This should be a compelling narrative that synthesizes all findings, connects insights across phases, and provides clear strategic direction."
  },
  "strategicImperatives": [
    {
      "priority": 1,
      "imperative": "Clear imperative statement",
      "rationale": "Why this is critical (150-200 words with evidence from analysis)",
      "timeframe": "When to execute with milestones",
      "resourceRequirements": "What resources are needed (specific)",
      "successMetrics": ["4-6 measurable success indicators with targets"]
    }
  ],
  "futureReadinessAssessment": {
    "overallScore": 72,
    "dimensions": [
      {
        "dimension": "Dimension name (e.g., 'Technology Adaptability', 'Market Position')",
        "score": 75,
        "assessment": "Assessment of current state (150-200 words with specific evidence)",
        "gapAnalysis": "What needs to improve (100-150 words with action implications)"
      }
    ]
  },
  "riskMitigation": {
    "primaryRisks": [
      {
        "risk": "Risk description with specific triggers",
        "severity": "critical|high|medium|low",
        "mitigationStrategy": "How to mitigate (150-200 words with specific actions)",
        "contingencyPlan": "If mitigation fails (75-100 words with fallback options)"
      }
    ],
    "earlyWarningIndicators": ["6-8 specific, measurable signals to monitor"]
  },
  "opportunityCapture": {
    "primaryOpportunities": [
      {
        "opportunity": "Opportunity description with value potential",
        "timeWindow": "When opportunity is available (specific timeframe)",
        "captureStrategy": "How to capture (150-200 words with specific actions)",
        "requiredCapabilities": ["Capabilities needed with development path"]
      }
    ]
  },
  "implementationRoadmap": {
    "immediate": {
      "timeframe": "0-3 months",
      "actions": ["6-8 immediate actions with owners and dependencies"]
    },
    "shortTerm": {
      "timeframe": "3-12 months",
      "actions": ["6-8 short-term actions with milestone markers"]
    },
    "mediumTerm": {
      "timeframe": "1-3 years",
      "actions": ["6-8 medium-term actions with success criteria"]
    },
    "longTerm": {
      "timeframe": "3-5 years",
      "actions": ["6-8 long-term actions with scenario dependencies"]
    }
  },
  "appendix": {
    "sourcesConsulted": ["Detailed list of key sources and methodologies used"],
    "methodologyNotes": "Notes on the methodology used for this analysis (100+ words)",
    "confidenceIntervals": "Notes on confidence levels and limitations (100+ words)"
  },
  "researchChecklist": [
    {
      "id": "rc_1",
      "claimSummary": "Specific claim that needs verification",
      "category": "market|technical|financial|regulatory|competitive",
      "priority": "high|medium|low",
      "verificationMethod": "interview|data_request|public_source|third_party|primary_research",
      "responsibleParty": "Specific role or function who should verify",
      "deadlineRecommendation": "Based on strategic timeline with rationale",
      "status": "pending"
    }
  ],
  "oaFramework": {
    "version": "1.0",
    "sectionsIncluded": ["marketDemand", "researchChecklist", "disclaimer"],
    "dataFreshness": "YYYY-MM-DD"
  }
}

Include 6-8 strategic imperatives, 5-6 future readiness dimensions, 5-7 primary risks, 5-7 primary opportunities, and 8-12 research checklist items for unverified claims.`;

    try {
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 20000, // Increased for proper depth - 7,000-10,000 word synthesis
        temperature: 0.6,
        messages: [
          { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = this.parseJsonResponse<Omit<FutureCastSynthesisResult, 'phase' | 'title' | 'wordCount' | 'timestamp'> & { disclaimer?: string }>(textContent);

      // Provide defaults for OA framework fields
      const defaultResearchChecklist: ResearchChecklistItem[] = [];
      const defaultOaFramework = {
        version: '1.0',
        sectionsIncluded: ['marketDemand', 'researchChecklist', 'disclaimer'],
        dataFreshness: new Date().toISOString().split('T')[0],
      };
      const defaultDisclaimer = "This strategic intelligence report presents preliminary findings that have not been subjected to formal pre-mortem review. Data sources are cited where available; claims requiring verification should be validated prior to major strategic decisions. All projections represent analytical estimates based on available data, not audited findings.";

      const result: FutureCastSynthesisResult = {
        phase: 5,
        title: 'Strategic Intelligence Synthesis',
        disclaimer: parsed.disclaimer || defaultDisclaimer,
        executiveSummary: parsed.executiveSummary,
        strategicImperatives: parsed.strategicImperatives,
        futureReadinessAssessment: parsed.futureReadinessAssessment,
        riskMitigation: parsed.riskMitigation,
        opportunityCapture: parsed.opportunityCapture,
        implementationRoadmap: parsed.implementationRoadmap,
        appendix: parsed.appendix,
        researchChecklist: parsed.researchChecklist || defaultResearchChecklist,
        oaFramework: parsed.oaFramework || defaultOaFramework,
        wordCount: this.countWords(parsed),
        timestamp: new Date().toISOString(),
      };

      console.log(`[FutureCast] Phase 5 completed in ${Date.now() - startTime}ms, ~${result.wordCount} words`);
      return result;
    } catch (error) {
      console.error('[FutureCast] Phase 5 error:', error);
      throw new Error('Failed to generate final synthesis');
    }
  }
}

// Export singleton instance
export const futureCastService = new FutureCastService();
