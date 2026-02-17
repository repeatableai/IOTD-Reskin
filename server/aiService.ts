import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import Anthropic from '@anthropic-ai/sdk';
import { htmlAnalyzer } from './htmlAnalyzer';
import { getJson } from 'serpapi';

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
    
    // Log key status (without exposing the full key)
    const keyLength = process.env.ANTHROPIC_API_KEY.length;
    const keyPrefix = process.env.ANTHROPIC_API_KEY.substring(0, 15);
    console.log(`[Anthropic] Initializing client with key: ${keyPrefix}... (length: ${keyLength})`);
    
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
      // Check if API key is set
      if (!process.env.OPENAI_API_KEY) {
        const errorMsg = 'OPENAI_API_KEY is not set. Please configure it in your environment variables.';
        console.error('[OpenAI]', errorMsg);
        throw new Error(errorMsg);
      }

      // Initialize OpenAI client (this might throw if API key is invalid)
      let openaiClient;
      try {
        openaiClient = getOpenAI();
        console.log('[OpenAI] Client initialized successfully');
      } catch (initError: any) {
        console.error('[OpenAI] Failed to initialize client:', initError?.message || initError);
        throw new Error(`Failed to initialize OpenAI client: ${initError?.message || 'Unknown initialization error'}`);
      }

      console.log('[OpenAI] Making API call with model: gpt-4o-mini');
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.8,
        max_tokens: 4000,
      });

      console.log('[OpenAI] API call successful');
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error('[OpenAI] No content in response:', JSON.stringify(completion, null, 2));
        throw new Error('OpenAI returned an empty response');
      }

      return content;
    } catch (error: any) {
      // Log comprehensive error details
      const errorDetails = {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        statusCode: error?.statusCode,
        type: error?.type,
        response: error?.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : undefined,
        stack: error?.stack,
        name: error?.name,
        toString: error?.toString?.(),
      };
      
      console.error('[OpenAI] ========== API ERROR DETAILS ==========');
      console.error('[OpenAI]', JSON.stringify(errorDetails, null, 2));
      console.error('[OpenAI] ========================================');
      
      // Always throw an error with detailed information
      let errorMessage = 'Unknown error';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data) {
        const responseData = error.response.data;
        errorMessage = responseData?.error?.message || responseData?.message || JSON.stringify(responseData);
      } else if (error?.toString) {
        errorMessage = error.toString();
      } else {
        errorMessage = JSON.stringify(error);
      }
      
      const detailedError = `OpenAI API error: ${errorMessage}${error?.code ? ` (code: ${error.code})` : ''}${error?.status || error?.statusCode ? ` (status: ${error?.status || error?.statusCode})` : ''}`;
      console.error('[OpenAI] Throwing error:', detailedError);
      throw new Error(detailedError);
    }
  }

  /**
   * Search for app image using Google Images (SerpAPI)
   */
  private async searchAppImage(title: string, description?: string): Promise<string | null> {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      // Search for app screenshots, logos, or interface images
      const searchQuery = description 
        ? `${title} app screenshot OR ${title} logo OR ${title} interface OR ${description.substring(0, 50)}`
        : `${title} app screenshot OR ${title} logo OR ${title} interface`;
      
      console.log(`[Image Search] Searching Google Images for: ${searchQuery}`);
      
      const results = await getJson({
        engine: 'google_images',
        q: searchQuery,
        api_key: apiKey,
        num: 5, // Get top 5 results
        safe: 'active',
      });

      const images = results.images_results || [];
      if (images.length > 0) {
        // Return the first high-quality image
        const imageUrl = images[0].original || images[0].link;
        console.log(`[Image Search] Found app image: ${imageUrl?.substring(0, 50)}...`);
        return imageUrl || null;
      }
      
      return null;
    } catch (error) {
      console.warn('[Image Search] Error searching Google Images:', error);
      return null;
    }
  }

  /**
   * Search for relevant stock photo using Unsplash
   */
  private async searchUnsplashImage(title: string, description?: string): Promise<string | null> {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      // Create search query from title and description
      const searchQuery = description 
        ? `${title} ${description.substring(0, 50)}`
        : title;
      
      console.log(`[Image Search] Searching Unsplash for: ${searchQuery}`);
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape&client_id=${apiKey}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      const photos = data.results || [];
      
      if (photos.length > 0) {
        // Return the first photo's regular size URL
        const imageUrl = photos[0].urls?.regular || photos[0].urls?.full;
        console.log(`[Image Search] Found Unsplash image: ${imageUrl?.substring(0, 50)}...`);
        return imageUrl || null;
      }
      
      return null;
    } catch (error) {
      console.warn('[Image Search] Error searching Unsplash:', error);
      return null;
    }
  }

  /**
   * Generate image using DALL-E (fallback)
   */
  private async generateWithDALLE(title: string, description?: string): Promise<string | null> {
    if (!process.env.OPENAI_API_KEY) {
      return null;
    }

    try {
      // Create a prompt for image generation based on title and description
      const imagePrompt = description 
        ? `A modern, professional illustration representing "${title}". ${description.substring(0, 200)}. Style: clean, minimalist, tech startup aesthetic, vibrant colors, modern UI elements.`
        : `A modern, professional illustration representing "${title}". Style: clean, minimalist, tech startup aesthetic, vibrant colors, modern UI elements.`;

      console.log(`[Image Generation] Generating with DALL-E for: ${title}`);
      
      const response = await getOpenAI().images.generate({
        model: "dall-e-2", // Using DALL-E 2 for faster generation
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        console.warn('[Image Generation] No image URL returned from DALL-E');
        return null;
      }

      console.log(`[Image Generation] Successfully generated image: ${imageUrl.substring(0, 50)}...`);
      return imageUrl;
    } catch (error) {
      console.error('[Image Generation] Error generating with DALL-E:', error);
      return null;
    }
  }

  /**
   * Generate an AI image based on idea title and description
   * Uses hybrid approach: Search first, then generate
   */
  async generateIdeaImage(title: string, description?: string): Promise<string | null> {
    console.log(`[Image Generation] Starting hybrid image search for: ${title}`);
    
    // Step 1: Try to find actual app image via Google Images
    try {
      const appImage = await this.searchAppImage(title, description);
      if (appImage) {
        console.log(`[Image Generation] Using app image from Google Images`);
        return appImage;
      }
    } catch (error) {
      console.warn('[Image Generation] App image search failed, trying next option:', error);
    }

    // Step 2: Search Unsplash for relevant stock photo
    try {
      const stockImage = await this.searchUnsplashImage(title, description);
      if (stockImage) {
        console.log(`[Image Generation] Using stock image from Unsplash`);
        return stockImage;
      }
    } catch (error) {
      console.warn('[Image Generation] Unsplash search failed, trying next option:', error);
    }

    // Step 3: Generate with DALL-E as last resort
    try {
      const generatedImage = await this.generateWithDALLE(title, description);
      if (generatedImage) {
        console.log(`[Image Generation] Using generated image from DALL-E`);
        return generatedImage;
      }
    } catch (error) {
      console.warn('[Image Generation] DALL-E generation failed:', error);
    }

    // Step 4: Return null if all methods failed
    console.warn('[Image Generation] All image methods failed, returning null');
    return null;
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
  "content": "4-5 paragraph detailed analysis that comprehensively describes ALL features, functionality, UI components, and user workflows",
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
  "executionPlan": "Step-by-step execution roadmap with phases and milestones. Do NOT include time estimates, durations, or month ranges - just list the phases and what each phase delivers.",
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

    // Use Claude instead of OpenAI since we have a valid Anthropic key
    const fullPrompt = `You are an elite startup advisor combining expertise in market research, business strategy, product development, and growth marketing. Generate comprehensive, realistic startup analyses that rival professional consulting reports. Always respond with valid, well-structured JSON.

${prompt}`;

    try {
      // Use Sonnet 4 for rapid mode (faster than Opus), Opus for deep/comprehensive mode
      const model = params.constraints === 'rapid_mode' 
        ? "claude-sonnet-4-20250514"  // Fastest model - Sonnet 4 is faster than Opus
        : "claude-opus-4-6";  // Slower but more comprehensive
      
      // Reduce tokens for rapid mode but keep enough for all comprehensive fields
      const maxTokens = params.constraints === 'rapid_mode' 
        ? 10000  // Enough for all fields but faster than 16k
        : 16000; // Full for comprehensive
      
      console.log(`[generateIdea] 🚀 Starting AI API call`);
      console.log(`[generateIdea] Model: ${model}, max_tokens: ${maxTokens}, timeout: ${params.constraints === 'rapid_mode' ? 180000 : 180000}ms`);
      console.log(`[generateIdea] Timestamp: ${new Date().toISOString()}`);
      console.log(`[generateIdea] Prompt length: ${fullPrompt.length} characters`);
      
      const startTime = Date.now();
      let message;
      try {
        // Note: Anthropic SDK doesn't accept 'timeout' as a parameter
        // Timeouts are handled by the HTTP client or AbortController
        // For now, we rely on the default HTTP timeout
        message = await getAnthropic().messages.create({
          model,
          max_tokens: maxTokens,
          temperature: 0.8,
          messages: [
            {
              role: "user",
              content: fullPrompt
            }
          ],
        });
        const duration = Date.now() - startTime;
        console.log(`[generateIdea] ✅ AI API call completed in ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
      } catch (apiError: any) {
        const duration = Date.now() - startTime;
        console.error(`[generateIdea] ❌ AI API CALL FAILED after ${duration}ms`);
        console.error(`[generateIdea] Error type: ${apiError?.constructor?.name}`);
        console.error(`[generateIdea] Error message: ${apiError?.message}`);
        console.error(`[generateIdea] Error status: ${apiError?.status}`);
        console.error(`[generateIdea] Error code: ${apiError?.code}`);
        console.error(`[generateIdea] Error name: ${apiError?.name}`);
        if (apiError?.error) {
          console.error(`[generateIdea] Error details:`, JSON.stringify(apiError.error, null, 2));
        }
        throw apiError;
      }

      const response = message.content[0]?.type === 'text' ? message.content[0].text : '';
      
      if (!response) {
        console.error('[generateIdea] ❌ No response text from Claude API');
        console.error('[generateIdea] Message content:', JSON.stringify(message.content, null, 2));
        throw new Error('No response from Claude API');
      }
      
      console.log(`[generateIdea] Response length: ${response.length} characters`);
      
      try {
        const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedIdea = JSON.parse(cleanedResponse);
        
        const requiredFields = ['title', 'description', 'type', 'market'];
        for (const field of requiredFields) {
          if (!parsedIdea[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        console.log(`[generateIdea] ✅ Successfully parsed idea: ${parsedIdea.title}`);
        return parsedIdea;
      } catch (parseError) {
        console.error('[generateIdea] ❌ Error parsing AI response:', parseError);
        console.error('[generateIdea] Raw response (first 500 chars):', response.substring(0, 500));
        throw new Error('Failed to parse AI-generated idea');
      }
    } catch (error: any) {
      console.error('[generateIdea] ❌ Error generating idea with Claude:', error);
      throw new Error(`Failed to generate idea: ${error.message || 'Unknown error'}`);
    }
  }

  async generateIdeaFromHTML(htmlContent: string): Promise<GeneratedIdea> {
    // Validate content
    if (!htmlContent || htmlContent.trim().length === 0) {
      throw new Error('Content is empty');
    }

    // Detect if content is HTML or plain text
    const hasHTMLTags = /<[^>]+>/.test(htmlContent);
    const isPlainText = !hasHTMLTags;
    
    // Check if content is just a URL (with or without protocol)
    const trimmedContent = htmlContent.trim();
    // Match URLs with protocol (http:// or https://) or domain names (domain.com, subdomain.domain.com)
    const urlPattern = /^(https?:\/\/)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/i;
    const isURL = urlPattern.test(trimmedContent) && !trimmedContent.includes(' ');
    
    // If content is just a URL, provide helpful error message
    if (isURL) {
      throw new Error(`The provided content appears to be a URL (${trimmedContent}). Please use the /api/ai/generate-from-url endpoint instead, or provide the actual document content.`);
    }
    
    // If it's plain text and very short, log warning but proceed
    if (isPlainText && htmlContent.trim().length < 20) {
      console.warn(`[Document Analysis] Warning: Document content is very short (${htmlContent.trim().length} chars). Proceeding anyway but results may be limited.`);
      // Don't throw - proceed with what we have
    }

    // If it's plain text (document content), use document-based prompt
    if (isPlainText) {
      console.log('[Document Analysis] Detected plain text document, using document-based analysis...');
      console.log('[Document Analysis] Content length:', htmlContent.length, 'chars');
      
      const prompt = this.buildDocumentAnalysisPrompt(htmlContent);
      
      try {
        const response = await getAnthropic().messages.create({
          model: "claude-opus-4-6",
          max_tokens: 16000,
          system: "You are an expert business analyst specializing in analyzing business documents, proposals, and startup ideas. You analyze document content to understand the business concept, value proposition, and market opportunity, then generate comprehensive startup solution entries matching ideabrowser.com format. Always respond with valid JSON matching the exact structure specified.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from AI service');
        }
        
        // Parse JSON from response
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            jsonMatch = codeBlockMatch;
          } else {
            throw new Error('No JSON found in response. Response preview: ' + responseText.substring(0, 200));
          }
        }

        let generatedIdea: GeneratedIdea;
        try {
          generatedIdea = JSON.parse(jsonMatch[0]) as GeneratedIdea;
        } catch (parseError) {
          console.error('[Document Analysis] JSON parse error:', parseError);
          console.error('[Document Analysis] Attempted to parse:', jsonMatch[0].substring(0, 500));
          throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        
        // Validate and return with defaults
        return this.validateAndDefaultIdea(generatedIdea);
      } catch (error: any) {
        console.error('[Document Analysis] Error generating idea:', error);
        
        // Check for authentication errors
        if (error?.status === 401 || 
            error?.message?.includes('authentication') || 
            error?.error?.type === 'authentication_error' ||
            error?.message?.includes('invalid x-api-key')) {
          const apiKeyPresent = !!process.env.ANTHROPIC_API_KEY;
          const apiKeyPreview = process.env.ANTHROPIC_API_KEY 
            ? `${process.env.ANTHROPIC_API_KEY.substring(0, 15)}...` 
            : 'NOT SET';
          
          console.error(`[Document Analysis] API Key Status: ${apiKeyPresent ? 'Present' : 'Missing'}`);
          console.error(`[Document Analysis] API Key Preview: ${apiKeyPreview}`);
          console.error(`[Document Analysis] Full error:`, JSON.stringify(error, null, 2));
          
          throw new Error(`Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY environment variable. Key is ${apiKeyPresent ? 'present but invalid or expired' : 'missing'}. Error: ${error?.error?.message || error?.message || 'Unknown error'}`);
        }
        
        throw error;
      }
    }

    // Otherwise, proceed with HTML analysis
    let analysis;
    let fallbackText = '';
    let analysisFailed = false;
    
    try {
      // Perform deep HTML analysis
      console.log('[HTML Analysis] Starting deep analysis of HTML content...');
      console.log('[HTML Analysis] Content length:', htmlContent.length, 'chars');
      
      analysis = await htmlAnalyzer.analyze(htmlContent);
      
      // Validate analysis results
      if (!analysis || !analysis.rawContent || !analysis.rawContent.text) {
        throw new Error('Analysis returned incomplete results');
      }
      
      console.log('[HTML Analysis] Analysis completed successfully');
      console.log('[HTML Analysis] Found:', {
        semanticElements: analysis.structure.semanticElements.length,
        forms: analysis.structure.forms.length,
        features: analysis.functional.features.length,
        components: analysis.visual.components.length,
      });
    } catch (error) {
      console.error('[HTML Analysis] Error during analysis, falling back to text extraction:', error);
      analysisFailed = true;
      
      // Fallback to simple text extraction if analysis fails
      fallbackText = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (fallbackText.length < 50) {
        throw new Error('HTML content is too minimal to analyze. Please provide a complete HTML page.');
      }
    }

    // Build comprehensive prompt with analysis data
    const prompt = this.buildHTMLAnalysisPrompt(analysis, fallbackText || htmlContent);

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-opus-4-6",
        max_tokens: 16000, // Increased for comprehensive generation
        system: "You are an expert business analyst specializing in analyzing web applications and startup ideas. You analyze HTML content deeply to understand visual design, functionality, and purpose, then generate comprehensive startup solution entries matching ideabrowser.com format. Always respond with valid JSON matching the exact structure specified.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }
      
      // Parse JSON from response - try multiple strategies
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON in code blocks
        const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = codeBlockMatch;
        } else {
          throw new Error('No JSON found in response. Response preview: ' + responseText.substring(0, 200));
        }
      }

      let generatedIdea: GeneratedIdea;
      try {
        generatedIdea = JSON.parse(jsonMatch[0]) as GeneratedIdea;
      } catch (parseError) {
        console.error('[HTML Analysis] JSON parse error:', parseError);
        console.error('[HTML Analysis] Attempted to parse:', jsonMatch[0].substring(0, 500));
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      // Validate and return with defaults
      return this.validateAndDefaultIdea(generatedIdea);
    } catch (error) {
      console.error('[HTML Analysis] Error generating idea from HTML:', error);
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          throw new Error(`Failed to parse AI response. The HTML may be too complex or incomplete. Original error: ${error.message}`);
        }
        if (error.message.includes('API')) {
          throw new Error(`AI service error. Please check your API key and try again. Original error: ${error.message}`);
        }
        throw new Error(`Failed to generate idea from HTML: ${error.message}`);
      }
      throw new Error(`Failed to generate idea from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate idea from spreadsheet row data
   * Takes mapped spreadsheet data and generates comprehensive idea using AI
   * If only URL is provided (no title/description), fetches and analyzes the URL first
   */
  async generateIdeaFromSpreadsheetRow(rowData: any): Promise<GeneratedIdea> {
    // Check if we have URL but missing title/description - fetch from URL first
    const hasUrl = rowData.previewUrl && rowData.previewUrl.trim().length > 0;
    const hasTitle = rowData.title && rowData.title.trim().length > 0;
    const hasDescription = rowData.description && rowData.description.trim().length > 0;
    
    // If URL exists but no title/description, fetch and analyze the URL
    if (hasUrl && (!hasTitle || !hasDescription)) {
      console.log(`[Spreadsheet] URL-only row detected. Fetching and analyzing: ${rowData.previewUrl}`);
      
      try {
        // Fetch the website
        const fetchResponse = await fetch(rowData.previewUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });
        
        if (fetchResponse.ok) {
          const htmlContent = await fetchResponse.text();
          console.log(`[Spreadsheet] Fetched ${htmlContent.length} characters from URL`);
          
          // Generate idea from HTML (this extracts title, description, etc. from the app)
          const urlBasedIdea = await this.generateIdeaFromHTML(htmlContent);
          
          // Merge URL-extracted data with spreadsheet data
          // Spreadsheet data takes precedence if provided, but URL data fills in missing fields
          rowData = {
            ...urlBasedIdea, // Start with URL-extracted data
            ...rowData, // Spreadsheet data overrides URL data
            previewUrl: rowData.previewUrl, // Ensure previewUrl is preserved from spreadsheet
          };
          
          console.log(`[Spreadsheet] Merged URL-extracted data. Title: ${rowData.title}, Description length: ${rowData.description?.length || 0}`);
        } else {
          console.warn(`[Spreadsheet] Failed to fetch URL ${rowData.previewUrl}: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
      } catch (urlError) {
        console.warn(`[Spreadsheet] Failed to fetch URL ${rowData.previewUrl}, proceeding with spreadsheet data only:`, urlError);
        // Continue with spreadsheet data only - AI will generate from what's available
      }
    }
    
    // Build comprehensive prompt from spreadsheet data (now potentially enriched with URL data)
    const prompt = this.buildSpreadsheetAnalysisPrompt(rowData);
    
    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514", // Faster model for bulk operations
        max_tokens: 16000,
        temperature: 0.8,
        system: "You are an expert business analyst specializing in analyzing startup ideas and business concepts. You analyze spreadsheet data to understand business concepts, value propositions, and market opportunities, then generate comprehensive startup solution entries matching ideabrowser.com format. Always respond with valid JSON matching the exact structure specified.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }
      
      // Parse JSON from response - try multiple strategies
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON in code blocks
        const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = codeBlockMatch;
        } else {
          throw new Error('No JSON found in response. Response preview: ' + responseText.substring(0, 200));
        }
      }

      let generatedIdea: GeneratedIdea;
      try {
        const cleanedResponse = jsonMatch[0].replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        generatedIdea = JSON.parse(cleanedResponse) as GeneratedIdea;
      } catch (parseError) {
        console.error('[Spreadsheet Analysis] JSON parse error:', parseError);
        console.error('[Spreadsheet Analysis] Attempted to parse:', jsonMatch[0].substring(0, 500));
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      // Validate and return with defaults
      return this.validateAndDefaultIdea(generatedIdea);
    } catch (error: any) {
      console.error('[Spreadsheet Analysis] Error generating idea:', error);
      
      // Check for authentication errors
      if (error?.status === 401 || 
          error?.message?.includes('authentication') || 
          error?.error?.type === 'authentication_error' ||
          error?.message?.includes('invalid x-api-key')) {
        throw new Error(`Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY environment variable.`);
      }
      
      // Check for rate limit errors
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        throw new Error(`Rate limit exceeded. Please wait and try again.`);
      }
      
      throw error;
    }
  }

  /**
   * Build comprehensive prompt from spreadsheet row data
   */
  private buildSpreadsheetAnalysisPrompt(rowData: any): string {
    // Extract key fields for prompt
    const title = rowData.title || 'Untitled Solution';
    const description = rowData.description || '';
    const content = rowData.content || description;
    const problem = rowData.problem || '';
    const solution = rowData.solution || '';
    const targetAudience = rowData.targetAudience || '';
    const market = rowData.market || 'B2C';
    const type = rowData.type || 'web_app';
    const previewUrl = rowData.previewUrl || '';
    
    // Build context from all spreadsheet columns
    const spreadsheetContext = Object.entries(rowData)
      .filter(([key]) => !['previewUrl', 'imageUrl'].includes(key))
      .map(([key, value]) => {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          return `${key}: ${value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');
    
    // Add URL context if URL is provided
    const urlContext = previewUrl 
      ? `\n\nIMPORTANT: A preview URL is available: ${previewUrl}. This URL points to the actual application. Use the app's functionality, design, and purpose (as analyzed from the URL/app content) to inform the title, description, and all analysis sections. If title or description are missing from the spreadsheet, extract them from the app's purpose and functionality.`
      : '';
    
    return `You are analyzing spreadsheet data for a startup idea to generate a comprehensive startup solution entry matching ideabrowser.com format.${urlContext}

SPREADSHEET DATA:
${spreadsheetContext}

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
  "title": "${title}",
  "subtitle": "One-line value proposition",
  "description": "${description || '2-3 sentence problem and solution'}",
  "content": "${content || '4-5 paragraph detailed analysis'}",
  "type": "${type}",
  "market": "${market}",
  "targetAudience": "${targetAudience || 'target users'}",
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
  "executionPlan": "Step-by-step execution roadmap with phases and milestones. Do NOT include time estimates, durations, or month ranges - just list the phases and what each phase delivers.",
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

Make it realistic, innovative, and comprehensive. Use the spreadsheet data as context but expand it into a full professional analysis. Generate 2-5 relevant signal badges from options like: "Perfect Timing", "Unfair Advantage", "Organic Growth", "Proven Model", "Low Competition", "High Demand", "Strong Community", "Tech Tailwind", "Clear Monetization".`;
  }

  /**
   * Build comprehensive prompt from HTML analysis
   */
  private buildHTMLAnalysisPrompt(analysis: any, fallbackText: string): string {
    if (!analysis) {
      // Fallback prompt if analysis failed
      return `Analyze this HTML content and generate a comprehensive startup solution analysis following the ideabrowser.com format.

HTML Content:
${fallbackText.substring(0, 10000)}${fallbackText.length > 10000 ? '...' : ''}

Generate a complete startup analysis with all required fields.`;
    }

    return `You are analyzing a LIVE WEB APPLICATION to generate a comprehensive startup solution entry matching ideabrowser.com format.

CRITICAL ANALYSIS FOCUS: Analyze this as if you're accessing the actual running application. Focus on:

1. VISIBILITY & VISUAL DESIGN - What does the user SEE?
2. FUNCTIONALITY & FEATURES - What can users DO?
3. BUSINESS DETAILS - How does this work as a business?

CRITICAL FUNCTIONALITY EXTRACTION INSTRUCTIONS:
YOU MUST EXTRACT EVERY SINGLE FEATURE AND FUNCTIONALITY THAT EXISTS IN THIS APP:

1. READ ALL CONTENT CAREFULLY:
   - Read EVERY heading (h1, h2, h3, etc.) - they often describe features and app sections
   - Read EVERY button label and link text - they indicate functionality (e.g., "Create", "Share", "Export", "Download", "Save", "Delete", "Edit", "Filter", "Search", "Upload", "Connect", "Sync")
   - Read EVERY form field label and placeholder - they show what data is collected and what features exist
   - Read ALL paragraph text and descriptions - they explain features and functionality
   - Read ALL navigation items - they show app sections and features
   - Read ALL UI component text - buttons, cards, modals, tooltips, badges, etc.

2. EXTRACT FUNCTIONALITY FROM EVERY ELEMENT:
   - Button labels = FEATURES (every button represents an action/feature)
   - Heading text = APP SECTIONS/FEATURES (e.g., "Dashboard", "Analytics", "Settings", "Team Management")
   - Form fields = DATA COLLECTION FEATURES (e.g., "Email", "Password", "File Upload", "Date Picker", "Dropdown")
   - Link text and navigation items = FEATURES AND APP SECTIONS
   - Icon names and alt text = FUNCTIONALITY INDICATORS
   - Tooltip text and help text = FEATURE DESCRIPTIONS

3. LIST ALL UI COMPONENTS VISIBLE:
   - Every button, card, modal, dropdown, tab, sidebar, header, footer
   - Every form, input field, textarea, select dropdown, checkbox, radio button
   - Every table, list, grid, chart, graph, visualization
   - Every navigation menu, breadcrumb, pagination
   - Every alert, notification, badge, tooltip, popover
   - Every image, icon, logo, illustration
   - Custom components that don't match standard patterns

4. DESCRIBE ALL INTERACTIVE ELEMENTS:
   - What happens when you click each button?
   - What data can you input in each form?
   - What can you view in each section?
   - What actions can you perform?
   - What workflows exist?

5. INCLUDE CUSTOM FUNCTIONALITY:
   - Don't rely only on detected features - read the actual content
   - If a feature is mentioned in text, headings, or buttons, it EXISTS
   - Extract functionality even if it doesn't match standard patterns
   - Be comprehensive - if it's visible or mentioned, include it

6. COMPREHENSIVE FEATURE LIST:
   - Create a complete list of ALL features mentioned anywhere
   - Include features from headings, buttons, descriptions, navigation
   - Include features from form fields and data structures
   - Include features from user flows and workflows
   - Include features from integrations and APIs mentioned
   - Don't skip anything - be exhaustive

HTML STRUCTURE ANALYSIS:
- Semantic Elements: ${JSON.stringify(analysis.structure.semanticElements.slice(0, 10), null, 2)}
- Navigation Structure: ${JSON.stringify(analysis.structure.navigation.slice(0, 15), null, 2)}
- Forms Found: ${analysis.structure.forms.length} form(s) with fields: ${JSON.stringify(analysis.structure.forms.slice(0, 3), null, 2)}
- Interactive Elements: ${JSON.stringify(analysis.structure.interactiveElements.slice(0, 20), null, 2)}

VISUAL DESIGN & VISIBILITY ANALYSIS:
- Color Scheme: Primary: ${analysis.visual.colors.primary}, Secondary: ${analysis.visual.colors.secondary}, Background: ${analysis.visual.colors.background}, Text: ${analysis.visual.colors.text}
- Accent Colors: ${analysis.visual.colors.accent.join(', ')}
- Typography: Font Families: ${analysis.visual.typography.fontFamilies.join(', ') || 'Not specified'}, Sizes: ${analysis.visual.typography.sizes.slice(0, 5).join(', ') || 'Not specified'}, Weights: ${analysis.visual.typography.weights.join(', ') || 'Not specified'}
- Layout Type: ${(analysis.visual.layout as any).layoutType || 'standard'}
- Visual Hierarchy: ${(analysis.visual.layout as any).visualHierarchy || 'Standard flow'}
- Page Structure: Hero: ${(analysis.visual.layout as any).hasHero ? 'Yes' : 'No'}, Sidebar: ${(analysis.visual.layout as any).hasSidebar ? 'Yes' : 'No'}, Footer: ${(analysis.visual.layout as any).hasFooter ? 'Yes' : 'No'}
- Layout Patterns: ${analysis.visual.layout.patterns.join(', ') || 'Standard'}
- Responsive Design: ${(analysis.visual.layout as any).responsive?.hasViewportMeta ? 'Yes' : 'No'}, Mobile Optimized: ${(analysis.visual.layout as any).responsive?.mobileOptimized ? 'Yes' : 'No'}
- UI Components Identified: ${JSON.stringify(analysis.visual.components.slice(0, 10), null, 2)}
- Common CSS Classes: ${JSON.stringify(analysis.visual.cssClasses.slice(0, 15), null, 2)}

FUNCTIONALITY & FEATURES ANALYSIS:
- Features Detected: ${JSON.stringify(analysis.functional.features, null, 2)}
- User Flows: ${JSON.stringify(analysis.functional.userFlows, null, 2)}
- Data Structures: ${JSON.stringify(analysis.functional.dataStructures, null, 2)}
- Integrations/APIs: ${analysis.functional.integrations.join(', ') || 'None detected'}

PURPOSE & BUSINESS ANALYSIS:
- Meta Tags: Title: "${analysis.purpose.meta.title}", Description: "${analysis.purpose.meta.description.substring(0, 200)}", Keywords: ${analysis.purpose.meta.keywords.join(', ') || 'None'}
- Value Proposition: ${analysis.purpose.valueProposition.substring(0, 500)}
- Target Audience: ${analysis.purpose.targetAudience}
- Problem Statement: ${analysis.purpose.problemStatement.substring(0, 500)}
- Solution Statement: ${analysis.purpose.solutionStatement.substring(0, 500)}
- Call-to-Actions: ${analysis.purpose.ctaTexts.join(', ') || 'None detected'}

COMPREHENSIVE CONTENT ANALYSIS (ALL CONTENT, NOT JUST LINKS):
READ THIS SECTION CAREFULLY - IT CONTAINS ALL FEATURES AND FUNCTIONALITY:
- Main Text (first 8000 chars - READ CAREFULLY FOR ALL FEATURES): ${analysis.rawContent.text.substring(0, 8000)}${analysis.rawContent.text.length > 8000 ? '...' : ''}
- Heading Hierarchy (EVERY HEADING DESCRIBES FEATURES/SECTIONS): ${JSON.stringify(analysis.rawContent.headings.slice(0, 50), null, 2)}
- Key Paragraphs (READ FOR FEATURE DESCRIPTIONS): ${JSON.stringify((analysis.rawContent.paragraphs || []).slice(0, 30), null, 2)}
- Buttons/CTAs (EVERY BUTTON = A FEATURE): ${JSON.stringify((analysis.rawContent.buttons || []).slice(0, 30), null, 2)}
- Form Fields (EVERY FIELD = DATA COLLECTION FEATURE): ${JSON.stringify((analysis.rawContent.formFields || []).slice(0, 20), null, 2)}
- Links (EVERY LINK = NAVIGATION TO FEATURE/SECTION): ${JSON.stringify(analysis.rawContent.links.slice(0, 50), null, 2)}

Based on ALL of this comprehensive analysis, generate a complete startup solution entry with:

1. BASIC INFO: Title (use meta title or infer from content), subtitle (value proposition), description (2-3 sentences), content (4-5 paragraphs that comprehensively describe ALL features and functionality), type (web_app/mobile_app/saas/marketplace/etc based on functionality), market (B2C/B2B/B2B2C), targetAudience (use analysis), keyword (primary SEO keyword), competitors, all scoring metrics

IMPORTANT: In the "content" field, provide a comprehensive 4-5 paragraph description that includes:
- ALL features and functionality you extracted from headings, buttons, forms, and text
- ALL UI components and sections visible in the app
- ALL user workflows and interactions possible
- Complete feature list - don't skip anything mentioned or visible

2. SCORING METRICS (1-10 scale with labels):
   - opportunityScore & opportunityLabel (based on market size, pain level, timing)
   - problemScore & problemLabel (based on problem clarity and severity)
   - feasibilityScore & feasibilityLabel (based on technical complexity from HTML structure and ALL features detected)
   - timingScore & timingLabel (based on market trends and timing indicators)
   - executionScore (based on complexity of ALL features detected - not just automated detection, include everything you found)
   - gtmScore (based on target audience clarity and CTAs)

3. OFFER/VALUE LADDER: Complete 5-tier pricing structure
   - leadMagnet: Free resource/lead generation offer
   - frontend: Entry-level paid product ($47-$97)
   - core: Main product/service ($497-$997)
   - backend: Premium/high-ticket offer ($1997-$4997)
   - continuity: Recurring subscription ($29-$197/mo)

4. DETAILED ANALYSIS SECTIONS:
   - whyNowAnalysis: 2-3 paragraphs on market timing, trends, catalysts
   - proofSignals: Evidence of market demand, early indicators, community signals
   - marketGap: What's missing in current market that this solves
   - executionPlan: Step-by-step roadmap based on ALL features and functionality detected (include every feature you found - be comprehensive). Do NOT include time estimates or month ranges - just list phases and deliverables.

5. FRAMEWORK DATA:
   - valueEquation: dreamOutcome, perceivedLikelihood, timeDelay, effortSacrifice
   - marketMatrix: marketSize, painLevel, targetingEase, purchasingPower
   - acpFramework: avatar (detailed customer), catalyst (purchase trigger), promise (transformation)

6. TREND ANALYSIS: Current trends supporting this idea (2-3 paragraphs)

7. KEYWORD DATA: 3 categories with 5 keywords each
   - fastestGrowing: Keywords with high growth rates
   - highestVolume: Keywords with highest search volume
   - mostRelevant: Most relevant keywords for this solution

8. BUILDER PROMPTS: Ready-to-use prompts for 6 use cases
   - adCreatives: Prompt for creating ad creatives
   - brandPackage: Prompt for complete brand identity
   - landingPage: Prompt for building landing page
   - emailSequence: Prompt for email marketing sequence
   - socialMedia: Prompt for social media content strategy
   - productDemo: Prompt for building product demo/MVP (include ALL features you detected)

9. COMMUNITY SIGNALS: Object with reddit, facebook, youtube, other platforms (with subreddits/groups/channels counts, members, scores, details)

10. SIGNAL BADGES: Array of 2-5 relevant badges from: "Perfect Timing", "Unfair Advantage", "Organic Growth", "Proven Model", "Low Competition", "High Demand", "Strong Community", "Tech Tailwind", "Clear Monetization", "Massive Market", "10x Better"

Return as JSON with this EXACT structure:
{
  "title": "Startup name",
  "subtitle": "One-line value proposition",
  "description": "2-3 sentence problem and solution",
  "content": "4-5 paragraph detailed analysis that comprehensively describes ALL features, functionality, UI components, and user workflows",
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
  "executionPlan": "Step-by-step roadmap with phases. Do NOT include time estimates or month ranges.",
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
  "communitySignals": {
    "reddit": {"subreddits": 5, "members": "2.5M+", "score": 8, "details": "Strong community engagement"},
    "facebook": {"groups": 7, "members": "150K+", "score": 7, "details": "Active Facebook groups"},
    "youtube": {"channels": 14, "members": "1M+", "score": 7, "details": "Multiple YouTube channels"},
    "other": {"segments": 4, "priorities": 3, "score": 8, "details": "Strong signals across forums"}
  },
  "signalBadges": ["Perfect Timing", "Unfair Advantage"]
}

Make inferences based on the visual design, functionality, and purpose you've identified. The solution should reflect what the HTML represents - whether it's a SaaS app, marketplace, mobile app concept, e-commerce platform, etc. Use the analysis data to inform all aspects of the generated solution.`;
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
        model: "claude-opus-4-6",
        max_tokens: 8000,
        system: "You are a senior business analyst and market researcher with expertise in startup evaluation and market analysis. Provide comprehensive, realistic research reports with actionable insights. Always respond with valid JSON. Ensure the JSON is complete and properly closed.",
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
        .replace(/\r/g, '\\r');  // Escape carriage returns
      
      const report = JSON.parse(jsonText) as ResearchReport;
      return report;
    } catch (error) {
      console.error('Error generating research report:', error);
      throw new Error(`Failed to generate research report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build prompt for analyzing plain text documents (PDF, DOCX, etc.)
   */
  private buildDocumentAnalysisPrompt(documentText: string): string {
    return `You are analyzing a business document (PDF, DOCX, or other format) to generate a comprehensive startup solution entry matching ideabrowser.com format.

DOCUMENT CONTENT:
${documentText.substring(0, 15000)}${documentText.length > 15000 ? '...' : ''}

Based on this document content, generate a complete startup solution entry with:

1. BASIC INFO: Extract or infer title, subtitle (value proposition), description (2-3 sentences), content (4-5 paragraphs), type (web_app/mobile_app/saas/marketplace/etc), market (B2C/B2B/B2B2C), targetAudience, keyword (primary SEO keyword), competitors, all scoring metrics

2. SCORING METRICS (1-10 scale with labels):
   - opportunityScore & opportunityLabel (based on market size, pain level, timing)
   - problemScore & problemLabel (based on problem clarity and severity)
   - feasibilityScore & feasibilityLabel (based on technical complexity)
   - timingScore & timingLabel (based on market trends and timing indicators)
   - executionScore (based on complexity of features)
   - gtmScore (based on target audience clarity)

3. OFFER/VALUE LADDER: Complete 5-tier pricing structure
   - leadMagnet: Free resource/lead generation offer
   - frontend: Entry-level paid product ($47-$97)
   - core: Main product/service ($497-$997)
   - backend: Premium/high-ticket offer ($1997-$4997)
   - continuity: Recurring subscription ($29-$197/mo)

4. DETAILED ANALYSIS SECTIONS:
   - whyNowAnalysis: 2-3 paragraphs on market timing, trends, catalysts
   - proofSignals: Evidence of market demand, early indicators, community signals
   - marketGap: What's missing in current market that this solves
   - executionPlan: Step-by-step roadmap with phases. Do NOT include time estimates or month ranges.

5. FRAMEWORK DATA:
   - valueEquation: dreamOutcome, perceivedLikelihood, timeDelay, effortSacrifice
   - marketMatrix: marketSize, painLevel, targetingEase, purchasingPower
   - acpFramework: avatar (detailed customer), catalyst (purchase trigger), promise (transformation)

6. TREND ANALYSIS: Current trends supporting this idea (2-3 paragraphs)

7. KEYWORD DATA: 3 categories with 5 keywords each
   - fastestGrowing: Keywords with high growth rates
   - highestVolume: Keywords with highest search volume
   - mostRelevant: Most relevant keywords for this solution

8. BUILDER PROMPTS: Ready-to-use prompts for 6 use cases
   - adCreatives: Prompt for creating ad creatives
   - brandPackage: Prompt for complete brand identity
   - landingPage: Prompt for building landing page
   - emailSequence: Prompt for email marketing sequence
   - socialMedia: Prompt for social media content strategy
   - productDemo: Prompt for building product demo/MVP (include ALL features you detected)

9. COMMUNITY SIGNALS: Object with reddit, facebook, youtube, other platforms (with subreddits/groups/channels counts, members, scores, details)

10. SIGNAL BADGES: Array of 2-5 relevant badges from: "Perfect Timing", "Unfair Advantage", "Organic Growth", "Proven Model", "Low Competition", "High Demand", "Strong Community", "Tech Tailwind", "Clear Monetization", "Massive Market", "10x Better"

Return as JSON with the same structure as the HTML analysis prompt. Extract all information from the document content provided.`;
  }

  /**
   * Validate and add defaults to generated idea
   */
  private validateAndDefaultIdea(generatedIdea: GeneratedIdea): GeneratedIdea {
    // Validate required fields
    if (!generatedIdea.title || !generatedIdea.description) {
      console.warn('[Idea Generation] Generated idea missing required fields, using defaults');
    }
    
    // Ensure all required fields have defaults
    return {
      ...generatedIdea,
      title: generatedIdea.title || 'Generated Solution',
      subtitle: generatedIdea.subtitle || generatedIdea.description?.substring(0, 100) || 'Solution',
      description: generatedIdea.description || 'A comprehensive solution',
      content: generatedIdea.content || generatedIdea.description || 'Detailed solution content',
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
  }

  async generateChatResponse(idea: any, userMessage: string, history: Array<{ role: string; content: string }>): Promise<string> {
    try {
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

      // Try OpenAI first
      try {
        const response = await this.callOpenAI(messages);
        return response;
      } catch (openAIError: any) {
        console.error('[AI Chat] OpenAI failed, trying Anthropic fallback:', openAIError?.message);
        
        // Fallback to Anthropic if OpenAI fails
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const anthropicResponse = await getAnthropic().messages.create({
              model: "claude-sonnet-4-20250514", // Use valid Claude model
              max_tokens: 4000,
              messages: [
                {
                  role: "user",
                  content: `You are an expert startup advisor and business consultant. You're helping entrepreneurs understand and evaluate the following startup idea:\n\n${context}\n\nProvide helpful, practical, and insightful answers to questions about this idea. Be concise but thorough. Focus on actionable advice.\n\nConversation history:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser question: ${userMessage}`
                }
              ]
            });
            
            const content = anthropicResponse.content[0];
            if (content.type === 'text') {
              return content.text;
            }
          } catch (anthropicError: any) {
            console.error('[AI Chat] Anthropic fallback also failed:', {
              message: anthropicError?.message,
              code: anthropicError?.code,
              status: anthropicError?.status,
              stack: anthropicError?.stack,
            });
            const combinedError = new Error(`Both OpenAI and Anthropic failed. OpenAI: ${openAIError?.message || 'Unknown error'}, Anthropic: ${anthropicError?.message || 'Unknown error'}`);
            (combinedError as any).originalOpenAIError = openAIError;
            (combinedError as any).originalAnthropicError = anthropicError;
            throw combinedError;
          }
        }
        
        // If no Anthropic fallback available, throw the original OpenAI error
        console.error('[AI Chat] No Anthropic fallback available, throwing OpenAI error');
        throw openAIError;
      }
    } catch (error: any) {
      console.error('[AI Chat] generateChatResponse error:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        type: error?.constructor?.name,
        stack: error?.stack,
      });
      // Re-throw with original error message preserved
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`AI Chat error: ${error?.toString() || 'Unknown error'}`);
    }
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

  // Deep Research with Claude Opus 4.5 and Extended Thinking
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
      console.log('Starting deep research with Claude Opus 4.5...');

      const response = await getAnthropic().messages.create({
        model: "claude-opus-4-6",
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
      model: "claude-opus-4-6",
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
      console.log('Starting rapid research with Claude Opus 4.5...');

      const response = await getAnthropic().messages.create({
        model: "claude-opus-4-6",
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
        model: "claude-opus-4-6",
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

  /**
   * Enrich a basic idea with comprehensive AI analysis, scores, and metrics
   * This is used for manual entry mode to ensure all ideas have comprehensive analysis
   */
  async enrichIdeaWithComprehensiveAnalysis(basicIdea: {
    title: string;
    description: string;
    content?: string;
    type?: string;
    market?: string;
    targetAudience?: string;
    keyword?: string;
  }, modelOverride?: string): Promise<Partial<GeneratedIdea>> {
    const prompt = `You are an elite startup advisor and business analyst. Analyze this startup idea and generate comprehensive metrics, scores, and detailed analysis sections.

STARTUP IDEA:
Title: ${basicIdea.title}
Description: ${basicIdea.description}
${basicIdea.content ? `Content: ${basicIdea.content}` : ''}
Type: ${basicIdea.type || 'web_app'}
Market: ${basicIdea.market || 'B2C'}
Target Audience: ${basicIdea.targetAudience || 'general users'}
${basicIdea.keyword ? `Keyword: ${basicIdea.keyword}` : ''}

Generate comprehensive analysis with ACCURATE, REALISTIC metrics and scores based on real market research. Be data-driven and specific.

Return as JSON with this EXACT structure:
{
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
  "revenuePotential": "Detailed explanation with realistic numbers (e.g., $500K-$2M ARR potential)",
  "revenuePotentialNum": 1250000,
  "executionDifficulty": "Detailed explanation of complexity",
  "gtmStrength": "Detailed explanation of go-to-market viability",
  "mainCompetitor": "Primary competitor name",
  "keyword": "primary SEO keyword",
  "keywordVolume": 50000,
  "keywordGrowth": 35,
  "offerTiers": {
    "leadMagnet": {"name": "Free resource name", "description": "What they get", "price": "$0"},
    "frontend": {"name": "Entry product", "description": "First paid offer", "price": "$47"},
    "core": {"name": "Main product", "description": "Core value", "price": "$497"},
    "backend": {"name": "Premium service", "description": "High-ticket", "price": "$2997"},
    "continuity": {"name": "Subscription", "description": "Recurring revenue", "price": "$97/mo"}
  },
  "whyNowAnalysis": "2-3 paragraph analysis of why this is the perfect time for this idea with specific market trends and catalysts",
  "proofSignals": "Evidence and signals showing market demand with specific examples, data points, and real-world indicators",
  "marketGap": "Detailed explanation of the gap in the market this fills with competitive analysis",
  "executionPlan": "Step-by-step execution roadmap with phases and milestones. Do NOT include time estimates, durations, or month ranges - just list the phases and what each phase delivers.",
  "frameworkData": {
    "valueEquation": {
      "dreamOutcome": "What customers ultimately want",
      "perceivedLikelihood": "Why they believe it will work",
      "timeDelay": "How quickly they get results",
      "effortSacrifice": "How easy it is to use"
    },
    "marketMatrix": {
      "marketSize": "Size and growth assessment with numbers",
      "painLevel": "Severity of problem with examples",
      "targetingEase": "How easy to reach with channels",
      "purchasingPower": "Ability and willingness to pay with data"
    },
    "acpFramework": {
      "avatar": "Detailed customer avatar",
      "catalyst": "What triggers the purchase",
      "promise": "Core transformation promise"
    }
  },
  "trendAnalysis": "Analysis of trends making this idea timely and relevant with specific trend data",
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
  "communitySignals": {
    "reddit": {"subreddits": 5, "members": "2.5M+", "score": 8, "details": "Strong community engagement across relevant subreddits"},
    "facebook": {"groups": 7, "members": "150K+", "score": 7, "details": "Active Facebook groups discussing this problem"},
    "youtube": {"channels": 14, "members": "1M+", "score": 7, "details": "Multiple YouTube channels covering this topic"},
    "other": {"segments": 4, "priorities": 3, "score": 8, "details": "Strong signals across forums, Discord, and Slack communities"}
  },
  "signalBadges": ["Perfect Timing", "Unfair Advantage", "Organic Growth"]
}

Be realistic, data-driven, and specific. Use actual market research insights. Scores should be based on real analysis, not generic values.`;

    try {
      console.log(`[Idea Enrichment] Enriching idea: ${basicIdea.title}`);
      
      // Use provided model override, or default to Sonnet for speed
      const model = modelOverride || "claude-sonnet-4-20250514";
      console.log(`[Idea Enrichment] Using model: ${model}`);
      
      const response = await getAnthropic().messages.create({
        model, // Use override if provided, otherwise default to Sonnet
        max_tokens: 16000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const textContent = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      if (!textContent) {
        throw new Error('No response from AI service');
      }

      // Parse JSON from response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;
      const enrichedData = JSON.parse(jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

      console.log(`[Idea Enrichment] Successfully enriched idea: ${basicIdea.title}`);
      return enrichedData;
    } catch (error) {
      console.error('Error enriching idea with AI:', error);
      // Return comprehensive defaults if enrichment fails - ensure all fields are present
      return {
        opportunityScore: 7,
        problemScore: 7,
        feasibilityScore: 6,
        timingScore: 7,
        executionScore: 6,
        gtmScore: 7,
        opportunityLabel: "Good Opportunity",
        problemLabel: "Clear Problem",
        feasibilityLabel: "Moderate Complexity",
        timingLabel: "Good Timing",
        revenuePotential: "Analysis pending - AI enrichment failed. Please retry or add details manually.",
        revenuePotentialNum: 1000000,
        executionDifficulty: "Medium complexity - analysis pending",
        gtmStrength: "Analysis pending - AI enrichment failed",
        mainCompetitor: "Analysis pending",
        keyword: basicIdea.keyword || "startup solution",
        keywordVolume: 0,
        keywordGrowth: 0,
        offerTiers: {
          leadMagnet: { name: "Free Resource", description: "Value-add resource to attract leads", price: "$0" },
          frontend: { name: "Entry Product", description: "Low-ticket entry point", price: "$47" },
          core: { name: "Core Product", description: "Main value proposition", price: "$497" },
          backend: { name: "Premium Service", description: "High-ticket premium offering", price: "$2997" },
          continuity: { name: "Subscription", description: "Recurring revenue stream", price: "$97/mo" }
        },
        whyNowAnalysis: "Analysis pending - AI enrichment encountered an error. Market timing analysis will be generated on retry.",
        proofSignals: "Analysis pending - AI enrichment encountered an error. Market signals will be analyzed on retry.",
        marketGap: "Analysis pending - AI enrichment encountered an error. Market gap analysis will be generated on retry.",
        executionPlan: "Analysis pending - AI enrichment encountered an error. Execution plan will be generated on retry.",
        frameworkData: {
          valueEquation: {
            dreamOutcome: "Analysis pending",
            perceivedLikelihood: "Analysis pending",
            timeDelay: "Analysis pending",
            effortSacrifice: "Analysis pending"
          },
          marketMatrix: {
            marketSize: "Analysis pending",
            painLevel: "Analysis pending",
            targetingEase: "Analysis pending",
            purchasingPower: "Analysis pending"
          },
          acpFramework: {
            avatar: "Analysis pending",
            catalyst: "Analysis pending",
            promise: "Analysis pending"
          }
        },
        trendAnalysis: "Analysis pending - AI enrichment encountered an error. Trend analysis will be generated on retry.",
        keywordData: {
          fastestGrowing: [],
          highestVolume: [],
          mostRelevant: []
        },
        communitySignals: {
          reddit: { subreddits: 0, members: "0", score: 0, details: "Analysis pending" },
          facebook: { groups: 0, members: "0", score: 0, details: "Analysis pending" },
          youtube: { channels: 0, members: "0", score: 0, details: "Analysis pending" },
          other: { segments: 0, priorities: 0, score: 0, details: "Analysis pending" }
        },
        signalBadges: []
      };
    }
  }

  /**
   * Generate collaboration insight - analyzes conversation and provides insights
   */
  async generateCollaborationInsight(
    ideaId: string,
    ideaTitle: string,
    conversationHistory: Array<{ userName: string; content: string; createdAt: Date }>
  ): Promise<string> {
    const prompt = `You are an AI collaboration assistant helping a team discuss and refine a startup idea.

IDEA: ${ideaTitle}
IDEA ID: ${ideaId}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.userName}: ${msg.content}`).join('\n\n')}

Analyze this conversation and provide a comprehensive insight that:
1. Summarizes key discussion points
2. Identifies areas of consensus or disagreement
3. Highlights important questions or concerns raised
4. Suggests next steps or action items
5. Provides strategic recommendations

Be concise but comprehensive. Format as a clear, actionable insight that helps move the conversation forward.`;

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('Empty response from AI');
      }
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error: any) {
      console.error('Error generating collaboration insight:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error?.stack,
        status: error?.status,
        statusText: error?.statusText,
      });
      throw new Error(`Failed to generate collaboration insight: ${errorMessage}`);
    }
  }

  /**
   * Generate message analysis - analyzes a specific message and provides insights
   */
  async generateMessageAnalysis(
    ideaId: string,
    ideaTitle: string,
    messageId: string | undefined,
    messageContent: string | undefined,
    question: string,
    context: Array<{ id: string; userName: string; content: string; createdAt: Date }>
  ): Promise<string> {
    const prompt = `You are an AI collaboration assistant helping a team discuss and refine a startup idea.

IDEA: ${ideaTitle}
IDEA ID: ${ideaId}

${messageId && messageContent ? `MESSAGE BEING ANALYZED:
${messageContent}

` : ''}CONVERSATION CONTEXT:
${context.map(msg => `${msg.userName}: ${msg.content}`).join('\n\n')}

USER QUESTION: ${question}

Provide a thoughtful, helpful response that addresses the user's question. If a specific message is being analyzed, reference it directly. Use the conversation context to provide relevant insights.`;

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Error generating message analysis:', error);
      throw new Error('Failed to generate message analysis');
    }
  }

  /**
   * Generate synthesize response - synthesizes conversation with state management
   */
  async generateSynthesizeResponse(
    ideaId: string,
    idea: any,
    allContext: Array<{ id: string; userName: string; content: string; createdAt: Date }>,
    synthesizeState: 'analyzing' | 'synthesizing' | 'critiquing',
    synthesizeData: any,
    question: string
  ): Promise<{ response: string; nextState: string; data: any }> {
    const statePrompts: Record<string, string> = {
      analyzing: `Analyze the following message and conversation. Provide detailed insights, identify key points, and highlight important considerations.`,
      synthesizing: `Synthesize the key points from this entire conversation. Identify themes, consensus points, disagreements, and actionable takeaways.`,
      critiquing: `Critique the following message and conversation. Provide constructive feedback, identify potential issues, and suggest improvements.`
    };

    const prompt = `You are an AI collaboration assistant helping a team discuss and refine a startup idea.

IDEA: ${idea.title}
IDEA ID: ${ideaId}

CONVERSATION:
${allContext.map(msg => `${msg.userName}: ${msg.content}`).join('\n\n')}

${statePrompts[synthesizeState] || statePrompts.synthesizing}

USER REQUEST: ${question}

Provide a comprehensive response that addresses the request and helps move the conversation forward.`;

    try {
      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        response: responseText,
        nextState: 'idle',
        data: {}
      };
    } catch (error) {
      console.error('Error generating synthesize response:', error);
      throw new Error('Failed to generate synthesize response');
    }
  }

  // ── Landing Page Prompt Pipeline ──────────────────────────────────

  /**
   * Step 1: Assemble all available idea fields into structured markdown.
   * Sections with missing data are gracefully omitted.
   */
  buildRawBusinessContext(idea: any): string {
    const s = (val: any) => (val != null && val !== '' ? String(val) : null);
    const sections: string[] = [];

    // Idea Overview
    const overviewLines: string[] = [];
    if (s(idea.title)) overviewLines.push(`- Product: ${idea.title}${idea.subtitle ? ' — ' + idea.subtitle : ''}`);
    if (s(idea.type) || s(idea.market)) overviewLines.push(`- Type: ${idea.type || 'N/A'} | Market: ${idea.market || 'N/A'}`);
    if (s(idea.description)) overviewLines.push(`- Summary: ${idea.description}`);
    if (s(idea.whyNowAnalysis)) overviewLines.push(`- Why Now: ${idea.whyNowAnalysis}`);
    if (s(idea.trendAnalysis)) overviewLines.push(`- Trend Context: ${idea.trendAnalysis}`);
    if (overviewLines.length) sections.push(`## Idea Overview\n${overviewLines.join('\n')}`);

    // Target Audience & Personas
    const audienceLines: string[] = [];
    if (s(idea.targetAudience)) audienceLines.push(`- Audience: ${idea.targetAudience}`);
    if (s(idea.market)) audienceLines.push(`- Market Segment: ${idea.market}`);
    const acp = idea.frameworkData?.acpFramework;
    if (acp) {
      if (s(acp.avatar)) audienceLines.push(`- Avatar: ${acp.avatar}`);
      if (s(acp.catalyst)) audienceLines.push(`- Catalyst: ${acp.catalyst}`);
      if (s(acp.promise)) audienceLines.push(`- Promise: ${acp.promise}`);
    }
    if (audienceLines.length) sections.push(`## Target Audience & Personas\n${audienceLines.join('\n')}`);

    // Market Analysis
    const marketLines: string[] = [];
    if (idea.opportunityScore != null) marketLines.push(`- Opportunity: ${idea.opportunityScore}/10${idea.opportunityLabel ? ' — ' + idea.opportunityLabel : ''}`);
    if (idea.problemScore != null) marketLines.push(`- Problem Severity: ${idea.problemScore}/10${idea.problemLabel ? ' — ' + idea.problemLabel : ''}`);
    if (s(idea.marketGap)) marketLines.push(`- Market Gap: ${idea.marketGap}`);
    if (s(idea.mainCompetitor)) marketLines.push(`- Main Competitor: ${idea.mainCompetitor}`);
    if (s(idea.proofSignals)) marketLines.push(`- Proof Signals: ${idea.proofSignals}`);
    if (s(idea.keyword)) {
      let kwLine = `- Primary Keyword: ${idea.keyword}`;
      if (idea.keywordVolume != null) kwLine += ` (${idea.keywordVolume} searches/mo`;
      if (idea.keywordGrowth != null) kwLine += `, ${idea.keywordGrowth}% growth`;
      if (idea.keywordVolume != null) kwLine += ')';
      marketLines.push(kwLine);
    }
    if (idea.keywordData) {
      const kd = idea.keywordData;
      const kwDataParts: string[] = [];
      if (kd.mostRelevant?.length) kwDataParts.push(`Most Relevant: ${kd.mostRelevant.map((k: any) => k.keyword).join(', ')}`);
      if (kd.highestVolume?.length) kwDataParts.push(`Highest Volume: ${kd.highestVolume.map((k: any) => k.keyword).join(', ')}`);
      if (kd.fastestGrowing?.length) kwDataParts.push(`Fastest Growing: ${kd.fastestGrowing.map((k: any) => k.keyword).join(', ')}`);
      if (kwDataParts.length) marketLines.push(`- Keyword Data: ${kwDataParts.join(' | ')}`);
    }
    if (idea.signalBadges?.length) marketLines.push(`- Validation Badges: ${idea.signalBadges.join(', ')}`);
    if (marketLines.length) sections.push(`## Market Analysis\n${marketLines.join('\n')}`);

    // Go-to-Market
    const gtmLines: string[] = [];
    if (s(idea.gtmStrength)) gtmLines.push(`- GTM Strength: ${idea.gtmStrength}${idea.gtmScore != null ? ' (Score: ' + idea.gtmScore + '/10)' : ''}`);
    if (s(idea.executionPlan)) gtmLines.push(`- Execution Plan: ${idea.executionPlan}`);
    if (gtmLines.length) sections.push(`## Go-to-Market\n${gtmLines.join('\n')}`);

    // Business Model & Pricing
    const bizLines: string[] = [];
    if (s(idea.revenuePotential)) bizLines.push(`- Revenue Potential: ${idea.revenuePotential}`);
    const tiers = idea.offerTiers;
    if (tiers) {
      const tierNames = ['leadMagnet', 'frontend', 'core', 'backend', 'continuity'] as const;
      const tierLabels: Record<string, string> = { leadMagnet: 'Lead Magnet', frontend: 'Frontend Offer', core: 'Core Offer', backend: 'Backend Offer', continuity: 'Continuity' };
      for (const t of tierNames) {
        const tier = tiers[t];
        if (tier && (s(tier.name) || s(tier.description))) {
          bizLines.push(`- ${tierLabels[t]}: ${tier.name || 'N/A'} (${tier.price || 'N/A'}) — ${tier.description || ''}`);
        }
      }
    }
    const ve = idea.frameworkData?.valueEquation;
    if (ve) {
      const veParts: string[] = [];
      if (s(ve.dreamOutcome)) veParts.push(`Dream Outcome: ${ve.dreamOutcome}`);
      if (s(ve.effortSacrifice)) veParts.push(`Effort/Sacrifice: ${ve.effortSacrifice}`);
      if (s(ve.timeDelay)) veParts.push(`Time Delay: ${ve.timeDelay}`);
      if (s(ve.perceivedLikelihood)) veParts.push(`Perceived Likelihood: ${ve.perceivedLikelihood}`);
      if (veParts.length) bizLines.push(`- Value Equation: ${veParts.join(' | ')}`);
    }
    if (bizLines.length) sections.push(`## Business Model & Pricing\n${bizLines.join('\n')}`);

    // Constraints & Feasibility
    const feasLines: string[] = [];
    if (s(idea.executionDifficulty)) feasLines.push(`- Execution Difficulty: ${idea.executionDifficulty}`);
    if (idea.feasibilityScore != null) feasLines.push(`- Feasibility: ${idea.feasibilityScore}/10${idea.feasibilityLabel ? ' — ' + idea.feasibilityLabel : ''}`);
    if (idea.timingScore != null) feasLines.push(`- Timing: ${idea.timingScore}/10${idea.timingLabel ? ' — ' + idea.timingLabel : ''}`);
    if (feasLines.length) sections.push(`## Constraints & Feasibility\n${feasLines.join('\n')}`);

    // Full content analysis (the 3000+ word deep analysis)
    if (s(idea.content)) {
      sections.push(`## Detailed Analysis\n${idea.content}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Step 2: Send the raw assembled data to Claude to synthesize a rich BUSINESS_CONTEXT.
   */
  async enrichBusinessContext(rawContext: string): Promise<string> {
    const client = getAnthropic();

    console.log('[LandingPagePrompt] Enriching business context via Claude...');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: `You are a business analyst. Given the raw data below about a startup/product idea, synthesize it into a comprehensive, structured BUSINESS_CONTEXT document.

Your output must be a single markdown block with these exact sections (fill every section — infer from the available data where gaps exist):

## PRODUCT
- Name, tagline, one-sentence value proposition

## TARGET AUDIENCE
- Primary persona (demographics, psychographics, job title, pain intensity)
- Secondary persona (if applicable)

## PROBLEM & PAIN POINTS
- Core problem (1 sentence)
- 3-5 specific pain points the audience experiences daily

## SOLUTION & KEY FEATURES
- How the product solves the problem
- 3-5 headline features with one-line descriptions

## UNIQUE VALUE PROPOSITION
- What makes this different from alternatives
- Key differentiator

## MARKET CONTEXT
- Market size / opportunity
- Competitive landscape (main competitor, gaps)
- Why now (timing, trends)

## SOCIAL PROOF & CREDIBILITY
- Available proof signals, validation badges, trend data
- Suggested proof points if data is limited

## PRICING & OFFER STRUCTURE
- Pricing tiers (if available)
- Lead magnet / free offer
- Core offer and upsell path

## DESIRED USER ACTION
- Primary CTA
- What happens after they click

Be specific and concrete — use real data from the input. Never use generic filler. If a field is missing, infer a reasonable answer from context and mark it as inferred.`,
      messages: [
        {
          role: 'user',
          content: rawContext,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('[LandingPagePrompt] Business context enriched successfully');
    return text;
  }

  /**
   * Step 3: Assemble the complete landing page prompt by injecting enriched BUSINESS_CONTEXT into the template.
   */
  async assembleLandingPagePrompt(idea: any): Promise<string> {
    // Step 1: Build raw context from all idea fields
    const rawContext = this.buildRawBusinessContext(idea);

    // Step 2: Enrich via AI
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    // Step 3: Inject into template
    const prompt = LANDING_PAGE_PROMPT_TEMPLATE.replace('{{BUSINESS_CONTEXT}}', enrichedContext);

    return prompt;
  }

  // ── Storytelling Narrative Generation ──────────────────────────────────

  /**
   * Generate a compelling 3-5 paragraph storytelling narrative for an idea.
   * Uses psychological persuasion principles to explain WHY the app matters.
   */
  async generateStorytellingNarrative(idea: any): Promise<string> {
    const businessContext = this.buildRawBusinessContext(idea);
    const productName = idea.title || 'this product';

    const systemPrompt = `You are a world-class storytelling copywriter who writes compelling narratives about software product opportunities. Your writing uses psychological persuasion principles to make readers feel the urgency and importance of building a product.

PRINCIPLES TO WEAVE IN:
- Loss aversion: What are people losing RIGHT NOW by not having this solution?
- Social proof: Who else is already moving in this direction? What trends confirm demand?
- Identity/aspiration: What kind of person builds this? What does it say about them?
- Urgency: Why is NOW the perfect window? What's changing in the market?
- Specificity: Use concrete numbers, scenarios, and details — never vague claims.
- Emotional hooks: Open with a vivid frustration or scenario the reader can feel.

WRITING RULES:
- Write 3-5 paragraphs of pure prose. NO markdown headers, bullets, bold, or formatting.
- 350-500 words total, 8th-grade reading level, no jargon.
- Open with a vivid scenario or frustration, build tension, then reveal the opportunity.
- Always refer to the product by its name "${productName}" — never say "this app" or "this product" generically.
- End with a forward-looking statement about the builder's opportunity.
- Write in present tense. Be direct and confident, not salesy or hyperbolic.`;

    const userPrompt = `Write a storytelling narrative for the following product opportunity. This narrative will appear on the product's detail page to persuade potential builders to take action.

${businessContext}

Write the narrative now. Remember: pure prose paragraphs only, 350-500 words, use "${productName}" by name.`;

    try {
      console.log(`[StorytellingNarrative] Generating for idea: ${idea.title} (${idea.id})`);

      const response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('Empty response from AI');
      }

      const narrative = response.content[0].type === 'text' ? response.content[0].text : '';
      console.log(`[StorytellingNarrative] Generated ${narrative.length} chars for idea ${idea.id}`);
      return narrative;
    } catch (error: any) {
      console.error('[StorytellingNarrative] Error generating narrative:', error);
      throw new Error(`Failed to generate storytelling narrative: ${error?.message || 'Unknown error'}`);
    }
  }

  // ── Brand Package Prompt Pipeline ──────────────────────────────────

  /**
   * Build a structured JSON-like spec from the idea's database fields
   * for injection into the brand package prompt as APP_SPEC_JSON.
   */
  buildAppSpecJson(idea: any): string {
    const spec: any = {};

    if (idea.title) spec.name = idea.title;
    if (idea.subtitle) spec.tagline = idea.subtitle;
    if (idea.description) spec.description = idea.description;
    if (idea.type) spec.type = idea.type;
    if (idea.market) spec.market = idea.market;
    if (idea.targetAudience) spec.target_audience = idea.targetAudience;
    if (idea.revenuePotential) spec.revenue_potential = idea.revenuePotential;
    if (idea.executionDifficulty) spec.execution_difficulty = idea.executionDifficulty;
    if (idea.mainCompetitor) spec.main_competitor = idea.mainCompetitor;
    if (idea.marketGap) spec.market_gap = idea.marketGap;
    if (idea.keyword) spec.primary_keyword = idea.keyword;
    if (idea.gtmStrength) spec.gtm_strength = idea.gtmStrength;

    if (idea.opportunityScore != null) spec.opportunity_score = idea.opportunityScore;
    if (idea.problemScore != null) spec.problem_score = idea.problemScore;
    if (idea.feasibilityScore != null) spec.feasibility_score = idea.feasibilityScore;
    if (idea.timingScore != null) spec.timing_score = idea.timingScore;

    if (idea.offerTiers) {
      spec.offer_tiers = {};
      const tierNames = ['leadMagnet', 'frontend', 'core', 'backend', 'continuity'] as const;
      for (const t of tierNames) {
        const tier = idea.offerTiers[t];
        if (tier && (tier.name || tier.description)) {
          spec.offer_tiers[t] = { name: tier.name, price: tier.price, description: tier.description };
        }
      }
    }

    if (idea.frameworkData?.acpFramework) {
      spec.acp_framework = idea.frameworkData.acpFramework;
    }
    if (idea.frameworkData?.valueEquation) {
      spec.value_equation = idea.frameworkData.valueEquation;
    }
    if (idea.frameworkData?.marketMatrix) {
      spec.market_matrix = idea.frameworkData.marketMatrix;
    }

    if (idea.proofSignals) spec.proof_signals = idea.proofSignals;
    if (idea.signalBadges?.length) spec.signal_badges = idea.signalBadges;
    if (idea.whyNowAnalysis) spec.why_now = idea.whyNowAnalysis;
    if (idea.executionPlan) spec.execution_plan = idea.executionPlan;

    if (idea.keywordData) {
      spec.keyword_data = {};
      if (idea.keywordData.mostRelevant?.length) spec.keyword_data.most_relevant = idea.keywordData.mostRelevant;
      if (idea.keywordData.highestVolume?.length) spec.keyword_data.highest_volume = idea.keywordData.highestVolume;
      if (idea.keywordData.fastestGrowing?.length) spec.keyword_data.fastest_growing = idea.keywordData.fastestGrowing;
    }

    return JSON.stringify(spec, null, 2);
  }

  /**
   * Assemble the complete brand package prompt by injecting idea data into all placeholders.
   */
  async assembleBrandPackagePrompt(idea: any): Promise<string> {
    // Build the structured app spec
    const appSpecJson = this.buildAppSpecJson(idea);

    // Build the enriched product context
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    // Inject into template
    let prompt = BRAND_PACKAGE_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{APP_SELECTED}}', idea.title + (idea.subtitle ? ' — ' + idea.subtitle : ''));
    prompt = prompt.replace('{{APP_SPEC_JSON}}', appSpecJson);
    prompt = prompt.replace('{{APP_TASK_PROMPT_TEXT}}', idea.content || '(No task prompt provided)');
    prompt = prompt.replace('{{PRODUCT_CONTEXT_TEXT}}', enrichedContext);

    return prompt;
  }

  // ── Ad Creatives Prompt Pipeline ──────────────────────────────────

  /**
   * Assemble the ad creatives prompt by injecting enriched BUSINESS_CONTEXT.
   */
  async assembleAdCreativesPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    return AD_CREATIVES_PROMPT_TEMPLATE.replace('{{BUSINESS_CONTEXT_TEXT}}', enrichedContext);
  }

  // ── Content Calendar Prompt Pipeline ──────────────────────────────

  /**
   * Assemble the content calendar prompt by injecting enriched BUSINESS_CONTEXT.
   */
  async assembleContentCalendarPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = CONTENT_CALENDAR_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{BUSINESS_CONTEXT_TEXT}}', enrichedContext);
    prompt = prompt.replace('{{EXISTING_ASSETS_TEXT}}', '(None provided — infer from product context)');
    prompt = prompt.replace('{{TEAM_RESOURCES_TEXT}}', '(Not specified — assume lean startup team of 1-3 content creators)');
    prompt = prompt.replace('{{PRIMARY_CONVERSION_GOAL}}', idea.offerTiers?.leadMagnet?.name
      ? `Download ${idea.offerTiers.leadMagnet.name}`
      : 'Book a demo');

    return prompt;
  }

  // ── Email Funnel System Prompt Pipeline ────────────────────────────

  /**
   * Assemble the email funnel system prompt by injecting enriched BUSINESS_CONTEXT.
   */
  async assembleEmailFunnelPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = EMAIL_FUNNEL_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{BUSINESS_CONTEXT_TEXT}}', enrichedContext);
    prompt = prompt.replace('{{BRAND_VOICE_TEXT}}', '(Not specified — infer professional, value-first tone from product context)');
    prompt = prompt.replace('{{PRIMARY_CONVERSION_GOAL}}', idea.offerTiers?.core?.name
      ? `Purchase ${idea.offerTiers.core.name}`
      : idea.offerTiers?.leadMagnet?.name
        ? `Download ${idea.offerTiers.leadMagnet.name}`
        : 'Book a demo');

    return prompt;
  }

  async assembleEmailNurturePrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = EMAIL_NURTURE_PROMPT_TEMPLATE;
    prompt = prompt.replace('<<APP_CONTEXT>>', enrichedContext);

    return prompt;
  }

  async assembleUserPersonasPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = USER_PERSONAS_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{APP_SELECTED}}', idea.title || '');
    prompt = prompt.replace('{{BRAND_VOICE}}', '(Not specified — infer from product context)');
    prompt = prompt.replace('{{BUSINESS_CONTEXT}}', enrichedContext);
    prompt = prompt.replace('{{DEPTH}}', 'deep');

    return prompt;
  }

  async assembleTweetLandingPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    const appJson = JSON.stringify({
      app_name: idea.title || '',
      subtitle: idea.subtitle || '',
      type: idea.type || '',
      market: idea.market || '',
      target_audience: idea.targetAudience || '',
      description: idea.description || '',
      lead_magnet: idea.offerTiers?.leadMagnet || null,
      value_proposition: idea.frameworkData?.acpFramework?.promise || '',
      avatar: idea.frameworkData?.acpFramework?.avatar || '',
      catalyst: idea.frameworkData?.acpFramework?.catalyst || '',
      keyword: idea.keyword || '',
    }, null, 2);

    let prompt = TWEET_LANDING_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{APP_JSON}}', appJson);
    prompt = prompt.replace('{{BUSINESS_CONTEXT}}', enrichedContext);
    prompt = prompt.replace('{tslp_max_chars}', '280');

    return prompt;
  }

  async assembleSeoContentPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = SEO_CONTENT_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{APP_BRIEF}}', enrichedContext);

    return prompt;
  }

  async assembleSalesFunnelPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = SALES_FUNNEL_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{BUSINESS_CONTEXT}}', enrichedContext);

    return prompt;
  }

  async assembleLeadMagnetPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    const appMeta = JSON.stringify({
      app_name: idea.title || '',
      app_category: idea.type || '',
      target_market: idea.market || '',
      target_audience: idea.targetAudience || '',
      subtitle: idea.subtitle || '',
    }, null, 2);

    let prompt = LEAD_MAGNET_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{APP_META_JSON}}', appMeta);
    prompt = prompt.replace('{{APP_PROMPT_TEXT}}', idea.content || idea.description || '');
    prompt = prompt.replace('{{BUSINESS_CONTEXT_TEXT}}', enrichedContext);
    prompt = prompt.replace('{{BRAND_VOICE_TEXT}}', '(Not specified — infer professional, value-first tone from product context)');
    prompt = prompt.replace('{{CONSTRAINTS_TEXT}}', '(None specified)');

    return prompt;
  }

  async assembleFeatureSpecsPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = FEATURE_SPECS_PROMPT_TEMPLATE;
    // APP PROFILE replacements from idea data
    prompt = prompt.replace('{{app_name}}', idea.title || '');
    prompt = prompt.replace('{{app_one_liner}}', idea.subtitle || idea.description?.slice(0, 120) || '');
    prompt = prompt.replace('{{target_users}}', idea.targetAudience || '');
    prompt = prompt.replace('{{value_prop}}', idea.frameworkData?.acpFramework?.promise || idea.description || '');
    prompt = prompt.replace('{{integrations}}', '(Infer from business context)');
    prompt = prompt.replace('{{constraints}}', idea.executionDifficulty ? `Execution difficulty: ${idea.executionDifficulty}` : '(Infer from business context)');
    prompt = prompt.replace('{{mvp_scope}}', '(Infer from business context — focus on core product)');
    prompt = prompt.replace('{{differentiation}}', idea.marketGap || '(Infer from business context)');
    // FEATURE REQUEST — default to the core product itself
    prompt = prompt.replace('{{feature_name}}', `Core ${idea.title} Platform`);
    prompt = prompt.replace('{{feature_category}}', 'Core');
    prompt = prompt.replace('{{priority_level}}', 'Must-Have');
    prompt = prompt.replace('{{target_release}}', 'MVP / v1.0');
    prompt = prompt.replace('{{feature_goal}}', idea.frameworkData?.valueEquation?.dreamOutcome || 'Deliver core value proposition to target users');
    prompt = prompt.replace('{{primary_workflow}}', 'Primary user journey');
    prompt = prompt.replace('{{platforms}}', 'web');
    prompt = prompt.replace('{{out_of_scope}}', 'Admin dashboard, billing integrations, third-party API integrations (unless specified in context)');
    // Business context
    prompt = prompt.replace('{{business_context}}', enrichedContext);

    return prompt;
  }

  async assembleMvpRoadmapPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = MVP_ROADMAP_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{app_name}}', idea.title || '');
    prompt = prompt.replace('{{product_type}}', idea.type || '(Infer from business context)');
    prompt = prompt.replace('{{target_users}}', idea.targetAudience || '');
    prompt = prompt.replace('{{pain}}', idea.frameworkData?.acpFramework?.catalyst || idea.description || '');
    prompt = prompt.replace('{{core_promise}}', idea.frameworkData?.acpFramework?.promise || idea.subtitle || '');
    prompt = prompt.replace('{{differentiator}}', idea.marketGap || '(Infer from business context)');
    prompt = prompt.replace('{{pricing}}', idea.offerTiers ? JSON.stringify(idea.offerTiers, null, 2) : '(Infer from business context)');
    prompt = prompt.replace('{{integrations}}', '(Infer from business context)');
    prompt = prompt.replace('{{compliance}}', '(Infer from business context based on product type and market)');
    prompt = prompt.replace('{{team_size_and_roles}}', '(Assume small startup team: 1 full-stack dev, 1 designer, 1 product/founder)');
    prompt = prompt.replace('{{budget_range}}', '(Assume bootstrapped / lean — under $50K for MVP)');
    prompt = prompt.replace('{{platform_constraints}}', 'web');
    prompt = prompt.replace('{{what_counts_as_launch}}', 'Public availability with core value proposition functional, onboarding flow complete, and payment processing live');
    prompt = prompt.replace('{{business_context}}', enrichedContext);

    return prompt;
  }

  async assembleGtmStrategyPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = GTM_STRATEGY_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{app_name}}', idea.title || '');
    prompt = prompt.replace('{{category}}', idea.type || '(Infer from business context)');
    prompt = prompt.replace('{{buyer_title_and_role}}', idea.targetAudience || '(Infer from business context)');
    prompt = prompt.replace('{{user_role}}', '(Infer from business context — may be same as buyer)');
    prompt = prompt.replace('{{industry_company_size_geography_tech_stack}}', '(Infer from business context)');
    prompt = prompt.replace('{{primary_pain}}', idea.frameworkData?.acpFramework?.catalyst || idea.description || '');
    prompt = prompt.replace('{{core_promise}}', idea.frameworkData?.acpFramework?.promise || idea.subtitle || '');
    prompt = prompt.replace('{{differentiator}}', idea.marketGap || '(Infer from business context)');
    prompt = prompt.replace('{{pricing}}', idea.offerTiers ? JSON.stringify(idea.offerTiers, null, 2) : '(Infer from business context)');
    prompt = prompt.replace('{{sales_motion_preference_or_unknown}}', '(Unknown — recommend based on pricing + complexity)');
    prompt = prompt.replace('{{integrations}}', '(Infer from business context)');
    prompt = prompt.replace('{{compliance}}', '(Infer from business context based on product type and market)');
    prompt = prompt.replace('{{team_and_time}}', '(Assume small startup team: 1-2 founders, 90-day window)');
    prompt = prompt.replace('{{gtm_budget_range}}', '(Assume bootstrapped / lean — under $50K for 90-day GTM)');
    prompt = prompt.replace('{{constraints}}', idea.executionDifficulty ? `Execution difficulty: ${idea.executionDifficulty}` : '(Infer from business context)');
    prompt = prompt.replace('{{business_context}}', enrichedContext);

    return prompt;
  }

  async assembleKpiDashboardPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = KPI_DASHBOARD_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{business_name}}', idea.title || '');
    prompt = prompt.replace('{{app_name}}', idea.title || '');
    prompt = prompt.replace('{{business_model}}', idea.type || '(Infer from business context)');
    prompt = prompt.replace('{{stage}}', '(Infer from business context — assume MVP/Pre-launch if unclear)');
    prompt = prompt.replace('{{revenue_model}}', idea.offerTiers ? 'Subscription' : '(Infer from business context)');
    prompt = prompt.replace('{{industry}}', idea.market || '(Infer from business context)');
    prompt = prompt.replace('{{geo_market}}', '(Infer from business context)');
    prompt = prompt.replace('{{pricing}}', idea.offerTiers ? JSON.stringify(idea.offerTiers, null, 2) : '(Infer from business context)');
    prompt = prompt.replace('{{personas}}', idea.targetAudience || '(Infer from business context)');
    prompt = prompt.replace('{{monthly_revenue}}', '(Pre-launch — $0)');
    prompt = prompt.replace('{{customer_count}}', '(Pre-launch — 0)');
    prompt = prompt.replace('{{active_users}}', '(Pre-launch — 0)');
    prompt = prompt.replace('{{team_size}}', '(Assume small startup team: 1-3 people)');
    prompt = prompt.replace('{{funding_stage}}', '(Assume bootstrapped / pre-seed)');
    prompt = prompt.replace('{{primary_objective}}', idea.frameworkData?.acpFramework?.promise || 'Launch MVP and acquire first paying customers');
    prompt = prompt.replace('{{twelve_month_target}}', '(Infer from business context and market size)');
    prompt = prompt.replace('{{key_milestones}}', '(Infer from business context)');
    prompt = prompt.replace('{{success_definition}}', idea.frameworkData?.valueEquation?.dreamOutcome || '(Infer from business context)');
    prompt = prompt.replace('{{current_tools}}', '(Assume standard startup stack: Google Analytics, Stripe, basic CRM)');
    prompt = prompt.replace('{{data_sources}}', '(Infer from business context and product type)');
    prompt = prompt.replace('{{reporting_frequency}}', 'Weekly with daily spot-checks');
    prompt = prompt.replace('{{team_access}}', '(Assume all team members have full access at this stage)');
    prompt = prompt.replace('{{business_context}}', enrichedContext);

    return prompt;
  }

  async assemblePricingStrategyPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = PRICING_STRATEGY_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{BUSINESS_CONTEXT}}', enrichedContext);
    return prompt;
  }

  async assembleCompetitiveAnalysisPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = COMPETITIVE_ANALYSIS_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{SELECTED_APP_CONTEXT}}', enrichedContext);
    prompt = prompt.replace('{{OPTIONAL_SYSTEM_CONSTRAINTS}}', '(No additional constraints specified — infer from business context)');
    return prompt;
  }

  async assembleCustomerInterviewGuidePrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = CUSTOMER_INTERVIEW_GUIDE_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{primary_question}}', `How do ${idea.targetAudience || 'target users'} currently solve ${idea.frameworkData?.acpFramework?.catalyst || 'the core problem'}, and what would make them switch?`);
    prompt = prompt.replace('{{stage}}', 'Problem validation');
    prompt = prompt.replace('{{hypothesis}}', idea.frameworkData?.acpFramework?.promise || idea.subtitle || '(Infer from business context)');
    prompt = prompt.replace('{{success_criteria}}', '(Infer from business context — look for pain severity, frequency, and willingness to pay)');
    prompt = prompt.replace('{{timeline}}', '2-4 weeks');
    prompt = prompt.replace('{{primary_segment}}', idea.targetAudience || '(Infer from business context)');
    prompt = prompt.replace('{{secondary_segments}}', '(Infer from business context)');
    prompt = prompt.replace('{{participant_criteria}}', '(Infer from business context — people who actively experience the problem)');
    prompt = prompt.replace('{{interview_count}}', '8-12 interviews');
    prompt = prompt.replace('{{recruitment_method}}', '(LinkedIn outreach, community forums, existing network)');
    prompt = prompt.replace('{{product_service}}', idea.title || '');
    prompt = prompt.replace('{{problem_being_solved}}', idea.frameworkData?.acpFramework?.catalyst || idea.description || '');
    prompt = prompt.replace('{{current_solution}}', '(Infer from business context — existing tools and workarounds)');
    prompt = prompt.replace('{{business_model}}', idea.type || '(Infer from business context)');
    prompt = prompt.replace('{{competitive_landscape}}', idea.marketGap || '(Infer from business context)');
    prompt = prompt.replace('{{interview_length}}', '45');
    prompt = prompt.replace('{{interview_format}}', 'Video call (Zoom/Google Meet)');
    prompt = prompt.replace('{{recording_preference}}', 'Audio + video with consent');
    prompt = prompt.replace('{{incentive}}', '$50 gift card or equivalent');
    prompt = prompt.replace('{{follow_up_plans}}', 'Beta invite + follow-up survey after MVP');
    prompt = prompt.replace('{{business_context}}', enrichedContext);

    return prompt;
  }

  async assembleDistributionChannelsPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = DISTRIBUTION_CHANNELS_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{BUSINESS_CONTEXT}}', enrichedContext);
    prompt = prompt.replace('{{APP_NAME}}', idea.title || '');
    prompt = prompt.replace('{{TARGET_AUDIENCE}}', idea.targetAudience || '(Infer from business context)');
    prompt = prompt.replace('{{MARKET}}', idea.market || '(Infer from business context)');
    return prompt;
  }

  async assembleGtmLaunchCalendarPrompt(idea: any): Promise<string> {
    const rawContext = this.buildRawBusinessContext(idea);
    const enrichedContext = await this.enrichBusinessContext(rawContext);

    let prompt = GTM_LAUNCH_CALENDAR_PROMPT_TEMPLATE;
    prompt = prompt.replace('{{SELECTED_APP_CONTEXT}}', enrichedContext);
    prompt = prompt.replace('{{OPTIONAL_SYSTEM_CONSTRAINTS}}', '(No additional constraints specified — infer from business context)');
    return prompt;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // APP BUILDER PROMPTS - Generate DOCX with chunked prompts for no-code builders
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Research similar apps using web search to inform UI/UX and feature recommendations
   */
  async researchSimilarApps(idea: any): Promise<string> {
    console.log('[App Builder Prompts] Researching similar apps for:', idea.title);

    try {
      // Use Claude to search and synthesize information about similar apps
      const anthropicClient = getAnthropic();

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are a product researcher. Research and describe similar apps/solutions to the following idea:

Title: ${idea.title}
Description: ${idea.description || ''}
Market: ${idea.market || ''}
Target Audience: ${idea.targetAudience || ''}
Type: ${idea.type || ''}

Provide a concise research summary including:
1. 2-3 similar existing apps/tools (if any exist)
2. Common UI/UX patterns used in this space
3. Key features that successful apps in this space typically have
4. Technology stack recommendations based on the app type
5. Potential differentiators for this new app

Keep the response focused and actionable - this will inform the implementation prompts.`
          }
        ],
      });

      const textContent = response.content.find(c => c.type === 'text');
      return textContent?.text || 'No research data available.';
    } catch (error: any) {
      console.error('[App Builder Prompts] Research error:', error.message);
      return 'Research unavailable - proceeding with idea context only.';
    }
  }

  /**
   * Analyze the idea complexity to determine optimal prompt count (3-8)
   */
  async analyzeAppComplexity(idea: any, researchContext: string): Promise<{ promptCount: number; phases: string[] }> {
    console.log('[App Builder Prompts] Analyzing complexity for:', idea.title);

    try {
      const anthropicClient = getAnthropic();

      const response = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Analyze this app idea and determine the optimal number of implementation phases/prompts needed.

App Idea:
- Title: ${idea.title}
- Description: ${idea.description || ''}
- Market: ${idea.market || ''}
- Target Audience: ${idea.targetAudience || ''}
- Type: ${idea.type || ''}
- Content/Details: ${idea.content || ''}

Research Context:
${researchContext}

Based on the complexity, determine:
1. How many prompts are TRULY needed - be honest about complexity. Don't default to any number.
2. What each phase should focus on

Return ONLY a JSON object in this exact format:
{
  "promptCount": <integer - use exactly what's needed, minimum 3>,
  "phases": [
    "Phase 1: <name and brief focus>",
    "Phase 2: <name and brief focus>",
    ...
  ]
}

IMPORTANT: Analyze the ACTUAL complexity. Consider:
- Number of distinct features/modules
- Database complexity (tables, relationships)
- User roles and permissions
- Third-party integrations
- UI complexity (pages, components)
- Business logic complexity

A simple landing page might need 3-4 prompts.
A full SaaS with multiple user types, complex workflows, admin panels, integrations, and reporting might need 15+ prompts.

DO NOT default to any particular number. Truly analyze what this specific app requires.

The phases should logically build on each other, with earlier phases setting up the foundation.

=== MANDATORY REQUIREMENTS (always factor these into your phase planning) ===
1. Phase 1 MUST include: three-level authorization system (user/admin/super_admin roles), pre-seeded test accounts
2. Every phase MUST include creating realistic seed/demo data for any new features or entities
3. Final phase MUST include: admin dashboard, super admin panel, and a completeness audit to verify no dead ends
4. "No blank pages" rule: Every button and link must lead to functional content throughout all phases`
          }
        ],
      });

      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent?.text) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return {
        promptCount: Math.max(3, result.promptCount || 5), // Minimum 3, no maximum
        phases: result.phases || []
      };
    } catch (error: any) {
      console.error('[App Builder Prompts] Complexity analysis error:', error.message);
      // Default fallback
      return {
        promptCount: 5,
        phases: [
          'Phase 1: Project Setup, Authentication & Three-Level Authorization',
          'Phase 2: Core Data Models & Database with Seed Data',
          'Phase 3: Main User Interface & Role-Based Views',
          'Phase 4: Core Features & Business Logic',
          'Phase 5: Admin Dashboard, Super Admin Panel & Final Polish'
        ]
      };
    }
  }

  /**
   * Generate a single chunked prompt for the app builder
   */
  async generateSingleAppBuilderPrompt(
    idea: any,
    promptNumber: number,
    totalPrompts: number,
    phaseName: string,
    previousPhases: string[],
    researchContext: string
  ): Promise<{
    taskDescription: string;
    previousContext: string;
    technicalSpecs: string;
    features: string[];
    uiRequirements: string[];
    completionChecklist: string[];
  }> {
    console.log(`[App Builder Prompts] Generating prompt ${promptNumber} of ${totalPrompts}: ${phaseName}`);

    const anthropicClient = getAnthropic();

    const previousContextSummary = previousPhases.length > 0
      ? `Previous phases completed:\n${previousPhases.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      : 'This is the first prompt - no previous phases.';

    const response = await anthropicClient.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000
      },
      messages: [
        {
          role: 'user',
          content: `You are an expert software architect creating detailed, copy-paste-ready prompts for no-code AI builders (Lovable, Claude Code, Replit).

Generate PROMPT ${promptNumber} of ${totalPrompts} for building this app:

App Details:
- Name: ${idea.title}
- Description: ${idea.description || ''}
- Market: ${idea.market || ''}
- Target Audience: ${idea.targetAudience || ''}
- Type: ${idea.type || ''}
- Additional Details: ${idea.content || ''}

Research Context (similar apps & patterns):
${researchContext}

Phase Focus: ${phaseName}

${previousContextSummary}

=== MANDATORY REQUIREMENTS FOR ALL PROMPTS ===

1. THREE-LEVEL AUTHORIZATION SYSTEM:
   - User role: Standard authenticated user, access to own data and public features
   - Admin role: Organization admin, user management, reports, moderation
   - Super Admin role: Platform-wide access, all orgs, system settings, impersonation
   ${promptNumber === 1 ? `
   FOR PHASE 1: Implement the full authorization foundation:
   - Add 'role' field to users table (enum: 'user' | 'admin' | 'super_admin')
   - Create middleware: requireAuth(), requireAdmin(), requireSuperAdmin()
   - Pre-seed these test accounts (already verified, no email confirmation needed):
     * testuser@demo.app / Demo123! (user role)
     * testadmin@demo.app / Demo123! (admin role)
     * testsuperadmin@demo.app / Demo123! (super_admin role)
   ` : `
   FOR THIS PHASE: Apply role-based access control to all new features. Ensure proper authorization checks.
   `}

2. SYNTHETIC/DEMO DATA:
   - Create 10-50 realistic sample records for EVERY new entity introduced in this phase
   - Use realistic names, dates, values (NOT "Test 1", "Lorem ipsum", or placeholder text)
   - Include various statuses and edge cases to demonstrate the full feature set

3. NO BLANK PAGES:
   - Every button must perform a real action
   - Every link must lead to a working page
   - "Coming soon" text is FORBIDDEN - implement the feature or remove the UI element
   - All navigation paths must lead to functional content

${promptNumber === totalPrompts ? `
=== FINAL PHASE REQUIREMENTS ===
- Admin Dashboard: Implement user management, reports, content moderation tools
- Super Admin Panel: Platform analytics, system settings, user impersonation capability
- Completeness Audit: Test every route as each role (user/admin/super_admin), verify no dead ends
- Ensure all three test accounts work: testuser@demo.app, testadmin@demo.app, testsuperadmin@demo.app
` : ''}

Generate the prompt content in JSON format:
{
  "taskDescription": "A 2-3 paragraph description starting with 'You are building [App Name]...' that sets context and describes this phase's goal. MUST include auth instructions (role-based access) and seed data requirements. Should be detailed enough to stand alone when copy/pasted.",
  "previousContext": "Summary of what should have been built in previous prompts (empty string for prompt 1)",
  "technicalSpecs": "Specific tech stack, frameworks, database requirements for this phase",
  "features": ["Array of 3-7 specific features. Each feature MUST specify its authorization level (user/admin/super_admin) and include seed data creation"],
  "uiRequirements": ["Array of 3-5 specific UI/UX requirements for this phase"],
  "completionChecklist": ["Array of 4-6 verifiable outcomes. MUST include: auth verification per role, seed data check, no-blank-pages verification"]
}

IMPORTANT:
- Make the taskDescription comprehensive - it will be copy/pasted directly into an AI builder
- Include specific component names, API endpoints, or database tables where relevant
- Features should be concrete and implementable in one prompt session
- The prompt should work for Lovable, Claude Code, or Replit (React/TypeScript/Tailwind stack preferred)
- For prompt 1, include project setup, initial structure, AND the full three-level auth system with pre-seeded test accounts
- For the final prompt, include admin dashboard, super admin panel, completeness audit, and deployment prep
- EVERY feature must specify which roles can access it
- EVERY entity must include realistic seed data (10-50 records)

Return ONLY the JSON object, no additional text.`
        }
      ],
    });

    // Extract the text content (skip thinking blocks)
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Main orchestration method: Generate complete App Builder Prompts document
   */
  async generateAppBuilderPrompts(idea: any): Promise<{
    appName: string;
    appDescription: string;
    prompts: Array<{
      promptNumber: number;
      totalPrompts: number;
      phaseName: string;
      previousContext: string;
      taskDescription: string;
      technicalSpecs: string;
      features: string[];
      uiRequirements: string[];
      completionChecklist: string[];
    }>;
  }> {
    console.log('[App Builder Prompts] Starting generation for:', idea.title);

    // Step 1: Research similar apps
    const researchContext = await this.researchSimilarApps(idea);
    console.log('[App Builder Prompts] Research complete');

    // Step 2: Analyze complexity and determine prompt count
    const { promptCount, phases } = await this.analyzeAppComplexity(idea, researchContext);
    console.log(`[App Builder Prompts] Complexity analysis: ${promptCount} prompts needed`);

    // Step 3: Generate each prompt
    const prompts: Array<{
      promptNumber: number;
      totalPrompts: number;
      phaseName: string;
      previousContext: string;
      taskDescription: string;
      technicalSpecs: string;
      features: string[];
      uiRequirements: string[];
      completionChecklist: string[];
    }> = [];

    const completedPhases: string[] = [];

    for (let i = 0; i < promptCount; i++) {
      const phaseName = phases[i] || `Phase ${i + 1}`;

      const promptContent = await this.generateSingleAppBuilderPrompt(
        idea,
        i + 1,
        promptCount,
        phaseName,
        completedPhases,
        researchContext
      );

      prompts.push({
        promptNumber: i + 1,
        totalPrompts: promptCount,
        phaseName: phaseName.replace(/^Phase \d+:\s*/, ''), // Remove "Phase N:" prefix
        ...promptContent
      });

      // Track completed phases for context in next prompt
      completedPhases.push(`${phaseName}: ${promptContent.features.slice(0, 2).join(', ')}...`);

      console.log(`[App Builder Prompts] Generated prompt ${i + 1} of ${promptCount}`);
    }

    return {
      appName: idea.title,
      appDescription: idea.description || idea.subtitle || 'A powerful application built with AI assistance.',
      prompts
    };
  }
}

