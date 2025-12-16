import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Copy, 
  ExternalLink, 
  ArrowLeft,
  Code,
  Rocket,
  Sparkles,
  Target,
  CheckCircle2,
  Megaphone,
  Search,
  TrendingUp,
  Briefcase,
  Layout,
  Settings,
  Palette,
  Server,
  Calculator,
  Loader2,
  Wand2
} from "lucide-react";

// Sectioned builder prompts interface
interface SectionedPrompts {
  comprehensive: string;
  sections: {
    landingPage: string;
    adminFeatures: string;
    uiFrontend: string;
    backendFunctionality: string;
    mathCalculations: string;
  };
}

// Section configuration for display
const PROMPT_SECTIONS = [
  {
    id: 'landingPage',
    name: 'Landing Page',
    icon: Layout,
    color: 'blue',
    description: 'Hero, features, pricing, testimonials, FAQ, and conversion elements'
  },
  {
    id: 'adminFeatures',
    name: 'Admin & Dashboard',
    icon: Settings,
    color: 'purple',
    description: 'Admin panel, user management, analytics, and content management'
  },
  {
    id: 'uiFrontend',
    name: 'UI/Frontend Components',
    icon: Palette,
    color: 'pink',
    description: 'Design system, reusable components, forms, and responsive layouts'
  },
  {
    id: 'backendFunctionality',
    name: 'Backend & API',
    icon: Server,
    color: 'green',
    description: 'Database schema, API endpoints, authentication, and server logic'
  },
  {
    id: 'mathCalculations',
    name: 'Business Logic & Math',
    icon: Calculator,
    color: 'orange',
    description: 'Core algorithms, pricing calculations, analytics, and business rules'
  }
] as const;

const BUILDER_CONFIG = {
  replit: {
    name: "Replit Agent",
    icon: Code,
    color: "orange",
    url: (prompt: string) => `https://replit.com/new?description=${encodeURIComponent(prompt)}`,
    description: "AI-powered full-stack development platform"
  },
  bolt: {
    name: "Claude Codex",
    icon: Rocket,
    color: "blue",
    url: () => "https://claude.ai",
    description: "AI-powered full-stack web app builder"
  },
  v0: {
    name: "v0 by Vercel",
    icon: Sparkles,
    color: "purple",
    url: () => "https://v0.dev",
    description: "AI UI component generator for React/Next.js"
  },
  cursor: {
    name: "Cursor IDE",
    icon: Target,
    color: "green",
    url: () => "https://cursor.sh",
    description: "AI-first code editor with intelligent suggestions"
  },
  "ad-creatives": {
    name: "Ad Creatives Generator",
    icon: Megaphone,
    color: "pink",
    description: "Platform-specific ad copy and creative concepts"
  },
  "brand-package": {
    name: "Brand Package Builder",
    icon: Briefcase,
    color: "indigo",
    description: "Complete brand identity and messaging framework"
  }
};

