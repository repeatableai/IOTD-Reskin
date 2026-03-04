/**
 * Damodaran-Inspired AI Valuation Framework
 *
 * This framework adapts Aswath Damodaran's valuation principles to assess
 * the impact of AI adoption on company valuations. It provides methods for
 * calculating base valuations and AI-specific adjustments.
 *
 * Citation: Adapted from Damodaran, A. "Valuation in the Age of AI" (2025)
 */

export type Scenario = 'conservative' | 'base' | 'aggressive';
export type AdoptionStatus = 'none' | 'early' | 'partial' | 'advanced' | 'native';
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type FundingStage = 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth' | 'public';

export interface MoatFactors {
  proprietaryData: boolean;
  networkEffects: boolean;
  regulatoryAdvantage: boolean;
  brandLoyalty: boolean;
  switchingCosts: boolean;
}

export interface RevaluationInputs {
  companyName: string;
  industry: string;
  fundingStage: FundingStage;
  currentValuation: number;
  annualRevenue: number;
  ebitdaMargin: number;
  revenueMultiple: number;
  headcount: number;
  adoptionStatus: AdoptionStatus;
  competitorThreatLevel: ThreatLevel;
  moats: MoatFactors;
}

export interface ScenarioResults {
  aiAdoptedValuation: number;
  aiAdoptedChange: number;
  competitorFirstValuation: number;
  competitorFirstChange: number;
}

export interface RevaluationResults {
  currentValuation: number;
  conservative: ScenarioResults;
  base: ScenarioResults;
  aggressive: ScenarioResults;
  aiAdoptionScore: number;
  scoreBreakdown: ScoreBreakdown;
  marginProjections: MarginProjections;
}

export interface ScoreBreakdown {
  overall: number;
  components: {
    currentDeployment: { score: number; max: number; label: string };
    dataReadiness: { score: number; max: number; label: string };
    teamCapability: { score: number; max: number; label: string };
    competitivePosition: { score: number; max: number; label: string };
    executionRisk: { score: number; max: number; label: string };
  };
}

export interface MarginDataPoint {
  month: number;
  margin: number;
}

export interface MarginProjections {
  currentPath: MarginDataPoint[];
  aiAdopted: MarginDataPoint[];
  competitorFirst: MarginDataPoint[];
}

// Scenario multipliers for adjustments
const SCENARIO_MULTIPLIERS: Record<Scenario, { upside: number; downside: number }> = {
  conservative: { upside: 0.7, downside: 1.3 },
  base: { upside: 1.0, downside: 1.0 },
  aggressive: { upside: 1.4, downside: 0.7 },
};

// AI adoption adjustment factors by status
const ADOPTION_ADJUSTMENTS: Record<AdoptionStatus, { base: number; ceiling: number }> = {
  none: { base: 0.0, ceiling: 0.15 },
  early: { base: 0.15, ceiling: 0.35 },
  partial: { base: 0.25, ceiling: 0.50 },
  advanced: { base: 0.40, ceiling: 0.70 },
  native: { base: 0.55, ceiling: 0.90 },
};

// Competitive threat haircuts by threat level
const THREAT_HAIRCUTS: Record<ThreatLevel, { base: number; ceiling: number }> = {
  low: { base: 0.05, ceiling: 0.15 },
  medium: { base: 0.15, ceiling: 0.25 },
  high: { base: 0.25, ceiling: 0.40 },
  critical: { base: 0.40, ceiling: 0.60 },
};

// Moat durability weights
const MOAT_WEIGHTS = {
  proprietaryData: 0.25,
  networkEffects: 0.20,
  regulatoryAdvantage: 0.15,
  brandLoyalty: 0.20,
  switchingCosts: 0.20,
};

/**
 * Calculate base valuation from revenue and multiple
 */
export function calculateBaseValuation(revenue: number, revenueMultiple: number): number {
  return revenue * revenueMultiple;
}

/**
 * Calculate AI adoption adjustment factor based on current status and scenario
 */
