import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, Sparkles, ThumbsUp, Bookmark, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { IdeaFilters as IdeaFiltersType } from "@shared/schema";

interface IdeaFiltersProps {
  filters: IdeaFiltersType;
  onFiltersChange: (filters: Partial<IdeaFiltersType>) => void;
}

export default function IdeaFilters({ filters, onFiltersChange }: IdeaFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const { isAuthenticated } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchValue });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: undefined,
      market: undefined,
      type: undefined,
      minOpportunityScore: undefined,
      maxExecutionScore: undefined,
      minRevenueNum: undefined,
      maxRevenueNum: undefined,
      sortBy: 'newest',
      isGregsPick: undefined,
      userStatus: undefined,
      forYou: undefined,
    });
  };

  return (
    <Card className="sticky top-24" data-testid="component-idea-filters">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Premium Quick Filters */}
        {isAuthenticated && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Premium Filters</Label>
            <div className="flex flex-col gap-2">
              <Button
                variant={filters.isGregsPick ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ isGregsPick: filters.isGregsPick ? undefined : true })}
                className="justify-start"
                data-testid="button-gregs-pick"
              >
                <Star className="w-4 h-4 mr-2" />
                Greg's Pick
                {filters.isGregsPick && <Badge className="ml-auto" variant="secondary">Active</Badge>}
              </Button>
              
              <Button
                variant={filters.userStatus === 'interested' ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ 
                  userStatus: filters.userStatus === 'interested' ? undefined : 'interested' 
                })}
                className="justify-start"
                data-testid="button-status-interested"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Interested
              </Button>
              
              <Button
                variant={filters.userStatus === 'saved' ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ 
                  userStatus: filters.userStatus === 'saved' ? undefined : 'saved' 
                })}
                className="justify-start"
                data-testid="button-status-saved"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </Button>
              
              <Button
                variant={filters.userStatus === 'building' ? "default" : "outline"}
                size="sm"
                onClick={() => onFiltersChange({ 
                  userStatus: filters.userStatus === 'building' ? undefined : 'building' 
                })}
                className="justify-start"
                data-testid="button-status-building"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Building
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Search Solutions
          </Label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search by keyword..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pr-10"
              data-testid="input-search"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
          >
            <SelectTrigger data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="opportunity">Highest Opportunity</SelectItem>
              <SelectItem value="revenue">Highest Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Market Type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Market</Label>
          <Select
            value={filters.market || 'all'}
            onValueChange={(value) => onFiltersChange({ market: value === 'all' ? undefined : value as any })}
          >
            <SelectTrigger data-testid="select-market">
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="B2B2C">B2B2C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => onFiltersChange({ type: value === 'all' ? undefined : value })}
          >
            <SelectTrigger data-testid="select-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mobile_app">Mobile App</SelectItem>
              <SelectItem value="web_app">Web App</SelectItem>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opportunity Score */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Minimum Opportunity Score
          </Label>
          <Select
            value={filters.minOpportunityScore?.toString() || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                minOpportunityScore: value === 'all' ? undefined : parseInt(value) 
              })
            }
          >
            <SelectTrigger data-testid="select-min-opportunity">
              <SelectValue placeholder="Any Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Score</SelectItem>
              <SelectItem value="7">7+ (High)</SelectItem>
              <SelectItem value="8">8+ (Very High)</SelectItem>
              <SelectItem value="9">9+ (Exceptional)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Execution Difficulty */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Maximum Execution Difficulty
          </Label>
          <Select
            value={filters.maxExecutionScore?.toString() || 'all'}
            onValueChange={(value) => 
              onFiltersChange({ 
                maxExecutionScore: value === 'all' ? undefined : parseInt(value) 
              })
            }
          >
            <SelectTrigger data-testid="select-max-execution">
              <SelectValue placeholder="Any Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Difficulty</SelectItem>
              <SelectItem value="3">3 or lower (Easy)</SelectItem>
              <SelectItem value="6">6 or lower (Moderate)</SelectItem>
              <SelectItem value="8">8 or lower (Challenging)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Potential */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Revenue Potential</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue-1m-10m"
                checked={filters.minRevenueNum === 1000000 && filters.maxRevenueNum === 10000000}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFiltersChange({ minRevenueNum: 1000000, maxRevenueNum: 10000000 });
                  } else {
                    onFiltersChange({ minRevenueNum: undefined, maxRevenueNum: undefined });
                  }
                }}
                data-testid="checkbox-revenue-1m-10m"
              />
              <Label htmlFor="revenue-1m-10m" className="text-sm">
                $1M - $10M ARR
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue-10m-plus"
                checked={filters.minRevenueNum === 10000000 && !filters.maxRevenueNum}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFiltersChange({ minRevenueNum: 10000000, maxRevenueNum: undefined });
                  } else {
                    onFiltersChange({ minRevenueNum: undefined, maxRevenueNum: undefined });
                  }
                }}
                data-testid="checkbox-revenue-10m-plus"
              />
              <Label htmlFor="revenue-10m-plus" className="text-sm">
                $10M+ ARR
              </Label>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          onClick={handleClearFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
