import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Briefcase
} from "lucide-react";

const BUILDER_CONFIG = {
  replit: {
    name: "Replit Agent",
    icon: Code,
    color: "orange",
    url: (prompt: string) => `https://replit.com/new?description=${encodeURIComponent(prompt)}`,
    description: "AI-powered full-stack development platform"
  },
  bolt: {
    name: "Bolt.new",
    icon: Rocket,
    color: "blue",
    url: () => "https://bolt.new",
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

  const builderConfig = BUILDER_CONFIG[builder as keyof typeof BUILDER_CONFIG];
  const Icon = builderConfig?.icon || Code;
  
  const getBuilderColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, iconBg: string, iconText: string }> = {
      orange: { bg: 'bg-orange-50 dark:bg-orange-950', iconBg: 'bg-orange-100 dark:bg-orange-900', iconText: 'text-orange-600 dark:text-orange-400' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950', iconBg: 'bg-blue-100 dark:bg-blue-900', iconText: 'text-blue-600 dark:text-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950', iconBg: 'bg-purple-100 dark:bg-purple-900', iconText: 'text-purple-600 dark:text-purple-400' },
      green: { bg: 'bg-green-50 dark:bg-green-950', iconBg: 'bg-green-100 dark:bg-green-900', iconText: 'text-green-600 dark:text-green-400' }
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
    if (builderConfig) {
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
              Back to Idea
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
          Back to Idea
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
              Each category contains detailed, copy-paste prompts tailored to your idea and the {builderConfig.name} platform.
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

          {PROMPT_CATEGORIES.map((category) => {
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
                      {category.id === 'build' && (
                        <Button
                          size="sm"
                          onClick={() => openBuilder(prompt)}
                          data-testid="button-open-builder-from-tab"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open {builderConfig.name}
                        </Button>
                      )}
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
