import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

// Color configurations for module cards with light pastel backgrounds
const colorClasses = {
  rose: {
    border: 'before:bg-gradient-to-r before:from-[#E11D48] before:to-[rgba(225,29,72,0.2)]',
    iconBg: 'bg-[rgba(225,29,72,0.08)]',
    iconColor: 'text-[#E11D48]',
    cardBg: 'rgba(255,241,242,0.85)', // Light pink pastel
  },
  purple: {
    border: 'before:bg-gradient-to-r before:from-[#6D5AE6] before:to-[rgba(109,90,230,0.2)]',
    iconBg: 'bg-[rgba(109,90,230,0.1)]',
    iconColor: 'text-[#6D5AE6]',
    cardBg: 'rgba(245,243,255,0.85)', // Light lavender pastel
  },
  gold: {
    border: 'before:bg-gradient-to-r before:from-[#B8860B] before:to-[rgba(184,134,11,0.2)]',
    iconBg: 'bg-[rgba(184,134,11,0.1)]',
    iconColor: 'text-[#B8860B]',
    cardBg: 'rgba(255,251,235,0.85)', // Light cream pastel
  },
  green: {
    border: 'before:bg-gradient-to-r before:from-[#059669] before:to-[rgba(5,150,105,0.2)]',
    iconBg: 'bg-[rgba(5,150,105,0.08)]',
    iconColor: 'text-[#059669]',
    cardBg: 'rgba(236,253,245,0.85)', // Light mint pastel
  },
  amber: {
    border: 'before:bg-gradient-to-r before:from-[#D97706] before:to-[rgba(217,119,6,0.2)]',
    iconBg: 'bg-[rgba(217,119,6,0.08)]',
    iconColor: 'text-[#D97706]',
    cardBg: 'rgba(255,251,235,0.85)', // Light amber pastel
  },
  blue: {
    border: 'before:bg-gradient-to-r before:from-[#3B82F6] before:to-[rgba(59,130,246,0.2)]',
    iconBg: 'bg-[rgba(59,130,246,0.08)]',
    iconColor: 'text-[#3B82F6]',
    cardBg: 'rgba(239,246,255,0.85)', // Light sky blue pastel
  },
  teal: {
    border: 'before:bg-gradient-to-r before:from-[#0D9488] before:to-[rgba(13,148,136,0.2)]',
    iconBg: 'bg-[rgba(13,148,136,0.08)]',
    iconColor: 'text-[#0D9488]',
    cardBg: 'rgba(240,253,250,0.85)', // Light aqua pastel
  },
  pink: {
    border: 'before:bg-gradient-to-r before:from-[#DB2777] before:to-[rgba(219,39,119,0.2)]',
    iconBg: 'bg-[rgba(219,39,119,0.08)]',
    iconColor: 'text-[#DB2777]',
    cardBg: 'rgba(253,242,248,0.85)', // Light pink pastel
  },
  cyan: {
    border: 'before:bg-gradient-to-r before:from-[#0891B2] before:to-[rgba(8,145,178,0.2)]',
    iconBg: 'bg-[rgba(8,145,178,0.08)]',
    iconColor: 'text-[#0891B2]',
    cardBg: 'rgba(236,254,255,0.85)', // Light cyan pastel
  },
  indigo: {
    border: 'before:bg-gradient-to-r before:from-[#4F46E5] before:to-[rgba(79,70,229,0.2)]',
    iconBg: 'bg-[rgba(79,70,229,0.08)]',
    iconColor: 'text-[#4F46E5]',
    cardBg: 'rgba(238,242,255,0.85)', // Light periwinkle pastel
  },
};

// Module Card Component
interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  metric: string;
  metricLabel?: string;
  color: keyof typeof colorClasses;
  status: 'Live' | 'Building';
}

