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

    const prompt = `Generate a unique startup idea with the following parameters:
- Industry: ${industry}
- Type: ${type}
- Market: ${market}
- Target Audience: ${targetAudience}
- Problem Area: ${problemArea}
- Constraints: ${constraints}

Provide a comprehensive startup idea analysis that includes:
1. A compelling title and subtitle
2. Clear problem description and solution
3. Target market analysis
4. Business model insights
5. Competitive landscape
6. Implementation roadmap
7. Revenue potential assessment
8. Market validation opportunities

Return the response as a JSON object with the following structure:
{
  "title": "Startup name",
  "subtitle": "One-line value proposition",
  "description": "2-3 sentence problem and solution description",
  "content": "Detailed 4-5 paragraph analysis covering the problem, solution, market opportunity, business model, and implementation strategy",
  "type": "${type}",
  "market": "${market}",
  "targetAudience": "${targetAudience}",
  "keyword": "primary SEO keyword",
  "revenuePotential": "High/Medium/Low with brief explanation",
  "executionDifficulty": "High/Medium/Low with brief explanation",
  "gtmStrength": "Strong/Medium/Weak with brief explanation",
  "mainCompetitor": "Primary competitor name",
  "opportunityScore": score_out_of_10,
  "problemScore": score_out_of_10,
  "feasibilityScore": score_out_of_10,
  "timingScore": score_out_of_10,
  "executionScore": score_out_of_10,
  "gtmScore": score_out_of_10,
  "opportunityLabel": "descriptive label",
  "problemLabel": "descriptive label", 
  "feasibilityLabel": "descriptive label",
  "timingLabel": "descriptive label",
  "keywordVolume": estimated_monthly_searches,
  "keywordGrowth": estimated_growth_percentage
}

Make sure the idea is innovative, practical, and addresses a real market need. The scores should be realistic and well-justified.`;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are an expert startup advisor and market researcher. Generate realistic, actionable startup ideas with comprehensive market analysis. Always respond with valid JSON."
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
      const parsedIdea = JSON.parse(cleanedResponse);
      
      // Validate required fields
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