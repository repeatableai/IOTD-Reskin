import type { InsertIdea, InsertTag, InsertCommunitySignal } from "@shared/schema";

export const sampleTags: InsertTag[] = [
  { name: "High Growth", color: "#10B981" },
  { name: "SaaS", color: "#3B82F6" },
  { name: "B2B", color: "#8B5CF6" },
  { name: "B2C", color: "#FF6B6B" },
  { name: "Mobile App", color: "#06B6D4" },
  { name: "AI/ML", color: "#F59E0B" },
  { name: "Marketplace", color: "#EF4444" },
  { name: "Enterprise", color: "#6366F1" },
  { name: "Subscription", color: "#84CC16" },
  { name: "Low Competition", color: "#22C55E" },
  { name: "Perfect Timing", color: "#10B981" },
  { name: "Proven Market", color: "#3B82F6" },
];

export const sampleIdeas: InsertIdea[] = [
  {
    title: "Native Plant Navigator for Landscape Pros and Home Gardeners",
    subtitle: "$10M ARR Potential",
    slug: "native-plant-selection-wizard-for-landscapers",
    description: "Native Plant Navigator solves the fragmented information problem in sustainable landscaping. The app delivers hyper-local plant recommendations based on your exact location, soil conditions, and project needs. Landscape professionals save hours of research while homeowners get foolproof native plant choices that actually thrive in their yards.",
    content: `# The Market Opportunity

The sustainable landscaping market is experiencing unprecedented growth, driven by environmental consciousness and municipal regulations. Native plant adoption has increased 127% in the last three years, yet professionals and homeowners struggle with fragmented information sources.

## Revenue Model

**For Professionals ($29-49/month):**
- Advanced plant database with contractor pricing
- Client proposal generators with native plant recommendations
- Seasonal maintenance scheduling and alerts
- Integration with wholesale nursery ordering systems

**For Homeowners ($5.99/month or $50/year):**
- Location-based plant recommendations
- Visual garden planning tools
- Care instructions and seasonal reminders
- Local nursery inventory integration

## Execution Strategy

**Phase 1: MVP (Months 1-3)**
- Core plant database for 10 major US regions
- Basic location-based recommendations
- Simple nursery partnership integrations

**Phase 2: Growth (Months 4-8)**
- Professional tools and pricing tiers
- Advanced filtering and planning features
- Expanded geographic coverage

**Phase 3: Scale (Months 9-12)**
- Municipal partnership programs
- API for landscape design software
- International expansion starting with Canada

## Why Now?

- New EPA regulations favoring native plants in federal projects
- $2.1B in state-level landscaping incentive programs launched in 2024
- Rising water costs making drought-resistant natives economically attractive
- Climate change creating demand for regionally-adapted plant solutions`,
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    type: "mobile_app",
    market: "B2C",
    targetAudience: "gardening enthusiasts",
    mainCompetitor: "GardenTags",
    keyword: "local plant nurseries near me",
    keywordVolume: 18100,
    keywordGrowth: "123",
    opportunityScore: 9,
    opportunityLabel: "Exceptional",
    problemScore: 8,
    problemLabel: "High Pain",
    feasibilityScore: 6,
    feasibilityLabel: "Challenging",
    timingScore: 8,
    timingLabel: "Great Timing",
    executionScore: 5,
    gtmScore: 8,
    revenuePotential: "$1M-$10M ARR potential with strong subscription model",
    revenuePotentialNum: 10000000,
    executionDifficulty: "Moderate complexity with IoT integration, 6-month MVP timeline",
    gtmStrength: "Clear traction with strong community engagement on Reddit, Facebook, and YouTube",
    viewCount: 1247,
    saveCount: 89,
    voteCount: 156,
    isFeatured: true,
  },
  {
    title: "TimeSync: Meeting Scheduler That Reclaims 7+ Hours Weekly for Global Teams",
    subtitle: "$5M-$10M ARR Potential",
    slug: "cross-timezone-meeting-scheduling-and-analytics",
    description: "TimeSync eliminates the cross-timezone scheduling nightmare plaguing remote-first companies. For global managers and distributed teams, finding meeting times across multiple timezones burns through hours of productive time weekly. This tool automatically identifies optimal meeting windows, factors in team members' preferred working hours, and integrates directly with your existing calendar systems.",
    content: `# The Problem

Remote teams waste 7+ hours weekly on scheduling coordination. Current tools don't account for:
- Team member work preferences and peak productivity hours
- Cultural considerations for different regions
- Meeting fatigue and optimal spacing
- Time zone complexity for multi-region teams

## Solution Overview

TimeSync provides intelligent scheduling that considers:
- Individual productivity patterns from calendar data
- Team collaboration history and preferences
- Cultural holidays and regional considerations
- Meeting load balancing to prevent burnout

## Revenue Model

**Starter Plan ($20/user/month):**
- Basic timezone optimization
- Calendar integration
- Meeting analytics

**Professional Plan ($49/user/month):**
- Advanced AI scheduling
- Team productivity insights
- Custom workflow automation
- Priority-based meeting allocation

**Enterprise Plan ($99/user/month):**
- Custom integrations
- Advanced analytics and reporting
- Dedicated account management
- SSO and security features`,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "web_app",
    market: "B2B",
    targetAudience: "remote teams",
    mainCompetitor: "Calendly",
    keyword: "meeting scheduler for teams",
    keywordVolume: 12400,
    keywordGrowth: "89",
    opportunityScore: 8,
    opportunityLabel: "Very High",
    problemScore: 9,
    problemLabel: "Critical Pain",
    feasibilityScore: 7,
    feasibilityLabel: "Moderate",
    timingScore: 9,
    timingLabel: "Perfect Timing",
    executionScore: 6,
    gtmScore: 7,
    revenuePotential: "$5M-$10M ARR with enterprise contracts",
    revenuePotentialNum: 7500000,
    executionDifficulty: "Moderate complexity, strong calendar API integrations required",
    gtmStrength: "Direct sales to remote-first companies, strong network effects",
    viewCount: 892,
    saveCount: 67,
    voteCount: 134,
  },
  {
    title: "Mushroom Coffee Subscription for Workplace Wellness",
    subtitle: "$1M-$10M ARR Potential", 
    slug: "bulk-mushroom-coffee-subscription-for-businesses",
    description: "Office coffee breaks waste time and leave teams with jittery caffeine crashes. MushroomWorks delivers premium mushroom coffee directly to startups and coworking spaces on a subscription basis, transforming mundane breaks into productivity-boosting wellness rituals. The formula combines organic coffee with functional mushrooms like lion's mane and cordyceps that enhance focus, reduce anxiety, and support immune health without the afternoon crash.",
    content: `# Market Opportunity

The functional beverage market is projected to reach $279.4B by 2030, with mushroom coffee representing the fastest-growing segment at 42% CAGR.

## Target Market Analysis

**Primary:** Fast-growing startups (10-50 employees)
- High stress environments requiring cognitive enhancement
- Wellness-focused culture and generous employee perks
- Budget for premium employee experiences ($3-8k monthly)

**Secondary:** Coworking spaces and innovation hubs
- 100+ locations in major tech cities
- Seeking differentiated amenities for members
- Revenue-sharing partnership opportunities

## Product Portfolio

**Core Blend:** Lion's mane + Cordyceps + Premium Colombian
**Focus Blend:** Chaga + Rhodiola + Ethiopian single-origin  
**Calm Blend:** Reishi + L-theanine + Guatemalan medium roast
**Energy Blend:** Cordyceps + Guarana + Brazilian dark roast

## Revenue Projections

Month 6: 50 companies × $399/month = $240K ARR
Month 12: 200 companies × $449/month = $1.08M ARR  
Month 24: 500 companies × $499/month = $3M ARR
Month 36: 1000 companies × $599/month = $7.2M ARR`,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "subscription",
    market: "B2B",
    targetAudience: "startups",
    mainCompetitor: "Four Sigmatic",
    keyword: "office coffee service",
    keywordVolume: 8900,
    keywordGrowth: "156",
    opportunityScore: 7,
    opportunityLabel: "High",
    problemScore: 8,
    problemLabel: "Significant",
    feasibilityScore: 8,
    feasibilityLabel: "Good",
    timingScore: 7,
    timingLabel: "Good Timing",
    executionScore: 4,
    gtmScore: 6,
    revenuePotential: "$1M-$10M ARR with B2B subscription model",
    revenuePotentialNum: 5500000,
    executionDifficulty: "Low complexity, supply chain and partnerships focus",
    gtmStrength: "Direct sales to startups, partnership with coworking spaces",
    viewCount: 723,
    saveCount: 45,
    voteCount: 98,
  },
  {
    title: "ClearLabel: Decode Hidden Food Ingredients in Seconds",
    subtitle: "$3M-$5M ARR Potential",
    slug: "ai-powered-ingredient-transparency-tool-for-nootropics",
    description: "ClearLabel turns confusing product labels into instant, trustworthy insights for health-conscious shoppers. Upload a photo of any ingredient list, and the platform decodes chemical names, flags concerning additives, and translates nutritional jargon into plain English. It spots allergens, identifies potentially harmful ingredients, and gives you personalized recommendations based on your dietary needs.",
    content: `# The Transparency Gap

30,000 monthly searches show people are desperate to understand what's really in their food. Current solutions are fragmented across multiple apps and websites.

## Core Features

**Instant Scanning:**
- Photo-based ingredient recognition
- Real-time ingredient database lookup
- Allergen and intolerance flagging
- Additive health impact scoring

**Personalized Intelligence:**
- Custom dietary restriction profiles
- Alternative product suggestions
- Shopping list optimization
- Nutrition goal alignment

**Community Verification:**
- User-generated ingredient reviews
- Crowdsourced product database
- Expert nutritionist validation
- Brand transparency scoring

## Revenue Streams

**Freemium Model ($4.99/month premium):**
- Unlimited scanning and analysis
- Personalized recommendations
- Advanced filtering and search
- Product recall notifications

**Enterprise API ($999/month):**
- Bulk ingredient analysis
- Custom brand integration
- White-label solutions
- Advanced analytics dashboard

## Market Expansion

Year 1: Focus on packaged foods and supplements
Year 2: Add restaurant menu analysis
Year 3: Expand to cosmetics and personal care
Year 4: International markets and localization`,
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "mobile_app",
    market: "B2C",
    targetAudience: "health-conscious consumers",
    mainCompetitor: "Yuka",
    keyword: "food ingredient scanner",
    keywordVolume: 15600,
    keywordGrowth: "78",
    opportunityScore: 9,
    opportunityLabel: "Exceptional",
    problemScore: 8,
    problemLabel: "High Pain",
    feasibilityScore: 5,
    feasibilityLabel: "Challenging",
    timingScore: 8,
    timingLabel: "Great Timing",
    executionScore: 6,
    gtmScore: 7,
    revenuePotential: "$3M-$5M ARR with freemium model",
    revenuePotentialNum: 4000000,
    executionDifficulty: "AI/ML complexity for accurate ingredient recognition",
    gtmStrength: "Viral growth through health communities and influencer partnerships",
    viewCount: 1089,
    saveCount: 78,
    voteCount: 167,
  },
  {
    title: "Smart App Finder for Parents and Teachers",
    subtitle: "$3M ARR Potential",
    slug: "ai-curation-platform-for-childrens-educational-apps",
    description: "Parents and educators waste hours searching for quality educational apps among thousands of options, often settling for flashy graphics over real learning value. Smart App Finder matches kids with educator-validated apps based on learning style, age, and educational needs. The platform vets every recommendation through certified teachers and provides personalized suggestions that boost learning outcomes by approximately 30%.",
    content: `# The Education App Chaos

The children's app market contains 500,000+ educational apps, but 89% provide little to no educational value. Parents spend an average of 45 minutes weekly searching for appropriate content.

## Solution Framework

**AI-Powered Matching:**
- Learning style assessment for each child
- Age-appropriate content filtering
- Skill gap identification and targeted recommendations
- Progress tracking across multiple apps

**Educator Validation Network:**
- 500+ certified teachers reviewing apps
- Classroom-tested effectiveness ratings
- Curriculum alignment verification
- Safety and content appropriateness screening

**Personalized Learning Paths:**
- Custom app sequences for skill development
- Adaptive difficulty progression
- Parent/teacher progress dashboards
- Achievement tracking and rewards

## Revenue Model

**Family Plan ($8.99/month):**
- Unlimited app recommendations
- Progress tracking for up to 4 children
- Basic learning analytics
- Parental control integration

**School Plan ($49/month per classroom):**
- Bulk app management
- Advanced analytics and reporting
- Curriculum alignment tools
- Teacher training resources

## Growth Strategy

Phase 1: Target homeschooling communities and parents of gifted children
Phase 2: Partner with school districts for pilot programs
Phase 3: International expansion and multilingual support`,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "web_app",
    market: "B2C",
    targetAudience: "parents and teachers",
    mainCompetitor: "Common Sense Media",
    keyword: "educational apps for kids",
    keywordVolume: 22100,
    keywordGrowth: "67",
    opportunityScore: 8,
    opportunityLabel: "Very High",
    problemScore: 9,
    problemLabel: "Critical Pain",
    feasibilityScore: 7,
    feasibilityLabel: "Moderate",
    timingScore: 7,
    timingLabel: "Good Timing",
    executionScore: 5,
    gtmScore: 8,
    revenuePotential: "$3M ARR through subscription and school partnerships",
    revenuePotentialNum: 3000000,
    executionDifficulty: "Moderate complexity, requires educator network building",
    gtmStrength: "Strong word-of-mouth in parent and teacher communities",
    viewCount: 654,
    saveCount: 89,
    voteCount: 123,
  },
  {
    title: "Club Command Center: The Operating System for Sports Clubs",
    subtitle: "$5-10M ARR Potential",
    slug: "unified-multi-sport-facility-management-software",
    description: "Sports clubs are drowning in admin chaos. Coaches juggle five different apps, parents miss crucial updates, and treasurers chase payments through disconnected systems. Club Command Center consolidates everything into one seamless platform: member management, payment collection, scheduling, communications, and compliance tracking. Your entire club runs from a single dashboard, giving administrators back 20+ hours weekly.",
    content: `# The Sports Club Software Crisis

300,000+ sports clubs in the US manage operations through an average of 5.7 different platforms, creating inefficiency and frustration for all stakeholders.

## Unified Platform Features

**Member Management:**
- Automated registration and renewals
- Digital membership cards and check-ins
- Family account linking and billing
- Medical information and emergency contacts

**Financial Operations:**
- Integrated payment processing
- Automated recurring billing
- Fee tracking and reporting
- Financial analytics and forecasting

**Communications Hub:**
- Multi-channel messaging (SMS, email, push)
- Event announcements and reminders
- Parent-coach communication tools
- Club-wide news and updates

**Compliance & Safety:**
- Background check tracking
- Insurance documentation management
- Safety training compliance
- Incident reporting and tracking

## Market Opportunity

**Target Market Size:**
- 300,000+ youth sports clubs in the US
- Average club size: 150 members
- Current spend: $200-800/month on multiple tools
- Total addressable market: $7.2B annually

## Revenue Model

**Starter ($149/month):** Up to 100 members
**Professional ($299/month):** Up to 300 members  
**Enterprise ($499/month):** Unlimited members + advanced features
**Custom:** Large multi-sport organizations

## Competitive Advantages

- Single platform replacing 5-7 existing tools
- 95%+ customer retention through high switching costs
- Network effects connecting clubs, leagues, and tournaments
- Revenue sharing with payment processing`,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "web_app",
    market: "B2B",
    targetAudience: "sports clubs",
    mainCompetitor: "TeamSnap",
    keyword: "sports club management software",
    keywordVolume: 5400,
    keywordGrowth: "43",
    opportunityScore: 8,
    opportunityLabel: "Very High",
    problemScore: 9,
    problemLabel: "Critical Pain",
    feasibilityScore: 6,
    feasibilityLabel: "Moderate",
    timingScore: 7,
    timingLabel: "Good Timing",
    executionScore: 7,
    gtmScore: 8,
    revenuePotential: "$5M-$10M ARR through B2B subscriptions",
    revenuePotentialNum: 7500000,
    executionDifficulty: "Complex integration requirements, high initial development",
    gtmStrength: "Direct sales to sports organizations, strong referral potential",
    viewCount: 445,
    saveCount: 34,
    voteCount: 87,
  },
  {
    title: "TravelTruth Verifier: Cutting Through Eco-Tourism Greenwashing",
    subtitle: "$3M ARR Potential",
    slug: "ai-tool-to-verify-regenerative-travel-claims",
    description: "Most travelers want sustainable options but 70% are confused by misleading eco-claims. TravelTruth is a verification platform that instantly checks hotels, tours, and destinations against verified sustainability databases in real-time. Simply paste any travel listing or eco-claim, and the system immediately flags greenwashing versus genuine practices, showing you third-party certifications and concrete evidence.",
    content: `# The Greenwashing Problem

$338B sustainable tourism market is plagued by false claims. 73% of eco-labeled travel options fail basic sustainability standards when investigated.

## Verification Technology

**Real-time Analysis:**
- Cross-reference against 50+ legitimate certifications
- Historical sustainability report analysis
- Social media sentiment and local community feedback
- Environmental impact data verification

**Truth Score Algorithm:**
- Weighted scoring across multiple verification sources
- Red flags for common greenwashing tactics
- Confidence intervals and data quality indicators
- Alternative recommendation suggestions

## Product Features

**Browser Extension ($9.99/month):**
- Instant verification while browsing travel sites
- Greenwashing alert notifications
- Sustainability score overlays
- Better alternative suggestions

**Travel Agent API ($499/month):**
- Bulk verification for client bookings
- White-label verification tools
- Custom reporting and analytics
- Client trust-building materials

**Certification Marketplace:**
- Connect genuinely sustainable operators with conscious travelers
- Verified operator directory
- Direct booking platform integration
- Review and rating system

## Market Expansion Strategy

Year 1: Focus on accommodation and major tour operators
Year 2: Add transportation and activity verification
Year 3: Expand to corporate travel and event planning
Year 4: International markets and local certification bodies`,
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "web_app",
    market: "B2C",
    targetAudience: "eco-conscious travelers",
    mainCompetitor: "BookDifferent",
    keyword: "sustainable travel verification",
    keywordVolume: 3200,
    keywordGrowth: "234",
    opportunityScore: 8,
    opportunityLabel: "Very High",
    problemScore: 7,
    problemLabel: "Significant",
    feasibilityScore: 6,
    feasibilityLabel: "Moderate",
    timingScore: 9,
    timingLabel: "Perfect Timing",
    executionScore: 6,
    gtmScore: 7,
    revenuePotential: "$3M ARR through subscriptions and API licensing",
    revenuePotentialNum: 3000000,
    executionDifficulty: "Moderate complexity, data partnerships crucial",
    gtmStrength: "Partnership with travel influencers and sustainable travel communities",
    viewCount: 287,
    saveCount: 23,
    voteCount: 45,
  },
  {
    title: "GLP-1 Management App That Personalizes Dosing Based on Patient Data",
    subtitle: "$1M-$10M ARR Potential",
    slug: "personalized-dosage-management-platform-for-glp-1s",
    description: "DoseRight solves the GLP-1 medication dosing nightmare for Ozempic and Wegovy users. The app creates custom titration plans based on your wearable data, medication history, and real-time symptoms. It monitors blood glucose, weight changes, and side effects, then adjusts your protocol for optimal results with minimal side effects.",
    content: `# The GLP-1 Dosing Challenge

37+ million diabetics and millions more using GLP-1s for weight loss struggle with proper dosing. Current one-size-fits-all protocols lead to 40% medication discontinuation due to side effects.

## Personalization Engine

**Data Integration:**
- Continuous glucose monitor (CGM) data
- Smart scale weight tracking
- Wearable device metrics (sleep, activity, heart rate)
- Manual symptom logging
- Medication adherence tracking

**AI-Powered Recommendations:**
- Personalized titration schedules
- Side effect prediction and mitigation
- Optimal injection timing suggestions
- Lifestyle modification recommendations

## Product Offerings

**Individual Plan ($19/month):**
- Personalized dosing schedules
- Side effect tracking and alerts
- Integration with popular wearables
- Medication reminders and refill coordination

**Clinical Dashboard ($499/month per clinic):**
- Patient progress monitoring
- Automated EHR integration
- Early warning systems for concerning symptoms
- Bulk patient management tools

**Pharma Partnerships:**
- Real-world evidence data licensing
- Clinical trial participant recruitment
- Post-market surveillance tools
- Medication adherence insights

## Regulatory Pathway

FDA Digital Therapeutics (DTx) pathway for:
- Clinical decision support tools
- Patient monitoring and engagement
- Medication adherence improvement
- Outcome optimization algorithms

Target FDA clearance within 18 months through predicate device pathway.`,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "mobile_app",
    market: "B2C",
    targetAudience: "diabetes and weight loss patients",
    mainCompetitor: "MySugr",
    keyword: "ozempic dosing schedule",
    keywordVolume: 18900,
    keywordGrowth: "289",
    opportunityScore: 9,
    opportunityLabel: "Exceptional",
    problemScore: 9,
    problemLabel: "Critical Pain",
    feasibilityScore: 5,
    feasibilityLabel: "Challenging",
    timingScore: 9,
    timingLabel: "Perfect Timing",
    executionScore: 8,
    gtmScore: 6,
    revenuePotential: "$1M-$10M ARR through patient subscriptions and clinical licensing",
    revenuePotentialNum: 5500000,
    executionDifficulty: "High complexity, FDA regulation and clinical validation required",
    gtmStrength: "Healthcare provider partnerships and patient advocacy groups",
    viewCount: 1156,
    saveCount: 98,
    voteCount: 201,
  },
  {
    title: "Practice Management Software that Simplifies Operations for Small Vet Clinics",
    subtitle: "$10M ARR Potential",
    slug: "triage-and-rx-management-app-for-small-vet-practices",
    description: "Small vet clinics are drowning in clunky, overpriced software that wasn't built for them. This streamlined solution delivers the essential tools independent practices need: triage, prescription management, and scheduling in one affordable package.",
    content: `# The Small Practice Problem

35,000+ independent vet clinics struggle with software designed for large hospitals. Current solutions cost $500-2000/month and require extensive training.

## Streamlined Feature Set

**Patient Records:**
- Instant loading on any device
- Photo and video documentation
- Treatment history and notes
- Vaccination tracking and reminders

**Prescription Management:**
- Medication tracking with automatic refill alerts
- DEA compliance and controlled substance logging
- Integration with major veterinary pharmacies
- Dosage calculators and drug interaction warnings

**Appointment Scheduling:**
- Intuitive drag-and-drop calendar
- Client reminders via SMS and email
- Emergency appointment flagging
- Waitlist management

**Billing Integration:**
- Simple invoicing with payment processing
- Insurance claim submission
- Financial reporting and analytics
- Inventory tracking for medications

## Pricing Strategy

**Essential Plan ($199/month):**
- Up to 1,000 active patients
- Basic features for single-doctor practices
- Email support and training videos

**Professional Plan ($299/month):**
- Up to 3,000 active patients
- Multi-doctor scheduling
- Advanced reporting and analytics
- Phone support and implementation assistance

## Market Opportunity

- 35,000 independent vet clinics in the US
- Average practice revenue: $1.2M annually
- Current software spend: 2-4% of revenue
- Market dissatisfaction rate: 68%

Target 1% market share (350 clinics) by Year 2: $1.26M ARR
Scale to 5% market share (1,750 clinics) by Year 5: $6.3M ARR`,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
    type: "web_app",
    market: "B2B",
    targetAudience: "small veterinary practices",
    mainCompetitor: "VetBlue",
    keyword: "veterinary practice management software",
    keywordVolume: 4100,
    keywordGrowth: "34",
    opportunityScore: 7,
    opportunityLabel: "High",
    problemScore: 8,
    problemLabel: "Significant",
    feasibilityScore: 8,
    feasibilityLabel: "Good",
    timingScore: 6,
    timingLabel: "Moderate Timing",
    executionScore: 6,
    gtmScore: 7,
    revenuePotential: "$10M ARR through B2B software subscriptions",
    revenuePotentialNum: 10000000,
    executionDifficulty: "Moderate complexity, veterinary domain expertise required",
    gtmStrength: "Direct sales at veterinary conferences, industry publication advertising",
    viewCount: 234,
    saveCount: 18,
    voteCount: 42,
  }
];

