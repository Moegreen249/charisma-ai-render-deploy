"use client";

import React, { useReducer, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import UploadCard from "@/components/UploadCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import CoachChat from "@/components/CoachChat";

import { analyzeChat, type AnalysisResult } from "@/app/actions/analyze";
import {
  getSelectedModel,
  getApiKey,
  getSelectedAnalysisTemplate,
} from "@/lib/settings";
import BackgroundAnalysis from "@/components/BackgroundAnalysis";
import BackgroundProcessingView from "@/components/BackgroundProcessingView";
import { getTemplateById } from "@/app/actions/templates";
import { getProviderConfig, getModelInfo } from "@/lib/ai-providers";
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
  const { data: session } = useSession();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [coachOpen, setCoachOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>("");

  // Load current template on mount
  useEffect(() => {
    const templateId = getSelectedAnalysisTemplate();
    setCurrentTemplateId(templateId);
  }, []);

  const handleFileSelect = (file: File) => {
    dispatch({ type: "SET_FILE", payload: file });
  };

  const handleAnalyze = async () => {
    if (!state.selectedFile) return;

    dispatch({ type: "START_ANALYSIS" });

    try {
      // Get current configuration
      const selection = getSelectedModel();
      const providerConfig = getProviderConfig(selection.provider);

      if (!providerConfig) {
        throw new Error("Provider configuration not found");
      }

      const apiKey = getApiKey(providerConfig.apiKeyName);
      const templateId = getSelectedAnalysisTemplate();

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start analysis");
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

  // Render based on current state
  return (
    <div className="min-h-screen bg-background">
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
  );
}
