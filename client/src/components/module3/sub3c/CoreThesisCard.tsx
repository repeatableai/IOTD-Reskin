import { cn } from '@/lib/utils';

interface CoreThesisCardProps {
  className?: string;
}

export function CoreThesisCard({ className }: CoreThesisCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6 border-l-4',
        className
      )}
      style={{
        backgroundColor: '#1B2A4A',
        borderLeftColor: '#B8860B',
      }}
    >
      <h2 className="text-lg font-bold text-white mb-3">
        The Question VCs Are Getting Wrong
      </h2>
      <p className="text-white/90 text-sm leading-relaxed">
        Most VCs ask: <em className="text-amber-300">"Is this company using AI?"</em>
      </p>
      <p className="text-white/90 text-sm leading-relaxed mt-2">
        The better question: <strong className="text-emerald-400">"What happens to this company's valuation if their competitors deploy AI first?"</strong>
      </p>
      <p className="text-white/70 text-xs mt-4 leading-relaxed">
        This re-valuation engine models both scenarios—AI adoption upside and competitor-first downside—to
        quantify the true AI risk exposure in your portfolio. Built on the Damodaran valuation framework,
        adapted for the AI transition era.
      </p>
    </div>
  );
}

export default CoreThesisCard;
