import { Link } from 'wouter';
import { Sidebar } from '@/components/Sidebar';
import { Layers, Calculator, FileText, Sparkles, ArrowRight, Users, Building2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleTileProps {
  title: string;
  description: string;
  href: string;
  accentColor: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  isProminent?: boolean;
  comingSoon?: boolean;
}

function ModuleTile({
  title,
  description,
  href,
  accentColor,
  badge,
  badgeColor,
  icon,
  isProminent = false,
  comingSoon = false,
}: ModuleTileProps) {
  const content = (
    <div
      className={cn(
        'group relative rounded-xl border transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        isProminent
          ? 'border-2 shadow-md'
          : 'border-slate-200 bg-white',
        comingSoon && 'opacity-75'
      )}
      style={{
        borderColor: isProminent ? accentColor : undefined,
      }}
    >
      {/* Accent top bar */}
      <div
        className="h-1.5 rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-6">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
          {badge && (
            <span
              className="px-2.5 py-1 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: `${badgeColor || accentColor}15`,
                color: badgeColor || accentColor,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title and description */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{description}</p>

        {/* Action */}
        <div
          className={cn(
            'flex items-center gap-2 text-sm font-medium transition-all',
            'group-hover:gap-3'
          )}
          style={{ color: accentColor }}
        >
          {comingSoon ? (
            <span className="text-slate-400">Coming Soon</span>
          ) : (
            <>
              Open Module
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (comingSoon) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}

export default function Module3Landing() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 ml-[252px]">
        <div className="max-w-6xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}
              >
                <Layers className="w-6 h-6" style={{ color: '#B8860B' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI-Native Venture Operating System
                </h1>
                <p className="text-slate-500 text-sm">
                  IVE Module 3 — Portfolio Intelligence Suite
                </p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl leading-relaxed">
              Transform your portfolio management with AI-powered tools. Revalue companies based on
              AI adoption readiness, generate AI-native business plans, and create transformation
              blueprints for portfolio companies.
            </p>
          </div>

          {/* Module Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Portfolio Re-Valuation Engine - Prominent */}
            <ModuleTile
              title="Portfolio Re-Valuation Engine"
              description="Model AI adoption upside and competitor-first downside scenarios. Quantify the true AI risk exposure in your portfolio using the Damodaran framework."
              href="/venture-os/revaluation"
              accentColor="#B8860B"
              badge="VC Partners"
              badgeColor="#B8860B"
              icon={<Calculator className="w-6 h-6" />}
              isProminent={true}
            />

            {/* AI-Native Business Plan Builder */}
            <ModuleTile
              title="AI-Native Business Plan Builder"
              description="Generate comprehensive, AI-first business plans that satisfy LP due diligence requirements while showcasing modern operational thinking."
              href="/venture-os/business-plan"
              accentColor="#059669"
              badge="Build Sprint 2"
              badgeColor="#059669"
              icon={<FileText className="w-6 h-6" />}
              comingSoon={true}
            />

            {/* AI Transformation Blueprint */}
            <ModuleTile
              title="AI Transformation Blueprint"
              description="Create detailed transformation roadmaps for portfolio companies. Identify AI integration opportunities and build implementation timelines."
              href="/venture-os/transformation"
              accentColor="#3B82F6"
              badge="Build Sprint 3"
              badgeColor="#3B82F6"
              icon={<Zap className="w-6 h-6" />}
              comingSoon={true}
            />
          </div>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Target Users</span>
              </div>
              <p className="text-slate-900 font-semibold">VC Partners & Portfolio Teams</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Framework</span>
              </div>
              <p className="text-slate-900 font-semibold">Damodaran Valuation Model</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Key Insight</span>
              </div>
              <p className="text-slate-900 font-semibold">AI-First Risk Assessment</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-10 text-center text-sm text-slate-400">
            <p>
              Part of the Intelligent Venture Engine (IVE) — AI-powered tools for modern venture capital
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
