"use client";

import React, { useReducer, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import UploadCard from "@/components/UploadCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import CoachChat from "@/components/CoachChat";

import { type AnalysisResult } from "@/app/actions/analyze";
import {
  getSelectedModel,
  getApiKey,
  getSelectedAnalysisTemplate,
} from "@/lib/settings";
import BackgroundProcessingView from "@/components/BackgroundProcessingView";
import { getProviderConfig } from "@/lib/ai-providers-client";
import EnhancedAnalysisView from "@/components/EnhancedAnalysisView";
import { AnimatePresence } from "framer-motion";

// Define the application states
type AppState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "coaching"
  | "background-processing";

// Define the state interface
interface State {
  currentView: AppState;
  selectedFile: File | null;
  analysisData: AnalysisResult | null;
  error: string | null;
  jobId?: string;
  fileName?: string;
}

// Define action types
type Action =
  | { type: "SET_FILE"; payload: File }
  | { type: "START_ANALYSIS" }
  | { type: "ANALYSIS_SUCCESS"; payload: AnalysisResult }
  | { type: "ANALYSIS_ERROR"; payload: string }
  | {
      type: "BACKGROUND_ANALYSIS_STARTED";
      payload: { jobId: string; fileName: string };
    }
  | { type: "OPEN_COACH" }
  | { type: "CLOSE_COACH" }
  | { type: "RESET" };

// Initial state
const initialState: State = {
  currentView: "idle",
  selectedFile: null,
  analysisData: null,
  error: null,
  jobId: undefined,
  fileName: undefined,
};

// Reducer function
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, selectedFile: action.payload };

    case "START_ANALYSIS":
      return { ...state, currentView: "loading", error: null };

    case "ANALYSIS_SUCCESS":
      return { ...state, currentView: "success", analysisData: action.payload };

    case "BACKGROUND_ANALYSIS_STARTED":
      return {
        ...state,
        currentView: "background-processing",
        error: null,
        jobId: action.payload.jobId,
        fileName: action.payload.fileName,
      };

    case "ANALYSIS_ERROR":
      return { ...state, currentView: "error", error: action.payload };

    case "OPEN_COACH":
      return { ...state, currentView: "coaching" };

    case "CLOSE_COACH":
      return { ...state, currentView: "success" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export default function Home() {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [coachOpen, setCoachOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>("");

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  // Load current template on mount
  useEffect(() => {
    const loadTemplate = async () => {
      const templateId = await getSelectedAnalysisTemplate();
      setCurrentTemplateId(templateId);
    };
    loadTemplate();
  }, []);

  const handleFileSelect = (file: File) => {
    dispatch({ type: "SET_FILE", payload: file });
  };

  const handleAnalyze = async () => {
    if (!state.selectedFile) return;

    dispatch({ type: "START_ANALYSIS" });

    try {
      // Get current configuration
      const selection = await getSelectedModel();
      const providerConfig = getProviderConfig(selection.provider);

      if (!providerConfig) {
        throw new Error("Provider configuration not found");
      }

      const apiKey = await getApiKey(providerConfig.apiKeyName);
      const templateId = await getSelectedAnalysisTemplate();

      if (!apiKey) {
        throw new Error(`No API key found for ${providerConfig.name}`);
      }

      // Read file content
      const fileContent = await state.selectedFile.text();

      // Start background analysis
      const response = await fetch("/api/background/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          modelId: selection.modelId,
          provider: selection.provider,
          fileName: state.selectedFile.name,
          fileContent,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Analysis request failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Failed to start analysis" };
        }
        
        throw new Error(errorData.error || `Server error (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();

      // Update state to show background processing started
      dispatch({
        type: "BACKGROUND_ANALYSIS_STARTED",
        payload: {
          jobId: result.jobId,
          fileName: state.selectedFile.name,
        },
      });

      // Show background processing started
      // The actual analysis result will come later via the background processing view
    } catch (error) {
      console.error("Analysis error:", error);
      dispatch({
        type: "ANALYSIS_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      // Analysis completed
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Only render for authenticated users
  if (status !== "authenticated") {
    return null;
  }

  // Render based on current state
  return (
    <UnifiedLayout variant="default">
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        {/* Neural background particles - analysis theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-48 right-24 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping"></div>
          <div className="absolute top-2/3 left-16 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
          <div className="absolute bottom-40 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-24 left-32 w-2 h-2 bg-indigo-300/15 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-pink-400/20 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        </div>
        
      <AnimatePresence mode="wait">
        {state.currentView === "loading" ? (
          <LoadingIndicator key="loading" />
        ) : state.currentView === "background-processing" ? (
          <BackgroundProcessingView
            key="background"
            jobId={state.jobId}
            fileName={state.fileName}
            onComplete={(result) => {
              dispatch({
                type: "ANALYSIS_SUCCESS",
                payload: result,
              });
              setCurrentTemplateId(result.templateId || currentTemplateId);
            }}
            onError={(error) => {
              dispatch({
                type: "ANALYSIS_ERROR",
                payload: error,
              });
            }}
          />
        ) : state.analysisData ? (
          <EnhancedAnalysisView
            key="analysis"
            analysisData={state.analysisData}
            templateId={currentTemplateId}
            coachOpen={coachOpen}
            setCoachOpen={setCoachOpen}
          />
        ) : (
          <UploadCard
            key="upload"
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            loading={false}
            error={state.error}
          />
        )}
      </AnimatePresence>
      {coachOpen && (
        <CoachChat
          onClose={() => setCoachOpen(false)}
          analysisData={state.analysisData}
        />
      )}
      </div>
    </UnifiedLayout>
  );
}
