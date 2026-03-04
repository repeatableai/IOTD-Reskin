/**
 * Venture Context Service
 *
 * Assembles comprehensive venture context from idea data and prior analyses
 * for cross-tool enrichment in the Opportunity Analysis framework.
 */

import { Idea } from "../shared/schema";
import { storage } from "./storage";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface VentureScores {
  opportunity?: number;
  problem?: number;
  feasibility?: number;
  timing?: number;
  execution?: number;
  gtm?: number;
}

export interface PriorAnalyses {
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

export interface VentureContext {
  // Core identity
  name: string;
  sector: string;
  stage: string;
  description: string;

  // ICP & Market
  targetAudience: string;
  marketType: string;
  marketGap: string;
  mainCompetitor: string;

  // Existing scores (from idea)
  scores: VentureScores;

  // Prior analysis results (cross-tool enrichment)
  priorAnalyses: PriorAnalyses;

  // Data completeness (0-100)
  completenessScore: number;

  // Metadata
  ideaId: string;
  assembledAt: string;
}

// ─── Field Weights for Completeness ──────────────────────────────────────────

const COMPLETENESS_WEIGHTS: Record<string, number> = {
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

const MAX_COMPLETENESS_SCORE = Object.values(COMPLETENESS_WEIGHTS).reduce((sum, w) => sum + w, 0);

// ─── Helper Functions ────────────────────────────────────────────────────────

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
    const obj = value as Record<string, unknown>;
    return Object.keys(obj).length > 0 && Object.values(obj).some(v => isFieldPopulated(v));
  }
  return false;
}

/**
 * Calculate weighted data completeness score (0-100)
 */
export function calculateCompletenessScore(idea: Partial<Idea>): number {
  let rawScore = 0;

  for (const [field, weight] of Object.entries(COMPLETENESS_WEIGHTS)) {
    const value = idea[field as keyof Idea];
    if (isFieldPopulated(value)) {
      rawScore += weight;
    }
  }

  return Math.round((rawScore / MAX_COMPLETENESS_SCORE) * 100);
}

/**
 * Determine venture stage based on available data
 */
function inferVentureStage(idea: Partial<Idea>, completenessScore: number): string {
  // If explicitly set, use it
  // Otherwise infer from data completeness and signals

  if (completenessScore < 20) {
    return 'Concept';
  } else if (completenessScore < 40) {
    return 'Pre-Seed';
  } else if (completenessScore < 60) {
    return 'Seed';
  } else if (completenessScore < 80) {
    return 'Product Development';
  } else {
    return 'Market Development';
  }
}

/**
 * Fetch prior analyses from storage for cross-tool enrichment
 */
export async function fetchPriorAnalyses(ideaId: string): Promise<PriorAnalyses> {
  const priorAnalyses: PriorAnalyses = {};

  try {
    // Try to fetch stored analysis results
    // Note: This depends on how analyses are stored - adjust based on actual storage structure
    const idea = await storage.getIdeaById(ideaId);

    if (idea) {
      // Extract any stored framework data that contains prior analysis results
      const frameworkData = idea.frameworkData as Record<string, unknown> | null;

      if (frameworkData) {
        // Extract disruption scanner results if present
        if (frameworkData.disruptionScan) {
          const disruption = frameworkData.disruptionScan as Record<string, unknown>;
          priorAnalyses.disruptionScore = disruption.overallScore as number | undefined;
          priorAnalyses.disruptionClassification = disruption.classification as PriorAnalyses['disruptionClassification'];
          priorAnalyses.disruptionArchetype = disruption.archetypeClassification as PriorAnalyses['disruptionArchetype'];
        }

        // Extract market sizing results if present
        if (frameworkData.marketSizing) {
          const market = frameworkData.marketSizing as Record<string, unknown>;
          priorAnalyses.marketSizingTAM = market.tam as string | undefined;
          priorAnalyses.marketSizingSAM = market.sam as string | undefined;
          priorAnalyses.marketSizingSOM = market.som as string | undefined;
          priorAnalyses.marketSizingGrowthRate = market.growthRate as string | undefined;
        }

        // Extract Bell-Mason results if present
        if (frameworkData.bellMason) {
          const bellMason = frameworkData.bellMason as Record<string, unknown>;
          priorAnalyses.bellMasonStage = bellMason.currentStage as string | undefined;
          priorAnalyses.bellMasonOverallScore = bellMason.overallScore as number | undefined;
          priorAnalyses.bellMasonReadinessForNext = bellMason.readinessForNext as number | undefined;
        }

        // Extract IC Memo results if present
        if (frameworkData.icMemo) {
          const icMemo = frameworkData.icMemo as Record<string, unknown>;
          priorAnalyses.icMemoTier = icMemo.tier as 1 | 2 | 3 | undefined;
          priorAnalyses.icMemoVerdict = icMemo.verdict as PriorAnalyses['icMemoVerdict'];
          priorAnalyses.icMemoConfidenceScore = icMemo.confidenceScore as number | undefined;
        }

        // Extract Future Cast results if present
        if (frameworkData.futureCast) {
          const futureCast = frameworkData.futureCast as Record<string, unknown>;
          priorAnalyses.futureCastOutlook = futureCast.ventureOutlook as PriorAnalyses['futureCastOutlook'];
          priorAnalyses.futureCastConfidence = futureCast.confidenceLevel as number | undefined;
          priorAnalyses.futureCastTimeHorizon = futureCast.timeHorizon as string | undefined;
        }
      }
    }
  } catch (error) {
    console.warn(`[VentureContext] Could not fetch prior analyses for idea ${ideaId}:`, error);
    // Return empty object - cross-tool enrichment is optional
  }

  return priorAnalyses;
}

