import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import Anthropic from '@anthropic-ai/sdk';

// Lazy-load API clients to allow server startup without keys
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Please set it in your environment variables.');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please set it in your environment variables.');
    }
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export interface GeneratedIdea {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  type: string;
  market: string;
  targetAudience: string;
  keyword: string;
  revenuePotential: string;
  executionDifficulty: string;
  gtmStrength: string;
  mainCompetitor: string;
  opportunityScore: number;
  problemScore: number;
  feasibilityScore: number;
  timingScore: number;
  executionScore: number;
  gtmScore: number;
  opportunityLabel: string;
  problemLabel: string;
  feasibilityLabel: string;
  timingLabel: string;
  keywordVolume?: number;
  keywordGrowth?: number;
  
  // Detailed analysis sections (for ideabrowser.com 1:1 copy)
  offerTiers?: {
    leadMagnet: { name: string; description: string; price: string };
    frontend: { name: string; description: string; price: string };
    core: { name: string; description: string; price: string };
    backend: { name: string; description: string; price: string };
    continuity: { name: string; description: string; price: string };
  };
  whyNowAnalysis?: string;
  proofSignals?: string;
  marketGap?: string;
  executionPlan?: string;
  frameworkData?: {
    valueEquation: {
      dreamOutcome: string;
      perceivedLikelihood: string;
      timeDelay: string;
      effortSacrifice: string;
    };
    marketMatrix: {
      marketSize: string;
      painLevel: string;
      targetingEase: string;
      purchasingPower: string;
    };
    acpFramework: {
      avatar: string;
      catalyst: string;
      promise: string;
    };
  };
  trendAnalysis?: string;
  keywordData?: {
    fastestGrowing: Array<{ keyword: string; volume: number; growth: string; competition: string }>;
    highestVolume: Array<{ keyword: string; volume: number; growth: string; competition: string }>;
    mostRelevant: Array<{ keyword: string; volume: number; growth: string; competition: string }>;
  };
  builderPrompts?: {
    adCreatives: string;
    brandPackage: string;
    landingPage: string;
    emailSequence: string;
    socialMedia: string;
    productDemo: string;
  };
  communitySignals?: {
    reddit: { subreddits: number; members: string; score: number; details: string };
    facebook: { groups: number; members: string; score: number; details: string };
    youtube: { channels: number; views: string; score: number; details: string };
    other: { segments: number; priorities: number; score: number; details: string };
  };
  signalBadges?: string[];
}

export interface IdeaGenerationParams {
  industry?: string;
  type?: string;
  market?: string;
  targetAudience?: string;
  problemArea?: string;
  constraints?: string;
}

export interface ResearchReport {
  executiveSummary: string;
  marketAnalysis: string;
  competitorAnalysis: string;
  targetMarketInsights: string;
  revenueProjections: string;
  riskAssessment: string;
  nextSteps: string;
  keyFindings: string[];
  marketSize: string;
  growthPotential: string;
  barriers: string[];
  opportunities: string[];
}

// Deep Research Report (Claude Sonnet 4.5 with Extended Thinking)
export interface DeepResearchReport {
  thinking: string; // Extended thinking process
  executiveSummary: string;
  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    trends: string[];
    drivers: string[];
    challenges: string[];
  };
  competitorLandscape: {
    directCompetitors: Array<{ name: string; strength: string; weakness: string; marketShare: string }>;
    indirectCompetitors: string[];
    competitiveAdvantages: string[];
  };
  customerAnalysis: {
    primarySegments: Array<{ segment: string; size: string; painPoints: string[]; willingness: string }>;
    buyerPersonas: string[];
    customerJourney: string;
  };
  businessModel: {
    revenueStreams: string[];
    pricingStrategy: string;
    costStructure: string;
    unitEconomics: string;
  };
  goToMarket: {
    launchStrategy: string;
    channelStrategy: string[];
    partnershipOpportunities: string[];
    marketingApproach: string;
  };
  financialProjections: {
    year1: { revenue: string; costs: string; profit: string };
    year2: { revenue: string; costs: string; profit: string };
    year3: { revenue: string; costs: string; profit: string };
    breakEvenTimeline: string;
    fundingRequirements: string;
  };
  riskAnalysis: {
    marketRisks: string[];
    operationalRisks: string[];
    financialRisks: string[];
    mitigationStrategies: string[];
  };
  implementationRoadmap: {
    phase1: { timeline: string; milestones: string[]; resources: string };
    phase2: { timeline: string; milestones: string[]; resources: string };
    phase3: { timeline: string; milestones: string[]; resources: string };
  };
  validationScores: {
    overallScore: number;
    marketOpportunity: number;
    competitivePosition: number;
    executionFeasibility: number;
    financialViability: number;
    timingScore: number;
  };
  keyRecommendations: string[];
  criticalSuccessFactors: string[];
}

// Rapid Research Report (Claude Haiku - faster, more concise)
export interface RapidResearchReport {
  summary: string;
  marketOpportunity: string;
  topCompetitors: string[];
  targetCustomer: string;
  revenueModel: string;
  estimatedRevenue: string;
  keyRisks: string[];
  nextSteps: string[];
  overallScore: number;
  recommendation: 'Pursue' | 'Refine' | 'Reconsider';
}

