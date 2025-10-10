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
      const completion = await openai.chat.completions.create({
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
      const completion = await openai.chat.completions.create({
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
}

export const aiService = new AIService();