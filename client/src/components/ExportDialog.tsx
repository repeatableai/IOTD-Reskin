import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileJson, 
  FileText, 
  File, 
  ExternalLink, 
  Copy, 
  Check, 
  Loader2,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId: string;
  ideaSlug: string;
  ideaTitle: string;
}

// Notion icon SVG
const NotionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.934-.56.934-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.763 7.278v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM2.64 1.782l13.635-.933c1.68-.14 2.1.093 2.803.607l3.874 2.686c.56.42.747.933.747 1.54v15.697c0 .98-.373 1.54-1.68 1.634l-15.458.933c-.98.047-1.448-.093-1.962-.747l-3.127-4.06c-.56-.747-.793-1.306-.793-1.96V2.996c0-.84.373-1.26 1.96-1.214z"/>
  </svg>
);

// Google Docs icon SVG
const GoogleDocsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-2.727H7.091v-1.364h9.818v1.364zm0-2.728H7.091V10.364h9.818v1.363zm-2.182-8.181V6.727h3.819l-3.819-3.181z" fill="#4285F4"/>
  </svg>
);

export default function ExportDialog({ 
  open, 
  onOpenChange, 
  ideaId, 
  ideaSlug, 
  ideaTitle 
}: ExportDialogProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("download");
  const [notionToken, setNotionToken] = useState("");
  const [notionPageId, setNotionPageId] = useState("");
  const [copied, setCopied] = useState(false);

  // Download export
  const handleDownload = (format: string) => {
    const url = `/api/ideas/${ideaId}/export?format=${format}`;
    window.open(url, '_blank');
    toast({
      title: "Download Started",
      description: `Your ${format.toUpperCase()} file is being downloaded.`,
    });
  };

  // Notion export mutation
  const notionExportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/export/notion`, { 
        notionToken,
        parentPageId: notionPageId || undefined 
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Exported to Notion! 📝",
        description: "Your idea has been exported to Notion.",
      });
      if (data.url) {
        window.open(data.url, '_blank');
      }
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Google Docs export mutation
  const googleDocsExportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/ideas/${ideaId}/export/google-docs`);
      return response.json();
    },
    onSuccess: (data) => {
      // Copy content to clipboard
      navigator.clipboard.writeText(data.content);
      toast({
        title: "Content Copied! 📋",
        description: "Paste into Google Docs after it opens.",
      });
      // Open Google Docs
      window.open(data.url, '_blank');
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Copy to clipboard
  const handleCopyToClipboard = async (format: 'markdown' | 'text') => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/export/clipboard?format=${format}`);
      const data = await response.json();
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: `${format === 'markdown' ? 'Markdown' : 'Text'} content copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export "{ideaTitle}"
          </DialogTitle>
          <DialogDescription>
            Choose how you want to export this idea's research and analysis.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="clipboard">Copy</TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Download the complete research as a file.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleDownload('pdf')}
              >
                <File className="w-8 h-8 text-red-500" />
                <span className="font-medium">PDF</span>
                <span className="text-xs text-muted-foreground">Best for sharing</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleDownload('markdown')}
              >
                <BookOpen className="w-8 h-8 text-purple-500" />
                <span className="font-medium">Markdown</span>
                <span className="text-xs text-muted-foreground">For docs & notes</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleDownload('txt')}
              >
                <FileText className="w-8 h-8 text-gray-500" />
                <span className="font-medium">Plain Text</span>
                <span className="text-xs text-muted-foreground">Simple format</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleDownload('json')}
              >
                <FileJson className="w-8 h-8 text-amber-500" />
                <span className="font-medium">JSON</span>
                <span className="text-xs text-muted-foreground">For developers</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Export directly to your favorite apps.
            </p>
            
            {/* Notion Export */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <NotionIcon />
                <span className="font-medium">Notion</span>
              </div>
              
              {!isAuthenticated ? (
                <p className="text-sm text-amber-600">Sign in to export to Notion</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notion-token" className="text-xs">
                      Integration Token
                      <a 
                        href="https://www.notion.so/my-integrations" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        Get token →
                      </a>
                    </Label>
                    <Input
                      id="notion-token"
                      type="password"
                      placeholder="secret_..."
                      value={notionToken}
                      onChange={(e) => setNotionToken(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notion-page" className="text-xs">
                      Parent Page ID (optional)
                    </Label>
                    <Input
                      id="notion-page"
                      placeholder="Leave empty to create in workspace root"
                      value={notionPageId}
                      onChange={(e) => setNotionPageId(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => notionExportMutation.mutate()}
                    disabled={!notionToken || notionExportMutation.isPending}
                  >
                    {notionExportMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Export to Notion
                  </Button>
                </>
              )}
            </div>

            {/* Google Docs Export */}
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <GoogleDocsIcon />
                <span className="font-medium">Google Docs</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Creates a new Google Doc and copies the content to your clipboard.
              </p>
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => googleDocsExportMutation.mutate()}
                disabled={googleDocsExportMutation.isPending}
              >
                {googleDocsExportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Create Google Doc
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="clipboard" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Copy to clipboard and paste anywhere.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleCopyToClipboard('markdown')}
              >
                {copied ? (
                  <Check className="w-8 h-8 text-green-500" />
                ) : (
                  <Copy className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="font-medium">Copy Markdown</span>
                <span className="text-xs text-muted-foreground">For Notion, Obsidian</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleCopyToClipboard('text')}
              >
                {copied ? (
                  <Check className="w-8 h-8 text-green-500" />
                ) : (
                  <Copy className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="font-medium">Copy Plain Text</span>
                <span className="text-xs text-muted-foreground">For any app</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

