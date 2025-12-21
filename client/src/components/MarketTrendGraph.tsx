import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// TrendData interface for the component
interface TrendData {
  keyword: string;
  volume: number;
  growth: string;
  relatedApps?: string[];
  whyTrending?: string;
  trendingIndustries?: string[];
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
  }>;
  timelineData?: { date: string; value: number }[];
  averageValue?: number;
  peakValue?: number;
  peakDate?: string;
  currentValue?: number;
  growthRate?: number;
}

type TimeRange = '6m' | '1y';

interface MarketTrendGraphProps {
  keyword: string;
  ideaTitle?: string;
}

// Simple SVG Sparkline Chart Component (matching Trends tab style)
const SparklineChart = ({ data, color = "#22c55e", height = 60 }: { data: number[], color?: string, height?: number }) => {
  const width = 200;
  const padding = 4;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <polygon 
        points={areaPoints} 
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Generate sparkline data from API data or fallback (matching Trends tab)
const generateSparklineData = (growth: number, data?: TrendData) => {
  // If we have fetched data, use it
  if (data?.timelineData && data.timelineData.length > 0) {
    return data.timelineData.map(d => d.value);
  }
  
  // Fallback (matching Trends tab logic)
  const points = 12;
  const result = [];
  let value = 50;
  
  for (let i = 0; i < points; i++) {
    const trend = (growth / 100) * (i / points) * 30;
    value = Math.max(10, Math.min(100, value + trend / points));
    result.push(value);
  }
  
  return result;
};

// Get growth color (matching Trends tab)
const getGrowthColor = (growth: number) => {
  if (growth >= 500) return "text-green-600";
  if (growth >= 100) return "text-green-500";
  if (growth >= 50) return "text-emerald-500";
  return "text-teal-500";
};

export function MarketTrendGraph({ keyword, ideaTitle }: MarketTrendGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  const { data: trendData, isLoading } = useQuery<TrendData>({
    queryKey: ['/api/external/trend', keyword, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/external/trend?keyword=${encodeURIComponent(keyword)}&timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch trend data');
      return response.json();
    },
    enabled: !!keyword,
  });

  if (!keyword) {
    return null;
  }

  // Calculate growth number from API data or fallback
  const growthNum = trendData?.growthRate ?? (trendData?.growth ? parseFloat(trendData.growth.replace(/[^0-9.-]/g, '')) : 0);
  const sparklineData = generateSparklineData(growthNum, trendData);
  
  // Use color from trendData if available, otherwise determine from growth
  const color = trendData?.growthRate !== undefined 
    ? (growthNum >= 500 ? "#22c55e" : growthNum >= 100 ? "#22c55e" : growthNum >= 50 ? "#84cc16" : "#ef4444")
    : (growthNum > 0 ? "#22c55e" : "#ef4444");

  // Format volume display (matching Trends tab)
  const displayVolume = trendData?.currentValue 
    ? trendData.currentValue >= 1000 
      ? `${(trendData.currentValue / 1000).toFixed(1)}K`
      : trendData.currentValue.toString()
    : trendData?.volume
    ? trendData.volume >= 1000
      ? `${(trendData.volume / 1000).toFixed(1)}K`
      : trendData.volume.toString()
    : "N/A";

  // Format growth display (matching Trends tab)
  const displayGrowth = trendData?.growthRate !== undefined
    ? `${trendData.growthRate >= 0 ? '+' : ''}${trendData.growthRate}%`
    : trendData?.growth || "N/A";

  // Format numbers for display
  const formatNumber = (num?: number) => {
    if (!num) return '—';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <Card className="border-2">
      <CardContent className="p-5">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg line-clamp-1">
            {ideaTitle || keyword}
          </h3>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Time Range Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Time Range:</span>
          <Button
            variant={timeRange === '6m' ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange('6m')}
            disabled={isLoading}
            className="h-7 text-xs px-3"
          >
            6 Months
          </Button>
          <Button
            variant={timeRange === '1y' ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange('1y')}
            disabled={isLoading}
            className="h-7 text-xs px-3"
          >
            1 Year
          </Button>
        </div>
        
        {/* Chart (matching Trends tab height) */}
        <div className="mb-4 -mx-2">
          <SparklineChart data={sparklineData} color={color} height={80} />
        </div>
        
        {/* Stats Row (matching Trends tab style) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{displayVolume}</span>
            <span className="text-xs text-muted-foreground">volume</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${getGrowthColor(growthNum)}`} />
            <span className={`text-sm font-bold ${getGrowthColor(growthNum)}`}>
              {displayGrowth}
            </span>
          </div>
        </div>

        {/* Detailed Metrics Grid (matching Trends tab detail page) */}
        {trendData && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t">
            {trendData.peakValue && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Peak Volume</div>
                <div className="text-lg font-bold">{formatNumber(trendData.peakValue)}</div>
                {trendData.peakDate && (
                  <div className="text-xs text-muted-foreground mt-0.5">{trendData.peakDate}</div>
                )}
              </div>
            )}
            
            {trendData.averageValue && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Average Volume</div>
                <div className="text-lg font-bold">{formatNumber(trendData.averageValue)}</div>
              </div>
            )}
            
            {trendData.currentValue && trendData.currentValue !== trendData.volume && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Volume</div>
                <div className="text-lg font-bold">{formatNumber(trendData.currentValue)}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
