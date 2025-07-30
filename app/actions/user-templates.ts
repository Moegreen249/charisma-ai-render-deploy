"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  userTemplateCreateSchema,
  userTemplateUpdateSchema,
} from "@/lib/schemas";

// Helper function to check authentication
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }
  return session;
}

/**
 * Get user templates for the current authenticated user
 */
export async function getUserTemplates() {
  try {
    const session = await checkAuth();

    const templates = await prisma.userTemplate.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        icon: true,
        systemPrompt: true,
        analysisPrompt: true,
        isBuiltIn: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching user templates:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch user templates" };
  }
}

/**
 * Get a specific user template by ID for the current authenticated user
 */
export async function getUserTemplateById(id: string) {
  try {
    const session = await checkAuth();

    const template = await prisma.userTemplate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, data: template };
  } catch (error) {
    console.error("Error fetching user template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch user template" };
  }
}

/**
 * Create a new user template for the current authenticated user
 */
export async function createUserTemplate(formData: FormData) {
  try {
    const session = await checkAuth();

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      icon: formData.get("icon") as string,
      systemPrompt: formData.get("systemPrompt") as string,
      analysisPrompt: formData.get("analysisPrompt") as string,
    };

    // Validate input
    const validatedData = userTemplateCreateSchema.parse(rawData);

    // Check if template name already exists for this user
    const existingTemplate = await prisma.userTemplate.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
      },
    });

    if (existingTemplate) {
      return {
        success: false,
        error: "A template with this name already exists",
      };
    }

    // Create the template
    const template = await prisma.userTemplate.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        icon: validatedData.icon,
        systemPrompt: validatedData.systemPrompt,
        analysisPrompt: validatedData.analysisPrompt,
      },
    });

    revalidatePath("/settings");
    return {
      success: true,
      data: template,
      message: "Template created successfully",
    };
  } catch (error) {
    console.error("Error creating user template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create template" };
  }
}

/**
 * Update a user template by ID for the current authenticated user
 */
export async function updateUserTemplate(id: string, formData: FormData) {
  try {
    const session = await checkAuth();

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      icon: formData.get("icon") as string,
      systemPrompt: formData.get("systemPrompt") as string,
      analysisPrompt: formData.get("analysisPrompt") as string,
    };

    // Validate input
    const validatedData = userTemplateUpdateSchema.parse(rawData);

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.userTemplate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return { success: false, error: "Template not found" };
    }

    // Check if new name conflicts with another template (if name is being changed)
    if (validatedData.name && validatedData.name !== existingTemplate.name) {
      const nameConflict = await prisma.userTemplate.findFirst({
        where: {
          userId: session.user.id,
          name: validatedData.name,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return {
          success: false,
          error: "A template with this name already exists",
        };
      }
    }

    // Update the template
    const updatedTemplate = await prisma.userTemplate.update({
      where: {
        id: id,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        icon: validatedData.icon,
        systemPrompt: validatedData.systemPrompt,
        analysisPrompt: validatedData.analysisPrompt,
      },
    });

    revalidatePath("/settings");
    return {
      success: true,
      data: updatedTemplate,
      message: "Template updated successfully",
    };
  } catch (error) {
    console.error("Error updating user template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update template" };
  }
}

/**
 * Delete a user template by ID for the current authenticated user
 */
export async function deleteUserTemplate(id: string) {
  try {
    const session = await checkAuth();

    // Check if template exists and belongs to user
    const template = await prisma.userTemplate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    // Delete the template
    await prisma.userTemplate.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/settings");
    return { success: true, message: "Template deleted successfully" };
  } catch (error) {
    console.error("Error deleting user template:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete template" };
  }
}
