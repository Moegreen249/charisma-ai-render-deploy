'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Clock, Users, UserCheck, UserX, Search, RefreshCw, Plus, Trash2, Mail, Shield } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Filter from "lucide-react/dist/esm/icons/filter";
import Edit from "lucide-react/dist/esm/icons/edit";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isApproved: boolean;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        const usersData = data.users || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users || [];

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(user => !user.isApproved && !user.rejectedAt);
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(user => user.isApproved);
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(user => user.rejectedAt);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchTerm]);

  const handleUserAction = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchUsers(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user status' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const pendingUsers = (users || []).filter(user => !user.isApproved && !user.rejectedAt);
  const approvedUsers = (users || []).filter(user => user.isApproved);
  const rejectedUsers = (users || []).filter(user => user.rejectedAt);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - admin users theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-28 left-16 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-44 right-20 w-1 h-1 bg-purple-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-36 right-28 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-20 left-24 w-2 h-2 bg-purple-300/15 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              User Management
            </h1>
            <p className="text-white/70">
              Manage user registrations, approvals, and permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/users/add'}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={`${message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-white' : 'bg-green-500/20 border-green-500/30 text-white'}`}>
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <Button
                onClick={() => {
                  // Toggle advanced filter UI (implementation can be expanded)
                  alert('Advanced filtering options coming soon!');
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Users className="h-4 w-4 text-purple-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{(users || []).length}</div>
              <p className="text-xs text-white/60 mt-1">Registered users</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Pending Approval</CardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Clock className="h-4 w-4 text-yellow-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300 group-hover:scale-110 transition-transform duration-300">{pendingUsers.length}</div>
              <p className="text-xs text-white/60 mt-1">Awaiting review</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Approved</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <UserCheck className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300 group-hover:scale-110 transition-transform duration-300">{approvedUsers.length}</div>
              <p className="text-xs text-white/60 mt-1">Active users</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Rejected</CardTitle>
              <div className="p-2 rounded-full bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <UserX className="h-4 w-4 text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300 group-hover:scale-110 transition-transform duration-300">{rejectedUsers.length}</div>
              <p className="text-xs text-white/60 mt-1">Declined users</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              User List ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  All ({(users || []).length})
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  Pending ({pendingUsers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="approved"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  Approved ({approvedUsers.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected"
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                >
                  Rejected ({rejectedUsers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="pt-6">
                      <p className="text-center text-white/70">No users found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{user.name || 'No name'}</CardTitle>
                            <CardDescription className="text-white/70">{user.email}</CardDescription>
                          </div>
                          <Badge 
                            variant={user.isApproved ? "default" : user.rejectedAt ? "destructive" : "outline"} 
                            className={
                              user.isApproved 
                                ? "bg-green-600 text-white" 
                                : user.rejectedAt 
                                ? "bg-red-600 text-white" 
                                : "text-yellow-600 border-yellow-600"
                            }
                          >
                            {user.isApproved ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : user.rejectedAt ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-white/70">
                          <p>Role: {user.role}</p>
                          <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                          {user.approvedAt && (
                            <p>Approved: {new Date(user.approvedAt).toLocaleDateString()}</p>
                          )}
                          {user.rejectedAt && (
                            <p>Rejected: {new Date(user.rejectedAt).toLocaleDateString()}</p>
                          )}
                          {user.rejectionReason && (
                            <p>Reason: {user.rejectionReason}</p>
                          )}
                        </div>
                        {!user.isApproved && !user.rejectedAt && (
                          <div className="flex space-x-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'approve')}
                              disabled={actionLoading === user.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUserAction(user.id, 'reject', 'Account rejected by admin')}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending users</p>
              </CardContent>
            </Card>
          ) : (
            pendingUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{user.name || 'No name'}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Role: {user.role}</p>
                      <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'approve')}
                        disabled={actionLoading === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUserAction(user.id, 'reject', 'Account rejected by admin')}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name || 'No name'}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Role: {user.role}</p>
                  <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                  {user.approvedAt && (
                    <p>Approved: {new Date(user.approvedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name || 'No name'}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Role: {user.role}</p>
                  <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                  {user.rejectedAt && (
                    <p>Rejected: {new Date(user.rejectedAt).toLocaleDateString()}</p>
                  )}
                  {user.rejectionReason && (
                    <p>Reason: {user.rejectionReason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}