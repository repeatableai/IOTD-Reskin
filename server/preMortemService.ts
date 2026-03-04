/**
 * Pre-Mortem Engine Service
 * AI-powered venture failure analysis using Claude Opus
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  PreMortemContext,
  PreMortemResult,
  PreMortemRequest,
  CompletenessResult,
  COMPLETENESS_WEIGHTS,
  OAFrameworkScores,
  OAPriorAnalyses,
} from '../shared/preMortemTypes';
import {
  selectPerspectives,
  mapMarketToCategory,
  type PerspectiveDefinition,
} from './preMortemPerspectives';

// System prompt for the pre-mortem analysis
const SYSTEM_PROMPT = `You are a brutal venture failure analyst. Your job is to write visceral, specific,
past-tense failure narratives from the perspective of investors who watched a venture
fail. You are NOT a cheerleader. You are NOT balanced. You find the exact specific way
THIS venture dies. Every failure narrative must reference actual numbers, named
competitors, specific decisions, and real market dynamics from the venture data provided.
Generic failure modes are unacceptable. Tone: direct, uncomfortable, past tense, first
person narrator who lived through the failure. No passive voice. No hedging.
Format your output as valid JSON only.

## CRITICAL RULES
1. Write in PAST TENSE as if the failure already happened
2. Reference 2+ specific data points from the venture in each narrative
3. Name actual competitors, market dynamics, and specific numbers
4. Mitigation actions must be DIRECT INSTRUCTIONS (not "consider doing X")
5. Root causes should be 1-2 sentences, specific and actionable
6. Each narrative should be 150-200 words, visceral and uncomfortable
7. Never use generic phrases like "the startup failed to adapt"
8. Always attribute failure to specific, avoidable decisions

## OA FRAMEWORK INTEGRATION
When OA Framework data is provided (scores, prior analyses):
- Use OA scores to calibrate severity: low feasibility/execution scores = higher failure likelihood
- Cross-reference prior analyses: Disruption Scanner threats, Bell-Mason gaps, IC Memo risks
- If prior analyses identified specific risks, ensure your failure narratives address them
- Use Bell-Mason gaps as amplifiers for execution-related failures
- Use Disruption Scanner threats as triggers for competitive/market failures
- Adjust confidence levels based on OA data completeness

## SEVERITY SCORING
- CRITICAL (75-100): Multiple existential threats, high probability of failure
- HIGH (50-74): Significant risks requiring immediate action
- MODERATE (25-49): Manageable risks with proper planning
- MANAGEABLE (0-24): Standard business challenges, low concern

Calibrate severity using OA scores when available:
- Overall OA score < 40 → bias toward CRITICAL/HIGH
- Overall OA score 40-60 → bias toward HIGH/MODERATE
- Overall OA score > 60 → start at MODERATE, escalate based on specific risks

## OUTPUT FORMAT
Return ONLY valid JSON matching the PreMortemResult schema. No markdown, no explanation.`;

/**
 * Build OA Framework context section for the prompt
 */
