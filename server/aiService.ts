import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

class AIService {
  private async callOpenAI(messages: ChatCompletionMessageParam[]): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
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
  }
}

Make it realistic, innovative, and comprehensive. Use real market insights.`;

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

    const completion = await openai.chat.completions.create({
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

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a senior business analyst and market researcher with expertise in startup evaluation and market analysis. Provide comprehensive, realistic research reports with actionable insights."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await this.callOpenAI(messages);
    
    try {
      // Clean the response to extract JSON
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedReport = JSON.parse(cleanedResponse);
      
      // Validate required fields
      const requiredFields = ['executiveSummary', 'marketAnalysis', 'competitorAnalysis'];
      for (const field of requiredFields) {
        if (!parsedReport[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      return parsedReport;
    } catch (parseError) {
      console.error('Error parsing AI research report:', parseError);
      console.error('Raw response:', response);
      throw new Error('Failed to parse AI-generated research report');
    }
  }
}

export const aiService = new AIService();