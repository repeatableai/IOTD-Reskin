/**
 * Pre-Mortem Failure Perspective Taxonomy
 * Defines failure modes and critic lenses for different venture categories
 */

import type { RiskDomain } from '../shared/preMortemTypes';

export interface PerspectiveDefinition {
  id: string;
  name: string;
  criticLens: string;
  riskDomain: RiskDomain;
  description: string;
}

/**
 * Healthcare/MedTech failure perspectives
 */
export const HEALTHCARE_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'regulatory_approval_failure',
    name: 'Regulatory Approval Failure',
    criticLens: 'FDA/EMA Regulatory Expert',
    riskDomain: 'regulatory',
    description: 'The venture failed to navigate the complex regulatory pathway, resulting in approval delays or outright rejection that depleted resources before market entry.'
  },
  {
    id: 'clinical_adoption_resistance',
    name: 'Clinical Adoption Resistance',
    criticLens: 'Chief Medical Officer',
    riskDomain: 'market',
    description: 'Healthcare providers refused to adopt the solution due to workflow disruption, lack of clinical validation, or resistance to change in established care protocols.'
  },
  {
    id: 'reimbursement_model_collapse',
    name: 'Reimbursement Model Collapse',
    criticLens: 'Healthcare Economist',
    riskDomain: 'financial',
    description: 'The venture failed to secure adequate reimbursement codes or payer coverage, making the solution economically unviable for target customers.'
  },
  {
    id: 'hipaa_liability_cascade',
    name: 'HIPAA Liability Cascade',
    criticLens: 'Healthcare Compliance Attorney',
    riskDomain: 'regulatory',
    description: 'A data breach or compliance failure triggered cascading legal, financial, and reputational damage that the venture could not survive.'
  },
  {
    id: 'physician_change_management_failure',
    name: 'Physician Change Management Failure',
    criticLens: 'Healthcare IT Change Manager',
    riskDomain: 'execution',
    description: 'The venture underestimated the difficulty of changing physician behavior, leading to persistent low adoption despite product-market fit.'
  }
];

/**
 * Fintech failure perspectives
 */
export const FINTECH_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'compliance_catastrophe',
    name: 'Compliance Catastrophe',
    criticLens: 'Financial Regulatory Counsel',
    riskDomain: 'regulatory',
    description: 'The venture violated financial regulations, triggering enforcement actions, fines, and loss of operating licenses.'
  },
  {
    id: 'banking_partner_abandonment',
    name: 'Banking Partner Abandonment',
    criticLens: 'Bank Partnership Executive',
    riskDomain: 'competitive',
    description: 'Critical banking partners terminated relationships due to risk concerns, compliance issues, or strategic pivots, leaving the venture without rails.'
  },
  {
    id: 'fraud_exposure_at_scale',
    name: 'Fraud Exposure at Scale',
    criticLens: 'Fraud Prevention Director',
    riskDomain: 'financial',
    description: 'As the venture scaled, fraud losses overwhelmed the business model, eroding margins and trust faster than prevention systems could adapt.'
  },
  {
    id: 'regulatory_arbitrage_collapse',
    name: 'Regulatory Arbitrage Collapse',
    criticLens: 'Financial Policy Analyst',
    riskDomain: 'regulatory',
    description: 'The regulatory gap the venture exploited was closed by new legislation, instantly commoditizing the business model.'
  },
  {
    id: 'customer_trust_destruction',
    name: 'Customer Trust Destruction',
    criticLens: 'Consumer Financial Protection Advocate',
    riskDomain: 'market',
    description: 'A security incident, service outage, or hidden fee scandal destroyed customer trust, triggering mass exodus and viral negative sentiment.'
  }
];

/**
 * B2B SaaS failure perspectives
 */
