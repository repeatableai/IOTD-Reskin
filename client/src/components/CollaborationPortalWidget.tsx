import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCollaborationPortal } from "@/contexts/CollaborationPortalContext";
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
  Maximize2,
  Minimize2,
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

export function CollaborationPortalWidget() {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const { portalState, closePortal, updatePosition, toggleExpand } = useCollaborationPortal();
  const { ideaId, ideaTitle, isOpen, position, isExpanded } = portalState;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [synthesizeState, setSynthesizeState] = useState<'idle' | 'analyzing' | 'synthesizing' | 'critiquing'>('idle');
  const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1920, height: typeof window !== 'undefined' ? window.innerHeight : 1080 });

  // Fetch messages - hooks must be called unconditionally
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<{ messages: Message[] }>({
    queryKey: [`/api/ideas/${ideaId}/collaboration/messages`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ideas/${ideaId}/collaboration/messages`);
      return response.json();
    },
    enabled: isOpen && !!ideaId,
    refetchInterval: false,
  });

  // Fetch active users - hooks must be called unconditionally
  const { data: activeUsersData } = useQuery<{ users: ActiveUser[]; count: number }>({
    queryKey: [`/api/ideas/${ideaId}/collaboration/active-users`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/ideas/${ideaId}/collaboration/active-users`);
      return response.json();
    },
    enabled: isOpen && !!ideaId,
    refetchInterval: 5000,
  });

  // Window resize handler - hooks must be called unconditionally
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom helper function (defined before hooks that use it)
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Send message mutation - hooks must be called unconditionally
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!ideaId) throw new Error('Idea ID is required');
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

  // AI Chat mutation - hooks must be called unconditionally
  const aiChatMutation = useMutation({
    mutationFn: async ({ question, messages: msgList }: { question: string; messages: Message[] }) => {
      if (!ideaId) throw new Error('Idea ID is required');
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/collaboration/ai-chat`, {
        messageId: selectedMessageId,
        question,
        conversationContext: msgList.map(m => ({
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

  // AI Insight mutation - hooks must be called unconditionally
  const aiInsightMutation = useMutation({
    mutationFn: async () => {
      if (!ideaId) throw new Error('Idea ID is required');
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/collaboration/ai-insight`);
      return response.json();
    },
    onSuccess: () => {
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

  // Socket.IO connection - hooks must be called unconditionally
  useEffect(() => {
    if (!isOpen || !ideaId) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

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
  }, [isOpen, ideaId, queryClient]);

  // Scroll to bottom when messages change - hooks must be called unconditionally
  useEffect(() => {
    const messages = messagesData?.messages || [];
    if (messages.length > 0 && isOpen) {
      scrollToBottom();
    }
  }, [messagesData?.messages?.length, isOpen]);

  // Draggable mouse move handler - hooks must be called unconditionally
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;
      const widgetWidth = widgetRef.current.offsetWidth || 350;
      const widgetHeight = widgetRef.current.offsetHeight || 500;
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - widgetWidth));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - widgetHeight));
      updatePosition(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, updatePosition]);

  // Early return AFTER all hooks
  if (!isOpen || !ideaId || !ideaTitle) {
    return null;
  }

  const messages = messagesData?.messages || [];
  const activeUsers = activeUsersData?.users || [];

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages in the collaboration portal.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyze = (messageId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI features.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMessageId(messageId);
    setSynthesizeState('analyzing');
    aiChatMutation.mutate({ question: "Analyze this message and provide insights.", messages });
  };

  const handleSynthesize = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI features.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMessageId(null);
    setSynthesizeState('synthesizing');
    aiChatMutation.mutate({ question: "Synthesize the key points from this conversation.", messages });
  };

  const handleCritique = (messageId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI features.",
        variant: "destructive",
      });
      return;
    }
    setSelectedMessageId(messageId);
    setSynthesizeState('critiquing');
    aiChatMutation.mutate({ question: "Critique this message and provide constructive feedback.", messages });
  };

  // Draggable functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!headerRef.current || !widgetRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;
      const widgetWidth = widgetRef.current.offsetWidth || 350;
      const widgetHeight = widgetRef.current.offsetHeight || 500;
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - widgetWidth));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - widgetHeight));
      updatePosition(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, updatePosition]);

  // Calculate widget dimensions - smaller default size
  const widgetWidth = isExpanded ? 500 : 350;
  const widgetHeight = isExpanded ? Math.max(400, Math.floor(windowSize.height / 3)) : 500;
  
  // Constrain position to viewport
  const constrainedPosition = {
    x: Math.max(0, Math.min(position.x, windowSize.width - widgetWidth)),
    y: Math.max(0, Math.min(position.y, windowSize.height - widgetHeight)),
  };

  return (
    <div
      ref={widgetRef}
      className="fixed z-50 bg-background border-2 border-primary/20 rounded-lg shadow-2xl flex flex-col"
      style={{
        width: `${widgetWidth}px`,
        height: `${widgetHeight}px`,
        left: `${constrainedPosition.x}px`,
        top: `${constrainedPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Header - Draggable */}
      <div
        ref={headerRef}
        className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm truncate">Collaboration Portal</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
              <Users className="w-3 h-3" />
              {activeUsers.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-7 w-7"
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closePortal}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{ideaTitle}</p>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.userId !== user?.id && (
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={msg.userImage || undefined} />
                        <AvatarFallback className={msg.isAI ? 'bg-gradient-to-br from-purple-500 to-pink-500' : ''}>
                          {msg.isAI ? <Sparkles className="w-3 h-3 text-white" /> : msg.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 ${msg.userId === user?.id ? 'flex flex-col items-end' : ''}`}>
                      <div className={`inline-block rounded-lg p-2 max-w-[85%] text-xs ${
                        msg.isAI
                          ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                          : msg.userId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-semibold ${
                            msg.isAI ? 'text-purple-700 dark:text-purple-300' : ''
                          }`}>
                            {msg.isAI && <Sparkles className="w-2.5 h-2.5 inline mr-1" />}
                            {msg.userName}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      {!msg.isAI && msg.userId !== user?.id && (
                        <div className="flex gap-1 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] px-1.5"
                            onClick={() => handleAnalyze(msg.id)}
                            disabled={aiChatMutation.isPending}
                          >
                            <Brain className="w-2.5 h-2.5 mr-0.5" />
                            Analyze
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] px-1.5"
                            onClick={() => handleCritique(msg.id)}
                            disabled={aiChatMutation.isPending}
                          >
                            <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                            Critique
                          </Button>
                        </div>
                      )}
                    </div>
                    {msg.userId === user?.id && (
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-[10px]">
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
          {isAuthenticated && (
            <div className="px-3 py-2 border-t bg-muted/30 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={handleSynthesize}
                  disabled={aiChatMutation.isPending || messages.length === 0}
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Synthesize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => aiInsightMutation.mutate()}
                  disabled={aiInsightMutation.isPending || messages.length === 0}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Insight
                </Button>
                {aiChatMutation.isPending && (
                  <Badge variant="secondary" className="flex items-center gap-1 h-7 text-xs px-2">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    {synthesizeState === 'analyzing' ? 'Analyzing...' : synthesizeState === 'synthesizing' ? 'Synthesizing...' : 'Critiquing...'}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="px-3 py-2 border-t flex-shrink-0">
            {!isAuthenticated ? (
              <div className="flex items-center justify-center py-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Please log in to send messages.
                </p>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[60px] max-h-[100px] resize-none text-xs"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  className="h-[60px] w-[60px] flex-shrink-0"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active Users Sidebar */}
        <Separator orientation="vertical" />
        <div className="w-32 flex-shrink-0 flex flex-col border-l">
          <div className="px-2 py-2 border-b">
            <h3 className="text-xs font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" />
              Active ({activeUsers.length})
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {activeUsers.map((activeUser) => (
                <div key={activeUser.userId} className="flex items-center gap-1.5">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={activeUser.userImage || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {activeUser.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium truncate">{activeUser.userName}</span>
                  {activeUser.userId === user?.id && (
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