// ── Landing Page Prompt Template ──────────────────────────────────
const LANDING_PAGE_PROMPT_TEMPLATE = `# Landing Page Generation Prompt

You are an expert landing page designer and conversion copywriter working at a Fortune 500-caliber design agency. Using the BUSINESS_CONTEXT below, generate a complete, high-converting landing page specification that can be built in any modern web framework (React, Next.js, HTML/CSS, etc.).

Design this to the standard of a Stripe, Salesforce, or HubSpot landing page — polished, trust-building, and conversion-optimized from top to bottom.

---

## BUSINESS_CONTEXT

{{BUSINESS_CONTEXT}}

---

## YOUR TASK

Generate a **complete landing page** with the following sections. For each section, provide:
1. **Copy** — exact headlines, subheadlines, body text, and CTAs
2. **Layout notes** — how the section should be structured visually
3. **Design direction** — colors, imagery suggestions, spacing guidance

---

### SECTIONS TO GENERATE

#### 1. ANNOUNCEMENT BAR
- Sticky top banner (one line) with a timely hook — product launch, limited offer, upcoming webinar, or industry milestone
- Dismissible (X button)
- Link text + destination (e.g., "Register now →")

#### 2. HEADER / NAVIGATION
- Logo placement (left-aligned)
- Primary nav links (4-6 items): Product, Features, Pricing, Resources, About — tailor to this business
- Right-side utility: "Login" link + primary CTA button (e.g., "Get Started", "Book a Demo")
- Sticky on scroll behavior
- Mobile: hamburger menu with same links + CTA

#### 3. HERO SECTION
- Headline (max 10 words, benefit-driven, speaks to the core pain)
- Subheadline (1-2 sentences expanding on the value proposition)
- Primary CTA button (text + where it leads)
- Secondary CTA (e.g., "Watch Demo", "See Pricing", "Talk to Sales")
- Hero visual direction (product screenshot, illustration, or short video/animation)
- Trust bar below hero: logo strip of notable customers or "as seen in" press logos (5-6 logos)

#### 4. PROBLEM / PAIN SECTION
- Section headline that calls out the pain
- 3-4 pain points as short, punchy cards with icons
- Optional: "before/after" or "old way vs. new way" framing
- Emotional resonance — make the reader feel understood
- Supporting statistic or industry data point that validates the pain

#### 5. SOLUTION SECTION
- Section headline introducing the product as the answer
- Product description (2-3 sentences)
- Key differentiator callout (bold or highlighted)
- Visual: product screenshot, annotated UI mockup, or demo GIF direction

#### 6. FEATURES / HOW IT WORKS
- Section headline
- 3-5 features, each with:
  - Feature name
  - One-line description
  - Icon suggestion
- Alternative layout: "3-step process" if it fits better
- Optional: tabbed or toggle interface showing different feature views

#### 7. SOCIAL PROOF & TESTIMONIALS
- Section headline
- 2-3 testimonial blocks with name, title, company, headshot direction, and quote
- Metrics bar (e.g., "10,000+ users", "4.9/5 rating", "99.9% uptime")
- Logo strip of customer/partner types (if not already in hero)

#### 8. CASE STUDY / ROI SPOTLIGHT
- Section headline (e.g., "See the Results")
- 1-2 mini case studies: company name, challenge, result with specific metrics (%, $, time saved)
- Pull-quote from each case study
- "Read Full Case Study →" link
- Layout: side-by-side cards or alternating image/text rows

#### 9. TRUST & SECURITY SECTION
- Section headline (e.g., "Enterprise-Grade Security" or "Built for Trust")
- Compliance badges: SOC 2 Type II, GDPR, ISO 27001, HIPAA — whichever apply to this business
- Security features: encryption, SSO/SAML, role-based access, audit logs
- Uptime SLA or reliability metric
- Layout: badge icons in a row + 2-3 short bullet points

#### 10. INTEGRATION / ECOSYSTEM SECTION
- Section headline (e.g., "Works With Your Stack" or "Connects to Everything")
- Grid of 8-12 integration partner logos (suggest real tools relevant to this market)
- 1-2 sentences on API/webhook/native integration capabilities
- CTA: "See All Integrations →"

#### 11. PRICING SECTION
- Section headline
- Pricing cards (2-4 tiers) with:
  - Tier name, price, billing frequency
  - Feature list per tier (checkmarks)
  - Highlighted "Most Popular" tier
  - CTA per card
- Toggle: monthly/annual with annual discount badge
- Money-back guarantee or risk-reversal copy below cards
- "Need a custom plan? Talk to Sales →" link

#### 12. COMPARISON TABLE (optional but recommended)
- "Why [Product] vs. Alternatives" headline
- Feature comparison grid: your product vs. 2-3 competitor categories (e.g., "Manual Process", "Legacy Tools", "Point Solutions")
- Checkmarks/X marks for each feature row
- Bottom CTA reinforcing the winner

#### 13. RESOURCES / CONTENT SECTION
- Section headline (e.g., "Learn More" or "Resources")
- 3 content cards: blog post, whitepaper/guide, webinar or video
- Each card: thumbnail, title, short description, "Read More →"
- Positions the brand as a thought leader

#### 14. FAQ SECTION
- 5-7 frequently asked questions with answers
- Questions should address common objections: pricing, setup time, data security, migration, support
- Answers should reinforce value and reduce friction
- Expandable accordion layout

#### 15. FINAL CTA SECTION
- Compelling closing headline (different from hero — summarize the transformation)
- Short supporting paragraph (1-2 sentences)
- Primary CTA button (repeat from hero)
- Secondary CTA (e.g., "Schedule a Call", "Download Free Guide")
- Supporting microcopy (e.g., "No credit card required", "Free 14-day trial", "Setup in under 5 minutes")
- Background: subtle gradient or brand color block to visually separate

#### 16. FOOTER
- 4-column layout:
  - Column 1: Logo + brief company description (1-2 sentences) + social media icons
  - Column 2: Product links (Features, Pricing, Integrations, Changelog, Status)
  - Column 3: Company links (About, Careers, Press, Contact, Partners)
  - Column 4: Resources (Blog, Documentation, Help Center, Community, API Reference)
- Bottom bar: copyright, Privacy Policy, Terms of Service, Cookie Preferences, Accessibility
- Optional: language/region selector

---

## OUTPUT FORMAT

For each section, output in this format:

\`\`\`
### [SECTION NAME]

**Headline:** [exact copy]
**Subheadline:** [exact copy]
**Body:** [exact copy]
**CTA:** [button text] → [destination]
**Layout:** [description of visual layout]
**Design Notes:** [colors, imagery, spacing]
\`\`\`

Make every word count. Write copy that converts. Be specific to this business — no generic filler. Every section must feel tailored to this exact product and audience — not a template.`;

