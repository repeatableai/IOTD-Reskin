import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface BuildChatDialogProps {
  ideaContext?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuildChatDialog({ ideaContext, open, onOpenChange }: BuildChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
      setMessages(newMessages);
      setInput('');

      const response = await fetch('/api/ai/build-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          ideaContext: ideaContext ? {
            title: ideaContext.title,
            description: ideaContext.description,
            market: ideaContext.market,
            targetAudience: ideaContext.targetAudience,
            keyFeatures: ideaContext.keyFeatures
          } : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data as Message;
    },
    onSuccess: (data: Message) => {
      setMessages(prev => [...prev, data]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col" data-testid="dialog-build-chat">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Building Assistant (Claude 4.5)
          </DialogTitle>
          <DialogDescription>
            Get expert guidance on building your startup with Claude 4.5 Sonnet
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4" data-testid="chat-messages">
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                  <p className="text-lg font-semibold mb-2">Welcome to AI Building Assistant</p>
                  <p className="text-sm">
                    {ideaContext
                      ? `I'm here to help you build "${ideaContext.title}". Ask me anything about implementation, tech stack, architecture, or next steps!`
                      : 'Ask me anything about building your startup - implementation, tech stack, architecture, or next steps!'}
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
                          <Sparkles className="w-4 h-4" />
                          Claude 4.5
                        </div>
                      )}
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claude is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 mt-4 space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  ideaContext
                    ? "Ask about implementation, tech stack, features, or anything else..."
                    : "What would you like to build? Describe your idea or ask a question..."
                }
                className="min-h-[80px]"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  size="icon"
                  data-testid="button-send-message"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                {messages.length > 0 && (
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="icon"
                    disabled={chatMutation.isPending}
                    data-testid="button-clear-chat"
                  >
                    <span className="text-xs">Clear</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
