import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ExportButton } from '@/components/module3/shared/ExportButton';
import { DisclaimerBanner } from '@/components/module3/shared/DisclaimerBanner';

interface MethodologyStep {
  step: number;
  name: string;
  inputUsed: string;
  formula: string;
  result: string;
  source: string;
}

interface MethodologyAppendixProps {
  steps: MethodologyStep[];
  className?: string;
}

const defaultSteps: MethodologyStep[] = [
  {
    step: 1,
    name: 'Base Valuation',
    inputUsed: 'Annual Revenue × Revenue Multiple',
    formula: 'Revenue × Multiple',
    result: 'Starting valuation',
    source: 'Company financials',
  },
  {
    step: 2,
    name: 'AI Adoption Adjustment',
    inputUsed: 'Current adoption status',
    formula: 'Base × (1 + adoption_factor × scenario_multiplier)',
    result: '+15% to +90% potential',
    source: 'Damodaran AI adjustment framework',
  },
  {
    step: 3,
    name: 'Competitive Threat Haircut',
    inputUsed: 'Threat level assessment',
    formula: 'Base × (1 - threat_factor × scenario_multiplier)',
    result: '-5% to -60% risk',
    source: 'Competitive analysis',
  },
  {
    step: 4,
    name: 'Moat Durability Factor',
    inputUsed: 'Moat checkboxes (5 factors)',
    formula: '0.5 + (moat_score × 0.5)',
    result: '0.5x to 1.0x multiplier',
    source: 'Moat assessment',
  },
  {
    step: 5,
    name: 'Margin Trajectory',
    inputUsed: 'Current EBITDA margin, adoption status',
    formula: 'Monthly projection with decay/growth rates',
    result: '24-month forecast',
    source: 'Financial projections',
  },
  {
    step: 6,
    name: 'Final Scenario Valuations',
    inputUsed: 'All factors combined',
    formula: 'AI-Adopted = Base × adoption_adj × moat_factor\nCompetitor-First = Base × (1 - threat_haircut)',
    result: 'Three scenario range',
    source: 'Combined analysis',
  },
];

export function MethodologyAppendix({ steps = defaultSteps, className }: MethodologyAppendixProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      {/* Header with Damodaran citation */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Methodology Appendix</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Based on:</span>
            <a
              href="https://pages.stern.nyu.edu/~adamodar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              Damodaran Valuation Framework
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Adapted for AI transition analysis</span>
          </div>
        </div>
        <ExportButton />
      </div>

      {/* Methodology Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-8">#</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-1/5">Adjustment Step</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-1/4">Input Used</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-1/4">Formula Applied</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 w-1/6">Result</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {steps.map((step) => (
              <tr key={step.step} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {step.step}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{step.name}</td>
                <td className="px-4 py-3 text-slate-600">{step.inputUsed}</td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono whitespace-pre-wrap">
                    {step.formula}
                  </code>
                </td>
                <td className="px-4 py-3 text-slate-700 font-medium">{step.result}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{step.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Assumptions */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Key Model Assumptions</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>AI adoption creates sustainable competitive advantage through operational efficiency and product differentiation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Competitor AI deployment erodes pricing power and market share over 12-24 month horizon</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Moat durability factors moderate both upside potential and downside risk</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>Scenario multipliers reflect uncertainty range typical in early-stage technology transitions</span>
          </li>
        </ul>
      </div>

      {/* Formula Reference */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">Core Formulas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">AI-Adopted Valuation</div>
            <code className="text-sm bg-white px-3 py-2 rounded border border-blue-200 block text-blue-800 font-mono">
              V_ai = Base × (1 + A × M_scenario) × Moat
            </code>
          </div>
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">Competitor-First Valuation</div>
            <code className="text-sm bg-white px-3 py-2 rounded border border-blue-200 block text-blue-800 font-mono">
              V_comp = Base × (1 - T × M_scenario)
            </code>
          </div>
        </div>
        <div className="text-xs text-blue-700 mt-3">
          Where: A = adoption factor, T = threat haircut, M = scenario multiplier, Moat = durability factor (0.5-1.0)
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner type="valuation" />
    </div>
  );
}

export default MethodologyAppendix;