// ── Brand Package Prompt Template ──────────────────────────────────
const BRAND_PACKAGE_PROMPT_TEMPLATE = `You are a senior product marketer + conversion copywriter + UX writer working at a Fortune 500-caliber branding agency.

Your job: Generate a comprehensive, high-converting brand package for the selected product using the provided app spec and product context. The output must be structured JSON so it can be rendered dynamically into a brand/landing page template.

Design this to the standard of a Stripe, Notion, or Linear brand system — polished, trust-building, and conversion-optimized from top to bottom.

CRITICAL RULES
- Output MUST be valid JSON only. No markdown, no code fences, no commentary.
- Do not invent factual claims (e.g., "HIPAA compliant", "#1", "used by 10,000 teams") unless explicitly provided in the inputs.
- If a detail is missing, infer carefully and phrase conservatively, or mark as "TBD".
- Avoid buzzword overload. Be clear, specific, and benefit-driven.
- If the app touches regulated domains (health, finance, legal), include a "Trust & Safety" section with cautious language (e.g., "designed to support compliance workflows" not "guarantees compliance").
- Every field must be specific to THIS product and audience — no generic filler.

INPUTS

APP_SELECTED:
{{APP_SELECTED}}

APP_SPEC (JSON):
{{APP_SPEC_JSON}}

APP_TASK_PROMPT (OPTIONAL):
{{APP_TASK_PROMPT_TEXT}}

PRODUCT_CONTEXT (enriched business analysis):
{{PRODUCT_CONTEXT_TEXT}}

WHAT TO DO
1) Understand the app:
   - Extract: who it's for, main outcome, inputs required, outputs produced, differentiators.
   - If APP_TASK_PROMPT is provided, use it to derive:
     a) the concrete deliverables ("what you get")
     b) the internal structure (lists, counts, sections)
     c) language patterns worth reusing (without copying verbatim)
   - Use PRODUCT_CONTEXT to ground every section in real market data, audience pain points, and competitive positioning.

2) Build a brand package that answers, in order:
   - What is this app and why should I care?
   - What do I get?
   - How does it work?
   - Why trust it?
   - What should I do next?

3) Produce A/B variants for the hero (headlines + subheads + CTA).

4) Include Fortune 500-grade elements:
   - Announcement bar copy
   - Full header navigation structure
   - Case study / ROI spotlight data
   - Trust & security badges and compliance language
   - Integration ecosystem partners
   - Competitive comparison positioning
   - Resource / thought-leadership content hooks

OUTPUT FORMAT (JSON ONLY)
Return a single JSON object with exactly these top-level keys:
- "app"
- "seo"
- "navigation"
- "announcement_bar"
- "hero"
- "social_proof"
- "sections"
- "cta"
- "faq"
- "ab_tests"
- "design_notes"
- "assets"
- "footer"

FIELD REQUIREMENTS

"app": {
  "name": string,
  "category": string,
  "one_liner": string,
  "primary_outcome": string,
  "target_users": [string, ...],
  "inputs_required": [string, ...],
  "outputs_produced": [string, ...],
  "key_differentiators": [string, string, string]
}

"seo": {
  "title_tag": string (50-60 chars),
  "meta_description": string (140-160 chars),
  "og_title": string,
  "og_description": string,
  "primary_keywords": [string, string, string],
  "schema_type": string
}

"navigation": {
  "logo_text": string,
  "primary_links": [
    { "label": string, "href": string },
    ...
  ],
  "utility_links": [
    { "label": string, "href": string }
  ],
  "primary_cta": { "label": string, "action": string },
  "mobile_behavior": string
}

"announcement_bar": {
  "text": string,
  "link_text": string,
  "link_href": string,
  "dismissible": true
}

"hero": {
  "headline": string,
  "subheadline": string,
  "primary_cta": { "label": string, "action": string },
  "secondary_cta": { "label": string, "action": string },
  "value_bullets": [string, string, string],
  "trust_badges": [string, ...],
  "hero_visual_direction": string,
  "logo_strip": {
    "label": string,
    "logos": [string, ...]
  }
}

"social_proof": {
  "metrics_bar": [
    { "value": string, "label": string },
    { "value": string, "label": string },
    { "value": string, "label": string }
  ],
  "testimonial_placeholders": [
    { "quote": string, "name": string, "role": string, "company": string, "headshot_direction": string },
    { "quote": string, "name": string, "role": string, "company": string, "headshot_direction": string },
    { "quote": string, "name": string, "role": string, "company": string, "headshot_direction": string }
  ],
  "logos_placeholder": {
    "label": string,
    "items": [string, ...]
  }
}

"sections": [
  // Ordered page sections. Include ALL of these types:
  // "problem", "solution", "how_it_works", "what_you_get", "features",
  // "case_study_roi", "trust_security", "integrations", "comparison",
  // "use_cases", "resources", "pricing", "final_cta"
  {
    "type": string,
    "title": string,
    "subtitle": string,
    "body": string,
    "bullets": [string, ...],
    "callouts": [ { "icon": string, "title": string, "body": string } ... ],
    "cta": { "label": string, "action": string },
    "layout_notes": string,
    "design_direction": string
  }
]

Section-specific field additions:
- "case_study_roi" sections must include: "case_studies": [{ "company": string, "challenge": string, "result": string, "metric": string, "pull_quote": string }]
- "trust_security" sections must include: "badges": [string, ...], "security_features": [string, ...], "compliance_note": string
- "integrations" sections must include: "partner_logos": [string, ...], "api_note": string
- "comparison" sections must include: "competitors": [string, ...], "comparison_rows": [{ "feature": string, "us": string, "them": string }]
- "resources" sections must include: "cards": [{ "type": string, "title": string, "description": string, "cta_label": string }]
- "pricing" sections must include: "toggle_options": [string, string], "tiers": [{ "name": string, "price": string, "billing": string, "features": [string, ...], "cta": string, "highlighted": boolean }], "guarantee": string

"cta": {
  "primary": { "label": string, "action": string },
  "secondary": { "label": string, "action": string },
  "closing_headline": string,
  "closing_body": string,
  "microcopy": string,
  "form_microcopy": {
    "headline": string,
    "privacy_line": string,
    "button_label": string
  }
}

"faq": [
  { "q": string, "a": string },
  { "q": string, "a": string },
  { "q": string, "a": string },
  { "q": string, "a": string },
  { "q": string, "a": string },
  { "q": string, "a": string },
  { "q": string, "a": string }
]

"ab_tests": {
  "hero_variants": [
    {
      "headline": string,
      "subheadline": string,
      "primary_cta_label": string,
      "angle": string
    },
    {
      "headline": string,
      "subheadline": string,
      "primary_cta_label": string,
      "angle": string
    },
    {
      "headline": string,
      "subheadline": string,
      "primary_cta_label": string,
      "angle": string
    }
  ],
  "positioning_angles": [string, string, string]
}

"design_notes": {
  "tone": string,
  "visual_style": string,
  "color_palette": {
    "primary": string,
    "secondary": string,
    "accent": string,
    "background": string,
    "text": string
  },
  "typography": {
    "headings": string,
    "body": string,
    "accent": string
  },
  "layout_notes": [string, ...],
  "avoid": [string, ...]
}

"assets": {
  "image_prompts": {
    "hero_image": string,
    "section_illustrations": [string, ...],
    "icon_style_prompt": string,
    "social_share_image": string
  },
  "logo_concept": {
    "description": string,
    "style": string,
    "colors": string
  }
}

"footer": {
  "columns": [
    { "heading": string, "links": [{ "label": string, "href": string }] },
    { "heading": string, "links": [{ "label": string, "href": string }] },
    { "heading": string, "links": [{ "label": string, "href": string }] },
    { "heading": string, "links": [{ "label": string, "href": string }] }
  ],
  "company_description": string,
  "social_links": [{ "platform": string, "href": string }],
  "bottom_bar": {
    "copyright": string,
    "legal_links": [{ "label": string, "href": string }]
  }
}

QUALITY CHECK BEFORE RETURNING JSON
- Are the outputs aligned with the actual app deliverables from the spec?
- Is there a clear CTA and a single primary conversion goal?
- Are claims defensible given the inputs?
- Is it specific enough to render without additional writing?
- Does every section reference THIS product's actual audience, pain points, and market data?
- Would this pass review at a Fortune 500 brand agency?

Now generate the JSON.`;

