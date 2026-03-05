import { useState, useRef } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Copy,
  Printer,
  Zap,
  Building2,
  Users,
  Target,
  DollarSign,
  Bot,
  Globe,
  Shield,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Demo data for ClearPath AI
const DEMO_DATA = {
  name: 'ClearPath AI',
  industry: 'Healthcare / MedTech',
  stage: 'Seed / Early Revenue',
  value: `ClearPath AI eliminates revenue leakage in hospital billing by deploying an AI-first Revenue Cycle Management (RCM) system that autonomously handles claims processing, denial prediction, coding audit, and compliance monitoring — reducing billing costs by 70% while capturing 7% more revenue per patient encounter vs. legacy RCM vendors.`,
  customer: 'Mid-to-large hospital systems, 250-2,000 beds; regional health networks and specialty surgical centers',
  revenue: '$50M ARR by Month 36',
  acv: '$180,000 / year',
  headcount: '28',
  aiFte: '140',
  team: `CEO: Former CFO of a 12-hospital regional system, P&L accountability for $2.4B in annual patient revenue. CTO: Former ML Lead at Epic Systems, 14 healthcare NLP patents. COO: Former VP Operations at Optum, scaled $40M to $320M ARR.`,
  aiStack: 'Claude API (document processing, coding audit, denial reasoning), custom healthcare NLP (fine-tuned on 22M claims), ElevenLabs (voice-based coder training), Deepgram (real-time voice capture)',
  aiFunctions: `1. Claims intake, scrubbing & submission (fully autonomous)
2. Denial root-cause analysis & appeal drafting
3. ICD/CPT coding audit against payer rules
4. Real-time compliance monitoring
5. Monthly revenue integrity reporting`,
  humanFunctions: `1. Client relationship management & strategic QBRs
2. Regulatory sign-off on complex multi-payer disputes
3. Hospital onboarding & change management
4. Product roadmap & AI model governance
5. Sales & partnership development`,
  geo: 'United States (Y1-Y2) then Canada + UK (Y3)',
  capital: '$8M Seed Round',
  moat: `1. Proprietary dataset: 22M labeled claims with payer-specific denial patterns — largest private dataset of its kind. 2. Network effects: each new hospital adds denial pattern data, improving accuracy for all. 3. Deep EHR integration (Epic, Cerner, Oracle Health) creates 12-month switching barrier. 4. CMS compliance engine trained on 7 years of rule changes — 18-month lead time to replicate.`,
  context: 'First client: Piedmont Health System (6 hospitals, $890M annual revenue). LOI signed with 3 additional systems. CMS Innovation Center partnership in discussion for value-based care billing pilot.'
};

const INDUSTRIES = [
  'Healthcare / MedTech',
  'Fintech / Financial Services',
  'B2B SaaS',
  'Legal Tech',
  'HR Tech',
  'Sales & Revenue Ops',
  'Supply Chain / Logistics',
  'Real Estate / PropTech',
  'Education / EdTech',
  'Professional Services',
  'Manufacturing',
  'Retail / eCommerce',
  'Other',
];

const STAGES = [
  'Pre-Seed / Idea',
  'Seed / Pre-Revenue',
  'Seed / Early Revenue',
  'Series A',
  'Series B+',
  'Bootstrapped / Profitable',
  'Established / Scaling',
];

interface FormData {
  name: string;
  industry: string;
  stage: string;
  value: string;
  customer: string;
  revenue: string;
  acv: string;
  headcount: string;
  aiFte: string;
  team: string;
  aiStack: string;
  aiFunctions: string;
  humanFunctions: string;
  geo: string;
  capital: string;
  moat: string;
  context: string;
}

type Edition = 'vc' | 'enterprise';
type OutputState = 'empty' | 'loading' | 'plan' | 'prompt';

const LOADING_STEPS = [
  'Analyzing venture architecture',
  'Constructing deliverable map',
  'Calculating AI/Human assignments',
  'Building cost-per-deliverable ROI model',
  'Compiling investor narrative',
];

