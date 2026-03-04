import { useState } from 'react';
import { RotateCcw, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Assumption {
  id: string;
  label: string;
  value: string | number;
  source: string;
  isEditable?: boolean;
  isOverridden?: boolean;
  defaultValue?: string | number;
}

interface AssumptionTableProps {
  assumptions: Assumption[];
  onUpdate?: (id: string, newValue: string | number) => void;
  onReset?: () => void;
  className?: string;
}

export function AssumptionTable({
  assumptions,
  onUpdate,
  onReset,
  className,
}: AssumptionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const hasOverrides = assumptions.some((a) => a.isOverridden);

  const handleStartEdit = (assumption: Assumption) => {
    if (!assumption.isEditable) return;
    setEditingId(assumption.id);
    setEditValue(String(assumption.value));
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdate) {
      onUpdate(id, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Key Assumptions</h3>
        {hasOverrides && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        )}
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-slate-600 w-1/3">
                Assumption
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-slate-600 w-1/4">
                Value
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-slate-600">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {assumptions.map((assumption) => (
              <tr
                key={assumption.id}
                className={cn(
                  'transition-colors',
                  assumption.isOverridden && 'bg-amber-50'
                )}
              >
                <td className="px-4 py-3 text-slate-700">{assumption.label}</td>
                <td className="px-4 py-3">
                  {editingId === assumption.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(assumption.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-medium',
                          assumption.isOverridden ? 'text-amber-700' : 'text-slate-900'
                        )}
                      >
                        {assumption.value}
                      </span>
                      {assumption.isEditable && onUpdate && (
                        <button
                          onClick={() => handleStartEdit(assumption)}
                          className="p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{assumption.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssumptionTable;
