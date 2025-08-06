"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SkeletonTable } from "@/components/ui/skeleton";
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
  DialogTrigger,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Trash2,
  Shield,
  CreditCard,
  Clock,
  RefreshCw,
  UserPlus,
  Mail,
  Calendar,
  Settings
} from "lucide-react";
import Filter from "lucide-react/dist/esm/icons/filter";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Edit from "lucide-react/dist/esm/icons/edit";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import type { UserStatistics } from "@/lib/admin-service";
import { Role, SubscriptionTier, SubscriptionStatus } from "@/lib/types";
import { UserSubscriptionPanel } from "./UserSubscriptionPanel";

interface UserManagementPanelProps {
  userStats?: UserStatistics | null;
  loading?: boolean;
  onRefresh?: () => void;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  subscription?: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
  } | null;
  _count: {
    analyses: number;
    stories: number;
    backgroundJobs: number;
  };
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function UserManagementPanel({ userStats, loading, onRefresh }: UserManagementPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionTier | "ALL">("ALL");
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubscriptionPanelOpen, setIsSubscriptionPanelOpen] = useState(false);
  const [subscriptionUserId, setSubscriptionUserId] = useState<string>('');
  const [subscriptionUserName, setSubscriptionUserName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users with filters and pagination
  const fetchUsers = async (page = 1, search = "", role = "ALL", subscription = "ALL") => {
    try {
      setUsersLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(role !== "ALL" && { role }),
        ...(subscription !== "ALL" && { subscriptionTier: subscription })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UserListResponse = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
  }, [currentPage, searchTerm, roleFilter, subscriptionFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleRoleFilter = (role: Role | "ALL") => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSubscriptionFilter = (subscription: SubscriptionTier | "ALL") => {
    setSubscriptionFilter(subscription);
    setCurrentPage(1);
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  // Update user subscription
  const updateUserSubscription = async (userId: string, tier: SubscriptionTier, status: SubscriptionStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user subscription');
      }

      setSuccess('User subscription updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
    } catch (err) {
      console.error('Error updating user subscription:', err);
      setError('Failed to update user subscription');
    }
  };

  // Suspend user
  const suspendUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      setSuccess('User suspended successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
    } catch (err) {
      console.error('Error suspending user:', err);
      setError('Failed to suspend user');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case Role.USER:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSubscriptionBadgeColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.ENTERPRISE:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case SubscriptionTier.PRO:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case SubscriptionTier.FREE:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusBadgeColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case SubscriptionStatus.CANCELED:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case SubscriptionStatus.PAST_DUE:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-white/70">Manage user accounts, roles, and subscriptions</p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="bg-red-500/20 border-red-500/30 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/20 border-green-500/30 text-white">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* User Statistics */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-white/60 mt-1">
                +{userStats.newUsersThisWeek} this week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats.activeUsers.toLocaleString()}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {userStats.newUsersToday} new today
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Pro Subscribers</CardTitle>
              <CreditCard className="h-4 w-4 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats.subscriptionBreakdown.PRO.toLocaleString()}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Enterprise: {userStats.subscriptionBreakdown.ENTERPRISE}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-red-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userStats.adminUsers.toLocaleString()}
              </div>
              <div className="text-xs text-white/60 mt-1">
                System administrators
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={(value) => handleRoleFilter(value as Role | "ALL")}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value={Role.USER}>User</SelectItem>
                  <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subscriptionFilter} onValueChange={(value) => handleSubscriptionFilter(value as SubscriptionTier | "ALL")}>
                <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tiers</SelectItem>
                  <SelectItem value={SubscriptionTier.FREE}>Free</SelectItem>
                  <SelectItem value={SubscriptionTier.PRO}>Pro</SelectItem>
                  <SelectItem value={SubscriptionTier.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({totalUsers.toLocaleString()})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-white/60">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <SkeletonTable rows={10} columns={6} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/90">User</TableHead>
                    <TableHead className="text-white/90">Role</TableHead>
                    <TableHead className="text-white/90">Subscription</TableHead>
                    <TableHead className="text-white/90">Activity</TableHead>
                    <TableHead className="text-white/90">Joined</TableHead>
                    <TableHead className="text-white/90">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-white/60">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getSubscriptionBadgeColor(user.subscription?.tier || SubscriptionTier.FREE)}>
                            {user.subscription?.tier || 'FREE'}
                          </Badge>
                          {user.subscription && (
                            <Badge className={getStatusBadgeColor(user.subscription.status)}>
                              {user.subscription.status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-white/70">
                          <div>{user._count.stories} stories</div>
                          <div>{user._count.analyses} analyses</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-white/70">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-white/60 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-900 border-white/20">
                            <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/20" />
                            <DropdownMenuItem 
                              className="text-white hover:bg-white/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-white hover:bg-white/10"
                              onClick={() => {
                                setSubscriptionUserId(user.id);
                                setSubscriptionUserName(user.name || user.email);
                                setIsSubscriptionPanelOpen(true);
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-white hover:bg-white/10"
                              onClick={() => suspendUser(user.id, 'Administrative action')}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/20" />
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-white/60">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-white/70">
              Update user role and subscription settings.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User Information</Label>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="font-medium">{selectedUser.name || 'No name'}</div>
                  <div className="text-sm text-white/60">{selectedUser.email}</div>
                  <div className="text-xs text-white/50 mt-1">
                    Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => updateUserRole(selectedUser.id, value as Role)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.USER}>User</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subscription Tier</Label>
                  <Select 
                    value={selectedUser.subscription?.tier || SubscriptionTier.FREE}
                    onValueChange={(value) => 
                      updateUserSubscription(
                        selectedUser.id, 
                        value as SubscriptionTier, 
                        selectedUser.subscription?.status || SubscriptionStatus.ACTIVE
                      )
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionTier.FREE}>Free</SelectItem>
                      <SelectItem value={SubscriptionTier.PRO}>Pro</SelectItem>
                      <SelectItem value={SubscriptionTier.ENTERPRISE}>Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Status</Label>
                  <Select 
                    value={selectedUser.subscription?.status || SubscriptionStatus.ACTIVE}
                    onValueChange={(value) => 
                      updateUserSubscription(
                        selectedUser.id, 
                        selectedUser.subscription?.tier || SubscriptionTier.FREE,
                        value as SubscriptionStatus
                      )
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={SubscriptionStatus.CANCELED}>Canceled</SelectItem>
                      <SelectItem value={SubscriptionStatus.PAST_DUE}>Past Due</SelectItem>
                      <SelectItem value={SubscriptionStatus.UNPAID}>Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity Summary</Label>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 rounded bg-white/5">
                    <div className="font-medium text-white">{selectedUser._count.stories}</div>
                    <div className="text-white/60">Stories</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/5">
                    <div className="font-medium text-white">{selectedUser._count.analyses}</div>
                    <div className="text-white/60">Analyses</div>
                  </div>
                  <div className="text-center p-2 rounded bg-white/5">
                    <div className="font-medium text-white">{selectedUser._count.backgroundJobs}</div>
                    <div className="text-white/60">Jobs</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Panel */}
      {isSubscriptionPanelOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <UserSubscriptionPanel
                userId={subscriptionUserId}
                userName={subscriptionUserName}
                onClose={() => {
                  setIsSubscriptionPanelOpen(false);
                  setSubscriptionUserId('');
                  setSubscriptionUserName('');
                  // Refresh the users list to show updated subscription data
                  fetchUsers(currentPage, searchTerm, roleFilter, subscriptionFilter);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}