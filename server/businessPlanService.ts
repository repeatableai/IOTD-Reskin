import Anthropic from '@anthropic-ai/sdk';

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

export interface BusinessPlanParams {
  name: string;
  industry: string;
  stage: string;
  value: string;
  customer?: string;
  revenue?: string;
  acv?: string;
  headcount?: string;
  aiFte?: string;
  team?: string;
  aiStack?: string;
  aiFunctions?: string;
  humanFunctions?: string;
  geo?: string;
  capital?: string;
  moat?: string;
  context?: string;
  edition: 'vc' | 'enterprise';
}

export interface BusinessPlanResult {
  content: string;
  edition: string;
  generatedAt: string;
}

function buildSystemPrompt(edition: 'vc' | 'enterprise'): string {
  const isVC = edition === 'vc';
  return `You are the world's foremost AI-First Business Architecture expert — synthesizing frameworks from Peter Drucker (deliverable accountability), Clayton Christensen (disruptive architecture), W. Edwards Deming (systems quality), Eliyahu Goldratt (Theory of Constraints), and Marc Andreessen (venture capital architecture).

You are generating an AI-First Business Plan for the Company OS platform by Repeatable AI. This is NOT a traditional business plan. It is a new strategic document genre that replaces:
- The org chart with a DELIVERABLE CHART
- The staffing plan with an AI/HUMAN ASSIGNMENT MAP
- The cost center model with a COST-PER-DELIVERABLE ROI ENGINE

EDITION: ${isVC ? 'VC / INVESTOR — lead with capital efficiency, IRR framing, moat analysis, and unit economics. Frame everything for a partner-level due diligence conversation.' : 'ENTERPRISE CLIENT — lead with operational outcomes, 90-day time-to-value, workforce transformation roadmap, and change management clarity.'}

OUTPUT EXACTLY THESE SECTIONS:
1. ## Executive Summary
2. ## The Paradigm Shift: Why AI-First Changes Everything
3. ## Venture Thesis & Market Opportunity
4. ## Master Deliverable Map
5. ## AI/Human Assignment Matrix
6. ## The Fractional Professional Architecture
7. ## AI Voice Partner Integration
8. ## Revenue Model & Financial Projections
9. ## The AI Leverage Table
10. ## Go-to-Market Strategy
11. ## Competitive Moat & Defensibility
12. ## Risk Framework & AI Liability Model
13. ## Capital Requirements & Use of Funds
14. ## The Operating System: How This Company Runs Day-to-Day

Section 4 table columns: Department | Core Deliverables | # Outputs/Mo | AI-Owned % | Human-Owned % | Primary Output
Section 5 table columns: Function | Owner | Traditional Annual Cost | AI-First Cost | Annual Savings | Notes
Section 7 table columns: Role | AI Voice Capability | Workflows Triggered | Data Access | Daily Value Generated
Section 9 table columns: Department | Function | Traditional FTE Cost | AI-First Cost | Savings | Efficiency Gain

Rules: Be specific and data-rich. No filler. Every table must be fully populated. Every section minimum 3 paragraphs. Tone: institutional, precise, confident.`;
}

function buildUserPrompt(params: BusinessPlanParams): string {
  return `Generate a complete AI-First Business Plan:

COMPANY: ${params.name || '[Company]'}
INDUSTRY: ${params.industry || '[Industry]'}
STAGE: ${params.stage || '[Stage]'}
REVENUE TARGET (Y3): ${params.revenue || 'Not specified'}
AVERAGE CONTRACT VALUE: ${params.acv || 'Not specified'}
HUMAN HEADCOUNT (Y1): ${params.headcount || 'Not specified'}
AI EQUIVALENT FTEs (Y1): ${params.aiFte || 'Not specified'}
GEOGRAPHIC FOCUS: ${params.geo || 'United States'}
CAPITAL SOUGHT: ${params.capital || 'Not specified'}

VALUE PROPOSITION:
${params.value || 'Not specified'}

TARGET CUSTOMER: ${params.customer || 'Not specified'}

FOUNDING TEAM: ${params.team || 'Not specified'}

AI STACK: ${params.aiStack || 'Not specified'}

AI-OWNED FUNCTIONS:
${params.aiFunctions || 'Not specified'}

HUMAN-OWNED FUNCTIONS:
${params.humanFunctions || 'Not specified'}

COMPETITIVE MOAT:
${params.moat || 'Not specified'}

ADDITIONAL CONTEXT:
${params.context || 'None provided'}

EDITION: ${params.edition === 'vc' ? 'VC / INVESTOR' : 'ENTERPRISE CLIENT'}

Generate the complete plan now. Be specific, data-rich, and compelling. Populate every table with precise figures consistent with this industry and stage.`;
}

export async function generateBusinessPlan(
  params: BusinessPlanParams,
  userId: string
): Promise<BusinessPlanResult> {
  console.log(`[BusinessPlan] User ${userId} generating plan for: ${params.name} (${params.edition} edition)`);

  const systemPrompt = buildSystemPrompt(params.edition);
  const userPrompt = buildUserPrompt(params);

  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';

  console.log(`[BusinessPlan] Successfully generated plan for: ${params.name}`);

  return {
    content: responseText,
    edition: params.edition === 'vc' ? 'VC / Investor Edition' : 'Enterprise Client Edition',
    generatedAt: new Date().toISOString(),
  };
}

export function buildMasterPrompt(params: BusinessPlanParams): string {
  const systemPrompt = buildSystemPrompt(params.edition);
  const userPrompt = buildUserPrompt(params);

  return `=== SYSTEM PROMPT ===

${systemPrompt}

=== USER PROMPT ===

${userPrompt}`;
}