function buildOAFrameworkSection(
  scores?: OAFrameworkScores,
  priorAnalyses?: OAPriorAnalyses,
  oaCompletenessScore?: number
): string {
  const sections: string[] = [];

  // Add OA scores if available
  if (scores && Object.values(scores).some(v => v !== undefined)) {
    const scoreLines: string[] = [];
    // Calculate overall score from components
    const scoreValues = [scores.opportunity, scores.problem, scores.feasibility, scores.timing, scores.execution, scores.gtm].filter(v => v !== undefined) as number[];
    if (scoreValues.length > 0) {
      const overallScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
      scoreLines.push(`Overall OA Score: ${overallScore}/100`);
    }
    if (scores.opportunity !== undefined) scoreLines.push(`Opportunity: ${scores.opportunity}/100`);
    if (scores.problem !== undefined) scoreLines.push(`Problem-Solution Fit: ${scores.problem}/100`);
    if (scores.feasibility !== undefined) scoreLines.push(`Feasibility: ${scores.feasibility}/100`);
    if (scores.timing !== undefined) scoreLines.push(`Timing: ${scores.timing}/100`);
    if (scores.execution !== undefined) scoreLines.push(`Execution Readiness: ${scores.execution}/100`);
    if (scores.gtm !== undefined) scoreLines.push(`Go-to-Market: ${scores.gtm}/100`);

    if (scoreLines.length > 0) {
      sections.push(`## OA FRAMEWORK SCORES (Use these to calibrate severity)
${scoreLines.join('\n')}`);
    }
  }

  // Add prior analysis insights
  if (priorAnalyses) {
    const analysisInsights: string[] = [];

    // Disruption Scanner insights
    if (priorAnalyses.disruptionScore !== undefined || priorAnalyses.disruptionClassification) {
      analysisInsights.push(`### Disruption Scanner
- Disruption Risk Score: ${priorAnalyses.disruptionScore ?? 'N/A'}/100
- Classification: ${priorAnalyses.disruptionClassification || 'Not specified'}
- Archetype: ${priorAnalyses.disruptionArchetype || 'Not specified'}`);
    }

    // Bell-Mason insights
    if (priorAnalyses.bellMasonOverallScore !== undefined || priorAnalyses.bellMasonStage) {
      analysisInsights.push(`### Bell-Mason Diagnostic
- Overall Score: ${priorAnalyses.bellMasonOverallScore ?? 'N/A'}/100
- Stage: ${priorAnalyses.bellMasonStage || 'Not specified'}
- Readiness for Next Stage: ${priorAnalyses.bellMasonReadinessForNext ?? 'N/A'}%`);
    }

    // FutureCast insights
    if (priorAnalyses.futureCastOutlook || priorAnalyses.futureCastConfidence !== undefined) {
      analysisInsights.push(`### FutureCast Analysis
- Outlook: ${priorAnalyses.futureCastOutlook || 'Not specified'}
- Confidence: ${priorAnalyses.futureCastConfidence ?? 'N/A'}%
- Time Horizon: ${priorAnalyses.futureCastTimeHorizon || 'Not specified'}`);
    }

    // IC Memo insights
    if (priorAnalyses.icMemoVerdict || priorAnalyses.icMemoTier !== undefined) {
      analysisInsights.push(`### IC Memo
- Verdict: ${priorAnalyses.icMemoVerdict || 'Not specified'}
- Tier: ${priorAnalyses.icMemoTier ?? 'N/A'}
- Confidence Score: ${priorAnalyses.icMemoConfidenceScore ?? 'N/A'}/100`);
    }

    // Market Sizing insights
    if (priorAnalyses.marketSizingTAM || priorAnalyses.marketSizingSAM) {
      analysisInsights.push(`### Market Sizing
- TAM: ${priorAnalyses.marketSizingTAM || 'N/A'}
- SAM: ${priorAnalyses.marketSizingSAM || 'N/A'}
- SOM: ${priorAnalyses.marketSizingSOM || 'N/A'}
- Growth Rate: ${priorAnalyses.marketSizingGrowthRate || 'Not specified'}`);
    }

    if (analysisInsights.length > 0) {
      sections.push(`## PRIOR ANALYSES (Cross-reference these findings - they provide validated risk signals)
${analysisInsights.join('\n\n')}`);
    }
  }

  // Add completeness context
  if (oaCompletenessScore !== undefined) {
    sections.push(`## DATA COMPLETENESS
OA Framework Completeness: ${oaCompletenessScore}% - ${
      oaCompletenessScore >= 80 ? 'High confidence in data quality' :
      oaCompletenessScore >= 50 ? 'Moderate data coverage - some assumptions may be needed' :
      'Limited data - increase scrutiny on risk assessments'
    }`);
  }

  return sections.join('\n\n');
}

