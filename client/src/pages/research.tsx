import Header from "@/components/Header";
import { Search, FileText, BarChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Research Your Ideas</h1>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">PRO</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive research reports in 24 hours
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">What You'll Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Detailed Report</h3>
                  <p className="text-sm text-muted-foreground">
                    20+ page comprehensive analysis of your idea
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Market Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    TAM/SAM/SOM calculations and growth projections
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Competitor Research</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed analysis of existing solutions
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customer Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    Real user feedback and pain point analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" data-testid="button-request-research">
              Request Research Report
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Available for PRO plan members. Delivered within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
