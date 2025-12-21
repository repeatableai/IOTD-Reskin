import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

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
  const [iframeError, setIframeError] = useState(false);
  
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
  
  // Reset error when modal opens/closes or URL changes
  useEffect(() => {
    if (open) {
      setIframeError(false);
    }
  }, [open, previewUrl]);
  
  const handleOpenInNewTab = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleGoToDetails = () => {
    onOpenChange(false);
    setLocation(`/idea/${ideaSlug}`);
  };
  
  const handleIframeError = () => {
    setIframeError(true);
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
          {iframeError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-muted-foreground mb-4">
                The preview cannot be displayed in this window due to security restrictions.
              </p>
              <Button onClick={handleOpenInNewTab} variant="default">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Preview in New Tab
              </Button>
            </div>
          ) : (
            <iframe
              src={fullUrl}
              className="w-full h-full border-0 absolute inset-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-presentation"
              allow="fullscreen; autoplay; camera; microphone; geolocation"
              title="App Preview"
              loading="lazy"
              style={{ width: '100%', height: '100%' }}
              allowFullScreen
              onError={handleIframeError}
              onLoad={(e) => {
                // Check if iframe loaded but is blocked (contentWindow will be null if blocked)
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  if (iframe.contentWindow === null && iframe.contentDocument === null) {
                    // Iframe might be blocked, but we can't reliably detect this
                    // The onError handler will catch actual load failures
                  }
                } catch (err) {
                  // Cross-origin restrictions prevent checking, which is normal
                }
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

