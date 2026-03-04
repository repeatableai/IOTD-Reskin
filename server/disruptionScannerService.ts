import Anthropic from '@anthropic-ai/sdk';

// ─── OA Framework Type Definitions ───────────────────────────────────────────

/**
 * Disruption Gap (OA §9) - Gap with corresponding UVP
 */
export interface DisruptionGap {
  id: string;
  title: string;
  severity: 1 | 2 | 3 | 4 | 5;
  severityColor: 'green' | 'yellow' | 'orange' | 'red' | 'darkred';
  frequency: 'high' | 'medium' | 'low';
  impactedPersonas: string[];
  workflowTrigger: string;
  rootCause: string;
  quantifiedImpact: string;
  quantifiedImpactSource: string; // (Source: ...) or (Assumption: ...)
  competitorCoverage: Record<string, 'full' | 'partial' | 'none'>;
  correspondingUVP: DisruptionUVP;
}

/**
 * UVP that addresses a disruption gap
 */
export interface DisruptionUVP {
  title: string;
  description: string;
  measureableOutcome: string;
  defensibility: 'high' | 'medium' | 'low';
}

/**
 * USP Card for Disruption Scanner (OA §3)
 */
export interface DisruptionUSP {
  id: string;
  title: string;
  valueProposition: string;
  measurableProofAngle: string;
  competitiveDifferentiation: string;
  aiDefensibility: 'high' | 'medium' | 'low';
}

// Types for the disruption scan response
export interface DisruptionScanResult {
  executiveSummary: {
    overallScore: number;
    classification: 'HIGH_RISK' | 'MODERATE' | 'RESILIENT';
    executiveNarrative: string;
    archetypeClassification: 'CREATOR' | 'DISRUPTOR' | 'ENABLER' | 'ADAPTOR' | 'DISRUPTED';
  };
  disruptionVectors: Array<{
    id: string;
    name: string;
    score: number;
    analysis: string;
    namedThreats: Array<{
      name: string;
      description: string;
      fundingData: string;
      fundingDataSource: string; // Source attribution
      threatLevel: 'critical' | 'high' | 'medium' | 'low';
    }>;
  }>;
  moatAssessment: {
    overallMoatRating: 'strong' | 'moderate' | 'weak' | 'eroding';
    holdingCount: number;
    pillars: Array<{
      name: string;
      holds: boolean;
      durabilityScore: number;
      evidence: string;
      evidenceSource: string; // Source attribution
      aiVulnerable: boolean;
    }>;
  };
  marginCompression: {
    currentEstimatedMargin: string;
    marginSource: string; // Source attribution
    scenarios: {
      conservative: { margin: string; timeline: string; assumptions: string };
      baseCase: { margin: string; timeline: string; assumptions: string };
      aggressive: { margin: string; timeline: string; assumptions: string };
    };
  };
  expertPanel: Array<{
    name: string;
    title: string;
    verdict: string;
    vote: 'INVESTABLE' | 'MANAGEABLE' | 'WATCH' | 'MODERATE_RISK' | 'HIGH_RISK' | 'AVOID';
    keyQuestion: string;
  }>;
  torpedoAnalysis: {
    torpedoes: Array<{
      title: string;
      narrative: string;
      probability: 'high' | 'medium' | 'low';
      severity: 'catastrophic' | 'severe' | 'moderate';
      mitigant: string;
    }>;
    cascadeWarning: string;
  };
  strategicActions: Array<{
    priority: number;
    action: string;
    rationale: string;
    impact: 'high' | 'medium' | 'low';
    timeline: string;
  }>;

  // ─── OA Framework Additions ───────────────────────────────────────────────

  /**
   * Market Gap Analysis (OA §9) - Gap-to-UVP mapping with severity visualization
   * Dynamic count based on actual gaps found
   */
  marketGapAnalysis: {
    gaps: DisruptionGap[];
    gapCount: number;
    severityDistribution: {
      critical: number; // severity 5
      high: number;     // severity 4
      medium: number;   // severity 3
      low: number;      // severity 2
      minimal: number;  // severity 1
    };
    whiteSpaceOpportunities: string[];
  };

