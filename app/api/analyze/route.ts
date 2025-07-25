import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { analyzeChat } from "@/app/actions/analyze";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("chatFile") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Call the analyze action directly with the original FormData
    const result = await analyzeChat(formData);

    if (!result.success) {
      let errorMessage = result.error || "Analysis failed";

      // Provide more helpful error messages
      if (
        errorMessage.includes("API key") ||
        errorMessage.includes("authentication")
      ) {
        errorMessage =
          "AI provider not configured. Please set up your API key in Settings.";
      } else if (
        errorMessage.includes("template") ||
        errorMessage.includes("Template")
      ) {
        errorMessage =
          "Analysis template not found. Please check your settings.";
      } else if (
        errorMessage.includes("model") ||
        errorMessage.includes("Model")
      ) {
        errorMessage =
          "AI model not available. Please check your model selection in Settings.";
      } else if (
        errorMessage.includes("quota") ||
        errorMessage.includes("limit")
      ) {
        errorMessage =
          "API quota exceeded. Please check your AI provider billing or try again later.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Analysis API error:", error);

    let errorMessage =
      "Analysis failed. Please check your settings and try again.";

    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("authentication")
      ) {
        errorMessage =
          "AI provider not configured. Please set up your API key in Settings.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
