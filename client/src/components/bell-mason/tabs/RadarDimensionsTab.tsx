import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

interface DiagnosticQuestion {
  question: string;
  answer: 'YES' | 'NO' | 'UNKNOWN' | 'PARTIALLY';
  evidence: string;
  sourceIds: string[];
  dataGap: boolean;
}

interface DimensionScore {
  dimension: string;
  category: 'operational' | 'market' | 'managerial' | 'financial';
  score: number;
  ideal: number;
  status: 'AHEAD' | 'ON_TRACK' | 'SLIGHT_GAP' | 'GAP' | 'CRITICAL_GAP';
  narrative: string;
  diagnosticQuestions: DiagnosticQuestion[];
}

interface RadarDimensionsTabProps {
  dimensions: DimensionScore[];
  overallScore: number;
}

// Category colors
const CATEGORY_COLORS = {
  operational: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', fill: '#C5985E' },
  market: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', fill: '#5094D8' },
  managerial: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', fill: '#28B47E' },
  financial: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', fill: '#D44434' },
};

// Status colors and labels
const STATUS_CONFIG = {
  AHEAD: { color: 'bg-green-500', textColor: 'text-green-700', label: 'Ahead' },
  ON_TRACK: { color: 'bg-green-400', textColor: 'text-green-600', label: 'On Track' },
  SLIGHT_GAP: { color: 'bg-yellow-400', textColor: 'text-yellow-700', label: 'Slight Gap' },
  GAP: { color: 'bg-orange-500', textColor: 'text-orange-700', label: 'Gap' },
  CRITICAL_GAP: { color: 'bg-red-500', textColor: 'text-red-700', label: 'Critical Gap' },
};