// ── Ad Creatives Prompt Template ──────────────────────────────────
const AD_CREATIVES_PROMPT_TEMPLATE = `You are a performance marketing strategist at a Fortune 500-caliber growth agency.

Task: Convert the provided BUSINESS_CONTEXT into a structured CAMPAIGN_BRIEF JSON that can be used to generate paid ad creative across all major platforms (Meta, Google, LinkedIn, TikTok, X/Twitter, YouTube).

Design this to the standard of campaigns run by Salesforce, HubSpot, or Monday.com — data-driven, multi-segment, compliance-aware, and conversion-optimized.

RULES
- Output JSON only. No markdown, no code fences, no commentary.
- Do not invent facts. If unknown, use "TBD".
- If the product touches healthcare, finance, or regulated data, include a "compliance_notes" section with conservative language recommendations (avoid guarantees, avoid invasive personalization).
- Extract multiple audience segments and map them to funnel stages.
- Prefer concrete pains and outcomes from the context (e.g., "$15K/yr lost to cancellations").
- Every ad angle, headline, and body must be specific to THIS product — no generic marketing filler.

INPUT
BUSINESS_CONTEXT:
{{BUSINESS_CONTEXT_TEXT}}

OUTPUT JSON SCHEMA
{
  "product": {
    "name": string,
    "category": string,
    "one_liner": string (max 15 words, benefit-driven),
    "primary_outcome": string,
    "how_it_works": [string, string, string],
    "integrations": [string, ...],
    "pricing": {
      "lead_magnet": string,
      "starter": string,
      "core": string,
      "premium": string
    },
    "offer": {
      "primary_cta": string,
      "lead_magnet": string,
      "trial_or_guarantee": string,
      "urgency_hook": string
    }
  },

  "audiences": [
    {
      "segment_name": string,
      "who": string (1-2 sentences describing demographics + psychographics),
      "job_titles": [string, ...],
      "company_size": string,
      "top_pains": [string, string, string],
      "top_desires": [string, string, string],
      "top_objections": [string, string, string],
      "messaging_notes": [string, ...],
      "best_platforms": [string, ...],
      "targeting_suggestions": {
        "interests": [string, ...],
        "behaviors": [string, ...],
        "lookalike_seeds": [string, ...]
      }
    }
  ],

  "positioning": {
    "differentiators": [string, string, string],
    "proof_points_allowed": [string, ...],
    "claims_to_avoid": [string, ...],
    "competitive_angle": string,
    "category_creation": string
  },

  "funnel": {
    "stages": [
      {
        "stage": "cold",
        "goal": string,
        "angles": ["problem_aware", "benefit_driven", "curiosity", "social_proof"],
        "best_platforms": [string, ...],
        "ad_formats": [string, ...],
        "budget_allocation": string
      },
      {
        "stage": "warm",
        "goal": string,
        "angles": ["social_proof", "objection_handling", "offer_focused", "comparison"],
        "best_platforms": [string, ...],
        "ad_formats": [string, ...],
        "budget_allocation": string
      },
      {
        "stage": "hot",
        "goal": string,
        "angles": ["urgency", "testimonial", "direct_offer", "risk_reversal"],
        "best_platforms": [string, ...],
        "ad_formats": [string, ...],
        "budget_allocation": string
      }
    ]
  },

  "creative_briefs": [
    {
      "name": string (e.g., "Problem-Aware Cold — Pain Hook"),
      "funnel_stage": "cold" | "warm" | "hot",
      "platform": string,
      "format": string (e.g., "single image", "carousel", "video script", "story"),
      "audience_segment": string,
      "angle": string,
      "headline": string (max 40 chars),
      "primary_text": string (max 125 chars for feed, longer for detailed),
      "description": string,
      "cta_button": string,
      "destination": string,
      "image_prompt": string (detailed enough for AI image generation),
      "video_script": string | null (if format is video, include 15-30s script),
      "hook_line": string (first 3 seconds / first line that stops the scroll)
    }
  ],

  "ab_test_matrix": {
    "headlines": [
      { "variant": "A", "text": string, "angle": string },
      { "variant": "B", "text": string, "angle": string },
      { "variant": "C", "text": string, "angle": string }
    ],
    "primary_texts": [
      { "variant": "A", "text": string, "angle": string },
      { "variant": "B", "text": string, "angle": string },
      { "variant": "C", "text": string, "angle": string }
    ],
    "ctas": [
      { "variant": "A", "text": string },
      { "variant": "B", "text": string },
      { "variant": "C", "text": string }
    ],
    "image_concepts": [
      { "variant": "A", "concept": string, "prompt": string },
      { "variant": "B", "concept": string, "prompt": string }
    ]
  },

  "platform_specs": {
    "meta": {
      "campaign_objective": string,
      "ad_sets": [
        {
          "name": string,
          "audience": string,
          "placement": string,
          "budget_note": string
        }
      ],
      "pixel_events": [string, ...],
      "custom_audiences": [string, ...]
    },
    "google": {
      "campaign_types": [string, ...],
      "keyword_themes": [string, ...],
      "responsive_search_ads": [
        {
          "headlines": [string, string, string],
          "descriptions": [string, string]
        }
      ],
      "extensions": [string, ...]
    },
    "linkedin": {
      "campaign_objective": string,
      "targeting": {
        "job_titles": [string, ...],
        "company_sizes": [string, ...],
        "industries": [string, ...]
      },
      "ad_formats": [string, ...],
      "sponsored_content": [
        {
          "intro_text": string,
          "headline": string,
          "cta": string
        }
      ]
    },
    "tiktok": {
      "content_angles": [string, ...],
      "hook_styles": [string, ...],
      "video_concepts": [
        {
          "title": string,
          "duration": string,
          "script_outline": string
        }
      ]
    }
  },

  "compliance_notes": {
    "industry_flags": [string, ...],
    "platform_risk_flags": [string, ...],
    "safe_language_patterns": [string, ...],
    "unsafe_language_patterns": [string, ...],
    "required_disclaimers": [string, ...]
  },

  "measurement": {
    "primary_kpi": string,
    "secondary_kpis": [string, ...],
    "benchmark_targets": {
      "ctr": string,
      "cpc": string,
      "cpa": string,
      "roas": string
    },
    "attribution_model": string
  }
}

QUALITY CHECK
- Does every creative brief reference THIS product's actual audience, pain points, and outcomes?
- Are at least 6 creative briefs generated across cold/warm/hot stages?
- Are platform specs actionable enough to set up campaigns without additional research?
- Are compliance notes appropriate for this product's industry?
- Would this brief pass review at a Fortune 500 performance marketing team?

Return JSON now.`;

// ── Content Calendar Prompt Template ──────────────────────────────
const CONTENT_CALENDAR_PROMPT_TEMPLATE = `You are a content marketing strategist at a Fortune 500-caliber growth agency.

Task: Convert the provided BUSINESS_CONTEXT into a structured CONTENT_BRIEF JSON that can be used to generate a full 90-day editorial calendar and multi-channel distribution plan.

Design this to the standard of content operations at HubSpot, Notion, or Intercom — strategic, audience-first, conversion-mapped, and operationally actionable.

RULES
- Output JSON only. No markdown, no code fences, no commentary.
- Do not invent facts (certifications, compliance claims, customer numbers).
- If unknown, use "TBD" but make a best-effort inference from context.
- If healthcare-adjacent or regulated, include conservative "compliance_notes" about safe claims and privacy-respecting messaging.
- Every piece of content must tie back to THIS product's audience, pain points, and conversion goal — no generic filler.

INPUT
BUSINESS_CONTEXT:
{{BUSINESS_CONTEXT_TEXT}}

OPTIONAL INPUTS (may be empty)
EXISTING_ASSETS:
{{EXISTING_ASSETS_TEXT}}

TEAM_RESOURCES:
{{TEAM_RESOURCES_TEXT}}

PRIMARY_CONVERSION_GOAL:
{{PRIMARY_CONVERSION_GOAL}}

OUTPUT JSON SCHEMA
{
  "business": {
    "name": string,
    "industry": string,
    "product_one_liner": string,
    "offer": {
      "primary_cta": string,
      "lead_magnet": string,
      "pricing_summary": string
    }
  },

  "audience": {
    "primary_segments": [
      {
        "segment_name": string,
        "who": string (1-2 sentences),
        "pains": [string, string, string],
        "desired_outcomes": [string, string, string],
        "objections": [string, string, string],
        "language_to_use": [string, ...],
        "language_to_avoid": [string, ...],
        "content_preferences": string (e.g., "prefers data-driven whitepapers and LinkedIn posts"),
        "buyer_journey_stage": string
      }
    ],
    "top_questions": [string, string, string, string, string],
    "content_preferences": [string, ...],
    "platform_usage": [
      { "platform": string, "usage_pattern": string, "content_fit": string }
    ]
  },

  "positioning": {
    "differentiators": [string, string, string],
    "competitive_alternatives": [string, ...],
    "proof_points_allowed": [string, ...],
    "category_narrative": string,
    "thought_leadership_angle": string
  },

  "content_goals": {
    "business_goals": [string, string, string],
    "content_objectives": [string, string, string],
    "primary_conversion_goal": string,
    "secondary_conversion_goals": [string, ...],
    "kpis": [
      { "metric": string, "target": string, "timeframe": string }
    ]
  },

  "content_pillars": [
    {
      "pillar_name": string,
      "description": string,
      "audience_segment": string,
      "funnel_stage": "awareness" | "consideration" | "decision" | "retention",
      "sample_topics": [string, string, string, string, string],
      "seo_cluster_keywords": [string, string, string]
    }
  ],

  "editorial_calendar": {
    "cadence": {
      "blog_posts": string (e.g., "2/week"),
      "social_posts": string (e.g., "5/week across platforms"),
      "email_newsletters": string,
      "long_form_content": string (e.g., "1 whitepaper or case study/month"),
      "video_content": string
    },
    "month_1_theme": string,
    "month_2_theme": string,
    "month_3_theme": string,
    "weekly_breakdown": [
      {
        "week": number,
        "month": number,
        "theme": string,
        "content_pieces": [
          {
            "type": string (e.g., "blog", "linkedin_post", "twitter_thread", "email", "video", "whitepaper", "case_study", "infographic", "webinar", "podcast_episode"),
            "title": string,
            "brief": string (2-3 sentences describing angle and key points),
            "pillar": string,
            "funnel_stage": string,
            "target_segment": string,
            "primary_keyword": string,
            "cta": string,
            "distribution_channels": [string, ...],
            "estimated_effort": string (e.g., "2 hours", "4 hours")
          }
        ]
      }
    ]
  },

  "distribution_plan": {
    "channels": [
      {
        "channel": string,
        "purpose": string,
        "posting_frequency": string,
        "content_types": [string, ...],
        "best_practices": [string, ...],
        "tone": string
      }
    ],
    "repurposing_strategy": [
      {
        "source_type": string (e.g., "blog post"),
        "repurpose_into": [string, ...] (e.g., ["linkedin carousel", "twitter thread", "email snippet", "short video"])
      }
    ],
    "email_sequences": [
      {
        "sequence_name": string,
        "trigger": string,
        "emails": [
          { "subject_line": string, "preview_text": string, "purpose": string, "send_day": number }
        ]
      }
    ]
  },

  "seo_strategy": {
    "primary_keywords": [string, string, string],
    "long_tail_keywords": [string, string, string, string, string],
    "competitor_content_gaps": [string, ...],
    "pillar_page_topics": [string, string],
    "internal_linking_strategy": string,
    "target_featured_snippets": [string, ...]
  },

  "resources": {
    "team_capacity": string,
    "budget_monthly": string,
    "tools_recommended": [
      { "tool": string, "purpose": string, "tier": string }
    ],
    "channels_available": [string, ...],
    "outsource_candidates": [string, ...]
  },

  "measurement": {
    "reporting_cadence": string,
    "dashboards": [
      { "name": string, "metrics": [string, ...] }
    ],
    "review_process": string,
    "optimization_triggers": [
      { "signal": string, "action": string }
    ]
  },

  "compliance_notes": {
    "safe_claims": [string, ...],
    "avoid_claims": [string, ...],
    "privacy_respecting_guidelines": [string, ...],
    "platform_specific_rules": [
      { "platform": string, "rule": string }
    ]
  }
}

QUALITY CHECK
- Does every content piece in the calendar tie to a specific audience segment and funnel stage?
- Are the 90-day themes progressive (awareness → consideration → decision)?
- Are weekly breakdowns actionable — could a content team execute from this without additional briefing?
- Does the SEO strategy target keywords from the business context?
- Does the distribution plan include repurposing to maximize each content asset?
- Would this calendar pass review at a Fortune 500 content team?

Return JSON now.`;

