import { Link } from 'wouter';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, FileText, Clock } from 'lucide-react';

export default function Sub3A_BusinessPlan() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 ml-[252px]">
        <div className="max-w-4xl mx-auto px-8 py-8">
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
                style={{ backgroundColor: 'rgba(5, 150, 105, 0.1)' }}
              >
                <FileText className="w-6 h-6" style={{ color: '#059669' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI-Native Business Plan Builder
                </h1>
                <p className="text-slate-500 text-sm">
                  Generate comprehensive, AI-first business plans
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Coming in Build Sprint 2
            </h2>

            <p className="text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
              The AI-Native Business Plan Builder will help you generate comprehensive business plans
              that satisfy LP due diligence requirements while showcasing modern AI-first operational
              thinking.
            </p>

            <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Planned Features</h3>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AI-powered financial projections
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Market analysis automation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Competitive landscape mapping
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  LP-ready document export
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AI cost structure optimization
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/venture-os"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Venture OS
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
