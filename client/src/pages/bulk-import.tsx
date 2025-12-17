import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImportJob {
  id: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errors?: Array<{ row: number; error: string }>;
  results?: string[];
  startedAt: string;
  completedAt?: string;
}

export default function BulkImport() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest('POST', '/api/ideas/bulk-import', formData);
      return res.json();
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      toast({
        title: "Import Started",
        description: `Job ${data.jobId} has been queued for processing.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Poll job status
  const { data: jobStatus, refetch } = useQuery<ImportJob>({
    queryKey: ['/api/import-jobs', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await apiRequest('GET', `/api/import-jobs/${jobId}`);
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Poll every 2 seconds if still processing
      return data?.status === 'processing' ? 2000 : false;
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setFile(selectedFile);
      setJobId(null);
    }
  };

  // Handle upload
  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
  };

  // Calculate progress percentage
  const progressPercentage = jobStatus
    ? Math.round((jobStatus.processedRows / jobStatus.totalRows) * 100)
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access bulk import functionality.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import Ideas</CardTitle>
            <CardDescription>
              Upload a spreadsheet (CSV or Excel) to import multiple ideas at once. Each row will be processed and added to the database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Select Spreadsheet</span>
                  </Button>
                </label>
                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </div>

            {/* Job Status */}
            {jobStatus && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Import Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {jobStatus.status === 'processing' && (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    )}
                    {jobStatus.status === 'completed' && (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                    {jobStatus.status === 'failed' && (
                      <span className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        Failed
                      </span>
                    )}
                  </span>
                </div>

                <Progress value={progressPercentage} className="h-2" />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                    <p className="text-2xl font-bold">{jobStatus.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold">{jobStatus.processedRows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{jobStatus.successfulRows}</p>
                  </div>
                </div>

                {jobStatus.failedRows > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{jobStatus.failedRows}</p>
                  </div>
                )}

                {/* Errors */}
                {jobStatus.errors && jobStatus.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {jobStatus.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-sm">
                            Row {error.row}: {error.error}
                          </div>
                        ))}
                        {jobStatus.errors.length > 10 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {jobStatus.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {jobStatus.status === 'completed' && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Import completed successfully! {jobStatus.successfulRows} ideas were created.
                      {jobStatus.results && jobStatus.results.length > 0 && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to database page to see imported ideas
                              window.location.href = '/database';
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
      </div>
    </div>
  );
}

