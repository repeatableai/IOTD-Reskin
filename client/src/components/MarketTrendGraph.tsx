import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function MarketTrendGraph({ keyword, ideaTitle }: MarketTrendGraphProps) {
  const { data: trendData, isLoading } = useQuery<TrendData>({
    queryKey: ['/api/external/trend', keyword],
    enabled: !!keyword,
  });

  if (!keyword) {
    return null;
  }

  // Generate sparkline data from API data or fallback
  const generateSparklineData = (growth: number, data?: TrendData) => {
    // If we have fetched data, use it
    if (data?.timelineData && data.timelineData.length > 0) {
      return data.timelineData.map(d => d.value);
    }
    
    // Fallback
    const points = 12;
    const result = [];
    let value = 50;
    
    for (let i = 0; i < points; i++) {
      const trend = (growth / 100) * (i / points);
      value = Math.max(10, Math.min(100, value + trend / points));
      result.push(value);
    }
    
    return result;
  };

  const growthNum = trendData?.growth ? parseFloat(trendData.growth.replace(/[^0-9.-]/g, '')) : 0;
  const sparklineData = generateSparklineData(growthNum, trendData);
  const color = growthNum > 0 ? "#22c55e" : "#ef4444";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Market Trend Analysis</CardTitle>
          </div>
          {trendData && trendData.growth && (
            <Badge variant={growthNum > 0 ? "default" : "destructive"} className="text-sm">
              {trendData.growth} YoY Growth
            </Badge>
          )}
        </div>
        {ideaTitle && (
          <p className="text-sm text-muted-foreground mt-1">
            Keyword: <span className="font-medium">{keyword}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading trend data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sparkline Chart */}
            <div className="h-[60px] w-full">
              <SparklineChart data={sparklineData} color={color} height={60} />
            </div>

            {/* Metrics Grid (matching Trends tab style) */}
            {trendData && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {trendData.currentValue ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Current Volume</div>
                    <div className="text-2xl font-bold">{trendData.currentValue.toLocaleString()}</div>
                  </div>
                ) : trendData.volume ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Monthly Volume</div>
                    <div className="text-2xl font-bold">{trendData.volume.toLocaleString()}</div>
                  </div>
                ) : null}
                
                {trendData.peakValue && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Peak Volume</div>
                    <div className="text-2xl font-bold">{trendData.peakValue.toLocaleString()}</div>
                    {trendData.peakDate && (
                      <div className="text-xs text-muted-foreground mt-1">{trendData.peakDate}</div>
                    )}
                  </div>
                )}
                
                {trendData.averageValue ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Average Volume</div>
                    <div className="text-2xl font-bold">{trendData.averageValue.toLocaleString()}</div>
                  </div>
                ) : trendData.volume ? (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                    <div className="text-2xl font-bold text-green-600">{trendData.growth || 'N/A'}</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