// Answer indicator colors
const ANSWER_CONFIG = {
  YES: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  NO: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  UNKNOWN: { icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  PARTIALLY: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
};

// Dimension display names
const DIMENSION_LABELS: Record<string, string> = {
  technology: 'Technology',
  product: 'Product',
  manufacturing: 'Manufacturing/Delivery',
  businessPlan: 'Business Plan',
  marketing: 'Marketing',
  sales: 'Sales',
  ceo: 'CEO/Leadership',
  team: 'Team',
  board: 'Board',
  cash: 'Cash',
  fundability: 'Fundability',
  control: 'Control',
};

// SVG Radar Chart Component
function RadarChart({ dimensions }: { dimensions: DimensionScore[] }) {
  const size = 580;  // Large enough for full dimension labels including "Manufacturing/Delivery"
  const center = size / 2;  // 290
  const radius = 130;  // Chart size
  const levels = 5;

  // Calculate points for each dimension
  const angleStep = (2 * Math.PI) / dimensions.length;
  const startAngle = -Math.PI / 2; // Start from top

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate radar polygon points for scores
  const scorePoints = dimensions.map((d, i) => getPoint(i, d.score));
  const scorePolygon = scorePoints.map(p => `${p.x},${p.y}`).join(' ');

  // Generate radar polygon points for ideals
  const idealPoints = dimensions.map((d, i) => getPoint(i, d.ideal));
  const idealPolygon = idealPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Generate level circles/polygons
  const levelPolygons = Array.from({ length: levels }, (_, levelIndex) => {
    const levelValue = (levelIndex + 1) * 2;
    const points = dimensions.map((_, i) => getPoint(i, levelValue));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[580px] mx-auto">
      {/* Grid levels */}
      {levelPolygons.map((polygon, i) => (
        <polygon
          key={i}
          points={polygon}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {dimensions.map((d, i) => {
        const endpoint = getPoint(i, 10);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Ideal polygon (dashed) */}
      <polygon
        points={idealPolygon}
        fill="rgba(100, 100, 100, 0.1)"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Score polygon */}
      <polygon
        points={scorePolygon}
        fill="rgba(197, 152, 94, 0.3)"
        stroke="#C5985E"
        strokeWidth="2"
      />

      {/* Score points */}
      {scorePoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="5"
          fill={CATEGORY_COLORS[dimensions[i].category].fill}
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* Dimension labels */}
      {dimensions.map((d, i) => {
        const labelPoint = getPoint(i, 13);  // Distance for labels outside the chart
        const textAnchor = labelPoint.x < center - 10 ? 'end' : labelPoint.x > center + 10 ? 'start' : 'middle';
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="text-[11px] font-medium fill-gray-600"
          >
            {DIMENSION_LABELS[d.dimension] || d.dimension}
          </text>
        );
      })}
    </svg>
  );
}

// Score Ring Component
function ScoreRing({ score, ideal, size = 60 }: { score: number; ideal: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (score / 10) * circumference;
  const idealOffset = circumference - (ideal / 10) * circumference;

  const scoreColor = score >= ideal ? '#22c55e' : score >= ideal - 1 ? '#eab308' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Ideal indicator (dashed) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray={`${(ideal / 10) * circumference} ${circumference}`}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* Score */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={scoreOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{score}</span>
      </div>
    </div>
  );
}

export default function RadarDimensionsTab({ dimensions, overallScore }: RadarDimensionsTabProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  // Defensive: ensure dimensions array exists and has items
  const safeDimensions = Array.isArray(dimensions) && dimensions.length > 0 ? dimensions : [];
  const hasDimensions = safeDimensions.length > 0;

  // Group dimensions by category
  const groupedDimensions = {
    operational: safeDimensions.filter(d => d.category === 'operational'),
    market: safeDimensions.filter(d => d.category === 'market'),
    managerial: safeDimensions.filter(d => d.category === 'managerial'),
    financial: safeDimensions.filter(d => d.category === 'financial'),
  };

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">12-Dimension Radar</CardTitle>
            {hasDimensions && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-[3px] bg-[#C5985E] rounded"></div>
                  <span className="text-muted-foreground">Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="24" height="3" className="overflow-visible">
                    <line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                  <span className="text-muted-foreground">Ideal</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasDimensions ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RadarChart dimensions={safeDimensions} />
              <div className="flex-1 space-y-4">
                {/* Overall Score */}
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-4xl font-bold">{overallScore}</span>
                    <span className="text-lg text-muted-foreground">/ 100</span>
                  </div>
                </div>
                {/* Category Legend */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#C5985E]"></div>
                    <span>Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5094D8]"></div>
                    <span>Market</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#28B47E]"></div>
                    <span>Managerial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D44434]"></div>
                    <span>Financial</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Dimension data was not generated properly. This may be due to insufficient research data or an API issue.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try running the diagnostic again with more detailed venture information.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimension Cards by Category - only show if we have dimensions */}
      {hasDimensions && Object.entries(groupedDimensions).map(([category, dims]) => (
        dims.length > 0 && (
          <div key={category} className="space-y-3">
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS].text}`}>
              {category} Dimensions
            </h3>
            <div className="space-y-3">
              {dims.map((dim, idx) => {
              const statusConfig = STATUS_CONFIG[dim.status];
              return (
                <Card
                  key={`${dim.dimension}-${idx}`}
                  className={`${CATEGORY_COLORS[dim.category].bg} ${CATEGORY_COLORS[dim.category].border} border`}
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`${dim.dimension}-${idx}`} className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                          <ScoreRing score={dim.score} ideal={dim.ideal} size={50} />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {DIMENSION_LABELS[dim.dimension] || dim.dimension}
                              </span>
                              <Badge className={`${statusConfig.color} text-white text-xs`}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Score: {dim.score} / Ideal: {dim.ideal}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {/* Narrative */}
                        <div className="mb-4 text-sm text-muted-foreground whitespace-pre-wrap">
                          {dim.narrative}
                        </div>

                        {/* Diagnostic Questions */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold">Diagnostic Questions</h4>
                          {dim.diagnosticQuestions.map((q, i) => {
                            const answerConfig = ANSWER_CONFIG[q.answer];
                            const AnswerIcon = answerConfig.icon;
                            return (
                              <div
                                key={i}
                                className={`p-3 rounded-lg ${answerConfig.bg} border border-gray-200`}
                              >
                                <div className="flex items-start gap-3">
                                  <AnswerIcon className={`w-5 h-5 ${answerConfig.color} flex-shrink-0 mt-0.5`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{q.question}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {q.evidence}
                                    </p>
                                    {q.sourceIds.length > 0 && (
                                      <div className="flex items-center gap-1 mt-2">
                                        {q.sourceIds.map((id, srcIdx) => (
                                          <Badge key={`${id}-${srcIdx}`} variant="outline" className="text-xs">
                                            [{id}]
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    {q.dataGap && (
                                      <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-300">
                                        DATA GAP
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              );
            })}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
