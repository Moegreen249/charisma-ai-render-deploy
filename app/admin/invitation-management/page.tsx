'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Users, History, FileText, RefreshCw } from 'lucide-react';

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
  tempPassword?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  category: string;
  isBuiltIn: boolean;
  isActive: boolean;
  variables?: string[];
  styling?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface InvitationHistoryItem {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  personalMessage?: string;
  templateId: string;
  invitedBy: string;
  created_at: string;
  updated_at: string;
  invitedByUser?: {
    name: string;
    email: string;
  };
}

export default function InvitationManagement() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('single');

  // State for individual invites
  const [singleInvite, setSingleInvite] = useState({
    email: '',
    name: '',
    role: 'USER',
    personalMessage: '',
  });

  // State for bulk invites
  const [bulkUsers, setBulkUsers] = useState([{ email: '', name: '', role: 'USER' }]);
  const [bulkMessage, setBulkMessage] = useState('');

  // State for email templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern Professional');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // State for invitation history
  const [invitationHistory, setInvitationHistory] = useState<InvitationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [results, setResults] = useState<InviteResult[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      redirect('/auth/signin');
    }

    if (session.user.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  // Load email templates
  const loadEmailTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('/api/admin/email-templates?isActive=true', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);

      // Set default template if none selected and templates exist
      if (data.templates && data.templates.length > 0 && !selectedTemplate) {
        const defaultTemplate = data.templates.find((t: EmailTemplate) => t.name === 'Modern Professional') || data.templates[0];
        setSelectedTemplate(defaultTemplate.name);
      }
    } catch (err) {
      console.error('Error loading email templates:', err);
      setError('Failed to load email templates');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Load templates when component mounts
  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadEmailTemplates();
    }
  }, [session]);

  // Load invitation history when history tab is active
  useEffect(() => {
    if (activeTab === 'history' && session?.user.role === 'ADMIN') {
      loadInvitationHistory();
    }
  }, [activeTab, session, historyPage, historyFilter]);

  // Function to load invitation history
  const loadInvitationHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const params = new URLSearchParams({
        page: historyPage.toString(),
        limit: '20',
        ...(historyFilter !== 'all' && { status: historyFilter })
      });

      const response = await fetch(`/api/admin/invitation-history?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch invitation history');
      }

      const data = await response.json();
      setInvitationHistory(data.invitations || []);
    } catch (err) {
      console.error('Error loading invitation history:', err);
      setError('Failed to load invitation history');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Function to resend invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch('/api/admin/invitation-history', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      });

      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }

      setSuccessMessage('Invitation resent successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadInvitationHistory(); // Refresh the list
    } catch (err) {
      setError('Failed to resend invitation');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handler for single invitation
  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResults([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/invite-users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: [{
            ...singleInvite,
            template: selectedTemplate,
            personalMessage: singleInvite.personalMessage
          }]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send invitation');

      setResults(data.results);
      if (data.results.every((r: InviteResult) => r.success)) {
        setSuccessMessage('Invitation sent successfully!');
        setSingleInvite({ email: '', name: '', role: 'USER', personalMessage: '' });
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for bulk invitations
  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResults([]);
    setIsLoading(true);

    // Validate bulk users
    const validUsers = bulkUsers.filter(user => user.email && user.name);
    if (validUsers.length === 0) {
      setError('Please add at least one valid user with email and name');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/invite-users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: validUsers.map(user => ({
            ...user,
            template: selectedTemplate,
            personalMessage: bulkMessage
          }))
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send invitations');

      setResults(data.results);
      const successCount = data.results.filter((r: InviteResult) => r.success).length;
      setSuccessMessage(`${successCount} of ${data.results.length} invitations sent successfully!`);

      if (successCount === data.results.length) {
        setBulkUsers([{ email: '', name: '', role: 'USER' }]);
        setBulkMessage('');
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Template management
  const handleTemplateAdd = () => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: 'New Template',
      subject: '',
      content: '',
      category: 'invitation',
      isBuiltIn: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleTemplateUpdate = (id: string, field: keyof EmailTemplate, value: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Mail className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white">Invitation Management</h1>
              <p className="text-white/70">Send invitations and manage user access</p>
            </div>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Single Invite
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Invite
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Single Invite Tab */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Send Individual Invitation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleInvite} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={singleInvite.email}
                      onChange={e => setSingleInvite({...singleInvite, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={singleInvite.name}
                      onChange={e => setSingleInvite({...singleInvite, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Message</label>
                  <Textarea
                    value={singleInvite.personalMessage}
                    onChange={e => setSingleInvite({...singleInvite, personalMessage: e.target.value})}
                    placeholder="Add a personal welcome message..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      value={singleInvite.role}
                      onValueChange={value => setSingleInvite({...singleInvite, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Template</label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Invite Tab */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBulkInvite} className="space-y-6">
                {bulkUsers.map((user, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={e => {
                          const newUsers = [...bulkUsers];
                          newUsers[index].email = e.target.value;
                          setBulkUsers(newUsers);
                        }}
                        required
                      />
                      <Input
                        placeholder="Name"
                        value={user.name}
                        onChange={e => {
                          const newUsers = [...bulkUsers];
                          newUsers[index].name = e.target.value;
                          setBulkUsers(newUsers);
                        }}
                        required
                      />
                    </div>
                    {bulkUsers.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setBulkUsers(users => users.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBulkUsers([...bulkUsers, { email: '', name: '', role: 'USER' }])}
                  >
                    Add Another User
                  </Button>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Common Message</label>
                    <Textarea
                      value={bulkMessage}
                      onChange={e => setBulkMessage(e.target.value)}
                      placeholder="Add a message for all invitees..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Role</label>
                      <Select
                        value={bulkUsers[0].role}
                        onValueChange={value => setBulkUsers(users =>
                          users.map(user => ({...user, role: value}))
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Template</label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={setSelectedTemplate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Send Bulk Invitations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border rounded-lg space-y-4">
                    <Input
                      placeholder="Template Name"
                      value={template.name}
                      onChange={e => handleTemplateUpdate(template.id, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Email Subject"
                      value={template.subject}
                      onChange={e => handleTemplateUpdate(template.id, 'subject', e.target.value)}
                    />
                    <Textarea
                      placeholder="Email Content"
                      value={template.content}
                      onChange={e => handleTemplateUpdate(template.id, 'content', e.target.value)}
                      rows={8}
                    />
                    <div className="text-sm text-gray-500">
                      Available variables: {'{name}'}, {'{email}'}, {'{tempPassword}'}, {'{loginButton}'}
                    </div>
                    {template.id !== 'default' && (
                      <Button
                        variant="destructive"
                        onClick={() => setTemplates(templates.filter(t => t.id !== template.id))}
                      >
                        Delete Template
                      </Button>
                    )}
                  </div>
                ))}
                <Button onClick={handleTemplateAdd}>
                  Add New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invitation History</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadInvitationHistory}
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading invitation history...</span>
                </div>
              ) : invitationHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitationHistory.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>
                          {new Date(invite.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>{invite.name}</TableCell>
                        <TableCell>
                          <Badge variant={invite.role === 'ADMIN' ? 'destructive' : 'default'}>
                            {invite.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invite.status === 'PENDING' ? 'secondary' :
                              invite.status === 'ACCEPTED' ? 'default' :
                              invite.status === 'EXPIRED' ? 'destructive' :
                              'outline'
                            }
                          >
                            {invite.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invite.invitedByUser?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invite.id)}
                            disabled={invite.status === 'ACCEPTED'}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results/Errors Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Invitation Results</h2>
          {results.map((result, index) => (
            <Alert key={index} variant={result.success ? 'default' : 'destructive'}>
              <AlertTitle>{result.email}</AlertTitle>
              <AlertDescription>
                {result.success
                  ? 'Invitation sent successfully'
                  : `Failed: ${result.error}`
                }
                {result.tempPassword && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    Temporary password: {result.tempPassword}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
