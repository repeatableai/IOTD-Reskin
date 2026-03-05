import { useEffect } from 'react';
import { useSearch } from 'wouter';
import Header from '@/components/Header';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Link } from 'wouter';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

// Components
import { CoreThesisCard } from '@/components/module3/sub3c/CoreThesisCard';
import { RevaluationInputForm } from '@/components/module3/sub3c/RevaluationInputForm';
import { ValuationSummaryCard } from '@/components/module3/sub3c/ValuationSummaryCard';
import { AIAdoptionScorer } from '@/components/module3/sub3c/AIAdoptionScorer';
import { MarginCompressionChart } from '@/components/module3/sub3c/MarginCompressionChart';
import { MethodologyAppendix } from '@/components/module3/sub3c/MethodologyAppendix';

// Hook
import { useRevaluationEngine } from '@/hooks/module3/useRevaluationEngine';

// Demo data
import demoData from '@/data/module3/demoData_3C_OperationsIQ.json';

export default function Sub3C_Revaluation() {
  const searchString = useSearch();
  const isDemo = searchString.includes('demo=true');

  const engine = useRevaluationEngine();

  // Auto-load demo mode if URL param is present
  useEffect(() => {
    if (isDemo && !engine.hasResults) {
      engine.loadDemoData();
      // Trigger analysis after a brief delay to allow state to update
      setTimeout(() => {
        engine.runAnalysis();
      }, 100);
    }
  }, [isDemo]);

  // Get current scenario results
  const currentScenarioResults = engine.results?.[engine.activeScenario];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <main className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/venture-os"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Venture OS
            </Link>

            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-lg"
                style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}
              >
                <Calculator className="w-6 h-6" style={{ color: '#B8860B' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Portfolio Re-Valuation Engine
                </h1>
                <p className="text-slate-500 text-sm">
                  AI adoption impact analysis using the Damodaran framework
                </p>
              </div>
            </div>
          </div>

          {/* Core Thesis Card */}
          <CoreThesisCard className="mb-8" />

          {/* Main Content */}
          {!engine.hasResults ? (
            // Input Form
            <RevaluationInputForm
              companyName={engine.companyName}
              industry={engine.industry}
              fundingStage={engine.fundingStage}
              currentValuation={engine.currentValuation}
              annualRevenue={engine.annualRevenue}
              ebitdaMargin={engine.ebitdaMargin}
              revenueMultiple={engine.revenueMultiple}
              headcount={engine.headcount}
              adoptionStatus={engine.adoptionStatus}
              competitorThreatLevel={engine.competitorThreatLevel}
              moats={engine.moats}
              onCompanyNameChange={engine.setCompanyName}
              onIndustryChange={engine.setIndustry}
              onFundingStageChange={engine.setFundingStage}
              onCurrentValuationChange={engine.setCurrentValuation}
              onAnnualRevenueChange={engine.setAnnualRevenue}
              onEbitdaMarginChange={engine.setEbitdaMargin}
              onRevenueMultipleChange={engine.setRevenueMultiple}
              onHeadcountChange={engine.setHeadcount}
              onAdoptionStatusChange={engine.setAdoptionStatus}
              onCompetitorThreatLevelChange={engine.setCompetitorThreatLevel}
              onMoatChange={engine.setMoat}
              onLoadDemo={engine.loadDemoData}
              onSubmit={engine.runAnalysis}
              isLoading={engine.isLoading}
            />
          ) : engine.isLoading ? (
            // Loading State
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Running re-valuation analysis...
              </h3>
              <p className="text-slate-500 text-sm">
                Calculating AI adoption scenarios and margin projections
              </p>
            </div>
          ) : (
            // Results View
            <div className="space-y-6">
              {/* Company Name Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{engine.companyName}</h2>
                  <p className="text-sm text-slate-500">
                    {engine.fundingStage.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} •{' '}
                    {engine.industry.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <button
                  onClick={engine.reset}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
                >
                  New Analysis
                </button>
              </div>

              {/* Tabs */}
              <Tabs.Root defaultValue="summary" className="w-full">
                <Tabs.List className="flex border-b border-slate-200 mb-6">
                  {[
                    { value: 'summary', label: 'Valuation Summary' },
                    { value: 'score', label: 'AI Adoption Score' },
                    { value: 'margins', label: 'Margin Compression' },
                    { value: 'methodology', label: 'Methodology Appendix' },
                  ].map((tab) => (
                    <Tabs.Trigger
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all',
                        'data-[state=active]:border-blue-600 data-[state=active]:text-blue-600',
                        'data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500',
                        'hover:text-slate-700'
                      )}
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <Tabs.Content value="summary">
                  {currentScenarioResults && engine.results && (
                    <ValuationSummaryCard
                      currentValuation={engine.results.currentValuation}
                      aiAdoptedValuation={currentScenarioResults.aiAdoptedValuation}
                      aiAdoptedChange={currentScenarioResults.aiAdoptedChange}
                      competitorFirstValuation={currentScenarioResults.competitorFirstValuation}
                      competitorFirstChange={currentScenarioResults.competitorFirstChange}
                      activeScenario={engine.activeScenario}
                      onScenarioChange={engine.setActiveScenario}
                    />
                  )}
                </Tabs.Content>

                <Tabs.Content value="score">
                  {engine.results && (
                    <AIAdoptionScorer
                      score={engine.results.aiAdoptionScore}
                      breakdown={engine.results.scoreBreakdown}
                    />
                  )}
                </Tabs.Content>

                <Tabs.Content value="margins">
                  {engine.results && (
                    <MarginCompressionChart projections={engine.results.marginProjections} />
                  )}
                </Tabs.Content>

                <Tabs.Content value="methodology">
                  <MethodologyAppendix
                    steps={[
                      {
                        step: 1,
                        name: 'Base Valuation',
                        inputUsed: `$${(engine.annualRevenue / 1000000).toFixed(1)}M ARR × ${engine.revenueMultiple}x multiple`,
                        formula: 'Revenue × Multiple',
                        result: `$${(engine.currentValuation / 1000000).toFixed(1)}M`,
                        source: 'Company financials',
                      },
                      {
                        step: 2,
                        name: 'AI Adoption Adjustment',
                        inputUsed: `${engine.adoptionStatus.replace(/\b\w/g, (l) => l.toUpperCase())} adoption status`,
                        formula: 'Base × (1 + adoption_factor)',
                        result: currentScenarioResults
                          ? `+${Math.round(currentScenarioResults.aiAdoptedChange * 100)}% potential`
                          : 'Calculating...',
                        source: 'Damodaran AI adjustment framework',
                      },
                      {
                        step: 3,
                        name: 'Competitive Threat Haircut',
                        inputUsed: `${engine.competitorThreatLevel.replace(/\b\w/g, (l) => l.toUpperCase())} threat level`,
                        formula: 'Base × (1 - threat_factor)',
                        result: currentScenarioResults
                          ? `${Math.round(currentScenarioResults.competitorFirstChange * 100)}% risk`
                          : 'Calculating...',
                        source: 'Competitive analysis',
                      },
                      {
                        step: 4,
                        name: 'Moat Durability Factor',
                        inputUsed: `${Object.values(engine.moats).filter(Boolean).length} of 5 moats present`,
                        formula: 'Adjustment × moat_multiplier',
                        result: `${(0.5 + Object.values(engine.moats).filter(Boolean).length * 0.1).toFixed(2)}x multiplier`,
                        source: 'Moat assessment',
                      },
                      {
                        step: 5,
                        name: 'Margin Trajectory',
                        inputUsed: `${Math.round(engine.ebitdaMargin * 100)}% current EBITDA`,
                        formula: 'NPV of projected margins',
                        result: 'Scenario-dependent',
                        source: 'Financial projections',
                      },
                      {
                        step: 6,
                        name: 'Final Scenario Valuations',
                        inputUsed: 'All factors combined',
                        formula: 'Weighted scenario analysis',
                        result:
                          engine.results && currentScenarioResults
                            ? `$${(currentScenarioResults.competitorFirstValuation / 1000000).toFixed(1)}M - $${(currentScenarioResults.aiAdoptedValuation / 1000000).toFixed(1)}M range`
                            : 'Calculating...',
                        source: 'Combined analysis',
                      },
                    ]}
                  />
                </Tabs.Content>
              </Tabs.Root>
            </div>
          )}
      </main>
    </div>
  );
}
