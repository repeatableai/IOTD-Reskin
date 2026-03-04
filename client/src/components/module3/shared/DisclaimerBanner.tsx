import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  type: 'valuation' | 'projection';
  compact?: boolean;
  className?: string;
}

const disclaimerText = {
  valuation: {
    title: 'Valuation Disclaimer',
    body: 'These valuations are illustrative estimates based on the Damodaran framework and user-provided inputs. They do not constitute financial advice, investment recommendations, or guarantees of future performance. Actual valuations may vary significantly based on market conditions, due diligence findings, and other factors not captured in this model.',
  },
  projection: {
    title: 'Projection Disclaimer',
    body: 'These projections are forward-looking estimates based on assumptions and historical data. Actual results may differ materially due to market conditions, competitive dynamics, execution risk, and other unforeseen factors. These projections should not be used as the sole basis for investment decisions.',
  },
};

export function DisclaimerBanner({ type, compact = false, className }: DisclaimerBannerProps) {
  const { title, body } = disclaimerText[type];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
          'bg-amber-50 border border-amber-200 text-amber-800',
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span>
          <strong>{title}:</strong> Estimates only. Not financial advice.
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        'bg-amber-50 border border-amber-200',
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-amber-900 mb-1">{title}</h4>
        <p className="text-xs text-amber-800 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default DisclaimerBanner;