  /**
   * USP Cards (OA §3) - Unique selling propositions with AI defensibility
   * Dynamic count (typically 4-6)
   */
  uspCards: DisruptionUSP[];

  /**
   * Research verification items for unconfirmed claims
   */
  researchVerification: Array<{
    claim: string;
    category: 'threat' | 'margin' | 'competitor' | 'market';
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

export interface DisruptionScanParams {
  companyName: string;
  sector: string;
  description?: string;
  ideaId?: string;
  market?: string;
  type?: string;
  targetAudience?: string;
}

const SYSTEM_PROMPT = `You are an institutional-grade AI Disruption Risk Analyst at a top-tier hedge fund following the Opportunity Analysis (OA) framework. Your assessments are used for investment decisions worth millions. Produce the most thorough, evidence-based analysis possible.

## CRITICAL OA FRAMEWORK RULES
1. **No Placeholders**: NEVER use [PLACEHOLDER], [TBD], [INSERT]. If unknown, state "data not available" or provide reasoned estimate.
2. **Source Attribution**: Every numeric claim must have:
   - (Source: [specific source, date]) — Verified data
   - (Assumption: [basis]) — Reasoned estimate
   - (Estimate: [methodology]) — Calculated value
3. **Dynamic Counts**: Do NOT force counts. Find actual gaps/competitors/threats, whether 3 or 15.
4. **Severity Visualization**: Use 1-5 scale with color mapping:
   - 1 (green): Minimal impact
   - 2 (yellow): Low impact
   - 3 (orange): Medium impact
   - 4 (red): High impact
   - 5 (darkred): Critical impact

## DEPTH REQUIREMENTS (CRITICAL)
- Every claim must reference specific companies, products, or data points
- Name actual AI startups, their funding rounds, and founding teams
- Include specific percentages, dollar amounts, and timeframes
- Each expert verdict must be 5-8 substantial paragraphs in their authentic voice
- Torpedo narratives must be detailed 3-4 paragraph scenarios, not summaries
- Analysis paragraphs should be 150-300 words each, not brief summaries

## ANALYTICAL FRAMEWORKS

### 1. Helfert 5-Pillar Moat Analysis
For EACH pillar, provide:
- Current state assessment with specific evidence
- Named AI threats that could erode this pillar
- Durability score (0-100) with justification
- Whether it HOLDS or is VULNERABLE to AI disruption

Pillars:
- Network Effects (does value increase with users?)
- Switching Costs (lock-in mechanisms, data portability issues)
- Brand/Trust (customer loyalty, reputation, relationships)
- Cost Advantages (economies of scale, proprietary processes, learning curves)
- Regulatory/IP Protection (patents, licenses, compliance barriers, certifications)

### 2. Five AI Disruption Vectors
For EACH vector, provide:
- Score (0-100) with detailed justification
- 2-3 paragraph analysis explaining the score
- 2-4 named threats (specific AI companies/products with funding data, founding year, key features)

Vectors:
1. **Process Automation** - Can AI automate core operations? Which specific processes?
2. **Knowledge Commoditization** - Can AI replicate institutional knowledge? What knowledge specifically?
3. **Decision Intelligence** - Can AI replace human judgment? In what decisions?
4. **Customer Disintermediation** - Can AI go direct to customer? How specifically?
5. **Cost Structure Disruption** - Can AI dramatically reduce cost base? By what percentage?

### 3. Cambridge Associates Risk Classification
Classify into archetypes with detailed justification:
- **CREATOR**: Building AI-native solutions
- **DISRUPTOR**: Using AI to disrupt existing markets
- **ENABLER**: Providing AI infrastructure/tools
- **ADAPTOR**: Successfully integrating AI into existing model
- **DISRUPTED**: Business model fundamentally threatened by AI

### 4. Three-Scenario Margin Model
For EACH scenario provide:
- Projected margin with specific percentage
- Timeline (e.g., "by Q4 2026", "within 18 months")
- Key assumptions (3-4 specific assumptions)
- Probability weighting

Scenarios:
- **Conservative**: Slow AI adoption, regulatory protection, incumbent advantages hold
- **Base Case**: Standard AI adoption curve, gradual margin pressure
- **Aggressive**: Rapid AI disruption, new entrants, price war dynamics

### 5. Expert Panel (DETAILED VERDICTS REQUIRED)
Each expert MUST provide:
- 5-8 paragraph verdict in their authentic voice and analytical framework
- Specific references to their published work, theories, or known positions
- A clear vote: INVESTABLE | MANAGEABLE | WATCH | MODERATE_RISK | HIGH_RISK | AVOID
- One penetrating key question they would ask management

Experts:
- **Aswath Damodaran** (NYU Stern) - DCF valuation, competitive moats, intrinsic value, narrative vs numbers
- **Bill Gurley** (Benchmark Capital) - Marketplace dynamics, winner-take-all, unit economics, TAM analysis
- **Peter Thiel** (Founders Fund) - Zero-to-one thinking, monopoly theory, contrarian view, definite optimism
- **Daniel Kahneman** (Princeton, Nobel laureate) - Behavioral biases, System 1/2, overconfidence, loss aversion
- **Rita McGrath** (Columbia) - Transient advantage, competitive life cycles, discovery-driven planning

AT LEAST ONE EXPERT MUST DISSENT from the majority view with substantive reasoning.

### 6. Torpedo Analysis (DETAILED PREMORTEM)
For EACH torpedo (3-5 total), provide:
- Evocative title (e.g., "The OpenAI Commoditization Wave")
- 3-4 paragraph narrative describing how this failure mode unfolds
- Specific trigger events and warning signs
- Probability rating: high (>40%) | medium (15-40%) | low (<15%)
- Severity rating: catastrophic (existential) | severe (major pivot required) | moderate (significant but manageable)
- Specific mitigant strategy (not generic advice)

Include a cascade warning explaining how torpedoes could compound.

## QUALITY RULES
1. NO ABSOLUTES - Use probabilistic language, ranges, confidence levels
2. BEAR = BULL - Equal analytical rigor on threats and opportunities
3. SPECIFIC EVIDENCE - Real company names, real funding data, real market statistics
4. EXPERT DISAGREEMENT - At least one expert must dissent with substantive reasoning
5. DEPTH OVER BREADTH - Better to go deep on key points than surface-level on many
6. ACTIONABLE INSIGHTS - Every section should inform an investment or strategic decision

## OUTPUT FORMAT
Return a single JSON object matching the DisruptionScanResult schema. Do not include any text outside the JSON.`;

const buildUserPrompt = (params: DisruptionScanParams): string => {
  return `Generate a comprehensive AI Disruption Risk Assessment for:

**Company/Idea**: ${params.companyName}
**Sector**: ${params.sector}
${params.description ? `**Description**: ${params.description}` : ''}
${params.market ? `**Market**: ${params.market}` : ''}
${params.type ? `**Type**: ${params.type}` : ''}
${params.targetAudience ? `**Target Audience**: ${params.targetAudience}` : ''}

IMPORTANT: Use web search to gather current intelligence on:
1. The company/concept and its current market position
2. AI competitors and well-funded AI startups in this space
3. Recent AI developments that could affect this sector
4. Industry margin data and trends

Then apply all six analytical frameworks to produce an institutional-grade assessment.

Return ONLY a valid JSON object matching this schema:

{
  "executiveSummary": {
    "overallScore": <0-100, where 0=highly vulnerable, 100=highly resilient>,
    "classification": "<HIGH_RISK|MODERATE|RESILIENT>",
    "executiveNarrative": "<2-3 paragraph summary of key findings>",
    "archetypeClassification": "<CREATOR|DISRUPTOR|ENABLER|ADAPTOR|DISRUPTED>"
  },
  "disruptionVectors": [
    {
      "id": "<process_automation|knowledge_commoditization|decision_intelligence|customer_disintermediation|cost_structure>",
      "name": "<vector name>",
      "score": <0-100>,
      "analysis": "<detailed analysis paragraph>",
      "namedThreats": [
        {
          "name": "<specific AI company/product>",
          "description": "<how it threatens>",
          "fundingData": "<funding/traction data>",
          "threatLevel": "<critical|high|medium|low>"
        }
      ]
    }
  ],
  "moatAssessment": {
    "overallMoatRating": "<strong|moderate|weak|eroding>",
    "holdingCount": <number of pillars holding>,
    "pillars": [
      {
        "name": "<pillar name>",
        "holds": <true|false>,
        "durabilityScore": <0-100>,
        "evidence": "<specific evidence>",
        "aiVulnerable": <true|false>
      }
    ]
  },
  "marginCompression": {
    "currentEstimatedMargin": "<current margin estimate with source>",
    "scenarios": {
      "conservative": { "margin": "<projected margin>", "timeline": "<timeframe>", "assumptions": "<key assumptions>" },
      "baseCase": { "margin": "<projected margin>", "timeline": "<timeframe>", "assumptions": "<key assumptions>" },
      "aggressive": { "margin": "<projected margin>", "timeline": "<timeframe>", "assumptions": "<key assumptions>" }
    }
  },
  "expertPanel": [
    {
      "name": "<expert name>",
      "title": "<title/affiliation>",
      "verdict": "<4-7 paragraph analysis in their voice and framework>",
      "vote": "<INVESTABLE|MANAGEABLE|WATCH|MODERATE_RISK|HIGH_RISK|AVOID>",
      "keyQuestion": "<the critical question they would ask>"
    }
  ],
  "torpedoAnalysis": {
    "torpedoes": [
      {
        "title": "<failure mode name>",
        "narrative": "<2-3 paragraph premortem narrative>",
        "probability": "<high|medium|low>",
        "severity": "<catastrophic|severe|moderate>",
        "mitigant": "<specific mitigation strategy>"
      }
    ],
    "cascadeWarning": "<warning about correlated risks>"
  },
  "strategicActions": [
    {
      "priority": <1-5>,
      "action": "<specific action>",
      "rationale": "<why this matters>",
      "impact": "<high|medium|low>",
      "timeline": "<recommended timeframe>"
    }
  ],
  "marketGapAnalysis": {
    "gaps": [
      {
        "id": "<gap_1>",
        "title": "<specific gap title>",
        "severity": <1-5>,
        "severityColor": "<green|yellow|orange|red|darkred>",
        "frequency": "<high|medium|low>",
        "impactedPersonas": ["<persona1>", "<persona2>"],
        "workflowTrigger": "<when does this gap hurt users>",
        "rootCause": "<why does this gap exist>",
        "quantifiedImpact": "<e.g., '$50K/year lost revenue'>",
        "quantifiedImpactSource": "<(Source: ...) or (Assumption: ...)>",
        "competitorCoverage": {
          "<competitor1>": "<full|partial|none>",
          "<competitor2>": "<full|partial|none>"
        },
        "correspondingUVP": {
          "title": "<UVP that addresses this gap>",
          "description": "<how it solves the gap>",
          "measureableOutcome": "<specific metric improvement>",
          "defensibility": "<high|medium|low>"
        }
      }
    ],
    "gapCount": <actual number of gaps found>,
    "severityDistribution": {
      "critical": <count of severity 5>,
      "high": <count of severity 4>,
      "medium": <count of severity 3>,
      "low": <count of severity 2>,
      "minimal": <count of severity 1>
    },
    "whiteSpaceOpportunities": ["<opportunity 1>", "<opportunity 2>"]
  },
  "uspCards": [
    {
      "id": "<usp_1>",
      "title": "<USP title>",
      "valueProposition": "<1-2 sentence value prop>",
      "measurableProofAngle": "<specific metric or outcome>",
      "competitiveDifferentiation": "<how this beats alternatives>",
      "aiDefensibility": "<high|medium|low>"
    }
  ],
  "researchVerification": [
    {
      "claim": "<claim needing verification>",
      "category": "<threat|margin|competitor|market>",
      "priority": "<high|medium|low>",
      "verificationMethod": "<how to verify>"
    }
  ],
  "oaFramework": {
    "version": "1.0",
    "sectionsIncluded": ["marketGapAnalysis", "uspCards", "researchVerification"],
    "dataFreshness": "<YYYY-MM-DD>"
  }
}`;
};

// Initialize Anthropic client
function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function generateDisruptionScan(params: DisruptionScanParams): Promise<DisruptionScanResult> {
  console.log(`[DisruptionScanner] Starting DEEP scan for: ${params.companyName} using Claude Opus`);

  const anthropic = getAnthropicClient();

  let fullText = '';
  try {
    // Use streaming with extended thinking for deep Opus analysis
    console.log('[DisruptionScanner] Starting streaming request with extended thinking...');
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 32000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000, // Allow Opus to think deeply before responding
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(params),
        },
      ],
    });

    // Track streaming progress
    let chunkCount = 0;
    stream.on('text', () => {
      chunkCount++;
      if (chunkCount % 100 === 0) {
        console.log(`[DisruptionScanner] Streaming progress: ${chunkCount} chunks...`);
      }
    });

    // Wait for the stream to complete
    const finalMessage = await stream.finalMessage();
    console.log(`[DisruptionScanner] Stream complete. ${chunkCount} total chunks, stop_reason: ${finalMessage.stop_reason}`);

    // Extract only text blocks (ignore thinking blocks)
    for (const block of finalMessage.content) {
      if (block.type === 'text') {
        fullText += block.text;
      } else if (block.type === 'thinking') {
        console.log(`[DisruptionScanner] Opus thinking used ${block.thinking.length} chars of reasoning`);
      }
    }
    console.log(`[DisruptionScanner] Extracted ${fullText.length} chars of response text`);
  } catch (apiError: any) {
    console.error('[DisruptionScanner] Anthropic API error:', apiError?.message || apiError);
    console.error('[DisruptionScanner] Error details:', JSON.stringify(apiError, null, 2));
    throw new Error(`Anthropic API error: ${apiError?.message || 'Unknown error'}`);
  }

  console.log(`[DisruptionScanner] Processing response...`);

  // Parse the JSON from the streamed response
  // Look for JSON in the text, handling potential markdown code blocks
  let jsonString = fullText.trim();

  // Remove markdown code block wrapper if present
  if (jsonString.startsWith('```json')) {
    jsonString = jsonString.slice(7);
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith('```')) {
    jsonString = jsonString.slice(0, -3);
  }
  jsonString = jsonString.trim();

  // Try to find JSON object in the text
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[DisruptionScanner] No JSON found in response:', fullText.substring(0, 500));
    throw new Error('Failed to parse disruption scan response: No JSON found');
  }

  try {
    const result = JSON.parse(jsonMatch[0]) as DisruptionScanResult;
    console.log(`[DisruptionScanner] Successfully parsed result, overall score: ${result.executiveSummary.overallScore}`);
    return result;
  } catch (parseError) {
    console.error('[DisruptionScanner] JSON parse error:', parseError);
    console.error('[DisruptionScanner] JSON text:', jsonMatch[0].substring(0, 500));
    throw new Error('Failed to parse disruption scan response: Invalid JSON');
  }
}
