import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Target,
  UserSearch,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import IcpProfileCard from "./icp-builder/IcpProfileCard";
import ContactDiscoveryPanel from "./icp-builder/ContactDiscoveryPanel";
import ScriptViewer from "./icp-builder/ScriptViewer";
import ExportPanel from "./icp-builder/ExportPanel";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface IcpBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    market?: string;
    type?: string;
    targetAudience?: string;
    mainCompetitor?: string;
    revenuePotential?: string;
  };
}

type Phase = 'icp_generation' | 'contact_discovery' | 'script_generation' | 'export';
type PhaseStatus = 'idle' | 'loading' | 'complete' | 'error';

interface IcpProfile {
  id: string;
  ideaId: string;
  name: string;
  description: string;
  demographics: {
    companySize: string;
    industry: string[];
    geography: string[];
    revenue: string;
  };
  psychographics: {
    painPoints: string[];
    goals: string[];
    objections: string[];
  };
  buyingBehavior: {
    decisionMakers: string[];
    budget: string;
    buyingCycle: string;
    channels: string[];
  };
  validationPriority: 'high' | 'medium' | 'low';
  confidence: number;
  createdAt: string;
}

interface ValidationContact {
  id: string;
  ideaId: string;
  icpProfileId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  jobTitle: string;
  company: string;
  companySize?: string;
  industry?: string;
  region: string;
  complianceFlags: Array<{
    type: string;
    region: string;
    severity: string;
    requirements: string[];
  }>;
  consentStatus: string;
  matchScore?: number;
  source: string;
  validationStatus: string;
  notes?: string;
  createdAt: string;
}

interface ValidationScript {
  id: string;
  ideaId: string;
  icpProfileId: string;
  title: string;
  scriptType: string;
  objective: string;
  totalDuration: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    speakerNotes: string;
    duration: string;
    order: number;
  }>;
  branches: Array<{
    id: string;
    parentSectionId: string;
    condition: string;
    content: string;
    followUpQuestions: string[];
  }>;
  keyQuestions: string[];
  hypothesesToValidate: string[];
  closingTechniques: string[];
  createdAt: string;
}

// ─── Cache Helpers ─────────────────────────────────────────────────────────────

function getCacheKey(ideaId: string, type: string): string {
  return `icpBuilder_${ideaId}_${type}`;
}

function getFromCache<T>(ideaId: string, type: string): { data: T; cachedAt: string } | null {
  const cached = localStorage.getItem(getCacheKey(ideaId, type));
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(getCacheKey(ideaId, type));
    }
  }
  return null;
}

