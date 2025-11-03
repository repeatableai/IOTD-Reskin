import Header from "@/components/Header";
import { Search, FileText, BarChart, Users, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { ResearchRequest } from "@shared/schema";

const researchSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  market: z.string().min(1, "Market/industry is required"),
  targetAudience: z.string().min(10, "Target audience description is required"),
  researchType: z.enum(["full", "market", "competitor", "validation"]),
  urgency: z.enum(["standard", "priority"]),
  additionalNotes: z.string().optional(),
});

type ResearchFormData = z.infer<typeof researchSchema>;

export default function Research() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      researchType: "full",
      urgency: "standard",
    },
  });

  const { data: myRequests } = useQuery<ResearchRequest[]>({
    queryKey: ["/api/research/my-requests"],
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: ResearchFormData) => apiRequest('POST', '/api/research', data),
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/research/my-requests"] });
      setTimeout(() => {
        setIsSubmitted(false);
        setIsDialogOpen(false);
      }, 3000);
    },
  });

  const onSubmit = (data: ResearchFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Research Your Solutions</h1>
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

          <div className="text-center mb-12">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" data-testid="button-request-research">
                  Request Research Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Request Research Report</DialogTitle>
                  <DialogDescription>
                    Fill out the form below and our team will deliver a comprehensive report within 24 hours
                  </DialogDescription>
                </DialogHeader>

                {!user ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please log in to request a research report
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {isSubmitted && (
                      <Alert className="border-green-500 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Request submitted! We'll get started right away.
                        </AlertDescription>
                      </Alert>
                    )}

                    {mutation.isError && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Failed to submit request. Please try again.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Idea Title *</Label>
                        <Input
                          id="title"
                          {...register("title")}
                          placeholder="e.g., AI-powered meal planner"
                          data-testid="input-research-title"
                          className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Detailed Description *</Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Describe your idea in detail..."
                          rows={4}
                          data-testid="input-research-description"
                          className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="market">Market/Industry *</Label>
                        <Input
                          id="market"
                          {...register("market")}
                          placeholder="e.g., Health & Wellness, SaaS, E-commerce"
                          data-testid="input-research-market"
                          className={errors.market ? "border-red-500" : ""}
                        />
                        {errors.market && (
                          <p className="text-sm text-red-600 mt-1">{errors.market.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="targetAudience">Target Audience *</Label>
                        <Textarea
                          id="targetAudience"
                          {...register("targetAudience")}
                          placeholder="Describe your target customers..."
                          rows={3}
                          data-testid="input-research-audience"
                          className={errors.targetAudience ? "border-red-500" : ""}
                        />
                        {errors.targetAudience && (
                          <p className="text-sm text-red-600 mt-1">{errors.targetAudience.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="researchType">Research Type *</Label>
                        <Controller
                          name="researchType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger data-testid="select-research-type">
                                <SelectValue placeholder="Select research type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Full Research (Recommended)</SelectItem>
                                <SelectItem value="market">Market Analysis Only</SelectItem>
                                <SelectItem value="competitor">Competitor Research Only</SelectItem>
                                <SelectItem value="validation">Customer Validation Only</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="urgency">Delivery Speed *</Label>
                        <Controller
                          name="urgency"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger data-testid="select-urgency">
                                <SelectValue placeholder="Select delivery speed" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (24 hours)</SelectItem>
                                <SelectItem value="priority">Priority (12 hours) +$50</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="additionalNotes">Additional Notes</Label>
                        <Textarea
                          id="additionalNotes"
                          {...register("additionalNotes")}
                          placeholder="Any specific areas you'd like us to focus on?"
                          rows={3}
                          data-testid="input-research-notes"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        data-testid="button-submit-research"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Submitting..." : "Submit Research Request"}
                      </Button>
                    </form>
                  </>
                )}
              </DialogContent>
            </Dialog>
            <p className="text-sm text-muted-foreground mt-4">
              Available for PRO plan members. Delivered within 24 hours.
            </p>
          </div>

          {user && myRequests && myRequests.length > 0 && (
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Research Requests</h2>
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`research-request-${request.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{request.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          request.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : request.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Market: {request.market}</span>
                      <span>Type: {request.researchType}</span>
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
