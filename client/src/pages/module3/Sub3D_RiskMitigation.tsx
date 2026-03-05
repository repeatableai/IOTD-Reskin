import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import { ArrowLeft, ShieldCheck, Sun, Moon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Department data
const DEPARTMENTS = [
  { id: 'exec', icon: '👑', name: 'Executive / C-Suite', count: 18, aiPct: 55 },
  { id: 'sales', icon: '💼', name: 'Sales & Revenue', count: 22, aiPct: 68 },
  { id: 'mktg', icon: '📣', name: 'Marketing', count: 20, aiPct: 72 },
  { id: 'finance', icon: '💰', name: 'Finance & Accounting', count: 19, aiPct: 74 },
  { id: 'legal', icon: '⚖️', name: 'Legal & Compliance', count: 16, aiPct: 62 },
  { id: 'hr', icon: '👥', name: 'Human Resources', count: 17, aiPct: 65 },
  { id: 'ops', icon: '⚙️', name: 'Operations', count: 21, aiPct: 70 },
  { id: 'product', icon: '🎯', name: 'Product Management', count: 18, aiPct: 60 },
  { id: 'eng', icon: '💻', name: 'Engineering & Tech', count: 20, aiPct: 58 },
  { id: 'cs', icon: '🤝', name: 'Customer Success', count: 16, aiPct: 73 },
  { id: 'it', icon: '🔧', name: 'IT & Infrastructure', count: 15, aiPct: 67 },
  { id: 'rd', icon: '🔬', name: 'Research & Development', count: 14, aiPct: 56 },
];

interface VentureBrief {
  name: string;
  industry: string;
  stage: string;
  model: string;
  value: string;
  customer: string;
  revenue: string;
  acv: string;
  headcount: string;
  aiFte: string;
  capital: string;
  geo: string;
  team: string;
  aiStack: string;
  aiFunctions: string;
  humanFunctions: string;
  moat: string;
  context: string;
}

const initialVenture: VentureBrief = {
  name: '', industry: '', stage: '', model: '', value: '', customer: '',
  revenue: '', acv: '', headcount: '', aiFte: '', capital: '', geo: '',
  team: '', aiStack: '', aiFunctions: '', humanFunctions: '', moat: '', context: ''
};

type PageId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'bp';

export default function Sub3D_RiskMitigation() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState<PageId>('p1');
  const [venture, setVenture] = useState<VentureBrief>(initialVenture);
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapOutput, setMapOutput] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  // Toast handler
  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 2800);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  // Navigation
  const navItems = [
    { id: 'p1', num: '1', title: 'Venture Brief', sub: 'Company foundation', status: 'live' },
    { id: 'p2', num: '2', title: 'Deliverable Map', sub: 'Master output library', status: 'live' },
    { id: 'p3', num: '3', title: 'AI/Human Layer', sub: 'Assignment + cost delta', status: 'soon' },
    { id: 'p4', num: '4', title: 'Org Architecture', sub: 'Roles from deliverables', status: 'lock' },
    { id: 'p5', num: '5', title: 'SOP Generator', sub: 'Workflows on demand', status: 'lock' },
    { id: 'p6', num: '6', title: 'Voice Partner', sub: 'AI role specifications', status: 'lock' },
  ];

  // Update venture field
  const updateVenture = (field: keyof VentureBrief, value: string) => {
    setVenture(v => ({ ...v, [field]: value }));
  };

  // Load demo data
  const loadDemoData = () => {
    setVenture({
      name: 'ClearPath AI',
      industry: 'Healthcare / MedTech',
      stage: 'Seed / Early Revenue',
      model: 'B2B SaaS (Subscription)',
      value: 'ClearPath AI eliminates revenue leakage in hospital billing by deploying an AI-first Revenue Cycle Management system that autonomously handles claims processing, denial prediction, coding audit, and compliance monitoring — reducing billing costs by 73% and recovering 18–27% more revenue per patient encounter.',
      customer: 'Mid-to-large hospital systems, 250–2,000 beds; regional health networks and specialty surgical centers',
      revenue: '$50M ARR by Month 36',
      acv: '$180,000 / year',
      headcount: '28',
      aiFte: '140',
      capital: '$8M Seed Round',
      geo: 'United States (Y1–Y2) → Canada + UK (Y3)',
      team: 'CEO: Former CFO of 12-hospital regional system ($2.4B annual revenue). CTO: Former ML Lead at Epic, 14 NLP patents. COO: Former VP Operations at Flatiron Health, scaled $40M → $320M ARR.',
      aiStack: 'Claude API, custom healthcare NLP (22M labeled claims), ElevenLabs, Deepgram',
      aiFunctions: '1. Claims intake, scrubbing & submission\n2. Denial root-cause analysis & appeal drafting\n3. ICD/CPT coding audit\n4. Real-time compliance monitoring\n5. Revenue integrity reporting',
      humanFunctions: '1. Client relationship management\n2. Regulatory sign-off on complex disputes\n3. Hospital onboarding & change management\n4. AI model governance\n5. Sales & partnerships',
      moat: '22M labeled claims dataset (largest private dataset), network effects per new hospital, deep Epic/Cerner EHR integration (12-month switching barrier), CMS compliance engine with 7-year training data.',
      context: 'First client: Piedmont Health System (6 hospitals, $890M revenue). LOI with 3 additional systems. CMS Innovation Center partnership in discussion.'
    });
    showToast('Demo data loaded — ClearPath AI');
  };

  // Save venture brief
  const saveVentureBrief = () => {
    if (!venture.name) {
      showToast('Company name is required', true);
      return;
    }
    setProgress(16);
    showToast('Venture Brief saved — ' + venture.name);
    setCurrentPage('p2');
  };

  // Toggle department selection
  const toggleDept = (id: string) => {
    setSelectedDepts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all departments
  const selectAllDepts = () => {
    setSelectedDepts(new Set(DEPARTMENTS.map(d => d.id)));
  };

  // Generate deliverable map
  const generateDeliverableMap = async () => {
    if (selectedDepts.size === 0) {
      showToast('Select at least one department', true);
      return;
    }

    const deptNames = DEPARTMENTS.filter(d => selectedDepts.has(d.id)).map(d => d.name);
    const v = venture.name ? venture : { name: 'Your Company', industry: 'Technology', stage: 'Early Stage', value: '', aiStack: '', aiFunctions: '', humanFunctions: '' };

    setIsGenerating(true);
    setMapOutput('');

    // Simulate API call with mock data for demo
    setTimeout(() => {
      const mockOutput = generateMockDeliverableMap(deptNames, v);
      setMapOutput(mockOutput);
      setIsGenerating(false);
      setProgress(33);
      showToast('Deliverable Map generated');
    }, 2000);
  };

  // Mock deliverable map generator
  const generateMockDeliverableMap = (deptNames: string[], v: any) => {
    let output = '';
    let totalDeliverables = 0;

    deptNames.forEach(deptName => {
      const dept = DEPARTMENTS.find(d => d.name === deptName);
      const deliverables = generateDeptDeliverables(deptName, dept?.aiPct || 65);
      totalDeliverables += deliverables.length;

      output += `## ${deptName}\n\n`;
      output += '| Deliverable | Type | Frequency | Owner | Complexity | Downstream |\n';
      output += '|---|---|---|---|---|---|\n';
      deliverables.forEach(d => {
        output += `| ${d.name} | ${d.type} | ${d.freq} | ${d.owner} | ${d.complexity} | ${d.downstream} |\n`;
      });
      output += '\n';
    });

    output += '## SUMMARY\n\n';
    output += '| Department | Total | AI-Owned | Human-Owned | Fractional+AI | AI% |\n';
    output += '|---|---|---|---|---|---|\n';
    deptNames.forEach(deptName => {
      const dept = DEPARTMENTS.find(d => d.name === deptName);
      const total = dept?.count || 15;
      const aiOwned = Math.round(total * (dept?.aiPct || 65) / 100);
      const human = Math.round(total * 0.2);
      const frac = total - aiOwned - human;
      output += `| ${deptName} | ${total} | ${aiOwned} | ${human} | ${frac} | ${dept?.aiPct || 65}% |\n`;
    });

    return output;
  };

  const generateDeptDeliverables = (deptName: string, aiPct: number) => {
    const types = ['Document', 'Report', 'Process', 'Communication', 'Analysis', 'Decision'];
    const freqs = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Ad Hoc'];
    const complexities = ['Low', 'Medium', 'High'];
    const downstreams = ['Executive', 'Sales', 'Finance', 'Operations', 'All'];

    const deliverablesByDept: Record<string, string[]> = {
      'Executive / C-Suite': ['Board Meeting Deck', 'Strategic Initiative Tracker', 'KPI Dashboard', 'Investor Update', 'Risk Assessment Report', 'Budget Approval Package', 'Partnership Evaluation', 'Market Analysis Brief', 'Competitive Intelligence Report', 'Quarterly Business Review', 'Annual Planning Document', 'Crisis Response Protocol'],
      'Sales & Revenue': ['Pipeline Velocity Report', 'Deal Forecast Model', 'Win/Loss Analysis', 'Territory Plan', 'Pricing Proposal', 'Contract Negotiation Brief', 'Customer ROI Calculator', 'Sales Playbook Update', 'Commission Calculation', 'Lead Scoring Report', 'Quota Attainment Dashboard', 'Renewal Forecast'],
      'Marketing': ['Campaign Performance Report', 'Content Calendar', 'Brand Guidelines Update', 'Lead Generation Analysis', 'SEO/SEM Report', 'Social Media Analytics', 'Event ROI Analysis', 'Competitive Positioning Doc', 'Customer Persona Update', 'Marketing Budget Tracker', 'PR/Media Coverage Report', 'Email Campaign Analysis'],
      'Finance & Accounting': ['Monthly Close Package', 'Cash Flow Forecast', 'Variance Analysis', 'Budget vs Actual Report', 'AP/AR Aging Report', 'Tax Compliance Filing', 'Audit Preparation Package', 'Revenue Recognition Analysis', 'Cost Center Analysis', 'Financial Model Update', 'Expense Report Processing', 'Vendor Payment Schedule'],
      'Legal & Compliance': ['Contract Review Memo', 'Compliance Audit Report', 'Policy Update Document', 'Regulatory Filing', 'Risk Assessment', 'NDA Processing', 'IP Protection Filing', 'Employment Agreement', 'Vendor Agreement Review', 'Privacy Impact Assessment', 'Litigation Status Report', 'License Renewal Tracker'],
      'Human Resources': ['Hiring Pipeline Report', 'Compensation Analysis', 'Performance Review Summary', 'Training Completion Report', 'Employee Engagement Survey', 'Onboarding Checklist', 'Benefits Administration', 'Org Chart Update', 'Headcount Planning', 'Turnover Analysis', 'DEI Metrics Report', 'Policy Handbook Update'],
      'Operations': ['Process Efficiency Report', 'Vendor Performance Scorecard', 'Capacity Planning Model', 'Quality Metrics Dashboard', 'Incident Response Log', 'SLA Compliance Report', 'Resource Allocation Plan', 'Workflow Optimization Analysis', 'Inventory Status Report', 'Facilities Management Log', 'Business Continuity Plan', 'Operational Cost Analysis'],
      'Product Management': ['Product Roadmap', 'Feature Prioritization Matrix', 'User Research Summary', 'Sprint Planning Doc', 'Release Notes', 'Competitive Feature Analysis', 'Customer Feedback Synthesis', 'PRD (Product Requirements)', 'A/B Test Results', 'Usage Analytics Report', 'Technical Debt Assessment', 'Product Strategy Brief'],
      'Engineering & Tech': ['Sprint Velocity Report', 'Code Review Summary', 'Architecture Decision Record', 'Technical Debt Log', 'Incident Post-Mortem', 'Security Audit Report', 'API Documentation', 'Deployment Checklist', 'Performance Benchmark', 'Infrastructure Cost Analysis', 'Tech Stack Evaluation', 'Bug Triage Report'],
      'Customer Success': ['Customer Health Score', 'Churn Risk Analysis', 'Onboarding Progress Report', 'NPS Survey Results', 'Support Ticket Analysis', 'Expansion Opportunity Report', 'Customer Journey Map', 'Success Playbook', 'Renewal Forecast', 'Case Study Draft', 'Product Adoption Report', 'Escalation Summary'],
      'IT & Infrastructure': ['System Uptime Report', 'Security Incident Log', 'Access Control Audit', 'Backup Status Report', 'License Compliance', 'IT Asset Inventory', 'Help Desk Metrics', 'Network Performance Report', 'Cloud Cost Analysis', 'Disaster Recovery Test', 'Software Update Schedule', 'Vendor SLA Report'],
      'Research & Development': ['Research Progress Report', 'Patent Application Draft', 'Literature Review Summary', 'Experiment Results', 'Innovation Pipeline', 'Technology Assessment', 'Prototype Documentation', 'Grant Application', 'Collaboration Agreement', 'IP Portfolio Review', 'R&D Budget Analysis', 'Technical Feasibility Study'],
    };

    const items = deliverablesByDept[deptName] || deliverablesByDept['Operations'];

    return items.map((name, i) => {
      const isAI = Math.random() * 100 < aiPct;
      const isFrac = !isAI && Math.random() > 0.5;
      return {
        name,
        type: types[i % types.length],
        freq: freqs[i % freqs.length],
        owner: isAI ? 'AI-Owned' : (isFrac ? 'Fractional+AI' : 'Human-Owned'),
        complexity: complexities[i % complexities.length],
        downstream: downstreams[i % downstreams.length],
      };
    });
  };

  // Parse and render deliverable map
  const renderDeliverableMap = (md: string) => {
    if (!md) return null;

    const sections = md.split(/^## /m).filter(s => s.trim());
    let totalDeliverables = 0;

    const renderedSections = sections.map((section, idx) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();

      if (title === 'SUMMARY') {
        return (
          <div key={idx} className="bg-white rounded-xl border-2 border-amber-500 p-6 mt-6" style={{ background: theme === 'dark' ? '#131929' : undefined }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm">📊</span>
              Deliverable Map Summary
            </h3>
            {renderTable(lines.slice(1).join('\n'), true)}
          </div>
        );
      }

      const dept = DEPARTMENTS.find(d => title.toLowerCase().includes(d.name.toLowerCase().split('/')[0].trim()));
      const tableLines = lines.slice(1).join('\n');
      const rowCount = (tableLines.match(/^\|[^-]/gm) || []).length - 1;
      if (rowCount > 0) totalDeliverables += rowCount;

      return (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 mb-5" style={{ background: theme === 'dark' ? '#131929' : undefined }}>
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm">{dept?.icon || '📁'}</span>
            {title}
            <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {rowCount > 0 ? `${rowCount} deliverables` : ''}
            </span>
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            {renderTable(tableLines)}
          </div>
        </div>
      );
    });

    return (
      <>
        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Master Deliverable Map Generated</div>
            <div className="text-base font-bold text-slate-900">{totalDeliverables}+ deliverables mapped across {selectedDepts.size} departments</div>
          </div>
          <button
            onClick={() => setCurrentPage('p3')}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors"
          >
            Continue to AI/Human Layer →
          </button>
        </div>
        {renderedSections}
      </>
    );
  };

  const renderTable = (md: string, isSummary = false) => {
    const tableMatch = md.match(/\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)+)/);
    if (!tableMatch) return null;

    const headers = tableMatch[1].split('|').map(h => h.trim()).filter(Boolean);
    const rows = tableMatch[2].trim().split('\n').map(r => r.split('|').map(c => c.trim()).filter(Boolean));

    return (
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-amber-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-amber-800 border-b-2 border-amber-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50 transition-colors">
              {row.map((cell, ci) => {
                const lo = cell.toLowerCase();
                let content: React.ReactNode = cell;

                if (lo === 'ai-owned' || lo === 'ai owned') {
                  content = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">⚡ AI-Owned</span>;
                } else if (lo === 'human-owned' || lo === 'human owned') {
                  content = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">👤 Human</span>;
                } else if (lo.includes('fractional')) {
                  content = <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">⚖ Frac+AI</span>;
                }

                return (
                  <td key={ci} className="px-3 py-2.5 border-b border-slate-100 text-slate-600">
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Compute metrics
  const metrics = {
    revenue: venture.revenue?.split(' ')[0] || '—',
    human: venture.headcount || '—',
    ai: venture.aiFte || '—',
    ratio: venture.headcount && venture.aiFte
      ? (parseInt(venture.aiFte) / parseInt(venture.headcount)).toFixed(1) + 'x'
      : '—',
  };

  return (
    <div className={cn('min-h-screen', theme === 'dark' ? 'bg-[#0B0F1A] text-[#F1F5FF]' : 'bg-[#F0F2F8] text-[#111827]')}>
      {/* Top Bar */}
      <div className="h-14 bg-[#1B2444] border-b-2 border-amber-500 flex items-center justify-between px-5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/venture-os" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="font-serif text-xl font-bold text-white">
            Company <span className="text-amber-500">OS™</span>
          </div>
          <div className="font-mono text-[9px] font-medium tracking-widest text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-1 rounded">
            INTELLIGENT VENTURE ENGINE
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">
            Venture: <span className="text-white font-semibold">{venture.name || 'Not Started'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-white/10 text-slate-300 border border-white/10 hover:bg-white/20 transition-colors"
          >
            {theme === 'light' ? '☀ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => setCurrentPage('p1')}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> New Venture
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Side Nav */}
        <nav className="w-56 bg-[#1B2444] border-r border-white/5 min-h-[calc(100vh-56px)] flex flex-col">
          <div className="font-mono text-[9px] font-medium tracking-widest uppercase text-slate-500 px-4 pt-4 pb-2">
            Company OS™ Sequence
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as PageId)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-left border-l-[3px] transition-all',
                currentPage === item.id
                  ? 'bg-amber-500/10 border-l-amber-500'
                  : 'border-l-transparent hover:bg-white/5',
                item.status === 'lock' && 'opacity-50'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold',
                currentPage === item.id ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'
              )}>
                {item.num}
              </div>
              <div className="flex-1">
                <div className={cn('text-sm font-semibold', currentPage === item.id ? 'text-white' : 'text-slate-400')}>
                  {item.title}
                </div>
                <div className={cn('text-xs', currentPage === item.id ? 'text-amber-300' : 'text-slate-600')}>
                  {item.sub}
                </div>
              </div>
              <div className={cn(
                'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase',
                item.status === 'live' && 'bg-green-500/15 text-green-400 border border-green-500/30',
                item.status === 'soon' && 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
                item.status === 'lock' && 'bg-white/5 text-slate-600 border border-white/10'
              )}>
                {item.status === 'live' ? 'Live' : item.status === 'soon' ? 'Soon' : 'Q2'}
              </div>
            </button>
          ))}

          <div className="h-px bg-white/5 mx-4 my-2" />
          <div className="font-mono text-[9px] font-medium tracking-widest uppercase text-slate-500 px-4 pt-2 pb-2">
            Outputs
          </div>

          <button
            onClick={() => setCurrentPage('bp')}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-left border-l-[3px] transition-all',
              currentPage === 'bp' ? 'bg-amber-500/10 border-l-amber-500' : 'border-l-transparent hover:bg-white/5'
            )}
          >
            <div className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold',
              currentPage === 'bp' ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'
            )}>
              ✦
            </div>
            <div className="flex-1">
              <div className={cn('text-sm font-semibold', currentPage === 'bp' ? 'text-white' : 'text-slate-400')}>
                Business Plan
              </div>
              <div className={cn('text-xs', currentPage === 'bp' ? 'text-amber-300' : 'text-slate-600')}>
                VC-ready compilation
              </div>
            </div>
            <div className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-500/15 text-green-400 border border-green-500/30">
              Live
            </div>
          </button>

          <div className="mt-auto p-4 border-t border-white/5">
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">OS Completion</div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs font-semibold text-amber-400 text-right mt-1">{progress}% Complete</div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={cn('flex-1 overflow-y-auto p-8', theme === 'dark' ? 'bg-[#0B0F1A]' : 'bg-[#F0F2F8]')} style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {/* Phase 1: Venture Brief */}
          {currentPage === 'p1' && (
            <div>
              <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-200">
                <div>
                  <div className="font-mono text-[10px] font-medium tracking-widest uppercase text-amber-600 mb-2">Phase 1 of 6 · Foundation</div>
                  <h1 className="text-3xl font-bold mb-2">Venture Brief</h1>
                  <p className="text-slate-600 max-w-2xl leading-relaxed">
                    Your company's identity, mission, and AI-first architecture live here.<br /><br />
                    Every downstream output — the Deliverable Map, AI/Human Assignment Layer, Org Architecture, SOP Library, and final Business Plan — is derived entirely from what you define in this brief.<br /><br />
                    <strong>Fill it once. Every tool in the Company OS™ sequence uses it automatically.</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={loadDemoData} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">
                    ⚡ Demo Data
                  </button>
                  <button onClick={saveVentureBrief} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors">
                    Save & Continue →
                  </button>
                </div>
              </div>

              {/* Metrics Bar */}
              {(venture.revenue || venture.headcount || venture.aiFte) && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
                    <div className="font-serif text-2xl font-bold text-amber-700">{metrics.revenue}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Revenue Target</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className="font-serif text-2xl font-bold">{metrics.human}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Human FTEs</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className="font-serif text-2xl font-bold">{metrics.ai}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">AI Equiv. FTEs</div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className="font-serif text-2xl font-bold">{metrics.ratio}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">AI/Human Ratio</div>
                  </div>
                </div>
              )}

              {/* Company Identity Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">🏢</span>
                  Company Identity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Company Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={venture.name}
                      onChange={(e) => updateVenture('name', e.target.value)}
                      placeholder="e.g. ClearPath AI"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Industry <span className="text-amber-500">*</span>
                    </label>
                    <select
                      value={venture.industry}
                      onChange={(e) => updateVenture('industry', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select industry...</option>
                      <option>Healthcare / MedTech</option>
                      <option>Fintech / Financial Services</option>
                      <option>B2B SaaS</option>
                      <option>AI / Machine Learning</option>
                      <option>HR Tech</option>
                      <option>Sales & Revenue Ops</option>
                      <option>Supply Chain / Logistics</option>
                      <option>Real Estate / PropTech</option>
                      <option>Education / EdTech</option>
                      <option>Professional Services</option>
                      <option>Manufacturing</option>
                      <option>Defense / Gov Contracting</option>
                      <option>Retail / eCommerce</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Company Stage <span className="text-amber-500">*</span>
                    </label>
                    <select
                      value={venture.stage}
                      onChange={(e) => updateVenture('stage', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select stage...</option>
                      <option>Pre-Seed / Idea Stage</option>
                      <option>Seed / Pre-Revenue</option>
                      <option>Seed / Early Revenue</option>
                      <option>Series A</option>
                      <option>Series B+</option>
                      <option>Bootstrapped / Profitable</option>
                      <option>Established / Scaling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Business Model</label>
                    <select
                      value={venture.model}
                      onChange={(e) => updateVenture('model', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select model...</option>
                      <option>B2B SaaS (Subscription)</option>
                      <option>B2B Services / Consulting</option>
                      <option>B2C SaaS</option>
                      <option>Marketplace</option>
                      <option>Transaction / Usage-Based</option>
                      <option>Hybrid (SaaS + Services)</option>
                      <option>Product + Licensing</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Primary Value Proposition <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      value={venture.value}
                      onChange={(e) => updateVenture('value', e.target.value)}
                      rows={3}
                      placeholder="What specific problem do you solve, for whom, and what measurable outcome do customers achieve?"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 resize-y"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Target Customer (ICP)</label>
                    <input
                      type="text"
                      value={venture.customer}
                      onChange={(e) => updateVenture('customer', e.target.value)}
                      placeholder="e.g. Mid-market hospital systems, 250–2,000 beds, CFO / VP Revenue Cycle as economic buyer"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Scale & AI Architecture Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">📊</span>
                  Scale & AI Architecture
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">3-Year Revenue Target</label>
                    <input
                      type="text"
                      value={venture.revenue}
                      onChange={(e) => updateVenture('revenue', e.target.value)}
                      placeholder="e.g. $50M ARR"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Average Contract Value</label>
                    <input
                      type="text"
                      value={venture.acv}
                      onChange={(e) => updateVenture('acv', e.target.value)}
                      placeholder="e.g. $180,000 / year"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Human Headcount — Year 1</label>
                    <input
                      type="number"
                      value={venture.headcount}
                      onChange={(e) => updateVenture('headcount', e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">AI Equivalent FTEs — Year 1</label>
                    <input
                      type="number"
                      value={venture.aiFte}
                      onChange={(e) => updateVenture('aiFte', e.target.value)}
                      placeholder="e.g. 140"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Capital Sought</label>
                    <input
                      type="text"
                      value={venture.capital}
                      onChange={(e) => updateVenture('capital', e.target.value)}
                      placeholder="e.g. $8M Seed Round"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Geographic Focus</label>
                    <input
                      type="text"
                      value={venture.geo}
                      onChange={(e) => updateVenture('geo', e.target.value)}
                      placeholder="e.g. US (Y1–Y2) → Canada + UK (Y3)"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Team & Technology Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">🧠</span>
                  Team & Technology
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Founding Team</label>
                    <textarea
                      value={venture.team}
                      onChange={(e) => updateVenture('team', e.target.value)}
                      rows={2}
                      placeholder="Key founders — domain expertise, notable wins, why this team wins this market"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Primary AI Stack</label>
                    <input
                      type="text"
                      value={venture.aiStack}
                      onChange={(e) => updateVenture('aiStack', e.target.value)}
                      placeholder="e.g. Claude API, ElevenLabs, Deepgram, custom fine-tuned models"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">AI-Owned Functions (Top 3–5)</label>
                    <textarea
                      value={venture.aiFunctions}
                      onChange={(e) => updateVenture('aiFunctions', e.target.value)}
                      rows={3}
                      placeholder="List the functions fully owned and executed by AI..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Human-Owned Functions (Top 3–5)</label>
                    <textarea
                      value={venture.humanFunctions}
                      onChange={(e) => updateVenture('humanFunctions', e.target.value)}
                      rows={3}
                      placeholder="List the functions requiring human judgment or authority..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Moat & Context Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">🏰</span>
                  Moat & Context
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Competitive Moat</label>
                    <textarea
                      value={venture.moat}
                      onChange={(e) => updateVenture('moat', e.target.value)}
                      rows={3}
                      placeholder="What makes this defensible? Proprietary data, network effects, switching costs, regulatory barriers, IP..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Traction & Additional Context</label>
                    <textarea
                      value={venture.context}
                      onChange={(e) => updateVenture('context', e.target.value)}
                      rows={2}
                      placeholder="Current traction, LOIs, partnerships, grants, anything a VC or enterprise buyer needs to know..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 resize-y"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={saveVentureBrief}
                className="w-full py-4 text-base font-bold rounded-lg bg-[#1B2444] text-white hover:bg-[#2a3a5c] transition-colors"
              >
                Save Venture Brief & Continue to Deliverable Map →
              </button>
            </div>
          )}

          {/* Phase 2: Deliverable Map */}
          {currentPage === 'p2' && (
            <div>
              <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-200">
                <div>
                  <div className="font-mono text-[10px] font-medium tracking-widest uppercase text-amber-600 mb-2">Phase 2 of 6 · The Core Asset</div>
                  <h1 className="text-3xl font-bold mb-2">Master Deliverable Map</h1>
                  <p className="text-slate-600 max-w-2xl leading-relaxed">
                    Every output your company must produce — organized by department, assigned to AI or human, and ready to drive every downstream decision.<br /><br />
                    AI generates the full map from your Venture Brief. You review, adjust, and approve. This becomes the <strong>single source of truth</strong> for your org architecture, SOP library, and business plan.<br /><br />
                    This is the document that replaces the org chart.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage('p1')} className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
                    ← Edit Brief
                  </button>
                  <button onClick={() => setCurrentPage('p3')} className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors">
                    Continue to AI/Human Layer →
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-sm text-blue-800 leading-relaxed">
                <strong className="block mb-1">How the Deliverable Map works:</strong>
                Select the departments relevant to your venture, then click Generate. Claude builds your complete deliverable library — every output, report, process, and communication your company must produce.<br /><br />
                Each deliverable is pre-assigned as <strong>AI-Owned</strong>, <strong>Human-Owned</strong>, or <strong>Fractional+AI</strong> based on your Venture Brief inputs and industry context. You can edit any row, add custom deliverables, or reassign ownership.<br /><br />
                This map automatically feeds your Org Architecture, SOP Generator, and Business Plan — you will never re-enter this information again.
              </div>

              {/* Department Selector */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5 shadow-sm">
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-sm">🗂</span>
                  Select Departments (choose all that apply)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => toggleDept(dept.id)}
                      className={cn(
                        'relative text-left p-4 rounded-xl border transition-all',
                        selectedDepts.has(dept.id)
                          ? 'border-amber-500 bg-amber-50 shadow-md'
                          : 'border-slate-200 bg-white hover:shadow-md'
                      )}
                    >
                      {selectedDepts.has(dept.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                          ✓
                        </div>
                      )}
                      <div className="text-xl mb-2">{dept.icon}</div>
                      <div className="text-sm font-bold text-slate-900 mb-1">{dept.name}</div>
                      <div className="text-xs text-slate-500">{dept.count} deliverables · {dept.aiPct}% AI-owned</div>
                      <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dept.aiPct}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Controls */}
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={generateDeliverableMap}
                  disabled={isGenerating}
                  className="px-5 py-2.5 text-sm font-bold rounded-lg bg-[#1B2444] text-white hover:bg-[#2a3a5c] transition-colors disabled:opacity-50"
                >
                  ✦ Generate Deliverable Map
                </button>
                <button
                  onClick={selectAllDepts}
                  className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Select All Departments
                </button>
                {selectedDepts.size > 0 && (
                  <span className="text-sm font-semibold text-slate-500">
                    {selectedDepts.size} department{selectedDepts.size > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              {/* Loading */}
              {isGenerating && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                  <div className="text-sm font-semibold">Generating Master Deliverable Map...</div>
                </div>
              )}

              {/* Output */}
              {mapOutput && renderDeliverableMap(mapOutput)}
            </div>
          )}

          {/* Phase 3-6 and BP: Coming Soon */}
          {['p3', 'p4', 'p5', 'p6', 'bp'].includes(currentPage) && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="text-5xl mb-4 opacity-50">
                {currentPage === 'p3' ? '⚖️' : currentPage === 'p4' ? '🏗️' : currentPage === 'p5' ? '📋' : currentPage === 'p6' ? '🎙️' : '✦'}
              </div>
              <h2 className="font-serif text-2xl font-bold mb-3">
                {currentPage === 'p3' ? 'Coming in Session 3' :
                 currentPage === 'p4' ? 'Coming in Session 4' :
                 currentPage === 'p5' ? 'Coming in Session 5' :
                 currentPage === 'p6' ? 'Coming in Session 6' :
                 'Business Plan Generator'}
              </h2>
              <p className="text-slate-600 max-w-md leading-relaxed mb-6">
                {currentPage === 'p3' && 'The AI/Human Assignment Layer transforms your Deliverable Map into a precise cost architecture. For every deliverable: AI-Owned, Human-Owned, or Fractional+AI — with real cost figures calculated live.'}
                {currentPage === 'p4' && 'The org chart derived from deliverables — not the other way around. Every role is derived from the cluster of deliverables assigned to human owners.'}
                {currentPage === 'p5' && 'Thousands of repeatable processes, on demand — generated from your Deliverable Map in under 60 seconds.'}
                {currentPage === 'p6' && 'Every human in the company — from receptionist to CEO — operating with a dedicated, real-time AI Voice Partner.'}
                {currentPage === 'bp' && 'The full compiled plan — Deliverable Chart replacing the org chart, AI/Human Assignment Map replacing the staffing plan, and Cost-Per-Deliverable ROI replacing the cost center model.'}
              </p>
              <div className="flex flex-col gap-2 max-w-md w-full">
                {currentPage === 'p3' && (
                  <>
                    <div className="flex items-start gap-3 text-sm text-slate-600 bg-white rounded-lg border border-slate-200 p-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      3-way assignment per deliverable: AI / Human / Fractional+AI
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 bg-white rounded-lg border border-slate-200 p-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      Live cost delta calculation vs. traditional staffing
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 bg-white rounded-lg border border-slate-200 p-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      AI Leverage Ratio dashboard — the single most powerful VC metric
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-5 right-5 px-5 py-3 rounded-lg text-sm font-semibold shadow-lg transition-all',
          toast.isError
            ? 'bg-white border-2 border-red-500 text-red-600'
            : 'bg-white border-2 border-green-500 text-green-600'
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