class AIService {
  private async callOpenAI(messages: ChatCompletionMessageParam[]): Promise<string> {
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.8,
        max_tokens: 4000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateIdea(params: IdeaGenerationParams = {}): Promise<GeneratedIdea> {
    const {
      industry = 'technology',
      type = 'web_app',
      market = 'B2C',
      targetAudience = 'young professionals',
      problemArea = 'productivity',
      constraints = 'none'
    } = params;

    const prompt = `Generate a comprehensive startup idea with detailed business analysis following the ideabrowser.com format.

Parameters:
- Industry: ${industry}
- Type: ${type}
- Market: ${market}
- Target Audience: ${targetAudience}
- Problem Area: ${problemArea}
- Constraints: ${constraints}

Generate a complete startup analysis including ALL of the following sections:

1. BASIC INFO: Title, subtitle, description, main content, keyword, competitors, scoring
2. OFFER/VALUE LADDER: Complete 5-tier pricing structure (Lead Magnet, Frontend, Core, Backend, Continuity)
3. WHY NOW ANALYSIS: 2-3 paragraphs explaining market timing, trends, and catalysts
4. PROOF & SIGNALS: Evidence of market demand, early indicators, community signals
5. MARKET GAP: What's missing in the current market that this solves
6. EXECUTION PLAN: Step-by-step roadmap for building and launching
7. FRAMEWORK ANALYSIS: Value Equation, Market Matrix, A.C.P. Framework
8. TREND ANALYSIS: Current trends supporting this idea
9. KEYWORD DATA: 3 categories with 5 keywords each (Fastest Growing, Highest Volume, Most Relevant)
10. BUILDER PROMPTS: Ready-to-use prompts for 6 different use cases

Return as JSON with this EXACT structure:
{
  "title": "Startup name",
  "subtitle": "One-line value proposition",
  "description": "2-3 sentence problem and solution",
  "content": "4-5 paragraph detailed analysis",
  "type": "${type}",
  "market": "${market}",
  "targetAudience": "${targetAudience}",
  "keyword": "primary SEO keyword",
  "revenuePotential": "High/Medium/Low explanation",
  "executionDifficulty": "High/Medium/Low explanation",
  "gtmStrength": "Strong/Medium/Weak explanation",
  "mainCompetitor": "Primary competitor",
  "opportunityScore": 8,
  "problemScore": 7,
  "feasibilityScore": 6,
  "timingScore": 9,
  "executionScore": 7,
  "gtmScore": 8,
  "opportunityLabel": "Excellent Market Fit",
  "problemLabel": "Clear Pain Point",
  "feasibilityLabel": "Achievable Build",
  "timingLabel": "Perfect Timing",
  "keywordVolume": 50000,
  "keywordGrowth": 35,
  "offerTiers": {
    "leadMagnet": {"name": "Free resource name", "description": "What they get", "price": "$0"},
    "frontend": {"name": "Entry product", "description": "First paid offer", "price": "$47"},
    "core": {"name": "Main product", "description": "Core value", "price": "$497"},
    "backend": {"name": "Premium service", "description": "High-ticket", "price": "$2997"},
    "continuity": {"name": "Subscription", "description": "Recurring revenue", "price": "$97/mo"}
  },
  "whyNowAnalysis": "2-3 paragraph analysis of why this is the perfect time for this idea",
  "proofSignals": "Evidence and signals showing market demand with specific examples",
  "marketGap": "Detailed explanation of the gap in the market this fills",
  "executionPlan": "Step-by-step execution roadmap with phases and milestones",
  "frameworkData": {
    "valueEquation": {
      "dreamOutcome": "What customers ultimately want",
      "perceivedLikelihood": "Why they believe it will work",
      "timeDelay": "How quickly they get results",
      "effortSacrifice": "How easy it is to use"
    },
    "marketMatrix": {
      "marketSize": "Size and growth assessment",
      "painLevel": "Severity of problem",
      "targetingEase": "How easy to reach",
      "purchasingPower": "Ability and willingness to pay"
    },
    "acpFramework": {
      "avatar": "Detailed customer avatar",
      "catalyst": "What triggers the purchase",
      "promise": "Core transformation promise"
    }
  },
  "trendAnalysis": "Analysis of trends making this idea timely and relevant",
  "keywordData": {
    "fastestGrowing": [
      {"keyword": "keyword1", "volume": 10000, "growth": "+150%", "competition": "Low"},
      {"keyword": "keyword2", "volume": 8000, "growth": "+120%", "competition": "Medium"},
      {"keyword": "keyword3", "volume": 6000, "growth": "+95%", "competition": "Low"},
      {"keyword": "keyword4", "volume": 5000, "growth": "+80%", "competition": "High"},
      {"keyword": "keyword5", "volume": 4000, "growth": "+75%", "competition": "Medium"}
    ],
    "highestVolume": [
      {"keyword": "keyword1", "volume": 500000, "growth": "+10%", "competition": "High"},
      {"keyword": "keyword2", "volume": 250000, "growth": "+15%", "competition": "High"},
      {"keyword": "keyword3", "volume": 100000, "growth": "+20%", "competition": "Medium"},
      {"keyword": "keyword4", "volume": 80000, "growth": "+12%", "competition": "High"},
      {"keyword": "keyword5", "volume": 60000, "growth": "+18%", "competition": "Medium"}
    ],
    "mostRelevant": [
      {"keyword": "keyword1", "volume": 25000, "growth": "+45%", "competition": "Low"},
      {"keyword": "keyword2", "volume": 20000, "growth": "+50%", "competition": "Low"},
      {"keyword": "keyword3", "volume": 15000, "growth": "+40%", "competition": "Medium"},
      {"keyword": "keyword4", "volume": 12000, "growth": "+35%", "competition": "Low"},
      {"keyword": "keyword5", "volume": 10000, "growth": "+42%", "competition": "Medium"}
    ]
  },
  "builderPrompts": {
    "adCreatives": "Prompt for creating ad creatives for this idea",
    "brandPackage": "Prompt for creating complete brand identity",
    "landingPage": "Prompt for building landing page",
    "emailSequence": "Prompt for email marketing sequence",
    "socialMedia": "Prompt for social media content strategy",
    "productDemo": "Prompt for building product demo/MVP"
  },
  "communitySignals": {
    "reddit": {"subreddits": 5, "members": "2.5M+", "score": 8, "details": "Strong community engagement across relevant subreddits"},
    "facebook": {"groups": 7, "members": "150K+", "score": 7, "details": "Active Facebook groups discussing this problem"},
    "youtube": {"channels": 14, "members": "1M+", "score": 7, "details": "Multiple YouTube channels covering this topic"},
    "other": {"segments": 4, "priorities": 3, "score": 8, "details": "Strong signals across forums, Discord, and Slack communities"}
  },
  "signalBadges": ["Perfect Timing", "Unfair Advantage", "Organic Growth"]
}

Make it realistic, innovative, and comprehensive. Use real market insights. Generate 2-5 relevant signal badges from options like: "Perfect Timing", "Unfair Advantage", "Organic Growth", "Proven Model", "Low Competition", "High Demand", "Strong Community", "Tech Tailwind", "Clear Monetization".`;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an elite startup advisor combining expertise in market research, business strategy, product development, and growth marketing. Generate comprehensive, realistic startup analyses that rival professional consulting reports. Always respond with valid, well-structured JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.8,
      max_tokens: 8000,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedIdea = JSON.parse(cleanedResponse);
      
      const requiredFields = ['title', 'description', 'type', 'market'];
      for (const field of requiredFields) {
        if (!parsedIdea[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      return parsedIdea;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI-generated idea');
    }
  }

  async generateIdeaFromHTML(htmlContent: string): Promise<GeneratedIdea> {
    // Extract text content from HTML by removing tags
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    const prompt = `Analyze this HTML content and generate a comprehensive startup solution analysis following the ideabrowser.com format.

HTML Content:
${textContent.substring(0, 5000)}${textContent.length > 5000 ? '...' : ''}

Extract all relevant information from the HTML and generate a complete startup analysis including ALL of the following sections:

1. BASIC INFO: Title, subtitle, description, main content, keyword, competitors, scoring
2. OFFER/VALUE LADDER: Complete 5-tier pricing structure (Lead Magnet, Frontend, Core, Backend, Continuity)
3. WHY NOW ANALYSIS: 2-3 paragraphs explaining market timing, trends, and catalysts
4. PROOF & SIGNALS: Evidence of market demand, early indicators, community signals
5. MARKET GAP: What's missing in the current market that this solves
6. EXECUTION PLAN: Step-by-step roadmap for building and launching
7. FRAMEWORK ANALYSIS: Value Equation, Market Matrix, A.C.P. Framework
8. TREND ANALYSIS: Current trends supporting this idea
9. KEYWORD DATA: 3 categories with 5 keywords each (Fastest Growing, Highest Volume, Most Relevant)
10. BUILDER PROMPTS: Ready-to-use prompts for 6 different use cases

Return as JSON with this EXACT structure (same as generateIdea):
{
  "title": "Startup name extracted from HTML",
  "subtitle": "One-line value proposition",
  "description": "2-3 sentence problem and solution",
  "content": "4-5 paragraph detailed analysis",
  "type": "web_app",
  "market": "B2C",
  "targetAudience": "target audience",
  "keyword": "primary SEO keyword",
  "revenuePotential": "High/Medium/Low explanation",
  "executionDifficulty": "High/Medium/Low explanation",
  "gtmStrength": "Strong/Medium/Weak explanation",
  "mainCompetitor": "Primary competitor",
  "opportunityScore": 8,
  "problemScore": 7,
  "feasibilityScore": 6,
  "timingScore": 9,
  "executionScore": 7,
  "gtmScore": 8,
  "opportunityLabel": "Excellent Market Fit",
  "problemLabel": "Clear Pain Point",
  "feasibilityLabel": "Achievable Build",
  "timingLabel": "Perfect Timing",
  "keywordVolume": 50000,
  "keywordGrowth": 35,
  "offerTiers": {
    "leadMagnet": {"name": "Free resource name", "description": "What they get", "price": "$0"},
    "frontend": {"name": "Entry product", "description": "First paid offer", "price": "$47"},
    "core": {"name": "Main product", "description": "Core value", "price": "$497"},
    "backend": {"name": "Premium service", "description": "High-ticket", "price": "$2997"},
    "continuity": {"name": "Subscription", "description": "Recurring revenue", "price": "$97/mo"}
  },
  "whyNowAnalysis": "2-3 paragraph analysis",
  "proofSignals": "Evidence and signals",
  "marketGap": "Detailed explanation",
  "executionPlan": "Step-by-step roadmap",
  "frameworkData": {
    "valueEquation": {
      "dreamOutcome": "What customers want",
      "perceivedLikelihood": "Why they believe it works",
      "timeDelay": "How quickly results",
      "effortSacrifice": "How easy to use"
    },
    "marketMatrix": {
      "marketSize": "Size assessment",
      "painLevel": "Severity",
      "targetingEase": "How easy to reach",
      "purchasingPower": "Ability to pay"
    },
    "acpFramework": {
      "avatar": "Customer avatar",
      "catalyst": "Purchase trigger",
      "promise": "Transformation promise"
    }
  },
  "trendAnalysis": "Trend analysis",
  "keywordData": {
    "fastestGrowing": [{"keyword": "kw1", "volume": 10000, "growth": "+150%", "competition": "Low"}, ...],
    "highestVolume": [{"keyword": "kw1", "volume": 500000, "growth": "+10%", "competition": "High"}, ...],
    "mostRelevant": [{"keyword": "kw1", "volume": 30000, "growth": "+25%", "competition": "Medium"}, ...]
  },
  "builderPrompts": {
    "adCreatives": "prompt text",
    "brandPackage": "prompt text",
    "landingPage": "prompt text",
    "emailSequence": "prompt text",
    "socialMedia": "prompt text",
    "productDemo": "prompt text"
  },
  "communitySignals": ["signal1", "signal2"],
  "signalBadges": ["badge1", "badge2"]
}

Extract as much information as possible from the HTML. If information is missing, make reasonable inferences based on the content.`;

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        system: "You are an expert business analyst. Analyze HTML content and extract comprehensive startup solution data. Always respond with valid JSON matching the exact structure specified.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Parse JSON from response
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const generatedIdea = JSON.parse(jsonMatch[0]) as GeneratedIdea;
      
      // Ensure all required fields have defaults
      return {
        ...generatedIdea,
        type: generatedIdea.type || 'web_app',
        market: generatedIdea.market || 'B2C',
        targetAudience: generatedIdea.targetAudience || 'general users',
        keyword: generatedIdea.keyword || 'startup solution',
        opportunityScore: generatedIdea.opportunityScore || 7,
        problemScore: generatedIdea.problemScore || 7,
        feasibilityScore: generatedIdea.feasibilityScore || 6,
        timingScore: generatedIdea.timingScore || 8,
        executionScore: generatedIdea.executionScore || 6,
        gtmScore: generatedIdea.gtmScore || 7,
        opportunityLabel: generatedIdea.opportunityLabel || 'Good Opportunity',
        problemLabel: generatedIdea.problemLabel || 'Clear Problem',
        feasibilityLabel: generatedIdea.feasibilityLabel || 'Moderate Complexity',
        timingLabel: generatedIdea.timingLabel || 'Good Timing',
      };
    } catch (error) {
      console.error('Error generating idea from HTML:', error);
      throw new Error(`Failed to generate idea from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateResearchReport(ideaTitle: string, ideaDescription: string): Promise<ResearchReport> {
    const prompt = `Generate a comprehensive business research report for this startup idea:

Title: ${ideaTitle}
Description: ${ideaDescription}

Provide a detailed market research report that includes:
1. Executive Summary
2. Market Analysis (size, trends, growth)
3. Competitor Analysis (key players, positioning)
4. Target Market Insights (demographics, behavior, pain points)
5. Revenue Projections (realistic estimates and models)
6. Risk Assessment (challenges and mitigation strategies)
7. Next Steps (actionable recommendations)
8. Key Findings (bullet points of critical insights)
9. Market Size estimation
10. Growth Potential assessment
11. Barriers to entry
12. Market Opportunities

Return the response as a JSON object with this structure:
{
  "executiveSummary": "2-3 paragraph overview",
  "marketAnalysis": "Detailed market size, trends, and dynamics analysis",
  "competitorAnalysis": "Analysis of key competitors and market positioning",
  "targetMarketInsights": "Deep dive into customer segments and behavior",
  "revenueProjections": "Revenue models and financial projections",
  "riskAssessment": "Key risks and mitigation strategies",
  "nextSteps": "Actionable next steps for implementation",
  "keyFindings": ["finding1", "finding2", "finding3", "finding4", "finding5"],
  "marketSize": "Market size estimation with reasoning",
  "growthPotential": "Growth potential assessment",
  "barriers": ["barrier1", "barrier2", "barrier3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"]
}

Make the analysis realistic, data-driven, and actionable. Focus on practical insights that would help an entrepreneur make informed decisions.`;

    try {
      console.log('Generating research report with Claude...');
      
      const response = await getAnthropic().messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4000,
        system: "You are a senior business analyst and market researcher with expertise in startup evaluation and market analysis. Provide comprehensive, realistic research reports with actionable insights. Always respond with valid JSON.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Clean the response to extract JSON
      let cleanedResponse = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      let jsonText = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      // Clean problematic characters that can break JSON parsing
      jsonText = jsonText
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control characters
        .replace(/\n/g, '\\n')  // Escape newlines in strings
        .replace(/\r/g, '\\r')  // Escape carriage returns
        .replace(/\t/g, '\\t')  // Escape tabs
        .replace(/\\n\\n/g, '\\n')  // Reduce double newlines
        .replace(/"\s*\n\s*"/g, '" "');  // Fix broken strings
      
      // Try to parse, if it fails try more aggressive cleaning
      let parsedReport;
      try {
        parsedReport = JSON.parse(jsonText);
      } catch (firstError) {
        // More aggressive cleaning - remove all newlines and extra spaces
        jsonText = jsonText
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\s+/g, ' ');
        parsedReport = JSON.parse(jsonText);
      }
      
      // Validate required fields
      const requiredFields = ['executiveSummary', 'marketAnalysis', 'competitorAnalysis'];
      for (const field of requiredFields) {
        if (!parsedReport[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      console.log('Research report generated successfully');
      return parsedReport;
    } catch (parseError) {
      console.error('Error generating/parsing AI research report:', parseError);
      throw new Error('Failed to generate AI research report');
    }
  }

  async generateChatResponse(idea: any, userMessage: string, history: Array<{ role: string; content: string }>): Promise<string> {
    const context = `
Idea: ${idea.title}
Description: ${idea.description}
Market: ${idea.market}
Target Audience: ${idea.targetAudience}
Opportunity Score: ${idea.opportunityScore}/10
Problem Score: ${idea.problemScore}/10
Execution Difficulty: ${idea.executionDifficulty}
${idea.content ? `\nDetailed Analysis: ${idea.content}` : ''}
    `;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert startup advisor and business consultant. You're helping entrepreneurs understand and evaluate the following startup idea:\n\n${context}\n\nProvide helpful, practical, and insightful answers to questions about this idea. Be concise but thorough. Focus on actionable advice.`
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    const response = await this.callOpenAI(messages);
    return response;
  }

  async performComprehensiveResearch(params: {
    idea: string;
    targetMarket?: string;
    skills?: string;
    budget?: string;
  }): Promise<{
    idea: string;
    analysis: {
      marketOpportunity: string;
      competitorAnalysis: string;
      communityInsights: string;
      businessStrategy: string;
      financialProjections: string;
      actionableRecommendations: string;
      validationScore: number;
      problemSeverity: number;
      feasibilityScore: number;
      timingScore: number;
    };
  }> {
    const prompt = `You are an expert market researcher conducting a comprehensive 40-step analysis for a startup idea.

STARTUP IDEA:
${params.idea}

${params.targetMarket ? `TARGET MARKET: ${params.targetMarket}` : ''}
${params.skills ? `FOUNDER SKILLS: ${params.skills}` : ''}
${params.budget ? `AVAILABLE BUDGET: ${params.budget}` : ''}

Perform a comprehensive analysis covering:

1. MARKET OPPORTUNITY (300-400 words):
   - Market size and growth potential
   - Current market trends and dynamics
   - Timing factors (why now?)
   - Regulatory/technology drivers
   - Market gaps and underserved segments

2. COMPETITOR ANALYSIS (300-400 words):
   - Existing players and their offerings
   - Competitive landscape mapping
   - Differentiation opportunities
   - Barriers to entry
   - Competitive advantages

3. COMMUNITY INSIGHTS (250-350 words):
   - Reddit sentiment and discussions (estimate)
   - Social media engagement patterns (estimate)
   - Customer pain points validation
   - Community size and growth
   - Problem severity assessment

4. BUSINESS STRATEGY (300-400 words):
   - Go-to-market approach
   - Revenue model recommendations
   - Customer acquisition strategy
   - MVP definition and scope
   - Key partnerships needed

5. FINANCIAL PROJECTIONS (250-350 words):
   - Revenue potential (Year 1-3)
   - Pricing strategy recommendations
   - Cost structure analysis
   - Break-even timeline
   - Required investment

6. ACTIONABLE RECOMMENDATIONS (300-400 words):
   - Immediate next steps (first 30 days)
   - 6-month roadmap
   - Resource requirements
   - Risk mitigation strategies
   - Success metrics to track

7. VALIDATION SCORES (provide scores 1-10):
   - Overall Validation Score
   - Problem Severity Score
   - Technical Feasibility Score
   - Market Timing Score

Provide detailed, data-driven analysis for each section. Use concrete examples and specific recommendations.

Format the response as JSON with this structure:
{
  "marketOpportunity": "...",
  "competitorAnalysis": "...",
  "communityInsights": "...",
  "businessStrategy": "...",
  "financialProjections": "...",
  "actionableRecommendations": "...",
  "validationScore": 8,
  "problemSeverity": 7,
  "feasibilityScore": 8,
  "timingScore": 9
}`;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert market researcher and startup advisor. Provide comprehensive, data-driven analysis."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      const analysis = JSON.parse(jsonText);

      return {
        idea: params.idea,
        analysis
      };
    } catch (error) {
      console.error('Error performing comprehensive research:', error);
      throw new Error('Failed to complete research analysis');
    }
  }

  async generatePersonalizedIdeas(params: {
    skills: string;
    budget?: string;
    timeCommitment?: string;
    industryInterests?: string;
    experience?: string;
  }): Promise<{ ideas: Array<any> }> {
    const prompt = `You are an expert startup advisor helping entrepreneurs find the perfect business idea.

USER PROFILE:
Skills & Expertise: ${params.skills}
Budget: ${params.budget || 'Not specified'}
Time Commitment: ${params.timeCommitment || 'Not specified'}
Industry Interests: ${params.industryInterests || 'Open to all industries'}
Experience Level: ${params.experience || 'Not specified'}

Generate 3 personalized startup ideas that are perfectly matched to this person's profile.

For each idea, provide:

1. TITLE: A compelling, descriptive title
2. SUBTITLE: A one-sentence value proposition
3. DESCRIPTION: A 150-200 word detailed description of the idea
4. MARKET: The market/industry (e.g., "SaaS", "E-commerce", "Healthcare")
5. TARGET AUDIENCE: Who this serves
6. OPPORTUNITY SCORE: 1-10 rating
7. PROBLEM SCORE: 1-10 rating of problem severity
8. FEASIBILITY SCORE: 1-10 rating based on their skills/budget
9. WHY THIS IDEA MATCHES YOU: 100-150 words explaining why this is perfect for them based on their skills, budget, time, and experience
10. NEXT STEPS: 100-150 words of actionable first steps they should take
11. ESTIMATED REVENUE: First year revenue estimate (e.g., "$50k-$100k", "$200k+")
12. TIME TO LAUNCH: Realistic timeline (e.g., "3-4 months", "6-9 months")

Focus on:
- Ideas that match their specific skill set
- Realistic based on their budget and time commitment
- Current market opportunities (2025 trends)
- Proven business models with clear monetization
- Ideas they can actually execute

Format as JSON:
{
  "ideas": [
    {
      "title": "...",
      "subtitle": "...",
      "description": "...",
      "market": "...",
      "targetAudience": "...",
      "opportunityScore": 8,
      "problemScore": 7,
      "feasibilityScore": 9,
      "whyThisIdea": "...",
      "nextSteps": "...",
      "estimatedRevenue": "$75k-$150k",
      "timeToLaunch": "4-6 months"
    },
    ... (3 ideas total)
  ]
}`;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert startup advisor who excels at matching people with perfect business opportunities based on their unique situation."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    try {
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.8,
        max_tokens: 4000,
      });

      const responseText = completion.choices[0]?.message?.content || '{"ideas":[]}';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      const result = JSON.parse(jsonText);

      return result;
    } catch (error) {
      console.error('Error generating personalized ideas:', error);
      throw new Error('Failed to generate ideas');
    }
  }

