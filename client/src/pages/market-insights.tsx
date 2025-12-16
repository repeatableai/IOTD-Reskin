import Header from "@/components/Header";
import { Users, MessageSquare, TrendingUp, ArrowUpRight, Clock, Search, AlertTriangle, Lightbulb, DollarSign, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Idea } from "@shared/schema";

// Generate market insight data for an idea
const generateInsightData = (idea: Idea) => {
  const baseScore = idea.problemScore || 7;
  const opportunityScore = idea.opportunityScore || 7;
  
  // Calculate pain points severity
  const painPointsScore = Math.min(10, baseScore + Math.floor(Math.random() * 2));
  const painSeverity = painPointsScore >= 9 ? 'severe' : painPointsScore >= 7 ? 'high' : 'moderate';
  
  // Calculate solution gaps
  const solutionGapsScore = Math.min(10, Math.floor((opportunityScore + baseScore) / 2) - 1);
  const gapsSeverity = solutionGapsScore >= 7 ? 'critical' : solutionGapsScore >= 5 ? 'high' : 'moderate';
  
  // Calculate communities count
  const platformCount = Math.floor(Math.random() * 3) + 1;
  const communitiesCount = Math.floor(Math.random() * 10) + 15;
  
  // Calculate revenue potential
  const revenueScore = (opportunityScore + baseScore) / 2;
  const revenuePotential = revenueScore >= 8 ? 'excellent' : revenueScore >= 6 ? 'high' : 'moderate';
  
  return {
    painPointsScore,
    painSeverity,
    solutionGapsScore,
    gapsSeverity,
    communitiesCount,
    platformCount,
    revenuePotential
  };
};

// Sample market opportunities that complement the ideas
const FEATURED_OPPORTUNITIES = [
  {
    title: "Mountain Bike Trail Stewardship & Funding",
    description: "Trail maintenance bounties, tool lending, incident logs, and land-use advocacy.",
    painPointsScore: 8, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 2,
    revenuePotential: "excellent"
  },
  {
    title: "Pet Loss, Cremation & Memorial Services",
    description: "Transparent pricing, grief resources, keepsake products, and compliance.",
    painPointsScore: 9, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 19, platformCount: 3,
    revenuePotential: "excellent"
  },
  {
    title: "Backyard Chickens & Urban Homesteading",
    description: "Local ordinance navigation, coop designs, feed/health, and predator-proofing guides.",
    painPointsScore: 10, painSeverity: "high",
    solutionGapsScore: 6, gapsSeverity: "critical",
    communitiesCount: 18, platformCount: 3,
    revenuePotential: "excellent"
  },
  {
    title: "Compliance Automation for Emerging Regulations",
    description: "AI-powered compliance tracking for new regulations across industries, with automated reporting and risk assessment tools.",
    painPointsScore: 9, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 3,
    revenuePotential: "excellent"
  },
  {
    title: "Calendar Optimization & Meeting ROI Analytics",
    description: "AI-powered calendar management with auto-buffers, meeting cost analysis, and focus time protection for knowledge workers.",
    painPointsScore: 9, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 18, platformCount: 1,
    revenuePotential: "excellent"
  },
  {
    title: "Weight Loss Drugs and Support",
    description: "Clinics and apps providing monitoring and coaching alongside new pharmaceuticals, capitalizing on health trends.",
    painPointsScore: 8, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 1,
    revenuePotential: "high"
  },
  {
    title: "Senior Move Management and Downsizing Services",
    description: "Retiring boomers needing help with sorting, packing, and transitioning to smaller homes, easing family stress during life changes.",
    painPointsScore: 8, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 3,
    revenuePotential: "moderate"
  },
  {
    title: "Homeowner & Contractor Permit Ops",
    description: "Communities hacking municipal workflows, digitizing submittals, and selling one-click permit packages for remodels and ADUs.",
    painPointsScore: 8, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "critical",
    communitiesCount: 20, platformCount: 1,
    revenuePotential: "excellent"
  },
  {
    title: "Youth Sports Ops Platforms",
    description: "Scheduling, payments, ref assignments, and comms that replace spreadsheets and group chats.",
    painPointsScore: 8, painSeverity: "high",
    solutionGapsScore: 6, gapsSeverity: "critical",
    communitiesCount: 20, platformCount: 3,
    revenuePotential: "high"
  },
  {
    title: "Sustainable Landscaping and Lawn Care",
    description: "Eco-conscious consumers and municipalities shifting from gas-powered equipment, driving demand for electric tools, native plants, and organic methods.",
    painPointsScore: 9, painSeverity: "high",
    solutionGapsScore: 6, gapsSeverity: "critical",
    communitiesCount: 20, platformCount: 1,
    revenuePotential: "excellent"
  },
  {
    title: "Gaming Peripheral Customization & Reviews",
    description: "Hall effect joysticks and durable gaming gear boom drives demand for custom controller marketplaces and performance testing communities.",
    painPointsScore: 8, painSeverity: "severe",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 1,
    revenuePotential: "high"
  },
  {
    title: "Washable Home Textiles E-commerce",
    description: "Pet-friendly, family-focused washable rugs and textiles need specialized inventory management and customer education platforms.",
    painPointsScore: 8, painSeverity: "high",
    solutionGapsScore: 6, gapsSeverity: "high",
    communitiesCount: 20, platformCount: 3,
    revenuePotential: "excellent"
  }
];

