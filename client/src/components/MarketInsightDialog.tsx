import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, ExternalLink, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { MarketInsight } from "../../../server/externalDataService";

interface MarketInsightDialogProps {
  topic: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketInsightDialog({ topic, open, onOpenChange }: MarketInsightDialogProps) {
  const { data: insights, isLoading } = useQuery<MarketInsight[]>({
    queryKey: ['/api/external/insights', topic],
    enabled: open && !!topic,
  });

  const getSentimentColor = (sentiment: string) => {
    if (sentiment.toLowerCase().includes('positive')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (sentiment.toLowerCase().includes('negative')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="dialog-market-insight">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {topic} - Market Insights
          </DialogTitle>
          <DialogDescription>
            Real research from Reddit, Google, academic journals, and industry sources
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading market insights...
          </div>
        ) : insights && insights.length > 0 ? (
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {insights.slice(0, 3).map((insight, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  data-testid={`tab-platform-${index}`}
                >
                  {insight.platform}
                </TabsTrigger>
              ))}
            </TabsList>

            {insights.map((insight, platformIndex) => (
              <TabsContent
                key={platformIndex}
                value={platformIndex.toString()}
                className="space-y-6 mt-6"
                data-testid={`content-platform-${platformIndex}`}
              >
                {/* Platform Summary */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{insight.platform} Analysis</h3>
                    <Badge className={getSentimentColor(insight.sentiment)} data-testid="badge-sentiment">
                      {insight.sentiment}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Engagement</div>
                      <div className="text-2xl font-bold" data-testid="text-engagement">
                        {insight.engagement.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Sentiment</div>
                      <div className="text-2xl font-bold" data-testid="text-sentiment-value">
                        {insight.sentiment}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Findings from {insight.platform}
                  </h3>
                  <ul className="space-y-2">
                    {insight.keyFindings.map((finding, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                        data-testid={`finding-${index}`}
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supporting Data */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Supporting Research & Data</h3>
                  <div className="space-y-3">
                    {insight.supportingData.map((data, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        data-testid={`card-supporting-${index}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{data.title}</div>
                            <div className="text-sm text-muted-foreground mb-2">{data.snippet}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Source: {data.source}</span>
                              {data.date && <span>• {data.date}</span>}
                            </div>
                          </div>
                          <a
                            href={data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                            data-testid={`link-supporting-${index}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Sources */}
                {insight.academicSources && insight.academicSources.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Academic Research & Journal Articles
                    </h3>
                    <div className="space-y-4">
                      {insight.academicSources.map((source, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-muted/20"
                          data-testid={`card-academic-${index}`}
                        >
                          <div className="font-semibold mb-2">{source.title}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {source.authors.join(', ')} ({source.year})
                          </div>
                          <div className="text-sm mb-3">
                            <span className="font-medium">Journal:</span> {source.journal}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {source.abstract}
                          </div>
                          {source.doi && (
                            <a
                              href={`https://doi.org/${source.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              data-testid={`link-doi-${index}`}
                            >
                              DOI: {source.doi}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No market insights available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
