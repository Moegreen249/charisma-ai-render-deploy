"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { moduleCreateSchema, moduleUpdateSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// Get all modules
export async function getModules(): Promise<
  { success: true; data: any[] } | { success: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    const modules = await prisma.analysisModule.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: modules };
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return { success: false, error: "Failed to fetch modules" };
  }
}

// Get module by ID
export async function getModuleById(
  id: string,
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    const module = await prisma.analysisModule.findUnique({
      where: { id },
    });

    if (!module) {
      return { success: false, error: "Module not found" };
    }

    return { success: true, data: module };
  } catch (error) {
    console.error("Failed to fetch module:", error);
    return { success: false, error: "Failed to fetch module" };
  }
}

// Create new module
export async function createModule(
  formData: FormData,
): Promise<
  | { success: true; data: any; message: string }
  | { success: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    const rawData = {
      name: formData.get("name") as string || "",
      description: formData.get("description") as string || "",
      instructionPrompt: formData.get("instructionPrompt") as string || "",
      expectedJsonHint: formData.get("expectedJsonHint") as string || "",
      category: formData.get("category") as string || "",
      icon: formData.get("icon") as string || "",
      isActive: formData.get("isActive") === "true",
      isBuiltIn: false, // Always false for admin-created modules
    };

    const validatedData = moduleCreateSchema.parse(rawData);

    const module = await prisma.analysisModule.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        instructionPrompt: validatedData.instructionPrompt,
        expectedJsonHint: validatedData.expectedJsonHint,
        category: validatedData.category,
        icon: validatedData.icon,
        isActive: validatedData.isActive,
        isBuiltIn: validatedData.isBuiltIn,
      },
    });

    revalidatePath("/admin/modules");
    return {
      success: true,
      data: module,
      message: "Module created successfully",
    };
  } catch (error: any) {
    console.error("Failed to create module:", error);
    if (error.name === "ZodError") {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create module" };
  }
}

// Update module
export async function updateModule(
  id: string,
  formData: FormData,
): Promise<
  | { success: true; data: any; message: string }
  | { success: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    // Check if module exists and is not built-in (for certain fields)
    const existingModule = await prisma.analysisModule.findUnique({
      where: { id },
    });

    if (!existingModule) {
      return { success: false, error: "Module not found" };
    }

    const rawData: any = {};

    // Only allow updating certain fields for built-in modules
    if (!existingModule.isBuiltIn) {
      rawData.name = formData.get("name") as string;
      rawData.instructionPrompt = formData.get("instructionPrompt") as string;
      rawData.expectedJsonHint = formData.get("expectedJsonHint") as string;
      rawData.category = formData.get("category") as string;
      rawData.icon = formData.get("icon") as string;
    }

    // These fields can always be updated
    rawData.description = formData.get("description") as string;
    rawData.isActive = formData.get("isActive") === "true";

    const validatedData = moduleUpdateSchema.parse(rawData);

    const module = await prisma.analysisModule.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/modules");
    return {
      success: true,
      data: module,
      message: "Module updated successfully",
    };
  } catch (error: any) {
    console.error("Failed to update module:", error);
    if (error.name === "ZodError") {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update module" };
  }
}

// Delete module
export async function deleteModule(
  id: string,
): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized. Admin access required." };
  }

  try {
    // Check if module exists and is not built-in
    const module = await prisma.analysisModule.findUnique({
      where: { id },
    });

    if (!module) {
      return { success: false, error: "Module not found" };
    }

    if (module.isBuiltIn) {
      return { success: false, error: "Cannot delete built-in modules" };
    }

    await prisma.analysisModule.delete({
      where: { id },
    });

    revalidatePath("/admin/modules");
    return { success: true, message: "Module deleted successfully" };
  } catch (error) {
    console.error("Failed to delete module:", error);
    return { success: false, error: "Failed to delete module" };
  }
}