export const B2B_SAAS_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'enterprise_sales_cycle_death',
    name: 'Enterprise Sales Cycle Death',
    criticLens: 'Enterprise Sales VP',
    riskDomain: 'execution',
    description: 'The venture ran out of runway before enterprise sales cycles completed, dying with a full pipeline but empty bank account.'
  },
  {
    id: 'procurement_security_gate_failure',
    name: 'Procurement/Security Gate Failure',
    criticLens: 'Enterprise CISO',
    riskDomain: 'execution',
    description: 'The venture consistently failed security audits and procurement reviews, blocking deals with the largest potential customers.'
  },
  {
    id: 'implementation_complexity_collapse',
    name: 'Implementation Complexity Collapse',
    criticLens: 'Enterprise Implementation Director',
    riskDomain: 'execution',
    description: 'Implementations took 3x longer and cost 5x more than projected, destroying unit economics and customer relationships.'
  },
  {
    id: 'customer_success_churn_spiral',
    name: 'Customer Success Churn Spiral',
    criticLens: 'Customer Success Leader',
    riskDomain: 'market',
    description: 'High churn rate overwhelmed new customer acquisition, creating a negative growth spiral that depleted resources.'
  },
  {
    id: 'competitor_price_war_capitulation',
    name: 'Competitor Price War Capitulation',
    criticLens: 'Competitive Strategy Analyst',
    riskDomain: 'competitive',
    description: 'A well-funded competitor launched an aggressive pricing war that compressed margins below sustainable levels.'
  }
];

/**
 * Consumer App failure perspectives
 */
export const CONSUMER_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'user_acquisition_cost_spiral',
    name: 'User Acquisition Cost Spiral',
    criticLens: 'Growth Marketing Executive',
    riskDomain: 'financial',
    description: 'Customer acquisition costs spiraled upward as obvious channels saturated, making growth economically impossible.'
  },
  {
    id: 'network_effect_failure',
    name: 'Network Effect Failure',
    criticLens: 'Network Economics Researcher',
    riskDomain: 'market',
    description: 'The venture failed to achieve critical mass for network effects, leaving the product stuck in a low-value equilibrium.'
  },
  {
    id: 'retention_cliff',
    name: 'Retention Cliff',
    criticLens: 'Product Analytics Director',
    riskDomain: 'market',
    description: 'Users churned massively after initial engagement, revealing that the product solved a one-time need or failed to build habit.'
  },
  {
    id: 'unit_economics_deterioration',
    name: 'Unit Economics Deterioration',
    criticLens: 'Consumer Finance CFO',
    riskDomain: 'financial',
    description: 'As the venture scaled, hidden costs emerged that made unit economics permanently negative.'
  },
  {
    id: 'platform_dependency_risk',
    name: 'Platform Dependency Risk',
    criticLens: 'Platform Relations Strategist',
    riskDomain: 'competitive',
    description: 'A platform policy change (iOS, Android, social media) instantly broke the venture\'s distribution or business model.'
  }
];

/**
 * Hardware failure perspectives
 */
export const HARDWARE_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'supply_chain_single_point_failure',
    name: 'Supply Chain Single-Point Failure',
    criticLens: 'Supply Chain Risk Manager',
    riskDomain: 'execution',
    description: 'A critical component supplier failed, became unavailable, or dramatically increased prices, halting production.'
  },
  {
    id: 'manufacturing_scale_cost_overrun',
    name: 'Manufacturing Scale Cost Overrun',
    criticLens: 'Manufacturing Operations VP',
    riskDomain: 'financial',
    description: 'Manufacturing costs at scale far exceeded projections, destroying the business model that worked at prototype volumes.'
  },
  {
    id: 'distribution_channel_abandonment',
    name: 'Distribution Channel Abandonment',
    criticLens: 'Retail Channel Executive',
    riskDomain: 'market',
    description: 'Key retail or distribution partners dropped the product due to slow velocity, margin compression, or competitive pressure.'
  },
  {
    id: 'product_liability_exposure',
    name: 'Product Liability Exposure',
    criticLens: 'Product Liability Attorney',
    riskDomain: 'regulatory',
    description: 'Product defects led to injuries, recalls, and litigation that bankrupted the venture.'
  },
  {
    id: 'technology_obsolescence',
    name: 'Technology Obsolescence',
    criticLens: 'Technology Strategist',
    riskDomain: 'competitive',
    description: 'A breakthrough technology made the hardware obsolete before the venture could recoup development costs.'
  }
];

/**
 * Universal perspectives (apply to all ventures, always include 2)
 */
