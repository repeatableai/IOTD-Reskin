import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import type { AdoptionStatus, ThreatLevel, FundingStage, MoatFactors } from '@/utils/module3/damodaranFramework';

interface RevaluationInputFormProps {
  // Company Profile
  companyName: string;
  industry: string;
  fundingStage: FundingStage;
  // Current Financials
  currentValuation: number;
  annualRevenue: number;
  ebitdaMargin: number;
  revenueMultiple: number;
  headcount: number;
  // AI Context
  adoptionStatus: AdoptionStatus;
  competitorThreatLevel: ThreatLevel;
  // Moats
  moats: MoatFactors;
  // Callbacks
  onCompanyNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onFundingStageChange: (value: FundingStage) => void;
  onCurrentValuationChange: (value: number) => void;
  onAnnualRevenueChange: (value: number) => void;
  onEbitdaMarginChange: (value: number) => void;
  onRevenueMultipleChange: (value: number) => void;
  onHeadcountChange: (value: number) => void;
  onAdoptionStatusChange: (value: AdoptionStatus) => void;
  onCompetitorThreatLevelChange: (value: ThreatLevel) => void;
  onMoatChange: (key: keyof MoatFactors, value: boolean) => void;
  onLoadDemo: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  className?: string;
}

const industries = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'education', label: 'Education' },
];

const fundingStages: { value: FundingStage; label: string }[] = [
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
  { value: 'growth', label: 'Growth' },
  { value: 'public', label: 'Public' },
];

const adoptionStatuses: { value: AdoptionStatus; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No AI initiatives' },
  { value: 'early', label: 'Early', description: 'AI in roadmap; no production yet' },
  { value: 'partial', label: 'Partial', description: 'Some AI features deployed' },
  { value: 'advanced', label: 'Advanced', description: 'AI core to product strategy' },
  { value: 'native', label: 'AI-Native', description: 'Built on AI from day one' },
];

const threatLevels: { value: ThreatLevel; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Competitors not focused on AI' },
  { value: 'medium', label: 'Medium', description: '1-2 competitors exploring AI' },
  { value: 'high', label: 'High', description: '3+ competitors actively deploying AI' },
  { value: 'critical', label: 'Critical', description: 'AI-native disruptor in market' },
];

const moatOptions: { key: keyof MoatFactors; label: string; description: string }[] = [
  { key: 'proprietaryData', label: 'Proprietary Data', description: 'Unique dataset competitors cannot replicate' },
  { key: 'networkEffects', label: 'Network Effects', description: 'Value increases with user base' },
  { key: 'regulatoryAdvantage', label: 'Regulatory Advantage', description: 'Licenses or compliance barriers' },
  { key: 'brandLoyalty', label: 'Brand Loyalty', description: 'Strong NPS and customer retention' },
  { key: 'switchingCosts', label: 'Switching Costs', description: 'High friction to change providers' },
];

export function RevaluationInputForm({
  companyName,
  industry,
  fundingStage,
  currentValuation,
  annualRevenue,
  ebitdaMargin,
  revenueMultiple,
  headcount,
  adoptionStatus,
  competitorThreatLevel,
  moats,
  onCompanyNameChange,
  onIndustryChange,
  onFundingStageChange,
  onCurrentValuationChange,
  onAnnualRevenueChange,
  onEbitdaMarginChange,
  onRevenueMultipleChange,
  onHeadcountChange,
  onAdoptionStatusChange,
  onCompetitorThreatLevelChange,
  onMoatChange,
  onLoadDemo,
  onSubmit,
  isLoading = false,
  className,
}: RevaluationInputFormProps) {
  const formatCurrencyInput = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString();
  };

  const parseCurrencyInput = (value: string) => {
    const parsed = parseInt(value.replace(/,/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Company Analysis Input</h3>
        <button
          onClick={onLoadDemo}
          className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Load demo company (OperationsIQ)
        </button>
      </div>

      <div className="space-y-8">
        {/* Section 1: Company Profile */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
            1. Company Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => onCompanyNameChange(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => onIndustryChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Funding Stage
              </label>
              <div className="flex flex-wrap gap-2">
                {fundingStages.map((stage) => (
                  <button
                    key={stage.value}
                    onClick={() => onFundingStageChange(stage.value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                      fundingStage === stage.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                    )}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Current Financials */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
            2. Current Financials
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Valuation ($)
              </label>
              <input
                type="text"
                value={formatCurrencyInput(currentValuation)}
                onChange={(e) => onCurrentValuationChange(parseCurrencyInput(e.target.value))}
                placeholder="42,000,000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Annual Revenue ($)
              </label>
              <input
                type="text"
                value={formatCurrencyInput(annualRevenue)}
                onChange={(e) => onAnnualRevenueChange(parseCurrencyInput(e.target.value))}
                placeholder="5,200,000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                EBITDA Margin (%)
              </label>
              <input
                type="number"
                value={ebitdaMargin * 100 || ''}
                onChange={(e) => onEbitdaMarginChange(parseFloat(e.target.value) / 100 || 0)}
                placeholder="12"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Revenue Multiple
              </label>
              <input
                type="number"
                value={revenueMultiple || ''}
                onChange={(e) => onRevenueMultipleChange(parseFloat(e.target.value) || 0)}
                placeholder="8.1"
                step="0.1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Headcount
              </label>
              <input
                type="number"
                value={headcount || ''}
                onChange={(e) => onHeadcountChange(parseInt(e.target.value) || 0)}
                placeholder="85"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: AI Context */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
            3. AI Context
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Current AI Adoption Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {adoptionStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => onAdoptionStatusChange(status.value)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      adoptionStatus === status.value
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-sm font-medium text-slate-900">{status.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{status.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Competitor AI Threat Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {threatLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => onCompetitorThreatLevelChange(level.value)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      competitorThreatLevel === level.value
                        ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-sm font-medium text-slate-900">{level.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Moats */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-100">
            4. Competitive Moats
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {moatOptions.map((moat) => (
              <label
                key={moat.key}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  moats[moat.key]
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={moats[moat.key]}
                  onChange={(e) => onMoatChange(moat.key, e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">{moat.label}</div>
                  <div className="text-xs text-slate-500">{moat.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onSubmit}
            disabled={isLoading || !companyName || currentValuation === 0}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-semibold text-white transition-all',
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running re-valuation analysis...
              </span>
            ) : (
              'Run Re-Valuation Analysis'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevaluationInputForm;