// ── Email Funnel System Prompt Template ───────────────────────────
const EMAIL_FUNNEL_PROMPT_TEMPLATE = `You are a lifecycle marketing strategist at a Fortune 500-caliber growth agency.

Task: Convert the provided BUSINESS_CONTEXT into a structured EMAIL_FUNNEL_BRIEF JSON suitable for generating complete email automations, sequences, flow diagrams, and lifecycle orchestration.

Design this to the standard of email systems at Intercom, HubSpot, or Klaviyo — behaviorally triggered, segment-aware, lifecycle-mapped, and conversion-optimized across the full customer journey.

RULES
- Output JSON only. No markdown, no code fences, no commentary.
- Do not invent certifications, compliance claims, customer counts, or performance results.
- If unknown, use "TBD" but infer carefully from context.
- Include an event taxonomy: a list of trackable triggers and how they map to intent.
- For healthcare-adjacent topics: add conservative compliance and "anti-creep" copy rules.
- Every email subject, body snippet, and CTA must be specific to THIS product — no generic filler.

INPUT
BUSINESS_CONTEXT:
{{BUSINESS_CONTEXT_TEXT}}

OPTIONAL INPUTS (may be empty)
BRAND_VOICE (if known):
{{BRAND_VOICE_TEXT}}

PRIMARY_CONVERSION_GOAL (if known):
{{PRIMARY_CONVERSION_GOAL}}

OUTPUT JSON SCHEMA
{
  "business": {
    "name": string,
    "business_model": "saas" | "service" | "course" | "ecommerce" | "content_media" | "other",
    "product": string,
    "value_proposition": string,
    "pricing": {
      "tiers": [string, ...],
      "starting_price": string,
      "upgrade_path": string
    },
    "value_delivery": string (how the customer gets value — onboarding, setup, first win)
  },

  "audience": {
    "segments": [
      {
        "segment_name": string,
        "who": string (1-2 sentences),
        "top_pains": [string, string, string],
        "desired_outcomes": [string, string, string],
        "objections": [string, string, string],
        "trust_builders": [string, ...],
        "email_preferences": string (frequency tolerance, format preference)
      }
    ]
  },

  "offers_assets": {
    "lead_magnets": [
      { "name": string, "type": string, "description": string, "delivery_method": string }
    ],
    "content_types": [string, ...],
    "core_cta": string,
    "secondary_ctas": [string, ...],
    "upgrade_offers": [
      { "from": string, "to": string, "incentive": string, "timing": string }
    ]
  },

  "events_and_triggers": {
    "entry_points": [
      { "source": string, "expected_intent": string, "initial_sequence": string }
    ],
    "trackable_events": [
      {
        "event": string,
        "type": "page_view" | "click" | "signup" | "activation" | "feature_use" | "purchase" | "upgrade" | "cancel" | "inactivity" | "support_ticket",
        "intent_level": "low" | "medium" | "high",
        "trigger_action": string (what email/sequence this triggers),
        "notes": string
      }
    ],
    "activation_definition": string (what constitutes an "activated" user),
    "churn_signals": [string, ...],
    "expansion_signals": [string, ...]
  },

  "sequences": [
    {
      "sequence_name": string,
      "type": "welcome" | "nurture" | "onboarding" | "activation" | "upgrade" | "re_engagement" | "post_purchase" | "winback" | "referral" | "event_triggered",
      "trigger": string,
      "goal": string,
      "audience_segment": string,
      "emails": [
        {
          "email_number": number,
          "send_timing": string (e.g., "Immediately", "Day 1", "Day 3", "+2 hours after trigger"),
          "subject_line": string,
          "preview_text": string,
          "purpose": string,
          "body_outline": string (3-5 sentences describing the email's structure and key points),
          "primary_cta": { "label": string, "action": string },
          "secondary_cta": { "label": string, "action": string } | null,
          "personalization_fields": [string, ...],
          "conditional_logic": string | null (e.g., "Skip if user already activated"),
          "exit_condition": string | null
        }
      ],
      "success_metric": string,
      "a_b_test_suggestion": string
    }
  ],

  "lifecycle_stages": [
    {
      "stage": "subscriber" | "lead" | "activated" | "customer" | "power_user" | "at_risk" | "churned",
      "definition": string,
      "active_sequences": [string, ...],
      "transition_triggers": {
        "advance_to": string,
        "trigger": string
      },
      "key_email_goal": string
    }
  ],

  "flow_diagram": {
    "description": string (text description of the full automation flow for visual rendering),
    "nodes": [
      {
        "id": string,
        "type": "entry" | "email" | "wait" | "condition" | "action" | "exit",
        "label": string,
        "details": string
      }
    ],
    "edges": [
      {
        "from": string,
        "to": string,
        "condition": string | null
      }
    ]
  },

  "goals_metrics": {
    "primary_conversion_goal": string,
    "secondary_goals": [string, ...],
    "key_metrics": [
      { "metric": string, "target": string, "benchmark": string }
    ],
    "reporting_cadence": string
  },

  "copy_rules": {
    "tone": [string, ...],
    "voice_description": string,
    "do": [string, ...],
    "avoid": [string, ...],
    "subject_line_patterns": [string, ...],
    "cta_patterns": [string, ...],
    "ps_line_strategy": string
  },

  "deliverability": {
    "warmup_plan": string,
    "sending_domain": string,
    "authentication": [string, ...],
    "list_hygiene_rules": [string, ...],
    "sunset_policy": string
  },

  "tech_stack": {
    "recommended_esp": [
      { "tool": string, "why": string, "tier": string }
    ],
    "integrations_needed": [string, ...],
    "tracking_setup": [string, ...]
  },

  "compliance_notes": {
    "safe_language_patterns": [string, ...],
    "avoid_claims": [string, ...],
    "privacy_respecting_rules": [string, ...],
    "unsubscribe_requirements": string,
    "data_handling_notes": string,
    "anti_creep_rules": [string, ...]
  }
}

QUALITY CHECK
- Are there at least 5 sequences covering the full lifecycle (welcome → nurture → activation → retention → winback)?
- Does every email have a specific subject line, purpose, body outline, and CTA tied to THIS product?
- Is the event taxonomy comprehensive enough to power behavioral triggers?
- Does the flow diagram have enough nodes/edges to represent the full automation visually?
- Are lifecycle stages clearly defined with transition triggers?
- Would this brief pass review at a Fortune 500 lifecycle marketing team?

Return JSON now.`;

// ── Email Nurture Sequence Prompt Template ────────────────────────
const EMAIL_NURTURE_PROMPT_TEMPLATE = `You are a lifecycle marketing strategist + direct-response email copywriter at a Fortune 500-caliber growth agency.

TASK
Create a comprehensive 5-email nurture sequence designed to convert leads into customers for the product described in APP_CONTEXT.
This sequence should be indistinguishable from what a top-tier agency (like a Klaviyo partner, HubSpot Elite, or Salesforce Marketing Cloud specialist) would deliver.

GOAL
Build trust, increase problem awareness, introduce the solution, handle objections, and drive action (trial/demo/purchase) using ethical, evidence-based persuasion.

CRITICAL GROUNDING RULES (DO NOT VIOLATE)
- Only use facts, integrations, pricing, metrics, guarantees, and claims that are explicitly present in APP_CONTEXT.
- Do NOT invent testimonials, customer names, case studies, research stats, compliance claims (HIPAA/GDPR/etc.), partnerships, or performance numbers.
- If proof is requested but not provided, output a clearly marked placeholder like:
  - "TESTIMONIAL_NEEDED: [what kind of person + result]"
  - "STAT_NEEDED: [what stat would strengthen this point]"
  - "PROOF_NEEDED: [what evidence to collect]"
  - "CASE_STUDY_NEEDED: [what type of success story to capture]"
- If a detail is missing (pricing, guarantee, exact CTA destination), use "TBD" rather than guessing.

VOICE + AUDIENCE
- Infer the primary audience, their language patterns, decision-making style, and buying motivations from APP_CONTEXT.
- Write in the voice they would trust: clear, specific, human, and professional.
- Match sophistication to audience: executives get strategic framing; practitioners get tactical depth; consumers get emotional resonance.
- Avoid hype and vague claims ("game-changing", "revolutionary") unless the audience's language in APP_CONTEXT specifically uses it.
- If the product touches regulated areas (health/finance/legal), avoid medical/legal promises and use cautious wording ("helps", "supports", "designed to").
- Default reading level: clear, skimmable, plain English (avoid jargon unless the audience uses it daily).
- Use "you" voice throughout. Make the pain concrete, specific, and visceral.

OFFER + CTA RULES
- Use the value ladder / lead magnet / initial offer described in APP_CONTEXT.
- If multiple offers exist (free guide, early access, standard plan), align CTAs by stage:
  - Email 1-2: educational CTA or low-friction next step (read, watch, download)
  - Email 3: demo/trial/waitlist/early access
  - Email 4: trial/call/evaluation (with objection handling context)
  - Email 5: conversion CTA + any legitimate urgency (only if APP_CONTEXT supports urgency)
- Never manufacture fake scarcity. If no deadline exists, use "decision clarity" urgency (the cost of inaction).

PERSUASION FRAMEWORK (apply across all emails)
- Hierarchy: (1) Outcome/value → (2) Problem/pain → (3) Mechanism/solution → (4) Proof → (5) Objections → (6) Offer + CTA
- Use proof ethically. If you don't have real testimonials, output "TESTIMONIAL_NEEDED" and suggest what type to collect.
- Include risk reversal only if present in context; otherwise suggest a low-risk next step (demo, pilot, waitlist, trial, consult).

OUTPUT FORMAT (STRICT)
Return the sequence in clean Markdown with the exact structure below.
Include subject line options (A/B/C), preview text, and full body copy.
Use merge tags exactly like this:
- {{first_name}}
- {{company}} (only if B2B audience)
- {{primary_pain}}
- {{desired_outcome}}

---

# EMAIL NURTURE SEQUENCE

## EMAIL 1: WELCOME & VALUE DELIVERY
**Send timing:** Immediately after signup

### Subject Line Options
- **A:** [Pattern-interrupt or curiosity-driven — reference the promise that got them to sign up]
- **B:** [Direct value — tell them exactly what they're getting right now]
- **C:** [Personal/conversational — sounds like a human wrote it, not a funnel]

### Preview Text
[1 line that complements the subject and creates an open loop]

### Email Body (300–400 words)
Structure:
1. **Opening** (2-3 sentences): Thank them warmly. Set expectations for what's coming. Reference the specific problem/outcome that brought them here.
2. **Value Delivery** (core of the email): Deliver an immediate, tangible payoff — a quick win, actionable framework, useful tip, or the lead magnet they signed up for. This should feel like "I'm already getting value before paying."
3. **Social Proof**: Use real proof from context OR insert TESTIMONIAL_NEEDED: [describe what type of testimonial would be most compelling for this audience]
4. **Expectation Setting** (2-3 sentences): Tell them what's coming over the next few emails and why it matters. Build anticipation.
5. **CTA**: Soft ask — read, watch, try, explore. Low commitment. CTA destination: [specific from context or TBD]

### Design Notes
- Keep paragraphs to 2-3 lines max for mobile readability
- Use a single-column layout, no heavy graphics
- CTA button should be a contrasting color, above the fold on mobile

---

## EMAIL 2: PROBLEM DEEP-DIVE
**Send timing:** 2–3 days after Email 1

### Subject Line Options
- **A:** [Agitation-style — name the cost of the status quo]
- **B:** [Question format — "Are you still doing X the hard way?"]
- **C:** [Story-based — "What happened when [persona] tried to..."]

### Preview Text
[1 line that amplifies curiosity or concern]

### Email Body (400–500 words)
Structure:
1. **Hook** (2-3 sentences): Paint a vivid, relatable scenario from their day-to-day. Make them nod and think "that's exactly me."
2. **Problem Expansion** (core section): Quantify the cost of not solving — in time wasted, money lost, stress endured, risk accumulated, or opportunity missed. Be specific to THIS audience.
3. **Market Reality** (2-3 sentences): Why current solutions fail — based on competitive gaps and market analysis from APP_CONTEXT. Don't bash competitors by name; focus on structural problems with the old way.
4. **Hope Reframe** (2-3 sentences): Acknowledge the frustration, then reframe — change IS possible. Plant the seed that a better approach exists.
5. **Value Add**: A practical, actionable insight — a checklist, a mental model, a single question they can ask themselves. Something they can use TODAY even without the product.
6. **CTA**: Educational content or tool — guide, calculator, template, video, or blog post. CTA destination: [specific or TBD]

### Include
- A data point, industry stat, or case snippet that validates the problem's severity
- If missing: STAT_NEEDED: [describe what data would make this more compelling] or CASE_STUDY_NEEDED: [describe what story would resonate]

---

## EMAIL 3: SOLUTION INTRODUCTION
**Send timing:** 5–7 days after signup

### Subject Line Options
- **A:** [Reveal-style — "Here's what we built (and why)"]
- **B:** [Outcome-driven — reference the transformation, not the product]
- **C:** [Social proof angle — "Why [N] [personas] switched to..."]

### Preview Text
[1 line that bridges from problem to solution]

### Email Body (450–550 words)
Structure:
1. **Origin Story** (2-3 sentences): Why was this created? Use the narrative from APP_CONTEXT if available. Connect the founders' motivation to the reader's pain.
2. **Solution Overview**: What it is + how it works. Lead with the NON-TECHNICAL explanation first (outcome-first), then layer in specifics for those who want depth. Use "before/after" framing.
3. **Differentiation** (3-4 sentences): What's unique vs. alternatives — drawn directly from competitive analysis in APP_CONTEXT. Frame as "different approach" not "better than X."
4. **Social Proof**: Real testimonial, case snippet, or metric — or TESTIMONIAL_NEEDED: [describe the ideal proof point for this audience at this stage]
5. **Value Add**: A bonus tip, resource, or framework that's useful independently of the product. Demonstrates expertise and generosity.
6. **CTA**: Learn more — demo, early access, trial, pricing page, or product walkthrough. Aligned to the offer structure in APP_CONTEXT.

---

## EMAIL 4: OBJECTION HANDLING
**Send timing:** 8–10 days after signup

### Subject Line Options
- **A:** [Transparency angle — "The honest answer to 'Is this right for me?'"]
- **B:** [FAQ-style — "3 things people ask before they [desired action]"]
- **C:** [Empathy-driven — "If you're on the fence, read this"]

### Preview Text
[1 line that signals honesty and helpfulness, not hard sell]

### Email Body (500–600 words)
Structure:
1. **Acknowledge Hesitation** (2-3 sentences): Validate that taking action is a real decision. Name the feeling ("You might be wondering if this is really worth it..."). Show you understand their caution.
2. **Address 3–4 Key Objections** (core of the email):
   - **Objection 1**: [Most likely concern for this audience — e.g., price, switching cost, time to value] → Reassuring, grounded response with specific evidence
   - **Objection 2**: [Second concern — e.g., "Will it work for my specific situation?"] → Evidence or proof point (or PROOF_NEEDED: [what evidence to collect])
   - **Objection 3**: [Third concern — e.g., trust, security, reliability] → Risk reversal if available in APP_CONTEXT; else propose a safe next step (pilot, walkthrough, Q&A call)
   - **Objection 4** (optional): [Additional concern specific to this market/audience] → Clarification with specifics
3. **Additional Social Proof**: A different type of proof than Email 3 — a different persona, a different metric, or a different format. Or TESTIMONIAL_NEEDED: [describe variant needed]
4. **Risk Reversal**: Guarantee, trial period, refund policy — ONLY if explicitly stated in APP_CONTEXT. If nothing exists, propose a low-risk next step and suggest the business consider adding a guarantee.
5. **CTA**: Schedule a call, start a trial, join early access, request a walkthrough — one step closer to conversion. Match to what's available in APP_CONTEXT.

---

## EMAIL 5: URGENCY & FINAL CALL
**Send timing:** 12–14 days after signup

### Subject Line Options
- **A:** [Decision-point framing — "Your window to [outcome] is open"]
- **B:** [Recap + urgency — final opportunity angle or "Last thing I want to share"]
- **C:** [Direct ask — clear, confident, specific]

### Preview Text
[1 line that signals this is the culmination of the sequence]

### Email Body (350–450 words)
Structure:
1. **Recap Value** (2-3 sentences): Summarize the journey — what they learned, what shifted. Reference specific insights from Emails 1-4.
2. **Success Vision** (2-3 sentences): Paint a vivid, specific picture of the outcome. Use sensory language. Make the future state feel concrete and attainable.
3. **Urgency Element**: ONLY if supported by APP_CONTEXT (limited spots, expiring early access pricing, bonus deadline, cohort start date). If no legitimate urgency exists, use "decision clarity" urgency — articulate the daily/weekly cost of continuing to wait. Never fabricate scarcity.
4. **Clear CTA**: The specific conversion step — buy, start trial, book demo, claim offer. One primary CTA, stated clearly with no ambiguity about what happens next.
5. **Final Reassurance** (1-2 sentences): Address the last-minute doubt. Reinforce the safety net (trial, guarantee, support).
6. **P.S. Line**: Extra incentive, bonus, or compelling proof point. Or placeholder: PROOF_NEEDED: [what would make a great P.S. closer]

---

# SEQUENCE STRATEGY

## Overall Flow
Map each email to its strategic job in the conversion journey:
- Email 1 → [Trust + value delivery + expectation setting]
- Email 2 → [Problem awareness + cost of inaction + credibility]
- Email 3 → [Solution introduction + differentiation + hope]
- Email 4 → [Objection demolition + risk reversal + confidence]
- Email 5 → [Decision catalyst + urgency + final conversion push]

## Personalization Variables
List all merge tags used and how they modify the copy:
- {{first_name}} → [where it appears, how it changes tone]
- {{company}} → [if B2B, where it appears]
- {{primary_pain}} → [how it customizes the hook/empathy sections]
- {{desired_outcome}} → [how it customizes the vision/CTA sections]

## Segmentation & Branching Suggestions
Practical, implementable segmentation logic:
- **If they click in Email 2** → What follow-up angle changes? (e.g., fast-track to Email 3, add a case study email)
- **If they don't open Email 1** → Subject line resend strategy (when, with what new subject)
- **If they click CTA in Email 3 but don't convert** → Insert a "bridge" email between 3 and 4 with a specific use case or demo
- **If they open all but click nothing** → Engagement recovery approach
- **High-intent signals** (pricing page visit, multiple opens) → Accelerate to Email 5 or trigger a personal outreach

## Technical Setup Notes
- **Send timing**: State as hypotheses to test (e.g., "Hypothesis: Tuesday/Thursday 10am local time for B2B; test against evening sends")
- **From name**: Recommendation based on audience (personal name vs brand name vs hybrid)
- **Reply-to**: Should be a monitored inbox — replies are gold for engagement and deliverability
- **Tracking events**: Opens, clicks (per CTA), replies, forwards, unsubscribes, conversions
- **Plain text vs HTML**: Recommendation based on audience expectations
- **Mobile optimization**: Single column, 14px+ body text, touch-friendly CTA buttons (44px+ height)

## Performance Benchmarks (Starting Hypotheses)
Frame these as testable hypotheses, not guarantees:
- **Open rate target**: [range based on industry/audience, e.g., "25-35% for B2B SaaS, 15-25% for B2C"]
- **Click rate target**: [range, e.g., "3-7% for engaged lists"]
- **Conversion goal**: [range based on offer type, e.g., "1-3% of sequence completers for trial signup"]
- **Unsubscribe threshold**: [range, e.g., "<0.5% per email; investigate if >1%"]
- **Reply rate**: [target if applicable, e.g., "2-5% on Email 1 if using conversational tone"]

## Compliance & Deliverability Notes
- CAN-SPAM / GDPR requirements: physical address, unsubscribe link, consent basis
- If health/finance/legal adjacent: specific language cautions
- Warm-up plan if sending from a new domain
- List hygiene: remove hard bounces immediately, soft bounces after 3 attempts, sunset inactive subscribers after [X] days

APP_CONTEXT
<<APP_CONTEXT>>`;

// ── Lead Magnet Prompt Template ───────────────────────────────────
const LEAD_MAGNET_PROMPT_TEMPLATE = `You are a direct-response lead magnet strategist and funnel architect at a Fortune 500-caliber growth agency.

Your task: create an APP-SPECIFIC LEAD MAGNET BLUEPRINT that can be generated dynamically for the product described below.
This output should be indistinguishable from what a top-tier acquisition agency (like DigitalMarketer, Leadpages partner, or HubSpot Elite agency) would deliver.

You will receive:
- app_meta (short structured metadata)
- app_prompt (the raw internal prompt text / detailed analysis for the selected app)
- business_context (comprehensive enriched business context)
- brand_voice (optional)
- constraints (optional)

CRITICAL GROUNDING RULES (DO NOT VIOLATE)
1) Do NOT invent product capabilities, integrations, compliance claims, results, statistics, customer names, or partnerships.
2) If a detail is missing, mark it in the "unknowns" array with a safe placeholder and explain what's needed.
3) The lead magnet MUST be tightly coupled to what the app produces. The lead magnet is the "free win" that logically leads into the app's paid value — it should make the reader think "if the free thing is this good, the paid product must be incredible."
4) Output must be VALID JSON only. No markdown, no code fences, no commentary.
5) Make it app-specific: use the app's language, pains, and target persona. No generic "Ultimate Guide" filler.
6) If the domain is regulated (health/finance/legal), avoid compliance claims and use cautious wording ("designed to support," "helps with"). Note relevant compliance considerations.

WHAT TO EXTRACT FROM INPUTS
From the provided text, infer and extract:
- persona (job title/role + context + sophistication level)
- core_pain (financial impact + emotional toll + operational friction)
- primary_outcome (what "success" looks like in concrete, measurable terms)
- objections/risks (compliance, complexity, cost, trust, time-to-value)
- offer_ladder (if present: lead magnet → frontend → core → backend → continuity)
- deliverables the app generates (what the app actually produces for users)
- channels with signal (where the audience actively seeks solutions)
- competitive landscape (what alternatives exist and why they fall short)

LEAD MAGNET STRATEGY REQUIREMENTS
Generate:
- 3 lead magnet concepts (ranked by conversion potential, with rationale)
- Pick the #1 concept and fully blueprint it
- The primary concept must satisfy the "Quick Win Test": the reader should achieve a meaningful result within 15 minutes of consuming it
- Include: format, promise, detailed table of contents/sections, specific assets, "time-to-value" path
- Include: opt-in page copy (headline with A/B variants, subheadline, benefit bullets, CTA, micro-trust, form fields)
- Include: thank-you page copy (next step + soft CTA into product — this is the highest-intent moment)
- Include: delivery email + 4-email nurture sequence (each email has subject, goal, body, and CTA — specific to this product, not generic drip)
- Include: distribution plan (3+ channels minimum) aligned to audience signals with specific tactics and example copy
- Include: measurement framework with core metrics, A/B test plan, UTM structure, and event tracking
- Include: compliance/trust considerations relevant to the niche (only if supported by inputs)

PERSUASION FRAMEWORK
- The lead magnet should follow: Outcome Promise → Quick Win Delivery → "Aha Moment" → Natural Bridge to Product
- Opt-in page follows: Pattern Interrupt → Specific Promise → Proof/Trust → Low-Friction CTA
- Thank-you page follows: Gratification → Next Step → Soft Product Introduction
- Nurture sequence follows: Value → Problem Awareness → Solution → Objection Handling → Conversion

INPUTS
app_meta:
{{APP_META_JSON}}

app_prompt:
{{APP_PROMPT_TEXT}}

business_context:
{{BUSINESS_CONTEXT_TEXT}}

brand_voice:
{{BRAND_VOICE_TEXT}}

constraints:
{{CONSTRAINTS_TEXT}}

OUTPUT JSON SCHEMA (MUST MATCH EXACTLY)
{
  "app": {
    "app_name": string,
    "app_category": string,
    "target_persona": string (specific: role + context + pain state),
    "core_pain": string (financial + emotional + operational dimensions),
    "primary_outcome": string (concrete, measurable transformation)
  },
  "lead_magnet_concepts": [
    {
      "rank": number,
      "name": string,
      "format": "pdf" | "checklist" | "template_pack" | "calculator" | "email_course" | "video_training" | "script_pack" | "worksheet" | "swipe_file" | "assessment" | "toolkit",
      "one_sentence_promise": string,
      "why_it_fits_the_app": string (explain the logical bridge from free → paid),
      "estimated_time_to_value_minutes": number,
      "upgrade_path_to_app": string (what the user naturally wants NEXT after consuming this),
      "conversion_potential_rationale": string (why this concept ranks where it does)
    }
  ],
  "primary_lead_magnet_blueprint": {
    "name": string,
    "format": string,
    "positioning": {
      "big_promise": string,
      "who_its_for": string (specific persona description),
      "who_its_not_for": string (disqualify the wrong audience — increases perceived value),
      "proof_points_supported_by_inputs": [string] (only claims grounded in the provided context),
      "positioning_against_alternatives": string (why this lead magnet is different from what competitors offer for free)
    },
    "deliverable_spec": {
      "assets_included": [
        {
          "asset_name": string,
          "type": "pdf" | "doc" | "notion" | "spreadsheet" | "slides" | "template" | "video" | "audio",
          "purpose": string,
          "sections_or_tabs": [string]
        }
      ],
      "table_of_contents": [
        {
          "section_number": number,
          "section_title": string,
          "what_the_reader_gets": string (specific outcome from this section),
          "estimated_time_minutes": number
        }
      ],
      "time_to_value_path": [
        {
          "step": number,
          "action": string (what the user does),
          "time_minutes": number,
          "output": string (what they have after this step),
          "aha_moment": string (what realization or result makes them want more)
        }
      ]
    },
    "opt_in_page": {
      "headline_variants": [string, string, string],
      "subheadline": string,
      "bullets": [string, string, string, string, string],
      "cta_button_text_variants": [string, string, string],
      "micro_trust": string (e.g., "Join 500+ [personas] — no spam, unsubscribe anytime"),
      "form_fields": [
        {
          "name": string,
          "label": string,
          "type": "text" | "email" | "select" | "tel",
          "required": boolean,
          "purpose": string (why this field is collected)
        }
      ],
      "social_proof_element": string (what proof to show near the form — or "PROOF_NEEDED: [what to collect]"),
      "above_fold_layout_notes": [string, string, string]
    },
    "thank_you_page": {
      "headline": string,
      "copy": string (2-3 sentences reinforcing the value they just claimed),
      "primary_next_step": string (immediate action — "Check your inbox", "Open the PDF", etc.),
      "soft_product_cta": {
        "text": string,
        "action": "generate" | "start_trial" | "book_call" | "view_demo" | "explore_app",
        "rationale": string (why this CTA at this moment)
      },
      "bonus_element": string (optional extra value — "While you wait, here's a bonus..." — or null)
    },
    "email_sequence": {
      "delivery_email": {
        "subject": string,
        "preview_text": string,
        "body": string (full email body — deliver the asset, set expectations, one soft CTA)
      },
      "nurture_emails": [
        {
          "day": number,
          "subject": string,
          "preview_text": string,
          "goal": string (what this email accomplishes in the conversion journey),
          "body": string (full email body — specific to this product, not generic),
          "cta": string (specific action with destination),
          "segmentation_note": string (how to branch based on engagement)
        }
      ]
    },
    "distribution_plan": [
      {
        "channel": string,
        "tactic": string (specific approach, not "post on social media"),
        "example_post_or_angle": string (actual draft copy or ad angle),
        "cta": string,
        "estimated_cpl_range": string (cost per lead estimate if paid channel),
        "volume_potential": "low" | "medium" | "high"
      }
    ],
    "measurement_and_testing": {
      "core_metrics": [
        {
          "metric": string,
          "target": string (specific benchmark range),
          "notes": string,
          "action_if_below_target": string (what to fix)
        }
      ],
      "ab_tests": [
        {
          "test": string,
          "hypothesis": string,
          "variants": [string, string, string],
          "success_metric": string,
          "minimum_sample_size": string
        }
      ],
      "tracking": {
        "utm_plan": {
          "utm_source": string (example values),
          "utm_medium": string (example values),
          "utm_campaign": string (example value),
          "utm_content": string (for A/B variant tracking)
        },
        "events": [
          {
            "event_name": string,
            "trigger": string,
            "properties": [string]
          }
        ]
      }
    }
  },
  "compliance_and_trust": {
    "niche_considerations": [string],
    "language_cautions": [string],
    "data_handling_notes": string,
    "opt_in_consent_requirements": string
  },
  "unknowns": [
    {
      "item": string,
      "why_unknown": string,
      "safe_placeholder": string,
      "how_to_resolve": string
    }
  ]
}

QUALITY CHECK
- Is the lead magnet tightly coupled to the product's core value? (Not a generic guide)
- Does the "time-to-value" path give the reader a real win in under 15 minutes?
- Is the opt-in page copy specific enough that only the target persona would find it compelling?
- Does the thank-you page capitalize on the highest-intent moment?
- Are the nurture emails specific to THIS product with concrete, useful content?
- Does the distribution plan match where this specific audience actually spends time?
- Would this blueprint pass review at a Fortune 500 acquisition marketing team?

Return JSON now.`;