export default function Sub3A_BusinessPlan() {
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const [edition, setEdition] = useState<Edition>('vc');
  const [outputState, setOutputState] = useState<OutputState>('empty');
  const [planContent, setPlanContent] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: '',
    industry: '',
    stage: '',
    value: '',
    customer: '',
    revenue: '',
    acv: '',
    headcount: '',
    aiFte: '',
    team: '',
    aiStack: '',
    aiFunctions: '',
    humanFunctions: '',
    geo: '',
    capital: '',
    moat: '',
    context: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const loadDemo = () => {
    setForm(DEMO_DATA);
    toast({
      title: 'Demo Data Loaded',
      description: 'ClearPath AI (Healthcare RCM) data loaded successfully.',
    });
  };

  const generatePlan = async () => {
    if (!form.name) {
      toast({
        title: 'Company Name Required',
        description: 'Please enter a company name before generating.',
        variant: 'destructive',
      });
      return;
    }

    setOutputState('loading');
    setIsGenerating(true);
    setLoadingStep(0);

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch('/api/ai/business-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, edition }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate plan');
      }

      const result = await response.json();
      setPlanContent(result.content);
      setOutputState('plan');

      toast({
        title: 'Business Plan Generated',
        description: `${form.name} - ${edition === 'vc' ? 'VC Edition' : 'Enterprise Edition'}`,
      });

      // Scroll to output
      outputRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Generation error:', error);
      setOutputState('empty');
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      clearInterval(stepInterval);
    }
  };

  const generatePrompt = async () => {
    try {
      const response = await fetch('/api/ai/business-plan/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, edition }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const result = await response.json();
      setPromptContent(result.prompt);
      setOutputState('prompt');

      toast({
        title: 'Master Prompt Ready',
        description: 'Copy and use in any LLM of your choice.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate prompt',
        variant: 'destructive',
      });
    }
  };

  const copyOutput = () => {
    const text = outputState === 'plan' ? planContent : promptContent;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to Clipboard' });
  };

  const printOutput = () => {
    const content = renderPlanHtml();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>AI-First Business Plan - ${form.name}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Inter', sans-serif; padding: 48px 64px; color: #0F172A; background: #fff; font-size: 14px; line-height: 1.6; }
              h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
              h2 { font-size: 20px; font-weight: 700; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #E2E8F0; }
              h3 { font-size: 16px; font-weight: 600; margin: 20px 0 10px; }
              p { margin-bottom: 12px; color: #334155; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              th { background: #FEF3C7; color: #92400E; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; padding: 10px 14px; text-align: left; border-bottom: 2px solid #D97706; }
              td { padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #334155; }
              ul, ol { margin: 10px 0 16px 20px; }
              li { margin-bottom: 6px; color: #334155; }
              .badge { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #92400E; margin-bottom: 12px; }
              .tagline { font-size: 15px; color: #64748B; font-style: italic; margin-bottom: 16px; }
              .kpi-row { display: flex; gap: 16px; margin: 20px 0; }
              .kpi { border: 2px solid #E2E8F0; padding: 14px 20px; border-radius: 8px; text-align: center; flex: 1; }
              .kpi:first-child { border-color: #D97706; background: #FEF3C7; }
              .kpi-val { font-size: 24px; font-weight: 700; }
              .kpi-label { font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
              @media print { body { padding: 24px; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  // Convert markdown to HTML for plan output
  const mdToHtml = (md: string): string => {
    // Tables
    let html = md.replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)+)/gm, (_, header, body) => {
      const hs = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map((r: string) => r.split('|').map((c: string) => c.trim()).filter(Boolean));
      let t = '<div class="overflow-x-auto my-4 border border-slate-200 rounded-lg"><table class="w-full text-sm"><thead><tr>';
      hs.forEach((h: string) => t += `<th class="bg-amber-50 text-amber-800 font-semibold text-xs uppercase tracking-wide px-4 py-3 text-left border-b-2 border-amber-500">${h}</th>`);
      t += '</tr></thead><tbody>';
      rows.forEach((row: string[]) => {
        t += '<tr class="hover:bg-slate-50">';
        row.forEach((cell: string) => {
          const lo = cell.toLowerCase();
          let cls = 'px-4 py-3 border-b border-slate-200 text-slate-600';
          if (lo === 'ai' || lo.includes('ai-owned') || lo.includes('ai owned')) cls += ' text-blue-600 font-semibold';
          else if (lo === 'human' || lo.includes('human-owned')) cls += ' text-emerald-600 font-semibold';
          else if (lo.includes('fractional') || lo.includes('frac+ai')) cls += ' text-amber-600 font-semibold';
          else if ((cell.startsWith('$') || cell.includes('%')) && cell.length < 20) cls += ' text-emerald-600 font-semibold';
          t += `<td class="${cls}">${cell}</td>`;
        });
        t += '</tr>';
      });
      t += '</tbody></table></div>';
      return t;
    });

    // Headers
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-slate-200">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-slate-800 mt-5 mb-2">$1</h3>');

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="text-slate-500">$1</em>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<div class="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 my-4 text-slate-700">$1</div>');

    // Lists
    html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-5 text-slate-600 mb-1">$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-5 text-slate-600 mb-1">$1</li>');
    html = html.replace(/(<li.*?<\/li>\s*)+/gs, m => `<ul class="my-3">${m}</ul>`);

    // Paragraphs
    html = html.split('\n\n').map(p => {
      if (p.startsWith('<')) return p;
      const t = p.trim();
      return t ? `<p class="text-slate-600 leading-relaxed mb-4">${t}</p>` : '';
    }).join('\n');

    return html;
  };

  const renderPlanHtml = () => {
    const edLabel = edition === 'vc' ? 'VC / Investor Edition' : 'Enterprise Client Edition';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const ratio = (form.aiFte && form.headcount)
      ? (parseInt(form.aiFte) / parseInt(form.headcount)).toFixed(1)
      : '5.0';

    const masthead = `
      <div class="border-b-2 border-amber-500 pb-6 mb-8">
        <div class="badge">AI-FIRST BUSINESS PLAN - ${edLabel.toUpperCase()} - COMPANY OS BY REPEATABLE AI</div>
        <h1>${form.name}</h1>
        <div class="tagline">${(form.value || '').split('.')[0]}.</div>
        <div class="flex flex-wrap gap-2 mt-4">
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">${form.stage}</span>
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-300">${form.industry}</span>
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-300">${form.geo || 'United States'}</span>
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">${form.capital}</span>
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-300">${date}</span>
        </div>
      </div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-val">${(form.revenue || '$50M').split(' ')[0]}</div><div class="kpi-label">Revenue Target (Y3)</div></div>
        <div class="kpi"><div class="kpi-val">${form.headcount || '28'}</div><div class="kpi-label">Human Headcount (Y1)</div></div>
        <div class="kpi"><div class="kpi-val">${form.aiFte || '140'}</div><div class="kpi-label">AI Equivalent FTEs</div></div>
        <div class="kpi"><div class="kpi-val">${ratio}x</div><div class="kpi-label">AI / Human Leverage</div></div>
      </div>
    `;

    return masthead + mdToHtml(planContent);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Form */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-slate-200">
            <Link
              href="/venture-os"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Venture OS
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Venture Brief</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Phase 1 of 6 - Company OS Sequence</p>
              </div>
            </div>
          </div>

          {/* Edition Toggle */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setEdition('vc')}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-semibold transition-colors',
                  edition === 'vc'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                VC Edition
              </button>
              <button
                onClick={() => setEdition('enterprise')}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-semibold transition-colors',
                  edition === 'enterprise'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                Enterprise
              </button>
            </div>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Company Name <span className="text-amber-600">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="e.g. ClearPath AI"
              />
            </div>

            {/* Industry & Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Industry <span className="text-amber-600">*</span>
                </Label>
                <Select value={form.industry} onValueChange={v => updateField('industry', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Stage <span className="text-amber-600">*</span>
                </Label>
                <Select value={form.stage} onValueChange={v => updateField('stage', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Primary Value Proposition <span className="text-amber-600">*</span>
              </Label>
              <Textarea
                value={form.value}
                onChange={e => updateField('value', e.target.value)}
                placeholder="What specific problem does your venture solve and for whom?"
                rows={3}
              />
            </div>

            {/* Target Customer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Target Customer
              </Label>
              <Input
                value={form.customer}
                onChange={e => updateField('customer', e.target.value)}
                placeholder="e.g. Mid-market hospital systems, 250-2,000 beds"
              />
            </div>

            {/* Revenue & ACV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  3-Year Revenue Target
                </Label>
                <Input
                  value={form.revenue}
                  onChange={e => updateField('revenue', e.target.value)}
                  placeholder="e.g. $50M ARR"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Avg Contract Value
                </Label>
                <Input
                  value={form.acv}
                  onChange={e => updateField('acv', e.target.value)}
                  placeholder="e.g. $180K/yr"
                />
              </div>
            </div>

            {/* Headcount & AI FTE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Human Headcount (Yr 1)
                </Label>
                <Input
                  type="number"
                  value={form.headcount}
                  onChange={e => updateField('headcount', e.target.value)}
                  placeholder="e.g. 28"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  AI Equivalent FTEs
                </Label>
                <Input
                  type="number"
                  value={form.aiFte}
                  onChange={e => updateField('aiFte', e.target.value)}
                  placeholder="e.g. 140"
                />
              </div>
            </div>

            {/* Founding Team */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Founding Team
              </Label>
              <Textarea
                value={form.team}
                onChange={e => updateField('team', e.target.value)}
                placeholder="Key founders - background, domain expertise, notable wins"
                rows={2}
              />
            </div>

            {/* Divider - AI Architecture */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI Architecture
                </span>
              </div>
            </div>

            {/* AI Stack */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Primary AI Stack
              </Label>
              <Input
                value={form.aiStack}
                onChange={e => updateField('aiStack', e.target.value)}
                placeholder="e.g. Claude API, ElevenLabs, custom ML models"
              />
            </div>

            {/* AI Functions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Key AI-Owned Functions
              </Label>
              <Textarea
                value={form.aiFunctions}
                onChange={e => updateField('aiFunctions', e.target.value)}
                placeholder="Top 3-5 functions fully owned by AI"
                rows={2}
              />
            </div>

            {/* Human Functions */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Key Human-Owned Functions
              </Label>
              <Textarea
                value={form.humanFunctions}
                onChange={e => updateField('humanFunctions', e.target.value)}
                placeholder="Top 3-5 functions requiring human judgment"
                rows={2}
              />
            </div>

            {/* Divider - Go-to-Market */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Go-to-Market
                </span>
              </div>
            </div>

            {/* Geo & Capital */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Geographic Focus
                </Label>
                <Input
                  value={form.geo}
                  onChange={e => updateField('geo', e.target.value)}
                  placeholder="e.g. US then North America Y2"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Capital Sought
                </Label>
                <Input
                  value={form.capital}
                  onChange={e => updateField('capital', e.target.value)}
                  placeholder="e.g. $8M Seed"
                />
              </div>
            </div>

            {/* Competitive Moat */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Competitive Moat
              </Label>
              <Textarea
                value={form.moat}
                onChange={e => updateField('moat', e.target.value)}
                placeholder="What makes this defensible? Data, IP, network effects, switching costs?"
                rows={2}
              />
            </div>

            {/* Additional Context */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Additional Context
              </Label>
              <Textarea
                value={form.context}
                onChange={e => updateField('context', e.target.value)}
                placeholder="Traction, partnerships, key IP, anything critical..."
                rows={2}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-5 py-4 border-t border-slate-200 space-y-3">
            <Button
              onClick={generatePlan}
              disabled={isGenerating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate AI-First Business Plan'}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={generatePrompt}
                variant="outline"
                className="w-full text-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Get Master Prompt
              </Button>
              <Button
                onClick={loadDemo}
                variant="outline"
                className="w-full text-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Load Demo Data
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 flex flex-col bg-white" ref={outputRef}>
          {/* Output Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {outputState === 'empty' && 'Awaiting Generation'}
              {outputState === 'loading' && `Generating - ${form.name}`}
              {outputState === 'plan' && `${form.name} - AI-First Business Plan`}
              {outputState === 'prompt' && 'Master Prompt Ready'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyOutput}
                disabled={outputState === 'empty' || outputState === 'loading'}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printOutput}
                disabled={outputState !== 'plan'}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print / PDF
              </Button>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Empty State */}
            {outputState === 'empty' && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-5xl text-slate-200 mb-4">
                  <Layers className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your AI-First Business Plan</h2>
                <p className="text-slate-500 max-w-md mb-6">
                  Complete the Venture Brief to generate a VC-ready plan built on the new paradigm -
                  Deliverable Charts, AI/Human Assignment Maps, and Cost-Per-Deliverable ROI.
                </p>
                <div className="space-y-3 text-left">
                  {[
                    'Click Load Demo Data or fill in your venture',
                    'Select VC or Enterprise edition above',
                    'Generate - Claude builds your plan live',
                    'Or grab the Master Prompt for any LLM',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {outputState === 'loading' && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-6" />
                <p className="text-lg font-semibold text-slate-900 mb-4">Building your AI-First Business Plan...</p>
                <div className="space-y-2">
                  {LOADING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3 text-sm transition-colors',
                        i < loadingStep ? 'text-emerald-600' :
                        i === loadingStep ? 'text-slate-900 font-medium' :
                        'text-slate-400'
                      )}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        i < loadingStep ? 'bg-emerald-500' :
                        i === loadingStep ? 'bg-amber-500' :
                        'bg-slate-300'
                      )} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan Output */}
            {outputState === 'plan' && (
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPlanHtml() }}
              />
            )}

            {/* Prompt Output */}
            {outputState === 'prompt' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Master Prompt - Copy & Use in Any LLM
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(promptContent);
                      toast({ title: 'Copied to Clipboard' });
                    }}
                    className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
                <pre className="font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {promptContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
