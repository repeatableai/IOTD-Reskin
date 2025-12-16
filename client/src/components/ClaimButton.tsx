import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Flag, Loader2, Users, Trophy, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface ClaimButtonProps {
  ideaId: string;
  ideaTitle: string;
  compact?: boolean;
}

interface ClaimStatus {
  isClaimed: boolean;
  claimedBy: string | null;
  claimedAt: string | null;
  claimProgress: number;
  claimCount: number;
  claimer?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export default function ClaimButton({ ideaId, ideaTitle, compact = false }: ClaimButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch claim status
  const { data: claimStatus, isLoading } = useQuery<ClaimStatus>({
    queryKey: [`/api/ideas/${ideaId}/claim`],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/claim`);
      if (!response.ok) throw new Error('Failed to fetch claim status');
      return response.json();
    },
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/claim`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/claim`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/claimed-ideas'] });
      setShowDialog(false);
      toast({
        title: "Idea Claimed! 🎉",
        description: `You've claimed "${ideaTitle}". Time to build!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't Claim",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unclaim mutation
  const unclaimMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/ideas/${ideaId}/claim`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/claim`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/claimed-ideas'] });
      toast({
        title: "Claim Released",
        description: "The idea is now available for others to claim.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      const response = await apiRequest('PUT', `/api/ideas/${ideaId}/claim/progress`, { progress: newProgress });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}/claim`] });
      setShowProgressDialog(false);
      toast({
        title: "Progress Updated",
        description: `Progress set to ${progress}%`,
      });
    },
  });

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  const isClaimedByMe = claimStatus?.claimedBy === user?.id;
  const isClaimedByOther = claimStatus?.isClaimed && !isClaimedByMe;

  // Compact badge view for sidebar/cards
  if (compact) {
    if (!claimStatus?.isClaimed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setShowDialog(true)}>
              <Flag className="w-3 h-3 mr-1" />
              Claim
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Claim this idea to start building</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`${isClaimedByMe ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}
          >
            <Check className="w-3 h-3 mr-1" />
            {isClaimedByMe ? 'Your Claim' : 'Claimed'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isClaimedByMe ? 'You are building this idea' : `Claimed by ${claimStatus.claimer?.firstName || 'someone'}`}</p>
          {claimStatus.claimProgress > 0 && <p>Progress: {claimStatus.claimProgress}%</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full button view
  if (!claimStatus?.isClaimed) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <Flag className="w-4 h-4 mr-2" />
            Claim This Idea
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-violet-600" />
              Claim "{ideaTitle}"
            </DialogTitle>
            <DialogDescription>
              Claiming an idea publicly commits you to building it. Others can see that you're working on this.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium">Create accountability</p>
                <p className="text-sm text-muted-foreground">Track your progress publicly</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Join {claimStatus?.claimCount || 0} others</p>
                <p className="text-sm text-muted-foreground">Who have worked on this idea</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">No time limit</p>
                <p className="text-sm text-muted-foreground">Release your claim anytime</p>
              </div>
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
              You need to be signed in to claim ideas.
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => claimMutation.mutate()}
              disabled={!isAuthenticated || claimMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Claim Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Already claimed view
  if (isClaimedByMe) {
    return (
      <div className="flex items-center gap-2">
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400">
              <Check className="w-4 h-4 mr-2" />
              Your Claim ({claimStatus.claimProgress}%)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Your Progress</DialogTitle>
              <DialogDescription>
                Track how far along you are with building this idea.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress || claimStatus.claimProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress || claimStatus.claimProgress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full"
              />
              <Progress value={progress || claimStatus.claimProgress} className="mt-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Just started</span>
                <span>Launched!</span>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="destructive" 
                onClick={() => unclaimMutation.mutate()}
                disabled={unclaimMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Release Claim
              </Button>
              <Button 
                onClick={() => updateProgressMutation.mutate(progress || claimStatus.claimProgress)}
                disabled={updateProgressMutation.isPending}
              >
                {updateProgressMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Claimed by someone else
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
          <Avatar className="w-6 h-6">
            <AvatarImage src={claimStatus.claimer?.profileImageUrl || undefined} />
            <AvatarFallback>
              {claimStatus.claimer?.firstName?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="text-muted-foreground">Claimed by </span>
            <span className="font-medium">
              {claimStatus.claimer?.firstName || 'Someone'}
            </span>
          </div>
          {claimStatus.claimProgress > 0 && (
            <Badge variant="secondary" className="ml-2">
              {claimStatus.claimProgress}%
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>This idea is being built by {claimStatus.claimer?.firstName || 'someone'}</p>
        {claimStatus.claimedAt && (
          <p className="text-xs text-muted-foreground">
            Claimed {new Date(claimStatus.claimedAt).toLocaleDateString()}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