export const sampleCommunitySignals: InsertCommunitySignal[] = [
  // Native Plant Navigator signals
  {
    ideaId: "", // Will be filled when creating ideas
    platform: "reddit",
    signalType: "subreddit",
    name: "r/NativePlantGardening",
    memberCount: 125000,
    engagementScore: 8,
    url: "https://reddit.com/r/NativePlantGardening",
    description: "Active community discussing native plant selection and care",
  },
  {
    ideaId: "",
    platform: "reddit", 
    signalType: "subreddit",
    name: "r/landscaping",
    memberCount: 850000,
    engagementScore: 7,
    url: "https://reddit.com/r/landscaping",
    description: "General landscaping community with growing native plant interest",
  },
  {
    ideaId: "",
    platform: "facebook",
    signalType: "group", 
    name: "Native Plants and Wildlife Gardening",
    memberCount: 45000,
    engagementScore: 9,
    url: "https://facebook.com/groups/nativeplants",
    description: "Highly engaged Facebook group sharing native plant experiences",
  },
  {
    ideaId: "",
    platform: "youtube",
    signalType: "channel",
    name: "Native Plant Channel Network",
    memberCount: 78000,
    engagementScore: 7,
    url: "https://youtube.com/nativeplants",
    description: "Growing YouTube community focused on native plant education",
  },
  // TimeSync signals  
  {
    ideaId: "",
    platform: "reddit",
    signalType: "subreddit",
    name: "r/remotework",
    memberCount: 450000,
    engagementScore: 8,
    url: "https://reddit.com/r/remotework",
    description: "Remote work community frequently discussing scheduling challenges",
  },
  {
    ideaId: "",
    platform: "reddit",
    signalType: "subreddit", 
    name: "r/productivity",
    memberCount: 1200000,
    engagementScore: 7,
    url: "https://reddit.com/r/productivity",
    description: "Productivity-focused community with timezone coordination pain points",
  },
];