// ── User Personas Prompt Template ─────────────────────────────────
const USER_PERSONAS_PROMPT_TEMPLATE = `You are a user research expert and customer psychology specialist at a Fortune 500-caliber product strategy agency.

Your task: generate a detailed, practical user persona system that aligns product, copy, design, sales, and support decisions for the selected app/idea.
This output should be indistinguishable from what a top-tier research consultancy (like IDEO, Forrester, or Nielsen Norman Group) would deliver after a comprehensive research engagement.

CRITICAL GROUNDING RULES (DO NOT VIOLATE)
- Use ONLY the BUSINESS CONTEXT provided below as your evidence source.
- Do NOT invent facts, logos, testimonials, case studies, exact market sizes, exact salary numbers, or compliance claims unless they are explicitly present in the BUSINESS CONTEXT.
- If the persona format requires a detail that is not present (e.g., age range, income), you may provide a reasonable hypothesis ONLY if:
  (1) you label it as an assumption (set "assumption": true),
  (2) you add a confidence level ("high" | "medium" | "low"),
  (3) you add a specific validation question that could confirm or deny the assumption.
- If there is any conflict inside the BUSINESS CONTEXT, highlight it in "open_questions" and pick the safer interpretation (less specific, less absolute).
- Avoid generic personas. Use specific pains, triggers, workflows, tool stacks, and language patterns that match the context.
- Every persona must feel like a real person the team could encounter tomorrow — not a marketing abstraction.

OUTPUT FORMAT
Return VALID JSON ONLY. No markdown. No code fences. No commentary.

DEPTH LEVEL: {{DEPTH}}
Depth control:
- "lean": 1 primary persona + 2 secondary + 2 anti-personas, concise messaging matrix
- "standard": 1 primary + 3 secondary + 3 anti-personas, full messaging matrix + implementation guide
- "deep": standard PLUS extra "jobs_to_be_done" (detailed), "buying_committee" context, and "experiment_plan" for persona validation

REQUIRED JSON SCHEMA (follow exactly)
{
  "meta": {
    "app_selected": string,
    "product_name": string,
    "market_type": string (B2B | B2C | B2B2C | marketplace),
    "business_model": string (SaaS | service | course | ecommerce | marketplace | content_media | other),
    "primary_audience_from_context": [string, ...] (direct quotes or close paraphrases from context),
    "top_pains_from_context": [string, ...],
    "top_value_promises_from_context": [string, ...],
    "notes_on_evidence_quality": string (how complete/reliable is the context? What's missing?)
  },

  "primary_persona": {
    "name": string (realistic first name + archetype label, e.g., "Sarah — The Overwhelmed Operator"),
    "archetype": string (2-3 word archetype),
    "role_title": string (specific job title or life role),
    "persona_card": {
      "quote": string (a sentence this person would actually say, revealing their core frustration or aspiration),
      "quick_stats": {
        "age_range": { "value": string, "confidence": "high" | "medium" | "low", "assumption": boolean, "validation_question": string },
        "location": { "value": string, "confidence": string, "assumption": boolean, "validation_question": string },
        "income_or_budget_authority": { "value": string, "confidence": string, "assumption": boolean, "validation_question": string },
        "experience_level": { "value": string, "confidence": string, "assumption": boolean, "validation_question": string },
        "tech_savviness": { "value": string, "confidence": string, "assumption": boolean, "validation_question": string }
      },
      "top_goals": [string, string, string],
      "top_pains": [string, string, string],
      "buying_triggers": [string, string, string] (specific events that make them search for a solution NOW),
      "top_objections": [string, string, string],
      "best_channels": [string, string, string] (where they actually consume content and make decisions)
    },
    "background": {
      "day_in_the_life": string (3-5 sentence narrative of a typical day, showing where the pain manifests),
      "environment": string (physical/digital environment they work in),
      "tool_stack_today": [string, ...] (tools they currently use — inferred from context),
      "constraints": {
        "time": string (how much time they can dedicate to evaluating/adopting a new solution),
        "budget": string (budget authority and spending flexibility),
        "attention": string (how many competing priorities fight for their focus),
        "organizational": string (approval processes, stakeholders, or political dynamics)
      }
    },
    "goals_and_motivations": {
      "primary_goals": [string, string, string] (what they're trying to accomplish professionally/personally),
      "secondary_goals": [string, string] (nice-to-haves that sweeten the deal),
      "success_metrics": [string, string, string] (how THEY measure success — not how we measure it),
      "aspirations": [string, string] (longer-term ambitions this product connects to),
      "emotional_drivers": [string, string] (the feelings they want: relief, confidence, control, recognition)
    },
    "pain_points_and_frustrations": {
      "functional_pains": [string, string, string] (what doesn't work mechanically),
      "emotional_pains": [string, string, string] (how the problem makes them FEEL),
      "financial_pains": [string, string] (money/resources wasted or at risk),
      "workflow_breakdowns": [string, string, string] (specific steps in their process that fail or bottleneck),
      "current_workarounds": [string, string] (what they cobble together today — these reveal the real job-to-be-done)
    },
    "behavioral_patterns": {
      "how_they_buy": string (describe the actual buying journey: research → compare → trial → decide),
      "decision_timeline": string (how long from first awareness to purchase?),
      "who_influences_them": [string, ...] (peers, managers, industry voices, review sites),
      "what_they_trust": [string, ...] (types of proof: case studies, peer recommendations, certifications, demos),
      "adoption_style": string ("innovator" | "early adopter" | "early majority" | "late majority" — with reasoning),
      "information_diet": string (how they consume information: newsletters, podcasts, LinkedIn, Reddit, conferences)
    },
    "objections_and_barriers": {
      "objections": [
        { "objection": string, "root_cause": string, "counter_strategy": string }
      ],
      "risks_they_fear": [string, string, string] (what could go wrong if they adopt),
      "trust_requirements": [string, string, string] (what they need to see before committing),
      "dealbreakers": [string, string] (non-negotiable requirements that instantly disqualify a solution)
    },
    "communication_preferences": {
      "channels": [string, ...] (ranked by influence),
      "content_formats": [string, ...] (video, long-form, checklists, interactive, webinars, etc.),
      "messaging_that_resonates": [string, string, string] (tones and frames that connect),
      "messaging_to_avoid": [string, string, string] (tones and frames that repel),
      "communities_and_influencers": [string, ...] (specific communities, publications, or thought leaders they follow),
      "language_patterns": [string, string, string] (actual phrases and jargon they use when describing the problem)
    },
    "jobs_to_be_done": [
      {
        "job": string (functional job statement: "When I [situation], I want to [motivation], so I can [outcome]"),
        "when": string (the trigger moment),
        "success_looks_like": string (measurable outcome),
        "current_solution": string (what they use today for this job),
        "switching_cost": string (what they'd have to give up to switch)
      }
    ],
    "evidence": {
      "supported_by_context": [
        { "claim": string, "context_path": string (which part of the business context supports this) }
      ],
      "assumptions": [
        { "assumption": string, "reasoning": string, "confidence": "high" | "medium" | "low", "validation_question": string }
      ]
    }
  },

  "secondary_personas": [
    {
      "name": string,
      "archetype": string,
      "role_title": string,
      "snapshot": {
        "who_they_are": string (2-3 sentence description),
        "top_goals": [string, string, string],
        "top_pains": [string, string, string],
        "why_they_switch": string (what trigger event pushes them to look for this solution),
        "top_objections": [string, string, string],
        "best_channels": [string, string, string],
        "key_difference_from_primary": string (what makes this persona's needs distinct)
      },
      "positioning_angle": string (how to frame the product specifically for this persona),
      "evidence": {
        "supported_by_context": [{ "claim": string, "context_path": string }],
        "assumptions": [{ "assumption": string, "confidence": string, "validation_question": string }]
      }
    }
  ],

  "anti_personas": [
    {
      "name": string (archetype label, e.g., "The Freeloader" or "The Enterprise Whale"),
      "who_they_are": string (2-3 sentence description),
      "why_poor_fit": [string, string, string] (specific reasons this product isn't for them),
      "how_to_identify": [string, string, string] (behavioral signals in the funnel that reveal them early),
      "avoid_messaging": [string, string] (copy angles that accidentally attract this persona),
      "cost_of_attracting": string (what goes wrong if you acquire this persona: churn, support load, bad reviews, etc.)
    }
  ],

  "persona_messaging_matrix": [
    {
      "persona_name": string,
      "primary_value_proposition": string (one sentence, specific to this persona),
      "pains_to_emphasize": [string, string, string],
      "proof_points_that_matter": [string, string] (or "PROOF_NEEDED: [what to collect]"),
      "objection_handling": [
        { "objection": string, "response_strategy": string, "proof_type_needed": string }
      ],
      "preferred_content_types": [string, string, string],
      "sample_copy": {
        "headline": string,
        "subheadline": string,
        "cta": string,
        "email_subject_line": string
      },
      "tone_and_voice": string (how to speak to this specific persona)
    }
  ],

  "implementation_guide": {
    "product_decisions": [
      { "decision_area": string, "persona_implication": string, "what_to_build_or_avoid": string, "priority": "high" | "medium" | "low" }
    ],
    "content_guidelines": [
      { "persona_name": string, "do": [string, string, string], "dont": [string, string, string], "content_calendar_themes": [string, string] }
    ],
    "campaign_targeting": [
      {
        "persona_name": string,
        "targeting_hypotheses": [string, string, string],
        "channels": [string, string],
        "offer_angle": string,
        "ad_copy_direction": string,
        "budget_allocation_suggestion": string
      }
    ],
    "sales_conversation_starters": [
      {
        "persona_name": string,
        "discovery_questions": [string, string, string],
        "demo_focus": [string, string],
        "closing_triggers": [string, string],
        "red_flags_to_watch": [string, string]
      }
    ],
    "support_playbook_notes": [
      {
        "persona_name": string,
        "high_risk_moments": [string, string, string],
        "retention_moves": [string, string, string],
        "escalation_triggers": [string, string],
        "communication_style": string
      }
    ]
  },

  "buying_committee": [
    {
      "role": string (e.g., "Economic Buyer", "Technical Evaluator", "End User Champion", "Blocker"),
      "persona_alignment": string (which persona this maps to),
      "what_they_care_about": [string, string, string],
      "how_to_win_them": string,
      "risk_of_ignoring": string
    }
  ],

  "experiment_plan": [
    {
      "hypothesis": string (e.g., "Our primary persona prefers video demos over written guides"),
      "test_method": string,
      "metric": string,
      "effort": "low" | "medium" | "high",
      "expected_insight": string,
      "priority": "high" | "medium" | "low"
    }
  ],

  "open_questions": [
    { "question": string, "why_it_matters": string, "how_to_validate": string, "impact_if_wrong": string }
  ],

  "quality_checks": {
    "feels_real_not_generic": boolean,
    "pains_are_specific_and_emotional": boolean,
    "goals_link_to_value_prop": boolean,
    "behaviors_are_actionable": boolean,
    "channels_are_plausible": boolean,
    "anti_personas_reduce_waste": boolean,
    "assumptions_are_labeled": boolean,
    "implementation_guide_is_actionable": boolean,
    "evidence_chain_is_traceable": boolean
  }
}

QUALITY CHECK
- Does every persona feel like a real person the team could encounter tomorrow — not a generic avatar?
- Are pains specific, emotional, and grounded in the business context?
- Do goals link directly to the product's value proposition?
- Are behavioral patterns actionable enough to inform ad targeting and sales scripts?
- Are channels plausible for this specific audience (not just "LinkedIn and Twitter")?
- Do anti-personas save real money by identifying who NOT to target?
- Is every assumption explicitly labeled with confidence and a validation question?
- Is the implementation guide specific enough that a marketing manager could act on it this week?
- Would this persona system pass review at a Fortune 500 product strategy team?

Return JSON now.

NOW GENERATE THE PERSONA SYSTEM using:
- app_selected: {{APP_SELECTED}}
- brand_voice_adjectives: {{BRAND_VOICE}}

BUSINESS CONTEXT (authoritative; do not contradict):
{{BUSINESS_CONTEXT}}`;

// ── Sales Funnel Prompt Template ──────────────────────────────────
const SALES_FUNNEL_PROMPT_TEMPLATE = `You are a conversion optimization expert and sales funnel strategist at a Fortune 500-caliber growth consultancy.

MISSION
Create a comprehensive, APP-SPECIFIC sales funnel system that guides prospects through each stage of the customer journey with maximum efficiency and conversion rates.
This output should be indistinguishable from what a top-tier conversion agency (like CXL, Conversion Rate Experts, or a McKinsey digital practice) would deliver after a full funnel audit.

DYNAMIC INPUT RULES (CRITICAL)
- You will be given a BUSINESS CONTEXT block below. Extract as many inputs as possible from it.
- If any input is missing, do NOT ask follow-up questions. Instead:
  1) Mark the field as "Unknown"
  2) Make a conservative assumption labeled [ASSUMPTION] with reasoning
  3) Provide 1–2 "what to confirm later" questions at the end
- Do NOT invent capabilities, integrations, compliance claims, customer counts, or performance numbers not supported by the context.
- Avoid generic "kitchen sink" lists. Make decisions:
  - Choose the best 2–3 acquisition channels for THIS business and justify why.
  - Choose ONE primary conversion event for each stage.
  - Specify KPIs and targets (use ranges if needed) and explain what drives each KPI.
- If the domain is regulated (health/finance/legal), flag compliance considerations and use cautious language.

TONE
Tactical, specific, and prioritized. No fluff. No hype. Every recommendation must be actionable within the first 90 days.

========================================================
INPUTS EXTRACTION (infer from BUSINESS CONTEXT)

Business Model
- Product/Service: [extract from context]
- Price Point: [extract from offer tiers if available]
- Sales Cycle: [infer from business type — self-serve vs. sales-assisted]
- Target Customer: [extract persona, market, audience]
- Business Type: [B2B | B2C | B2B2C | SaaS | E-commerce | Service | Marketplace]

Current Situation (mark Unknown if not in context)
- Traffic Sources: [infer from channels and audience behavior]
- Monthly Website Visitors: [Unknown unless stated]
- Current Conversion Rate: [Unknown unless stated — use industry benchmarks as [ASSUMPTION]]
- Average Order Value: [extract from pricing tiers]
- Customer Lifetime Value: [infer from continuity offer if available]

Marketing Assets (mark Unknown if not in context)
- Content Available: [infer from context]
- Lead Magnets: [extract from offer tiers — lead magnet tier]
- Email List Size: [Unknown unless stated]
- Social Media Following: [Unknown unless stated]
- Advertising Budget: [Unknown unless stated — provide 3-tier guidance]

Sales Process
- Sales Team: [infer: solo founder, small team, enterprise sales — based on business type]
- CRM System: [Unknown — recommend based on business type]
- Follow-up Process: [infer from sales cycle]
- Objection Handling: [extract from context — competitor analysis, proof signals, objections]
- Success Metrics: [extract from scores and analysis]

Competitive Context
- Market Position: [extract from opportunity score, market gap analysis]
- Price Comparison: [extract from competitor data]
- Differentiation: [extract from unique value proposition, market gap]
- Market Maturity: [infer from trend analysis, timing score]

========================================================
OUTPUT REQUIREMENTS (10 DELIVERABLES)

0) EXTRACTED INPUTS SNAPSHOT (MANDATORY)
Provide a compact table:
| Field | Value | Source |
Where Source = "Explicit from context" or "[ASSUMPTION]: reasoning"
Include an "Assumptions" bullet list with all inferred items and confidence levels.

---

1) FUNNEL STAGE ARCHITECTURE
For each stage, provide:
- **Stage Goal**: What success looks like at this stage
- **Primary Audience Mindset**: What the prospect is thinking/feeling
- **Primary Offer**: What they receive at this stage (content, trial, demo, product)
- **Primary Channel(s)**: Max 2, justified for THIS audience
- **Core Message Angle**: 1–2 sentences specific to this product's value proposition
- **CTA**: Specific call-to-action with exact wording
- **KPI Targets**: Ranges based on industry benchmarks with [ASSUMPTION] labels
- **Assets Needed**: Specific deliverables to create
- **Transition Trigger**: What moves them to the next stage

Stages:
A) **Awareness** (Top of Funnel) — They don't know the solution exists
B) **Interest** (Upper Middle Funnel) — They're exploring the problem space
C) **Consideration** (Lower Middle Funnel) — They're comparing solutions
D) **Decision** (Bottom of Funnel) — They're ready to commit
E) **Retention & Expansion** (Post-Purchase) — They're a customer; maximize LTV

---

2) CONVERSION OPTIMIZATION FRAMEWORK

A) **Landing/Opt-in Page Optimization**
- Above-the-fold structure: headline formula + subheadline + proof element + primary CTA
- Form strategy: optimal fields, friction reduction tactics, progressive profiling
- Trust and risk reducers: specific to this niche (not generic "money-back guarantee")
- Social proof plan: what to display (or PROOF_NEEDED placeholders)
- A/B test plan: 5 tests ranked by (impact × ease), each with hypothesis and success metric

B) **Email Marketing Sequences**
- Welcome/delivery sequence (3 emails): subject, goal, 3-bullet outline, CTA
- Nurture sequence (5 emails): mapped to specific objections + value themes from the context
- Conversion sequence (3 emails): mapped to decision triggers from the context
- Re-engagement sequence (2 emails): for leads who go cold
For each email: subject line, goal, 3-bullet content outline, primary CTA

C) **Sales Page / Demo Page Elements** (if sales-assisted)
- Page narrative arc: problem → cost of inaction → mechanism → proof → offer → risk reversal → CTA
- Objection handling blocks: top 5 objections with specific responses grounded in context
- Proof plan: what proof to gather if missing (PROOF_NEEDED placeholders)
- Urgency/scarcity approach: only if legitimate; otherwise use decision clarity framing

---

3) TRAFFIC GENERATION STRATEGY (PRIORITIZED)
Pick 2–3 "best-fit" channels for THIS business. Justify each choice.
For each channel:
- **Why this channel**: Specific reasoning tied to the audience and business model
- **Targeting approach**: Specific audiences, keywords, or communities
- **Content/ad angles**: 3 specific angles with draft copy hooks
- **Budget guidance**: 3 tiers — $0 (organic), Low ($500-2k/mo), Moderate ($2k-10k/mo)
- **First 2 weeks execution plan**: Day-by-day tactical steps
- **Expected performance range**: CPL, CPA ranges with [ASSUMPTION] labels

---

4) LEAD NURTURING SYSTEM
A) **Automation Map**: Trigger → Segment → Message → Next Action (flowchart-style)
B) **Lead Scoring**: Simple, practical rules (max 5 scoring criteria). Include:
   - Behavioral signals (page visits, email engagement, content downloads)
   - Demographic/firmographic signals (if B2B)
   - Score thresholds: Cold / Warm / Hot / Sales-Ready
C) **Sales-Ready Definition + Handoff Rules**: What qualifies a lead for human contact (or self-serve purchase trigger)
D) **Segment-Specific Nurture Paths**: At least 2 distinct paths based on entry point or behavior

---

5) SALES PROCESS OPTIMIZATION
(If sales-assisted: full framework. If self-serve: adapt for product-led conversion.)
- **Qualification Framework**: What to ask, what to reject, what to nurture further
- **Discovery Questions**: 10 questions that uncover real pain, budget, timeline, and decision process
- **Demo/Trial Strategy**: What to show first, how to personalize, what "aha moment" to engineer
- **Objection Handling Scripts**: Top 5 objections with word-for-word response frameworks grounded in context
- **Follow-up Cadence**: Specific touchpoints with timing and channel (email, call, video)
- **Closing Triggers**: Signals that indicate readiness to buy

---

6) ANALYTICS AND MEASUREMENT
A) **KPIs by Stage**: Table with metric name, target range, data source, and alert threshold
B) **Tracking Plan**: Events + properties + attribution model
   - Page events, form events, email events, conversion events, revenue events
   - UTM strategy for channel attribution
C) **Funnel Bottleneck Diagnosis**: Decision tree — "If X metric is below target, investigate Y and do Z"
D) **Reporting Cadence**: Daily (operational), Weekly (tactical), Monthly (strategic)

---

7) TECHNOLOGY STACK REQUIREMENTS
- **Essential tools**: Lightweight defaults appropriate for the business stage
- **Advanced integrations**: Only if justified by the funnel complexity
- **Data governance/privacy notes**: Only if relevant (e.g., GDPR, CCPA, healthcare data)
- **Build vs. Buy recommendations**: Where to invest vs. where to use existing tools
- For each tool: name, purpose, tier (free/starter/pro), and why it fits THIS business

---

8) IMPLEMENTATION PLAN (90-DAY ROADMAP)
**Day 0–7: Foundation + Quick Wins**
- Setup tasks, quick wins that can generate results immediately
- Owner: marketing / founder / contractor
- Effort estimate: hours per task

**Day 8–30: Build Core Funnel**
- Core assets to build, sequences to activate, tracking to implement
- Owner and effort for each item
- Success criteria: what "done" looks like

**Day 31–90: Optimize + Scale**
- A/B tests to run, channels to expand, automations to layer
- Performance review checkpoints (Day 45, Day 60, Day 90)
- Scale criteria: "Scale channel X when Y metric exceeds Z"

---

9) QUALITY CHECKLIST (SELF-AUDIT)
Before finalizing, verify:
- [ ] Funnel stages are measurable with named KPIs and specific targets
- [ ] Recommendations match the target persona's buying behavior and sophistication
- [ ] The plan is constrained and prioritized (not a giant wishlist)
- [ ] Assumptions are explicitly labeled with reasoning and confidence
- [ ] Testing plan includes hypotheses, success criteria, and sample size guidance
- [ ] Email sequences are specific to THIS product (not generic drip templates)
- [ ] Technology recommendations match the business stage and budget reality
- [ ] Implementation plan has clear owners and effort estimates
- [ ] The funnel would pass review at a Fortune 500 growth team

---

10) CONFIRM LATER (MAX 5 QUESTIONS)
List only the most critical missing details that would materially change the funnel strategy.
For each: what it is, why it matters, and what assumption you made in its absence.

========================================================
## BUSINESS CONTEXT
{{BUSINESS_CONTEXT}}

(Use this business context to inform ALL recommendations. Every funnel stage, channel choice, email angle, and conversion tactic should be grounded in this specific product, audience, and market — not generic best practices.)`;

// ── SEO Content Prompt Template ───────────────────────────────────
const SEO_CONTENT_PROMPT_TEMPLATE = `You are a senior conversion copywriter + UX writer + SEO strategist at a Fortune 500-caliber digital agency.

Your task: Generate a high-converting, SEO-optimized landing page content package for the app described in the APP BRIEF below.
This output should be indistinguishable from what a top-tier agency (like Siege Media, Animalz, or a HubSpot partner) would deliver after a full content + conversion audit.

The output will be used to dynamically render a landing page, so follow the required JSON schema exactly and keep copy modular, testable, and implementation-ready.

CRITICAL RULES
- Do NOT ask clarifying questions. If something is missing, make a reasonable assumption and list it in "assumptions" with reasoning.
- Do NOT invent hard facts (e.g., "used by 10,000 clinics", "99.9% uptime") unless explicitly provided in APP BRIEF.
- If keyword volumes/difficulty are not provided, output "TBD" and explain what data to collect.
- Maintain a consistent voice aligned to the brand voice in APP BRIEF (or default: clear, empathetic, confident, minimal hype).
- If the domain is regulated (health/finance/legal), include compliance-safe disclaimers and avoid claims that require certifications unless explicitly stated.
- Write for scanning: short paragraphs (2-3 lines max), bullets, concrete outcomes, specific use cases.
- Every headline, bullet, and CTA must be specific to THIS product — no generic filler.
- Output must be VALID JSON only. No markdown outside JSON. No code fences. No commentary.

SEO STRATEGY RULES
- Primary keyword should appear naturally in: h1, title tag, meta description, first 100 words of body copy, and at least 2 section headlines.
- Secondary keywords should be distributed across section headlines and body copy — not forced.
- Title tag: 50-60 characters, front-load the primary keyword.
- Meta description: 150-160 characters, include primary keyword and a compelling CTA.
- Slug: lowercase, hyphenated, keyword-rich, 3-5 words max.
- Include semantic variations and related terms throughout the copy to support topic authority.
- FAQ section should target long-tail question keywords relevant to the product category.

CONVERSION OPTIMIZATION RULES
- Hero section: outcome-first headline, specificity over cleverness, 3 supporting bullets max.
- Every section should have a clear job: educate, build trust, handle objections, or drive action.
- CTAs should escalate: soft ask early (learn more, see how) → hard ask later (start trial, buy now).
- Risk reducers should be real and specific (not "100% satisfaction guaranteed" unless supported).
- Social proof should be grounded in context or marked with PROOF_NEEDED placeholders.
- Pricing section: lead with value, anchor high, show the "best value" plan clearly.

OUTPUT JSON SCHEMA (FOLLOW EXACTLY)
{
  "page": {
    "appName": string,
    "pageGoal": "trial_signup" | "demo_request" | "waitlist" | "purchase" | "lead_capture",
    "primaryCTA": { "label": string, "href": string },
    "secondaryCTA": { "label": string, "href": string },

    "seo": {
      "slug": string (lowercase, hyphenated, 3-5 words, keyword-rich),
      "titleTag": string (50-60 chars, primary keyword front-loaded),
      "metaDescription": string (150-160 chars, keyword + CTA),
      "primaryKeyword": string,
      "secondaryKeywords": [string, string, string, string, string],
      "openGraph": {
        "ogTitle": string (different from titleTag — optimized for social sharing),
        "ogDescription": string (different from metaDescription — optimized for social clicks)
      },
      "structuredData": {
        "type": "SoftwareApplication" | "Product" | "Service",
        "suggestedSchema": string (brief description of what structured data to implement)
      },
      "internalLinkingSuggestions": [string, string, string] (pages/content to link to from this page)
    },

    "messaging": {
      "oneLiner": string (one sentence that captures the full value proposition),
      "positioning": string (2-3 sentences: what it is, who it's for, why it's different),
      "idealCustomerProfile": string (specific: role + context + pain state),
      "topPainPoints": [string, string, string, string] (specific, emotional, grounded in context),
      "topDesiredOutcomes": [string, string, string, string] (concrete, measurable where possible),
      "differentiators": [string, string, string] (what makes this meaningfully different, not "best in class" fluff),
      "proofPoints": [string, string, string] (real from context OR "PROOF_NEEDED: [what to collect]"),
      "voiceTone": string (describe the copy voice: e.g., "confident but not pushy, technical but accessible")
    },

    "sections": [
      {
        "id": "announcement_bar",
        "component": "AnnouncementBar",
        "text": string (short urgency/value message — only if legitimate from context; otherwise omit),
        "ctaLabel": string,
        "href": string
      },
      {
        "id": "hero",
        "component": "Hero",
        "h1": string (outcome-first, specific, includes primary keyword naturally),
        "subhead": string (expands on h1 — who it's for + key differentiator),
        "bullets": [string, string, string] (scannable benefits, not features),
        "ctaPrimary": { "label": string, "href": string },
        "ctaSecondary": { "label": string, "href": string },
        "ctaMicrocopy": string (trust line under CTA — e.g., "No credit card required · Free for 14 days"),
        "visualSuggestion": string (describe the ideal hero image/illustration/video),
        "socialProofBar": string (e.g., "Trusted by X teams" or "PROOF_NEEDED: [early adopter count or logo bar]")
      },
      {
        "id": "problem",
        "component": "Problem",
        "headline": string (name the pain — make them feel understood),
        "body": string (2-3 sentences expanding the problem — cost of inaction),
        "bullets": [string, string, string, string] (specific pain points from context),
        "transitionLine": string (bridge from problem to solution — "There's a better way")
      },
      {
        "id": "solution",
        "component": "ValueProps",
        "headline": string (introduce the solution with outcome framing),
        "subheadline": string (one sentence elaborating),
        "valueProps": [
          { "title": string, "description": string, "icon_suggestion": string },
          { "title": string, "description": string, "icon_suggestion": string },
          { "title": string, "description": string, "icon_suggestion": string },
          { "title": string, "description": string, "icon_suggestion": string }
        ]
      },
      {
        "id": "how_it_works",
        "component": "Steps",
        "headline": string,
        "subheadline": string,
        "steps": [
          { "step_number": 1, "title": string, "description": string, "visual_suggestion": string },
          { "step_number": 2, "title": string, "description": string, "visual_suggestion": string },
          { "step_number": 3, "title": string, "description": string, "visual_suggestion": string }
        ],
        "bottomCTA": { "label": string, "href": string }
      },
      {
        "id": "features",
        "component": "FeatureGrid",
        "headline": string,
        "subheadline": string,
        "features": [
          { "title": string, "description": string, "whoItsFor": string, "category": string },
          { "title": string, "description": string, "whoItsFor": string, "category": string },
          { "title": string, "description": string, "whoItsFor": string, "category": string },
          { "title": string, "description": string, "whoItsFor": string, "category": string },
          { "title": string, "description": string, "whoItsFor": string, "category": string },
          { "title": string, "description": string, "whoItsFor": string, "category": string }
        ]
      },
      {
        "id": "social_proof",
        "component": "SocialProof",
        "headline": string,
        "items": [
          {
            "type": "testimonial" | "metric" | "case_snippet" | "logo_bar" | "authority",
            "content": string (real from context OR "TESTIMONIAL_NEEDED: [what kind of person + result]"),
            "attribution": string | null
          }
        ]
      },
      {
        "id": "integrations",
        "component": "Integrations",
        "headline": string,
        "integrations": [string, ...] (only if mentioned in context; otherwise "TBD — list integrations when confirmed"),
        "body": string
      },
      {
        "id": "use_cases",
        "component": "UseCases",
        "headline": string,
        "useCases": [
          { "title": string, "persona": string, "scenario": string, "outcome": string },
          { "title": string, "persona": string, "scenario": string, "outcome": string },
          { "title": string, "persona": string, "scenario": string, "outcome": string }
        ]
      },
      {
        "id": "comparison",
        "component": "ComparisonTable",
        "headline": string,
        "compareAgainst": string (competitor or "old way" — from context),
        "rows": [
          { "feature": string, "us": string, "them": string }
        ],
        "footnote": string
      },
      {
        "id": "pricing",
        "component": "Pricing",
        "headline": string,
        "subheadline": string,
        "plans": [
          {
            "name": string,
            "price": string (from context or "TBD"),
            "unit": string (per month | per year | one-time | per user),
            "bestFor": string,
            "features": [string, string, string, string, string],
            "ctaLabel": string,
            "highlighted": boolean (true for recommended plan)
          }
        ],
        "pricingNotes": string,
        "guarantee": string (only if supported by context; otherwise "GUARANTEE_NEEDED: Consider adding a risk-free trial or money-back guarantee")
      },
      {
        "id": "faq",
        "component": "FAQ",
        "headline": string,
        "items": [
          { "q": string (target a long-tail question keyword), "a": string },
          { "q": string, "a": string },
          { "q": string, "a": string },
          { "q": string, "a": string },
          { "q": string, "a": string },
          { "q": string, "a": string }
        ]
      },
      {
        "id": "final_cta",
        "component": "FinalCTA",
        "headline": string (outcome-driven, emotionally compelling),
        "subhead": string (address final hesitation),
        "primaryCTA": { "label": string, "href": string },
        "secondaryCTA": { "label": string, "href": string },
        "riskReducer": string (specific trust line — trial, guarantee, or low-risk next step),
        "urgencyElement": string | null (only if legitimate from context)
      }
    ],

    "trustAndCompliance": {
      "trustSignals": [string, string, string] (badges, certifications, security notes — real from context or "TBD"),
      "disclaimer": string (compliance-safe language if regulated domain; otherwise general terms note),
      "privacyNote": string (brief GDPR/privacy reassurance for forms)
    },

    "experiments": {
      "abTests": [
        { "hypothesis": string, "whatToChange": string, "variant": string, "successMetric": string, "priority": "high" | "medium" | "low" },
        { "hypothesis": string, "whatToChange": string, "variant": string, "successMetric": string, "priority": string },
        { "hypothesis": string, "whatToChange": string, "variant": string, "successMetric": string, "priority": string },
        { "hypothesis": string, "whatToChange": string, "variant": string, "successMetric": string, "priority": string },
        { "hypothesis": string, "whatToChange": string, "variant": string, "successMetric": string, "priority": string }
      ]
    },

    "technicalSeo": {
      "pageSpeedNotes": [string, string, string] (recommendations for Core Web Vitals),
      "schemaMarkup": string (what structured data to add),
      "canonicalUrl": string (suggested canonical URL pattern),
      "hreflang": string | null (if international audience)
    }
  },

  "copyVariations": {
    "heroHeadlines": [string, string, string] (A/B/C variants — different angles),
    "heroSubheads": [string, string, string],
    "ctaLabels": [string, string, string, string] (test different action verbs),
    "valuePropOneLiners": [string, string, string] (different positioning angles),
    "metaDescriptionVariants": [string, string] (test different hooks for SERP CTR)
  },

  "contentStrategy": {
    "supportingPages": [
      { "title": string, "slug": string, "purpose": string, "targetKeyword": string }
    ],
    "blogTopics": [
      { "title": string, "targetKeyword": string, "searchIntent": "informational" | "commercial" | "navigational", "linkToLandingPage": boolean }
    ],
    "linkBuildingAngles": [string, string, string]
  },

  "assumptions": [
    { "assumption": string, "reasoning": string, "impactIfWrong": string }
  ],
  "sourceNotes": {
    "usedFieldsFromBrief": [string, ...],
    "missingFields": [string, ...],
    "proofGaps": [string, ...]
  }
}

QUALITY CHECK
- Does the h1 include the primary keyword naturally (not forced)?
- Is every section specific to THIS product (not generic "our platform helps you" filler)?
- Are CTAs escalating appropriately (soft → hard)?
- Do FAQs target real long-tail question keywords?
- Are all proof points grounded in context (or properly marked as PROOF_NEEDED)?
- Would this page rank, convert, AND build trust simultaneously?
- Is the copy scannable on mobile (short paragraphs, clear bullets, visible CTAs)?
- Would this output pass review at a Fortune 500 SEO + conversion team?

Return JSON now.

APP BRIEF (use this as the authoritative source of truth):
{{APP_BRIEF}}`;

