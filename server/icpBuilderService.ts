import Anthropic from '@anthropic-ai/sdk';
import type {
  IcpProfile,
  IcpGenerationRequest,
  IcpGenerationResult,
  ScriptGenerationRequest,
  ScriptGenerationResult,
  ValidationScript,
  ScriptSection,
  ScriptBranch,
} from '@shared/icpBuilderTypes';

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

// Helper: Parse JSON from Claude response
function parseJsonResponse<T>(text: string): T {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                    text.match(/```\s*([\s\S]*?)\s*```/) ||
                    text.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonStr) as T;
  }

  // If no JSON found, try parsing the whole response
  return JSON.parse(text) as T;
}

// ─── ICP Generation Service ────────────────────────────────────────────────────

export async function generateIcpProfiles(
  request: IcpGenerationRequest,
  userId: string
): Promise<IcpGenerationResult> {
  console.log(`[IcpBuilder] Generating ICPs for "${request.title}"`);
  const startTime = Date.now();

  const maxProfiles = Math.min(Math.max(request.maxProfiles || 3, 1), 3);

  const systemPrompt = `You are an expert B2B customer profiling specialist with deep experience in market segmentation, customer development, and go-to-market strategy. You apply rigorous frameworks like JTBD (Jobs-to-be-Done), value proposition design, and buyer persona development.

Your task is to generate ${maxProfiles} distinct Ideal Customer Profiles (ICPs) for a venture. Each ICP should represent a meaningfully different customer segment that could benefit from the product/service.

## CRITICAL REQUIREMENTS

1. **Distinct Segments**: Each ICP must represent a clearly differentiated customer segment. Avoid overlap.

2. **B2B Focus**: Focus on organizational characteristics, buying behavior, and decision-making processes.

3. **Actionable Detail**: Provide specific, actionable details that enable targeted outreach and messaging.

4. **Confidence Scoring**: Rate each profile's confidence (0-100) based on:
   - Market evidence for this segment's need
   - Clarity of the value proposition for this segment
   - Accessibility of this segment for validation

5. **Priority Ranking**: Assign validation priority (high/medium/low) based on:
   - Potential market size
   - Urgency of pain points
   - Buying readiness signals

Return your response as valid JSON matching the exact schema specified.`;

  const userPrompt = `Generate ${maxProfiles} distinct Ideal Customer Profiles for this venture:

## VENTURE CONTEXT
**Title:** ${request.title}
**Description:** ${request.description}
${request.content ? `**Detailed Content:** ${request.content.substring(0, 2000)}` : ''}
${request.market ? `**Market:** ${request.market}` : ''}
${request.type ? `**Type:** ${request.type}` : ''}
${request.targetAudience ? `**Target Audience:** ${request.targetAudience}` : ''}
${request.mainCompetitor ? `**Main Competitor:** ${request.mainCompetitor}` : ''}
${request.revenuePotential ? `**Revenue Potential:** ${request.revenuePotential}` : ''}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "profiles": [
    {
      "name": "Descriptive name for this ICP segment (e.g., 'Growth-Stage SaaS Companies')",
      "description": "2-3 sentence description of this ideal customer segment",
      "demographics": {
        "companySize": "Specific range (e.g., '50-200 employees' or '$5M-$20M ARR')",
        "industry": ["Primary industry", "Secondary industry if applicable"],
        "geography": ["Primary regions/markets"],
        "revenue": "Revenue range or stage"
      },
      "psychographics": {
        "painPoints": ["3-5 specific pain points this segment experiences"],
        "goals": ["3-5 key goals or desired outcomes"],
        "objections": ["2-4 likely objections or concerns they'll raise"]
      },
      "buyingBehavior": {
        "decisionMakers": ["Job titles involved in buying decision"],
        "budget": "Typical budget range or procurement process",
        "buyingCycle": "Typical sales cycle length and process",
        "channels": ["How they discover and evaluate solutions"]
      },
      "validationPriority": "high|medium|low",
      "confidence": 75
    }
  ]
}

Generate ${maxProfiles} distinct profiles. Ensure each represents a meaningfully different segment with different pain points, buying behaviors, and use cases.`;

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
      ]
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse<{ profiles: Omit<IcpProfile, 'id' | 'ideaId' | 'userId' | 'createdAt'>[] }>(textContent);

    // Add IDs and metadata to profiles
    const profiles: IcpProfile[] = parsed.profiles.map((profile, index) => ({
      ...profile,
      id: `icp_${Date.now()}_${index}`,
      ideaId: request.ideaId,
      userId: userId,
      createdAt: new Date().toISOString(),
    }));

    const averageConfidence = profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length;

    const result: IcpGenerationResult = {
      profiles,
      metadata: {
        generatedAt: new Date().toISOString(),
        ideaId: request.ideaId,
        profileCount: profiles.length,
        averageConfidence: Math.round(averageConfidence),
      },
    };

    console.log(`[IcpBuilder] Generated ${profiles.length} ICPs in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error('[IcpBuilder] ICP generation error:', error);
    throw new Error('Failed to generate ICP profiles');
  }
}

// ─── Validation Script Generation Service ──────────────────────────────────────

export async function generateValidationScript(
  request: ScriptGenerationRequest,
  userId: string
): Promise<ScriptGenerationResult> {
  console.log(`[IcpBuilder] Generating ${request.scriptType} script for ICP "${request.icpProfile.name}"`);
  const startTime = Date.now();

  const scriptTypeDescriptions = {
    discovery: 'Initial discovery call to understand the prospect\'s situation, challenges, and needs',
    validation: 'Problem/solution validation call to test hypotheses and gather feedback',
    follow_up: 'Follow-up call to dive deeper on specific topics or present solutions',
  };

  const systemPrompt = `You are an expert in Steve Blank's Customer Development methodology and Mom Test interviewing techniques. You create professional, conversational call scripts that help founders validate their business hypotheses without leading the witness.

Your scripts follow these principles:
- Ask open-ended questions that reveal true behavior and pain
- Focus on past behavior, not hypothetical futures ("Tell me about the last time..." not "Would you...")
- Dig into specifics with follow-up questions
- Build rapport before diving into sensitive topics
- Include natural transition phrases
- Handle common objections and redirect conversations productively

## SCRIPT STRUCTURE
1. **Opening/Rapport** (2-3 minutes) - Warm introduction, context setting
2. **Current State Discovery** (5-7 minutes) - Understanding their world today
3. **Problem Exploration** (5-7 minutes) - Digging into pain points
4. **Solution Discussion** (3-5 minutes) - High-level value proposition
5. **Closing/Next Steps** (2-3 minutes) - Thank you, follow-up actions

Return your response as valid JSON matching the exact schema specified.`;

  const userPrompt = `Generate a ${request.scriptType} call script for this ICP:

## ICP PROFILE
**Name:** ${request.icpProfile.name}
**Description:** ${request.icpProfile.description}
**Company Size:** ${request.icpProfile.demographics.companySize}
**Industries:** ${request.icpProfile.demographics.industry.join(', ')}
**Decision Makers:** ${request.icpProfile.buyingBehavior.decisionMakers.join(', ')}
**Pain Points:** ${request.icpProfile.psychographics.painPoints.join(', ')}
**Goals:** ${request.icpProfile.psychographics.goals.join(', ')}
**Objections:** ${request.icpProfile.psychographics.objections.join(', ')}

## VENTURE CONTEXT
**Product/Service:** ${request.ideaTitle}
**Description:** ${request.ideaDescription}

## SCRIPT TYPE
**Type:** ${request.scriptType}
**Purpose:** ${scriptTypeDescriptions[request.scriptType]}

## OUTPUT FORMAT
Return JSON matching this schema:
{
  "title": "Script title",
  "objective": "Primary objective of this call (1-2 sentences)",
  "totalDuration": "15-20 minutes",
  "sections": [
    {
      "id": "section_1",
      "title": "Section name",
      "content": "The actual script content - what to say, written conversationally",
      "speakerNotes": "Tips for the interviewer on tone, pacing, what to listen for",
      "duration": "2-3 minutes",
      "order": 1
    }
  ],
  "branches": [
    {
      "id": "branch_1",
      "parentSectionId": "section_3",
      "condition": "If they mention [specific situation]",
      "content": "How to pivot or dig deeper in this case",
      "followUpQuestions": ["Specific follow-up questions for this branch"]
    }
  ],
  "keyQuestions": [
    "The most important questions to ask, phrased using Mom Test principles"
  ],
  "hypothesesToValidate": [
    "Specific hypotheses this call should test"
  ],
  "closingTechniques": [
    "Techniques for ending the call and securing next steps"
  ]
}

Include 5-6 sections, 3-5 branches for handling different conversation paths, 5-7 key questions, and 3-4 hypotheses to validate.`;

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
      ]
    });

    const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse<{
      title: string;
      objective: string;
      totalDuration: string;
      sections: ScriptSection[];
      branches: ScriptBranch[];
      keyQuestions: string[];
      hypothesesToValidate: string[];
      closingTechniques: string[];
    }>(textContent);

    const script: ValidationScript = {
      id: `script_${Date.now()}`,
      ideaId: request.ideaId,
      userId: userId,
      icpProfileId: request.icpProfileId,
      title: parsed.title,
      scriptType: request.scriptType,
      objective: parsed.objective,
      totalDuration: parsed.totalDuration,
      sections: parsed.sections,
      branches: parsed.branches,
      keyQuestions: parsed.keyQuestions,
      hypothesesToValidate: parsed.hypothesesToValidate,
      closingTechniques: parsed.closingTechniques,
      createdAt: new Date().toISOString(),
    };

    const result: ScriptGenerationResult = {
      script,
      metadata: {
        generatedAt: new Date().toISOString(),
        icpProfileId: request.icpProfileId,
        scriptType: request.scriptType,
        estimatedDuration: parsed.totalDuration,
        questionCount: parsed.keyQuestions.length,
      },
    };

    console.log(`[IcpBuilder] Generated script in ${Date.now() - startTime}ms`);
    return result;
  } catch (error) {
    console.error('[IcpBuilder] Script generation error:', error);
    throw new Error('Failed to generate validation script');
  }
}
