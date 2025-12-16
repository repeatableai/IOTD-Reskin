import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import { ArrowLeft, TrendingUp, Calendar, BarChart3, Search, ExternalLink, Loader2, RefreshCw, DollarSign, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRENDING_TOPICS } from "./trends";

// Type for trend data from API
interface TrendDataPoint {
  date: string;
  value: number;
  searches: number;
}

interface TrendData {
  keyword: string;
  timelineData: TrendDataPoint[];
  averageValue: number;
  peakValue: number;
  peakDate: string;
  currentValue: number;
  growthRate: number;
  currentVolume: number;
  maxVolume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  competitionScore: number;
}

type TimeRange = '6m' | '1y' | '2y' | 'all';

// Interactive Area Chart with hover tooltips
const InteractiveAreaChart = ({ 
  data, 
  color = "#22c55e",
  timeRange
}: { 
  data: TrendDataPoint[], 
  color?: string,
  timeRange: TimeRange
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const width = 900;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values) * 1.1;
  const range = max - min || 1;
  
  const points = data.map((d, index) => {
    const x = padding.left + (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
    return { x, y, ...d };
  });
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `M ${padding.left} ${height - padding.bottom} ${linePath} L ${width - padding.right} ${height - padding.bottom} Z`;
  
  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => min + (range * i) / (yTicks - 1));
  
  // Determine which x-axis labels to show based on data length
  const getXAxisLabels = () => {
    if (data.length <= 12) return points; // Show all for 6m/1y
    // For 2y/all, show every few labels
    const step = Math.ceil(data.length / 12);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
  };
  
  const xLabels = getXAxisLabels();

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = width / rect.width;
    const scaledMouseX = mouseX * scaleX;
    
    // Find closest point
    let closestIdx = 0;
    let closestDist = Infinity;
    
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - scaledMouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    
    if (closestDist < 40) {
      setHoveredPoint(closestIdx);
      setTooltipPos({ x: points[closestIdx].x, y: points[closestIdx].y });
    } else {
      setHoveredPoint(null);
      setTooltipPos(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative">
      <svg 
        ref={svgRef}
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredPoint(null); setTooltipPos(null); }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {yTickValues.map((tick, i) => {
          const y = padding.top + chartHeight - ((tick - min) / range) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {Math.round(tick)}
              </text>
            </g>
          );
        })}
        
        {/* Hover line */}
        {hoveredPoint !== null && tooltipPos && (
          <line
            x1={tooltipPos.x}
            x2={tooltipPos.x}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke={color}
            strokeDasharray="4 4"
            strokeOpacity="0.5"
          />
        )}
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />
        
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoveredPoint === i ? 8 : 5} 
              fill={color}
              filter={hoveredPoint === i ? "url(#glow)" : undefined}
              className="transition-all duration-150"
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoveredPoint === i ? 4 : 3} 
              fill="white" 
            />
          </g>
        ))}
        
        {/* X-axis labels */}
        {xLabels.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - padding.bottom + 25}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {p.date.replace(' 20', "'")}
          </text>
        ))}
      </svg>
      
      {/* Tooltip */}
      {hoveredPoint !== null && tooltipPos && data[hoveredPoint] && (
        <div 
          className="absolute bg-popover border rounded-lg shadow-lg p-3 pointer-events-none z-50 min-w-[160px]"
          style={{
            left: `${(tooltipPos.x / width) * 100}%`,
            top: `${(tooltipPos.y / height) * 100 - 20}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-sm font-semibold mb-1">{data[hoveredPoint].date}</div>
          <div className="text-xs text-muted-foreground mb-2">Search Interest</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold text-lg">{data[hoveredPoint].value}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="text-xs text-muted-foreground border-t pt-1 mt-1">
            Est. Searches: <span className="font-medium text-foreground">{formatNumber(data[hoveredPoint].searches)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TrendDetail() {
  const { id } = useParams<{ id: string }>();
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  // Find the trend by ID
  const trend = TRENDING_TOPICS.find(t => t.id === id);

  // Fetch trend data
  const fetchData = async (range: TimeRange = timeRange) => {
    if (!trend) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/google-trends/keyword?keyword=${encodeURIComponent(trend.title)}&growth=${trend.growthNum}&timeRange=${range}`
      );
      if (response.ok) {
        const data = await response.json();
        setTrendData(data);
      }
    } catch (err) {
      console.error("Error fetching trend data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trend?.id]);
  
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    fetchData(range);
  };
  
  if (!trend) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Trend Not Found</h1>
          <p className="text-muted-foreground mb-6">The trend you're looking for doesn't exist.</p>
          <Link href="/trends">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trends
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Use fetched stats if available
  const displayGrowth = trendData ? `${trendData.growthRate >= 0 ? '+' : ''}${trendData.growthRate}%` : trend.growth;
  const displayGrowthNum = trendData?.growthRate ?? trend.growthNum;
  
  const getGrowthColor = (growth: number) => {
    if (growth >= 100) return "text-green-600";
    if (growth >= 50) return "text-green-500";
    if (growth >= 0) return "text-emerald-500";
    return "text-red-500";
  };
  
  const getCompetitionColor = (level: string) => {
    if (level === 'low') return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (level === 'medium') return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const timeRangeLabel = {
    '6m': '6 Months',
    '1y': '1 Year',
    '2y': '2 Years',
    'all': 'All Time (5Y)'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/trends">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Trends
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{trend.title}</h1>
                {isLoading && (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {trendData ? formatNumber(trendData.currentVolume) : trend.volume} monthly searches
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${getGrowthColor(displayGrowthNum)}`} />
                  <span className={getGrowthColor(displayGrowthNum)}>{displayGrowth} growth</span>
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Filters */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground mr-2">Time Range:</span>
          {(['6m', '1y', '2y', 'all'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
              disabled={isLoading}
            >
              {timeRangeLabel[range]}
            </Button>
          ))}
        </div>

        {/* Main Chart Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: trend.color }} />
              Search Volume Trend ({timeRangeLabel[timeRange]})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData?.timelineData ? (
              <InteractiveAreaChart 
                data={trendData.timelineData} 
                color={trend.color}
                timeRange={timeRange}
              />
            ) : (
              <div className="h-[320px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Hover over data points to see detailed search volume estimates
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Current Volume</span>
              </div>
              <div className="text-xl font-bold" style={{ color: trend.color }}>
                {trendData ? formatNumber(trendData.currentVolume) : '—'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Growth Rate</span>
              </div>
              <div className={`text-xl font-bold ${getGrowthColor(displayGrowthNum)}`}>
                {displayGrowth}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Max Volume</span>
              </div>
              <div className="text-xl font-bold">
                {trendData ? formatNumber(trendData.maxVolume) : '—'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">CPC</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                ${trendData?.cpc.toFixed(2) ?? '—'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Competition</span>
              </div>
              {trendData ? (
                <Badge className={`text-sm ${getCompetitionColor(trendData.competition)}`}>
                  {trendData.competition.charAt(0).toUpperCase() + trendData.competition.slice(1)}
                </Badge>
              ) : (
                <span className="text-xl font-bold">—</span>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Peak Date</span>
              </div>
              <div className="text-lg font-semibold">
                {trendData?.peakDate ?? '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competition Score Bar */}
        {trendData && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Competition Score</span>
                <span className="text-sm font-bold">{trendData.competitionScore}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    trendData.competitionScore < 35 ? 'bg-green-500' :
                    trendData.competitionScore < 65 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${trendData.competitionScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About This Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{trend.description}</p>
          </CardContent>
        </Card>

        {/* Related Searches */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Related Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trend.relatedSearches.map((search, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Opportunity Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Market Signals</h4>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                  <li>• {displayGrowthNum >= 100 ? 'Explosive' : displayGrowthNum >= 50 ? 'Strong' : 'Steady'} growth indicates rising demand</li>
                  <li>• {trendData?.currentVolume && trendData.currentVolume >= 10000 ? 'High' : trendData?.currentVolume && trendData.currentVolume >= 5000 ? 'Moderate' : 'Emerging'} search volume shows market awareness</li>
                  <li>• Peak in {trendData?.peakDate || trend.peakMonth} suggests seasonality opportunities</li>
                  {trendData?.cpc && <li>• ${trendData.cpc.toFixed(2)} CPC indicates {trendData.cpc >= 5 ? 'high commercial intent' : trendData.cpc >= 2 ? 'moderate value' : 'opportunity for content play'}</li>}
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Entry Points</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <li>• Content creation around related searches</li>
                  <li>• SaaS tools addressing core pain points</li>
                  <li>• Consulting/agency services for businesses</li>
                  {trendData?.competition === 'low' && <li>• Low competition = easier organic ranking</li>}
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Competition Assessment</h4>
              <p className="text-sm text-muted-foreground">
                {trendData?.competition === 'high'
                  ? `High competition (${trendData.competitionScore}/100) with $${trendData.cpc?.toFixed(2)} CPC means established players dominate. Focus on niche angles or unique positioning to break through.`
                  : trendData?.competition === 'medium'
                  ? `Medium competition (${trendData.competitionScore}/100) offers a balanced opportunity. Strong differentiation and quality execution can win market share.`
                  : trendData?.competition === 'low'
                  ? `Low competition (${trendData?.competitionScore}/100) presents an excellent opportunity. Early movers can establish authority before the market matures.`
                  : `With ${trend.growth} growth, this market is ${trend.growthNum >= 100 ? 'rapidly expanding' : 'steadily developing'}. Evaluate competition levels to determine optimal entry strategy.`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/database">
            <Button className="gap-2">
              <Search className="w-4 h-4" />
              Find Related Ideas
            </Button>
          </Link>
          <Button variant="outline" className="gap-2" asChild>
            <a 
              href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(trend.title)}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              View on Google Trends
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
