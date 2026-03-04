import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Shield,
  AlertTriangle,
  Loader2,
  Filter,
  UserSearch,
} from "lucide-react";

interface IcpProfile {
  id: string;
  name: string;
  description?: string;
  demographics?: {
    companySize: string;
    industry: string[];
    geography: string[];
    revenue: string;
  };
  psychographics?: {
    painPoints: string[];
    goals: string[];
    objections: string[];
  };
  buyingBehavior?: {
    decisionMakers: string[];
    budget: string;
    buyingCycle: string;
    channels: string[];
  };
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

interface ContactDiscoveryPanelProps {
  ideaId: string;
  contacts: ValidationContact[];
  icpProfiles: IcpProfile[];
  isLoading: boolean;
  onContactCreated: () => void;
  onContactUpdated: () => void;
  onContactDeleted: () => void;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  linkedInUrl: '',
  jobTitle: '',
  company: '',
  companySize: '',
  industry: '',
  region: '',
  icpProfileId: '',
  notes: '',
};

export default function ContactDiscoveryPanel({
  ideaId,
  contacts,
  icpProfiles,
  isLoading,
  onContactCreated,
  onContactUpdated,
  onContactDeleted,
}: ContactDiscoveryPanelProps) {
  const { toast } = useToast();

  // State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<ValidationContact | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterIcp, setFilterIcp] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest('POST', `/api/ideas/${ideaId}/contacts`, {
        ...data,
        icpProfileId: data.icpProfileId || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      setShowAddDialog(false);
      setForm(emptyForm);
      onContactCreated();
      toast({
        title: "Contact Added",
        description: "Validation contact has been created with compliance flags",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Contact",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Update contact mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form & { validationStatus?: string }> }) => {
      const res = await apiRequest('PATCH', `/api/ideas/${ideaId}/contacts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      setEditingContact(null);
      setForm(emptyForm);
      onContactUpdated();
      toast({
        title: "Contact Updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Contact",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const res = await apiRequest('DELETE', `/api/ideas/${ideaId}/contacts/${contactId}`);
      return res.json();
    },
    onSuccess: () => {
      onContactDeleted();
      toast({
        title: "Contact Deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Contact",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Search contacts mutation (Web Scraping Pipeline)
  const searchMutation = useMutation({
    mutationFn: async (icpProfile: IcpProfile) => {
      const res = await apiRequest('POST', `/api/ideas/${ideaId}/contacts/search`, {
        icpProfileId: icpProfile.id,
        icpProfile: {
          name: icpProfile.name,
          description: icpProfile.description || '',
          demographics: icpProfile.demographics || {
            companySize: '',
            industry: [],
            geography: [],
            revenue: '',
          },
          psychographics: icpProfile.psychographics || {
            painPoints: [],
            goals: [],
            objections: [],
          },
          buyingBehavior: icpProfile.buyingBehavior || {
            decisionMakers: [],
            budget: '',
            buyingCycle: '',
            channels: [],
          },
        },
        limit: 10,
        adapter: 'web_search', // Use Anthropic AI web search (scraping blocked by anti-bot protections)
      });
      return res.json();
    },
    onSuccess: (data) => {
      onContactCreated();
      // Show detailed metadata if available
      const metadata = data.metadata;
      const details = metadata
        ? `Scraped: ${metadata.total_scraped}, Qualified: ${data.total}, Excluded: ${metadata.excluded}`
        : `Found ${data.total} contacts`;
      toast({
        title: "Contacts Found",
        description: details,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    },
  });

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    if (filterIcp !== 'all' && contact.icpProfileId !== filterIcp) return false;
    if (filterStatus !== 'all' && contact.validationStatus !== filterStatus) return false;
    return true;
  });

  // Compliance badge color
  const getComplianceBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gdpr': return 'bg-blue-100 text-blue-800';
      case 'tcpa': return 'bg-orange-100 text-orange-800';
      case 'ccpa': return 'bg-purple-100 text-purple-800';
      case 'casl': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-amber-100 text-amber-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle edit
  const handleEdit = (contact: ValidationContact) => {
    setEditingContact(contact);
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || '',
      phone: contact.phone || '',
      linkedInUrl: contact.linkedInUrl || '',
      jobTitle: contact.jobTitle,
      company: contact.company,
      companySize: contact.companySize || '',
      industry: contact.industry || '',
      region: contact.region,
      icpProfileId: contact.icpProfileId || '',
      notes: contact.notes || '',
    });
    setShowAddDialog(true);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  // Handle status change
  const handleStatusChange = (contactId: string, status: string) => {
    updateMutation.mutate({ id: contactId, data: { validationStatus: status } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1B2A4A]">Validation Contacts</h3>
          <p className="text-sm text-[#1B2A4A]/60">
            Manage contacts for customer validation calls
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Contact Search */}
          {icpProfiles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={searchMutation.isPending}>
                  {searchMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {searchMutation.isPending ? 'Searching...' : 'Find Contacts'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs font-medium text-[#1B2A4A]/50">
                  Search for contacts matching:
                </div>
                {icpProfiles.map(profile => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => searchMutation.mutate(profile)}
                    disabled={searchMutation.isPending}
                  >
                    <UserSearch className="w-4 h-4 mr-2" />
                    {profile.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => { setEditingContact(null); setForm(emptyForm); setShowAddDialog(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1B2A4A]/40" />
          <Select value={filterIcp} onValueChange={setFilterIcp}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by ICP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ICPs</SelectItem>
              {icpProfiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-[#1B2A4A]/50">
          {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Contacts Table */}
      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <UserSearch className="w-12 h-12 mx-auto text-[#1B2A4A]/30 mb-4" />
            <h4 className="text-lg font-medium text-[#1B2A4A] mb-2">No Contacts Yet</h4>
            <p className="text-sm text-[#1B2A4A]/60 mb-4">
              Add contacts manually to start your validation outreach
            </p>
            <Button onClick={() => { setEditingContact(null); setForm(emptyForm); setShowAddDialog(true); }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title / Company</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>ICP Match</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map(contact => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-[#1B2A4A]">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {contact.linkedInUrl && (
                          <a
                            href={contact.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-xs text-green-600 hover:text-green-800 hover:underline"
                          >
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        )}
                        {!contact.linkedInUrl && !contact.email && !contact.phone && (
                          <span className="text-xs text-[#1B2A4A]/40">No contact info</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{contact.jobTitle}</div>
                      <div className="text-xs text-[#1B2A4A]/50">{contact.company}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{contact.region}</TableCell>
                  <TableCell>
                    {contact.icpProfileId ? (
                      <Badge variant="outline" className="text-xs">
                        {icpProfiles.find(p => p.id === contact.icpProfileId)?.name || 'Matched'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-[#1B2A4A]/40">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.complianceFlags.length > 0 ? (
                        contact.complianceFlags.map((flag, i) => (
                          <Badge key={i} className={`text-xs ${getComplianceBadgeColor(flag.type)}`}>
                            {flag.type.toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-[#1B2A4A]/40">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={contact.validationStatus}
                      onValueChange={(status) => handleStatusChange(contact.id, status)}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <Badge className={`text-xs ${getStatusBadgeColor(contact.validationStatus)}`}>
                          {contact.validationStatus}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate(contact.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add Validation Contact'}
            </DialogTitle>
            <DialogDescription>
              Enter contact details for market validation outreach. Compliance flags will be auto-applied based on region.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
              <Input
                id="linkedInUrl"
                type="url"
                value={form.linkedInUrl}
                onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={form.companySize} onValueChange={(v) => setForm({ ...form, companySize: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="e.g., California, UK, Germany"
                  required
                />
                <p className="text-xs text-[#1B2A4A]/50 mt-1">
                  Compliance flags (GDPR, TCPA, etc.) will be auto-applied
                </p>
              </div>
              <div>
                <Label htmlFor="icpProfileId">Link to ICP</Label>
                <Select value={form.icpProfileId} onValueChange={(v) => setForm({ ...form, icpProfileId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ICP (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {icpProfiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes about this contact..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
