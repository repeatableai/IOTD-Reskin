import { cn } from '@/lib/utils';

export type Scenario = 'conservative' | 'base' | 'aggressive';

interface ScenarioToggleProps {
  activeScenario: Scenario;
  onChange: (scenario: Scenario) => void;
  className?: string;
}

const scenarios: { value: Scenario; label: string; color: string; activeColor: string }[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    color: 'text-blue-600',
    activeColor: 'bg-blue-600 text-white',
  },
  {
    value: 'base',
    label: 'Base',
    color: 'text-emerald-600',
    activeColor: 'bg-emerald-600 text-white',
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    color: 'text-amber-600',
    activeColor: 'bg-amber-600 text-white',
  },
];

export function ScenarioToggle({ activeScenario, onChange, className }: ScenarioToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200',
        className
      )}
    >
      {scenarios.map((scenario) => (
        <button
          key={scenario.value}
          onClick={() => onChange(scenario.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400',
            activeScenario === scenario.value
              ? scenario.activeColor
              : `${scenario.color} hover:bg-slate-200`
          )}
        >
          {scenario.label}
        </button>
      ))}
    </div>
  );
}

export default ScenarioToggle;
