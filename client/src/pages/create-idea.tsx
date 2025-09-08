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
        description: "Your idea has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setLocation(`/idea/${response.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create idea. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating idea:', error);
    },
  });

  const handleInputChange = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        // Read HTML file
        const reader = new FileReader();
        reader.onload = (e) => {
          const htmlContent = e.target?.result as string;
          parseImportedContent(htmlContent, 'html');
        };
        reader.readAsText(file);
      }
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

  const generateWithAI = () => {
    // Placeholder for AI generation
    toast({
      title: "AI Generation",
      description: "AI-powered idea generation coming soon!",
    });
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
              Create New Idea
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Import existing content or create a new startup idea from scratch
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
                    Upload HTML File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="mb-4"
                    data-testid="input-file-upload"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload an HTML file to automatically extract idea details
                  </p>
                  {uploadedFile && (
                    <Badge variant="secondary" className="mt-2">
                      {uploadedFile.name}
                    </Badge>
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
                    placeholder="Paste your idea description, business plan, or instructions here..."
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
                        placeholder="Your startup idea title"
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
                        placeholder="Brief description of your idea"
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
                    <Label htmlFor="image">Idea Image</Label>
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
                  {createIdeaMutation.isPending ? 'Creating...' : 'Create Idea'}
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
              <CardContent className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  AI-powered idea generation and analysis will be available soon!
                </p>
                <Button onClick={generateWithAI} disabled data-testid="button-ai-generate">
                  Generate with AI
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}