  // Deep Research with Claude Sonnet 4.5 and Extended Thinking
  async generateDeepResearch(params: {
    ideaTitle: string;
    ideaDescription: string;
    targetMarket?: string;
    additionalContext?: string;
  }): Promise<DeepResearchReport> {
    const prompt = `You are an elite business strategist and market researcher. Conduct an exhaustive, comprehensive analysis of this startup idea.

STARTUP IDEA:
Title: ${params.ideaTitle}
Description: ${params.ideaDescription}
${params.targetMarket ? `Target Market: ${params.targetMarket}` : ''}
${params.additionalContext ? `Additional Context: ${params.additionalContext}` : ''}

Perform deep research and analysis covering ALL of the following areas in extreme detail:

1. EXECUTIVE SUMMARY (500+ words)
   - Core value proposition
   - Key findings overview
   - Investment/pursuit recommendation

2. MARKET ANALYSIS
   - Total Addressable Market (TAM), Serviceable Addressable Market (SAM), Serviceable Obtainable Market (SOM)
   - Market growth rate and projections
   - Key market trends (5+)
   - Market drivers (5+)
   - Market challenges (5+)

3. COMPETITOR LANDSCAPE
   - Direct competitors (5+ with detailed analysis: name, strengths, weaknesses, market share)
   - Indirect competitors (5+)
   - Competitive advantages this idea could have (5+)
   - Competitive positioning strategy

4. CUSTOMER ANALYSIS
   - Primary customer segments (3+ with size, pain points, willingness to pay)
   - Detailed buyer personas (3+)
   - Customer journey map
   - Customer acquisition strategies

5. BUSINESS MODEL
   - Revenue streams (multiple)
   - Detailed pricing strategy with tiers
   - Cost structure breakdown
   - Unit economics (CAC, LTV, margins)

6. GO-TO-MARKET STRATEGY
   - Launch strategy (phased approach)
   - Channel strategy (5+ channels with priority)
   - Partnership opportunities (5+)
   - Marketing approach and budget allocation

7. FINANCIAL PROJECTIONS
   - Year 1, 2, 3 detailed projections (revenue, costs, profit)
   - Break-even timeline
   - Funding requirements and use of funds
   - Key financial assumptions

8. RISK ANALYSIS
   - Market risks (5+)
   - Operational risks (5+)
   - Financial risks (5+)
   - Detailed mitigation strategies for each

9. IMPLEMENTATION ROADMAP
   - Phase 1 (0-6 months): Timeline, milestones, resources needed
   - Phase 2 (6-12 months): Timeline, milestones, resources needed
   - Phase 3 (12-24 months): Timeline, milestones, resources needed

10. VALIDATION SCORES (1-10 scale with justification)
    - Overall Score
    - Market Opportunity Score
    - Competitive Position Score
    - Execution Feasibility Score
    - Financial Viability Score
    - Timing Score

11. KEY RECOMMENDATIONS (10+)
    - Prioritized action items

12. CRITICAL SUCCESS FACTORS (5+)
    - What must go right for this to succeed

Return your analysis as a comprehensive JSON object with this exact structure:
{
  "thinking": "Your extended thinking process and reasoning",
  "executiveSummary": "...",
  "marketAnalysis": {
    "marketSize": "TAM/SAM/SOM breakdown",
    "growthRate": "X% CAGR",
    "trends": ["trend1", "trend2", ...],
    "drivers": ["driver1", "driver2", ...],
    "challenges": ["challenge1", "challenge2", ...]
  },
  "competitorLandscape": {
    "directCompetitors": [{"name": "...", "strength": "...", "weakness": "...", "marketShare": "..."}],
    "indirectCompetitors": ["..."],
    "competitiveAdvantages": ["..."]
  },
  "customerAnalysis": {
    "primarySegments": [{"segment": "...", "size": "...", "painPoints": ["..."], "willingness": "..."}],
    "buyerPersonas": ["..."],
    "customerJourney": "..."
  },
  "businessModel": {
    "revenueStreams": ["..."],
    "pricingStrategy": "...",
    "costStructure": "...",
    "unitEconomics": "..."
  },
  "goToMarket": {
    "launchStrategy": "...",
    "channelStrategy": ["..."],
    "partnershipOpportunities": ["..."],
    "marketingApproach": "..."
  },
  "financialProjections": {
    "year1": {"revenue": "$X", "costs": "$X", "profit": "$X"},
    "year2": {"revenue": "$X", "costs": "$X", "profit": "$X"},
    "year3": {"revenue": "$X", "costs": "$X", "profit": "$X"},
    "breakEvenTimeline": "...",
    "fundingRequirements": "..."
  },
  "riskAnalysis": {
    "marketRisks": ["..."],
    "operationalRisks": ["..."],
    "financialRisks": ["..."],
    "mitigationStrategies": ["..."]
  },
  "implementationRoadmap": {
    "phase1": {"timeline": "0-6 months", "milestones": ["..."], "resources": "..."},
    "phase2": {"timeline": "6-12 months", "milestones": ["..."], "resources": "..."},
    "phase3": {"timeline": "12-24 months", "milestones": ["..."], "resources": "..."}
  },
  "validationScores": {
    "overallScore": 8,
    "marketOpportunity": 8,
    "competitivePosition": 7,
    "executionFeasibility": 8,
    "financialViability": 7,
    "timingScore": 9
  },
  "keyRecommendations": ["..."],
  "criticalSuccessFactors": ["..."]
}

Be thorough, data-driven, and provide specific, actionable insights. This is a premium research report.`;

    try {
      console.log('Starting deep research with Claude Sonnet 4.5...');

      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        thinking: {
          type: "enabled",
          budget_tokens: 10000
        },
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      // Extract thinking and text content
      let thinkingContent = '';
      let textContent = '';

      for (const block of response.content) {
        if (block.type === 'thinking') {
          thinkingContent = block.thinking;
        } else if (block.type === 'text') {
          textContent = block.text;
        }
      }

      // Parse the JSON response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;
      const report = JSON.parse(jsonText) as DeepResearchReport;

      // Add the thinking content
      report.thinking = thinkingContent;

      console.log('Deep research completed successfully');
      return report;
    } catch (error) {
      console.error('Error generating deep research:', error);
      throw new Error('Failed to generate deep research report');
    }
  }