export const UNIVERSAL_PERSPECTIVES: PerspectiveDefinition[] = [
  {
    id: 'market_timing_miscalculation',
    name: 'Market Timing Miscalculation',
    criticLens: 'Venture Timing Analyst',
    riskDomain: 'market',
    description: 'The venture was either too early (market not ready) or too late (window closed), missing the optimal timing window.'
  },
  {
    id: 'founder_market_fit_mismatch',
    name: 'Founder-Market Fit Mismatch',
    criticLens: 'Founder Assessment Expert',
    riskDomain: 'team',
    description: 'The founding team lacked the specific domain expertise, network, or credibility needed to win in this particular market.'
  },
  {
    id: 'capital_efficiency_failure',
    name: 'Capital Efficiency Failure',
    criticLens: 'Venture Capital Partner',
    riskDomain: 'financial',
    description: 'The venture burned through capital without achieving milestones that would justify additional funding rounds.'
  },
  {
    id: 'team_capability_gap_at_scale',
    name: 'Team Capability Gap at Scale',
    criticLens: 'Organizational Scaling Consultant',
    riskDomain: 'team',
    description: 'The team that built the product could not scale the organization, leading to execution failures at critical growth stages.'
  }
];

/**
 * Category to perspectives mapping
 */
export const CATEGORY_PERSPECTIVES: Record<string, PerspectiveDefinition[]> = {
  'Healthcare': HEALTHCARE_PERSPECTIVES,
  'Fintech': FINTECH_PERSPECTIVES,
  'B2B SaaS': B2B_SAAS_PERSPECTIVES,
  'Consumer': CONSUMER_PERSPECTIVES,
  'Hardware': HARDWARE_PERSPECTIVES,
};

/**
 * Map market string to venture category
 */
export function mapMarketToCategory(market?: string): 'Healthcare' | 'Fintech' | 'B2B SaaS' | 'Consumer' | 'Hardware' | 'Other' {
  if (!market) return 'Other';

  const marketLower = market.toLowerCase();

  if (marketLower.includes('health') || marketLower.includes('medical') || marketLower.includes('pharma') ||
      marketLower.includes('biotech') || marketLower.includes('clinic') || marketLower.includes('hospital')) {
    return 'Healthcare';
  }

  if (marketLower.includes('fintech') || marketLower.includes('finance') || marketLower.includes('banking') ||
      marketLower.includes('payment') || marketLower.includes('insurance') || marketLower.includes('crypto') ||
      marketLower.includes('defi') || marketLower.includes('lending')) {
    return 'Fintech';
  }

  if (marketLower.includes('b2b') || marketLower.includes('saas') || marketLower.includes('enterprise') ||
      marketLower.includes('software') || marketLower.includes('platform')) {
    return 'B2B SaaS';
  }

  if (marketLower.includes('consumer') || marketLower.includes('retail') || marketLower.includes('ecommerce') ||
      marketLower.includes('social') || marketLower.includes('gaming') || marketLower.includes('entertainment') ||
      marketLower.includes('media') || marketLower.includes('food') || marketLower.includes('travel')) {
    return 'Consumer';
  }

  if (marketLower.includes('hardware') || marketLower.includes('iot') || marketLower.includes('device') ||
      marketLower.includes('manufacturing') || marketLower.includes('robotics') || marketLower.includes('electronics')) {
    return 'Hardware';
  }

  return 'Other';
}

/**
 * Select perspectives based on venture category
 * Returns 5-7 perspectives: 3-5 category-specific + 2 universal
 */
export function selectPerspectives(category: string): PerspectiveDefinition[] {
  const categoryPerspectives = CATEGORY_PERSPECTIVES[category] || [];

  // Select 3-5 category-specific perspectives (or all if category has fewer)
  const numCategoryPerspectives = Math.min(categoryPerspectives.length, 5);
  const selectedCategory = categoryPerspectives.slice(0, numCategoryPerspectives);

  // Always add 2 universal perspectives
  // Shuffle universal and pick 2
  const shuffledUniversal = [...UNIVERSAL_PERSPECTIVES].sort(() => Math.random() - 0.5);
  const selectedUniversal = shuffledUniversal.slice(0, 2);

  return [...selectedCategory, ...selectedUniversal];
}

/**
 * Get all available perspectives for a given market
 */
export function getAllPerspectivesForMarket(market?: string): PerspectiveDefinition[] {
  const category = mapMarketToCategory(market);
  const categoryPerspectives = CATEGORY_PERSPECTIVES[category] || [];
  return [...categoryPerspectives, ...UNIVERSAL_PERSPECTIVES];
}