export default function MarketInsights() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("painPoints");

  const { data: response, isLoading: ideasLoading } = useQuery<{ ideas: Idea[]; total: number }>({
    queryKey: ["/api/ideas"],
  });

  const ideas = response?.ideas || [];

  // Combine featured opportunities with ideas from database
  const allOpportunities = [
    ...FEATURED_OPPORTUNITIES.map((opp, idx) => ({
      id: `featured-${idx}`,
      slug: `market-${opp.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      ...opp,
      isFeatured: true
    })),
    ...ideas.map(idea => {
      const insight = generateInsightData(idea);
      return {
        id: idea.id,
        slug: idea.slug,
        title: idea.title,
        description: idea.description,
        ...insight,
        isFeatured: false
      };
    })
  ];

  // Filter by search term
  const filteredOpportunities = allOpportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "painPoints":
        return b.painPointsScore - a.painPointsScore;
      case "solutionGaps":
        return b.solutionGapsScore - a.solutionGapsScore;
      case "communities":
        return b.communitiesCount - a.communitiesCount;
      case "revenue":
        const revenueOrder = { excellent: 3, high: 2, moderate: 1 };
        return (revenueOrder[b.revenuePotential as keyof typeof revenueOrder] || 0) - 
               (revenueOrder[a.revenuePotential as keyof typeof revenueOrder] || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalResults = sortedOpportunities.length;
  const totalPages = Math.ceil(totalResults / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedOpportunities = sortedOpportunities.slice(startIndex, startIndex + rowsPerPage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getRevenueColor = (revenue: string) => {
    switch (revenue) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'high': return 'text-green-600 bg-green-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Market Insights</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uncover hidden market opportunities by analyzing reddit, facebook groups, and other communities.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search market opportunities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="painPoints">Pain Points (High to Low)</SelectItem>
              <SelectItem value="solutionGaps">Solution Gaps (High to Low)</SelectItem>
              <SelectItem value="communities">Communities (Most)</SelectItem>
              <SelectItem value="revenue">Revenue Potential</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Grid */}
        {ideasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedOpportunities.map((opportunity) => (
                <Link 
                  key={opportunity.id} 
                  href={opportunity.isFeatured ? `/market-insight/${opportunity.slug}` : `/idea/${opportunity.slug}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {opportunity.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {opportunity.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Pain Points */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">Pain Points ({opportunity.painPointsScore})</span>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(opportunity.painSeverity)}>
                          {opportunity.painSeverity}
                        </Badge>
                      </div>

                      {/* Solution Gaps */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Solution Gaps ({opportunity.solutionGapsScore})</span>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(opportunity.gapsSeverity)}>
                          {opportunity.gapsSeverity}
                        </Badge>
                      </div>

                      {/* Communities */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Communities</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {opportunity.communitiesCount} across {opportunity.platformCount} platform{opportunity.platformCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Revenue Potential */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Revenue Potential</span>
                        </div>
                        <Badge className={getRevenueColor(opportunity.revenuePotential)}>
                          {opportunity.revenuePotential}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalResults)} of {totalResults} results
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page</span>
                  <Select 
                    value={rowsPerPage.toString()} 
                    onValueChange={(val) => {
                      setRowsPerPage(parseInt(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground mr-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <ChevronLeft className="w-4 h-4 -ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <ChevronRight className="w-4 h-4 -ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
