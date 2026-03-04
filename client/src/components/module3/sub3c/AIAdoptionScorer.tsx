import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { ScoreBreakdown } from '@/utils/module3/damodaranFramework';

interface AIAdoptionScorerProps {
  score: number;
  breakdown: ScoreBreakdown;
  className?: string;
}

function getScoreColor(score: number): { ring: string; text: string; bg: string } {
  if (score >= 70) return { ring: 'stroke-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-500' };
  if (score >= 50) return { ring: 'stroke-blue-500', text: 'text-blue-600', bg: 'bg-blue-500' };
  if (score >= 30) return { ring: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-500' };
  return { ring: 'stroke-rose-500', text: 'text-rose-600', bg: 'bg-rose-500' };
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'AI-Ready';
  if (score >= 50) return 'Progressing';
  if (score >= 30) return 'Early Stage';
  return 'At Risk';
}

function getRecommendations(score: number): { priority: string; action: string; impact: 'high' | 'medium' }[] {
  if (score >= 70) {
    return [
      { priority: '1', action: 'Maintain AI leadership through continuous innovation', impact: 'high' },
      { priority: '2', action: 'Build proprietary AI models on unique data assets', impact: 'medium' },
      { priority: '3', action: 'Explore AI-native business model extensions', impact: 'medium' },
    ];
  }
  if (score >= 50) {
    return [
      { priority: '1', action: 'Accelerate AI feature deployment timeline', impact: 'high' },
      { priority: '2', action: 'Hire specialized AI/ML engineering talent', impact: 'high' },
      { priority: '3', action: 'Establish AI governance and data infrastructure', impact: 'medium' },
    ];
  }
  if (score >= 30) {
    return [
      { priority: '1', action: 'Define urgent AI strategy and roadmap', impact: 'high' },
      { priority: '2', action: 'Assess build vs. buy for AI capabilities', impact: 'high' },
      { priority: '3', action: 'Identify quick-win AI integration opportunities', impact: 'medium' },
    ];
  }
  return [
    { priority: '1', action: 'Immediate AI strategy workshop with leadership', impact: 'high' },
    { priority: '2', action: 'Evaluate existential threat from AI-native competitors', impact: 'high' },
    { priority: '3', action: 'Consider strategic alternatives (M&A, pivots)', impact: 'high' },
  ];
}

export function AIAdoptionScorer({ score, breakdown, className }: AIAdoptionScorerProps) {
  const colors = getScoreColor(score);
  const label = getScoreLabel(score);
  const recommendations = getRecommendations(score);

  // SVG circle parameters
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-slate-900 mb-6">AI Adoption Readiness Score</h3>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Circular Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className={colors.ring}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-4xl font-bold', colors.text)}>{score}</span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
          </div>
          <div className={cn('mt-3 px-4 py-1.5 rounded-full text-sm font-semibold', colors.bg, 'text-white')}>
            {label}
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="flex-1 space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown</h4>
          {Object.entries(breakdown.components).map(([key, component]) => {
            const percentage = (component.score / component.max) * 100;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{component.label}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {component.score}/{component.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      percentage >= 70 ? 'bg-emerald-500' :
                      percentage >= 50 ? 'bg-blue-500' :
                      percentage >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Recommended Actions</h4>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg',
                rec.impact === 'high' ? 'bg-rose-50' : 'bg-slate-50'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white',
                rec.impact === 'high' ? 'bg-rose-500' : 'bg-slate-400'
              )}>
                {rec.priority}
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-800">{rec.action}</div>
                <div className={cn(
                  'text-xs mt-0.5',
                  rec.impact === 'high' ? 'text-rose-600 font-medium' : 'text-slate-500'
                )}>
                  {rec.impact === 'high' ? 'High Impact' : 'Medium Impact'}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIAdoptionScorer;
