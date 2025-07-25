"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Separator } from "@/components/ui/separator";
import { Users, Shield, Activity, AlertTriangle } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import UserForm from "@/components/admin/UserForm";
import { getUsers, deleteUser } from "@/app/actions/user";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    accounts: number;
    sessions: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUsers();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || "Failed to load users");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.role === "ADMIN") {
      loadUsers();
    }
  }, [session]);

  // Handle user operations
  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setSuccessMessage(result.message || "User deleted successfully");
        await loadUsers(); // Refresh the list
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || "Failed to delete user");
        setTimeout(() => setError(null), 5000);
      }
    } catch {
      setError("An unexpected error occurred");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleFormSuccess = () => {
    loadUsers(); // Refresh the list
    setSuccessMessage(
      editingUser ? "User updated successfully" : "User created successfully",
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const regularUsers = totalUsers - adminUsers;
  const verifiedUsers = users.filter((user) => user.emailVerified).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {session?.user.name}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => (window.location.href = "/admin/analytics")}
            >
              <Activity className="h-4 w-4" />
              Analytics & Reports
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => (window.location.href = "/admin/background-tasks")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Background Tasks
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => (window.location.href = "/admin/modules")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Prompt Studio
            </Button>
          </div>
        </div>
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                Administrative users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Regular Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regularUsers}</div>
              <p className="text-xs text-muted-foreground">
                Standard user accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Verified Users
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Email verified accounts
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* User Management */}
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onCreate={handleCreateUser}
        />

        {/* User Form Dialog */}
        <UserForm
          user={editingUser}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
}