  // Generate Sectioned Builder Prompts - one comprehensive prompt per app section
  async generateBuilderPrompts(params: {
    ideaTitle: string;
    ideaDescription: string;
    type?: string;
    market?: string;
    targetAudience?: string;
  }): Promise<{
    comprehensive: string;
    sections: {
      landingPage: string;
      adminFeatures: string;
      uiFrontend: string;
      backendFunctionality: string;
      mathCalculations: string;
    };
    // Keep legacy format for backwards compatibility
    claude: string;
    gemini: string;
    gpt: string;
  }> {
    const baseContext = `STARTUP IDEA:
Title: ${params.ideaTitle}
Description: ${params.ideaDescription}
${params.type ? `Type: ${params.type}` : ''}
${params.market ? `Market: ${params.market}` : ''}
${params.targetAudience ? `Target Audience: ${params.targetAudience}` : ''}`;

    console.log('Generating sectioned builder prompts with Claude Haiku (fast)...');

    try {
      // Generate all sections in parallel for speed
      const [comprehensive, landingPage, adminFeatures, uiFrontend, backendFunctionality, mathCalculations] = await Promise.all([
        // 1. Comprehensive prompt
        this.generateSinglePrompt(baseContext, 'comprehensive', params.market),
        // 2. Landing page
        this.generateSinglePrompt(baseContext, 'landingPage', params.market),
        // 3. Admin features
        this.generateSinglePrompt(baseContext, 'adminFeatures', params.market),
        // 4. UI/Frontend
        this.generateSinglePrompt(baseContext, 'uiFrontend', params.market),
        // 5. Backend
        this.generateSinglePrompt(baseContext, 'backendFunctionality', params.market),
        // 6. Math/calculations
        this.generateSinglePrompt(baseContext, 'mathCalculations', params.market),
      ]);

      const result = {
        comprehensive,
        sections: {
          landingPage,
          adminFeatures,
          uiFrontend,
          backendFunctionality,
          mathCalculations,
        },
        // Legacy format
        claude: comprehensive,
        gemini: comprehensive,
        gpt: comprehensive,
      };

      console.log('Sectioned builder prompts generated successfully');
      return result;
    } catch (error) {
      console.error('Error generating builder prompts:', error);
      throw new Error('Failed to generate builder prompts');
    }
  }