/**
 * Build user prompt with venture context and perspective instructions
 */
function buildUserPrompt(
  context: PreMortemContext,
  perspectives: PerspectiveDefinition[],
  scores?: OAFrameworkScores,
  priorAnalyses?: OAPriorAnalyses,
  oaCompletenessScore?: number
): string {
  const perspectivesList = perspectives
    .map((p, i) => `${i + 1}. ${p.name} (${p.criticLens}) - ${p.riskDomain} domain`)
    .join('\n');

  // Build OA framework context section
  const oaFrameworkSection = buildOAFrameworkSection(scores, priorAnalyses, oaCompletenessScore);

  return `Generate a deep pre-mortem failure analysis for this venture:

**Venture Name**: ${context.ventureName}
**Category**: ${context.ventureCategory}
**Industry Tags**: ${context.industryTags.join(', ') || 'Not specified'}
**Revenue Model**: ${context.revenueModel || 'Not specified'}
**Execution Complexity**: ${context.executionComplexity || 'Not specified'}
**Competitors**: ${context.competitors.join(', ') || 'None identified'}
${context.tamSamSom ? `**TAM/SAM/SOM**: TAM: ${context.tamSamSom.tam || 'N/A'}, SAM: ${context.tamSamSom.sam || 'N/A'}, SOM: ${context.tamSamSom.som || 'N/A'}` : ''}
**Risk Factors**: ${context.riskFactors.join(', ') || 'None identified'}
${context.financialProjections ? `**Financial Projections**: ${context.financialProjections}` : ''}
${context.regulatoryMentions?.length ? `**Regulatory Mentions**: ${context.regulatoryMentions.join(', ')}` : ''}
${context.description ? `**Description**: ${context.description}` : ''}
${context.targetAudience ? `**Target Audience**: ${context.targetAudience}` : ''}
${context.marketGap ? `**Market Gap**: ${context.marketGap}` : ''}
${context.whyNowAnalysis ? `**Why Now Analysis**: ${context.whyNowAnalysis}` : ''}

${oaFrameworkSection}

## ASSIGNED FAILURE PERSPECTIVES
You MUST analyze the following ${perspectives.length} failure perspectives:

${perspectivesList}

## REQUIRED OUTPUT STRUCTURE
Return a JSON object with this exact structure:

{
  "perspectives": [
    {
      "perspectiveId": "<id from list above>",
      "perspectiveName": "<name from list above>",
      "criticLens": "<critic lens from list above>",
      "riskDomain": "<market|execution|financial|regulatory|competitive|team>",
      "failureNarrative": "<150-200 word past-tense narrative of how this specific venture failed from this perspective, referencing specific data points>",
      "rootCause": "<1-2 sentence specific root cause>",
      "mitigationActions": ["<direct action 1>", "<direct action 2>", "<direct action 3>"],
      "failurePointRemoval": {
        "currentRiskLevel": "<HIGH|MEDIUM|LOW>",
        "mitigatedRiskLevel": "<HIGH|MEDIUM|LOW>",
        "estimatedRiskReduction": <0-100>,
        "confidenceLevel": "<HIGH|MEDIUM|LOW>"
      }
    }
  ],
  "compositeSeverityScore": <0-100>,
  "severityTier": "<CRITICAL|HIGH|MODERATE|MANAGEABLE>",
  "executiveSummary": "<3 sentences summarizing the most critical failure risks>",
  "perspectivesConfidenceRating": "<HIGH|MEDIUM|LOW>",
  "metadata": {
    "generatedAt": "<ISO timestamp>",
    "ventureSlug": "${context.ventureSlug}",
    "completenessScore": <score of input data completeness>
  }
}

CRITICAL: Your narratives MUST reference specific details from this venture. Generic failure analysis is unacceptable.`;
}

/**
 * Calculate data completeness score
 */
