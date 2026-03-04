import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScenarioToggle, Scenario } from '@/components/module3/shared/ScenarioToggle';
import { DisclaimerBanner } from '@/components/module3/shared/DisclaimerBanner';
import { formatCurrency, formatPercentage } from '@/utils/module3/damodaranFramework';

interface ValuationSummaryCardProps {
  currentValuation: number;
  aiAdoptedValuation: number;
  aiAdoptedChange: number;
  competitorFirstValuation: number;
  competitorFirstChange: number;
  activeScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
  className?: string;
}

export function ValuationSummaryCard({
  currentValuation,
  aiAdoptedValuation,
  aiAdoptedChange,
  competitorFirstValuation,
  competitorFirstChange,
  activeScenario,
  onScenarioChange,
  className,
}: ValuationSummaryCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Valuation Scenario Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Valuation */}
        <div
          className="rounded-xl p-5 text-center"
          style={{ backgroundColor: '#1B2A4A' }}
        >
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
            Current Valuation
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatCurrency(currentValuation)}
          </div>
          <div className="flex items-center justify-center gap-1 text-white/50 text-sm">
            <Minus className="w-4 h-4" />
            Baseline
          </div>
        </div>

        {/* AI-Adopted Scenario */}
        <div className="rounded-xl p-5 text-center bg-emerald-50 border-2 border-emerald-200">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-2">
            AI-Adopted Scenario
          </div>
          <div className="text-3xl font-bold text-emerald-700 mb-1">
            {formatCurrency(aiAdoptedValuation)}
          </div>
          <div className="flex items-center justify-center gap-1 text-emerald-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {formatPercentage(aiAdoptedChange)}
          </div>
        </div>

        {/* Competitor-First Scenario */}
        <div className="rounded-xl p-5 text-center bg-rose-50 border-2 border-rose-200">
          <div className="text-xs font-medium text-rose-700 uppercase tracking-wider mb-2">
            Competitor-First Scenario
          </div>
          <div className="text-3xl font-bold text-rose-700 mb-1">
            {formatCurrency(competitorFirstValuation)}
          </div>
          <div className="flex items-center justify-center gap-1 text-rose-600 text-sm font-medium">
            <TrendingDown className="w-4 h-4" />
            {formatPercentage(competitorFirstChange)}
          </div>
        </div>
      </div>

      {/* Value Gap Highlight */}
      <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-rose-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-semibold">Total Value Gap:</span> The difference between AI leadership and AI laggard scenarios
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCurrency(aiAdoptedValuation - competitorFirstValuation)}
          </div>
        </div>
      </div>

      {/* Scenario Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-slate-600">
          Adjust assumptions:
        </div>
        <ScenarioToggle
          activeScenario={activeScenario}
          onChange={onScenarioChange}
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-6">
        <DisclaimerBanner type="valuation" compact />
      </div>
    </div>
  );
}

export default ValuationSummaryCard;