interface PromptCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  generator: (idea: any, builder?: string) => string;
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "build",
    name: "Build",
    icon: Code,
    description: "Technical implementation prompts",
    generator: (idea: any, builder?: string) => {
      const baseContext = `Build a ${idea.market} ${idea.type} called "${idea.title}".

Description: ${idea.description}

Target Audience: ${idea.targetAudience || 'General users'}`;

      switch (builder) {
        case 'replit':
          return `${baseContext}

Technical Requirements:
- Create a modern, responsive web application
- Use React with TypeScript for the frontend
- Implement a Node.js/Express backend with PostgreSQL database
- Use Tailwind CSS for styling with Shadcn UI components
- Include user authentication with secure session management
- Make it mobile-friendly and responsive

Key Features to Implement:
${idea.keyFeatures?.map((f: string) => `- ${f}`).join('\n') || '- Core functionality as described above'}

Database Schema:
- Design tables for: users, ${idea.market === 'B2B' ? 'organizations, subscriptions' : 'user profiles, preferences'}, main entities
- Set up proper relationships and foreign keys
- Implement data validation and constraints

API Endpoints:
- RESTful API for all CRUD operations
- Authentication endpoints (signup, login, logout)
- Protected routes with middleware
- Input validation and error handling

Frontend Components:
- Landing page with hero section and features
- Dashboard/main app interface
- User authentication flow (login/signup)
- Core feature components
- Settings and profile management

${idea.executionPlan ? `\nExecution Plan:\n${idea.executionPlan}` : ''}

Please create a production-ready full-stack application with proper project structure, security best practices, and polished UI/UX.`;

        case 'bolt':
          return `${baseContext}

Build Instructions:
1. Create a modern, full-stack web application with clean UI
2. Implement core features:
${idea.keyFeatures?.map((f: string) => `   - ${f}`).join('\n') || '   - Main functionality as described'}

3. Technical Stack:
   - Frontend: React with TypeScript
   - Styling: Tailwind CSS
   - State Management: React Context or Zustand
   - Forms: React Hook Form with validation

4. Pages/Views to Create:
   - Landing page with value proposition
   - Authentication pages (login/signup)
   - Main dashboard/app interface
   - Settings/profile page
   - ${idea.market === 'B2B' ? 'Admin panel for team management' : 'User-friendly interface with clear navigation'}

5. Design Guidelines:
   - Clean, professional color scheme
   - Responsive design (mobile-first)
   - Smooth animations and transitions
   - Loading states for all async operations
   - Error handling with user-friendly messages

${idea.executionPlan ? `\nExecution Plan:\n${idea.executionPlan}` : ''}`;

        case 'v0':
          return `Create UI components for: ${idea.title}

Description: ${idea.description}

Components to Generate:

1. Landing Page Components:
   - Hero section with headline: "${idea.subtitle || idea.title}"
   - Feature showcase grid (${idea.keyFeatures?.length || 3} features)
   - Social proof section (testimonials, metrics)
   - Pricing cards (if applicable)
   - FAQ accordion
   - CTA sections

2. App Interface Components:
   - Navigation (${idea.market === 'B2B' ? 'sidebar with team switcher' : 'top navigation bar'})
   - Dashboard cards with metrics
   - ${idea.market === 'B2B' ? 'Team management table' : 'User profile card'}
   - Data visualization components
   - Form components with validation
   - Modal/dialog components

3. Feature-Specific Components:
${idea.keyFeatures?.map((f: string, i: number) => `   ${i + 1}. ${f} interface`).join('\n') || '   - Core functionality components'}

Design System:
- Color scheme: ${idea.market === 'B2B' ? 'Professional blues/grays' : 'Modern, vibrant palette'}
- Typography: Clean, readable fonts
- Spacing: Consistent padding/margins
- Shadows and borders for depth
- ${idea.market === 'B2B' ? 'Corporate and trustworthy' : 'Friendly and approachable'} aesthetic

Tech Stack: React, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons`;

        case 'cursor':
          return `Project: ${idea.title}
Type: ${idea.market} ${idea.type}

Description:
${idea.description}

Development Tasks:

1. Project Setup
   - Initialize modern web application
   - Set up TypeScript configuration
   - Configure build tools (Vite/Next.js)
   - Install dependencies (React, Tailwind, etc.)

2. Database Design
   - Create schema for: users, ${idea.targetAudience ? `${idea.targetAudience} data, ` : ''}main entities
   - Set up migrations with Drizzle/Prisma
   - Implement database seeding for development

3. Backend Implementation:
   - Express/Next.js API routes
   - Authentication (JWT or session-based)
   - CRUD endpoints for all entities
   - Input validation with Zod
   - Error handling middleware

4. Core Features:
${idea.keyFeatures?.map((f: string, i: number) => `   ${i + 1}. ${f} - Implement full stack functionality`).join('\n') || '   - Implement main functionality'}

5. Frontend Development:
   - Component architecture with TypeScript
   - State management (Context/Zustand/Redux)
   - Form handling with validation
   - Responsive design with Tailwind
   - API integration with React Query

6. Testing & Quality:
   - Unit tests for critical functions
   - API endpoint testing
   - E2E tests with Playwright
   - Error boundary implementation

${idea.executionPlan ? `\nExecution Plan:\n${idea.executionPlan}` : ''}

Priority: Build MVP first, iterate based on user feedback.`;

        case 'ad-creatives':
          return `Ad Creatives Package for: ${idea.title}

Product: ${idea.description}
Target Audience: ${idea.targetAudience || 'General users'}
Market: ${idea.market}

Generate comprehensive ad creatives across all major platforms:

═══════════════════════════════════════════════
1. FACEBOOK & INSTAGRAM ADS
═══════════════════════════════════════════════

Primary Image Ad:
Headline (40 chars): [Problem-solution hook]
Primary Text (125 chars): [Emotional appeal + key benefit]
Description (30 chars): [CTA-focused]
CTA Button: ${idea.market === 'B2B' ? 'Learn More / Request Demo' : 'Sign Up / Learn More'}

Carousel Ad (5 slides):
Slide 1: Problem statement with relatable visual
Slide 2: Your solution (${idea.title}) introduction
Slide 3: Key Feature #1 - ${idea.keyFeatures?.[0] || 'Main feature'}
Slide 4: Key Feature #2 - ${idea.keyFeatures?.[1] || 'Secondary feature'}
Slide 5: CTA with special offer

Video Ad Script (30 sec):
0-3s: Hook - "Are you tired of [pain point]?"
3-10s: Problem amplification
10-20s: Solution reveal (${idea.title})
20-27s: Key benefits showcase
27-30s: Strong CTA

Stories Ad:
Frame 1: Attention-grabbing question
Frame 2: Pain point visualization
Frame 3: Solution (${idea.title})
Frame 4: Swipe up CTA

A/B Testing Variations:
- Variant A: Problem-focused ("Struggling with [pain]?")
- Variant B: Benefit-focused ("Get [result] in [timeframe]")
- Variant C: Social proof ("Join [X] ${idea.market === 'B2B' ? 'companies' : 'users'}")

═══════════════════════════════════════════════
2. GOOGLE ADS (Search & Display)
═══════════════════════════════════════════════

Search Ads:
Headline 1: ${idea.title} - ${idea.subtitle || 'Best Solution'}
Headline 2: ${idea.market === 'B2B' ? 'Enterprise Grade' : 'Easy to Use'}
Headline 3: ${idea.market === 'B2B' ? 'Free Trial Available' : 'Get Started Free'}
Description 1: ${idea.description?.substring(0, 90) || 'Transform your workflow'}
Description 2: ${idea.market === 'B2B' ? 'Trusted by industry leaders. Book demo today.' : 'Join thousands of happy users. Try free.'}

Responsive Display Ads:
Short Headline: ${idea.title}
Long Headline: ${idea.subtitle || idea.title}
Description: ${idea.description?.substring(0, 90) || 'The modern solution for [problem]'}
Business Name: ${idea.title}

Call Assets:
- ${idea.market === 'B2B' ? 'Schedule a demo call' : 'Try it free today'}
- ${idea.market === 'B2B' ? 'Speak with our team' : 'Get started now'}

Sitelink Extensions:
1. Features | See what makes us different
2. Pricing | ${idea.market === 'B2B' ? 'Custom enterprise plans' : 'Flexible plans starting at $X'}
3. ${idea.market === 'B2B' ? 'Case Studies | Real results from clients' : 'Success Stories | How users win'}
4. FAQ | Common questions answered

═══════════════════════════════════════════════
3. LINKEDIN ADS (B2B Focus)
═══════════════════════════════════════════════

Sponsored Content:
Intro Text: [Industry trend or pain point]
"In 2024, ${idea.targetAudience || 'businesses'} face a critical challenge: [specific problem]. ${idea.title} solves this with [unique approach]."

Key messaging:
- ROI-focused: "${idea.market === 'B2B' ? 'Save [X] hours/week' : 'Increase productivity by [X]%'}"
- Authority: "Trusted by ${idea.market === 'B2B' ? 'Fortune 500 companies' : 'industry leaders'}"
- Proof: "Proven results: [specific metric or case study]"

Lead Gen Form:
Question 1: Company size / Role
Question 2: Current solution / Pain level
Question 3: Timeline for implementation
Offer: ${idea.market === 'B2B' ? 'Free consultation / Demo' : 'Free trial / Guide'}

Message Ads:
Subject: Quick question about [pain point]
Message: "Hi [Name], noticed you work in [industry]. Many [job title]s struggle with [problem]. ${idea.title} helps [solution]. Worth a 15-min chat?"

═══════════════════════════════════════════════
4. TIKTOK ADS
═══════════════════════════════════════════════

In-Feed Video (9-15 sec):
0-2s: Pattern interrupt (unexpected visual/statement)
2-6s: Problem → Solution reveal
6-12s: Quick demo or benefit showcase
12-15s: CTA with urgency

Creative Concepts:
1. "POV: You finally found [solution]" format
2. Before/After transformation
3. "Things [target audience] wish they knew about [problem]"
4. "How to [achieve outcome] without [common pain]"
5. Behind-the-scenes of ${idea.title}

Hashtags:
#${idea.type} #${idea.market} #productivity #growth #business

Text Overlay Templates:
- "This changed everything for ${idea.targetAudience || 'us'}"
- "${idea.market === 'B2B' ? 'Productivity hack' : 'Life hack'} you need to try"
- "Why everyone's switching to ${idea.title}"

═══════════════════════════════════════════════
5. UNIVERSAL AD FRAMEWORKS
═══════════════════════════════════════════════

CTA Variations:
Primary: ${idea.market === 'B2B' ? 'Request Demo / Start Free Trial' : 'Get Started Free / Try Now'}
Urgency: "Limited spots / Ends soon / Join waiting list"
Value: "No credit card / 14-day trial / Money-back guarantee"

Headline Formulas:
1. [Do X] Without [Pain Point]
   → "Grow revenue without hiring more sales reps"
2. [Target Audience] Trust ${idea.title} to [Outcome]
   → "${idea.targetAudience} trust ${idea.title} to ${idea.keyFeatures?.[0] || 'solve [problem]'}"
3. The [Adjective] Way to [Outcome]
   → "The fastest way to ${idea.keyFeatures?.[0] || '[achieve goal]'}"

A/B Testing Strategy:
Test 1: Emotional vs. Rational appeal
Test 2: Long-form vs. Short-form copy
Test 3: Feature-focused vs. Benefit-focused
Test 4: Urgency vs. Value proposition
Test 5: Different visual styles (minimal vs. bold)

Platform Budget Allocation:
- Facebook/Instagram: ${idea.market === 'B2B' ? '30%' : '40%'} (broad reach)
- Google Search: ${idea.market === 'B2B' ? '40%' : '35%'} (intent)
- LinkedIn: ${idea.market === 'B2B' ? '25%' : '10%'} (B2B targeting)
- TikTok: ${idea.market === 'B2B' ? '5%' : '15%'} (viral potential)

Creative Refresh Schedule:
- Week 1-2: Initial testing (5-10 variations)
- Week 3-4: Double down on winners
- Month 2+: Refresh creative every 2 weeks
- Monitor: CTR drop >20% = time to refresh

Success Metrics:
- CTR Target: ${idea.market === 'B2B' ? '1.5-3%' : '2-5%'}
- CPC Target: ${idea.market === 'B2B' ? '<$5' : '<$2'}
- Conversion Rate: ${idea.market === 'B2B' ? '10-15%' : '5-10%'}
- ROAS: ${idea.market === 'B2B' ? '3:1+' : '4:1+'}`;

        case 'brand-package':
          return `Complete Brand Package for: ${idea.title}

Product: ${idea.description}
Market: ${idea.market}
Target Audience: ${idea.targetAudience || 'General users'}

═══════════════════════════════════════════════
1. BRAND IDENTITY & POSITIONING
═══════════════════════════════════════════════

Brand Mission:
"${idea.title} empowers ${idea.targetAudience || 'users'} to [achieve outcome] by [unique approach]."

Brand Vision:
"To become the ${idea.market === 'B2B' ? 'industry-standard' : 'go-to'} solution for ${idea.targetAudience || 'our audience'} who want to [achieve big vision]."

Core Values:
1. [Value 1] - ${idea.market === 'B2B' ? 'Reliability & Trust' : 'User Empowerment'}
2. [Value 2] - Innovation & Simplicity
3. [Value 3] - ${idea.market === 'B2B' ? 'Results-Driven' : 'Accessibility'}
4. [Value 4] - Continuous Improvement
5. [Value 5] - Customer Success

Brand Personality:
- Archetype: ${idea.market === 'B2B' ? 'The Expert / The Leader' : 'The Hero / The Sage'}
- Tone: ${idea.market === 'B2B' ? 'Professional yet approachable' : 'Friendly and empowering'}
- Character Traits: ${idea.market === 'B2B' ? 'Knowledgeable, Reliable, Strategic' : 'Helpful, Innovative, Trustworthy'}

Unique Value Proposition (UVP):
"${idea.title} is the ${idea.market === 'B2B' ? 'only enterprise-grade' : 'simplest way to'} [solve problem] that [unique differentiator] for [target audience]."

Positioning Statement:
"For [target audience] who [need/want], ${idea.title} is the [category] that [key benefit]. Unlike [competitors], we [unique approach]."

═══════════════════════════════════════════════
2. VISUAL IDENTITY
═══════════════════════════════════════════════

Logo Concepts:

Concept A - Wordmark:
- Style: Clean, modern typography
- Font: ${idea.market === 'B2B' ? 'Bold, professional sans-serif (like Inter, Poppins)' : 'Friendly, rounded sans-serif (like Nunito, Outfit)'}
- Treatment: ${idea.market === 'B2B' ? 'Strong, geometric letterforms' : 'Approachable, slightly playful'}
- Icon: Optional symbol representing ${idea.keyFeatures?.[0] || 'core value'}

Concept B - Combination Mark:
- Icon: [Abstract symbol related to ${idea.type}]
- Style: ${idea.market === 'B2B' ? 'Geometric, structured' : 'Organic, friendly'}
- Placement: Icon left of wordmark
- Versatility: Works at small sizes, single color

Concept C - Emblem:
- Format: Text within or around contained shape
- Feel: ${idea.market === 'B2B' ? 'Badge of trust and authority' : 'Memorable and distinctive'}
- Use case: ${idea.market === 'B2B' ? 'Enterprise confidence' : 'Community belonging'}

Logo Variations:
- Primary: Full color combination mark
- Secondary: Wordmark only
- Icon: Standalone symbol for app icons
- Monochrome: Black, white versions
- Reversed: For dark backgrounds

═══════════════════════════════════════════════
3. COLOR PALETTE
═══════════════════════════════════════════════

Primary Colors:
${idea.market === 'B2B' ? 
`- Primary: Deep Blue (#1e40af) - Trust, professionalism
- Secondary: Teal (#0d9488) - Innovation, growth
- Accent: Orange (#f97316) - Energy, action` :
`- Primary: Vibrant Purple (#8b5cf6) - Creativity, modern
- Secondary: Bright Cyan (#06b6d4) - Fresh, innovative
- Accent: Warm Coral (#fb7185) - Friendly, approachable`}

Neutral Colors:
- Dark: #1e293b (text, headers)
- Medium: #64748b (body text)
- Light: #f1f5f9 (backgrounds)
- Pure: #ffffff (cards, containers)

Semantic Colors:
- Success: #10b981 (confirmations, success states)
- Warning: #f59e0b (alerts, cautions)
- Error: #ef4444 (errors, destructive actions)
- Info: #3b82f6 (tips, information)

Color Usage:
- Headlines: Primary color
- CTAs: Accent color
- Backgrounds: Neutral light tones
- Text: Dark neutral for body, medium for secondary
- ${idea.market === 'B2B' ? '70% neutral, 25% primary, 5% accent' : '60% neutral, 30% primary, 10% accent'}

═══════════════════════════════════════════════
4. TYPOGRAPHY
═══════════════════════════════════════════════

Font Families:

Headings: ${idea.market === 'B2B' ? 'Inter' : 'Poppins'}
- Weights: Bold (700), Semibold (600)
- Use: H1-H6, section titles, CTAs
- Pairing: Strong, impactful statements

Body: ${idea.market === 'B2B' ? 'Open Sans' : 'Nunito'}
- Weights: Regular (400), Medium (500)
- Use: Paragraphs, descriptions, UI text
- Pairing: Highly readable, professional

Monospace: JetBrains Mono (for code/technical)
- Weight: Regular (400)
- Use: Code snippets, technical data, metrics

Type Scale:
- Display (60px/72px): Hero headlines
- H1 (48px/58px): Page titles
- H2 (36px/44px): Section headers
- H3 (24px/32px): Sub-sections
- H4 (20px/28px): Card titles
- Body (16px/24px): Paragraphs
- Small (14px/20px): Captions, labels
- Tiny (12px/16px): Footnotes

Typography Rules:
- Line height: 1.5x for body, 1.2x for headings
- Letter spacing: -0.02em for headings, normal for body
- Max width: 65-75 characters per line
- Hierarchy: Size, weight, color for clear structure

═══════════════════════════════════════════════
5. VOICE & TONE
═══════════════════════════════════════════════

Brand Voice Attributes:

${idea.market === 'B2B' ? 
`1. Professional yet Personable
   - Use industry terminology appropriately
   - Avoid jargon when simpler words work
   - Be authoritative without being cold

2. Results-Focused
   - Lead with outcomes and metrics
   - Use concrete examples and data
   - Emphasize ROI and business impact

3. Trustworthy & Reliable
   - Back claims with evidence
   - Be transparent about capabilities
   - Admit limitations when necessary

4. Strategic & Insightful
   - Provide thought leadership
   - Share industry knowledge
   - Guide decision-making` :
`1. Friendly & Approachable
   - Use conversational language
   - Be warm without being overly casual
   - Make users feel supported

2. Empowering & Encouraging
   - Focus on user capabilities
   - Celebrate wins and progress
   - Be positive and motivating

3. Clear & Helpful
   - Use simple, direct language
   - Avoid unnecessary complexity
   - Prioritize understanding

4. Authentic & Relatable
   - Be genuine and human
   - Show empathy for user challenges
   - Build emotional connections`}

Tone Variations:

Marketing Copy: ${idea.market === 'B2B' ? 'Confident, benefit-driven, professional' : 'Exciting, aspirational, friendly'}
Product UI: ${idea.market === 'B2B' ? 'Clear, efficient, supportive' : 'Helpful, encouraging, simple'}
Help Docs: ${idea.market === 'B2B' ? 'Detailed, technical when needed, structured' : 'Patient, step-by-step, reassuring'}
Error Messages: ${idea.market === 'B2B' ? 'Professional, solution-oriented, calm' : 'Apologetic, helpful, reassuring'}
Success Messages: ${idea.market === 'B2B' ? 'Affirmative, encouraging next steps' : 'Celebratory, motivating'}

Writing Guidelines:
✓ DO: Use active voice, short sentences, specific examples
✗ DON'T: Use passive voice, run-on sentences, vague claims

Word Bank:
Encouraged: ${idea.market === 'B2B' ? 'Streamline, Optimize, Enterprise, Strategic, Proven, Efficient' : 'Simple, Easy, Amazing, Helpful, Smart, Better'}
Avoid: ${idea.market === 'B2B' ? 'Cheap, Basic, Simple (use Streamlined)' : 'Complex, Difficult, Enterprise, Complicated'}

═══════════════════════════════════════════════
6. MESSAGING FRAMEWORK
═══════════════════════════════════════════════

Value Proposition Hierarchy:

Primary Message:
"${idea.title} helps ${idea.targetAudience || 'you'} ${idea.keyFeatures?.[0] || '[achieve key outcome]'} ${idea.market === 'B2B' ? 'so you can drive measurable business results' : 'so you can focus on what matters'}."

Supporting Messages:
1. ${idea.keyFeatures?.[0] || 'Feature 1'} → [Specific benefit for user]
2. ${idea.keyFeatures?.[1] || 'Feature 2'} → [How it makes life easier]
3. ${idea.keyFeatures?.[2] || 'Feature 3'} → [Unique advantage]

Proof Points:
- ${idea.market === 'B2B' ? 'Trusted by [X] enterprise customers' : 'Used by [X]+ happy users'}
- ${idea.market === 'B2B' ? '[X]% increase in [metric]' : '[X]% of users see results in [timeframe]'}
- ${idea.market === 'B2B' ? 'Enterprise-grade security & compliance' : 'Rated [X] stars by users'}

Objection Handling:
Q: "Is this different from [competitor]?"
A: "Yes - ${idea.title} uniquely [differentiator]. Unlike others, we [unique approach]."

Q: ${idea.market === 'B2B' ? '"What\'s the ROI?"' : '"Is it worth the price?"'}
A: ${idea.market === 'B2B' ? '"Most customers see [X] return within [timeframe] through [specific outcomes]."' : '"Most users save [X hours/dollars] per [timeframe], making it pay for itself quickly."'}

Q: "How long to get started?"
A: "${idea.market === 'B2B' ? 'Implementation takes [X] weeks with full support. Start seeing value in the first sprint.' : 'You can get started in under [X] minutes. No technical knowledge required.'}"

Call-to-Action Framework:
- Primary: ${idea.market === 'B2B' ? '"Request a Demo"' : '"Get Started Free"'}
- Secondary: ${idea.market === 'B2B' ? '"See Pricing" / "View Case Studies"' : '"Learn More" / "See How It Works"'}
- Urgency: ${idea.market === 'B2B' ? '"Limited partner slots"' : '"Join [X]+ users today"'}

Brand Story Arc:
1. Problem: ${idea.targetAudience || 'Users'} struggle with [pain point]
2. Insight: We discovered [key insight about problem]
3. Solution: We built ${idea.title} to [unique approach]
4. Impact: Now ${idea.targetAudience || 'users'} can [transformation]
5. Vision: We're building toward [future state]

═══════════════════════════════════════════════
7. BRAND APPLICATION GUIDELINES
═══════════════════════════════════════════════

Digital Applications:
- Website: Hero section with primary color, clear CTAs with accent
- Product UI: Neutral backgrounds, primary for key actions
- Email: Brand colors in header, clean layouts, clear CTAs
- Social Media: Consistent templates with brand colors

Print Applications (if needed):
- Business Cards: Clean, ${idea.market === 'B2B' ? 'professional' : 'memorable'}
- Letterhead: Minimal branding, professional
- Presentations: ${idea.market === 'B2B' ? 'Corporate template' : 'Modern slides'} with brand colors

Do's and Don'ts:
✓ Use logo on clean backgrounds
✓ Maintain minimum spacing around logo
✓ Use approved color combinations
✓ Follow typography hierarchy
✗ Don't distort or rotate logo
✗ Don't use unapproved colors
✗ Don't use more than 3 fonts
✗ Don't create visual clutter

Brand Consistency Checklist:
□ Logo used correctly
□ Colors from approved palette
□ Typography follows hierarchy
□ Voice matches brand guidelines
□ Message aligns with positioning
□ Design feels cohesive with other materials`;

        default:
          return baseContext;
      }
    }
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Megaphone,
    description: "Promotion and content prompts",
    generator: (idea: any) => {
      return `Marketing Strategy for: ${idea.title}

Product Description: ${idea.description}

Target Audience: ${idea.targetAudience || 'General users'}
Market Type: ${idea.market}

1. LANDING PAGE COPY

Headline Options:
- "${idea.subtitle || idea.title}" [Main value proposition]
- "The ${idea.market} ${idea.type} for ${idea.targetAudience || 'modern businesses'}"
- "Stop [pain point]. Start [solution]."

Subheadline:
${idea.description}

Feature Bullets (3-5):
${idea.keyFeatures?.map((f: string) => `• ${f}`).join('\n') || '• [Feature 1]\n• [Feature 2]\n• [Feature 3]'}

Social Proof Section:
- "Join [X]+ ${idea.market === 'B2B' ? 'companies' : 'users'} already using ${idea.title}"
- Customer testimonials highlighting specific results
- Trust badges and security certifications

CTA Variations:
- "Start Free Trial"
- "Get Started in 2 Minutes"
- "See ${idea.title} in Action"
- "${idea.market === 'B2B' ? 'Book a Demo' : 'Try It Free'}"

2. SOCIAL MEDIA CONTENT

Twitter/X Thread (7 tweets):
Tweet 1: Hook about the problem this solves
Tweet 2: Your personal story discovering this pain point
Tweet 3: How ${idea.title} solves it differently
Tweet 4: Key benefit #1 with specific example
Tweet 5: Key benefit #2 with metrics/proof
Tweet 6: Who this is perfect for
Tweet 7: CTA with link

LinkedIn Post:
- Professional angle on industry problem
- Data/statistics supporting the need
- How ${idea.title} addresses it
- Call to action for ${idea.market === 'B2B' ? 'decision makers' : 'professionals'}

Reddit Strategy:
- Identify relevant subreddits: r/${idea.type}, r/${idea.market}
- Share valuable insights first, build credibility
- Soft launch with "I built a tool that..." posts
- Focus on solving specific user problems

3. EMAIL SEQUENCES

Welcome Series (3 emails):
Email 1: "Welcome to ${idea.title} - Here's what to do first"
Email 2: "Get the most out of [key feature]" 
Email 3: "Success story: How [user] achieved [result]"

Nurture Campaign:
- Educational content about the problem space
- Case studies and use cases
- Feature highlights and tips
- ${idea.market === 'B2B' ? 'ROI calculators and whitepapers' : 'Success stories and tutorials'}

4. CONTENT MARKETING

Blog Post Ideas:
1. "The Complete Guide to [problem space]"
2. "5 Ways ${idea.targetAudience || 'Businesses'} Can [achieve outcome]"
3. "How We Built ${idea.title}: Behind the Scenes"
4. "${idea.title} vs. Traditional Solutions: A Comparison"
5. "Case Study: [Company] Achieved [Result] with ${idea.title}"

SEO Keywords to Target:
- Primary: ${idea.keyword || `${idea.type} for ${idea.targetAudience}`}
- Long-tail: "best ${idea.type} for ${idea.targetAudience}"
- Intent-based: "how to [solve problem]"

5. PAID ADVERTISING

Google Ads:
Headline: "${idea.title} - ${idea.subtitle || 'The Best Way to [Solution]'}"
Description: ${idea.description.substring(0, 90)}...
CTA: ${idea.market === 'B2B' ? 'Request Demo' : 'Start Free Trial'}

Facebook/Instagram Ads:
Image: Product screenshot showing key value
Copy: Problem → Solution → Benefit → CTA
Audience: ${idea.targetAudience || 'Interests related to industry'}

6. LAUNCH STRATEGY

Pre-Launch (2 weeks before):
- Build waitlist with landing page
- Tease on social media
- Reach out to potential early adopters
- Prepare Product Hunt launch materials

Launch Day:
- Product Hunt submission
- Email waitlist
- Social media announcement
- Reach out to relevant communities
- ${idea.market === 'B2B' ? 'Direct outreach to potential clients' : 'Influencer partnerships'}

Post-Launch:
- Collect and showcase testimonials
- Share metrics and milestones
- Create content around user success stories
- Iterate based on user feedback`;
    }
  },
  {
    id: "validation",
    name: "Validation",
    icon: Search,
    description: "Market research and validation prompts",
    generator: (idea: any) => {
      return `Market Validation for: ${idea.title}

Product: ${idea.description}

1. PROBLEM VALIDATION

Research Questions:
- Does the target audience (${idea.targetAudience || 'users'}) actively experience this problem?
- How are they currently solving it? What are the pain points?
- How much time/money do they spend on current solutions?
- What alternatives exist and why do they fall short?

Where to Research:
- Reddit: Search for pain point discussions in r/${idea.type}, r/${idea.market}
- Twitter/X: Search "[problem] + frustrated/annoying/difficult"
- LinkedIn: Industry-specific pain point discussions
- Quora: "How do I [solve this problem]" questions
- ${idea.market === 'B2B' ? 'Industry forums and Slack communities' : 'Facebook groups and Discord servers'}

Analysis Prompt:
"Analyze these Reddit threads and comments about [problem]. Extract:
1. Main pain points mentioned
2. Frequency of complaints
3. Willingness to pay for solution
4. Current alternatives being used
5. Unmet needs and feature requests"

2. COMPETITOR ANALYSIS

Direct Competitors:
- List 5 direct competitors solving the same problem
- Analyze their pricing, features, positioning
- Identify gaps in their offerings
- Read user reviews (G2, Capterra, App Store, Product Hunt)

Competitor Comparison Table:

| Feature | Competitor 1 | Competitor 2 | ${idea.title} |
|---------|--------------|--------------|---------------|
| [Feature 1] | ✓ | ✗ | ✓ |
| [Feature 2] | ✗ | ✓ | ✓ |
| Pricing | $X/mo | $Y/mo | $Z/mo |
| Target Market | [Market] | [Market] | ${idea.market} |

Questions to Answer:
- What do customers love about competitors?
- What are their biggest complaints?
- What features are missing?
- How can ${idea.title} be 10x better in one specific area?

3. PRICING VALIDATION

Value Ladder Research:
- What are customers currently paying for similar solutions?
- What's the perceived value of solving this problem?
- ${idea.market === 'B2B' ? 'What\'s the ROI? (Cost savings, time saved, revenue generated)' : 'What\'s the willingness to pay?'}

Pricing Models to Test:
${idea.market === 'B2B' ? 
`- Usage-based: Pay per [unit]
- Seat-based: $X per user/month
- Tier-based: Starter ($X) → Professional ($Y) → Enterprise (Custom)
- Freemium: Free tier + Premium features` :
`- Freemium: Free basic + $X/mo premium
- One-time: $X lifetime access
- Subscription: $X/month or $Y/year (save 20%)
- Usage-based: Pay as you go`}

Validation Survey Questions:
1. "How much would you pay for a solution that [key benefit]?"
2. "What's the maximum you'd pay monthly/annually?"
3. "Would you choose [Feature A] for $X or [Feature B] for $Y?"

4. DEMAND VALIDATION

Search Volume Analysis:
- Primary keyword: "${idea.keyword || `${idea.type} for ${idea.targetAudience}`}"
- Related keywords: [research using Google Keyword Planner, Ahrefs, SEMrush]
- Trend analysis: Is search volume growing or declining?

Social Proof Indicators:
- Size of relevant Reddit communities
- Twitter/X mentions of the problem
- LinkedIn posts about the pain point
- ${idea.market === 'B2B' ? 'Industry reports and whitepapers' : 'YouTube videos and blog posts'}
- Existing solutions' user counts and reviews

Market Size Estimation:
- Total Addressable Market (TAM): All potential customers globally
- Serviceable Addressable Market (SAM): Customers you can reach with your distribution
- Serviceable Obtainable Market (SOM): Realistic customer count in first year

5. LANDING PAGE VALIDATION

Smoke Test Setup:
- Create simple landing page with value proposition
- Add email capture form
- Run small paid ads ($100-$500 budget)
- Measure conversion rate (target: 20%+ email signups)

A/B Tests to Run:
- Headline variations (problem-focused vs. solution-focused)
- CTA copy ("Start Free Trial" vs. "Get Early Access")
- Pricing display (show price vs. "Request Quote")
- Social proof (testimonials vs. metrics vs. logos)

Success Metrics:
- 100+ email signups before building MVP = Strong signal
- 20%+ conversion rate on landing page = Good product-market fit indicator
- 10%+ of signups willing to pre-pay = Very strong validation
- ${idea.market === 'B2B' ? '5+ qualified demo requests = Enough to start building' : '50+ signups in first week = Good traction'}

6. MVP VALIDATION PLAN

Build: ${idea.executionPlan || 'Core features only (20% of features, 80% of value)'}

Test with:
- 10-20 early adopters (friends, network, relevant communities)
- Get them using it for 1 week minimum
- Daily check-ins for feedback

Key Questions:
1. Are they actively using it?
2. What features do they use most?
3. What's missing or broken?
4. Would they pay for this? How much?
5. Would they recommend it to others?

Decision Criteria:
- 60%+ retention after 1 week = Build more features
- Multiple requests for same feature = Prioritize it
- Users paying without being asked = Strong PMF signal
- ${idea.market === 'B2B' ? 'Pilot customers renewing = Product-market fit' : 'Users sharing on social media = Organic growth potential'}`;
    }
  },
  {
    id: "growth",
    name: "Growth",
    icon: TrendingUp,
    description: "Scaling and distribution prompts",
    generator: (idea: any) => {
      return `Growth Strategy for: ${idea.title}

Product: ${idea.description}
Target Market: ${idea.market}

1. DISTRIBUTION CHANNELS

Primary Channels (Pick 2-3 to start):

${idea.market === 'B2B' ? 
`A. LinkedIn Outreach
   - Build targeted list of decision makers
   - Personalized connection requests
   - Share valuable content consistently
   - DM warm connections with soft pitch
   - Post case studies and results

B. Cold Email Campaign
   - Build list of [job titles] at [company types]
   - Craft personalized email sequences:
     Email 1: Identify specific pain point
     Email 2: Share insight/tip (provide value)
     Email 3: Introduce ${idea.title} as solution
   - Follow-up sequence for non-responders
   - Track opens, clicks, replies

C. Industry Communities
   - Join relevant Slack workspaces
   - Participate in niche forums
   - Provide value before promoting
   - Become known expert in the space
   - Share ${idea.title} when genuinely helpful` :
`A. Social Media (Twitter/X Focus)
   - Tweet daily about the problem space
   - Share tips, insights, mini-case studies
   - Engage with relevant conversations
   - Use hashtags: #${idea.type} #${idea.market}
   - Build in public, show progress

B. Content Marketing
   - SEO-optimized blog posts (target: ${idea.keyword || 'main keywords'})
   - YouTube tutorials and demos
   - TikTok/Instagram Reels for viral reach
   - Pinterest for visual products
   - Medium articles targeting relevant tags

C. Community-Led Growth
   - Reddit: r/${idea.type}, r/SaaS, niche subreddits
   - Facebook Groups for target audience
   - Discord servers related to industry
   - Provide value, build trust, then share`}

D. Product Hunt Launch
   - Prepare assets: logo, screenshots, video demo
   - Build supporter list for launch day upvotes
   - Engage in comments all day
   - Follow up with featured in newsletter

E. Partnership/Integration Strategy
   - List complementary tools users already use
   - Build integrations or partnerships
   - Co-marketing opportunities
   - Cross-promotion with non-competing tools

2. VIRAL LOOPS & REFERRALS

Referral Program Design:
- Offer: ${idea.market === 'B2B' ? 'Give $50 credit, Get $50 credit' : 'Give 1 month free, Get 1 month free'}
- Trigger: After user achieves first success/value
- Share method: Unique referral link + social sharing
- Incentive: Both referrer and referee get reward

Built-in Virality Features:
${idea.market === 'B2B' ? 
`- Team collaboration (invites colleagues)
- Public workspace/portfolio links
- Branded outputs (powered by ${idea.title})
- Email signatures with ${idea.title} mention` :
`- Social sharing of results/achievements
- Embeddable widgets on user websites
- Public profiles (SEO + social proof)
- Collaborative features requiring invites`}

Shareability Elements:
- Auto-generate shareable results (images, stats)
- "Made with ${idea.title}" watermark on free tier
- One-click social media posting
- Email templates with ${idea.title} branding

3. CONTENT FLYWHEEL

Weekly Content Calendar:

Monday: Educational blog post (SEO focus)
- "How to [achieve outcome] in 2024"
- Target keyword: ${idea.keyword || 'main keyword'}

Tuesday: Social media thread
- Twitter/LinkedIn thread with actionable tips
- End with soft CTA to ${idea.title}

Wednesday: Video content
- YouTube tutorial or demo
- TikTok/Reel showing quick win
- Repurpose across platforms

Thursday: Case study / success story
- Customer results and testimonials
- Specific metrics and ROI
- Share across all channels

Friday: Community engagement
- Answer questions in Reddit/forums
- Engage with comments on content
- Host Twitter Space or LinkedIn Live

Content Repurposing:
1 blog post → 1 video → 10 social posts → 1 email newsletter
- Maximize reach from single content piece
- Maintain consistency across platforms

4. RETENTION & ACTIVATION

Onboarding Optimization:
- Welcome email immediately after signup
- In-app guided tour of key features
- "Aha moment" within first 5 minutes
- ${idea.market === 'B2B' ? 'Setup call for enterprise customers' : 'Quick start checklist'}

Activation Milestones:
Day 1: ${idea.keyFeatures?.[0] || 'Complete first key action'}
Day 3: ${idea.keyFeatures?.[1] || 'Use core feature'}
Day 7: ${idea.keyFeatures?.[2] || 'Achieve first success/result'}
Day 30: ${idea.market === 'B2B' ? 'Integrate with team workflow' : 'Build habit loop'}

Email Drip Campaign:
- Day 1: Welcome + quick start guide
- Day 2: Feature highlight #1 + use case
- Day 4: Success story + social proof
- Day 7: Feature highlight #2 + tips
- Day 14: Upgrade prompt (if freemium)
- Day 30: Feedback request + referral ask

Retention Tactics:
- Weekly digest emails with insights/tips
- Push notifications for important updates
- ${idea.market === 'B2B' ? 'Quarterly business reviews (QBRs)' : 'Streak tracking and gamification'}
- Regular feature releases (announce in app + email)
- Community events (webinars, meetups)

5. PAID ACQUISITION (Once PMF proven)

Channel Testing Priority:

Tier 1 (Test first with $1000):
${idea.market === 'B2B' ?
`- LinkedIn Ads (sponsored content)
- Google Ads (search intent keywords)
- Retargeting campaigns (LinkedIn, Google)` :
`- Facebook/Instagram Ads
- Google Ads (search + display)
- TikTok Ads (if visual product)`}

Ad Creative Framework:
Hook: Call out specific pain point
Problem: Amplify the frustration
Solution: ${idea.title} solves it differently
Proof: Show results, testimonials, metrics
CTA: ${idea.market === 'B2B' ? 'Book Demo' : 'Start Free Trial'}

Budget Allocation:
- Start: $100/day across 2-3 channels
- Test audiences, creatives, copy for 1 week
- Double down on winners, cut losers
- Target CAC: ${idea.market === 'B2B' ? '< 1/3 of LTV' : '< 1/5 of LTV'}

6. COMMUNITY BUILDING

Build Community Platform:
- ${idea.market === 'B2B' ? 'Slack workspace or private forum' : 'Discord server or Facebook Group'}
- Weekly Q&A sessions or office hours
- User-generated content and showcases
- Beta features early access for active members

Community Growth Tactics:
- Feature member wins/successes
- Create exclusive resources (templates, guides)
- Host challenges or competitions
- ${idea.market === 'B2B' ? 'Industry expert AMAs' : 'User spotlights and interviews'}
- Peer-to-peer support and networking

Leverage Superfans:
- Identify power users (NPS 9-10)
- Create ambassador/affiliate program
- Give them exclusive perks and early access
- Feature them in case studies
- Ask for testimonials and referrals

7. GROWTH METRICS TO TRACK

Weekly Dashboard:
- Signups (total, by channel)
- Activation rate (% completing key action)
- Retention (Day 1, 7, 30)
- ${idea.market === 'B2B' ? 'MRR/ARR growth' : 'Revenue growth'}
- CAC by channel
- LTV:CAC ratio (target: 3:1)
- Viral coefficient (K-factor)
- NPS score

Growth Experiments:
- Run 2-3 experiments per week
- A/B test one variable at a time
- Measure results after 100+ conversions
- Scale winners, learn from losers
- Document learnings for team`;
    }
  },
  {
    id: "operations",
    name: "Operations",
    icon: Briefcase,
    description: "Business operations prompts",
    generator: (idea: any) => {
      return `Operations Setup for: ${idea.title}

Product: ${idea.description}
Business Type: ${idea.market}

1. LEGAL & COMPLIANCE

Business Entity:
- Structure: ${idea.market === 'B2B' ? 'LLC or C-Corp (for VC funding potential)' : 'LLC or Sole Proprietorship'}
- Register in: Delaware (for flexibility) or your home state
- EIN: Apply through IRS website
- Business bank account: Separate from personal

Required Legal Documents:

A. Terms of Service
Key sections:
- Service description and scope
- User responsibilities and acceptable use
- Payment terms and refund policy
- Intellectual property rights
- Limitation of liability
- Dispute resolution and governing law
- Termination clauses

B. Privacy Policy (GDPR/CCPA Compliant)
Must include:
- Data collection practices (what, why, how)
- Cookie usage and tracking
- Third-party integrations and data sharing
- User rights (access, deletion, portability)
- Data retention and security measures
- Contact information for privacy inquiries
- ${idea.market === 'B2B' ? 'Data processing agreements for enterprise' : 'Age restrictions (COPPA compliance if under 13)'}

C. Acceptable Use Policy
- Prohibited activities and content
- Account security requirements
- Consequences of violations
- Reporting mechanism for abuse

Compliance Checklist:
- [ ] GDPR (if serving EU users)
- [ ] CCPA (if serving California users)
- [ ] ${idea.market === 'B2B' ? 'SOC 2 compliance (for enterprise sales)' : 'PCI DSS (if processing payments)'}
- [ ] Accessibility (WCAG 2.1 Level AA)
- [ ] ${idea.market === 'B2B' ? 'HIPAA (if handling health data)' : 'Data encryption at rest and in transit'}

2. CUSTOMER SUPPORT SYSTEM

Support Channels:
${idea.market === 'B2B' ? 
`Priority: 1. Email support (response SLA: 4 hours)
         2. Live chat during business hours
         3. Phone support for enterprise customers
         4. Dedicated Slack channel for premium accounts` :
`Priority: 1. In-app help center and chatbot
         2. Email support (response SLA: 24 hours)
         3. Community forum for peer help
         4. Social media support (Twitter, Facebook)`}

Knowledge Base Setup:
- Getting Started Guide
- Feature documentation
- Video tutorials
- FAQ (30+ common questions)
- Troubleshooting guides
- API documentation (if applicable)

Support Workflow:
1. User submits ticket (email, chat, or in-app)
2. Auto-response with ticket # and expected time
3. Categorize: Bug, Feature Request, Question, Billing
4. Assign priority: P0 (urgent), P1 (high), P2 (normal), P3 (low)
5. Resolve and document solution in KB
6. Follow-up survey (CSAT score)

Support Tools Stack:
- Helpdesk: Intercom, Zendesk, or Help Scout
- Knowledge Base: Notion, Gitbook, or built-in
- Live Chat: Intercom or Crisp
- Status Page: Statuspage.io for uptime monitoring
- ${idea.market === 'B2B' ? 'Account management: Gainsight or Vitally' : 'Community: Discord or Circle'}

3. HIRING & TEAM BUILDING

First Hires (in order):
${idea.market === 'B2B' ?
`1. Co-founder/Technical Lead (if you're non-technical)
2. Customer Success Manager (handle onboarding, support)
3. Sales Representative (outbound, demos)
4. Marketing Lead (content, demand gen)
5. Backend Engineer (scale infrastructure)` :
`1. Co-founder/Technical Lead (if you're non-technical)
2. Community Manager / Support Specialist
3. Growth Marketer (content + paid acquisition)
4. Designer (UI/UX improvements)
5. Full-stack Engineer (features + scale)`}

Job Descriptions:

[Role: Customer Success Manager - Example]
Title: Customer Success Manager - ${idea.title}

About ${idea.title}:
${idea.description}

Role Overview:
- Own customer onboarding and activation
- Conduct training and demos for new users
- Monitor customer health and engagement
- Identify upsell and expansion opportunities
- Serve as voice of customer to product team

Requirements:
- 2+ years in customer success or account management
- ${idea.market === 'B2B' ? 'Experience with B2B SaaS products' : 'Strong communication and empathy skills'}
- Data-driven approach to customer engagement
- Proficiency with CRM and support tools
- Self-starter who thrives in startup environment

Compensation:
- Base: $60-80K
- Bonus: Based on customer retention and NPS
- Equity: 0.25-0.5% vesting over 4 years
- Benefits: Health insurance, unlimited PTO

Onboarding Process:
Week 1: Product training, tool access, shadowing
Week 2: Handle tickets with supervision
Week 3: Take on accounts independently
Week 4: Set goals and OKRs for quarter

4. FINANCIAL OPERATIONS

Accounting Setup:
- Accounting software: QuickBooks, Xero, or Wave
- Bookkeeper: Part-time or freelance (10-20 hrs/month)
- Separate accounts: Operating, Payroll, Tax savings
- Expense tracking: Divvy, Ramp, or Brex
- Invoicing: Stripe Billing or Chargebee

Revenue Metrics to Track:
- ${idea.market === 'B2B' ? 'MRR/ARR (Monthly/Annual Recurring Revenue)' : 'GMV (Gross Merchandise Value)'}
- ${idea.market === 'B2B' ? 'Net Revenue Retention (NRR)' : 'Average Order Value (AOV)'}
- Churn rate (target: <5% monthly)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- LTV:CAC ratio (target: 3:1)
- Gross margin (target: ${idea.market === 'B2B' ? '70-80%' : '60-70%'})
- Burn rate and runway

Budgeting Framework:
Monthly Budget Allocation:
- Product development: 30-40%
- Sales & Marketing: 30-40%
- Operations & Support: 15-20%
- General & Admin: 10-15%

Cash Flow Management:
- Maintain 6-12 months runway
- Weekly cash flow projections
- Monitor DSO (Days Sales Outstanding)
- Negotiate payment terms with vendors
- ${idea.market === 'B2B' ? 'Annual contracts for predictable revenue' : 'Subscription billing for recurring revenue'}

5. INFRASTRUCTURE & TOOLS

Core Tech Stack:
- Hosting: ${idea.market === 'B2B' ? 'AWS, GCP, or Azure (for compliance)' : 'Vercel, Railway, or Render'}
- Database: PostgreSQL (primary) + Redis (caching)
- Monitoring: Sentry (errors) + DataDog (infrastructure)
- Analytics: PostHog or Mixpanel
- Email: SendGrid or Postmark
- Payments: Stripe or Paddle

Security & Backup:
- Daily automated backups (7-day retention)
- Disaster recovery plan documented
- SSL/TLS certificates (auto-renewing)
- 2FA enforced for team accounts
- Regular security audits
- Penetration testing (annual)
- ${idea.market === 'B2B' ? 'SOC 2 compliance audit' : 'Bug bounty program'}

Operations Tools:
- Project Management: Linear, Height, or Asana
- Communication: Slack + Loom for async
- Documentation: Notion or Confluence
- Version Control: GitHub or GitLab
- CI/CD: GitHub Actions or CircleCI
- Design: Figma for all design work

6. FUNDRAISING (If needed)

When to Raise:
- Product-market fit proven (retention, NPS)
- ${idea.market === 'B2B' ? '$50K+ MRR with strong growth rate' : 'Clear path to $1M ARR'}
- Need capital to scale faster (not survive)
- Strong unit economics (LTV:CAC > 3:1)

Funding Options:
${idea.market === 'B2B' ?
`1. Bootstrapping (maintain control)
2. Angel investors ($100K-$500K)
3. Seed round ($1M-$3M) from micro-VCs
4. Series A ($5M-$15M) for scaling` :
`1. Bootstrapping (maintain full ownership)
2. Revenue-based financing (Clearco, Pipe)
3. Angel investors ($50K-$250K)
4. Small seed round ($500K-$1M)`}

Pitch Deck Structure (12 slides):
1. Hook/Problem statement
2. Solution (${idea.title})
3. Market size and opportunity
4. Product demo/screenshots
5. Business model and pricing
6. Traction and metrics
7. Go-to-market strategy
8. Competitive landscape
9. Unfair advantage
10. Team and advisors
11. Financial projections (3-year)
12. Ask and use of funds

Investor Outreach:
- Build targeted list (25-50 relevant investors)
- Warm intros (success rate: 30%)
- Cold email (success rate: 5%)
- Demo days and pitch competitions
- Angel syndicates (AngelList, Republic)

7. SCALABILITY PLANNING

6-Month Roadmap:

Month 1-2: Foundation
- Stabilize product core features
- Set up all operations systems
- Hire first key employees
- Implement customer feedback loop

Month 3-4: Growth
- Scale top 2 acquisition channels
- Launch referral program
- Expand feature set based on requests
- ${idea.market === 'B2B' ? 'Close first enterprise deals' : 'Hit profitability or funding milestone'}

Month 5-6: Scale
- ${idea.market === 'B2B' ? 'Build sales team (2-3 reps)' : 'Automate operations where possible'}
- Expand to new market segment
- Launch partnership program
- Plan Series A fundraise (if VC path)

Key Metrics Milestones:
${idea.market === 'B2B' ?
`- Month 3: $20K MRR
- Month 6: $50K MRR
- Month 12: $150K MRR
- Strong retention (>90% NRR)` :
`- Month 3: 1,000 active users
- Month 6: 5,000 active users
- Month 12: 20,000 active users
- Positive unit economics`}

Exit Strategy Considerations:
- Acquisition targets: [Potential acquirers in space]
- Typical multiples: ${idea.market === 'B2B' ? '8-12x ARR' : '3-5x revenue'}
- Build to sell vs. build to last decision
- Maintain clean cap table and financials`;
    }
  }
];

export default function BuildPrompt() {
  const { slug, builder } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);
  const [sectionedPrompts, setSectionedPrompts] = useState<SectionedPrompts | null>(null);
  const [activeSection, setActiveSection] = useState<string>('comprehensive');

  const { data: idea, isLoading } = useQuery({
    queryKey: ["/api/ideas", slug],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch idea');
      }
      return response.json();
    },
  });

  // Mutation to generate AI-powered sectioned prompts
  const generateSectionedPrompts = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/generate-build-prompts', {
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        type: idea.type,
        market: idea.market,
        targetAudience: idea.targetAudience,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSectionedPrompts(data);
      toast({
        title: "Sectioned prompts generated!",
        description: "Your comprehensive build prompts are ready to use.",
      });
    },
    onError: (error) => {
      console.error('Error generating prompts:', error);
      toast({
        title: "Failed to generate prompts",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const builderConfig = BUILDER_CONFIG[builder as keyof typeof BUILDER_CONFIG];
  const Icon = builderConfig?.icon || Code;
  
  const getBuilderColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, iconBg: string, iconText: string }> = {
      orange: { bg: 'bg-orange-50 dark:bg-orange-950', iconBg: 'bg-orange-100 dark:bg-orange-900', iconText: 'text-orange-600 dark:text-orange-400' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950', iconBg: 'bg-blue-100 dark:bg-blue-900', iconText: 'text-blue-600 dark:text-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950', iconBg: 'bg-purple-100 dark:bg-purple-900', iconText: 'text-purple-600 dark:text-purple-400' },
      green: { bg: 'bg-green-50 dark:bg-green-950', iconBg: 'bg-green-100 dark:bg-green-900', iconText: 'text-green-600 dark:text-green-400' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-950', iconBg: 'bg-pink-100 dark:bg-pink-900', iconText: 'text-pink-600 dark:text-pink-400' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', iconBg: 'bg-indigo-100 dark:bg-indigo-900', iconText: 'text-indigo-600 dark:text-indigo-400' }
    };
    return colorMap[color] || colorMap.orange;
  };
  
  const colorClasses = builderConfig ? getBuilderColorClasses(builderConfig.color) : getBuilderColorClasses('orange');

  const copyToClipboard = async (text: string, categoryId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCategory(categoryId);
      toast({
        title: "Copied to clipboard!",
        description: "Your prompt is ready to paste."
      });
      setTimeout(() => setCopiedCategory(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the text.",
        variant: "destructive"
      });
    }
  };

  const openBuilder = (prompt: string) => {
    if (builderConfig && 'url' in builderConfig && builderConfig.url) {
      const url = builderConfig.url(prompt);
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea || !builderConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Not Found</h1>
            <Button onClick={() => setLocation(`/idea/${slug}`)}>
              Back to Solution
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="build-prompt-page">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation(`/idea/${slug}`)}
          className="mb-6"
          data-testid="button-back-to-idea"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Solution
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${colorClasses.iconBg} rounded-lg`}>
              <Icon className={`w-8 h-8 ${colorClasses.iconText}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-builder-name">
                Build with {builderConfig.name}
              </h1>
              <p className="text-muted-foreground">{builderConfig.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{idea.market}</Badge>
            <Badge variant="outline">{idea.type}</Badge>
            <Badge variant="outline">{idea.title}</Badge>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How to Use These Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We've created comprehensive prompts across 5 key categories to help you build, market, validate, grow, and operate your business. 
              Each category contains detailed, copy-paste prompts tailored to your solution and the {builderConfig.name} platform.
            </p>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <p className="text-sm">Choose a category below (Build, Marketing, Validation, Growth, or Operations)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <p className="text-sm">Copy the prompt using the Copy button</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <p className="text-sm">Paste into {builderConfig.name} or your AI tool of choice and start building!</p>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Categories Tabs */}
        <Tabs defaultValue="build" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {PROMPT_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* BUILD TAB - Enhanced with Sectioned Prompts */}
          <TabsContent value="build" className="space-y-6">
            {/* AI-Generated Sectioned Prompts */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI-Generated Sectioned Build Prompts</CardTitle>
                      <CardDescription className="mt-1">
                        One comprehensive prompt per section - works with any LLM (Claude, GPT, Gemini, etc.)
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateSectionedPrompts.mutate()}
                    disabled={generateSectionedPrompts.isPending}
                    className="gap-2"
                  >
                    {generateSectionedPrompts.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Sectioned Prompts
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              {sectionedPrompts && (
                <CardContent className="pt-0">
                  {/* Section Navigation */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    <Button
                      variant={activeSection === 'comprehensive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('comprehensive')}
                      className="gap-2"
                    >
                      <Code className="w-4 h-4" />
                      Full App
                    </Button>
                    {PROMPT_SECTIONS.map((section) => {
                      const SectionIcon = section.icon;
                      return (
                        <Button
                          key={section.id}
                          variant={activeSection === section.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveSection(section.id)}
                          className="gap-2"
                        >
                          <SectionIcon className="w-4 h-4" />
                          {section.name}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Comprehensive Prompt */}
                  {activeSection === 'comprehensive' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary" />
                            Complete Application Prompt
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            This single prompt will build your entire MVP - paste it into any AI assistant
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(sectionedPrompts.comprehensive, 'comprehensive')}
                        >
                          {copiedCategory === 'comprehensive' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Prompt
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-6 rounded-lg max-h-[500px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono text-sm">
                          {sectionedPrompts.comprehensive}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Individual Section Prompts */}
                  {PROMPT_SECTIONS.map((section) => {
                    if (activeSection !== section.id) return null;
                    const SectionIcon = section.icon;
                    const sectionKey = section.id as keyof typeof sectionedPrompts.sections;
                    const promptContent = sectionedPrompts.sections[sectionKey];
                    
                    return (
                      <div key={section.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                              <SectionIcon className="w-5 h-5 text-primary" />
                              {section.name} Prompt
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {section.description}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(promptContent, section.id)}
                          >
                            {copiedCategory === section.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Prompt
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-muted p-6 rounded-lg max-h-[500px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-sm">
                            {promptContent}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}

              {!sectionedPrompts && !generateSectionedPrompts.isPending && (
                <CardContent className="pt-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Click "Generate Sectioned Prompts" to create AI-powered build prompts</p>
                    <p className="text-sm">Each section builds a specific part of your app</p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Section Overview Cards */}
            {sectionedPrompts && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${activeSection === 'comprehensive' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setActiveSection('comprehensive')}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <Code className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-sm">Full Application</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Complete MVP in one prompt</p>
                  </CardContent>
                </Card>
                
                {PROMPT_SECTIONS.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <Card 
                      key={section.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${activeSection === section.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded">
                            <SectionIcon className="w-4 h-4 text-primary" />
                          </div>
                          <CardTitle className="text-sm">{section.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2">{section.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Static Build Prompts (fallback/default) */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="static-prompts">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Static Build Prompts (Pre-built Templates)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {(() => {
                      const category = PROMPT_CATEGORIES.find(c => c.id === 'build');
                      if (!category) return null;
                      const prompt = category.generator(idea, builder as string);
                      return (
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                              <CardTitle className="text-base">Template Build Prompt</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">Pre-built prompt template for {builderConfig?.name || 'any builder'}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(prompt, 'build-static')}
                              >
                                {copiedCategory === 'build-static' ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                  </>
                                )}
                              </Button>
                              {builderConfig && 'url' in builderConfig && builderConfig.url && (
                                <Button
                                  size="sm"
                                  onClick={() => openBuilder(prompt)}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open {builderConfig.name}
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-muted p-6 rounded-lg max-h-[400px] overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-mono text-sm">
                                {prompt}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Other category tabs remain the same */}
          {PROMPT_CATEGORIES.filter(c => c.id !== 'build').map((category) => {
            const prompt = category.generator(idea, builder as string);
            const CategoryIcon = category.icon;
            
            return (
              <TabsContent key={category.id} value={category.id} className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle>{category.name} Prompts</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(prompt, category.id)}
                        data-testid={`button-copy-${category.id}`}
                      >
                        {copiedCategory === category.id ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap font-mono text-sm" data-testid={`text-prompt-${category.id}`}>
                        {prompt}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Pro Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pro Tips for Maximum Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Build:</strong> Start with MVP features, iterate based on user feedback</p>
            <p>• <strong>Marketing:</strong> Test multiple channels, double down on what works</p>
            <p>• <strong>Validation:</strong> Talk to 20+ potential customers before building</p>
            <p>• <strong>Growth:</strong> Focus on one acquisition channel until it's maxed out</p>
            <p>• <strong>Operations:</strong> Automate early, but don't over-engineer</p>
            <p className="pt-2 border-t mt-4">💡 Customize these prompts to match your specific vision and requirements. Use the idea's market data and analysis tabs for additional context.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
