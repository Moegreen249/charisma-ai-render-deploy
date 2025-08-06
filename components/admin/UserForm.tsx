"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Mail, UserPlus } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import { useFormState } from "react-dom";
import { createUser, updateUser } from "@/app/actions/user";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserForm({ user, isOpen, onClose, onSuccess }: UserFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!user;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsPasswordVisible(false);
    }
  }, [isOpen]);

  const handleCreateUser = async (formData: FormData) => {
    const result = await createUser(formData);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (formData: FormData) => {
    if (!user) return;
    const result = await updateUser(user.id, formData);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to update user");
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (isEditing) {
      handleUpdateUser(formData);
    } else {
      handleCreateUser(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5" />
                Edit User
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create User
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information. Leave fields empty to keep current values."
              : "Create a new user account with the specified details."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name || ""}
              placeholder="Enter user's full name"
              required={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ""}
                placeholder="Enter email address"
                className="pl-10"
                required={!isEditing}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user?.role || "USER"}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 