import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Send,
  Sparkles,
  MessageSquare,
  Loader2,
  X,
  GripVertical,
  Brain,
  Layers,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  userId: string | null;
  userName: string;
  userImage: string | null;
  content: string;
  createdAt: Date | string;
  isAI: boolean;
}

interface ActiveUser {
  userId: string;
  userName: string;
  userImage: string | null;
}

interface CollaborationPortalProps {
  ideaId: string;
  ideaTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollaborationPortal({
  ideaId,
  ideaTitle,
  open,
  onOpenChange,
}: CollaborationPortalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [synthesizeState, setSynthesizeState] = useState<'idle' | 'analyzing' | 'synthesizing' | 'critiquing'>('idle');

  // Fetch messages
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{ messages: Message[] }>({
    queryKey: [`/api/ideas/${ideaId}/collaboration/messages`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ideas/${ideaId}/collaboration/messages`);
      return response.json();
    },
    enabled: open && !!ideaId,
    refetchInterval: false,
  });

  // Fetch active users
  const { data: activeUsersData } = useQuery<{ users: ActiveUser[]; count: number }>({
    queryKey: [`/api/ideas/${ideaId}/collaboration/active-users`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ideas/${ideaId}/collaboration/active-users`);
      return response.json();
    },
    enabled: open && !!ideaId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const messages = messagesData?.messages || [];
  const activeUsers = activeUsersData?.users || [];

  // Socket.IO connection
  useEffect(() => {
    if (!open || !ideaId) return;

    const newSocket = io({
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Collaboration] Socket connected');
      newSocket.emit('join_idea_room', ideaId);
    });

    newSocket.on('new_message', (newMessage: Message) => {
      queryClient.setQueryData<{ messages: Message[] }>(
        [`/api/ideas/${ideaId}/collaboration/messages`],
        (old) => {
          if (!old) return { messages: [newMessage] };
          return { messages: [...old.messages, newMessage] };
        }
      );
      scrollToBottom();
    });

    newSocket.on('user_joined', () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/collaboration/active-users`] });
    });

    newSocket.on('user_left', () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/collaboration/active-users`] });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_idea_room', ideaId);
        newSocket.disconnect();
      }
    };
  }, [open, ideaId, queryClient]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/collaboration/messages`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // AI Chat mutation (analyze/synthesize/critique)
  const aiChatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/collaboration/ai-chat`, {
        messageId: selectedMessageId,
        question,
        conversationContext: messages.map(m => ({
          id: m.id,
          userName: m.userName,
          content: m.content,
          createdAt: m.createdAt,
        })),
        synthesizeState: synthesizeState !== 'idle' ? synthesizeState : undefined,
        synthesizeData: {},
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.synthesizeState) {
        setSynthesizeState(data.synthesizeState);
      } else {
        setSynthesizeState('idle');
      }
      setSelectedMessageId(null);
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      setSynthesizeState('idle');
    },
  });

  // AI Insight mutation
  const aiInsightMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/collaboration/ai-insight`);
      return response.json();
    },
    onSuccess: (data) => {
      // The insight is saved as a message and will appear via socket
      toast({
        title: "AI Insight Generated",
        description: "The AI has analyzed the conversation and added an insight.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insight",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyze = (messageId: string) => {
    setSelectedMessageId(messageId);
    setSynthesizeState('analyzing');
    aiChatMutation.mutate("Analyze this message and provide insights.");
  };

  const handleSynthesize = () => {
    setSelectedMessageId(null);
    setSynthesizeState('synthesizing');
    aiChatMutation.mutate("Synthesize the key points from this conversation.");
  };

  const handleCritique = (messageId: string) => {
    setSelectedMessageId(messageId);
    setSynthesizeState('critiquing');
    aiChatMutation.mutate("Critique this message and provide constructive feedback.");
  };

  // Draggable functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    setIsDragging(true);
    const rect = dialogRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialogRef.current) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        className="max-w-5xl w-full h-[85vh] p-0 flex flex-col"
        style={{
          position: 'fixed',
          left: position.x || '50%',
          top: position.y || '50%',
          transform: position.x ? 'translate(0, 0)' : 'translate(-50%, -50%)',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4 border-b flex-shrink-0 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-muted-foreground" />
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Collaboration Portal
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {ideaTitle} - Real-time collaboration with AI assistant
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {activeUsers.length} active
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.userId !== user?.id && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={msg.userImage || undefined} />
                          <AvatarFallback className={msg.isAI ? 'bg-gradient-to-br from-purple-500 to-pink-500' : ''}>
                            {msg.isAI ? <Sparkles className="w-4 h-4 text-white" /> : msg.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 ${msg.userId === user?.id ? 'flex flex-col items-end' : ''}`}>
                        <div className={`inline-block rounded-lg p-4 max-w-[80%] ${
                          msg.isAI
                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                            : msg.userId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${
                              msg.isAI ? 'text-purple-700 dark:text-purple-300' : ''
                            }`}>
                              {msg.isAI && <Sparkles className="w-3 h-3 inline mr-1" />}
                              {msg.userName}
                            </span>
                            <span className="text-xs opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {!msg.isAI && msg.userId !== user?.id && (
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleAnalyze(msg.id)}
                              disabled={aiChatMutation.isPending}
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              Analyze
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleCritique(msg.id)}
                              disabled={aiChatMutation.isPending}
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Critique
                            </Button>
                          </div>
                        )}
                      </div>
                      {msg.userId === user?.id && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {(user as any)?.firstName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* AI Assistant Actions */}
            <div className="px-6 py-3 border-t bg-muted/30">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSynthesize}
                  disabled={aiChatMutation.isPending || messages.length === 0}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Synthesize Conversation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => aiInsightMutation.mutate()}
                  disabled={aiInsightMutation.isPending || messages.length === 0}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Insight
                </Button>
                {aiChatMutation.isPending && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {synthesizeState === 'analyzing' ? 'Analyzing...' : synthesizeState === 'synthesizing' ? 'Synthesizing...' : 'Critiquing...'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  className="min-h-[80px] resize-none"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  className="h-[80px] w-[80px] flex-shrink-0"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Active Users Sidebar */}
          <Separator orientation="vertical" />
          <div className="w-64 flex-shrink-0 flex flex-col border-l">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Users ({activeUsers.length})
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {activeUsers.map((activeUser) => (
                  <div key={activeUser.userId} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activeUser.userImage || undefined} />
                      <AvatarFallback>
                        {activeUser.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{activeUser.userName}</span>
                    {activeUser.userId === user?.id && (
                      <Badge variant="secondary" className="ml-auto text-xs">You</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

