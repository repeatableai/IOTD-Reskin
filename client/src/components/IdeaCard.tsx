import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoreDisplay from "./ScoreDisplay";
import type { Idea } from "@shared/schema";

interface IdeaCardProps {
  idea: Idea;
  featured?: boolean;
  compact?: boolean;
}

export default function IdeaCard({ idea, featured = false, compact = false }: IdeaCardProps) {
  if (compact) {
    return (
      <Link href={`/idea/${idea.slug}`} className="block">
        <Card className="idea-card cursor-pointer h-full" data-testid={`card-idea-${idea.id}`}>
          <CardContent className="p-4">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-blue-50 text-blue-700 text-xs">{idea.market}</Badge>
              <Badge className="bg-green-50 text-green-700 text-xs">{idea.type}</Badge>
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2" data-testid="text-idea-title">
              {idea.title}
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
              {idea.description}
            </p>
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-2">
                <span className="font-bold text-green-600">{idea.opportunityScore}</span>
                <span className="font-bold text-blue-600">{idea.problemScore}</span>
              </div>
              <span className="text-muted-foreground">{idea.market}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (featured) {
    return (
      <Link href={`/idea/${idea.slug}`} className="block">
        <Card className="idea-card cursor-pointer" data-testid={`card-idea-featured-${idea.id}`}>
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/3">
              <img 
                src={idea.imageUrl || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                alt={idea.title}
                className="w-full h-48 lg:h-full object-cover lg:rounded-l-lg"
              />
            </div>
            <CardContent className="lg:w-2/3 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">{idea.market}</Badge>
                <Badge className="bg-green-50 text-green-700 border-green-200">{idea.type}</Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-2" data-testid="text-idea-title">
                {idea.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {idea.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ScoreDisplay 
                  score={idea.opportunityScore} 
                  label="Opportunity" 
                  sublabel={idea.opportunityLabel}
                  compact 
                />
                <ScoreDisplay 
                  score={idea.problemScore} 
                  label="Problem" 
                  sublabel={idea.problemLabel}
                  compact 
                />
                <ScoreDisplay 
                  score={idea.feasibilityScore} 
                  label="Feasibility" 
                  sublabel={idea.feasibilityLabel}
                  compact 
                />
                <ScoreDisplay 
                  score={idea.timingScore} 
                  label="Timing" 
                  sublabel={idea.timingLabel}
                  compact 
                />
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="idea-card overflow-hidden" data-testid={`card-idea-${idea.id}`}>
      <img 
        src={idea.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"} 
        alt={idea.title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex gap-2 mb-3">
          <Badge className="bg-blue-50 text-blue-700 text-xs">{idea.market}</Badge>
          <Badge className="bg-green-50 text-green-700 text-xs">{idea.type}</Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid="text-idea-title">
          {idea.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {idea.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{idea.opportunityScore}</div>
              <div className="text-xs text-muted-foreground">Opportunity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{idea.problemScore}</div>
              <div className="text-xs text-muted-foreground">Problem</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{idea.feasibilityScore}</div>
              <div className="text-xs text-muted-foreground">Feasibility</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium" data-testid="text-revenue-potential">
              {idea.revenuePotential}
            </div>
            <div className="text-xs text-muted-foreground">ARR Potential</div>
          </div>
        </div>
        
        <Link href={`/idea/${idea.slug}`}>
          <Button className="w-full" data-testid="button-view-details">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