  // Helper to generate a single section prompt
  private async generateSinglePrompt(baseContext: string, section: string, market?: string): Promise<string> {
    const sectionPrompts: Record<string, string> = {
      comprehensive: `You are an expert full-stack developer. Create a comprehensive build prompt for this startup idea that can be used with any AI coding assistant (Claude, GPT, Cursor, etc.).

${baseContext}

Generate a complete, self-contained build prompt that includes:
1. Project overview and tech stack (React, TypeScript, Node.js, PostgreSQL)
2. Core features list with brief descriptions
3. Database schema (main tables and relationships)
4. Key API endpoints
5. Authentication requirements
6. UI/UX guidelines

Format as a clear, actionable prompt that starts with "Build a..." - Keep it focused and under 1500 words.`,

      landingPage: `You are a frontend expert. Create a build prompt specifically for the LANDING PAGE of this startup idea.

${baseContext}

Generate a prompt that covers:
1. Hero section (headline, subheadline, CTA)
2. Feature highlights (3-4 key features with icons)
3. Social proof section (testimonials or metrics)
4. Pricing cards (if applicable)
5. FAQ section
6. Footer with links

Include specific design requirements (colors, fonts, responsive breakpoints). Format as a clear prompt starting with "Build a landing page..." - Under 800 words.`,

      adminFeatures: `You are a full-stack developer. Create a build prompt specifically for the ADMIN DASHBOARD of this startup idea.

${baseContext}

Generate a prompt that covers:
1. Dashboard layout and navigation
2. User management (list, create, edit, delete users)
3. ${market === 'B2B' ? 'Team/organization management' : 'User settings and preferences'}
4. Analytics overview (key metrics)
5. Content management interfaces
6. Settings and configuration

Format as a clear prompt starting with "Build an admin dashboard..." - Under 800 words.`,

      uiFrontend: `You are a UI/UX expert. Create a build prompt specifically for the UI COMPONENT LIBRARY of this startup idea.

${baseContext}

Generate a prompt that covers:
1. Design system (colors, typography, spacing)
2. Button and form components
3. Card and list components
4. Modal and dialog components
5. Navigation components
6. Loading and error states

Include specific Tailwind CSS classes or design tokens. Format as a clear prompt starting with "Create a UI component library..." - Under 800 words.`,

      backendFunctionality: `You are a backend architect. Create a build prompt specifically for the BACKEND/API of this startup idea.

${baseContext}

Generate a prompt that covers:
1. Database schema (tables, relationships, indexes)
2. RESTful API endpoints with HTTP methods
3. Authentication flow (signup, login, sessions)
4. Authorization and permissions
5. Data validation
6. Error handling patterns

Include specific table definitions and endpoint examples. Format as a clear prompt starting with "Build a backend API..." - Under 1000 words.`,

      mathCalculations: `You are a business logic expert. Create a build prompt specifically for the BUSINESS LOGIC & CALCULATIONS of this startup idea.

${baseContext}

Generate a prompt that covers:
1. Core business algorithms specific to this app
2. Pricing/billing calculations (if applicable)
3. Data aggregation and analytics
4. Validation rules and constraints
5. Any scheduling or matching algorithms
6. Edge cases to handle

Focus on the unique mathematical or logical requirements. Format as a clear prompt starting with "Implement the business logic..." - Under 600 words.`,
    };

    const response = await getAnthropic().messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: sectionPrompts[section] || sectionPrompts.comprehensive
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  // Rapid Research with Claude Haiku (fast, 5-10 minute response)
  async generateRapidResearch(params: {
    ideaTitle: string;
    ideaDescription: string;
    targetMarket?: string;
  }): Promise<RapidResearchReport> {
    const prompt = `You are a fast-acting business analyst. Provide a quick but valuable assessment of this startup idea.

STARTUP IDEA:
Title: ${params.ideaTitle}
Description: ${params.ideaDescription}
${params.targetMarket ? `Target Market: ${params.targetMarket}` : ''}

Provide a rapid assessment with:
1. A 2-3 sentence summary of the opportunity
2. Market opportunity size and potential (1-2 paragraphs)
3. Top 5 competitors in this space
4. Target customer profile (1 paragraph)
5. Recommended revenue model
6. Estimated first-year revenue potential
7. Top 5 risks to consider
8. 5 immediate next steps to validate/pursue this idea
9. Overall score (1-10)
10. Recommendation: "Pursue", "Refine", or "Reconsider"

Return as JSON:
{
  "summary": "Quick summary of the opportunity",
  "marketOpportunity": "Market size and opportunity description",
  "topCompetitors": ["Competitor 1", "Competitor 2", "Competitor 3", "Competitor 4", "Competitor 5"],
  "targetCustomer": "Description of ideal customer",
  "revenueModel": "Recommended monetization approach",
  "estimatedRevenue": "$X-$Y first year",
  "keyRisks": ["Risk 1", "Risk 2", "Risk 3", "Risk 4", "Risk 5"],
  "nextSteps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
  "overallScore": 7,
  "recommendation": "Pursue"
}

Be concise but insightful. Focus on actionable information.`;

    try {
      console.log('Starting rapid research with Claude Haiku...');

      const response = await getAnthropic().messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse the JSON response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;
      const report = JSON.parse(jsonText) as RapidResearchReport;

      console.log('Rapid research completed successfully');
      return report;
    } catch (error) {
      console.error('Error generating rapid research:', error);
      throw new Error('Failed to generate rapid research report');
    }
  }

  // Generate Roast - brutally honest feedback from different perspectives
  async generateRoast(params: {
    ideaTitle: string;
    ideaDescription: string;
    market?: string;
    type?: string;
    targetAudience?: string;
    intensity: 'gentle' | 'moderate' | 'tough' | 'savage';
    perspective: 'vc' | 'technical' | 'competitor' | 'customer';
  }): Promise<{
    perspective: string;
    intensity: string;
    harshTruth: {
      title: string;
      points: string[];
      verdict: string;
    };
    theHype: {
      title: string;
      points: string[];
      verdict: string;
    };
    finalVerdict: {
      score: number;
      summary: string;
      recommendation: string;
    };
  }> {
    const intensityInstructions: Record<string, string> = {
      gentle: 'Be constructive and encouraging while still being honest. Focus on growth opportunities rather than failures. Use supportive language.',
      moderate: 'Give balanced, honest feedback. Point out real concerns while acknowledging strengths. Be direct but fair.',
      tough: 'Be brutally honest about flaws. Don\'t sugarcoat problems. Focus on hard truths that the founder needs to hear.',
      savage: 'No holds barred. Tear this idea apart. Find every weakness, every flaw, every reason it could fail. Be ruthless but still constructive.',
    };

    const perspectiveInstructions: Record<string, string> = {
      vc: 'You are a seasoned VC partner at a top-tier firm. You\'ve seen 10,000+ pitches. You invest in 1% of what you see. Evaluate this from an investment standpoint - market size, defensibility, team fit, scalability, unit economics.',
      technical: 'You are a technical founder who has built and sold multiple companies. You\'ve shipped products used by millions. Evaluate technical feasibility, architecture decisions, build complexity, technical moat, and whether this can actually be built well.',
      competitor: 'You are a direct competitor already established in this market with $10M+ ARR. Find every weakness in this idea. What would you exploit? Where are they vulnerable? Why will they fail against you?',
      customer: 'You are the exact target customer this product claims to serve. You experience the problem daily. Would you actually pay for this? Does it really solve your problem? What would make you switch from current solutions?',
    };

    const prompt = `${perspectiveInstructions[params.perspective]}

${intensityInstructions[params.intensity]}

STARTUP IDEA TO ROAST:
Title: ${params.ideaTitle}
Description: ${params.ideaDescription}
${params.market ? `Market: ${params.market}` : ''}
${params.type ? `Type: ${params.type}` : ''}
${params.targetAudience ? `Target Audience: ${params.targetAudience}` : ''}

Provide your roast with two sections:

1. THE HARSH TRUTH - What's wrong with this idea? Be specific about:
   - Market problems
   - Competitive threats
   - Execution challenges
   - Why this might fail
   - What the founder is missing
   
2. THE HYPE - What could make this work? Despite your criticism:
   - What's genuinely interesting here?
   - What market opportunity exists?
   - What could make this succeed?
   - What would change your mind?

3. FINAL VERDICT - Your overall assessment with a score and recommendation.

Return as JSON:
{
  "perspective": "${params.perspective}",
  "intensity": "${params.intensity}",
  "harshTruth": {
    "title": "A punchy title for the criticism section",
    "points": ["Specific criticism 1", "Specific criticism 2", "Specific criticism 3", "Specific criticism 4", "Specific criticism 5"],
    "verdict": "A one-sentence brutal summary of the problems"
  },
  "theHype": {
    "title": "A punchy title for the positive section",
    "points": ["Genuine strength 1", "Genuine strength 2", "Genuine strength 3", "Genuine strength 4"],
    "verdict": "A one-sentence summary of the opportunity"
  },
  "finalVerdict": {
    "score": 7,
    "summary": "2-3 sentence overall assessment balancing truth and hype",
    "recommendation": "Specific actionable advice for the founder"
  }
}`;

    try {
      console.log(`Generating ${params.intensity} roast from ${params.perspective} perspective...`);

      const response = await getAnthropic().messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;
      
      // Clean and parse
      const cleanedJson = jsonText
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '')
        .replace(/\t/g, ' ');
      
      let result;
      try {
        result = JSON.parse(cleanedJson);
      } catch {
        // More aggressive cleaning
        const aggressiveClean = cleanedJson
          .replace(/\\n/g, ' ')
          .replace(/\s+/g, ' ');
        result = JSON.parse(aggressiveClean);
      }

      console.log('Roast generated successfully');
      return result;
    } catch (error) {
      console.error('Error generating roast:', error);
      throw new Error('Failed to generate roast');
    }
  }
}

export const aiService = new AIService();