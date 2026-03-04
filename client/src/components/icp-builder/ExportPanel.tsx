import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Users,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface IcpProfile {
  id: string;
  name: string;
  validationPriority: string;
  confidence: number;
}

interface ValidationContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  company: string;
  validationStatus: string;
  complianceFlags: Array<{ type: string }>;
  icpProfileId?: string;
}

interface ValidationScript {
  id: string;
  title: string;
  scriptType: string;
  icpProfileId: string;
}

interface ExportPanelProps {
  ideaId: string;
  ideaTitle: string;
  contacts: ValidationContact[];
  scripts: ValidationScript[];
  icpProfiles: IcpProfile[];
}

export default function ExportPanel({
  ideaId,
  ideaTitle,
  contacts,
  scripts,
  icpProfiles,
}: ExportPanelProps) {
  const [includeComplianceFlags, setIncludeComplianceFlags] = useState(true);

  // Calculate statistics
  const stats = {
    totalContacts: contacts.length,
    completedContacts: contacts.filter(c => c.validationStatus === 'completed').length,
    contactedContacts: contacts.filter(c => ['contacted', 'responded', 'completed'].includes(c.validationStatus)).length,
    contactsWithCompliance: contacts.filter(c => c.complianceFlags.length > 0).length,
    totalScripts: scripts.length,
    totalIcps: icpProfiles.length,
    highPriorityIcps: icpProfiles.filter(p => p.validationPriority === 'high').length,
    averageConfidence: icpProfiles.length > 0
      ? Math.round(icpProfiles.reduce((sum, p) => sum + p.confidence, 0) / icpProfiles.length)
      : 0,
  };

  // Export contacts as CSV
  const handleExportContacts = () => {
    const url = `/api/ideas/${ideaId}/contacts/export?includeComplianceFlags=${includeComplianceFlags}`;
    window.open(url, '_blank');
  };

  // Print scripts
  const handlePrintScripts = () => {
    window.print();
  };

  // Generate ICP summary text
  const generateIcpSummary = () => {
    let summary = `ICP Summary for: ${ideaTitle}\n`;
    summary += `${'='.repeat(50)}\n\n`;
    summary += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    icpProfiles.forEach((profile, i) => {
      summary += `${i + 1}. ${profile.name}\n`;
      summary += `   Priority: ${profile.validationPriority}\n`;
      summary += `   Confidence: ${profile.confidence}%\n\n`;
    });

    summary += `\nTotal ICPs: ${icpProfiles.length}\n`;
    summary += `High Priority: ${stats.highPriorityIcps}\n`;
    summary += `Average Confidence: ${stats.averageConfidence}%\n`;

    return summary;
  };

  // Copy ICP summary
  const handleCopyIcpSummary = () => {
    navigator.clipboard.writeText(generateIcpSummary());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[#1B2A4A]">Export & Summary</h3>
        <p className="text-sm text-[#1B2A4A]/60">
          Download your validation data and view summary statistics
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.totalIcps}</div>
                <div className="text-sm text-[#1B2A4A]/60">ICP Profiles</div>
              </div>
            </div>
            {stats.highPriorityIcps > 0 && (
              <div className="mt-2 text-xs text-[#1B2A4A]/50">
                {stats.highPriorityIcps} high priority
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.totalContacts}</div>
                <div className="text-sm text-[#1B2A4A]/60">Contacts</div>
              </div>
            </div>
            {stats.completedContacts > 0 && (
              <div className="mt-2 text-xs text-[#1B2A4A]/50">
                {stats.completedContacts} validated
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.totalScripts}</div>
                <div className="text-sm text-[#1B2A4A]/60">Scripts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.averageConfidence}%</div>
                <div className="text-sm text-[#1B2A4A]/60">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contacts Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Export Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#1B2A4A]/60">
              Download all validation contacts as a CSV file for use in your CRM or outreach tools.
            </p>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCompliance"
                checked={includeComplianceFlags}
                onCheckedChange={(checked) => setIncludeComplianceFlags(!!checked)}
              />
              <Label htmlFor="includeCompliance" className="text-sm">
                Include compliance flags (GDPR, TCPA, etc.)
              </Label>
            </div>

            {stats.contactsWithCompliance > 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-amber-800">
                  {stats.contactsWithCompliance} of {stats.totalContacts} contacts have compliance requirements
                </span>
              </div>
            )}

            <Button
              onClick={handleExportContacts}
              disabled={contacts.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV ({contacts.length} contacts)
            </Button>
          </CardContent>
        </Card>

        {/* Scripts Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              Print Scripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#1B2A4A]/60">
              Print your validation scripts for use during customer calls or team review.
            </p>

            <div className="space-y-2">
              {scripts.length > 0 ? (
                scripts.slice(0, 3).map(script => {
                  const icp = icpProfiles.find(p => p.id === script.icpProfileId);
                  return (
                    <div key={script.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1B2A4A]/40" />
                        <span className="text-sm">{script.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {script.scriptType}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-[#1B2A4A]/50 text-center py-4">
                  No scripts generated yet
                </div>
              )}
              {scripts.length > 3 && (
                <div className="text-xs text-[#1B2A4A]/50 text-center">
                  +{scripts.length - 3} more scripts
                </div>
              )}
            </div>

            <Button
              onClick={handlePrintScripts}
              disabled={scripts.length === 0}
              variant="outline"
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Scripts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ICP Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-600" />
            ICP Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {icpProfiles.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {icpProfiles.map((profile, i) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-[#1B2A4A]">{profile.name}</div>
                        <div className="text-xs text-[#1B2A4A]/50">
                          {contacts.filter(c => c.icpProfileId === profile.id).length} contacts linked
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={profile.validationPriority === 'high' ? 'destructive' : 'secondary'}>
                        {profile.validationPriority}
                      </Badge>
                      <Badge variant="outline">{profile.confidence}%</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleCopyIcpSummary} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Copy Summary to Clipboard
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-[#1B2A4A]/50">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No ICP profiles generated yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