export function calculateCompleteness(context: PreMortemContext): CompletenessResult {
  let score = 0;
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Revenue model: 10 points (required)
  if (context.revenueModel && context.revenueModel.trim() !== '') {
    score += 10;
  } else {
    missingFields.push('Revenue model');
  }

  // Competitive landscape: 20 points (2+ named)
  if (context.competitors && context.competitors.length >= 2) {
    score += 20;
  } else if (context.competitors && context.competitors.length === 1) {
    score += 10;
    warnings.push('Only 1 competitor identified - analysis may be limited');
  } else {
    missingFields.push('Competitive landscape (need 2+ competitors)');
  }

  // Execution timeline/complexity: 15 points
  if (context.executionComplexity) {
    score += 15;
  } else {
    missingFields.push('Execution complexity');
  }

  // Market size/TAM: 20 points
  if (context.tamSamSom?.tam || context.tamSamSom?.sam) {
    score += 20;
  } else {
    missingFields.push('Market size (TAM/SAM)');
  }

  // Industry/category: 15 points
  if (context.ventureCategory && context.ventureCategory !== 'Other') {
    score += 15;
  } else if (context.industryTags && context.industryTags.length > 0) {
    score += 10;
    warnings.push('Industry category could not be determined - using tags');
  } else {
    missingFields.push('Industry category');
  }

  // Risk factors: 20 points (optional but valuable)
  if (context.riskFactors && context.riskFactors.length > 0) {
    score += 20;
  } else {
    warnings.push('No risk factors provided - analysis will infer risks');
  }

  // Determine level
  let level: 'blocked' | 'partial' | 'none';
  if (score < 50) {
    level = 'blocked';
  } else if (score < 80) {
    level = 'partial';
  } else {
    level = 'none';
  }

  return { score, level, missingFields, warnings };
}

/**
 * Build PreMortemContext from request data
 * Pulls from multiple sources: direct request, frameworkData, and OA prior analyses
 */
