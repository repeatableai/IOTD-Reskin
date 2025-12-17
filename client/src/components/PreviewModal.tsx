import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ExternalLink, X } from "lucide-react";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string;
  title?: string;
}

export function PreviewModal({ open, onOpenChange, previewUrl, title }: PreviewModalProps) {
  // Validate URL before rendering
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
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
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title || "App Preview"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 relative">
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            title="App Preview"
            loading="lazy"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

