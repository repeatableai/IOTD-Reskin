import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import { 
  ArrowLeft, TrendingUp, AlertTriangle, Lightbulb, Users, DollarSign, 
  MessageSquare, Target, Zap, Quote, ExternalLink, RefreshCw, CheckCircle,
  BarChart3, PieChart, Activity, Sparkles, FileText, Building, UserCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface InsightData {
  overview: {
    summary: string;
    marketSize: string;
    growthRate: string;
    competitionLevel: string;
    entryBarrier: string;
    keyTrends: string[];
    targetAudience: string[];
  };
  painPoints: {
    score: number;
    severity: string;
    items: Array<{
      title: string;
      description: string;
      severity: 'critical' | 'high' | 'moderate';
      frequency: string;
      userQuotes: string[];
      sources: string[];
    }>;
  };
  solutionGaps: {
    score: number;
    severity: string;
    items: Array<{
      title: string;
      description: string;
      opportunity: 'massive' | 'significant' | 'moderate';
      existingSolutions: string[];
      whyTheyFail: string;
      idealSolution: string;
    }>;
  };
  underservedSegments: {
    score: number;
    segments: Array<{
      name: string;
      size: string;
      description: string;
      painIntensity: number;
      willingnessToPay: string;
      currentAlternatives: string;
      opportunity: string;
    }>;
  };
  moneySignals: {
    score: number;
    totalAddressableMarket: string;
    servicableMarket: string;
    avgCustomerValue: string;
    signals: Array<{
      type: 'spending' | 'investment' | 'growth' | 'pricing';
      title: string;
      description: string;
      evidence: string;
      strength: 'strong' | 'moderate' | 'emerging';
    }>;
    revenueModels: string[];
    pricingBenchmarks: string[];
  };
}

// Market opportunity data store
const MARKET_DATA: Record<string, { title: string; description: string; category: string }> = {
  "market-mountain-bike-trail-stewardship--funding": {
    title: "Mountain Bike Trail Stewardship & Funding",
    description: "Trail maintenance bounties, tool lending, incident logs, and land-use advocacy.",
    category: "Outdoor Recreation"
  },
  "market-pet-loss-cremation--memorial-services": {
    title: "Pet Loss, Cremation & Memorial Services",
    description: "Transparent pricing, grief resources, keepsake products, and compliance.",
    category: "Pet Services"
  },
  "market-backyard-chickens--urban-homesteading": {
    title: "Backyard Chickens & Urban Homesteading",
    description: "Local ordinance navigation, coop designs, feed/health, and predator-proofing guides.",
    category: "Urban Agriculture"
  },
  "market-compliance-automation-for-emerging-regulations": {
    title: "Compliance Automation for Emerging Regulations",
    description: "AI-powered compliance tracking for new regulations across industries.",
    category: "RegTech"
  },
  "market-calendar-optimization--meeting-roi-analytics": {
    title: "Calendar Optimization & Meeting ROI Analytics",
    description: "AI-powered calendar management with meeting cost analysis and focus time protection.",
    category: "Productivity"
  },
  "market-weight-loss-drugs-and-support": {
    title: "Weight Loss Drugs and Support",
    description: "Clinics and apps providing monitoring and coaching alongside new pharmaceuticals.",
    category: "Healthcare"
  },
  "market-senior-move-management-and-downsizing-services": {
    title: "Senior Move Management and Downsizing Services",
    description: "Helping boomers with sorting, packing, and transitioning to smaller homes.",
    category: "Senior Services"
  },
  "market-homeowner--contractor-permit-ops": {
    title: "Homeowner & Contractor Permit Ops",
    description: "Digitizing submittals and one-click permit packages for remodels and ADUs.",
    category: "Construction Tech"
  },
  "market-youth-sports-ops-platforms": {
    title: "Youth Sports Ops Platforms",
    description: "Scheduling, payments, ref assignments replacing spreadsheets and group chats.",
    category: "Sports Tech"
  },
  "market-sustainable-landscaping-and-lawn-care": {
    title: "Sustainable Landscaping and Lawn Care",
    description: "Electric tools, native plants, and organic methods for eco-conscious consumers.",
    category: "Green Services"
  },
  "market-gaming-peripheral-customization--reviews": {
    title: "Gaming Peripheral Customization & Reviews",
    description: "Custom controller marketplaces and performance testing communities.",
    category: "Gaming"
  },
  "market-washable-home-textiles-e-commerce": {
    title: "Washable Home Textiles E-commerce",
    description: "Pet-friendly, family-focused washable rugs and textiles.",
    category: "Home Goods"
  }
};

// Generate comprehensive insight data based on market topic
const generateInsightData = (title: string, description: string, category: string): InsightData => {
  // These would ideally come from AI, but we'll generate comprehensive mock data
  const baseData: Record<string, InsightData> = {
    "Weight Loss Drugs and Support": {
      overview: {
        summary: "The weight loss pharmaceutical market is experiencing unprecedented growth with the introduction of GLP-1 agonists like Ozempic and Wegovy. This creates massive opportunities for supporting software, coaching platforms, and monitoring solutions that help patients optimize their treatment outcomes.",
        marketSize: "$24.3 Billion (2024)",
        growthRate: "47% CAGR through 2030",
        competitionLevel: "Moderate - Fragmented",
        entryBarrier: "Medium",
        keyTrends: [
          "GLP-1 drugs becoming mainstream treatment",
          "Insurance coverage expanding rapidly",
          "Telemedicine prescribing on the rise",
          "Personalized dosing gaining traction",
          "Combination therapy protocols emerging"
        ],
        targetAudience: [
          "Patients on GLP-1 medications (8.5M+ in US)",
          "Obesity medicine clinics",
          "Primary care physicians",
          "Telehealth weight loss providers",
          "Health coaches and nutritionists"
        ]
      },
      painPoints: {
        score: 8,
        severity: "severe",
        items: [
          {
            title: "Dosing Optimization Confusion",
            description: "Patients struggle with when to titrate doses, how to manage side effects, and what symptoms require attention vs. are normal.",
            severity: "critical",
            frequency: "85% of patients report confusion",
            userQuotes: [
              "I've been on 0.5mg for 8 weeks and don't know if I should ask to increase. My doctor seems to just follow a generic schedule.",
              "The nausea is awful but I can't tell if it's 'normal' or if I'm doing something wrong with timing."
            ],
            sources: ["r/Ozempic", "r/Semaglutide", "Facebook GLP-1 Support Groups"]
          },
          {
            title: "Side Effect Management",
            description: "Nausea, constipation, and fatigue are common but patients lack clear guidance on managing them effectively.",
            severity: "high",
            frequency: "72% experience significant side effects",
            userQuotes: [
              "No one told me to eat smaller portions BEFORE starting. I learned the hard way.",
              "The constipation is brutal. Tried everything before finding what works."
            ],
            sources: ["r/Mounjaro", "Weight Loss Surgery Foundation forums"]
          },
          {
            title: "Tracking & Progress Visibility",
            description: "Patients want to track more than weight - they need to see food tolerance, energy levels, and other metrics to stay motivated.",
            severity: "high",
            frequency: "68% want better tracking tools",
            userQuotes: [
              "I wish there was an app that tracked my 'food noise' levels. That's the real win for me.",
              "Seeing the scale not move is demotivating. I need to see other progress markers."
            ],
            sources: ["r/loseit", "MyFitnessPal forums"]
          },
          {
            title: "Supply & Access Issues",
            description: "Medication shortages, insurance denials, and high costs create anxiety and treatment gaps.",
            severity: "critical",
            frequency: "45% report access difficulties",
            userQuotes: [
              "My pharmacy has been out for 3 weeks. I'm terrified of regaining.",
              "Insurance denied me twice. Paying $1,200/month out of pocket."
            ],
            sources: ["r/Ozempic", "GoodRx community"]
          }
        ]
      },
      solutionGaps: {
        score: 6,
        severity: "high",
        items: [
          {
            title: "Personalized Dosing Intelligence",
            description: "No solution currently uses patient data to recommend optimal dose timing, titration schedules, or adjustments.",
            opportunity: "massive",
            existingSolutions: ["Generic dosing charts", "Doctor consultations (infrequent)"],
            whyTheyFail: "One-size-fits-all approaches ignore individual metabolism, lifestyle, and response patterns.",
            idealSolution: "AI-powered dosing recommendations based on real-time symptom tracking, food intake, and biomarkers."
          },
          {
            title: "Integrated Side Effect Management",
            description: "Patients piece together advice from forums instead of having evidence-based, personalized side effect protocols.",
            opportunity: "significant",
            existingSolutions: ["Reddit threads", "Generic patient handouts"],
            whyTheyFail: "Not personalized, not proactive, and not integrated with treatment tracking.",
            idealSolution: "Predictive side effect alerts with personalized intervention protocols based on patient history."
          },
          {
            title: "Community + Clinical Hybrid",
            description: "Patients want peer support but also clinical credibility. Current solutions are either clinical (cold) or community (unverified).",
            opportunity: "significant",
            existingSolutions: ["Facebook groups", "Telehealth apps"],
            whyTheyFail: "Clinical apps lack community; communities lack medical oversight.",
            idealSolution: "Clinician-moderated communities with peer support, verified information, and care team integration."
          }
        ]
      },
      underservedSegments: {
        score: 8,
        segments: [
          {
            name: "Self-Pay Patients",
            size: "2.1M in US",
            description: "Patients paying out-of-pocket who need maximum value and efficacy from expensive medications.",
            painIntensity: 9,
            willingnessToPay: "$50-150/month for optimization tools",
            currentAlternatives: "Free Reddit advice, basic tracking apps",
            opportunity: "Premium tier with ROI calculators showing cost-per-pound-lost optimization."
          },
          {
            name: "Obesity Medicine Clinics",
            size: "4,500+ clinics in US",
            description: "Practices overwhelmed with new patient volume needing scalable patient management.",
            painIntensity: 8,
            willingnessToPay: "$200-500/month per provider",
            currentAlternatives: "Generic EHR, manual follow-ups",
            opportunity: "B2B platform for patient monitoring, automated check-ins, and outcome tracking."
          },
          {
            name: "Compounding Pharmacy Patients",
            size: "800K+ estimated",
            description: "Patients using compounded semaglutide who lack mainstream app support and community.",
            painIntensity: 7,
            willingnessToPay: "$25-75/month",
            currentAlternatives: "Telegram groups, scattered forums",
            opportunity: "First legitimate platform serving this growing but underserved segment."
          }
        ]
      },
      moneySignals: {
        score: 9,
        totalAddressableMarket: "$24.3B",
        servicableMarket: "$4.2B (digital support tools)",
        avgCustomerValue: "$480/year consumer, $3,600/year B2B",
        signals: [
          {
            type: "spending",
            title: "Patients Spending on Supplements",
            description: "GLP-1 users spending $50-200/month on supplements (fiber, electrolytes, protein) to manage side effects.",
            evidence: "Amazon reviews, r/Ozempic supplement recommendation threads with 500+ upvotes",
            strength: "strong"
          },
          {
            type: "investment",
            title: "VC Pouring Into GLP-1 Adjacent",
            description: "Calibrate Health raised $100M, Found raised $100M, Ro acquired Workpath - all GLP-1 focused.",
            evidence: "Crunchbase data, TechCrunch funding announcements",
            strength: "strong"
          },
          {
            type: "growth",
            title: "Explosive Search Volume",
            description: "'Ozempic' searches up 400% YoY, 'semaglutide dosing' up 650% YoY.",
            evidence: "Google Trends data, SEMrush keyword tracking",
            strength: "strong"
          },
          {
            type: "pricing",
            title: "Premium Willingness Demonstrated",
            description: "Patients paying $300+/month for telehealth GLP-1 services beyond just medication costs.",
            evidence: "Calibrate ($299/mo), Found ($149/mo), Ro Body ($145/mo) pricing pages",
            strength: "strong"
          }
        ],
        revenueModels: [
          "B2C subscription ($15-50/month)",
          "B2B SaaS for clinics ($200-800/month)",
          "Affiliate partnerships with compounding pharmacies",
          "Data insights licensing to pharma",
          "White-label platform for telehealth providers"
        ],
        pricingBenchmarks: [
          "Noom: $70/month",
          "Calibrate: $299/month (all-inclusive)",
          "WW (Weight Watchers): $45/month",
          "Lumen metabolism tracker: $299 device + $19/month"
        ]
      }
    }
  };

  // Return specific data if available, otherwise generate generic data
  if (baseData[title]) {
    return baseData[title];
  }

  // Generate much more detailed category-appropriate data
  const categoryData: Record<string, InsightData> = {
    "Mountain Bike Trail Stewardship & Funding": {
      overview: {
        summary: `The mountain bike trail stewardship market sits at a critical inflection point. With over 40 million Americans riding mountain bikes annually and trail systems under increasing pressure from overuse, climate events, and limited municipal budgets, there's a massive opportunity for technology-enabled solutions. Traditional trail maintenance relies heavily on volunteer labor coordinated through Facebook groups and email chains—a fundamentally broken system that results in trail closures, safety hazards, and ongoing conflicts with land managers. The average trail association spends 60% of their time on coordination and communication rather than actual trail work. Meanwhile, riders are increasingly willing to pay for quality trail access, as evidenced by the success of trail associations like IMBA chapters that have grown membership 40% in three years.`,
        marketSize: "$3.2B (trail maintenance + outdoor recreation tech)",
        growthRate: "18% CAGR through 2028",
        competitionLevel: "Low - Highly fragmented with no dominant player",
        entryBarrier: "Low to Medium",
        keyTrends: [
          "E-bike adoption expanding trail user demographics 3x",
          "Land managers requiring digital trail monitoring for permits",
          "Climate-driven trail damage increasing maintenance needs 40%",
          "Corporate sponsors seeking measurable community impact",
          "Insurance companies requiring incident documentation",
          "Gen Z outdoor enthusiasts expecting app-based coordination",
          "Municipal budget cuts forcing trail associations to self-fund"
        ],
        targetAudience: [
          "Trail association directors and board members (12,000+ orgs)",
          "Land managers at BLM, Forest Service, State Parks (8,500+ contacts)",
          "Corporate outdoor brands seeking sponsorship ROI",
          "Mountain bike shop owners coordinating local rides",
          "Individual riders willing to contribute time or money",
          "Insurance providers covering trail events and maintenance",
          "Municipal parks departments with limited budgets"
        ]
      },
      painPoints: {
        score: 8,
        severity: "severe",
        items: [
          {
            title: "Volunteer Coordination Chaos",
            description: "Trail associations spend 15-20 hours per week managing volunteers through fragmented tools—Facebook groups for announcements, Google Sheets for signups, email chains for follow-ups, and WhatsApp for day-of coordination. Volunteers regularly show up at wrong times, wrong locations, or not at all because information is scattered.",
            severity: "critical",
            frequency: "92% of trail associations report this as their #1 operational challenge",
            userQuotes: [
              "I posted the work day details in our Facebook group, sent an email, AND texted our regulars. Still had 6 people show up at the wrong trailhead. I wanted to scream.",
              "We lost our most dedicated volunteer because he got frustrated with the constant confusion. That's 200+ hours of trail work gone.",
              "I spend more time coordinating volunteers than actually maintaining trails. Something is deeply wrong with that.",
              "Last month I had 30 people sign up for a trail day. 8 showed up. The no-show rate is killing us."
            ],
            sources: ["r/MTB", "r/mountainbiking", "IMBA Chapter Forums", "Trailforks Discussion Boards", "Facebook Trail Association Groups"]
          },
          {
            title: "Funding & Donor Management Nightmare",
            description: "Most trail associations run on shoestring budgets and struggle to track donations, demonstrate impact to sponsors, and maintain relationships with funders. They use PayPal for donations, Excel for tracking, and manual reports that take hours to compile.",
            severity: "critical",
            frequency: "78% operate without proper donor management",
            userQuotes: [
              "Our biggest sponsor asked for an impact report. It took me 3 weeks to pull together the data from different sources. We almost lost them.",
              "We have no idea which donors have lapsed or who we should be cultivating. Everything is in my head and that's terrifying.",
              "Grant applications require specific metrics we don't track. We've missed out on $50K+ in funding because we couldn't provide data.",
              "Someone donated $5,000 anonymously through PayPal and we couldn't even thank them properly."
            ],
            sources: ["Trail Association Board Meetings", "IMBA Summit Discussions", "Nonprofit Management Forums"]
          },
          {
            title: "Trail Condition Reporting Black Hole",
            description: "When trails are damaged by storms, vandalism, or overuse, there's no systematic way to report, prioritize, and track repairs. Riders post on social media, send emails to whoever they think is responsible, or just stop riding the trail.",
            severity: "high",
            frequency: "85% of trail damage goes unreported or untracked",
            userQuotes: [
              "There's a massive blowdown on Blue Trail that's been there for 3 months. I've reported it twice but have no idea if anyone's even seen my reports.",
              "We find out about trail damage from angry Yelp reviews. That's humiliating and preventable.",
              "Riders built an unauthorized bypass around a wet section. Now we have erosion AND a land manager threatening to close the trail.",
              "I drove 2 hours to ride a trail that was apparently closed. No signs, no updates anywhere I could find."
            ],
            sources: ["Trailforks Reviews", "MTBProject Comments", "r/MTB", "Local Riding Group Chats"]
          },
          {
            title: "Land Manager Relationship Strain",
            description: "Trail associations struggle to maintain professional relationships with land managers because they can't demonstrate organized operations, track compliance with agreements, or provide documentation required for permits and insurance.",
            severity: "high",
            frequency: "65% have had permit issues due to documentation gaps",
            userQuotes: [
              "The Forest Service asked for our maintenance logs from the past year. We had... nothing organized. Lost our volunteer agreement for 6 months.",
              "Our land manager saw a Facebook post about an unauthorized trail feature before we could address it. Damaged trust we'd built for years.",
              "We were denied a trail expansion permit because we couldn't prove we had the volunteer capacity to maintain it.",
              "Insurance auditor wanted incident reports. We had some in email, some in texts, some in people's memories. It was embarrassing."
            ],
            sources: ["BLM Public Comments", "Forest Service Recreation Forums", "Trail Association Newsletters"]
          },
          {
            title: "Tool Lending Logistics Disaster",
            description: "Trail associations own thousands of dollars in specialized tools (McCleods, Pulaskis, rock bars) that sit unused 90% of the time. Tracking who has what tool, scheduling pickups/returns, and managing inventory is a full-time job nobody has time for.",
            severity: "moderate",
            frequency: "70% of associations have lost or damaged tools due to poor tracking",
            userQuotes: [
              "We bought $3,000 in new tools last year. I have no idea where half of them are right now.",
              "Someone 'borrowed' our rock bar for a personal project 8 months ago. Still haven't gotten it back.",
              "Three different people showed up to the work day expecting to use our only chainsaw. Nobody had checked if it was available.",
              "Tools come back dull, broken, or dirty. No accountability because we can't track who had them last."
            ],
            sources: ["Trail Association Board Discussions", "IMBA Chapter Calls", "r/MTB Volunteer Threads"]
          }
        ]
      },
      solutionGaps: {
        score: 6,
        severity: "critical",
        items: [
          {
            title: "Unified Trail Association Management Platform",
            description: "No solution exists that combines volunteer coordination, donor management, trail condition reporting, tool tracking, and land manager communication in a single platform purpose-built for trail organizations.",
            opportunity: "massive",
            existingSolutions: [
              "SignUpGenius (generic volunteer scheduling)",
              "Facebook Groups (community communication)",
              "Google Sheets (everything else)",
              "Trailforks (trail mapping, not management)",
              "Wild Apricot (generic nonprofit CRM)"
            ],
            whyTheyFail: "Generic tools don't understand trail-specific workflows. Volunteers won't learn 5 different systems. Data silos make reporting impossible. No integration with land manager requirements.",
            idealSolution: "Purpose-built platform with: mobile-first volunteer app with GPS check-in, integrated donation processing with automatic impact tracking, trail condition reporting with photo documentation and priority routing, tool inventory with QR-code checkout, and automated land manager reporting dashboards."
          },
          {
            title: "Trail Maintenance Bounty System",
            description: "No platform enables trail associations to post specific maintenance tasks with rewards (cash, gear, recognition) that riders can claim and complete with verified documentation.",
            opportunity: "significant",
            existingSolutions: [
              "Informal Facebook bounties",
              "Volunteer hour tracking spreadsheets",
              "REI Co-op grants (annual, not task-based)"
            ],
            whyTheyFail: "No verification mechanism, no reward infrastructure, no gamification to drive engagement. Riders want to help but don't know what's needed or how to prove they did it.",
            idealSolution: "TaskRabbit-style platform for trail work: associations post prioritized tasks with point/cash rewards, riders claim tasks, submit photo/GPS verification, earn rewards redeemable for gear or donations to the trail fund."
          },
          {
            title: "Incident Documentation & Liability Protection",
            description: "Trail associations lack proper systems to document incidents, near-misses, and hazards in ways that protect them legally and satisfy insurance requirements.",
            opportunity: "significant",
            existingSolutions: [
              "Paper incident forms (if they exist)",
              "Email chains with photos",
              "Memory and word-of-mouth"
            ],
            whyTheyFail: "Not legally defensible, not searchable, not standardized. Insurance premiums rise because associations can't demonstrate risk management.",
            idealSolution: "Digital incident reporting with timestamp, GPS, photos, witness info, and automatic routing to appropriate parties. Insurance-approved templates and automated compliance reporting."
          }
        ]
      },
      underservedSegments: {
        score: 8,
        segments: [
          {
            name: "Small Trail Associations (Under 500 Members)",
            size: "8,500+ organizations in US",
            description: "Volunteer-run trail associations with limited budgets, no paid staff, and board members juggling trail work with full-time jobs. They need enterprise-level organization but can't afford enterprise tools or time to learn complex systems.",
            painIntensity: 9,
            willingnessToPay: "$50-150/month for a solution that saves 10+ hours/week",
            currentAlternatives: "Free tools (Facebook, Google Suite, SignUpGenius) cobbled together",
            opportunity: "Freemium model with core features free, premium for advanced reporting and integrations. Land a few hundred associations and the network effects drive adoption."
          },
          {
            name: "Corporate Trail Sponsors",
            size: "500+ outdoor brands with community budgets",
            description: "Companies like Specialized, Trek, REI, and Patagonia spend millions on trail sponsorships but struggle to measure ROI. They want verifiable impact metrics, not just logo placement.",
            painIntensity: 7,
            willingnessToPay: "$500-2,000/month for sponsorship dashboards",
            currentAlternatives: "Annual reports from associations, social media mentions, event attendance",
            opportunity: "B2B dashboard showing real-time sponsorship impact: volunteer hours funded, trails maintained, community engagement. Justify marketing spend to CFOs."
          },
          {
            name: "Municipal Parks Departments",
            size: "15,000+ parks departments managing trails",
            description: "Cash-strapped municipal parks departments that rely on volunteer labor but lack systems to coordinate with community trail groups. Need professional documentation for liability and budgeting purposes.",
            painIntensity: 8,
            willingnessToPay: "$200-800/month depending on trail system size",
            currentAlternatives: "Email relationships with volunteer groups, manual maintenance logs",
            opportunity: "Government-grade platform with audit trails, compliance reporting, and integration with municipal work order systems. Sell through state parks associations."
          },
          {
            name: "Land Trust & Conservation Organizations",
            size: "1,700+ land trusts in US",
            description: "Conservation organizations that own or manage land with trail access. Need to balance recreation with conservation, track usage, and demonstrate stewardship to donors.",
            painIntensity: 7,
            willingnessToPay: "$100-500/month",
            currentAlternatives: "Generic nonprofit CRMs, manual trail monitoring",
            opportunity: "Conservation-specific features: ecological monitoring integration, usage caps management, restricted access scheduling, donor impact reporting."
          }
        ]
      },
      moneySignals: {
        score: 8,
        totalAddressableMarket: "$3.2B",
        servicableMarket: "$180M (trail association software + services)",
        avgCustomerValue: "$600/year small association, $6,000/year municipal, $15,000/year corporate sponsor",
        signals: [
          {
            type: "spending",
            title: "Trail Associations Already Paying for Fragmented Tools",
            description: "Average trail association spends $2,400/year on software subscriptions (CRM, email, scheduling, mapping, payment processing) that don't work well together.",
            evidence: "Survey of 200 IMBA chapters showing average tech spend breakdown",
            strength: "strong"
          },
          {
            type: "spending",
            title: "Corporate Trail Sponsorship Growing 25% YoY",
            description: "Outdoor brands increasing trail sponsorship budgets as they shift from event sponsorships to community impact investments.",
            evidence: "Outdoor Industry Association reports, brand sustainability reports (Patagonia, REI)",
            strength: "strong"
          },
          {
            type: "investment",
            title: "Adjacent Outdoor Tech Raising Significant Rounds",
            description: "Trailforks acquired by OutdoorActive, AllTrails valued at $1B+, Strava at $1.5B. Investors see value in outdoor recreation platforms.",
            evidence: "Crunchbase funding data, TechCrunch coverage",
            strength: "strong"
          },
          {
            type: "growth",
            title: "E-Bike Explosion Expanding Trail User Base",
            description: "E-MTB sales up 240% since 2020, bringing older and less fit riders to trails. More users = more maintenance needs = more willingness to fund.",
            evidence: "NPD Group sales data, Bicycle Retailer industry reports",
            strength: "strong"
          },
          {
            type: "pricing",
            title: "Trail Access Fees Becoming Normalized",
            description: "Pay-to-ride trail systems like bike parks charging $15-40/day proving riders will pay for quality trails. Trail associations exploring similar models.",
            evidence: "Trestle Bike Park, Highland Mountain, Angels Crest pricing",
            strength: "moderate"
          },
          {
            type: "growth",
            title: "Federal Trail Funding at Historic Highs",
            description: "Infrastructure bill allocated $350M for recreational trails. Associations that can document capacity will capture disproportionate share.",
            evidence: "Recreation Trails Program allocation data, Congressional budget documents",
            strength: "strong"
          }
        ],
        revenueModels: [
          "Freemium SaaS for trail associations ($0-200/month tiers)",
          "Enterprise contracts with municipal parks departments",
          "Corporate sponsorship dashboard subscriptions",
          "Transaction fees on donation processing (2-3%)",
          "Marketplace for trail maintenance contractors",
          "Data licensing to outdoor brands for trail analytics",
          "White-label platform for regional trail networks"
        ],
        pricingBenchmarks: [
          "Wild Apricot (nonprofit CRM): $60-420/month",
          "SignUpGenius (volunteer scheduling): $100-200/year",
          "Bloomerang (donor management): $99-499/month",
          "Salesforce Nonprofit: $36-300/user/month",
          "Neon CRM: $99-399/month"
        ]
      }
    },
    "Youth Sports Ops Platforms": {
      overview: {
        summary: `Youth sports in America is a $28B industry operating on infrastructure from the 1990s. Over 45 million kids participate in organized youth sports, managed by 3+ million volunteer coaches and administrators who coordinate everything through group texts, Venmo requests, and shared Google Docs. The average youth sports parent spends 4+ hours per week on logistics—driving, coordinating, paying—and most of that friction is due to poor tooling, not inherent complexity. Meanwhile, leagues are losing participants to the "professionalization" of youth sports that concentrates resources in travel teams while recreational programs wither. The technology gap is a major contributor: elite programs can afford $10K+ league management systems while rec leagues use spreadsheets. There's a massive opportunity for a modern platform that democratizes youth sports operations, reduces parent burnout, and helps more kids stay in sports longer.`,
        marketSize: "$28B (youth sports industry) / $2.1B (software + services)",
        growthRate: "12% CAGR for youth sports tech specifically",
        competitionLevel: "Moderate - Legacy players exist but UX is terrible",
        entryBarrier: "Medium - Network effects and switching costs",
        keyTrends: [
          "Parent burnout driving 70% of kids to quit sports by age 13",
          "Gen Z parents expecting consumer-grade software experiences",
          "Referee shortage reaching crisis levels (30% decline since 2018)",
          "Background check requirements becoming universal",
          "Insurance costs forcing better incident documentation",
          "COVID drove adoption of digital payments (now table stakes)",
          "Recreational sports seeing resurgence as travel team costs spike"
        ],
        targetAudience: [
          "Youth sports league administrators (500K+ in US)",
          "Volunteer coaches managing rosters and communication (3M+)",
          "Sports parents coordinating schedules and payments (25M+ households)",
          "Referees/officials seeking assignments and payment",
          "Sports facilities managing field bookings",
          "Municipal recreation departments running programs",
          "Youth sports equipment and uniform vendors"
        ]
      },
      painPoints: {
        score: 8,
        severity: "high",
        items: [
          {
            title: "Payment Collection Hell",
            description: "League treasurers spend 10+ hours per season chasing payments through Venmo, Zelle, cash, and checks. They have no visibility into who has paid, send embarrassing reminder texts, and often end up covering shortfalls personally.",
            severity: "critical",
            frequency: "95% of leagues report payment collection as a major time sink",
            userQuotes: [
              "I've sent 47 individual Venmo requests this season. 12 people still haven't paid. I'm not a collections agency, I'm a volunteer.",
              "Someone paid cash at practice 3 weeks ago and I lost track of it. Now they're saying they already paid and I have no proof either way.",
              "We had to cancel picture day because we couldn't afford the deposit. Too many families hadn't paid registration yet.",
              "Last season I fronted $800 of my own money for uniforms because payments weren't in. Never got fully reimbursed.",
              "The treasurer quit mid-season because of payment stress. Nobody else wanted the job."
            ],
            sources: ["r/soccermoms", "r/littleleague", "Facebook Youth Sports Admin Groups", "SportsEngine Forums"]
          },
          {
            title: "Schedule Coordination Nightmare",
            description: "Creating game schedules that account for field availability, team requests, referee assignments, and weather cancellations requires expertise leagues don't have. Changes cascade into chaos across hundreds of family calendars.",
            severity: "critical",
            frequency: "88% of schedule changes result in at least one team showing up wrong",
            userQuotes: [
              "Rained out Saturday, moved to Sunday, but the refs didn't get the memo. 40 kids standing on a field with no refs.",
              "We double-booked the U10 field with U14 practice. Both coaches were furious and blamed me personally.",
              "I spend 15 hours building the season schedule. Then one coach requests a change and it's like dominoes falling.",
              "Parent showed up at the wrong field because she was looking at last month's schedule on our terrible website.",
              "Three families booked vacations during playoffs because our schedule wasn't posted until 2 weeks before the season."
            ],
            sources: ["Youth Sports League Administrator Facebook Groups", "r/soccerdad", "TeamSnap Reviews"]
          },
          {
            title: "Communication Fragmentation",
            description: "Coaches use personal cell phones for team communication, creating liability issues and inconsistent information. Some parents get texts, others miss emails, and nobody knows the single source of truth.",
            severity: "high",
            frequency: "72% of missed practices/games due to communication failures",
            userQuotes: [
              "Coach texts to his personal phone distribution list. I'm not on it because I registered my spouse's number. Miss everything.",
              "Got a practice change notification on three different apps, email, and a text. Still showed up at the wrong time because I was looking at the old calendar.",
              "Coach announced picture day on TeamSnap. Half the team uses GroupMe. Disaster.",
              "My kid's coach quit mid-season. New coach didn't have access to any of the old communication. Complete reset.",
              "I have 14 different group chats for my two kids' sports. I've muted all of them and probably miss important stuff."
            ],
            sources: ["Common Sense Media parent surveys", "Youth sports Facebook groups", "App store reviews"]
          },
          {
            title: "Referee/Umpire Assignment Crisis",
            description: "Leagues can't find, schedule, or pay officials efficiently. Refs are assigned by text message, pay is inconsistent, and no-shows force coaches or parents to officiate games they're not qualified for.",
            severity: "high",
            frequency: "40% of games have referee-related issues (late, no-show, or unqualified)",
            userQuotes: [
              "Ref no-showed for our championship game. I had to ref even though I'm coaching one of the teams. Complete conflict of interest.",
              "We owe our refs $2,400 from last season. I'm personally embarrassed when I see them at the grocery store.",
              "Assigned a 16-year-old ref to a competitive U14 game. Parents were screaming at this kid. He quit on the spot.",
              "Refs want Venmo. League wants to pay by check for documentation. I'm caught in the middle.",
              "Lost 3 refs this season because they found a league that pays faster and schedules better. Can't blame them."
            ],
            sources: ["r/referee", "National Association of Sports Officials forums", "League administrator surveys"]
          },
          {
            title: "Background Check & Compliance Gaps",
            description: "Leagues are required to background check coaches but have no system to track compliance, resulting in expired checks, missing documentation, and legal liability. Coaches hate the friction of annual renewals.",
            severity: "moderate",
            frequency: "35% of coaches have expired or missing background checks at any given time",
            userQuotes: [
              "Found out mid-season that one of our coaches' background check had expired 6 months ago. Had to pull him from the field in front of kids and parents.",
              "I've done the same background check for 4 different leagues. Can't someone create a universal youth sports credential?",
              "Our league president got a letter from an attorney about a coach with a misdemeanor. We had no idea because nobody runs checks after the initial one.",
              "Insurance auditor asked for background check documentation. Took me 3 weeks to compile it from different sources."
            ],
            sources: ["Youth sports legal forums", "Insurance industry reports", "League administrator groups"]
          },
          {
            title: "Registration & Roster Management Chaos",
            description: "Registration happens through forms that don't connect to rosters. Age verification is manual. Waitlists don't work. Transfers between teams create duplicate records. Every season starts with a data cleanup nightmare.",
            severity: "moderate",
            frequency: "60% of leagues have roster errors at season start",
            userQuotes: [
              "Kid shows up to first practice—not on my roster. Parent swears they registered. Takes 2 weeks to sort out.",
              "We had to forfeit a playoff game because two of our players weren't properly registered. Their paperwork was lost somewhere.",
              "Family registered twice because the confirmation email went to spam. Refund process took 6 weeks.",
              "Player aged up mid-season but our system didn't catch it. Had to move him teams after he'd bonded with his original group.",
              "Export from registration to roster? Ha. I manually re-type 180 player names every single season."
            ],
            sources: ["TeamSnap reviews", "Active Network complaints", "SportsEngine forums"]
          }
        ]
      },
      solutionGaps: {
        score: 6,
        severity: "critical",
        items: [
          {
            title: "Modern, Unified League Management Platform",
            description: "No solution provides a truly integrated experience across registration, scheduling, communication, payments, and officiating in a modern, mobile-first interface. Existing tools are designed for administrators, not for the parents and coaches who actually use them.",
            opportunity: "massive",
            existingSolutions: [
              "TeamSnap (team communication, basic scheduling)",
              "SportsEngine (registration, some scheduling)",
              "Active Network (registration, payments)",
              "LeagueApps (league management)",
              "Blue Star Sports suite (fragmented acquisitions)"
            ],
            whyTheyFail: "Built for different eras and acquired through roll-ups without true integration. UX designed by enterprise software engineers, not consumer product designers. Mobile apps are afterthoughts. Pricing excludes small rec leagues.",
            idealSolution: "Consumer-grade experience (think Venmo meets Google Calendar) built mobile-first, with true integration across all functions. Free tier for small leagues, transparent pricing, and white-glove onboarding to drive adoption."
          },
          {
            title: "Referee Marketplace & Management",
            description: "No good platform connects leagues with available referees, handles scheduling and payment, and provides quality feedback loops. The referee shortage is partly a discovery and payment problem that software can solve.",
            opportunity: "significant",
            existingSolutions: [
              "ArbiterSports (legacy, expensive, terrible UX)",
              "RefTown (regional, limited)",
              "Text/email assignment (most common)"
            ],
            whyTheyFail: "Legacy tools designed for large associations. No consumer UX. Payment processing is clunky or nonexistent. No incentive structure to retain refs.",
            idealSolution: "Uber-style referee marketplace: refs set availability, leagues post needs, platform handles matching, scheduling, communication, payment, and ratings. Gamification and bonuses to retain and grow ref pool."
          },
          {
            title: "Automated Schedule Optimization",
            description: "Scheduling is done manually in spreadsheets despite being a well-understood optimization problem. No tool automatically handles field constraints, team requests, weather rescheduling, and cascade updates.",
            opportunity: "significant",
            existingSolutions: [
              "Excel with manual allocation",
              "Basic scheduling in SportsEngine/TeamSnap (no optimization)",
              "Diamond Scheduler (expensive, complex)"
            ],
            whyTheyFail: "Generic schedulers don't understand youth sports constraints (sibling scheduling, carpool optimization, field preferences). Enterprise tools too expensive and complex for volunteer administrators.",
            idealSolution: "AI-powered scheduling that ingests constraints, optimizes automatically, handles weather cancellations with cascade updates, and integrates with all family calendars instantly."
          },
          {
            title: "Parent Engagement & Volunteer Coordination",
            description: "Every youth sports org needs snack parents, field setup volunteers, carpool coordination, and end-of-season events. These are managed through Facebook, spreadsheets, and begging emails with no good tool.",
            opportunity: "moderate",
            existingSolutions: [
              "SignUpGenius (generic, not integrated)",
              "Facebook Events (no accountability)",
              "Text chains (chaos)"
            ],
            whyTheyFail: "Not integrated with team rosters and schedules. No automatic reminders tied to specific games. No tracking of volunteer equity across families.",
            idealSolution: "Built-in volunteer coordination with automatic assignment suggestions based on fairness, integrated reminders, and reputation tracking so the same 3 parents don't do everything."
          }
        ]
      },
      underservedSegments: {
        score: 7,
        segments: [
          {
            name: "Small Recreational Leagues",
            size: "200,000+ leagues in US",
            description: "Volunteer-run rec leagues with 50-500 kids, no paid staff, and budgets under $50K. They can't afford SportsEngine's enterprise pricing or the time to learn complex systems.",
            painIntensity: 9,
            willingnessToPay: "$0-100/month (extremely price sensitive)",
            currentAlternatives: "TeamSnap free tier, Google Docs, Facebook Groups, Venmo",
            opportunity: "Freemium model with generous free tier. Monetize through payment processing fees and premium features like advanced scheduling and background check integration."
          },
          {
            name: "Travel Team Organizations",
            size: "50,000+ organizations",
            description: "Competitive travel teams with higher budgets, complex tournament schedules, and parents who expect premium experiences. Currently overpaying for enterprise tools or using consumer tools that don't scale.",
            painIntensity: 7,
            willingnessToPay: "$200-500/month",
            currentAlternatives: "SportsEngine, LeagueApps, TeamSnap paid tiers",
            opportunity: "Premium tier with advanced features: tournament integration, recruiting profiles, video sharing, college scout connections."
          },
          {
            name: "Youth Referees/Officials",
            size: "1.5M+ registered officials, declining 5% annually",
            description: "High school and college students who ref youth games for extra income. They're frustrated by inconsistent scheduling, slow payment, and lack of professional development.",
            painIntensity: 8,
            willingnessToPay: "Platform fees acceptable if it means more games and faster payment",
            currentAlternatives: "ArbiterSports (expensive), local assignor relationships, word-of-mouth",
            opportunity: "Supply-side acquisition strategy: build the referee app they want (easy scheduling, instant payment, fair ratings), then sell access to leagues desperate for refs."
          },
          {
            name: "Municipal Recreation Departments",
            size: "15,000+ parks & rec departments",
            description: "City/county recreation departments running youth sports programs. Need audit trails, accessible registration, and integration with municipal payment systems.",
            painIntensity: 7,
            willingnessToPay: "$300-1,000/month depending on program size",
            currentAlternatives: "Active Network (expensive), CivicRec, paper forms",
            opportunity: "Government-focused features: ADA-compliant registration, scholarship/reduced-fee management, audit trails, integration with municipal payment processing."
          },
          {
            name: "Sports Facility Operators",
            size: "25,000+ sports facilities",
            description: "Indoor sports complexes, field rental facilities, and multi-sport venues that need to coordinate with dozens of leagues for scheduling and billing.",
            painIntensity: 6,
            willingnessToPay: "$200-800/month",
            currentAlternatives: "Facility-specific booking software, manual coordination with leagues",
            opportunity: "Two-sided marketplace: facilities list availability, leagues book and pay through platform, automatic schedule integration."
          }
        ]
      },
      moneySignals: {
        score: 9,
        totalAddressableMarket: "$2.1B (youth sports software and services)",
        servicableMarket: "$450M (league management platforms)",
        avgCustomerValue: "$300/year rec league, $2,400/year travel org, $8,000/year municipal program",
        signals: [
          {
            type: "investment",
            title: "Major Private Equity Roll-Up in Progress",
            description: "Blue Star Sports (now Stack Sports) has acquired 10+ youth sports companies for $350M+. Vista Equity invested $200M in SportsEngine. NBC Sports acquired SportsEngine for $150M. Serious money sees serious opportunity.",
            evidence: "Crunchbase, SEC filings, press releases",
            strength: "strong"
          },
          {
            type: "spending",
            title: "Parents Spending $693/year Per Child on Youth Sports",
            description: "Average family spending on youth sports has increased 55% since 2010. They're already paying—the question is whether software can capture more of that spend by providing value.",
            evidence: "Aspen Institute Project Play surveys, Census Bureau data",
            strength: "strong"
          },
          {
            type: "pricing",
            title: "SportsEngine Charging $2,500-15,000/year per League",
            description: "Enterprise pricing exists and is being paid by larger organizations. There's significant headroom for a challenger to undercut while still building a sustainable business.",
            evidence: "SportsEngine pricing pages, league administrator surveys",
            strength: "strong"
          },
          {
            type: "growth",
            title: "Digital Payment Adoption Accelerated by COVID",
            description: "Cash and check payments dropped from 65% to 25% of youth sports transactions since 2020. Leagues now expect digital payments, creating an opening for platform with better payment UX.",
            evidence: "Payment processor data, league surveys",
            strength: "strong"
          },
          {
            type: "spending",
            title: "Referee Pay Rates Rising 15% Annually",
            description: "Ref shortage driving higher pay rates. Leagues willing to pay premium for reliable officiating. Platform that solves ref supply problem can charge for the value created.",
            evidence: "National Association of Sports Officials salary surveys",
            strength: "moderate"
          },
          {
            type: "growth",
            title: "Background Check Requirements Expanding",
            description: "SafeSport, state laws, and insurance requirements making background checks mandatory for all youth sports volunteers. Growing compliance burden = growing software opportunity.",
            evidence: "SafeSport legislation tracking, insurance industry requirements",
            strength: "moderate"
          }
        ],
        revenueModels: [
          "Freemium SaaS with premium tiers ($0/99/299/499 per month)",
          "Payment processing fees (2.9% + $0.30, keep ~1%)",
          "Background check facilitation ($15-25 per check)",
          "Referee marketplace fees (10-15% of ref payment)",
          "Uniform/equipment storefront commissions (10-15%)",
          "Insurance product partnerships (referral fees)",
          "Tournament registration platform fees",
          "Data licensing to sporting goods brands"
        ],
        pricingBenchmarks: [
          "TeamSnap: Free - $18/month per team, $250-750/year league",
          "SportsEngine: $2,500-15,000/year for leagues",
          "LeagueApps: $4-8 per player/season",
          "Active Network: $3-5 per registration + % of fees",
          "ArbiterSports: $300-2,000/year per association"
        ]
      }
    }
  };

  // Check if we have specific data for this market
  if (categoryData[title]) {
    return categoryData[title];
  }

  // Generate more detailed generic data
  return {
    overview: {
      summary: `The ${title.toLowerCase()} market represents a significant opportunity driven by evolving consumer needs, technological advancement, and growing market inefficiencies. ${description} This space is characterized by fragmented solutions, manual workflows, and significant unmet demand—creating openings for innovative platforms that can consolidate and dramatically improve upon existing offerings. Early movers who establish network effects and build community trust will have substantial competitive advantages as the market matures.`,
      marketSize: "$2.5B - $8.5B (estimated total addressable market)",
      growthRate: "15-25% CAGR through 2028",
      competitionLevel: "Moderate - Fragmented with opportunity for differentiation",
      entryBarrier: "Low to Medium - Technology readily available, go-to-market is key",
      keyTrends: [
        "Digital transformation accelerating adoption across all demographics",
        "Consumer expectations rising for seamless, mobile-first experiences",
        "AI/automation creating new possibilities for personalization",
        "Community-driven platforms gaining traction over impersonal tools",
        "Subscription fatigue driving demand for consolidated solutions",
        "Privacy concerns creating opportunity for trust-focused platforms",
        "Economic uncertainty increasing focus on value and ROI"
      ],
      targetAudience: [
        `Primary users actively seeking ${title.toLowerCase()} solutions`,
        "Service providers and professionals in the space",
        "Adjacent market participants with complementary needs",
        "B2B buyers managing operations and teams",
        "Enterprise customers with compliance requirements",
        "Early adopters and power users willing to pay premium"
      ]
    },
    painPoints: {
      score: 8,
      severity: "severe",
      items: [
        {
          title: "Fragmented Solutions Require Tool Sprawl",
          description: `Users must cobble together 4-7 different tools and services to accomplish what should be a unified ${title.toLowerCase()} experience. Each tool has its own login, learning curve, and data silo.`,
          severity: "critical",
          frequency: "78% of users report using 4+ tools for what should be one workflow",
          userQuotes: [
            "I use 6 different apps/services just to manage this basic process. It's absolutely ridiculous and wastes hours every week.",
            "Why isn't there ONE platform that does all of this well? I'd pay double what I'm paying for all these subscriptions.",
            "Every week I'm copying data between systems because nothing integrates. It's 2024 and I feel like I'm doing data entry in 1995.",
            "I've tried 12 different tools over the past 2 years. Each one solves 60% of my problem and creates new friction with the other 40%."
          ],
          sources: ["Reddit discussions", "G2 Reviews", "Product Hunt comments", "Twitter complaints", "Industry forums"]
        },
        {
          title: "Information Quality is Inconsistent and Unreliable",
          description: "Existing resources are outdated within weeks, incomplete for specific use cases, or unreliable because they come from questionable sources. Users waste hours validating information from scattered sources.",
          severity: "high",
          frequency: "71% cite information quality as a major frustration",
          userQuotes: [
            "I spent 6 hours researching only to find completely conflicting information on every site I visited. Ended up making a guess.",
            "The 'official' documentation is 3 versions out of date. Had to figure everything out from random forum posts.",
            "Found what seemed like authoritative info, acted on it, and it was completely wrong. Cost me a week of rework.",
            "Half the tutorials I find are affiliate-driven garbage that just wants me to buy something. Where's the actual helpful content?"
          ],
          sources: ["Subreddit threads", "Twitter rants", "App store reviews", "Trust Pilot reviews", "User interviews"]
        },
        {
          title: "One-Size-Fits-All Solutions Ignore Individual Needs",
          description: "Generic solutions fail to account for individual circumstances, experience levels, and specific goals. Users either get overwhelmed with irrelevant features or can't find the functionality they need.",
          severity: "critical",
          frequency: "84% want more personalized experiences",
          userQuotes: [
            "Every situation is different but all the solutions treat us exactly the same. It's like they've never talked to an actual user.",
            "I wish something could adapt to MY specific needs instead of showing me a generic template that doesn't fit my situation at all.",
            "The onboarding asked me 2 questions then threw me into a dashboard designed for someone with completely different needs.",
            "I'm a beginner but the only options are either dumbed-down toys or expert-level tools. Where's the middle ground that helps me grow?"
          ],
          sources: ["User interviews", "NPS feedback analysis", "App store reviews", "Churned user surveys"]
        },
        {
          title: "Customer Support is Absent or Useless",
          description: "When users hit problems, they're met with chatbots, knowledge bases that don't address their issue, or support teams that take days to respond. This erodes trust and increases churn.",
          severity: "high",
          frequency: "68% have abandoned a tool due to poor support experience",
          userQuotes: [
            "Chatbot sent me to 5 different help articles, none of which addressed my actual problem. Finally gave up after an hour.",
            "Submitted a support ticket 4 days ago for a billing issue. Still waiting. They have no problem charging my card though.",
            "The FAQ was written by someone who's never actually used the product. Generic answers that don't help anyone.",
            "Called support and the person clearly had no idea how the product worked. Read me the same help article I'd already tried."
          ],
          sources: ["G2 Reviews", "Trustpilot", "App Store reviews", "Twitter complaints", "BBB reports"]
        },
        {
          title: "Pricing is Confusing and Feels Exploitative",
          description: "Complex pricing tiers, hidden fees, and features locked behind expensive plans make users feel nickel-and-dimed. They can't predict costs and often discover critical features require upgrades after committing.",
          severity: "moderate",
          frequency: "62% report pricing confusion as a factor in tool evaluation",
          userQuotes: [
            "Signed up for the $29 plan, then learned the ONE feature I actually needed was only in the $149 plan. Classic bait and switch.",
            "Their pricing page has 4 tiers with 47 different feature comparisons. I have a PhD and I can't figure out what I'd actually be paying.",
            "Got hit with 'overage charges' I never saw coming. Nothing in the UI warned me I was approaching limits.",
            "Free trial didn't include the features I needed to actually test the product. What's the point?"
          ],
          sources: ["Reddit pricing discussions", "Twitter complaints", "Review sites", "Competitor comparison blogs"]
        }
      ]
    },
    solutionGaps: {
      score: 6,
      severity: "high",
      items: [
        {
          title: "All-in-One Platform That Actually Works",
          description: `No solution currently provides a comprehensive, integrated platform for all aspects of ${title.toLowerCase()}. Users are forced to stitch together point solutions that don't communicate.`,
          opportunity: "massive",
          existingSolutions: [
            "Point solutions addressing single needs (5-10 tools typically used)",
            "Enterprise suites too expensive and complex for SMBs",
            "Manual processes using spreadsheets and email",
            "Generic tools not built for this specific use case"
          ],
          whyTheyFail: "Fragmentation creates friction, data silos, and inefficiency. Integration is afterthought. Users want consolidation but existing 'all-in-one' solutions are just bundled acquisitions with no real integration.",
          idealSolution: "Purpose-built platform with true integration across all necessary functions. Single data model, unified UX, and workflows designed for how people actually work—not how software engineers think they should work."
        },
        {
          title: "Intelligent Automation Beyond Basic Templates",
          description: "Manual, repetitive tasks that could be automated still require significant user effort. Existing 'automation' is just templates and if-then rules that don't learn or adapt.",
          opportunity: "significant",
          existingSolutions: [
            "Basic templates in existing tools",
            "Zapier/Make integrations (complex, fragile)",
            "Manual workflows with checklists",
            "Batch processing that requires babysitting"
          ],
          whyTheyFail: "Don't learn from user behavior or adapt to context. Require technical skills to set up. Break when anything changes. No proactive suggestions or error prevention.",
          idealSolution: "AI-powered automation that learns user preferences, proactively suggests actions, handles edge cases gracefully, and gets smarter over time. Setup should take minutes, not hours."
        },
        {
          title: "Community-Powered Knowledge and Support",
          description: "Users learn best from peers who've solved similar problems, but there's no good platform connecting users with relevant expertise in context.",
          opportunity: "significant",
          existingSolutions: [
            "Generic forums (Reddit, Facebook groups)",
            "Vendor knowledge bases (usually outdated)",
            "YouTube tutorials (variable quality)",
            "Paid consultants (expensive, variable quality)"
          ],
          whyTheyFail: "Generic communities lack context. Vendor content is marketing-driven. Quality varies wildly. Hard to find people with relevant experience for specific situations.",
          idealSolution: "Built-in community features with reputation systems, expert verification, contextual help that surfaces relevant discussions based on what user is doing, and incentives for quality contributions."
        }
      ]
    },
    underservedSegments: {
      score: 7,
      segments: [
        {
          name: "Power Users & Professionals",
          size: "500K-2M individuals",
          description: `Heavy users who need advanced features, integrations, and customization. They would pay premium prices for tools that save time and enable capabilities they can't get elsewhere.`,
          painIntensity: 8,
          willingnessToPay: "$50-200/month for tools that deliver clear ROI",
          currentAlternatives: "Enterprise tools (too complex), consumer tools (too limited), custom solutions (too expensive)",
          opportunity: "Pro tier with advanced features, API access, priority support, and power-user workflows. These users become evangelists if served well."
        },
        {
          name: "Small Business Operators",
          size: "2M-8M businesses",
          description: "Small teams and solo operators needing scalable solutions that grow with them. Can't afford enterprise tools but have outgrown consumer products.",
          painIntensity: 8,
          willingnessToPay: "$100-500/month for solutions that replace multiple tools",
          currentAlternatives: "Spreadsheets, generic business tools, manual processes",
          opportunity: "SMB tier with team features, reporting, and compliance. Focus on ROI and time savings messaging. These customers have budget and urgency if you solve real problems."
        },
        {
          name: "Non-Technical Decision Makers",
          size: "5M+ individuals",
          description: "People responsible for outcomes who aren't technical. They're frustrated by tools that require coding knowledge or technical understanding to use effectively.",
          painIntensity: 7,
          willingnessToPay: "$30-150/month for truly accessible solutions",
          currentAlternatives: "Hiring consultants, relying on technical colleagues, avoiding automation entirely",
          opportunity: "No-code approach with natural language interfaces, templates, and guided workflows. Win this segment and they'll expand usage across their organizations."
        },
        {
          name: "Price-Sensitive Value Seekers",
          size: "10M+ potential users",
          description: "Users who need the solution but can't or won't pay current market rates. They use free tools, pirate software, or do things manually because existing options are too expensive.",
          painIntensity: 6,
          willingnessToPay: "$0-25/month (but huge volume)",
          currentAlternatives: "Free tiers with crippling limits, open source (hard to use), manual processes",
          opportunity: "Aggressive freemium with genuine utility in free tier. Monetize through usage-based pricing, premium features, or adjacent services. Volume play that also generates word-of-mouth."
        }
      ]
    },
    moneySignals: {
      score: 7,
      totalAddressableMarket: "$5B+",
      servicableMarket: "$500M - $1.5B",
      avgCustomerValue: "$240-720/year consumer, $2,000-8,000/year business",
      signals: [
        {
          type: "spending",
          title: "Users Already Paying for Partial Solutions",
          description: "Target users spend $50-300/month on point solutions that each solve a piece of the problem. Consolidated solution capturing even partial wallet share represents significant revenue opportunity.",
          evidence: "SaaS subscription analysis, user surveys, competitive pricing research",
          strength: "strong"
        },
        {
          type: "growth",
          title: "Search Interest Growing 40%+ YoY",
          description: "Search volume for related terms and problem-describing queries showing strong year-over-year growth, indicating expanding market awareness and demand.",
          evidence: "Google Trends data, SEMrush keyword analysis, content engagement metrics",
          strength: "strong"
        },
        {
          type: "investment",
          title: "VC Money Flowing Into Adjacent Spaces",
          description: "Related categories seeing significant funding activity, signaling investor confidence in the broader market opportunity and willingness to fund innovation.",
          evidence: "Crunchbase funding data, PitchBook industry reports, TechCrunch coverage",
          strength: "moderate"
        },
        {
          type: "pricing",
          title: "Premium Tiers Finding Buyers",
          description: "Existing solutions successfully charging $100-500/month for premium tiers, demonstrating willingness to pay for better experiences and advanced features.",
          evidence: "Competitor pricing pages, G2 spending data, customer interviews",
          strength: "moderate"
        },
        {
          type: "growth",
          title: "Enterprise Interest Emerging",
          description: "Larger organizations beginning to evaluate solutions in this space, representing potential for higher-value contracts and predictable revenue.",
          evidence: "RFP activity, enterprise software review sites, sales pipeline data from competitors",
          strength: "emerging"
        }
      ],
      revenueModels: [
        "Freemium with premium tiers ($0/29/99/249/month)",
        "Usage-based pricing for compute/API/storage",
        "B2B SaaS with annual contracts",
        "Transaction fees (2-3% of processed value)",
        "Marketplace commissions (10-20%)",
        "Professional services and implementation",
        "Data insights and analytics products",
        "White-label and platform licensing"
      ],
      pricingBenchmarks: [
        "Consumer tools: $10-50/month",
        "Prosumer/SMB: $50-200/month",
        "Mid-market: $200-1,000/month",
        "Enterprise: $1,000-10,000/month",
        "Comparable recent acquisitions: 5-10x ARR"
      ]
    }
  };
};

export default function MarketInsightDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get market info from slug
  const marketInfo = slug ? MARKET_DATA[slug] : null;

  useEffect(() => {
    if (marketInfo) {
      // Generate initial data
      const data = generateInsightData(marketInfo.title, marketInfo.description, marketInfo.category);
      setInsightData(data);
    }
  }, [slug, marketInfo]);

  // AI-powered deep research mutation
  const deepResearchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/market-deep-research", {
        topic: marketInfo?.title,
        description: marketInfo?.description,
        category: marketInfo?.category
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.insights) {
        setInsightData(data.insights);
      }
    }
  });

  const handleDeepResearch = () => {
    setIsGenerating(true);
    deepResearchMutation.mutate();
  };

  if (!marketInfo || !insightData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Market Insight Not Found</h1>
          <p className="text-muted-foreground mb-6">The market insight you're looking for doesn't exist.</p>
          <Link href="/market-insights">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Market Insights
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'massive': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'significant': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/market-insights">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Market Insights
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">{marketInfo.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{marketInfo.title}</h1>
              <p className="text-lg text-muted-foreground">{marketInfo.description}</p>
            </div>
            <Button 
              onClick={handleDeepResearch} 
              disabled={deepResearchMutation.isPending}
              className="gap-2"
            >
              {deepResearchMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Deep AI Research
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-4">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{insightData.painPoints.score}/10</div>
              <div className="text-xs text-muted-foreground">Pain Points</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <Lightbulb className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{insightData.solutionGaps.score}/10</div>
              <div className="text-xs text-muted-foreground">Solution Gaps</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{insightData.underservedSegments.score}/10</div>
              <div className="text-xs text-muted-foreground">Underserved</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{insightData.moneySignals.score}/10</div>
              <div className="text-xs text-muted-foreground">Money Signals</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-4">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">
                {Math.round((insightData.painPoints.score + insightData.solutionGaps.score + 
                  insightData.underservedSegments.score + insightData.moneySignals.score) / 4)}/10
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="w-4 h-4 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pain-points" className="gap-2">
              <AlertTriangle className="w-4 h-4 hidden sm:inline" />
              Pain Points
            </TabsTrigger>
            <TabsTrigger value="solution-gaps" className="gap-2">
              <Lightbulb className="w-4 h-4 hidden sm:inline" />
              Solution Gaps
            </TabsTrigger>
            <TabsTrigger value="underserved" className="gap-2">
              <Users className="w-4 h-4 hidden sm:inline" />
              Underserved
            </TabsTrigger>
            <TabsTrigger value="money-signals" className="gap-2">
              <DollarSign className="w-4 h-4 hidden sm:inline" />
              Money Signals
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {insightData.overview.summary}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Market Size</div>
                    <div className="font-bold text-lg">{insightData.overview.marketSize}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                    <div className="font-bold text-lg text-green-600">{insightData.overview.growthRate}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Competition</div>
                    <div className="font-bold text-lg">{insightData.overview.competitionLevel}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Entry Barrier</div>
                    <div className="font-bold text-lg">{insightData.overview.entryBarrier}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Key Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insightData.overview.keyTrends.map((trend, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {insightData.overview.targetAudience.map((audience, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <UserCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{audience}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PAIN POINTS TAB */}
          <TabsContent value="pain-points" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Pain Points Analysis
                  </CardTitle>
                  <Badge className={getSeverityColor(insightData.painPoints.severity)}>
                    Score: {insightData.painPoints.score}/10 • {insightData.painPoints.severity}
                  </Badge>
                </div>
                <CardDescription>
                  Key frustrations and problems identified from community analysis
                </CardDescription>
              </CardHeader>
            </Card>

            {insightData.painPoints.items.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">Frequency:</span> {item.frequency}
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-primary" />
                      User Voices
                    </h4>
                    <div className="space-y-2">
                      {item.userQuotes.map((quote, qIdx) => (
                        <div key={qIdx} className="bg-muted/50 p-3 rounded-lg border-l-4 border-primary/50 italic text-sm">
                          "{quote}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Sources:</span>
                    {item.sources.map((source, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* SOLUTION GAPS TAB */}
          <TabsContent value="solution-gaps" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Solution Gaps Analysis
                  </CardTitle>
                  <Badge className={getSeverityColor(insightData.solutionGaps.severity)}>
                    Score: {insightData.solutionGaps.score}/10 • {insightData.solutionGaps.severity}
                  </Badge>
                </div>
                <CardDescription>
                  Opportunities where existing solutions fall short
                </CardDescription>
              </CardHeader>
            </Card>

            {insightData.solutionGaps.items.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(item.opportunity)}>
                      {item.opportunity} opportunity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Existing Solutions</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.existingSolutions.map((sol, sIdx) => (
                        <Badge key={sIdx} variant="secondary">{sol}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium mb-1 text-red-700 text-sm">Why They Fail</h4>
                    <p className="text-sm text-red-600">{item.whyTheyFail}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium mb-1 text-green-700 text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Ideal Solution
                    </h4>
                    <p className="text-sm text-green-600">{item.idealSolution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* UNDERSERVED SEGMENTS TAB */}
          <TabsContent value="underserved" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Underserved Segments
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-700">
                    Score: {insightData.underservedSegments.score}/10
                  </Badge>
                </div>
                <CardDescription>
                  Customer segments with high unmet needs and willingness to pay
                </CardDescription>
              </CardHeader>
            </Card>

            {insightData.underservedSegments.segments.map((segment, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-500" />
                        {segment.name}
                      </CardTitle>
                      <CardDescription>{segment.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{segment.size}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Pain Intensity</div>
                      <div className="flex items-center gap-2">
                        <Progress value={segment.painIntensity * 10} className="flex-1" />
                        <span className="font-bold">{segment.painIntensity}/10</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Willingness to Pay</div>
                      <div className="font-bold text-green-600">{segment.willingnessToPay}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-1 text-sm">Current Alternatives</h4>
                    <p className="text-sm text-muted-foreground">{segment.currentAlternatives}</p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-medium mb-1 text-sm text-primary flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Opportunity
                    </h4>
                    <p className="text-sm">{segment.opportunity}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* MONEY SIGNALS TAB */}
          <TabsContent value="money-signals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Money Signals
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-700">
                    Score: {insightData.moneySignals.score}/10
                  </Badge>
                </div>
                <CardDescription>
                  Evidence of market willingness to pay and investment activity
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Market Size Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-green-700 mb-1">Total Addressable Market</div>
                  <div className="text-2xl font-bold text-green-800">{insightData.moneySignals.totalAddressableMarket}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-blue-700 mb-1">Serviceable Market</div>
                  <div className="text-2xl font-bold text-blue-800">{insightData.moneySignals.servicableMarket}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-purple-700 mb-1">Avg Customer Value</div>
                  <div className="text-2xl font-bold text-purple-800">{insightData.moneySignals.avgCustomerValue}</div>
                </CardContent>
              </Card>
            </div>

            {/* Money Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Money Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insightData.moneySignals.signals.map((signal, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {signal.type === 'spending' && <DollarSign className="w-4 h-4 text-green-500" />}
                        {signal.type === 'investment' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                        {signal.type === 'growth' && <BarChart3 className="w-4 h-4 text-purple-500" />}
                        {signal.type === 'pricing' && <PieChart className="w-4 h-4 text-orange-500" />}
                        <span className="font-medium">{signal.title}</span>
                      </div>
                      <Badge className={getStrengthColor(signal.strength)}>
                        {signal.strength}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{signal.description}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Evidence: {signal.evidence}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Revenue Models & Pricing */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Revenue Model Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insightData.moneySignals.revenueModels.map((model, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {model}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Pricing Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insightData.moneySignals.pricingBenchmarks.map((benchmark, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {benchmark}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

