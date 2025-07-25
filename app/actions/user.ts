"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import {
  userCreateSchema,
  userUpdateSchema,
  userPasswordUpdateSchema,
} from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// Helper function to check admin authorization
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

/**
 * Get all users (admin only)
 */
export async function getUsers() {
  await checkAdminAuth();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(formData: FormData) {
  await checkAdminAuth();

  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    // Validate input
    const validatedData = userCreateSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        emailVerified: new Date(), // Auto-verify for admin-created users
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: user, message: "User created successfully" };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create user" };
  }
}

/**
 * Update user information (admin only)
 */
export async function updateUser(id: string, formData: FormData) {
  await checkAdminAuth();

  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    };

    // Validate input
    const validatedData = userUpdateSchema.parse(rawData);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return { success: false, error: "Email already in use" };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update user" };
  }
}

/**
 * Update user password (admin only)
 */
export async function updateUserPassword(id: string, formData: FormData) {
  await checkAdminAuth();

  try {
    const rawData = {
      password: formData.get("password") as string,
    };

    // Validate input
    const validatedData = userPasswordUpdateSchema.parse(rawData);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    revalidatePath("/admin");
    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error updating password:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update password" };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(id: string) {
  await checkAdminAuth();

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Prevent admin from deleting themselves
    const session = await getServerSession(authOptions);
    if (session?.user.id === id) {
      return { success: false, error: "Cannot delete your own account" };
    }

    // Delete user (this will cascade delete accounts and sessions)
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete user" };
  }
}

/**
 * Get user by ID (admin only)
 */
export async function getUserById(id: string) {
  await checkAdminAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}