// ── Tweet-Sized Landing Page Prompt Template ──────────────────────
const TWEET_LANDING_PROMPT_TEMPLATE = `You are a conversion copywriter and landing page strategist specializing in Tweet-Sized Landing Pages (TSLPs) at a Fortune 500-caliber growth agency.

A TSLP is the most distilled, high-conversion landing page format: a single screen with a photo, ultra-concise copy, and an email opt-in form. Think of it as a landing page that fits in a tweet — every word must earn its place.

NON-NEGOTIABLE RULES
1. TSLP copy must be <= {tslp_max_chars} characters TOTAL (the "hero_copy" field), including spaces and punctuation. This is a hard constraint — violating it breaks the format.
2. One goal only: email opt-in. No secondary CTAs. No "learn more." No pricing. Just capture the email.
3. Personality first: human, specific, non-corporate. Write like a person, not a brand. Voice should feel like a trusted friend who happens to be an expert.
4. Sell the transformation/outcome, not product features. The reader should see their future self, not a feature list.
5. Use ONE primary button label — clear, action-oriented, specific to the outcome.
6. Mobile-first simplicity: the entire page is a hero photo + copy + email form. Nothing else.
7. Every element must reduce friction: minimal form fields (email only, or email + first name max), trust microcopy under the button, no distracting navigation.

CRITICAL GROUNDING RULES
- Use ONLY facts from the provided APP JSON and BUSINESS CONTEXT below.
- Do NOT invent metrics, customer counts, testimonials, compliance claims, or partnerships.
- If a detail is missing, make a reasonable assumption and list it in "assumptions" — do NOT ask follow-up questions.
- If the domain is regulated (health/finance/legal), use cautious language and flag compliance considerations.

WHAT MAKES A GREAT TSLP
- The headline creates an "I need this" reaction in under 3 seconds
- The copy addresses ONE specific pain point and promises ONE specific outcome
- The visual suggestion reinforces the transformation (not the product)
- The button label completes the thought: "Yes, I want to [outcome]"
- The trust line removes the last objection: "Free · No spam · Unsubscribe anytime"
- The page loads instantly, looks gorgeous on mobile, and has zero distractions

COPYWRITING FRAMEWORK
Use this hierarchy for the {tslp_max_chars}-char copy:
1. Hook (pattern interrupt or specific pain) — first 60 chars must grab attention
2. Promise (the transformation or outcome) — what changes for them
3. Mechanism hint (optional, only if it fits) — how/why this works
The CTA button and trust line are separate from the {tslp_max_chars} limit.

Return output ONLY as valid JSON matching the schema below. No markdown. No code fences. No commentary.

OUTPUT JSON SCHEMA (FOLLOW EXACTLY)
{
  "tslp": {
    "app_name": string,
    "page_goal": "email_opt_in",
    "target_persona": string (specific: who this page is for in one sentence),
    "core_pain": string (the ONE pain this page addresses),
    "core_transformation": string (the ONE outcome this page promises),

    "hero_copy": {
      "text": string (THE copy block — must be <= {tslp_max_chars} characters total, including spaces and punctuation),
      "char_count": number (must be <= {tslp_max_chars}),
      "breakdown": {
        "hook": string (which part is the hook),
        "promise": string (which part is the promise),
        "mechanism_hint": string | null (optional mechanism, if included)
      }
    },

    "hero_copy_variants": [
      {
        "text": string (<= {tslp_max_chars} chars),
        "char_count": number,
        "angle": string (what persuasion angle this variant uses — e.g., "pain-first", "outcome-first", "curiosity", "social proof", "specificity")
      },
      {
        "text": string (<= {tslp_max_chars} chars),
        "char_count": number,
        "angle": string
      },
      {
        "text": string (<= {tslp_max_chars} chars),
        "char_count": number,
        "angle": string
      }
    ],

    "cta_button": {
      "label": string (action-oriented, specific to the outcome, completes "Yes, I want to..."),
      "label_variants": [string, string, string] (3 alternatives to A/B test)
    },

    "trust_microcopy": string (one line under the button — removes last objection, e.g., "Free · No credit card · Unsubscribe anytime"),

    "form": {
      "fields": [
        { "name": string, "label": string, "type": "email" | "text", "placeholder": string, "required": boolean }
      ],
      "submit_label": string (same as cta_button label for consistency)
    },

    "visual": {
      "hero_image_suggestion": string (describe the ideal photo/illustration — should reinforce the transformation, not the product),
      "mood": string (e.g., "warm, aspirational, clean", "bold, urgent, dark"),
      "color_palette_suggestion": string (2-3 colors that match the mood and audience),
      "typography_suggestion": string (font style: e.g., "clean sans-serif, large headline weight, readable body")
    },

    "meta": {
      "page_title": string (50-60 chars, optimized for search + social sharing),
      "meta_description": string (150-160 chars),
      "og_title": string (optimized for social sharing — curiosity-driven),
      "og_description": string (social-optimized, different from meta_description),
      "og_image_suggestion": string (what the social preview image should show)
    },

    "post_opt_in": {
      "thank_you_headline": string (reinforce their decision),
      "thank_you_body": string (what happens next + set expectations),
      "next_step_cta": {
        "label": string,
        "action": "share_page" | "check_inbox" | "explore_app" | "join_community",
        "rationale": string
      }
    },

    "distribution": {
      "social_post_variants": [
        {
          "platform": "twitter" | "linkedin" | "instagram" | "facebook" | "threads",
          "text": string (platform-appropriate copy that drives to the TSLP),
          "hook_style": string (e.g., "question", "bold claim", "story", "stat")
        },
        {
          "platform": string,
          "text": string,
          "hook_style": string
        },
        {
          "platform": string,
          "text": string,
          "hook_style": string
        }
      ],
      "bio_link_text": string (for link-in-bio tools — ultra-short description),
      "email_signature_line": string (one-liner for email signatures that drives to the page),
      "qr_code_use_case": string (where to use a QR code linking to this page)
    },

    "experiments": {
      "ab_tests": [
        {
          "test": string,
          "hypothesis": string,
          "variants": [string, string],
          "success_metric": string,
          "priority": "high" | "medium" | "low"
        }
      ],
      "optimization_sequence": [string, string, string, string, string] (ordered list of what to test first → last)
    },

    "performance_benchmarks": {
      "opt_in_rate_target": string (range, e.g., "15-30% for warm traffic, 5-12% for cold"),
      "page_load_target": string (e.g., "< 2 seconds on mobile"),
      "scroll_depth_target": string (e.g., "N/A — single screen, no scroll needed"),
      "share_rate_target": string (if applicable)
    }
  },

  "assumptions": [
    {
      "assumption": string,
      "reasoning": string,
      "impact_if_wrong": string
    }
  ],

  "source_notes": {
    "used_fields": [string, ...],
    "missing_fields": [string, ...],
    "compliance_notes": string | null
  }
}

QUALITY CHECK
- Is the hero_copy <= {tslp_max_chars} characters? (This is a dealbreaker — count carefully)
- Does the copy create an "I need this" reaction in under 3 seconds?
- Is the CTA button label specific to the outcome (not generic "Submit" or "Sign Up")?
- Does the visual suggestion reinforce the transformation, not just look "nice"?
- Are social post variants platform-appropriate (Twitter concise, LinkedIn professional, etc.)?
- Would this TSLP convert at 15%+ with warm traffic?
- Is every word earning its place? Could any word be removed without losing meaning?
- Would this pass review at a Fortune 500 growth team's landing page audit?

Return JSON now.

APP JSON (structured metadata):
{{APP_JSON}}

BUSINESS CONTEXT (authoritative — do not contradict):
{{BUSINESS_CONTEXT}}`;

// ── Feature Specs Prompt Template ──────────────────────────────────
const FEATURE_SPECS_PROMPT_TEMPLATE = `You are a Senior Product Manager + Technical Lead writing a developer-ready Feature Specifications Document.

Your task:
Generate a comprehensive feature spec for the selected app and selected feature. The output must be specific, testable, and implementation-ready.

Hard requirements:
- Output ONLY the Feature Specifications Document in Markdown.
- Do NOT leave placeholders like [brackets]. Fill everything with real content.
- If an input is missing, make a reasonable assumption and clearly label it as "Assumption:" inline (do not ask questions).
- Acceptance criteria must be written in Given/When/Then format and must be objectively testable.
- Include error states, empty states, permissions, and edge cases.
- Technical specs must include proposed API endpoints, data model/storage implications, and key implementation notes.
- Keep it aligned with the BUSINESS CONTEXT and the target market.
- Keep it internally consistent (names, endpoints, metrics, permissions).

Inputs you must use:

APP PROFILE
- App Name: {{app_name}}
- App One-Liner: {{app_one_liner}}
- Target Users: {{target_users}}
- Core Value Proposition: {{value_prop}}
- Key Integrations (current or planned): {{integrations}}
- Constraints (pricing, compliance, tech, timeline): {{constraints}}
- Current MVP scope (if known): {{mvp_scope}}
- Differentiation: {{differentiation}}

FEATURE REQUEST
- Feature Name: {{feature_name}}
- Feature Category: {{feature_category}} (Core/Enhancement/Integration/Performance)
- Priority Level: {{priority_level}} (Must-Have/Should-Have/Could-Have)
- Target Release: {{target_release}} (sprint/version)
- Feature Goal: {{feature_goal}}
- Primary Workflow Impacted: {{primary_workflow}}
- Platforms: {{platforms}} (web/mobile/api)
- Out of Scope: {{out_of_scope}}

BUSINESS CONTEXT (authoritative; base decisions on this)
{{business_context}}

Now produce the following document exactly in this structure and with this level of detail:

## FEATURE SPECIFICATIONS DOCUMENT

### 1. FEATURE OVERVIEW
Include: Feature Name, Category, Priority, Target Release, Problem Statement, Success Criteria (with measurable metrics), User Impact.

### 2. USER PERSONAS & USE CASES
Define Primary Persona and Secondary Persona (demographics, goals, pain points, context), plus edge cases.

### 3. DETAILED USER STORIES
Include an Epic and at least:
- Story 1: Core Functionality (with 2+ Given/When/Then acceptance criteria)
- Story 2: Error Handling (clear recovery, no data loss)
- Story 3: User Experience (loading, confirmations, patterns)

### 4. FUNCTIONAL REQUIREMENTS
List core functions with Input / Processing / Output / Validation. Include business rules, permissions, and integration requirements.

### 5. NON-FUNCTIONAL REQUIREMENTS
Performance, security, usability/accessibility, browser/device support, logging/audit.

### 6. TECHNICAL SPECIFICATIONS
Frontend requirements (components, state, routing, styling).
Backend requirements: API endpoints with request/response shapes, validation, error codes.
Database changes: tables/fields/indexes/migrations.
If analytics/ML is relevant, specify data pipelines, model inputs/outputs, and retraining/monitoring assumptions.

### 7. USER INTERFACE SPECIFICATIONS
Describe key screens, layout, navigation, interactive elements, empty/loading/error states, and responsive behavior.

### 8. TESTING REQUIREMENTS
Unit, integration, UAT scenarios, performance/security tests.

### 9. IMPLEMENTATION PLAN
Phases, dependencies, risks + mitigations. Provide realistic time estimates as ranges (e.g., 2–4 days) if not specified.

### 10. SUCCESS METRICS & MONITORING
Adoption metrics, technical metrics, business impact metrics, and monitoring setup (events to track + alerts).

Quality bar:
This document should be good enough that an engineering team can start implementation with minimal follow-up.`;

// ── MVP Roadmap Prompt Template ──────────────────────────────────
const MVP_ROADMAP_PROMPT_TEMPLATE = `You are a Principal Product Manager + Solutions Architect. Your job is to create a detailed 90-day MVP development roadmap that balances user value with technical feasibility.

You will be given an APP BRIEF + BUSINESS CONTEXT. Use ONLY that information plus reasonable, clearly-labeled assumptions. Do not invent unrealistic integrations, timelines, or costs. If key details are missing, make at most 5 assumptions and list them explicitly.

PRIMARY GOAL:
Produce a complete blueprint for building and launching a Minimum Viable Product in 90 days.

HARD CONSTRAINTS (must follow):
- Keep MVP scope tight: 3–5 Must-Have features only.
- Every Must-Have feature must map to the Key User Journey.
- Every Must-Have feature must include: user value, technical effort (Low/Medium/High), dependencies, and acceptance criteria.
- Plan must be realistically buildable by the stated team size and within the stated budget/time constraints.
- Prefer simple, proven tech choices unless the brief demands otherwise.
- Include privacy/security considerations if the product touches user data, analytics, payments, or integrations.
- Output MUST follow the exact markdown structure below.

APP BRIEF (insert dynamically based on selected app):
- App Name: {{app_name}}
- Product Type: {{product_type}} (e.g., B2B SaaS, marketplace, mobile app, internal tool, AI assistant)
- Target Users: {{target_users}}
- Pain / Job-to-be-done: {{pain}}
- Core Promise: {{core_promise}}
- Differentiator: {{differentiator}}
- Pricing / Monetization: {{pricing}}
- Key Integrations (if any): {{integrations}}
- Data Sensitivity / Compliance needs: {{compliance}}
- Team / Resources: {{team_size_and_roles}}
- Budget Range: {{budget_range}}
- Platform Constraints: {{platform_constraints}} (web/mobile, browsers, etc.)
- Launch Definition: {{what_counts_as_launch}}

BUSINESS CONTEXT (paste any extra research, market analysis, metrics targets, positioning, etc.):
{{business_context}}

NOW PRODUCE:

## 90-DAY MVP DEVELOPMENT ROADMAP

### 0. ASSUMPTIONS (only if needed)
- [List up to 5 assumptions max]

### 1. MVP SCOPE & DEFINITION
**Core Value Proposition**: [One sentence]
**Success Metrics**: [3-5 measurable metrics with target ranges]
**User Personas**: [1-3 primary personas]
**Key User Journey**: [Step-by-step main flow from discovery → setup → first value → ongoing value]

**MVP Boundaries**:
- **What's IN**: [Bulleted list]
- **What's OUT**: [Bulleted list]
- **Technical Constraints**: [Bulleted list: team, budget, timeline, compliance, integration limits]

### 2. FEATURE PRIORITIZATION MATRIX
**Must-Have Features** (Core MVP) — 3 to 5 features only:
For EACH feature include:
- **Feature**: [Name + brief description]
  - User Value:
  - Technical Effort: Low/Medium/High (1–2 sentences why)
  - Dependencies:
  - Acceptance Criteria: (3–6 bullet points written as testable statements)

**Should-Have Features** (Post-MVP):
- [3–6 bullets]

**Could-Have Features** (Future Versions):
- [3–8 bullets]

### 3. TECHNICAL ARCHITECTURE
**Technology Stack** (use sensible defaults):
- **Frontend**:
- **Backend**:
- **Database**:
- **Hosting**:
- **Third-party Services**: (analytics, auth, payments, integrations, observability)

**Architecture Decisions**:
- **Database Design**: [Key entities + relationships]
- **API Structure**: [Key endpoints or GraphQL operations]
- **Authentication**: [Approach + roles/permissions]
- **Data Ingestion/Sync** (if integrations): [sync strategy, rate limits, retries]
- **File Storage** (if needed):

**Technical Risks**:
- **Risk 1**: [risk] → Mitigation
- **Risk 2**: [risk] → Mitigation
- **Risk 3**: [risk] → Mitigation

### 4. USER STORIES & ACCEPTANCE CRITERIA
Create 3–6 epics that cover onboarding + core workflow + billing (if relevant) + admin/ops.
For each epic, provide 2–5 user stories, each with:
- Story statement ("As a..., I want..., so that...")
- 3–5 acceptance criteria
- Estimation (story points or hours) + confidence (High/Med/Low)

### 5. 90-DAY SPRINT PLAN
Break into 12 weeks (or 6 two-week sprints). Must include:
- **DAYS 1–30: FOUNDATION SPRINT** (Week 1–4)
- **DAYS 31–60: CORE FEATURES SPRINT** (Week 5–8)
- **DAYS 61–90: LAUNCH PREPARATION SPRINT** (Week 9–12)

For EACH week include:
- Engineering deliverables
- Product/UX deliverables
- Validation activity (demo, internal test, beta feedback, metric checkpoint)

### 6. TESTING STRATEGY
- Unit tests:
- Integration tests:
- End-to-end tests:
- User testing schedule with specific weeks and goals

### 7. RISK MITIGATION
- Technical risks:
- Timeline risks:
- Market risks:
For each: mitigation + early warning indicator (what signal shows risk is happening)

### 8. LAUNCH CRITERIA
**Technical Readiness**: [bullets]
**Business Readiness**: [bullets]
**Go/No-Go Checklist**: [10–15 checkboxes]
**Success Metrics (First 30 Days Post-Launch)**: [targets aligned to pricing and GTM]

### 9. POST-LAUNCH ITERATION PLAN
- Week 1–2 post-launch:
- Month 2–3 post-launch:
- Feedback collection loops:
- Next 5 candidate bets (ranked) with rationale

Writing rules:
- Be specific. Avoid vague statements like "improve UX."
- Tie recommendations back to target users, pain points, and monetization.
- When tradeoffs exist, state them explicitly and choose a default.`;

// ── GTM Strategy Prompt Template ──────────────────────────────────
const GTM_STRATEGY_PROMPT_TEMPLATE = `You are a startup GTM lead (B2B SaaS) with strong product marketing + demand gen + sales ops skills.

TASK:
Create a comprehensive go-to-market strategy that provides a clear roadmap for launching and scaling this business. Focus on the most effective channels and tactics based on the target audience and competitive landscape.

IMPORTANT RULES:
- Base all recommendations on the supplied BUSINESS CONTEXT. If details are missing, make at most 5 assumptions and list them explicitly.
- Be specific and operational (campaigns, assets, timelines, metrics). Avoid vague advice like "build a community."
- Prioritize focus over breadth: choose exactly 3 primary channels, ranked, and justify why.
- Ensure channel choice matches the buying motion (self-serve vs sales-assisted vs enterprise).
- Tie messaging, content, and sales process to the buyer's pains, objections, and decision process.
- Provide budgets and KPIs that are plausible for the stated resources.
- Output MUST follow the exact markdown structure.

APP BRIEF (insert dynamically based on selected app):
- App Name: {{app_name}}
- Category: {{category}} (B2B SaaS, consumer app, marketplace, etc.)
- Target Buyer: {{buyer_title_and_role}}
- Target User (if different): {{user_role}}
- ICP Filters: {{industry_company_size_geography_tech_stack}}
- Primary Pain / Job-to-be-done: {{primary_pain}}
- Core Promise / Outcome: {{core_promise}}
- Differentiator: {{differentiator}}
- Pricing & Packaging: {{pricing}}
- Sales Motion Desired: {{sales_motion_preference_or_unknown}}
- Key Integrations / Dependencies: {{integrations}}
- Compliance / Security needs: {{compliance}}
- Resources: {{team_and_time}}
- Budget Range for GTM (90 days): {{gtm_budget_range}}
- Constraints: {{constraints}}

BUSINESS CONTEXT (paste research, scores, competitive notes, channel signals, etc.):
{{business_context}}

NOW PRODUCE:

## GO-TO-MARKET STRATEGY

### 0. ASSUMPTIONS (only if needed; max 5)
- [Assumption 1]
- ...

### 1. MARKET ANALYSIS SUMMARY
**Target Market Size**: [TAM, SAM, SOM breakdown. If unknown, provide an estimate + the method/assumptions.]
**Primary Customer Segments**:
- Segment 1: [Demographics/firmographics, psychographics, pains, triggers, buying constraints]
- Segment 2: [...]
- Segment 3: [...]

**Competitive Landscape**: [Competitor categories + likely alternatives + positioning gaps]
**Market Timing**: [Why now + what changed + why urgency is rising]

### 2. POSITIONING & MESSAGING
**Core Value Proposition**: [One sentence outcome with a measurable benefit]
**Positioning Statement**: [For (ICP), who (pain), our product (category) provides (outcome), unlike (alternatives), because (differentiator).]

**Messaging Framework**:
- **Primary Message**: [Main promise]
- **Supporting Messages**: [3-4 differentiators]
- **Proof Points**: [Specific evidence you would create or collect: beta metrics, demos, benchmarks, testimonials]
- **Call to Action**: [Exact CTA and next step]

**Message Testing**: [3-5 fast tests: landing page A/B, LinkedIn post tests, cold email variants, webinar title tests; include success criteria]

### 3. CHANNEL STRATEGY (Prioritized)
Pick EXACTLY 3 primary channels. For each:
- **Why This Channel**: [Audience alignment + CAC potential + founder feasibility + speed to signal]
- **Tactics**: [Concrete campaigns, outreach loops, content formats, ad sets, partnerships, communities]
- **Timeline**: [Phased plan over 90 days with milestones]
- **Budget**: [Expected spend + what it buys; include low-budget option if needed]
- **Success Metrics**: [Leading + lagging KPIs, targets, measurement method]
- **Risks**: [What could go wrong + mitigation]
Also:
- For Channel 2: include **Integration**: how it supports Channel 1.
- For Channel 3: include **Scaling Plan**: how to scale if it works.

### 4. CONTENT MARKETING STRATEGY
**Content Pillars** (3-4 themes):
- Pillar 1: [...]
- Pillar 2: [...]
- Pillar 3: [...]
- Pillar 4: [...]

**Content Calendar** (First 90 Days):
**Week 1-2**: [...]
**Week 3-4**: [...]
**Week 5-8**: [...]
**Week 9-12**: [...]

**Content Distribution**:
- **Owned Channels**: [...]
- **Earned Channels**: [...]
- **Paid Channels**: [...]

### 5. SALES PROCESS DESIGN
Define the sales motion (self-serve / sales-assisted / enterprise) and explain why it fits pricing + complexity.

**Sales Funnel Stages**:
1. **Awareness**: [...]
2. **Interest**: [...]
3. **Consideration**: [...]
4. **Decision**: [...]
5. **Retention**: [...]

**Sales Enablement**:
- **Sales Collateral**: [Exact assets to create]
- **Objection Handling**: [Top objections + responses]
- **Competitive Intelligence**: [Comparison guide outline]
- **Training Materials**: [Demo script, qualification checklist, discovery questions]

### 6. PARTNERSHIP STRATEGY
**Strategic Partnerships**:
- **Type 1**: [Integration partners]
- **Type 2**: [Channel partners/affiliates]
- **Type 3**: [Associations/communities]

**Partnership Development**:
- **Identification**: [...]
- **Outreach**: [2-3 short templates or talk tracks]
- **Enablement**: [...]
- **Management**: [...]

### 7. LAUNCH SEQUENCE
**Pre-Launch (30 days before)**:
- Week 1: [...]
- Week 2: [...]
- Week 3: [...]
- Week 4: [...]

**Launch Week**:
- Day 1: [...]
- Day 2-3: [...]
- Day 4-5: [...]
- Day 6-7: [...]

**Post-Launch (90 days)**:
- Month 1: [...]
- Month 2: [...]
- Month 3: [...]

### 8. METRICS & KPIs
Define targets for the first 90 days and how to track them.

**Awareness Metrics**: [...]
**Acquisition Metrics**: [...]
**Revenue Metrics**: [...]
**Operational Metrics**: [...]

### 9. BUDGET ALLOCATION
**Total GTM Budget**: [90-day total]
**Channel Breakdown**:
- Channel 1: [% + $]
- Channel 2: [% + $]
- Channel 3: [% + $]
- Content Creation: [% + $]
- Sales Enablement: [% + $]
- Technology/Tools: [% + $]

**ROI Projections**: [Quarterly projection with assumptions; include best/base/worst case]

### 10. RISK MITIGATION
**Channel Risks**: [3 risks + mitigation]
**Contingency Plans**:
- If Channel 1 underperforms: [...]
- If budget is reduced: [...]
- If competition intensifies: [...]

Writing requirements:
- Use numbers whenever possible (targets, conversion rates, timelines).
- Make recommendations feasible for the stated team + budget.
- If you're unsure, state assumptions transparently.`;

// ── Customer Interview Guide Prompt Template ──────────────────────────────────
const CUSTOMER_INTERVIEW_GUIDE_PROMPT_TEMPLATE = `You are a user research expert and customer development specialist.
Create a comprehensive customer interview guide that uncovers genuine insights, validates assumptions, and discovers unexpected opportunities.

You will be given a RESEARCH BRIEF (objectives, hypotheses, participants, logistics) and a BUSINESS CONTEXT (what we're building, current solutions, monetization, alternatives).
Use ONLY that information plus clearly-labeled assumptions (max 5). Do not ask follow-up questions.

NON-NEGOTIABLE RULES:
- Do NOT sell, pitch, or defend the product in the guide.
- Prefer past behavior over future intent ("Tell me about the last time...").
- Use neutral, open-ended questions. Avoid leading language.
- Always probe for: frequency, severity, time cost, monetary impact, stakeholders, current workaround/tools, decision process, and switching barriers.
- Timebox the guide to the stated interview length.
- Output MUST follow the exact markdown structure below.

INPUTS (insert dynamically based on selected app / research need)

## RESEARCH OBJECTIVES
Primary Question: {{primary_question}}
Stage: {{stage}}  (Problem validation | Solution validation | Product-market fit | Growth)
Hypothesis to Test: {{hypothesis}}
Success Criteria: {{success_criteria}}  (what evidence validates or invalidates)
Timeline: {{timeline}}

## TARGET PARTICIPANTS
Primary Segment: {{primary_segment}}
Secondary Segments: {{secondary_segments}}
Participant Criteria: {{participant_criteria}}
Interview Count: {{interview_count}}
Recruitment Method: {{recruitment_method}}

## BUSINESS CONTEXT
Product/Service: {{product_service}}
Problem Being Solved: {{problem_being_solved}}
Current Solution: {{current_solution}}
Business Model: {{business_model}}
Competitive Landscape: {{competitive_landscape}}

## INTERVIEW LOGISTICS
Interview Length: {{interview_length}} (30/45/60)
Interview Format: {{interview_format}}
Recording Preference: {{recording_preference}}
Incentive: {{incentive}}
Follow-up Plans: {{follow_up_plans}}

## AUTHORITATIVE BUSINESS CONTEXT
{{business_context}}

NOW PRODUCE:

# CUSTOMER INTERVIEW GUIDE

## 0. ASSUMPTIONS (only if needed; max 5)
- ...

## 1. Pre-Interview Preparation
### Participant Screening Questions
Include:
- Qualifying criteria verification
- Background/context
- Problem experience confirmation
- Current solution usage (tools, process)
- Decision-making authority + budget involvement
- Disqualifiers (who NOT to interview)

### Interview Setup
Include:
- Calendar booking instructions (time zones, buffers)
- Pre-interview email template (plain text)
- Technology testing requirements (audio/video/recording)
- Recording consent process (exact script + opt-out path)
- Incentive delivery method + timing
- Note-taking system (who captures what; suggested template)

## 2. Opening Framework (5-10 minutes)
### Rapport Building Script
Provide a word-for-word opener:
- thanks + context
- purpose (learning, not selling)
- structure + time expectations
- recording permission + confidentiality
- permission to ask follow-ups + "wrong answers don't exist"

### Participant Background Questions
Cover:
- Role + responsibilities
- Company context (size, industry, clients)
- Experience with the problem domain
- Decision-making process + stakeholders
- Current tools and workflows (what they actually use)

## 3. Problem Discovery (timeboxed appropriately)
### Current State Exploration
Use "walk me through" and "tell me about the last time" questions.
Probe for:
- triggers/events that cause the workflow
- steps in the workflow
- who is involved
- what "good" looks like today
- where it breaks

### Pain Point Validation
Quantify:
- frequency
- severity (1-10) + why
- time cost (minutes/hours)
- business impact (missed revenue, client churn risk, stress, reputation)
- what happens if they don't solve it

### Workaround Analysis
Probe:
- current tools (and why those were chosen)
- what works well / doesn't work
- what they've tried before + why it failed
- switching costs + risks
- data/security/compliance constraints (if applicable)

## 4. Solution Validation (timeboxed appropriately)
### Solution Exploration
Ask:
- magic wand / ideal future state
- must-haves vs nice-to-haves
- how it should fit into workflow
- integrations required
- trust requirements (accuracy, explainability, permissions)

### Concept Testing (include only if relevant to Stage)
Provide a neutral concept-test flow:
- "think aloud" instructions
- first impression questions
- comprehension check ("what do you think this does?")
- comparison to current approach
- concerns + adoption blockers
- what would make it a "no"

### Purchase Intent & Pricing (ask carefully; avoid hypotheticals)
Cover:
- prior purchases of similar tools (what they paid, why)
- how budgets are approved
- who signs / who blocks
- what ROI threshold is needed
- expected pricing range and packaging preferences
- switching timeline + implementation expectations

## 5. Closing & Next Steps (5-10 minutes)
### Additional Insights
Ask:
- what you didn't ask
- advice to the builder
- biggest "wow" factor
- dealbreakers

### Referrals & Follow-up
Ask:
- who else has this problem
- permission to intro/referral
- permission to follow up
- willingness to beta test (what conditions must be true)

## 6. Interview Analysis Framework
Provide:
### Pattern Recognition
- themes to tag
- language to capture verbatim
- common workflows
- recurring objections
- surprises

### Assumption Validation
- mapping: hypothesis -> confirming evidence -> disconfirming evidence
- decision rules: when to pivot vs persist
- new hypotheses to test next

### Prioritization Insights
- ranking method for pains (severity x frequency x willingness-to-pay)
- feature signals to watch (pull vs push)
- GTM signals (channels, trust builders, proof)

## 7. Interview Question Bank
Provide categorized extra questions:
### Problem Discovery Questions
- ...
### Solution Validation Questions
- ...
### Pricing & Purchase Questions
- ...

## 8. Interview Best Practices
Include:
- question technique reminders
- active listening cues
- bias avoidance rules
- handling "feature request" tangents
- how to probe without leading

## 9. Quality Checklist
Provide a checklist that is actionable and short.

## 10. Example Interview Opener
Provide a polished word-for-word opener using the business context.`;

