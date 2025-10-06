import Header from "@/components/Header";
import { Mail, MessageSquare, FileQuestion, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ContactFormData) => apiRequest('POST', '/api/contact', data),
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contact & Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get help from our team
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">General Inquiries</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Questions about the platform or features
            </p>
            <a href="mailto:hello@ideabrowser.com" className="text-primary hover:underline text-sm">
              hello@ideabrowser.com
            </a>
          </div>
          <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <FileQuestion className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Technical Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Issues with your account or features
            </p>
            <a href="mailto:support@ideabrowser.com" className="text-primary hover:underline text-sm">
              support@ideabrowser.com
            </a>
          </div>
          <div className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Partnerships</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Business inquiries and collaborations
            </p>
            <a href="mailto:partnerships@ideabrowser.com" className="text-primary hover:underline text-sm">
              partnerships@ideabrowser.com
            </a>
          </div>
        </div>

        <div className="max-w-2xl mx-auto border rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          
          {isSubmitted && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your message has been received! We'll get back to you within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          {mutation.isError && (
            <Alert className="mb-6 border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to send message. Please try again or email us directly.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input 
                {...register("name")}
                placeholder="Your name" 
                data-testid="input-name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input 
                {...register("email")}
                type="email" 
                placeholder="your@email.com" 
                data-testid="input-email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <Input 
                {...register("subject")}
                placeholder="What's this about?" 
                data-testid="input-subject"
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message *</label>
              <Textarea
                {...register("message")}
                placeholder="Tell us more..."
                rows={6}
                data-testid="input-message"
                className={errors.message ? "border-red-500" : ""}
              />
              {errors.message && (
                <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              data-testid="button-send-message"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
