"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { getAllAnalysisTemplates as getAllTemplates } from "@/lib/analysis-templates";
import type { AnalysisTemplate } from "@/lib/analysis-templates";

/**
 * Get all analysis templates for the current user (server action)
 */
export async function getTemplatesForUser(): Promise<{
  success: boolean;
  data?: AnalysisTemplate[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const templates = await getAllTemplates(userId);
    return { success: true, data: templates };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch templates",
    };
  }
}

/**
 * Get built-in templates only (server action)
 */
export async function getBuiltInTemplates(): Promise<{
  success: boolean;
  data?: AnalysisTemplate[];
  error?: string;
}> {
  try {
    const templates = await getAllTemplates();
    const builtInTemplates = templates.filter((t) => t.isBuiltIn);
    return { success: true, data: builtInTemplates };
  } catch (error) {
    console.error("Error fetching built-in templates:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch templates",
    };
  }
}

/**
 * Get a single template by ID (server action)
 */
export async function getTemplateById(templateId: string): Promise<{
  success: boolean;
  data?: AnalysisTemplate;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const template = await getAllTemplates(userId).then((templates) =>
      templates.find((t) => t.id === templateId),
    );

    if (template) {
      return { success: true, data: template };
    } else {
      return { success: false, error: "Template not found" };
    }
  } catch (error) {
    console.error("Error fetching template:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch template",
    };
  }
}
