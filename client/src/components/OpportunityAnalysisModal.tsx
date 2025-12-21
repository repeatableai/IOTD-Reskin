import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface OpportunityAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string;
  ideaTitle: string;
  ideaSlug: string;
}

export function OpportunityAnalysisModal({ 
  open, 
  onOpenChange, 
  previewUrl, 
  ideaTitle,
  ideaSlug 
}: OpportunityAnalysisModalProps) {
  const [, setLocation] = useLocation();
  
  // Validate URL before rendering
  const isValidUrl = (url: string): boolean => {
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(fullUrl);
      return true;
    } catch {
      return false;
    }
  };

  const fullUrl = previewUrl.startsWith('http') ? previewUrl : `https://${previewUrl}`;
  
  const handleOpenInNewTab = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleGoToDetails = () => {
    onOpenChange(false);
    setLocation(`/idea/${ideaSlug}`);
  };

  if (!isValidUrl(previewUrl)) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invalid Preview URL</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            The preview URL is invalid or cannot be displayed.
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <DialogTitle>Opportunity Analysis - {ideaTitle}</DialogTitle>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: '200px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                style={{ width: '100%' }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToDetails}
                style={{ width: '100%' }}
              >
                Details & Build Plan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative min-h-0" style={{ height: 'calc(90vh - 120px)' }}>
          <iframe
            src={fullUrl}
            className="w-full h-full border-0 absolute inset-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            title="App Preview"
            loading="lazy"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