/**
 * Assemble comprehensive venture context for analysis tools
 */
export async function assembleVentureContext(ideaId: string): Promise<VentureContext> {
  const idea = await storage.getIdeaById(ideaId);

  if (!idea) {
    throw new Error(`Idea not found: ${ideaId}`);
  }

  const completenessScore = calculateCompletenessScore(idea);
  const priorAnalyses = await fetchPriorAnalyses(ideaId);

  const context: VentureContext = {
    // Core identity
    name: idea.title,
    sector: idea.type || 'technology',
    stage: inferVentureStage(idea, completenessScore),
    description: idea.description,

    // ICP & Market
    targetAudience: idea.targetAudience || '',
    marketType: idea.market || 'B2C',
    marketGap: idea.marketGap || '',
    mainCompetitor: idea.mainCompetitor || '',

    // Existing scores
    scores: {
      opportunity: idea.opportunityScore,
      problem: idea.problemScore,
      feasibility: idea.feasibilityScore,
      timing: idea.timingScore,
      execution: idea.executionScore,
      gtm: idea.gtmScore,
    },

    // Prior analyses
    priorAnalyses,

    // Data completeness
    completenessScore,

    // Metadata
    ideaId,
    assembledAt: new Date().toISOString(),
  };

  return context;
}

/**
 * Build a prompt-ready context string for injection into AI prompts
 */
export function buildContextPromptBlock(context: VentureContext): string {
  const sections: string[] = [
    '## VENTURE CONTEXT',
    `**Name:** ${context.name}`,
    `**Sector:** ${context.sector}`,
    `**Stage:** ${context.stage}`,
    `**Description:** ${context.description}`,
    '',
    '### Market Position',
    `**Market Type:** ${context.marketType}`,
    `**Target Audience:** ${context.targetAudience || 'Not specified'}`,
    `**Market Gap:** ${context.marketGap || 'Not specified'}`,
    `**Main Competitor:** ${context.mainCompetitor || 'Not specified'}`,
    '',
    '### Current Scores',
  ];

  const scoreLabels: Record<keyof VentureScores, string> = {
    opportunity: 'Opportunity',
    problem: 'Problem',
    feasibility: 'Feasibility',
    timing: 'Timing',
    execution: 'Execution',
    gtm: 'GTM',
  };

  for (const [key, label] of Object.entries(scoreLabels)) {
    const score = context.scores[key as keyof VentureScores];
    if (score !== undefined) {
      sections.push(`- ${label}: ${score}/100`);
    }
  }

  sections.push('');
  sections.push(`**Data Completeness:** ${context.completenessScore}%`);

  // Add prior analyses if available
  const { priorAnalyses } = context;
  const hasPriorAnalyses = Object.values(priorAnalyses).some(v => v !== undefined);

  if (hasPriorAnalyses) {
    sections.push('');
    sections.push('### Prior Analyses (Cross-Tool Context)');

    if (priorAnalyses.disruptionScore !== undefined) {
      sections.push(`**Disruption Scanner:** Score ${priorAnalyses.disruptionScore}/100 - ${priorAnalyses.disruptionClassification || 'Unknown'} (${priorAnalyses.disruptionArchetype || 'Unknown'})`);
    }

    if (priorAnalyses.marketSizingTAM) {
      sections.push(`**Market Sizing:** TAM ${priorAnalyses.marketSizingTAM}, SAM ${priorAnalyses.marketSizingSAM || 'N/A'}, Growth ${priorAnalyses.marketSizingGrowthRate || 'N/A'}`);
    }

    if (priorAnalyses.bellMasonOverallScore !== undefined) {
      sections.push(`**Bell-Mason:** Stage ${priorAnalyses.bellMasonStage || 'Unknown'}, Score ${priorAnalyses.bellMasonOverallScore}/100, Next Stage Readiness ${priorAnalyses.bellMasonReadinessForNext || 0}%`);
    }

    if (priorAnalyses.icMemoTier) {
      sections.push(`**IC Memo:** Tier ${priorAnalyses.icMemoTier} - ${priorAnalyses.icMemoVerdict || 'Unknown'} (Confidence: ${priorAnalyses.icMemoConfidenceScore || 0}%)`);
    }

    if (priorAnalyses.futureCastOutlook) {
      sections.push(`**Future Cast:** ${priorAnalyses.futureCastOutlook.replace(/_/g, ' ')} outlook, ${priorAnalyses.futureCastConfidence || 0}% confidence, ${priorAnalyses.futureCastTimeHorizon || 'N/A'} horizon`);
    }
  }

  return sections.join('\n');
}

/**
 * Get summary of what prior analyses are available for a venture
 */
export function getPriorAnalysesSummary(priorAnalyses: PriorAnalyses): {
  available: string[];
  missing: string[];
} {
  const allTools = ['Disruption Scanner', 'Market Sizing', 'Bell-Mason', 'IC Memo', 'Future Cast'];
  const available: string[] = [];
  const missing: string[] = [];

  if (priorAnalyses.disruptionScore !== undefined) {
    available.push('Disruption Scanner');
  } else {
    missing.push('Disruption Scanner');
  }

  if (priorAnalyses.marketSizingTAM) {
    available.push('Market Sizing');
  } else {
    missing.push('Market Sizing');
  }

  if (priorAnalyses.bellMasonOverallScore !== undefined) {
    available.push('Bell-Mason');
  } else {
    missing.push('Bell-Mason');
  }

  if (priorAnalyses.icMemoTier) {
    available.push('IC Memo');
  } else {
    missing.push('IC Memo');
  }

  if (priorAnalyses.futureCastOutlook) {
    available.push('Future Cast');
  } else {
    missing.push('Future Cast');
  }

  return { available, missing };
}
