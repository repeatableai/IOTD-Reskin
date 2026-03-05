import { Link } from 'wouter';
import Header from '@/components/Header';
import { ArrowLeft, Zap, Clock } from 'lucide-react';

export default function Sub3B_Transformation() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <main className="max-w-4xl mx-auto px-8 py-8">
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
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                <Zap className="w-6 h-6" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI Transformation Blueprint
                </h1>
                <p className="text-slate-500 text-sm">
                  Create detailed AI transformation roadmaps for portfolio companies
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Coming in Build Sprint 3
            </h2>

            <p className="text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
              The AI Transformation Blueprint will help you create detailed transformation roadmaps
              for portfolio companies, identifying AI integration opportunities and building
              implementation timelines.
            </p>

            <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Planned Features</h3>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  AI opportunity assessment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Department-by-department analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Implementation timeline generator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ROI projection models
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Change management playbooks
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
      </main>
    </div>
  );
}