function ModuleCard({ icon, title, description, metric, metricLabel, color, status }: ModuleCardProps) {
  const colors = colorClasses[color];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] p-[22px]",
        "backdrop-blur-lg",
        "border border-[rgba(0,0,0,0.06)]",
        "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:opacity-80",
        colors.border
      )}
      style={{
        background: colors.cardBg,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center text-base", colors.iconBg, colors.iconColor)}>
          {icon}
        </div>
        <span
          className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-[5px]"
          style={{
            background: status === 'Live' ? 'rgba(5,150,105,0.06)' : 'rgba(217,119,6,0.06)',
            color: status === 'Live' ? '#059669' : '#D97706',
          }}
        >
          {status}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-[#18181B] mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-[#71717A] leading-relaxed">{description}</p>
      <div className="mt-3.5 pt-3 border-t border-[rgba(0,0,0,0.06)] flex justify-between items-center">
        <span className="font-mono text-xs font-medium text-[#A1A1AA]">
          <strong className="text-[#18181B]">{metric}</strong>
          {metricLabel && ` ${metricLabel}`}
        </span>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ number, title, count, color, bgColor }: { number: string; title: string; count: string; color: string; bgColor: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5 mt-9">
      <div className="font-mono text-[11px] font-semibold w-6 h-6 flex items-center justify-center rounded-md" style={{ background: bgColor, color }}>
        {number}
      </div>
      <div className="text-[15px] font-bold text-[#18181B] tracking-tight">{title}</div>
      <div className="ml-auto text-[11px] font-semibold text-[#A1A1AA] bg-[rgba(0,0,0,0.03)] px-2 py-0.5 rounded">{count}</div>
    </div>
  );
}

// Sub Label Component
function SubLabel({ label, count, color }: { label: string; count: string; color: string }) {
  return (
    <div className="text-[11px] font-bold tracking-wide uppercase py-1.5 pb-2 flex items-center gap-2" style={{ color }}>
      {label} <span className="text-[#A1A1AA] font-medium text-[10px] normal-case">{count}</span>
      <div className="flex-1 h-px bg-[rgba(0,0,0,0.06)]" />
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect authenticated users to database
  // useEffect(() => {
  //   if (!authLoading && isAuthenticated) {
  //     setLocation("/database");
  //   }
  // }, [isAuthenticated, authLoading, setLocation]);

  const { data: ideasData } = useQuery<{ ideas: any[]; total: number }>({
    queryKey: ["/api/ideas", { limit: 1 }],
  });

  const totalVentures = 819; // Fixed display value for landing page

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      {/* Atmospheric gradients */}
      <div className="fixed pointer-events-none z-0" style={{ top: '-30%', right: '-20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(109,90,230,0.04) 0%, transparent 60%)' }} />
      <div className="fixed pointer-events-none z-0" style={{ bottom: '-20%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(5,150,105,0.03) 0%, transparent 60%)' }} />

      {/* Topbar */}
      <div className="h-14 flex items-center justify-between px-10 sticky top-0 z-50" style={{ background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #6D5AE6, #8B5CF6)' }}>IVE</div>
          <div className="text-[15px] font-bold text-[#18181B] tracking-tight">Venture Engine <span className="text-[#A1A1AA] font-normal text-[13px] ml-1">by Repeatable.ai</span></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#059669] bg-[rgba(5,150,105,0.06)] px-2.5 py-1 rounded-md">
            <span className="w-[5px] h-[5px] bg-[#059669] rounded-full animate-pulse" />
            Live Platform
          </div>
          <button onClick={() => setLocation("/database")} className="flex items-center gap-1.5 bg-[#18181B] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-85 transition-opacity">
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1080px] mx-auto px-8 py-8 pb-16 relative z-[1]">
        {/* Hero */}
        <div className="mb-9">
          <div className="text-xs font-semibold tracking-wide uppercase text-[#6D5AE6] mb-2.5">Intelligent Venture Engine</div>
          <h1 className="text-[54px] font-extrabold text-[#18181B] tracking-tight leading-[1.1]">
            AI-native intelligence<br />for <em className="not-italic bg-gradient-to-r from-[#6D5AE6] to-[#8B5CF6] bg-clip-text text-transparent">venture capital</em>
          </h1>
          <p className="text-base text-[#71717A] mt-3 max-w-[640px] leading-relaxed">
            Multi-framework deal evaluation, portfolio defense, and institutional-grade analysis — powered by the methodology that produced {totalVentures} validated ventures.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-px bg-[rgba(0,0,0,0.06)] rounded-xl overflow-hidden mb-8">
          <div className="flex-1 bg-[rgba(255,255,255,0.88)] py-[18px] px-5 text-center">
            <div className="font-mono text-2xl font-semibold text-[#18181B]">{totalVentures}</div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 font-medium">Ventures analyzed and growing</div>
          </div>
          <div className="flex-1 bg-[rgba(255,255,255,0.88)] py-[18px] px-5 text-center">
            <div className="font-mono text-2xl font-semibold text-[#18181B]">30%-70%</div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 font-medium">Viability Revaluation</div>
            <div className="text-[11px] text-[#A1A1AA] font-medium">Competitive AI Adoption</div>
            <div className="text-[11px] text-[#A1A1AA] font-medium">Portfolio Risk Analysis</div>
          </div>
          <div className="flex-1 bg-[rgba(255,255,255,0.88)] py-[18px] px-5 text-center">
            <div className="font-mono text-2xl font-semibold text-[#18181B]">10x-50x</div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 font-medium">Speed to Valuation</div>
          </div>
          <div className="flex-1 bg-[rgba(255,255,255,0.88)] py-[18px] px-5 text-center">
            <div className="font-mono text-2xl font-semibold text-[#18181B]">$750k-2.5M</div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 font-medium">Annual tool spend displaced</div>
          </div>
        </div>

        {/* Primary Module Grid (from IVE Visual Reference v2) */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <ModuleCard icon="🛡" title="AI Disruption Scanner" description="Score any portfolio company against 5 AI disruption vectors. Helfert moat framework." metric="73" metricLabel="avg. vulnerability" color="rose" status="Live" />
          <ModuleCard icon="⊕" title="Expert Premortem Destruction" description="Premortem destruction test. 5 expert perspectives at escalating severity. Kill shots and survival paths." metric="5" metricLabel="expert panels" color="purple" status="Live" />
          <ModuleCard icon="📄" title="IC Memo Generator" description="Bessemer-quality investment memoranda. 10 sections. Bull/base/bear scenarios." metric="~3,000" metricLabel="words / memo" color="gold" status="Live" />
          <ModuleCard icon="◈" title="Bell-Mason Diagnostic" description="5-phase venture assessment at AI scale. Framework Fusion: Bell-Mason + Bessemer + Sequoia." metric="5" metricLabel="dimensions" color="green" status="Live" />
          <ModuleCard icon="↗" title="Market Sizing Engine" description="TAM/SAM/SOM with Sequoia Market Curve. Bottom-up validation." metric="Sequoia framework" color="amber" status="Building" />
          <ModuleCard icon="✦" title="Future-Cast" description="Model how AI evolution affects value over 6–24 months. Adoption S-curve." metric="24-month horizon" color="blue" status="Building" />
        </div>

        {/* ============================================ */}
        {/* ADDITIONAL MODULES FROM CAPABILITY AUDIT */}
        {/* ============================================ */}

        {/* Module 1: Opportunity Scoring Engine */}
        <SectionHeader number="1" title="Opportunity Scoring Engine" count="6 scores · per-idea analysis" color="#E11D48" bgColor="rgba(225,29,72,0.05)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="◎" title="Multi-Vector Scoring" description="6-dimensional scoring per venture: Opportunity, Problem, Feasibility, Timing, Execution, GTM." metric="6 vectors" color="rose" status="Live" />
          <ModuleCard icon="↗" title="Score Detail Dialogs" description="Clickable score boxes with full breakdowns: contributing factors, methodology, improvement tips." metric="Interactive" color="rose" status="Live" />
          <ModuleCard icon="$" title="Revenue Potential Ranking" description="Numerical revenue scoring with sortable ranking across entire database." metric="Sortable" color="rose" status="Live" />
        </div>

        {/* Module 2: Strategic Analysis Frameworks */}
        <SectionHeader number="2" title="Strategic Analysis Frameworks" count="7 frameworks · deep-dive per idea" color="#6D5AE6" bgColor="rgba(109,90,230,0.08)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="△" title="A.C.P. Framework" description="Awareness → Consideration → Purchase journey with channels and conversion optimization." metric="3 phases" color="purple" status="Live" />
          <ModuleCard icon="◈" title="Value Matrix" description="4-quadrant strategic positioning: Dream Come True, Expensive But Worth It, Status Quo, Major Hassle." metric="4 quadrants" color="purple" status="Live" />
          <ModuleCard icon="▥" title="Value Ladder" description="5-tier pricing architecture: Lead Magnet → Frontend → Core → Backend → Continuity." metric="5 tiers" color="purple" status="Live" />
          <ModuleCard icon="⊕" title="Value Equation" description="Quantified value: Dream Outcome × Perceived Likelihood / Time Delay × Effort. Hormozi framework." metric="4 variables" color="purple" status="Live" />
          <ModuleCard icon="⏱" title="Why Now Analysis" description="Market timing assessment and convergent factors making it actionable in this window." metric="Timing" color="purple" status="Live" />
          <ModuleCard icon="⊞" title="Market Gap Analysis" description="Whitespace identification and competitive positioning." metric="Gap + positioning" color="purple" status="Live" />
          <ModuleCard icon="✓" title="Proof & Signals" description="Community signal data, search trends, early traction indicators." metric="Multi-source" color="purple" status="Live" />
        </div>

        {/* Module 3: AI Research Engine */}
        <SectionHeader number="3" title="AI Research Engine" count="5 research modes" color="#B8860B" bgColor="rgba(184,134,11,0.08)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="🔬" title="40-Step AI Research Agent" description="Comprehensive startup analysis: Market, Competitors, Community, Strategy, Financials, Recommendations." metric="40 steps" color="gold" status="Live" />
          <ModuleCard icon="🌊" title="Deep Research" description="Extended multi-source research report with downloadable output." metric="Full report" color="gold" status="Live" />
          <ModuleCard icon="⚡" title="Rapid Research" description="Quick-cycle research for time-constrained evaluation." metric="Speed mode" color="gold" status="Live" />
          <ModuleCard icon="📊" title="Market Deep Research" description="Market size, growth trajectories, competitive landscape, regulatory environment." metric="Market-focused" color="gold" status="Live" />
          <ModuleCard icon="📁" title="Research Library" description="Persistent storage of all research reports per user." metric="Save · retrieve" color="gold" status="Live" />
        </div>

        {/* Module 4: Idea Factory */}
        <SectionHeader number="4" title="Idea Factory" count="4 generation pathways" color="#0891B2" bgColor="rgba(8,145,178,0.06)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="✦" title="AI Idea Generator" description="Personalized venture generation from user profile: skills, budget, time commitment." metric="3 ideas/run" color="cyan" status="Live" />
          <ModuleCard icon="🔗" title="Generate from URL" description="Input any URL → AI extracts opportunity, generates structured idea with full scoring." metric="URL → idea" color="cyan" status="Live" />
          <ModuleCard icon="📄" title="Generate from Document" description="Upload PDF, DOCX, or spreadsheet → AI creates scored venture entry." metric="PDF · DOCX" color="cyan" status="Live" />
          <ModuleCard icon="🧬" title="Founder-Idea Fit" description="0–100% founder match score with 5 skill requirement analyses." metric="5 dimensions" color="cyan" status="Live" />
        </div>

        {/* Module 5: Market Intelligence */}
        <SectionHeader number="5" title="Market Intelligence" count="6 data sources · real-time" color="#059669" bgColor="rgba(5,150,105,0.06)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="📈" title="Google Trends Integration" description="Real-time keyword trends, batch analysis, related queries." metric="Live trends" color="green" status="Live" />
          <ModuleCard icon="🔑" title="SEO Keyword Engine" description="Primary keywords, long-tail opportunities, competitor gaps." metric="Full suite" color="green" status="Live" />
          <ModuleCard icon="💬" title="Community Signals" description="Reddit, Facebook, YouTube signal data with sentiment scores." metric="3 platforms" color="green" status="Live" />
          <ModuleCard icon="🔍" title="Market Validation" description="News APIs, academic journals, industry forum signals." metric="Multi-source" color="green" status="Live" />
          <ModuleCard icon="🏷" title="Signal Badges" description='Auto-generated badges: "Perfect Timing", "Unfair Advantage", etc.' metric="Dynamic" color="green" status="Live" />
          <ModuleCard icon="📰" title="Market Insights Platform" description="Academic research citations with DOI links. Browsable library." metric="Academic" color="green" status="Live" />
        </div>

        {/* Module 6: Venture Launch Kit */}
        <SectionHeader number="6" title="Venture Launch Kit — AI Prompt Factory" count="19 generators across 4 categories" color="#D97706" bgColor="rgba(217,119,6,0.06)" />
        <SubLabel label="🚀 GTM Asset Builder" count="12 generators" color="#D97706" />
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <ModuleCard icon="🚀" title="GTM Strategy" description="Go-to-market strategy and launch plan." metric="Full GTM" color="amber" status="Live" />
          <ModuleCard icon="📆" title="GTM Launch Calendar" description="90-day launch timeline with team coordination." metric="90-day" color="amber" status="Live" />
          <ModuleCard icon="🎨" title="Ad Creatives" description="High-converting ad copy and creative concepts." metric="Multi-platform" color="amber" status="Live" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <ModuleCard icon="✦" title="Brand Package" description="Complete brand identity with logo, colors, and voice." metric="Full identity" color="amber" status="Live" />
          <ModuleCard icon="🖥" title="New Venture Website" description="Industry standard multi-page enterprise grade company website." metric="Build-ready" color="amber" status="Live" />
          <ModuleCard icon="📅" title="Content Calendar" description="90-day content marketing plan." metric="90-day plan" color="amber" status="Live" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <ModuleCard icon="⚡" title="Email Funnel System" description="Complete email marketing funnel with sequences, triggers." metric="Automation" color="amber" status="Live" />
          <ModuleCard icon="🧲" title="Lead Magnet" description="Fully articulated conversion optimized go-to-market landing pages." metric="Conversion" color="amber" status="Live" />
          <ModuleCard icon="🎯" title="Sales Funnel" description="Customer journey optimization strategy." metric="Full funnel" color="amber" status="Live" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <ModuleCard icon="🔍" title="SEO Content" description="Search-optimized content strategy." metric="SEO-ready" color="amber" status="Live" />
          <ModuleCard icon="🐦" title="Tweet-Sized Landing Page" description="Ultra-minimal 280-character landing page." metric="Micro-copy" color="amber" status="Live" />
          <ModuleCard icon="👤" title="User Personas" description="Detailed customer persona cards with motivations." metric="3 personas" color="amber" status="Live" />
        </div>
        <SubLabel label="🔍 Research" count="2 generators" color="#DB2777" />
        <div className="grid grid-cols-2 gap-2.5 mb-2">
          <ModuleCard icon="🎯" title="Market Acceptance Framework" description="ICP Identification → Initial target contact list generation → custom generated pricing acceptance scripts." metric="Framework" color="pink" status="Building" />
          <ModuleCard icon="🎤" title="Customer Interview Guide" description="Structured interviews for validation and insights." metric="Interview kit" color="pink" status="Live" />
        </div>
        <SubLabel label="💼 Business" count="2 generators" color="#D97706" />
        <div className="grid grid-cols-2 gap-2.5 mb-2">
          <ModuleCard icon="📈" title="KPI Dashboard" description="Pre-built metrics tracker with formulas." metric="Stage-gated" color="amber" status="Live" />
          <ModuleCard icon="💰" title="Pricing Strategy" description="Strategic pricing framework and psychology." metric="Framework" color="amber" status="Live" />
        </div>
        <SubLabel label="🔧 Product" count="3 generators" color="#0D9488" />
        <div className="grid grid-cols-3 gap-2.5 mb-2">
          <ModuleCard icon="📋" title="Feature Specs" description="Detailed feature specifications and user stories." metric="Dev-ready" color="teal" status="Live" />
          <ModuleCard icon="🗺" title="MVP Roadmap" description="90-day development plan with feature prioritization." metric="90-day dev" color="teal" status="Live" />
          <ModuleCard icon="📄" title="Product Requirements Doc" description="Complete PRD with technical specifications." metric="Full PRD" color="teal" status="Live" />
        </div>

        {/* Module 7: Product Builder Engine */}
        <SectionHeader number="7" title="Product Builder Engine" count="6 build outputs + .docx export" color="#3B82F6" bgColor="rgba(59,130,246,0.06)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="⚙" title="PRD Generator" description="AI generates 6 build prompt variants: Full-Stack, Backend, Frontend, Logic, Landing, Admin." metric="6 variants" color="blue" status="Live" />
          <ModuleCard icon="📦" title="App Builder Prompts" description="One-click downloadable Word document containing all build prompts." metric=".docx export" color="blue" status="Live" />
          <ModuleCard icon="🔧" title="Full Stack / No-Code / Code Instructions" description="Timeline driven build plans and code instructions for no-code builder staff and senior developers." metric="3 paths" color="blue" status="Live" />
        </div>

        {/* Module 8: Synchronous/Asynchronous AI-Powered Collaboration Tools & Portfolio Management */}
        <SectionHeader number="8" title="Synchronous/Asynchronous AI-Powered Collaboration Tools & Portfolio Management" count="6 features" color="#4F46E5" bgColor="rgba(79,70,229,0.06)" />
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="💬" title="AI Chat" description="Context-aware startup advisor with full context injection — scores, market, analysis." metric="Context-aware" color="indigo" status="Live" />
          <ModuleCard icon="📖" title={`"Wired for Story" Narrative Generator`} description={`"Business Speak" into dopamine cranking story telling.`} metric="Per-idea" color="indigo" status="Live" />
          <ModuleCard icon="👥" title="Collaboration Portal" description="Multi-user collaboration per idea with real-time messaging. Vote · Save · Rate function." metric="Real-time" color="indigo" status="Live" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <ModuleCard icon="🎯" title="Claim & Track" description="Claim ventures, track 0–100% progress, log milestones." metric="Progress" color="indigo" status="Live" />
          <ModuleCard icon="📥" title="Bulk Import Engine" description="Upload XLSX/CSV/HTML → AI generates scored ventures en masse." metric="Mass create" color="indigo" status="Live" />
          <ModuleCard icon="🏷" title="Tagging & Filtering" description="Color-coded tags. Filter by market, scores, revenue." metric="Filterable" color="indigo" status="Live" />
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl p-8 px-10 flex justify-between items-center relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #6D5AE6, #059669)' }} />
          <div>
            <div className="text-xl font-extrabold text-[#18181B] tracking-tight">Ready to build your next venture?</div>
            <div className="text-sm text-[#71717A] mt-1">{totalVentures} validated ideas and growing. 8 modules. Every asset you need to launch.</div>
          </div>
          <button onClick={() => setLocation("/database")} className="flex items-center gap-2 bg-[#6D5AE6] text-white text-[15px] font-bold px-7 py-3 rounded-xl hover:opacity-90 transition-all hover:-translate-y-px shadow-[0_4px_14px_rgba(109,90,230,0.25)]">
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>

        {/* Powered by */}
        <div className="text-center py-6 text-xs text-[#A1A1AA]">
          Built on <strong className="text-[#71717A]">37 years</strong> of C-level methodology · <strong className="text-[#71717A]">{totalVentures} ventures and growing</strong>
        </div>
      </div>
    </div>
  );
}
