import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Lightbulb, FileText, Image, Sparkles, Code } from "lucide-react";

interface IdeaFormData {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  type: string;
  market: string;
  targetAudience: string;
  keyword: string;
  sourceType: 'user_import' | 'user_generated';
  sourceData: string;
  imageFile?: File;
  
  // AI-generated comprehensive fields
  mainCompetitor?: string;
  revenuePotential?: string;
  executionDifficulty?: string;
  gtmStrength?: string;
  opportunityScore?: number;
  problemScore?: number;
  feasibilityScore?: number;
  timingScore?: number;
  executionScore?: number;
  gtmScore?: number;
  opportunityLabel?: string;
  problemLabel?: string;
  feasibilityLabel?: string;
  timingLabel?: string;
  keywordVolume?: number;
  keywordGrowth?: number;
  
  // Detailed analysis sections
  offerTiers?: any;
  whyNowAnalysis?: string;
  proofSignals?: string;
  marketGap?: string;
  executionPlan?: string;
  frameworkData?: any;
  trendAnalysis?: string;
  keywordData?: any;
  builderPrompts?: any;
}

export default function CreateIdea() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    subtitle: '',
    description: '',
    content: '',
    type: 'web_app',
    market: 'B2C',
    targetAudience: '',
    keyword: '',
    sourceType: 'user_generated',
    sourceData: '',
  });
  
  const [activeTab, setActiveTab] = useState('manual');
  const [importText, setImportText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedHTMLContent, setUploadedHTMLContent] = useState<string | null>(null);
  const [uploadedDocumentContent, setUploadedDocumentContent] = useState<string | null>(null);
  const [isAnalyzingHTML, setIsAnalyzingHTML] = useState(false);
  const [isParsingDocument, setIsParsingDocument] = useState(false);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  const createIdeaMutation = useMutation({
    mutationFn: async (data: IdeaFormData) => {
      // First, upload image if provided
      let imageUrl = '';
      if (data.imageFile) {
        const uploadResponse = await apiRequest('POST', '/api/objects/upload');
        const uploadData = await uploadResponse.json();
        const { uploadURL } = uploadData;
        
        // Upload image to storage
        await fetch(uploadURL, {
          method: 'PUT',
          body: data.imageFile,
          headers: {
            'Content-Type': data.imageFile.type,
          },
        });
        
        // Set object ACL and get the normalized path
        const aclResponse = await apiRequest('POST', '/api/ideas/set-image', { 
          imageURL: uploadURL.split('?')[0] 
        });
        const aclData = await aclResponse.json();
        imageUrl = aclData.objectPath;
      }

      // Create the idea
      const { imageFile, ...ideaData } = data;
      const response = await apiRequest('POST', '/api/ideas', {
        ...ideaData,
        imageUrl,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Success!",
        description: "Your solution has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setLocation(`/idea/${response.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create solution. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating idea:', error);
    },
  });

  const handleInputChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isHTML = file.type === 'text/html' || fileExtension === 'html' || fileExtension === 'htm';
    const isText = file.type === 'text/plain' || fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'markdown';
    const isJSON = file.type === 'application/json' || fileExtension === 'json';
    
    // Handle HTML, text, and JSON files directly in browser
    if (isHTML || isText || isJSON) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (isHTML) {
          setUploadedHTMLContent(content);
        }
        setUploadedDocumentContent(content);
        if (isHTML) {
          setUploadedHTMLContent(content);
        }
        parseImportedContent(content, isHTML ? 'html' : isJSON ? 'text' : 'text');
      };
      reader.readAsText(file);
    } else {
      // For PDF, DOCX, Excel - upload to backend for parsing
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to parse PDF, DOCX, and Excel files.",
          variant: "destructive",
        });
        setUploadedFile(null);
        return;
      }
      
      setIsParsingDocument(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/documents/parse', {
          method: 'POST',
          credentials: 'include', // Include cookies for authentication
          // Don't set Content-Type - let browser set it with boundary for FormData
          body: formData,
        });
        
        if (!response.ok) {
          // Check if response is JSON or HTML
          const contentType = response.headers.get('content-type');
          let errorMessage = 'Failed to parse document';
          
          if (contentType?.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = `${response.status}: ${response.statusText}`;
            }
          } else {
            // If it's HTML (like an error page), get status text
            errorMessage = `${response.status}: ${response.statusText}. Please ensure you're logged in.`;
          }
          
          throw new Error(errorMessage);
        }
        
        // Ensure response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned non-JSON response. Please check authentication.');
        }
        
        const parsed = await response.json();
        setUploadedDocumentContent(parsed.text);
        
        // Also set HTML content for compatibility with existing generate function
        if (fileExtension === 'html' || fileExtension === 'htm') {
          setUploadedHTMLContent(parsed.text);
        }
        
        toast({
          title: "Document Parsed",
          description: `Successfully extracted ${parsed.metadata?.wordCount || 0} words from ${parsed.type.toUpperCase()} file.`,
        });
      } catch (error) {
        console.error('Error parsing document:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to parse document';
        toast({
          title: "Parse Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsParsingDocument(false);
      }
    }
  };

  const handleGenerateFromHTML = async () => {
    const contentToAnalyze = uploadedHTMLContent || uploadedDocumentContent;
    
    if (!contentToAnalyze || !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI-powered document analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzingHTML(true);
    
    try {
      // Use the document endpoint if we have document content, otherwise use HTML endpoint
      const endpoint = uploadedDocumentContent && !uploadedHTMLContent 
        ? '/api/ai/generate-from-document'
        : '/api/ai/generate-from-html';
      
      const payload = uploadedDocumentContent && !uploadedHTMLContent
        ? { textContent: uploadedDocumentContent, documentType: uploadedFile?.name.split('.').pop() }
        : { htmlContent: contentToAnalyze };
      
      const response = await apiRequest('POST', endpoint, payload);
      const generatedIdea = await response.json();
      
      // Map AI response to form data with all comprehensive fields
      setFormData(prev => ({
        ...prev,
        title: generatedIdea.title,
        subtitle: generatedIdea.subtitle,
        description: generatedIdea.description,
        content: generatedIdea.content,
        type: generatedIdea.type,
        market: generatedIdea.market,
        targetAudience: generatedIdea.targetAudience,
        keyword: generatedIdea.keyword,
        mainCompetitor: generatedIdea.mainCompetitor,
        revenuePotential: generatedIdea.revenuePotential,
        executionDifficulty: generatedIdea.executionDifficulty,
        gtmStrength: generatedIdea.gtmStrength,
        opportunityScore: generatedIdea.opportunityScore,
        problemScore: generatedIdea.problemScore,
        feasibilityScore: generatedIdea.feasibilityScore,
        timingScore: generatedIdea.timingScore,
        executionScore: generatedIdea.executionScore,
        gtmScore: generatedIdea.gtmScore,
        opportunityLabel: generatedIdea.opportunityLabel,
        problemLabel: generatedIdea.problemLabel,
        feasibilityLabel: generatedIdea.feasibilityLabel,
        timingLabel: generatedIdea.timingLabel,
        keywordVolume: generatedIdea.keywordVolume,
        keywordGrowth: generatedIdea.keywordGrowth,
        offerTiers: generatedIdea.offerTiers,
        whyNowAnalysis: generatedIdea.whyNowAnalysis,
        proofSignals: generatedIdea.proofSignals,
        marketGap: generatedIdea.marketGap,
        executionPlan: generatedIdea.executionPlan,
        frameworkData: generatedIdea.frameworkData,
        trendAnalysis: generatedIdea.trendAnalysis,
        keywordData: generatedIdea.keywordData,
        builderPrompts: generatedIdea.builderPrompts,
        communitySignals: generatedIdea.communitySignals,
        signalBadges: generatedIdea.signalBadges,
        sourceType: 'user_import',
        sourceData: uploadedHTMLContent || uploadedDocumentContent || '',
      }));
      
      // Switch to manual tab to review/edit the generated idea
      setActiveTab('manual');
      
      toast({
        title: "Solution Generated from HTML!",
        description: "Your solution has been analyzed and generated. Review and edit as needed.",
      });
    } catch (error) {
      console.error('Error generating from HTML:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate solution from HTML. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingHTML(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const parseImportedContent = (content: string, type: 'html' | 'text') => {
    let parsedData: Partial<IdeaFormData> = {
      sourceType: 'user_import',
      sourceData: content,
    };

    if (type === 'html') {
      // Simple HTML parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Try to extract title
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || '';
      
      // Try to extract description from meta or content
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const firstParagraph = doc.querySelector('p')?.textContent || '';
      
      parsedData = {
        ...parsedData,
        title: title.trim(),
        description: metaDescription || firstParagraph.trim(),
        content: content, // Keep original HTML as content
      };
    } else {
      // Simple text parsing
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        parsedData = {
          ...parsedData,
          title: lines[0].trim(),
          description: lines.slice(1, 3).join(' ').trim(),
          content: content,
        };
      }
    }

    setFormData(prev => ({ ...prev, ...parsedData }));
    setActiveTab('manual'); // Switch to manual tab to review/edit
  };

  const handleImportText = () => {
    if (importText.trim()) {
      parseImportedContent(importText, 'text');
      setImportText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and description.",
        variant: "destructive",
      });
      return;
    }

    createIdeaMutation.mutate(formData);
  };

  const [aiParams, setAiParams] = useState({
    industry: '',
    type: 'web_app',
    market: 'B2C',
    targetAudience: '',
    problemArea: '',
    constraints: '',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use AI-powered solution generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/generate-idea', aiParams);
      const generatedIdea = await response.json();
      
      // Map AI response to form data with all comprehensive fields
      setFormData(prev => ({
        ...prev,
        title: generatedIdea.title,
        subtitle: generatedIdea.subtitle,
        description: generatedIdea.description,
        content: generatedIdea.content,
        type: generatedIdea.type,
        market: generatedIdea.market,
        targetAudience: generatedIdea.targetAudience,
        keyword: generatedIdea.keyword,
        mainCompetitor: generatedIdea.mainCompetitor,
        revenuePotential: generatedIdea.revenuePotential,
        executionDifficulty: generatedIdea.executionDifficulty,
        gtmStrength: generatedIdea.gtmStrength,
        opportunityScore: generatedIdea.opportunityScore,
        problemScore: generatedIdea.problemScore,
        feasibilityScore: generatedIdea.feasibilityScore,
        timingScore: generatedIdea.timingScore,
        executionScore: generatedIdea.executionScore,
        gtmScore: generatedIdea.gtmScore,
        opportunityLabel: generatedIdea.opportunityLabel,
        problemLabel: generatedIdea.problemLabel,
        feasibilityLabel: generatedIdea.feasibilityLabel,
        timingLabel: generatedIdea.timingLabel,
        keywordVolume: generatedIdea.keywordVolume,
        keywordGrowth: generatedIdea.keywordGrowth,
        offerTiers: generatedIdea.offerTiers,
        whyNowAnalysis: generatedIdea.whyNowAnalysis,
        proofSignals: generatedIdea.proofSignals,
        marketGap: generatedIdea.marketGap,
        executionPlan: generatedIdea.executionPlan,
        frameworkData: generatedIdea.frameworkData,
        trendAnalysis: generatedIdea.trendAnalysis,
        keywordData: generatedIdea.keywordData,
        builderPrompts: generatedIdea.builderPrompts,
        communitySignals: generatedIdea.communitySignals,
        signalBadges: generatedIdea.signalBadges,
        sourceType: 'user_generated',
        sourceData: 'AI Generated',
      }));
      
      // Switch to manual tab to review/edit the generated idea
      setActiveTab('manual');
      
      toast({
        title: "AI Solution Generated!",
        description: "Your AI-generated startup solution is ready for review.",
      });
    } catch (error) {
      console.error('Error generating AI idea:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-8 h-8 mr-3 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Create New Solution
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Import existing content or create a new startup solution from scratch
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="import" className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Upload Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept=".html,.htm,.pdf,.docx,.xlsx,.xls,.md,.markdown,.json,.txt"
                    onChange={handleFileUpload}
                    className="mb-4"
                    data-testid="input-file-upload"
                    disabled={isParsingDocument}
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a document (HTML, PDF, DOCX, Excel, Markdown, JSON, or TXT) to extract and analyze content
                  </p>
                  {isParsingDocument && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Parsing document...
                    </div>
                  )}
                  {uploadedFile && (
                    <div className="space-y-3">
                      <Badge variant="secondary" className="mt-2">
                        {uploadedFile.name}
                      </Badge>
                      {(uploadedHTMLContent || uploadedDocumentContent) && !isParsingDocument && (
                        <div>
                          <Button 
                            onClick={handleGenerateFromHTML} 
                            disabled={isAnalyzingHTML || !isAuthenticated}
                            className="w-full"
                            data-testid="button-generate-from-document"
                          >
                            {isAnalyzingHTML ? (
                              <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing Document...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Solution from {uploadedFile?.name.split('.').pop()?.toUpperCase() || 'Document'}
                              </>
                            )}
                          </Button>
                          {!isAuthenticated && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Please log in to use AI-powered analysis
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Paste Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your solution description, business plan, or instructions here..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="min-h-32 mb-4"
                    data-testid="textarea-import-text"
                  />
                  <Button 
                    onClick={handleImportText} 
                    disabled={!importText.trim()}
                    data-testid="button-import-text"
                  >
                    Parse Content
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Your startup solution title"
                        data-testid="input-title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                        placeholder="Brief revenue potential or tagline"
                        data-testid="input-subtitle"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of your solution"
                        className="min-h-24"
                        data-testid="textarea-description"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Categorization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_app">Mobile App</SelectItem>
                          <SelectItem value="web_app">Web App</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Market</Label>
                      <Select value={formData.market} onValueChange={(value) => handleInputChange('market', value)}>
                        <SelectTrigger data-testid="select-market">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="B2B2C">B2B2C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="e.g., small business owners"
                        data-testid="input-target-audience"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="keyword">Main Keyword</Label>
                      <Input
                        id="keyword"
                        value={formData.keyword}
                        onChange={(e) => handleInputChange('keyword', e.target.value)}
                        placeholder="Primary search keyword"
                        data-testid="input-keyword"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Image & Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="image">Solution Image</Label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      data-testid="input-image-upload"
                    />
                    {formData.imageFile && (
                      <Badge variant="secondary" className="mt-2">
                        {formData.imageFile.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Detailed Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Detailed description, business model, market analysis, etc."
                      className="min-h-48"
                      data-testid="textarea-content"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/database')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createIdeaMutation.isPending || !formData.title || !formData.description}
                  data-testid="button-create-idea"
                >
                  {createIdeaMutation.isPending ? 'Creating...' : 'Create Solution'}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI-Powered Idea Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-industry">Industry Focus</Label>
                      <Input
                        id="ai-industry"
                        value={aiParams.industry}
                        onChange={(e) => setAiParams(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., healthcare, fintech, education"
                        data-testid="input-ai-industry"
                      />
                    </div>
                    
                    <div>
                      <Label>Startup Type</Label>
                      <Select value={aiParams.type} onValueChange={(value) => setAiParams(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger data-testid="select-ai-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_app">Mobile App</SelectItem>
                          <SelectItem value="web_app">Web App</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Target Market</Label>
                      <Select value={aiParams.market} onValueChange={(value) => setAiParams(prev => ({ ...prev, market: value }))}>
                        <SelectTrigger data-testid="select-ai-market">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="B2B2C">B2B2C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-audience">Target Audience</Label>
                      <Input
                        id="ai-audience"
                        value={aiParams.targetAudience}
                        onChange={(e) => setAiParams(prev => ({ ...prev, targetAudience: e.target.value }))}
                        placeholder="e.g., small business owners, students"
                        data-testid="input-ai-audience"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ai-problem">Problem Area</Label>
                      <Input
                        id="ai-problem"
                        value={aiParams.problemArea}
                        onChange={(e) => setAiParams(prev => ({ ...prev, problemArea: e.target.value }))}
                        placeholder="e.g., productivity, communication, analytics"
                        data-testid="input-ai-problem"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ai-constraints">Additional Context</Label>
                      <Textarea
                        id="ai-constraints"
                        value={aiParams.constraints}
                        onChange={(e) => setAiParams(prev => ({ ...prev, constraints: e.target.value }))}
                        placeholder="Any specific requirements or constraints..."
                        className="min-h-16"
                        data-testid="textarea-ai-constraints"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4 border-t">
                  <Button 
                    onClick={generateWithAI} 
                    disabled={isGenerating || !isAuthenticated}
                    size="lg"
                    className="min-w-48"
                    data-testid="button-ai-generate"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Solution...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Solution
                      </>
                    )}
                  </Button>
                  
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Please log in to use AI-powered solution generation
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    AI will generate a comprehensive startup solution with market analysis, scoring, and detailed business insights based on your preferences.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}