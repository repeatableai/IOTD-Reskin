import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [cspBlocked, setCspBlocked] = useState(false);
  
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
  
  // Check if URL is genspark.ai (known to block iframe embedding via CSP)
  const isGensparkAi = fullUrl.includes('genspark.ai');
  
  // Reset error when modal opens/closes or URL changes
  useEffect(() => {
    if (open) {
      setIframeError(false);
      setCspBlocked(false);
      // Don't immediately block - let it try to load first
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
  
  // Listen for CSP violations
  useEffect(() => {
    if (!open) return;
    
    const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
      if (e.violatedDirective === 'frame-ancestors' || e.blockedURI?.includes('genspark.ai')) {
        setCspBlocked(true);
        setIframeError(true);
      }
    };
    
    // Note: CSP violations may not always fire this event, so we also check URL
    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, [open]);

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
        <DialogHeader className="px-3 py-2 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm font-medium truncate max-w-[200px]" title={ideaTitle}>
              {ideaTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Interactive preview
            </DialogDescription>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-7 px-2 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                New Tab
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToDetails}
                className="h-7 px-2 text-xs"
              >
                Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative min-h-0" style={{ height: 'calc(90vh - 44px)' }}>
          {iframeError || cspBlocked ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {cspBlocked
                  ? "This preview cannot be displayed in a pop-up window due to security restrictions. Please use the button below to open it in a new tab."
                  : "The preview cannot be displayed in this window due to security restrictions."}
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
              title={`App Preview - ${ideaTitle}`}
              loading="lazy"
              style={{ width: '100%', height: '100%' }}
              onError={handleIframeError}
              onLoad={(e) => {
                // Iframe loaded successfully - check if it's actually blocked
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  // For genspark.ai, check if CSP blocked after a short delay
                  if (isGensparkAi) {
                    setTimeout(() => {
                      try {
                        // Try to access contentWindow - if CSP blocked, this will fail
                        if (iframe.contentWindow === null || iframe.contentDocument === null) {
                          // Might be CSP blocked, but don't assume - let it try
                        }
                      } catch (err) {
                        // Cross-origin restrictions are normal, not necessarily CSP blocking
                      }
                    }, 500);
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