function setCache<T>(ideaId: string, type: string, data: T): void {
  localStorage.setItem(getCacheKey(ideaId, type), JSON.stringify({
    data,
    cachedAt: new Date().toISOString(),
  }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function IcpBuilderDialog({
  open,
  onOpenChange,
  idea,
}: IcpBuilderDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Phase state
  const [activeTab, setActiveTab] = useState<Phase>('icp_generation');
  const [phaseStatuses, setPhaseStatuses] = useState<Record<Phase, PhaseStatus>>({
    icp_generation: 'idle',
    contact_discovery: 'idle',
    script_generation: 'idle',
    export: 'idle',
  });

  // Data state
  const [icpProfiles, setIcpProfiles] = useState<IcpProfile[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<ValidationScript[]>([]);

  // Query for existing ICP profiles
  const { data: existingProfiles, isLoading: loadingProfiles, refetch: refetchProfiles } = useQuery({
    queryKey: ['icp-profiles', idea.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/ideas/${idea.id}/icp-profiles`);
      return res.json() as Promise<IcpProfile[]>;
    },
    enabled: open,
  });

  // Query for contacts
  const { data: contacts = [], isLoading: loadingContacts, refetch: refetchContacts } = useQuery({
    queryKey: ['validation-contacts', idea.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/ideas/${idea.id}/contacts`);
      return res.json() as Promise<ValidationContact[]>;
    },
    enabled: open,
  });

  // Query for scripts
  const { data: existingScripts, refetch: refetchScripts } = useQuery({
    queryKey: ['validation-scripts', idea.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/ideas/${idea.id}/scripts`);
      return res.json() as Promise<ValidationScript[]>;
    },
    enabled: open,
  });

  // Load cached/existing data
  useEffect(() => {
    if (existingProfiles && existingProfiles.length > 0) {
      setIcpProfiles(existingProfiles);
      setPhaseStatuses(prev => ({ ...prev, icp_generation: 'complete' }));
      if (!selectedIcpId) {
        setSelectedIcpId(existingProfiles[0].id);
      }
    }
  }, [existingProfiles, selectedIcpId]);

  useEffect(() => {
    if (existingScripts && existingScripts.length > 0) {
      setScripts(existingScripts);
      setPhaseStatuses(prev => ({ ...prev, script_generation: 'complete' }));
    }
  }, [existingScripts]);

  useEffect(() => {
    if (contacts.length > 0) {
      setPhaseStatuses(prev => ({ ...prev, contact_discovery: 'complete' }));
    }
  }, [contacts]);

  // Generate ICPs mutation
  const generateIcpsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/icp-builder/generate', {
        ideaId: idea.id,
        title: idea.title,
        description: idea.description || '',
        content: idea.content,
        market: idea.market,
        type: idea.type,
        targetAudience: idea.targetAudience,
        mainCompetitor: idea.mainCompetitor,
        revenuePotential: idea.revenuePotential,
        maxProfiles: 3,
      });
      return res.json();
    },
    onMutate: () => {
      setPhaseStatuses(prev => ({ ...prev, icp_generation: 'loading' }));
    },
    onSuccess: async (data) => {
      setIcpProfiles(data.profiles);
      setSelectedIcpId(data.profiles[0]?.id || null);
      setPhaseStatuses(prev => ({ ...prev, icp_generation: 'complete' }));
      setCache(idea.id, 'icpProfiles', data.profiles);
      await refetchProfiles();
      toast({
        title: "ICP Profiles Generated",
        description: `Created ${data.profiles.length} ideal customer profiles`,
      });
    },
    onError: (error) => {
      setPhaseStatuses(prev => ({ ...prev, icp_generation: 'error' }));
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Generate script mutation
  const generateScriptMutation = useMutation({
    mutationFn: async ({ icpProfile, scriptType }: { icpProfile: IcpProfile; scriptType: 'discovery' | 'validation' | 'follow_up' }) => {
      const res = await apiRequest('POST', '/api/ai/icp-builder/script', {
        ideaId: idea.id,
        icpProfileId: icpProfile.id,
        icpProfile: {
          id: icpProfile.id,
          name: icpProfile.name,
          description: icpProfile.description,
          demographics: icpProfile.demographics,
          psychographics: icpProfile.psychographics,
          buyingBehavior: icpProfile.buyingBehavior,
        },
        ideaTitle: idea.title,
        ideaDescription: idea.description || '',
        scriptType,
      });
      return res.json();
    },
    onMutate: () => {
      setPhaseStatuses(prev => ({ ...prev, script_generation: 'loading' }));
    },
    onSuccess: async (data) => {
      setScripts(prev => [...prev, data.script]);
      setPhaseStatuses(prev => ({ ...prev, script_generation: 'complete' }));
      await refetchScripts();
      setActiveTab('script_generation');
      toast({
        title: "Script Generated",
        description: `Created ${data.script.scriptType} script`,
      });
    },
    onError: (error) => {
      setPhaseStatuses(prev => ({ ...prev, script_generation: 'error' }));
      toast({
        title: "Script Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Contact handlers
  const handleContactCreated = useCallback(() => {
    refetchContacts();
    setPhaseStatuses(prev => ({ ...prev, contact_discovery: 'complete' }));
  }, [refetchContacts]);

  const handleContactUpdated = useCallback(() => {
    refetchContacts();
  }, [refetchContacts]);

  const handleContactDeleted = useCallback(() => {
    refetchContacts();
  }, [refetchContacts]);

  // Generate script handler
  const handleGenerateScript = useCallback((icpProfile: IcpProfile, scriptType: 'discovery' | 'validation' | 'follow_up') => {
    generateScriptMutation.mutate({ icpProfile, scriptType });
  }, [generateScriptMutation]);

  // Calculate progress
  const completedPhases = Object.values(phaseStatuses).filter(s => s === 'complete').length;
  const progressPercentage = (completedPhases / 4) * 100;

  // Phase status icon
  const getPhaseIcon = (phase: Phase) => {
    const status = phaseStatuses[phase];
    if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (generateIcpsMutation.isPending || generateScriptMutation.isPending)) {
      return; // Don't allow closing during generation
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#F8F9FC]">
        <DialogHeader className="border-b border-[#1B2A4A]/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl text-[#1B2A4A]">
            <Users className="w-6 h-6 text-blue-600" />
            ICP Builder & Market Validation
          </DialogTitle>
          <DialogDescription className="text-[#1B2A4A]/60">
            Generate ideal customer profiles, manage validation contacts, and create call scripts
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[#1B2A4A]/60">Progress</span>
            <span className="font-medium text-[#1B2A4A]">{completedPhases}/4 phases</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Phase)} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="icp_generation" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">ICPs</span>
              {getPhaseIcon('icp_generation')}
            </TabsTrigger>
            <TabsTrigger value="contact_discovery" className="flex items-center gap-2">
              <UserSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
              {getPhaseIcon('contact_discovery')}
            </TabsTrigger>
            <TabsTrigger value="script_generation" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Scripts</span>
              {getPhaseIcon('script_generation')}
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
              {getPhaseIcon('export')}
            </TabsTrigger>
          </TabsList>

          {/* ICP Generation Tab */}
          <TabsContent value="icp_generation" className="mt-6">
            <div className="space-y-6">
              {/* Header with Generate Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">Ideal Customer Profiles</h3>
                  <p className="text-sm text-[#1B2A4A]/60">
                    AI-generated customer segments based on your venture
                  </p>
                </div>
                <Button
                  onClick={() => generateIcpsMutation.mutate()}
                  disabled={generateIcpsMutation.isPending}
                >
                  {generateIcpsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : icpProfiles.length > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Generate ICPs
                    </>
                  )}
                </Button>
              </div>

              {/* Loading State */}
              {(loadingProfiles || generateIcpsMutation.isPending) && icpProfiles.length === 0 && (
                <div className="py-12 text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
                  <p className="text-[#1B2A4A]/60">
                    {generateIcpsMutation.isPending
                      ? "Analyzing your venture and generating customer profiles..."
                      : "Loading profiles..."}
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!loadingProfiles && !generateIcpsMutation.isPending && icpProfiles.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-[#1B2A4A]/10 rounded-lg">
                  <Target className="w-12 h-12 mx-auto text-[#1B2A4A]/30 mb-4" />
                  <h4 className="text-lg font-medium text-[#1B2A4A] mb-2">No ICPs Generated Yet</h4>
                  <p className="text-sm text-[#1B2A4A]/60 mb-4 max-w-md mx-auto">
                    Click "Generate ICPs" to create 3 ideal customer profiles tailored to your venture
                  </p>
                </div>
              )}

              {/* ICP Cards */}
              {icpProfiles.length > 0 && (
                <div className="grid gap-4">
                  {icpProfiles.map((profile) => (
                    <IcpProfileCard
                      key={profile.id}
                      profile={profile}
                      isSelected={selectedIcpId === profile.id}
                      onSelect={() => setSelectedIcpId(profile.id)}
                      onGenerateScript={(scriptType) => handleGenerateScript(profile, scriptType)}
                      isGeneratingScript={generateScriptMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contact Discovery Tab */}
          <TabsContent value="contact_discovery" className="mt-6">
            <ContactDiscoveryPanel
              ideaId={idea.id}
              contacts={contacts}
              icpProfiles={icpProfiles}
              isLoading={loadingContacts}
              onContactCreated={handleContactCreated}
              onContactUpdated={handleContactUpdated}
              onContactDeleted={handleContactDeleted}
            />
          </TabsContent>

          {/* Script Generation Tab */}
          <TabsContent value="script_generation" className="mt-6">
            <ScriptViewer
              scripts={scripts}
              icpProfiles={icpProfiles}
              isLoading={generateScriptMutation.isPending}
              selectedIcpId={selectedIcpId}
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6">
            <ExportPanel
              ideaId={idea.id}
              ideaTitle={idea.title}
              contacts={contacts}
              scripts={scripts}
              icpProfiles={icpProfiles}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
