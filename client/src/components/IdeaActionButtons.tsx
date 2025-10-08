import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThumbsUp, ThumbsDown, Bookmark, Rocket, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface IdeaActionButtonsProps {
  ideaId: string;
  variant?: "default" | "compact";
}

export default function IdeaActionButtons({ ideaId, variant = "default" }: IdeaActionButtonsProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch current interaction status
  const { data: interactionData } = useQuery<{ status: string | null }>({
    queryKey: [`/api/ideas/${ideaId}/interaction`],
    enabled: isAuthenticated,
  });

  const currentStatus = interactionData?.status;

  // Mutation for setting interaction
  const setInteractionMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", `/api/ideas/${ideaId}/interaction`, { status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/interaction`] });
      const messages: Record<string, string> = {
        interested: "Marked as interested! 👍",
        not_interested: "Marked as not interested",
        building: "Great! Marked as building 🚀",
        saved: "Saved for later! 📌",
      };
      toast({ title: messages[status] || "Status updated!" });
    },
    onError: () => {
      toast({ title: "Please sign in to track ideas", variant: "destructive" });
    },
  });

  // Mutation for removing interaction
  const removeInteractionMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("DELETE", `/api/ideas/${ideaId}/interaction`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/interaction`] });
      toast({ title: "Status removed" });
    },
  });

  const handleAction = (status: string) => {
    if (!isAuthenticated) {
      toast({ title: "Please sign in to track ideas", variant: "destructive" });
      return;
    }

    if (currentStatus === status) {
      removeInteractionMutation.mutate(status);
    } else {
      setInteractionMutation.mutate(status);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentStatus === "interested" ? "default" : "outline"}
          onClick={() => handleAction("interested")}
          data-testid="button-interested"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "not_interested" ? "default" : "outline"}
          onClick={() => handleAction("not_interested")}
          data-testid="button-not-interested"
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "saved" ? "default" : "outline"}
          onClick={() => handleAction("saved")}
          data-testid="button-save"
        >
          {currentStatus === "saved" ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "building" ? "default" : "outline"}
          onClick={() => handleAction("building")}
          data-testid="button-building"
        >
          <Rocket className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={currentStatus === "interested" ? "default" : "outline"}
        onClick={() => handleAction("interested")}
        className="flex items-center gap-2"
        data-testid="button-interested"
      >
        <ThumbsUp className="w-4 h-4" />
        Interested
      </Button>
      <Button
        variant={currentStatus === "not_interested" ? "default" : "outline"}
        onClick={() => handleAction("not_interested")}
        className="flex items-center gap-2"
        data-testid="button-not-interested"
      >
        <ThumbsDown className="w-4 h-4" />
        Not Interested
      </Button>
      <Button
        variant={currentStatus === "saved" ? "default" : "outline"}
        onClick={() => handleAction("saved")}
        className="flex items-center gap-2"
        data-testid="button-save"
      >
        {currentStatus === "saved" ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {currentStatus === "saved" ? "Saved" : "Save"}
      </Button>
      <Button
        variant={currentStatus === "building" ? "default" : "outline"}
        onClick={() => handleAction("building")}
        className="flex items-center gap-2"
        data-testid="button-building"
      >
        <Rocket className="w-4 h-4" />
        {currentStatus === "building" ? "Building" : "I'm Building This"}
      </Button>
    </div>
  );
}
