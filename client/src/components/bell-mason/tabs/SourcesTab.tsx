import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Database,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Newspaper,
  DollarSign,
  Package,
} from "lucide-react";

interface ResearchSource {
  id: string;
  title: string;
  url: string;
  type: 'funding' | 'team' | 'product' | 'ip' | 'market' | 'traction' | 'news' | 'financials';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'N/A';
  findings: string;
}

interface SourcesTabProps {
  sources: ResearchSource[];
  dataGapAreas: string[];
}

// Confidence configuration
const CONFIDENCE_CONFIG = {
  HIGH: { color: 'bg-green-500', textColor: 'text-green-700', label: 'High', dotColor: 'bg-green-400' },
  MEDIUM: { color: 'bg-amber-500', textColor: 'text-amber-700', label: 'Medium', dotColor: 'bg-amber-400' },
  LOW: { color: 'bg-orange-500', textColor: 'text-orange-700', label: 'Low', dotColor: 'bg-orange-400' },
  'N/A': { color: 'bg-gray-400', textColor: 'text-gray-600', label: 'N/A', dotColor: 'bg-gray-300' },
};

// Source type configuration
const SOURCE_TYPE_CONFIG = {
  funding: { icon: DollarSign, label: 'Funding', color: 'text-green-600', bg: 'bg-green-50' },
  team: { icon: Users, label: 'Team', color: 'text-blue-600', bg: 'bg-blue-50' },
  product: { icon: Package, label: 'Product', color: 'text-purple-600', bg: 'bg-purple-50' },
  ip: { icon: Shield, label: 'IP/Patents', color: 'text-amber-600', bg: 'bg-amber-50' },
  market: { icon: TrendingUp, label: 'Market', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  traction: { icon: Database, label: 'Traction', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  news: { icon: Newspaper, label: 'News', color: 'text-red-600', bg: 'bg-red-50' },
  financials: { icon: FileText, label: 'Financials', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function SourcesTab({ sources, dataGapAreas }: SourcesTabProps) {
  // Group sources by type
  const groupedSources = sources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = [];
    }
    acc[source.type].push(source);
    return acc;
  }, {} as Record<string, ResearchSource[]>);

  // Count by confidence
  const confidenceCounts = {
    HIGH: sources.filter(s => s.confidence === 'HIGH').length,
    MEDIUM: sources.filter(s => s.confidence === 'MEDIUM').length,
    LOW: sources.filter(s => s.confidence === 'LOW').length,
    'N/A': sources.filter(s => s.confidence === 'N/A').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(confidenceCounts).map(([confidence, count]) => {
          const config = CONFIDENCE_CONFIG[confidence as keyof typeof CONFIDENCE_CONFIG];
          return (
            <Card key={confidence}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${config.dotColor}`} />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label} Confidence</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Gaps Alert */}
      {dataGapAreas.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              Data Gap Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-3">
              The following areas had insufficient data available for comprehensive analysis:
            </p>
            <div className="flex flex-wrap gap-2">
              {dataGapAreas.map((area, i) => (
                <Badge key={i} className="bg-amber-100 text-amber-700 border-amber-300">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources by Type */}
      {Object.entries(SOURCE_TYPE_CONFIG).map(([type, config]) => {
        const typeSources = groupedSources[type] || [];
        const Icon = config.icon;

        return (
          <Card key={type} className={config.bg}>
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center gap-2 text-lg ${config.color}`}>
                <Icon className="w-5 h-5" />
                {config.label}
                <Badge variant="outline" className="ml-2">
                  {typeSources.length} sources
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeSources.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-white/60 rounded-lg">
                  <HelpCircle className="w-4 h-4" />
                  <span>No sources found for this category</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {typeSources.map((source) => {
                    const confidenceConfig = CONFIDENCE_CONFIG[source.confidence];
                    return (
                      <div
                        key={source.id}
                        className="p-3 bg-white/80 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                              {source.id}
                            </Badge>
                            <span className="font-medium text-sm truncate">{source.title}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${confidenceConfig.dotColor}`} />
                              <span className={`text-xs ${confidenceConfig.textColor}`}>
                                {confidenceConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {source.findings}
                        </p>

                        {source.url && source.url !== 'N/A' && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Source
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Source Count Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Sources Referenced</span>
            <span className="font-bold text-lg">{sources.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