export function buildContextFromRequest(request: PreMortemRequest): PreMortemContext {
  const category = mapMarketToCategory(request.market);

  // Extract competitors
  let competitors: string[] = [];
  if (request.competitors && request.competitors.length > 0) {
    competitors = request.competitors;
  } else if (request.mainCompetitor) {
    competitors = [request.mainCompetitor];
  }

  // Extract industry tags
  const industryTags: string[] = [];
  if (request.market) industryTags.push(request.market);
  if (request.type) industryTags.push(request.type);

  // Extract risk factors - combine from multiple sources
  let riskFactors: string[] = request.riskFactors || [];
  if (request.frameworkData?.risks) {
    riskFactors = [...riskFactors, ...request.frameworkData.risks];
  }
  // Add risk signals from prior analyses
  if (request.priorAnalyses?.disruptionClassification === 'HIGH_RISK') {
    riskFactors.push('High disruption risk identified by Disruption Scanner');
  }
  if (request.priorAnalyses?.icMemoVerdict === 'WEAK') {
    riskFactors.push('Weak IC Memo verdict');
  }

  // Determine execution complexity - use OA scores if available
  let executionComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';
  if (request.executionComplexity) {
    executionComplexity = request.executionComplexity;
  } else if (request.scores?.execution !== undefined) {
    // Use OA execution score to infer complexity
    if (request.scores.execution >= 70) executionComplexity = 'simple';
    else if (request.scores.execution <= 40) executionComplexity = 'complex';
  } else if (request.frameworkData?.executionDifficulty) {
    const difficulty = request.frameworkData.executionDifficulty;
    if (difficulty <= 3) executionComplexity = 'simple';
    else if (difficulty >= 7) executionComplexity = 'complex';
  }

  // Build TAM/SAM/SOM - pull from prior analyses if not directly available
  let tamSamSom = request.tamSamSom || request.frameworkData?.tamSamSom;
  if (!tamSamSom && request.priorAnalyses) {
    const pa = request.priorAnalyses;
    if (pa.marketSizingTAM || pa.marketSizingSAM || pa.marketSizingSOM) {
      tamSamSom = {
        tam: pa.marketSizingTAM,
        sam: pa.marketSizingSAM,
        som: pa.marketSizingSOM,
      };
    }
  }

  // Infer revenue model from type/market if not specified
  let revenueModel = request.revenueModel || request.frameworkData?.revenueModel || '';
  if (!revenueModel) {
    // Try to infer from market/type
    const marketLower = (request.market || '').toLowerCase();
    const typeLower = (request.type || '').toLowerCase();
    if (marketLower.includes('saas') || typeLower.includes('saas') || typeLower.includes('software')) {
      revenueModel = 'SaaS subscription (inferred)';
    } else if (marketLower.includes('marketplace') || typeLower.includes('marketplace')) {
      revenueModel = 'Marketplace transaction fees (inferred)';
    } else if (marketLower.includes('consumer') || typeLower.includes('consumer')) {
      revenueModel = 'Consumer monetization (inferred)';
    } else if (marketLower.includes('enterprise') || typeLower.includes('b2b')) {
      revenueModel = 'Enterprise licensing (inferred)';
    }
  }

  return {
    ventureName: request.ventureName,
    ventureCategory: category,
    industryTags,
    revenueModel,
    executionComplexity,
    competitors,
    tamSamSom,
    riskFactors,
    financialProjections: request.financialProjections || request.frameworkData?.financialProjections,
    regulatoryMentions: request.regulatoryMentions || [],
    ventureSlug: request.ventureSlug,
    description: request.description,
    targetAudience: request.targetAudience,
    marketGap: request.marketGap,
    whyNowAnalysis: request.whyNowAnalysis,
  };
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Parse JSON from response with multiple fallback strategies
 */
function parseResponseJSON(text: string): PreMortemResult {
  let jsonString = text.trim();

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
    throw new Error('No JSON object found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]) as PreMortemResult;
  } catch (parseError) {
    // Try fixing common JSON issues
    let fixedJson = jsonMatch[0];

    // Fix trailing commas
    fixedJson = fixedJson.replace(/,\s*([\]}])/g, '$1');

    // Fix unescaped newlines in strings
    fixedJson = fixedJson.replace(/(?<!\\)\n/g, '\\n');

    try {
      return JSON.parse(fixedJson) as PreMortemResult;
    } catch (retryError) {
      throw new Error(`Failed to parse JSON: ${parseError}`);
    }
  }
}

/**
 * Validate pre-mortem result quality
 */
