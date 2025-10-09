import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ExternalLink, 
  ArrowLeft,
  Code,
  Rocket,
  Sparkles,
  Target,
  CheckCircle2
} from "lucide-react";

const BUILDER_CONFIG = {
  replit: {
    name: "Replit Agent",
    icon: Code,
    color: "orange",
    url: (prompt: string) => `https://replit.com/new?description=${encodeURIComponent(prompt)}`,
    description: "AI-powered full-stack development platform"
  },
  bolt: {
    name: "Bolt.new",
    icon: Rocket,
    color: "blue",
    url: () => "https://bolt.new",
    description: "AI-powered full-stack web app builder"
  },
  v0: {
    name: "v0 by Vercel",
    icon: Sparkles,
    color: "purple",
    url: () => "https://v0.dev",
    description: "AI UI component generator for React/Next.js"
  },
  cursor: {
    name: "Cursor IDE",
    icon: Target,
    color: "green",
    url: () => "https://cursor.sh",
    description: "AI-first code editor with intelligent suggestions"
  }
};

function generatePrompt(idea: any, builder: string): string {
  const baseContext = `Build a ${idea.market} ${idea.type} called "${idea.title}".

Description: ${idea.description}

Target Audience: ${idea.targetAudience || 'General users'}`;

  switch (builder) {
    case 'replit':
      return `${baseContext}

Technical Requirements:
- Create a modern, responsive web application
- Use React with TypeScript for the frontend
- Implement a Node.js/Express backend with PostgreSQL database
- Use Tailwind CSS for styling
- Include user authentication
- Make it mobile-friendly

Key Features to Implement:
${idea.keyFeatures?.map((f: string) => `- ${f}`).join('\n') || '- Core functionality as described above'}

Additional Context:
${idea.content ? `- ${idea.content.substring(0, 300)}...` : '- Focus on MVP features first'}

Please create a full-stack application with proper project structure, database schema, API endpoints, and a polished user interface.`;

    case 'bolt':
      return `${baseContext}

Build Instructions:
1. Create a modern web application with clean, intuitive UI
2. Implement the following core features:
${idea.keyFeatures?.map((f: string) => `   - ${f}`).join('\n') || '   - Main functionality as described'}
3. Use modern web technologies (React, TypeScript recommended)
4. Ensure responsive design for mobile and desktop
5. Add proper error handling and loading states

Design Guidelines:
- Use a clean, professional color scheme
- Ensure accessibility (WCAG compliance)
- Optimize for performance
- Include smooth animations and transitions

${idea.executionPlan ? `\nExecution Plan:\n${idea.executionPlan}` : ''}`;

    case 'v0':
      return `Create UI components for: ${idea.title}

Description: ${idea.description}

Components Needed:
1. Landing Page
   - Hero section with headline: "${idea.subtitle || idea.title}"
   - Feature highlights (${idea.keyFeatures?.length || 3} key features)
   - Call-to-action buttons
   - Responsive design

2. Main Dashboard/App Interface
   - Navigation sidebar/header
   - ${idea.market === 'B2B' ? 'Professional business dashboard' : 'User-friendly consumer interface'}
   - Data visualization components (cards, charts, lists)
   - User profile section

3. Key Feature Components:
${idea.keyFeatures?.map((f: string, i: number) => `   ${i + 1}. ${f}`).join('\n') || '   - Core functionality components'}

Design Style:
- Modern, clean aesthetic
- ${idea.market === 'B2B' ? 'Professional and trustworthy' : 'Friendly and approachable'}
- Use shadows, rounded corners, and smooth transitions
- Accessible color contrast

Tech Stack: React, TypeScript, Tailwind CSS, Shadcn UI`;

    case 'cursor':
      return `Project: ${idea.title}
Type: ${idea.market} ${idea.type}

Description:
${idea.description}

Development Tasks:
1. Project Setup
   - Initialize a modern web application
   - Set up project structure with best practices
   - Configure build tools and development environment

2. Core Features Implementation:
${idea.keyFeatures?.map((f: string, i: number) => `   ${i + 1}. ${f}`).join('\n') || '   - Implement main functionality'}

3. Database Schema:
   - Design tables for: ${idea.targetAudience ? `${idea.targetAudience} data, ` : ''}user data, main entities
   - Set up relationships and constraints
   - Implement data validation

4. API Development:
   - RESTful API endpoints for CRUD operations
   - Authentication and authorization
   - Input validation and error handling

5. Frontend Development:
   - Responsive UI components
   - State management
   - API integration
   - User authentication flow

6. Testing & Deployment:
   - Unit tests for critical functions
   - Integration tests for API
   - Deployment configuration

${idea.technicalConsiderations ? `\nTechnical Considerations:\n${idea.technicalConsiderations}` : ''}

${idea.executionPlan ? `\nExecution Plan:\n${idea.executionPlan}` : ''}

Priority: Focus on MVP features first, then iterate based on user feedback.`;

    default:
      return baseContext;
  }
}

