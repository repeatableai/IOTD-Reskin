import Header from "@/components/Header";
import { Mail, MessageSquare, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
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
          <div className="border rounded-lg p-6 text-center">
            <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">General Inquiries</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Questions about the platform or features
            </p>
            <a href="mailto:hello@ideabrowser.com" className="text-primary hover:underline text-sm">
              hello@ideabrowser.com
            </a>
          </div>
          <div className="border rounded-lg p-6 text-center">
            <FileQuestion className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Technical Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Issues with your account or features
            </p>
            <a href="mailto:support@ideabrowser.com" className="text-primary hover:underline text-sm">
              support@ideabrowser.com
            </a>
          </div>
          <div className="border rounded-lg p-6 text-center">
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

        <div className="max-w-2xl mx-auto border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input placeholder="Your name" data-testid="input-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" placeholder="your@email.com" data-testid="input-email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input placeholder="What's this about?" data-testid="input-subject" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Tell us more..."
                rows={6}
                data-testid="input-message"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-send-message">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