function validateResult(result: PreMortemResult): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check perspectives count
  if (!result.perspectives || result.perspectives.length < 5) {
    issues.push(`Expected 5-7 perspectives, got ${result.perspectives?.length || 0}`);
  }

  // Check each perspective
  result.perspectives?.forEach((p, i) => {
    // Check narrative length
    const wordCount = p.failureNarrative?.split(/\s+/).length || 0;
    if (wordCount < 100) {
      issues.push(`Perspective ${i + 1} narrative too short (${wordCount} words)`);
    }

    // Check mitigation actions
    if (!p.mitigationActions || p.mitigationActions.length < 2) {
      issues.push(`Perspective ${i + 1} needs at least 2 mitigation actions`);
    }

    // Check root cause
    if (!p.rootCause || p.rootCause.length < 20) {
      issues.push(`Perspective ${i + 1} needs a more detailed root cause`);
    }
  });

  // Check composite score
  if (typeof result.compositeSeverityScore !== 'number' ||
      result.compositeSeverityScore < 0 ||
      result.compositeSeverityScore > 100) {
    issues.push('Invalid composite severity score');
  }

  // Check executive summary
  if (!result.executiveSummary || result.executiveSummary.length < 50) {
    issues.push('Executive summary too short');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Generate pre-mortem analysis for a venture
 */
export async function generatePreMortem(request: PreMortemRequest): Promise<PreMortemResult> {
  console.log(`[PreMortem] Starting analysis for: ${request.ventureName}`);

  // Build context from request
  const context = buildContextFromRequest(request);

  // Check data completeness
  const completeness = calculateCompleteness(context);
  console.log(`[PreMortem] Data completeness: ${completeness.score}% (${completeness.level})`);

  // Note: We no longer block generation - proceed with available data
  // The AI will work with whatever context is available
  if (completeness.level === 'blocked') {
    console.log(`[PreMortem] Low data completeness (${completeness.score}/100) but proceeding with available data`);
  }

  // Select perspectives based on category
  const perspectives = selectPerspectives(context.ventureCategory);
  console.log(`[PreMortem] Selected ${perspectives.length} perspectives for ${context.ventureCategory}`);

  // Log OA framework enrichment
  if (request.scores || request.priorAnalyses) {
    console.log(`[PreMortem] OA Framework enrichment: scores=${!!request.scores}, priorAnalyses=${!!request.priorAnalyses}`);
    if (request.priorAnalyses) {
      const availableAnalyses = Object.entries(request.priorAnalyses)
        .filter(([_, v]) => v !== undefined)
        .map(([k]) => k);
      console.log(`[PreMortem] Available prior analyses: ${availableAnalyses.join(', ') || 'none'}`);
    }
  }

  // Build prompt with OA framework context
  const userPrompt = buildUserPrompt(
    context,
    perspectives,
    request.scores,
    request.priorAnalyses,
    request.oaCompletenessScore
  );

  // Initialize client and make request
  const anthropic = getAnthropicClient();
  let fullText = '';

  try {
    console.log('[PreMortem] Starting streaming request with extended thinking...');
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 24000,
      thinking: {
        type: 'enabled',
        budget_tokens: 8000,
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Track streaming progress
    let chunkCount = 0;
    stream.on('text', () => {
      chunkCount++;
      if (chunkCount % 50 === 0) {
        console.log(`[PreMortem] Streaming progress: ${chunkCount} chunks...`);
      }
    });

    // Wait for stream to complete
    const finalMessage = await stream.finalMessage();
    console.log(`[PreMortem] Stream complete. ${chunkCount} chunks, stop_reason: ${finalMessage.stop_reason}`);

    // Extract text blocks (ignore thinking blocks)
    for (const block of finalMessage.content) {
      if (block.type === 'text') {
        fullText += block.text;
      } else if (block.type === 'thinking') {
        console.log(`[PreMortem] Opus thinking used ${block.thinking.length} chars of reasoning`);
      }
    }
    console.log(`[PreMortem] Extracted ${fullText.length} chars of response text`);
  } catch (apiError: any) {
    console.error('[PreMortem] Anthropic API error:', apiError?.message || apiError);
    throw new Error(`Anthropic API error: ${apiError?.message || 'Unknown error'}`);
  }

  // Parse response
  console.log('[PreMortem] Parsing response...');
  const result = parseResponseJSON(fullText);

  // Validate result quality
  const validation = validateResult(result);
  if (!validation.valid) {
    console.warn('[PreMortem] Quality issues:', validation.issues);
    // Don't throw, but log the issues
  }

  // Ensure metadata is complete
  result.metadata = {
    generatedAt: new Date().toISOString(),
    ventureSlug: context.ventureSlug,
    completenessScore: completeness.score,
  };

  console.log(`[PreMortem] Analysis complete. Severity: ${result.severityTier} (${result.compositeSeverityScore}/100)`);

  return result;
}

/**
 * Check if pre-mortem can be generated for given venture data
 */
export function canGeneratePreMortem(request: PreMortemRequest): CompletenessResult {
  const context = buildContextFromRequest(request);
  return calculateCompleteness(context);
}