export default function BuildPrompt() {
  const { slug, builder } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["/api/ideas", slug],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch idea');
      }
      return response.json();
    },
  });

  const builderConfig = BUILDER_CONFIG[builder as keyof typeof BUILDER_CONFIG];
  const Icon = builderConfig?.icon || Code;
  
  const getBuilderColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, iconBg: string, iconText: string }> = {
      orange: { bg: 'bg-orange-50 dark:bg-orange-950', iconBg: 'bg-orange-100 dark:bg-orange-900', iconText: 'text-orange-600 dark:text-orange-400' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950', iconBg: 'bg-blue-100 dark:bg-blue-900', iconText: 'text-blue-600 dark:text-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950', iconBg: 'bg-purple-100 dark:bg-purple-900', iconText: 'text-purple-600 dark:text-purple-400' },
      green: { bg: 'bg-green-50 dark:bg-green-950', iconBg: 'bg-green-100 dark:bg-green-900', iconText: 'text-green-600 dark:text-green-400' }
    };
    return colorMap[color] || colorMap.orange;
  };
  
  const colorClasses = builderConfig ? getBuilderColorClasses(builderConfig.color) : getBuilderColorClasses('orange');

  const prompt = idea ? generatePrompt(idea, builder as string) : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Your build prompt is ready to paste."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the text.",
        variant: "destructive"
      });
    }
  };

  const openBuilder = () => {
    if (builderConfig) {
      const url = builderConfig.url(prompt);
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea || !builderConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Not Found</h1>
            <Button onClick={() => setLocation(`/idea/${slug}`)}>
              Back to Idea
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="build-prompt-page">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation(`/idea/${slug}`)}
          className="mb-6"
          data-testid="button-back-to-idea"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Idea
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${colorClasses.iconBg} rounded-lg`}>
              <Icon className={`w-8 h-8 ${colorClasses.iconText}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-builder-name">
                Build with {builderConfig.name}
              </h1>
              <p className="text-muted-foreground">{builderConfig.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{idea.market}</Badge>
            <Badge variant="outline">{idea.type}</Badge>
            <Badge variant="outline">{idea.title}</Badge>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How to Use This Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <p className="text-sm">Copy the detailed prompt below using the Copy button</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <p className="text-sm">Click "Open {builderConfig.name}" to launch the platform</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <p className="text-sm">Paste the prompt into {builderConfig.name} and start building!</p>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Your Build Prompt</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                data-testid="button-copy-prompt"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-6 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm" data-testid="text-build-prompt">
                {prompt}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            size="lg"
            onClick={openBuilder}
            className="flex-1"
            data-testid="button-open-builder"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Open {builderConfig.name}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation(`/idea/${slug}`)}
            data-testid="button-back-idea"
          >
            Back to Idea
          </Button>
        </div>

        {/* Additional Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Start with the MVP features outlined in the prompt, then iterate</p>
            <p>• Customize the prompt to match your specific vision and requirements</p>
            <p>• Use the idea's market data and analysis tabs for additional context</p>
            <p>• Join the community to share your progress and get feedback</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