// ── Competitive Analysis Prompt Template ──────────────────────────────────
const COMPETITIVE_ANALYSIS_PROMPT_TEMPLATE = `You are a prompt architect for a product-ideation platform.

GOAL
Generate a single, copy/paste-ready PROMPT that instructs an LLM to produce a comprehensive competitive analysis for a specific selected app/idea. The competitive analysis must identify market gaps, positioning opportunities, and strategic advantages.

INPUTS YOU WILL RECEIVE
1) SELECTED_APP_CONTEXT: a JSON/YAML/freeform block describing the selected product/idea (target users, problem, value prop, pricing, business model, channels, constraints, risks, etc.).
2) OPTIONAL_SYSTEM_CONSTRAINTS: (optional) constraints like geography, compliance, budget, tooling, timelines, what research sources are allowed, or whether browsing is allowed.

WHAT TO OUTPUT
Output ONLY the final competitive-analysis generation prompt (no commentary). The output must be in Markdown and must contain these parts, in this order:

PART 1 — ROLE & TASK
- Start with: "You are a competitive intelligence expert and market research specialist..."
- State the objective: create a comprehensive competitive analysis that identifies market gaps, positioning opportunities, and strategic advantages.

PART 2 — INPUT REQUIREMENTS (FORM)
Create a section titled "INPUT REQUIREMENTS" that asks for:

A) Business Context
- Your Product/Service
- Your Target Market
- Your Value Proposition
- Your Business Model
- Your Stage (Idea, MVP, Growth, Scale)

B) Market Scope
- Primary Market
- Adjacent Markets
- Geographic Scope
- Market Size (TAM/SAM/SOM if known)
- Growth Rate (market growth trends)

C) Known Competitors
- Direct Competitors
- Indirect Competitors
- Substitute Solutions
- Emerging Threats
- Unknown Competitors (gaps in knowledge)

D) Research Resources
- Available Budget (for paid research tools)
- Research Tools (you have access to)
- Time Available
- Team Involvement
- Information Sources (reports, contacts, etc.)

IMPORTANT: Pre-fill any obvious fields using SELECTED_APP_CONTEXT (product name, audience, pricing, business model, stage, positioning, likely adjacent markets). If information is missing, leave placeholders like: [TBD / Provide].
Do NOT invent competitor names unless the user explicitly requests discovery.

PART 3 — OUTPUT DELIVERABLES (SYSTEM)
Create a section titled "OUTPUT DELIVERABLES" that instructs the model to produce a complete competitive intelligence system with these sections:

1) Competitive Landscape Map
- Market Categorization (Direct / Indirect / Substitute / Adjacent)
- Positioning Matrix (Price vs Quality; Simple vs Complex; Enterprise vs SMB; Horizontal vs Vertical)
- Market Share Analysis (revenue/customer estimates, segment penetration, growth comparisons, funding data)

2) Individual Competitor Deep Dives (for each major competitor)
- Company Overview (founded, HQ, team size, funding/valuation, business model, geographic presence)
- Product Analysis (core features, UX, tech stack, integrations, platforms)
- Go-to-Market Strategy (segments, pricing, sales channels, messaging, partnerships)
- Customer Intelligence (reviews, case studies, satisfaction signals, retention signals)
- Financial Performance (revenue trends, CAC hints, ACV, runway — explicitly note if estimates)

3) SWOT Analysis Matrix (for each competitor)

4) Gap Analysis & Opportunities
- Unmet Customer Needs
- Market White Spaces
- Differentiation Opportunities

5) Competitive Response Planning
- Defensive strategies
- Offensive strategies

6) Monitoring & Intelligence System
- Regular tracking topics
- Information sources
- Alert system

PART 4 — RESEARCH METHODOLOGY & FRAMEWORKS
Include "RESEARCH METHODOLOGY" and "ANALYSIS FRAMEWORK" sections that specify:
- Primary vs secondary research approaches
- Tooling categories (traffic, SEO, social listening, reviews, financial databases)
- Quantitative metrics vs qualitative assessment
- Risk assessment approach (threat level, likelihood of response, switching costs, network effects)

PART 5 — REPORT STRUCTURE (FINAL OUTPUT FORMAT)
Require the competitive analysis to be delivered in this structure:
- Executive Summary
- Market Overview + Competitor Profiles (top 5-10 or fewer if data is limited)
- Opportunity Analysis
- Recommendations

PART 6 — QUALITY CHECKLIST
Add a checklist ensuring:
- Credible sources and data hygiene
- Recency (flag any stale data)
- Clear separation of facts vs assumptions
- Actionable opportunities + threats prioritized by impact
- Recommendations aligned with team capabilities and constraints
- Ethical/legal research standards

PART 7 — EXAMPLE COMPETITOR PROFILE
Include one generic example competitor profile with quick stats + strengths/weaknesses/pricing/threat level.

PART 8 — BUSINESS CONTEXT INJECTION
Append a section titled "## BUSINESS CONTEXT"
and paste SELECTED_APP_CONTEXT verbatim (preserve formatting).
Then add one line:
"Use this business context to inform all recommendations, ensuring they're specifically tailored to this opportunity and target market."

SOURCE & UNCERTAINTY RULES (MUST APPEAR IN THE GENERATED PROMPT)
- Require explicit labeling of:
  - "Verified" (backed by a named source), "Estimated" (reasoned estimate), and
  - "Assumption" (no data).
- If browsing or external research is allowed, require citations per competitor (website, pricing page, reviews, funding announcements).
- If browsing is not allowed, require an "Evidence Needed" list for each competitor with the exact sources to check.

NOW GENERATE THE FINAL COMPETITIVE ANALYSIS PROMPT.
INPUTS:
SELECTED_APP_CONTEXT:
{{SELECTED_APP_CONTEXT}}

OPTIONAL_SYSTEM_CONSTRAINTS (if any):
{{OPTIONAL_SYSTEM_CONSTRAINTS}}`;

// ── Pricing Strategy Prompt Template ──────────────────────────────────
const PRICING_STRATEGY_PROMPT_TEMPLATE = `You are a B2B SaaS pricing strategist and revenue optimization expert.

MISSION
Develop a comprehensive, BUSINESS-SPECIFIC pricing strategy that maximizes revenue while providing clear value to customers. Include pricing tiers, value metrics, psychological pricing, competitive positioning, and an optimization plan.

DYNAMIC INPUT RULES (IMPORTANT)
- You will receive a BUSINESS CONTEXT block (may be long). Extract as many pricing-relevant details as possible from it.
- If a required input is missing, do NOT ask follow-up questions mid-output. Instead:
  1) mark the field as "Unknown"
  2) make a conservative assumption labeled [ASSUMPTION]
  3) include the missing item in a "Confirm Later" section at the end (max 5 questions).
- Do not invent features, integrations, compliance claims, customer counts, market shares, or competitor pricing. If competitor data is missing, create a research plan and placeholders.
- Avoid a "kitchen sink" tier list. Make decisions:
  - Choose ONE primary value metric (what customers pay for).
  - Choose 1-2 secondary expansion levers (add-ons or usage).
  - Create tiers that ladder logically and make upgrades inevitable via clear constraints.

TONE
Direct, practical, and specific. No fluff.

========================================================
INPUTS (may be partially filled; infer from BUSINESS CONTEXT)

Pricing Objectives
- Revenue target (MRR/ARR):
- Positioning (premium/competitive/value):
- Growth strategy (acquisition vs revenue optimization):
- Target LTV + payback period:

Success Metrics
- Trial -> paid conversion:
- ARPU target:
- Churn target:
- Price sensitivity notes:

Market & Competitive Context
- Primary competitors (names):
- Alternatives (DIY tools, agencies, generic BI tools):
- Differentiation:
- Market maturity:

Product & Packaging Inputs
- Target persona:
- Core job-to-be-done:
- Key outcomes (time saved, money saved, risk reduced):
- Primary cost drivers (API costs, seats, data volume, integrations, alerts, retention):
- Support/implementation expectations:
- Sales model (self-serve vs sales-assisted):

========================================================
OUTPUT REQUIREMENTS (DELIVERABLES)

0) Extracted Inputs Snapshot (MANDATORY)
- Provide a compact table:
  Field | Value | Source (Explicit from context vs [ASSUMPTION] vs Unknown)
- Include an "Assumptions" list.

1) Pricing Objectives & Strategy (SPECIFIC)
- Primary goals (revenue vs adoption vs expansion)
- Pricing principles (simple, transparent, expansion-friendly)
- One-sentence pricing narrative ("We charge based on ____ because ____")

2) Choose the Value Metric + Pricing Model (CRITICAL SECTION)
Recommend:
- Pricing model: subscription | subscription + usage | per-seat | per-account | per-client | per-integration | hybrid
- Primary value metric (ONE): e.g., "per client workspace", "per connected data source", "per brand dashboard"
- Why this metric matches:
  - customer value created
  - willingness to pay
  - cost to serve
  - scalability and expansion
- Secondary (1-2 max): e.g., extra connectors, extra client workspaces, higher refresh rates, predictive alerts, white-label, retention windows.

3) Tier & Packaging Design (3 tiers + optional add-ons)
Provide:
A) Tier table with:
- Tier name
- Monthly price
- Annual price (discount %)
- Included units (based on value metric)
- Overage pricing or upgrade trigger
- Key features (only those supported by context)
- Limits (the "why upgrade" constraints)
- Support level
- Best-fit segment

B) Packaging logic:
- What each tier is optimized for (starter value / growth / enterprise)
- Why the middle tier exists (decoy/anchor logic if relevant)
- "Upgrade moments" mapped to user behavior

C) Add-ons & services (only if justified):
- Onboarding / implementation
- Additional units (extra workspaces/connectors)
- White-label / client branding packs
- Consulting/training
For each: price suggestion + what it includes + who buys it.

4) Competitive & Alternatives Analysis (NO FAKE DATA)
- Competitive set (tools and substitutes) + positioning map:
  - Complexity vs simplicity
  - Generic vs niche
  - Reactive reporting vs predictive intelligence
- Competitive pricing table:
  - If competitor prices are unknown: create placeholders and a "research plan":
    What to look up + where it matters (list price, usage limits, onboarding fees, contract terms).
- Differentiation-based pricing rationale:
  - what premium is justified for
  - what must stay cheap to reduce friction

5) Psychological Pricing (ETHICAL + TRANSPARENT)
Use only techniques that remain honest:
- Anchoring: what is the reference price (time cost, consultant cost, agency cost)
- Decoy effect: how tiers nudge upgrades (if used)
- Annual plan framing (discount + months free)
- Risk reducers: free trial, guarantee, cancel-anytime, onboarding help
Avoid manipulative urgency or hidden fees.

6) Revenue Model & Sensitivity (LIGHTWEIGHT)
Provide:
- 3 scenarios (conservative / base / aggressive) with:
  - # customers, ARPU, MRR, churn assumption
- Sensitivity levers:
  - If churn rises, what pricing change helps?
  - If conversion is low, what packaging change helps?
  - If COGS is high (API), what limit/overage protects margin?

7) Pricing Experiments & Optimization Plan
A/B test plan (ranked by impact x ease):
- price point tests (2-3 variants)
- packaging tests (limits and included units)
- trial design (7/14/30 days, credit card vs no card)
- annual plan framing tests
For each test:
- hypothesis
- success metric
- guardrail metric (e.g., churn, support load)

8) Implementation Roadmap & Policy
- Phase 1 (launch): simple tiers + clear value metric
- Phase 2 (optimize): test + refine limits/overages
- Phase 3 (scale): enterprise + annual + procurement-ready terms
Include:
- discounting policy (who qualifies, caps)
- grandfathering policy (if price increases)
- internal readiness checklist (billing, analytics, support)

9) Pricing Page Messaging (COPY SPEC)
Provide:
- Pricing page headline + subhead
- One-liner for each tier
- "What's included" bullets
- FAQ (5-8): billing, discount, limits, onboarding, data/privacy (only if supported)

10) Quality Checklist (SELF-AUDIT)
- Value metric aligns with value + cost-to-serve
- Tiers create natural upgrade paths
- Limits are clear and fair
- No invented competitor pricing or market share
- Experiments include guardrails
- Assumptions labeled and unknowns listed

11) Confirm Later (MAX 5 QUESTIONS)
Ask only the most critical missing details that would change pricing decisions.

========================================================
## BUSINESS CONTEXT
{{BUSINESS_CONTEXT}}

Use this business context to inform all recommendations, ensuring they're specifically tailored to this opportunity and target market.`;

// ── KPI Dashboard Prompt Template ──────────────────────────────────
const KPI_DASHBOARD_PROMPT_TEMPLATE = `You are a Business Intelligence Lead and startup metrics operator.

Goal:
Create a comprehensive KPI Dashboard System for the selected business/app that keeps the team focused on the metrics that drive growth. The system must be actionable, measurable, and implementable in common tools.

Hard requirements:
- Output ONLY the KPI Dashboard System in Markdown.
- Do NOT leave placeholders like [brackets]. Fill with real, specific content.
- If an input is missing, make a reasonable assumption and label it clearly as "Assumption: ..." inline.
- Prefer actionable, controllable metrics; exclude vanity metrics explicitly.
- Maintain a 70/30 split favoring leading indicators (with clear linkage to lagging outcomes).
- Every metric must include: definition, formula, owner, update frequency, source of truth, and recommended breakdowns (segments).
- Provide Green/Yellow/Red thresholds and what action to take at Yellow/Red.
- Tailor metric choices and targets to the business model and stage.
- Keep everything concrete: names, formulas, targets, cadence, and tool implementation details.

INPUTS (use all of these):
BUSINESS / APP PROFILE
- Business Name: {{business_name}}
- Product/App Name (if different): {{app_name}}
- Business Model: {{business_model}} (SaaS / E-commerce / Marketplace / Service / Other)
- Stage: {{stage}} (Pre-launch / MVP / Growth / Scale)
- Revenue Model: {{revenue_model}} (Subscription / Usage-based / One-time / Commission / Ads / Hybrid)
- Industry: {{industry}}
- Geographic Market: {{geo_market}} (Local / National / Global)
- Pricing (if known): {{pricing}}
- Primary Customer Persona(s): {{personas}}

CURRENT BASELINES (if known)
- Monthly Revenue / MRR: {{monthly_revenue}}
- Active Customers / Accounts: {{customer_count}}
- Active Users (MAU/WAU/DAU if relevant): {{active_users}}
- Team Size: {{team_size}}
- Funding Stage: {{funding_stage}}

GOALS
- Primary Objective: {{primary_objective}}
- 12-Month Target: {{twelve_month_target}}
- Key Milestones: {{key_milestones}}
- "Winning" Definition: {{success_definition}}

TOOLS & DATA
- Current Tools: {{current_tools}} (analytics, CRM, billing, ads platforms, etc.)
- Data Sources: {{data_sources}} (where data lives)
- Reporting Frequency Preference: {{reporting_frequency}}
- Team Access / Roles: {{team_access}}

AUTHORITATIVE BUSINESS CONTEXT (base decisions on this)
{{business_context}}

Now produce the following deliverable structure:

# KPI DASHBOARD SYSTEM

## 1) North Star Metrics Framework
- Primary North Star Metric (and why it fits this business + stage)
- Supporting driver metrics (leading indicators)
- Lagging outcome metrics
- Targets: short-term (4-6 weeks) and 12-month targets (use ranges if needed)
- Ownership + review cadence

## 2) Business-Model-Specific KPI Set
Select KPIs appropriate for the business model and stage.
For each KPI, include:
- Definition (one sentence)
- Why it matters (tie to the North Star)
- Formula (ready to implement)
- Owner (role)
- Update frequency
- Source of truth
- Recommended breakdowns (e.g., by channel, cohort, client, plan, segment)

Include:
- Acquisition metrics
- Activation/onboarding metrics
- Engagement/usage metrics (if product-led)
- Retention/churn metrics
- Monetization + unit economics metrics
- Operational metrics (support, reliability) if relevant

## 3) Dashboard Structure & Layout
Design 3 views:
- Executive View (5-9 tiles max)
- Functional View(s) (Acquisition / Retention / Finance / Product)
- Diagnostic View (deep dives: cohorts, funnels, segments)

For each section: what's shown, why, and what decision it supports.

## 4) Automated Calculations & Formulas
Provide a metric dictionary table with exact formulas.
Include revenue, customer, funnel, retention, and efficiency ratios.
Where needed, define inputs (tables/fields) and example calculations.

## 5) Alert System & Thresholds
For each top KPI:
- Green / Yellow / Red thresholds
- Trigger conditions (including trend-based triggers like "3-day decline" or "2-week stagnation")
- Action playbook (what the team should do)
- Escalation protocol (who is notified and when)

## 6) Implementation Templates
Provide tool-specific implementation guidance:

A) Google Sheets
- Tabs to create
- Required columns and data validation rules
- Example formulas
- Recommended charts per section
- Monthly/weekly rollup approach

B) Notion
- Database schema (tables + relations)
- Properties and formula fields
- Views (exec, weekly review, diagnostics)
- Permissions/role-based visibility suggestions

C) Excel
- Workbook structure
- Pivot table setup
- Charts and refresh workflow
- Import/connect strategy (manual vs connectors)

## 7) Reporting Cadence & Review Rituals
- Daily 5-minute check (what to look at, what to ignore)
- Weekly team review agenda (45-60 minutes)
- Monthly business review outline (90 minutes)
- Quarterly strategy review (what metrics change at this stage)

## 8) Anti-Vanity Filter + Leading/Lagging Map
- List the vanity metrics you are intentionally excluding (and why)
- Provide a simple map: leading -> lagging, with causal logic
- Ensure 70/30 leading vs lagging

## 9) Data Governance & Metric Integrity
- Single source of truth per metric
- Data freshness expectations
- Validation checks
- Version control approach for definitions/formulas

## 10) "First 14 Days" Rollout Plan
- Step-by-step implementation plan
- Who owns what
- What gets instrumented first
- What gets reviewed first
- Risks and mitigations

Quality bar:
This should be good enough that a team can implement the dashboard without follow-up questions.`;

// ── Distribution Channels Prompt Template ──────────────────────────────────
const DISTRIBUTION_CHANNELS_PROMPT_TEMPLATE = `You are a growth strategist and distribution expert with deep experience across B2B, B2C, marketplaces, and SaaS.

Your task is to create a comprehensive distribution channels analysis for {{APP_NAME}}, identifying both OBVIOUS and NON-OBVIOUS channels to reach {{TARGET_AUDIENCE}} in the {{MARKET}} market.

## BUSINESS CONTEXT
{{BUSINESS_CONTEXT}}

---

## YOUR DELIVERABLE

Create a detailed distribution channels strategy with the following sections:

### 1. OBVIOUS CHANNELS (Expected, Standard Approaches)
These are the channels your competitors are likely already using. For each channel:
- **Channel Name**
- **Why It's Obvious**: Why this is a standard choice for this market
- **Expected CAC Range**: Estimated customer acquisition cost
- **Saturation Level**: Low / Medium / High / Oversaturated
- **Time to Results**: Immediate / 1-3 months / 3-6 months / 6-12 months
- **Recommended Tactics**: 3-5 specific tactics within this channel
- **Risks & Limitations**: What could go wrong or limit scale

Include at minimum:
- Paid advertising channels (Google, Meta, LinkedIn, etc.)
- Organic search/SEO
- Content marketing
- Social media presence
- Email marketing
- Industry events/conferences
- Partner/affiliate programs
- PR and media outreach

### 2. NON-OBVIOUS CHANNELS (Unconventional, Creative Approaches)
These are channels your competitors are likely NOT using or underutilizing. For each channel:
- **Channel Name**
- **Why It's Non-Obvious**: Why others haven't exploited this
- **Unfair Advantage Potential**: How this could become a moat
- **Expected CAC Range**: Often lower than obvious channels
- **Effort Level**: Low / Medium / High
- **Time to Results**: Immediate / 1-3 months / 3-6 months / 6-12 months
- **Specific Playbook**: Step-by-step how to execute
- **Examples/Proof**: Companies that have succeeded with this approach

Think creatively about:
- Niche communities (Discord servers, Slack groups, subreddits, forums)
- Micro-influencers and thought leaders in adjacent spaces
- Integration partnerships with complementary tools
- Platform-specific opportunities (Product Hunt, Hacker News, etc.)
- Offline-to-online bridges
- Educational content in unexpected places (YouTube tutorials, podcasts)
- API/developer ecosystem plays
- User-generated content loops
- Reverse engineering competitor traffic sources
- Geographic or demographic arbitrage
- Timing-based opportunities (seasonal, event-driven)
- Community building before product launch
- Strategic free tools or calculators
- Job board and career site presence
- University/student programs
- Open source contributions
- Industry-specific directories and databases
- LinkedIn personal branding plays
- Podcast guest strategy
- Newsletter sponsorships in niche publications

### 3. CHANNEL PRIORITIZATION MATRIX
Create a 2x2 matrix ranking all channels by:
- **X-axis**: Effort Required (Low to High)
- **Y-axis**: Expected Impact (Low to High)

Categorize into:
- **Quick Wins** (Low Effort, High Impact) - Do these first
- **Strategic Bets** (High Effort, High Impact) - Plan for these
- **Fill-ins** (Low Effort, Low Impact) - Do when you have spare capacity
- **Deprioritize** (High Effort, Low Impact) - Avoid unless circumstances change

### 4. 90-DAY CHANNEL LAUNCH SEQUENCE
Provide a week-by-week rollout plan:
- **Weeks 1-2**: Foundation & Quick Wins
- **Weeks 3-4**: Scale What Works
- **Weeks 5-8**: Add Secondary Channels
- **Weeks 9-12**: Optimize & Experiment

For each phase, specify:
- Which channels to activate
- Budget allocation (% of total)
- Key metrics to track
- Decision criteria for scaling up or killing

### 5. CHANNEL-SPECIFIC METRICS & BENCHMARKS
For each recommended channel, provide:
- Primary KPI to track
- Industry benchmark (what "good" looks like)
- Leading indicators (early signals of success)
- Attribution approach (how to measure this channel's contribution)

### 6. BUDGET ALLOCATION RECOMMENDATIONS
Based on a hypothetical budget of $10,000/month:
- Provide specific $ allocations across channels
- Include rationale for each allocation
- Show how allocation should shift as you learn

Also show allocations for:
- Bootstrap mode ($1,000/month)
- Growth mode ($50,000/month)

### 7. COMPETITIVE CHANNEL INTELLIGENCE
Analyze where competitors in this space are likely acquiring customers:
- **Competitor 1**: Primary channels, estimated spend, gaps to exploit
- **Competitor 2**: Primary channels, estimated spend, gaps to exploit
- **Competitor 3**: Primary channels, estimated spend, gaps to exploit

Identify underserved channel opportunities they're missing.

### 8. RISK MITIGATION
For each major channel:
- What could cause this channel to fail or become less effective?
- Backup plan if this channel underperforms
- Signs to watch for that indicate channel is declining

---

## OUTPUT REQUIREMENTS
- Be specific to this business, not generic advice
- Include actual numbers and estimates where possible
- Prioritize actionable recommendations over theory
- Consider the stage of the business (likely early-stage)
- Balance short-term wins with long-term sustainable channels
- Highlight 2-3 "secret weapon" channels that could provide outsized returns

Format the output in clean Markdown with clear headers and bullet points.`;

// ── GTM Launch Calendar Prompt Template ──────────────────────────────────
const GTM_LAUNCH_CALENDAR_PROMPT_TEMPLATE = `You are a prompt architect for a product-ideation platform.

GOAL
Generate a single, copy/paste-ready PROMPT that instructs an LLM to produce a comprehensive 90-day go-to-market (GTM) launch calendar for a specific selected app/idea.

INPUTS YOU WILL RECEIVE
1) SELECTED_APP_CONTEXT: a JSON/YAML/freeform block describing the selected product/idea (market, users, pricing, positioning, channels, constraints, risks, etc.).
2) OPTIONAL_SYSTEM_CONSTRAINTS: (optional) launch constraints such as team size, budget, regions, compliance, stack, hard deadlines, existing assets.

WHAT TO OUTPUT
Output ONLY the final GTM LAUNCH CALENDAR generation prompt (no commentary). The output must be in Markdown and must contain these parts, in this order:

PART 1 — ROLE & TASK
- Start with: "You are a go-to-market strategist and product launch expert…"
- State the objective: create a comprehensive 90-day launch calendar that coordinates all teams and maximizes launch impact through precise timing and execution.

PART 2 — INPUT REQUIREMENTS (FORM)
Create a section titled "INPUT REQUIREMENTS" requesting:
A) Product Launch Details
- Product Name
- Product Type
- Launch Tier
- Target Launch Date
- Previous Launch Experience

B) Target Market
- Primary Audience
- Market Size
- Geographic Scope
- Key Market Segments
- Competitive Landscape

C) Launch Objectives
- Primary Goal
- Success Metrics (KPIs + targets)
- Revenue Target
- User/Customer Target
- Awareness Target

D) Resources & Constraints
- Team Size
- Marketing Budget
- Content Resources
- Technology Stack
- Timeline Constraints

E) Current Assets
- Existing Content
- Email List Size
- Social Following
- Partnership Network
- Press Relationships

IMPORTANT: Pre-fill fields using SELECTED_APP_CONTEXT where obvious (e.g., product name, audience, pricing, channels, constraints, existing assets).
If information is missing, leave a placeholder like: [TBD / Provide].
If the target launch date is missing, keep it as a required placeholder and do not guess a date.

PART 3 — OUTPUT DELIVERABLES (90-DAY SYSTEM)
Create a section titled "OUTPUT DELIVERABLES" that instructs the model to produce:
1) Pre-Launch Phase (e.g., Weeks -8 to -1)
2) Launch Week (Days 0–7)
3) Post-Launch Phase (remaining weeks to complete the 90-day window)
4) Team Coordination Matrix (Marketing/Product/Sales/CS + any relevant teams)
5) Communication Timeline (internal + external)
6) Risk Mitigation & Contingency Plans
7) Measurement & Optimization Framework (daily/weekly/monthly metrics)

TIMELINE RULE
The final calendar MUST cover exactly 90 days anchored to the Target Launch Date.
If the requested phases (e.g., -60 to +90) exceed 90 days, instruct the model to compress, merge, or prioritize so the output still fits into a 90-day window while keeping the spirit of:
- foundation → asset creation → channel prep → readiness → launch week → optimization

PART 4 — LAUNCH CALENDAR TEMPLATE (WEEKLY + DAILY ACTIONS)
Include a "LAUNCH CALENDAR TEMPLATE" section that requires:
- A week-by-week plan (Weeks as needed to total 90 days)
- For each week: 3–7 concrete actions with owners (team) + deliverable + dependency
- For Launch Week: day-by-day breakdown with times optional
- Each action should be specific and executable (not vague)

PART 5 — QUALITY CHECKLIST
Include checklist items ensuring:
- Timeline realism and buffers
- Ownership clarity
- Dependencies called out
- Risks and contingencies
- Metrics align with objectives
- Communication prevents confusion
- Resource constraints respected
- Success criteria measurable

PART 6 — EXAMPLE DAILY BREAKDOWN
Include one example "Launch Day (Day 0)" breakdown with times and actions.

PART 7 — BUSINESS CONTEXT INJECTION
Append:
"## BUSINESS CONTEXT"
and paste SELECTED_APP_CONTEXT verbatim (preserve formatting).
Then add:
"Use this business context to inform all recommendations, ensuring they're specifically tailored to this opportunity and target market."

STYLE & RULES FOR THE GENERATED PROMPT
- Comprehensive but not rambly; clear headings.
- Instruct the calendar writer to avoid inventing facts: require assumptions + open questions when data is missing.
- Require the output calendar to name owners, deliverables, and success metrics.
- Include privacy and compliance considerations relevant to the product's market.
- Include regulatory requirements where applicable.
- Be specific. Avoid vague statements like "improve UX."
- If OPTIONAL_SYSTEM_CONSTRAINTS exist, incorporate them explicitly.

NOW GENERATE THE FINAL GTM LAUNCH CALENDAR PROMPT.
INPUTS:
SELECTED_APP_CONTEXT:
{{SELECTED_APP_CONTEXT}}

OPTIONAL_SYSTEM_CONSTRAINTS (if any):
{{OPTIONAL_SYSTEM_CONSTRAINTS}}`;

export const aiService = new AIService();
