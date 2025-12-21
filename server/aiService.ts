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

    // Use Claude instead of OpenAI since we have a valid Anthropic key
    const fullPrompt = `You are an elite startup advisor combining expertise in market research, business strategy, product development, and growth marketing. Generate comprehensive, realistic startup analyses that rival professional consulting reports. Always respond with valid, well-structured JSON.

${prompt}`;

    try {
      // Use Sonnet 4 for rapid mode (faster than Opus), Opus for deep/comprehensive mode
      const model = params.constraints === 'rapid_mode' 
        ? "claude-sonnet-4-20250514"  // Fastest model - Sonnet 4 is faster than Opus
        : "claude-opus-4-5-20251101";  // Slower but more comprehensive
      
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
          model: "claude-opus-4-5-20251101",
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
        model: "claude-opus-4-5-20251101",
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
   - executionPlan: Step-by-step roadmap based on ALL features and functionality detected (include every feature you found - be comprehensive)

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
        model: "claude-opus-4-5-20251101",
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
   - executionPlan: Step-by-step roadmap

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
              model: "claude-3-5-sonnet-20241022",
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
        model: "claude-opus-4-5-20251101",
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
      model: "claude-opus-4-5-20251101",
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
        model: "claude-opus-4-5-20251101",
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
        model: "claude-opus-4-5-20251101",
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
  "executionPlan": "Step-by-step execution roadmap with phases, milestones, and timelines",
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
}

export const aiService = new AIService();