export function calculateAIAdoptionAdjustment(
  adoptionStatus: AdoptionStatus,
  scenario: Scenario
): number {
  const adjustment = ADOPTION_ADJUSTMENTS[adoptionStatus];
  const multiplier = SCENARIO_MULTIPLIERS[scenario];

  // Interpolate between base and ceiling based on scenario
  const baseAdjustment = adjustment.base;
  const range = adjustment.ceiling - adjustment.base;

  if (scenario === 'conservative') {
    return baseAdjustment + range * 0.3;
  } else if (scenario === 'aggressive') {
    return baseAdjustment + range * 0.9;
  }
  return baseAdjustment + range * 0.6; // base scenario
}

/**
 * Calculate competitive threat haircut based on threat level and scenario
 */
export function calculateCompetitiveThreatHaircut(
  threatLevel: ThreatLevel,
  scenario: Scenario
): number {
  const haircut = THREAT_HAIRCUTS[threatLevel];
  const multiplier = SCENARIO_MULTIPLIERS[scenario];

  // Apply scenario multiplier to haircut
  const baseHaircut = haircut.base;
  const range = haircut.ceiling - haircut.base;

  if (scenario === 'conservative') {
    return baseHaircut + range * 0.7; // More pessimistic
  } else if (scenario === 'aggressive') {
    return baseHaircut + range * 0.3; // More optimistic
  }
  return baseHaircut + range * 0.5; // base scenario
}

/**
 * Calculate moat durability factor (0.5 to 1.0)
 * Higher moat score = better protection of AI-driven gains
 */
export function calculateMoatDurabilityFactor(moats: MoatFactors): number {
  let score = 0;

  if (moats.proprietaryData) score += MOAT_WEIGHTS.proprietaryData;
  if (moats.networkEffects) score += MOAT_WEIGHTS.networkEffects;
  if (moats.regulatoryAdvantage) score += MOAT_WEIGHTS.regulatoryAdvantage;
  if (moats.brandLoyalty) score += MOAT_WEIGHTS.brandLoyalty;
  if (moats.switchingCosts) score += MOAT_WEIGHTS.switchingCosts;

  // Scale to 0.5 - 1.0 range (minimum 0.5 moat factor)
  return 0.5 + score * 0.5;
}

/**
 * Calculate margin trajectory over time
 */
export function calculateMarginTrajectory(
  currentMargin: number,
  adoptionStatus: AdoptionStatus,
  scenario: Scenario,
  monthsOut: number = 24
): MarginProjections {
  const currentPath: MarginDataPoint[] = [];
  const aiAdopted: MarginDataPoint[] = [];
  const competitorFirst: MarginDataPoint[] = [];

  // Margin change rates per month
  const currentDeclineRate = 0.003; // -0.3% per month due to competitive pressure
  const aiGrowthRate = adoptionStatus === 'native' ? 0.008 : 0.006; // AI adoption improves margins
  const competitorImpactRate = 0.012; // Competitors with AI erode margins faster

  const scenarioMultiplier = scenario === 'conservative' ? 0.8 : scenario === 'aggressive' ? 1.2 : 1.0;

  for (let month = 0; month <= monthsOut; month += 3) {
    // Current path: gradual decline
    const currentPathMargin = Math.max(
      currentMargin * 100 - month * currentDeclineRate * 100 * scenarioMultiplier,
      currentMargin * 100 * 0.3
    );
    currentPath.push({ month, margin: Math.round(currentPathMargin) });

    // AI adopted path: initial investment dip then growth
    let aiMargin = currentMargin * 100;
    if (month <= 3) {
      aiMargin = currentMargin * 100 + month * 0.003 * 100; // Small early gain
    } else {
      aiMargin = currentMargin * 100 + month * aiGrowthRate * 100 * scenarioMultiplier;
    }
    aiAdopted.push({ month, margin: Math.round(Math.min(aiMargin, 35)) });

    // Competitor-first path: accelerated decline
    const competitorMargin = currentMargin * 100 - month * competitorImpactRate * 100 * scenarioMultiplier;
    competitorFirst.push({ month, margin: Math.round(competitorMargin) });
  }

  return { currentPath, aiAdopted, competitorFirst };
}

/**
 * Calculate AI Adoption Score (0-100)
 */
