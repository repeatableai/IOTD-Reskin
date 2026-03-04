import { useState } from 'react';
import { Download, ChevronDown, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  className?: string;
  disabled?: boolean;
}

export function ExportButton({ className, disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = (format: 'pdf' | 'docx') => {
    setIsOpen(false);
    toast({
      title: 'Export feature coming soon',
      description: `Export as ${format.toUpperCase()} will be available in the next build sprint.`,
      duration: 4000,
    });
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
          'border border-slate-300 bg-white text-slate-700',
          'hover:bg-slate-50 hover:border-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-500" />
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <File className="w-4 h-4 text-blue-500" />
              Export as Word (.docx)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExportButton;
