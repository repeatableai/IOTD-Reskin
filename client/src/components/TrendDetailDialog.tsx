import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, ExternalLink, Building2, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TrendData } from "../../../server/externalDataService";

interface TrendDetailDialogProps {
  keyword: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrendDetailDialog({ keyword, open, onOpenChange }: TrendDetailDialogProps) {
  const { data: trendData, isLoading } = useQuery<TrendData>({
    queryKey: ['/api/external/trend', keyword],
    enabled: open && !!keyword,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-trend-detail">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {keyword} - Trend Analysis
          </DialogTitle>
          <DialogDescription>
            Real-time market data and insights from multiple sources
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading trend data...
          </div>
        ) : trendData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-trend-overview">Overview</TabsTrigger>
              <TabsTrigger value="apps" data-testid="tab-related-apps">Related Apps</TabsTrigger>
              <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6" data-testid="content-trend-overview">
              {/* Why Trending */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Why This Is Trending
                </h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-why-trending">
                  {trendData.whyTrending}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Search Volume</div>
                  <div className="text-3xl font-bold" data-testid="text-search-volume">
                    {trendData.volume.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">monthly searches</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                  <div className="text-3xl font-bold text-green-600" data-testid="text-growth-rate">
                    {trendData.growth}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">year-over-year</div>
                </div>
              </div>

              {/* Trending Industries */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Trending In These Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendData.trendingIndustries.map((industry, index) => (
                    <Badge key={index} variant="secondary" data-testid={`badge-industry-${index}`}>
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apps" className="space-y-4 mt-6" data-testid="content-related-apps">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Related Apps & Products
              </h3>
              <div className="space-y-3">
                {trendData.relatedApps.map((app, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    data-testid={`card-related-app-${index}`}
                  >
                    <div className="font-semibold text-lg mb-2">{app}</div>
                    <div className="text-sm text-muted-foreground">
                      A popular solution in the {keyword} space offering similar functionality
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4 mt-6" data-testid="content-sources">
              <h3 className="text-lg font-semibold mb-4">Research Sources & Citations</h3>
              <div className="space-y-3">
                {trendData.sources.map((source, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    data-testid={`card-source-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{source.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">{source.snippet}</div>
                        <div className="text-xs text-muted-foreground">
                          Source: {source.source}
                        </div>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                        data-testid={`link-source-${index}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No trend data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