export function calculateAdoptionScore(
  adoptionStatus: AdoptionStatus,
  threatLevel: ThreatLevel,
  moats: MoatFactors,
  fundingStage: FundingStage
): ScoreBreakdown {
  // Component scores
  const deploymentScores: Record<AdoptionStatus, number> = {
    none: 5,
    early: 15,
    partial: 20,
    advanced: 25,
    native: 30,
  };

  const threatScores: Record<ThreatLevel, number> = {
    low: 15,
    medium: 10,
    high: 5,
    critical: 2,
  };

  const stageScores: Record<FundingStage, number> = {
    seed: 4,
    series_a: 5,
    series_b: 6,
    series_c: 7,
    growth: 8,
    public: 6,
  };

  // Calculate moat-based data readiness (proprietary data is key)
  const dataReadiness = moats.proprietaryData ? 22 : 12;

  // Team capability estimate based on stage and adoption
  const teamBase = stageScores[fundingStage];
  const teamCapability = adoptionStatus === 'native' ? 18 :
                         adoptionStatus === 'advanced' ? 14 :
                         adoptionStatus === 'partial' ? 10 : teamBase;

  // Execution risk based on moats
  const moatCount = Object.values(moats).filter(Boolean).length;
  const executionRisk = Math.min(moatCount * 2, 10);

  const currentDeployment = deploymentScores[adoptionStatus];
  const competitivePosition = threatScores[threatLevel];

  const overall = currentDeployment + dataReadiness + teamCapability + competitivePosition + executionRisk;

  return {
    overall: Math.min(overall, 100),
    components: {
      currentDeployment: { score: currentDeployment, max: 30, label: 'Current AI Deployment' },
      dataReadiness: { score: dataReadiness, max: 25, label: 'Data Infrastructure Readiness' },
      teamCapability: { score: teamCapability, max: 20, label: 'Team AI Capability' },
      competitivePosition: { score: competitivePosition, max: 15, label: 'Competitive AI Position' },
      executionRisk: { score: executionRisk, max: 10, label: 'Execution Risk Mitigation' },
    },
  };
}

/**
 * Run full revaluation analysis
 */
export function runFullRevaluation(inputs: RevaluationInputs): RevaluationResults {
  const baseValuation = inputs.currentValuation;

  const calculateScenario = (scenario: Scenario): ScenarioResults => {
    // AI adoption upside
    const adoptionAdjustment = calculateAIAdoptionAdjustment(inputs.adoptionStatus, scenario);
    const moatFactor = calculateMoatDurabilityFactor(inputs.moats);
    const aiAdoptedMultiplier = 1 + adoptionAdjustment * moatFactor;
    const aiAdoptedValuation = Math.round(baseValuation * aiAdoptedMultiplier);

    // Competitor-first downside
    const threatHaircut = calculateCompetitiveThreatHaircut(inputs.competitorThreatLevel, scenario);
    const competitorFirstMultiplier = 1 - threatHaircut;
    const competitorFirstValuation = Math.round(baseValuation * competitorFirstMultiplier);

    return {
      aiAdoptedValuation,
      aiAdoptedChange: (aiAdoptedValuation - baseValuation) / baseValuation,
      competitorFirstValuation,
      competitorFirstChange: (competitorFirstValuation - baseValuation) / baseValuation,
    };
  };

  const scoreBreakdown = calculateAdoptionScore(
    inputs.adoptionStatus,
    inputs.competitorThreatLevel,
    inputs.moats,
    inputs.fundingStage
  );

  const marginProjections = calculateMarginTrajectory(
    inputs.ebitdaMargin,
    inputs.adoptionStatus,
    'base'
  );

  return {
    currentValuation: baseValuation,
    conservative: calculateScenario('conservative'),
    base: calculateScenario('base'),
    aggressive: calculateScenario('aggressive'),
    aiAdoptionScore: scoreBreakdown.overall,
    scoreBreakdown,
    marginProjections,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, includeSign: boolean = true): string {
  const percentage = Math.round(value * 100);
  if (includeSign && percentage > 0) {
    return `+${percentage}%`;
  }
  return `${percentage}%`;
}
