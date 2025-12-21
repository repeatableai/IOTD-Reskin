import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Lightbulb, FileText, Image, Sparkles, Code, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  communitySignals?: any;
  signalBadges?: string[];
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
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportJobId, setBulkImportJobId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  const createIdeaMutation = useMutation({
    mutationFn: async (data: IdeaFormData & { imageUrl?: string }) => {
      // Handle image: either upload file or use provided URL
      let imageUrl = data.imageUrl || '';
      
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
      } else if (data.imageUrl && data.imageUrl.startsWith('http')) {
        // If it's a direct URL (like from DALL-E), use it directly
        // Note: External URLs may need to be downloaded and uploaded to storage
        // For now, we'll pass it directly and let the backend handle it
        imageUrl = data.imageUrl;
      }

      // Create the idea
      const { imageFile, ...ideaData } = data;
      
      // Ensure content field is set - use description as fallback if content is empty
      const ideaPayload = {
        ...ideaData,
        content: ideaData.content || ideaData.description || 'No detailed content provided.',
        imageUrl,
      };
      
      const response = await apiRequest('POST', '/api/ideas', ideaPayload);
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

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log(`[Bulk Import] 🚀 Starting bulk import upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest('POST', '/api/ideas/bulk-import', formData);
      return res.json();
    },
    onSuccess: (data) => {
      console.log(`[Bulk Import] ✅ Upload successful! Job ID: ${data.jobId}`);
      setBulkImportJobId(data.jobId);
      toast({
        title: "Bulk Import Started",
        description: `Job ${data.jobId} has been queued for processing.`,
      });
    },
    onError: (error: any) => {
      console.error(`[Bulk Import] ❌ Upload failed:`, error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Job status query
  const { data: bulkImportJobStatus } = useQuery({
    queryKey: ['/api/import-jobs', bulkImportJobId],
    queryFn: async () => {
      if (!bulkImportJobId) return null;
      const res = await apiRequest('GET', `/api/import-jobs/${bulkImportJobId}`);
      const status = await res.json();
      
      // Log progress updates
      if (status) {
        const progress = status.totalRows > 0 
          ? Math.round((status.processedRows / status.totalRows) * 100)
          : 0;
        const successRate = status.processedRows > 0
          ? Math.round((status.successfulRows / status.processedRows) * 100)
          : 0;
        
        console.log(
          `[Bulk Import ${bulkImportJobId}] 📊 Status: ${status.status} | ` +
          `Progress: ${status.processedRows}/${status.totalRows} (${progress}%) | ` +
          `✅ ${status.successfulRows || 0} successful | ` +
          `❌ ${status.failedRows || 0} failed | ` +
          `Success rate: ${successRate}%`
        );
        
        // Log errors if any
        if (status.errors && status.errors.length > 0) {
          const recentErrors = status.errors.slice(-5); // Last 5 errors
          recentErrors.forEach((err: any) => {
            console.error(`[Bulk Import ${bulkImportJobId}] Row ${err.row} failed: ${err.error.substring(0, 100)}`);
          });
        }
      }
      
      return status;
    },
    enabled: !!bulkImportJobId,
    refetchInterval: (query) => {
      // Always refetch if status is 'processing', even if data is null/undefined
      const status = query.state.data?.status;
      if (!query.state.data || status === 'processing') {
        return 2000; // 2 seconds
      }
      return false;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
        
        // Use apiRequest for consistency - it handles FormData correctly
        const response = await apiRequest('POST', '/api/documents/parse', formData);
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
      // Check if content is just a URL (with or without protocol)
      const trimmedContent = contentToAnalyze.trim();
      // Match URLs with protocol (http:// or https://) or domain names (domain.com, subdomain.domain.com)
      const urlPattern = /^(https?:\/\/)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/i;
      const isURL = urlPattern.test(trimmedContent) && !trimmedContent.includes(' ');
      
      // If it's a URL, normalize it (add https:// if missing) and use the URL endpoint
      if (isURL) {
        // Normalize URL: add https:// if protocol is missing
        const normalizedUrl = trimmedContent.startsWith('http://') || trimmedContent.startsWith('https://')
          ? trimmedContent
          : `https://${trimmedContent}`;
        
        const response = await apiRequest('POST', '/api/ai/generate-from-url', { url: normalizedUrl });
        const generatedIdea = await response.json();
        
        // Automatically create the idea in the database (don't wait for image)
        const ideaData: IdeaFormData = {
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
          sourceData: trimmedContent,
        };
        
        // Create the idea immediately (non-blocking)
        createIdeaMutation.mutate(ideaData, {
          onSuccess: async (createdIdea) => {
            // Generate image in background (non-blocking) with timeout
            const imagePromise = Promise.race([
              apiRequest('POST', '/api/ai/generate-image', {
                title: generatedIdea.title,
                description: generatedIdea.description,
              })
                .then(res => res.json())
                .then(data => data.imageUrl || ''),
              new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Image generation timeout')), 10000)
              )
            ]).catch(error => {
              console.warn('Image generation failed or timed out:', error);
              return null;
            });

            const imageUrl = await imagePromise;
            
            // Update idea with image if we got one
            if (imageUrl && createdIdea?.id) {
              try {
                // If it's an external URL, we might need to handle it differently
                // For now, just update the imageUrl field directly
                await apiRequest('PUT', `/api/ideas/${createdIdea.id}`, { imageUrl });
                console.log('Idea image updated successfully');
                // Invalidate queries to refresh the UI
                queryClient.invalidateQueries({ queryKey: ['/api/ideas', createdIdea.slug] });
              } catch (updateError) {
                console.warn('Failed to update idea with image:', updateError);
              }
            }
          }
        });
        
        setIsAnalyzingHTML(false);
        return;
      }
      
      // Use the document endpoint if we have document content, otherwise use HTML endpoint
      const endpoint = uploadedDocumentContent && !uploadedHTMLContent 
        ? '/api/ai/generate-from-document'
        : '/api/ai/generate-from-html';
      
      const payload = uploadedDocumentContent && !uploadedHTMLContent
        ? { textContent: uploadedDocumentContent, documentType: uploadedFile?.name.split('.').pop() }
        : { htmlContent: contentToAnalyze };
      
      const response = await apiRequest('POST', endpoint, payload);
      const generatedIdea = await response.json();
      
      // Automatically create the idea in the database (don't wait for image)
      const ideaData: IdeaFormData = {
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
      };
      
      // Create the idea immediately (non-blocking)
      createIdeaMutation.mutate(ideaData, {
        onSuccess: async (createdIdea) => {
          // Generate image in background (non-blocking) with timeout
          const imagePromise = Promise.race([
            apiRequest('POST', '/api/ai/generate-image', {
              title: generatedIdea.title,
              description: generatedIdea.description,
            })
              .then(res => res.json())
              .then(data => data.imageUrl || ''),
            new Promise<string>((_, reject) => 
              setTimeout(() => reject(new Error('Image generation timeout')), 10000)
            )
          ]).catch(error => {
            console.warn('Image generation failed or timed out:', error);
            return null;
          });

          const imageUrl = await imagePromise;
          
          // Update idea with image if we got one
          if (imageUrl && createdIdea?.id) {
            try {
              await apiRequest('PUT', `/api/ideas/${createdIdea.id}`, { imageUrl });
              console.log('Idea image updated successfully');
            } catch (updateError) {
              console.warn('Failed to update idea with image:', updateError);
            }
          }
        }
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

  // Drag and drop handlers for bulk import
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: `Please select a ${validExtensions.join(', ')} file`,
          variant: "destructive",
        });
        return;
      }
      
      setBulkImportFile(file);
    }
  };

  const handleBulkFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: `Please select a ${validExtensions.join(', ')} file`,
          variant: "destructive",
        });
        return;
      }
      
      setBulkImportFile(selectedFile);
    }
  };

  const handleBulkUpload = () => {
    if (!bulkImportFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    bulkImportMutation.mutate(bulkImportFile);
  };

  // Calculate progress percentage
  const bulkProgressPercentage = bulkImportJobStatus
    ? Math.round((bulkImportJobStatus.processedRows / bulkImportJobStatus.totalRows) * 100)
    : 0;

  // Log completion status
  useEffect(() => {
    if (!bulkImportJobStatus || !bulkImportJobId) return;
    
    if (bulkImportJobStatus.status === 'completed') {
      const totalRows = bulkImportJobStatus.totalRows || 0;
      const successfulRows = bulkImportJobStatus.successfulRows || 0;
      const failedRows = bulkImportJobStatus.failedRows || 0;
      const successRate = totalRows > 0 ? Math.round((successfulRows / totalRows) * 100) : 0;
      
      console.log(
        `[Bulk Import ${bulkImportJobId}] 🎉🎉 COMPLETED! ` +
        `✅ ${successfulRows}/${totalRows} successful (${successRate}%) | ` +
        `❌ ${failedRows} failed`
      );
    } else if (bulkImportJobStatus.status === 'failed') {
      console.error(`[Bulk Import ${bulkImportJobId}] 💥💥 JOB FAILED`);
      if (bulkImportJobStatus.errors && bulkImportJobStatus.errors.length > 0) {
        bulkImportJobStatus.errors.forEach((err: any) => {
          console.error(`[Bulk Import ${bulkImportJobId}] Error: ${err.error}`);
        });
      }
    }
  }, [bulkImportJobStatus, bulkImportJobId]);

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
      console.log('[AI Generate Frontend] Starting AI generation with params:', aiParams);
      const response = await apiRequest('POST', '/api/ai/generate-idea', aiParams);
      const generatedIdea = await response.json();
      
      console.log('[AI Generate Frontend] Response received:', {
        hasTitle: !!generatedIdea.title,
        hasDescription: !!generatedIdea.description,
        hasOfferTiers: !!generatedIdea.offerTiers,
        hasWhyNowAnalysis: !!generatedIdea.whyNowAnalysis,
        hasCommunitySignals: !!generatedIdea.communitySignals,
      });
      
      // Validate response has required fields
      if (!generatedIdea.title || !generatedIdea.description) {
        console.error('[AI Generate Frontend] ❌ Missing required fields:', {
          title: generatedIdea.title,
          description: generatedIdea.description,
          allKeys: Object.keys(generatedIdea),
        });
        throw new Error('Generated idea is missing required fields (title or description)');
      }
      
      // Check if enrichment failed (has fallback defaults)
      const hasEnrichmentFailure = generatedIdea.whyNowAnalysis?.includes('Analysis pending - AI enrichment failed') ||
                                   generatedIdea.proofSignals?.includes('Analysis pending - AI enrichment failed') ||
                                   generatedIdea.marketGap?.includes('Analysis pending - AI enrichment failed');
      
      if (hasEnrichmentFailure) {
        console.warn('[AI Generate Frontend] ⚠️ Enrichment failed, using fallback defaults');
        toast({
          title: "Partial Generation",
          description: "Idea generated but some analysis fields are incomplete. You may want to retry for full analysis.",
          variant: "default",
        });
      }
      
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
      
      if (!hasEnrichmentFailure) {
        toast({
          title: "AI Solution Generated!",
          description: "Your AI-generated startup solution is ready for review.",
        });
      }
    } catch (error) {
      console.error('[AI Generate Frontend] ❌ Error generating AI idea:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide more specific error messages
      let userMessage = "Failed to generate solution. Please try again.";
      if (errorMessage.includes('500')) {
        userMessage = "Server error occurred. Please check server logs or try again.";
      } else if (errorMessage.includes('Missing required fields')) {
        userMessage = "Generated idea is incomplete. Please try again.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        userMessage = "Request timed out. The AI service may be slow. Please try again.";
      } else if (errorMessage) {
        userMessage = errorMessage;
      }
      
      toast({
        title: "Generation Failed",
        description: userMessage,
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
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
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
                    Upload a document (HTML, PDF, DOCX, Excel, Markdown, JSON, or TXT) to extract and analyze content. You can also paste a URL or content directly below.
                  </p>
                  
                  <div className="mb-4 space-y-2">
                    <Textarea
                      placeholder="Or paste a URL (e.g., https://example.com) or HTML/content here..."
                      value={importText}
                      onChange={(e) => {
                        setImportText(e.target.value);
                        // Auto-detect if it's a URL or content and set it
                        const text = e.target.value.trim();
                        if (text) {
                          const urlPattern = /^(https?:\/\/)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/i;
                          const isURL = urlPattern.test(text) && !text.includes(' ');
                          if (isURL) {
                            setUploadedHTMLContent(text);
                            setUploadedDocumentContent(text);
                          } else {
                            setUploadedHTMLContent(text);
                            setUploadedDocumentContent(text);
                          }
                        } else {
                          setUploadedHTMLContent(null);
                          setUploadedDocumentContent(null);
                        }
                      }}
                      className="min-h-24"
                    />
                    {importText && (
                      <Button 
                        onClick={() => {
                          handleGenerateFromHTML();
                        }}
                        disabled={isAnalyzingHTML || !isAuthenticated || !importText.trim()}
                        className="w-full"
                        variant="outline"
                      >
                        {isAnalyzingHTML ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate from Pasted Content
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
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

            {/* Bulk Import Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Bulk Import from Spreadsheet
                </CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file to import multiple ideas at once. Each row will be processed and added to the database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    Drag and drop your spreadsheet here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Supports CSV, XLSX, and XLS files
                  </p>
                  <label htmlFor="bulk-file-upload" className="cursor-pointer">
                    <input
                      id="bulk-file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleBulkFileSelect}
                      className="hidden"
                    />
                    <Button variant="outline" asChild>
                      <span>Select Spreadsheet</span>
                    </Button>
                  </label>
                  {bulkImportFile && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{bulkImportFile.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(bulkImportFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleBulkUpload}
                  disabled={!bulkImportFile || bulkImportMutation.isPending}
                  className="w-full"
                >
                  {bulkImportMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Start Bulk Import
                    </>
                  )}
                </Button>

                {/* Job Status */}
                {bulkImportJobStatus && (
                  <div className="space-y-4 mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Import Progress</h4>
                      <span className="text-sm text-muted-foreground">
                        {bulkImportJobStatus.status === 'processing' && (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        )}
                        {bulkImportJobStatus.status === 'completed' && (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        )}
                        {bulkImportJobStatus.status === 'failed' && (
                          <span className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            Failed
                          </span>
                        )}
                      </span>
                    </div>

                    <Progress value={bulkProgressPercentage} className="h-2" />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Rows</p>
                        <p className="text-2xl font-bold">{bulkImportJobStatus.totalRows}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Processed</p>
                        <p className="text-2xl font-bold">{bulkImportJobStatus.processedRows}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{bulkImportJobStatus.successfulRows}</p>
                      </div>
                    </div>

                    {bulkImportJobStatus.failedRows > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{bulkImportJobStatus.failedRows}</p>
                      </div>
                    )}

                    {/* Errors */}
                    {bulkImportJobStatus.errors && bulkImportJobStatus.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {bulkImportJobStatus.errors.slice(0, 10).map((error: any, idx: number) => (
                              <div key={idx} className="text-sm">
                                Row {error.row}: {error.error}
                              </div>
                            ))}
                            {bulkImportJobStatus.errors.length > 10 && (
                              <div className="text-sm text-muted-foreground">
                                ... and {bulkImportJobStatus.errors.length - 10} more errors
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Success Message */}
                    {bulkImportJobStatus.status === 'completed' && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Import completed successfully! {bulkImportJobStatus.successfulRows} ideas were created.
                          {bulkImportJobStatus.results && bulkImportJobStatus.results.length > 0 && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setLocation('/database');
                                }}
                              >
                                View Imported Ideas
                              </Button>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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