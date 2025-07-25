#!/usr/bin/env tsx

/**
 * Template Standards Validation Script
 *
 * This script validates that all analysis templates comply with the standardized
 * metadata schema, color mapping, and required insights structure.
 */

import { BUILT_IN_TEMPLATES } from "../lib/analysis-templates";
import {
  validateTemplateResponse,
  STANDARD_METADATA_SCHEMA,
  COLOR_MAPPING,
  ICON_MAPPING,
  REQUIRED_INSIGHTS,
  CORE_METRICS,
} from "../lib/template-standards";

interface ValidationReport {
  templateId: string;
  templateName: string;
  isCompliant: boolean;
  issues: {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

function extractInsightsFromPrompt(analysisPrompt: string): any[] {
  try {
    // Look for the complete JSON structure in the prompt
    const jsonMatch = analysisPrompt.match(
      /\{[\s\S]*?"insights":\s*\[([\s\S]*?)\][\s\S]*?"metrics":/,
    );
    if (!jsonMatch) return [];

    // Extract just the insights array content
    const insightsContent = jsonMatch[1];

    // Split by objects (looking for complete insight objects)
    const insightObjects: any[] = [];
    let depth = 0;
    let currentObject = "";
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < insightsContent.length; i++) {
      const char = insightsContent[i];

      if (escapeNext) {
        escapeNext = false;
        currentObject += char;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        currentObject += char;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
      }

      if (!inString) {
        if (char === "{") {
          depth++;
        } else if (char === "}") {
          depth--;
        }
      }

      currentObject += char;

      if (depth === 0 && currentObject.trim() && char === "}") {
        try {
          const parsed = JSON.parse(currentObject.trim());
          insightObjects.push(parsed);
          currentObject = "";
        } catch (e) {
          // Skip malformed objects
        }
      }
    }

    return insightObjects;
  } catch (error) {
    return [];
  }
}

function extractMetricsFromPrompt(analysisPrompt: string): any {
  try {
    // Look for metrics object in the prompt
    const metricsMatch = analysisPrompt.match(/"metrics":\s*\{([^}]*)\}/);
    if (!metricsMatch) return {};

    const metricsContent = metricsMatch[1];
    const metrics: any = {};

    // Parse key-value pairs from metrics
    const pairs = metricsContent.split(",");
    pairs.forEach((pair) => {
      const colonIndex = pair.indexOf(":");
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim().replace(/"/g, "");
        const value = pair.substring(colonIndex + 1).trim();

        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          metrics[key] = numValue;
        }
      }
    });

    return metrics;
  } catch (error) {
    return {};
  }
}

function validateTemplate(template: any): ValidationReport {
  const report: ValidationReport = {
    templateId: template.id,
    templateName: template.name,
    isCompliant: true,
    issues: {
      errors: [],
      warnings: [],
      suggestions: [],
    },
  };

  // Check if template has required fields
  if (!template.analysisPrompt) {
    report.issues.errors.push("Missing analysisPrompt field");
    report.isCompliant = false;
    return report;
  }

  // Extract sample response structure from prompt
  const sampleInsights = extractInsightsFromPrompt(template.analysisPrompt);
  const sampleMetrics = extractMetricsFromPrompt(template.analysisPrompt);

  // Validate standardized instructions presence
  const prompt = template.analysisPrompt;
  if (
    !prompt.includes("getStandardizedPromptInstructions") &&
    !prompt.includes("IMPORTANT INSTRUCTIONS:")
  ) {
    report.issues.warnings.push(
      "Template may not include standardized instructions",
    );
  }

  // Check for language detection instruction
  if (
    !prompt.includes("detect the language") &&
    !prompt.includes("detectedLanguage")
  ) {
    report.issues.errors.push("Missing language detection instruction");
    report.isCompliant = false;
  }

  // Check for JSON formatting rules
  if (
    !prompt.includes("JSON FORMATTING RULES") &&
    !prompt.includes("commas (,) to separate")
  ) {
    report.issues.warnings.push("Missing explicit JSON formatting rules");
  }

  // Validate sample insights structure
  if (sampleInsights.length === 0) {
    report.issues.errors.push("No sample insights found in template");
    report.isCompliant = false;
  } else {
    // Check required insight types
    const hasScoreInsight = sampleInsights.some(
      (insight) => insight.type === "score",
    );
    const hasChartInsight = sampleInsights.some(
      (insight) => insight.type === "chart",
    );
    const hasTextInsight = sampleInsights.some(
      (insight) => insight.type === "text",
    );

    if (!hasScoreInsight) {
      report.issues.warnings.push("Missing score-type insight example");
    }
    if (!hasChartInsight) {
      report.issues.warnings.push("Missing chart-type insight example");
    }
    if (!hasTextInsight) {
      report.issues.warnings.push("Missing text-type insight example");
    }

    // Validate metadata compliance
    sampleInsights.forEach((insight, index) => {
      if (!insight.metadata) {
        report.issues.errors.push(
          `Insight ${index + 1}: Missing metadata object`,
        );
        report.isCompliant = false;
        return;
      }

      const metadata = insight.metadata;

      // Check category
      if (!metadata.category) {
        report.issues.errors.push(`Insight ${index + 1}: Missing category`);
        report.isCompliant = false;
      } else if (
        !STANDARD_METADATA_SCHEMA.categories.includes(metadata.category)
      ) {
        report.issues.errors.push(
          `Insight ${index + 1}: Invalid category '${metadata.category}'`,
        );
        report.isCompliant = false;
      }

      // Check priority
      if (!metadata.priority) {
        report.issues.errors.push(`Insight ${index + 1}: Missing priority`);
        report.isCompliant = false;
      } else if (metadata.priority < 1 || metadata.priority > 5) {
        report.issues.errors.push(
          `Insight ${index + 1}: Invalid priority '${metadata.priority}' (must be 1-5)`,
        );
        report.isCompliant = false;
      }

      // Check confidence
      if (metadata.confidence === undefined) {
        report.issues.errors.push(`Insight ${index + 1}: Missing confidence`);
        report.isCompliant = false;
      } else if (metadata.confidence < 0 || metadata.confidence > 1) {
        report.issues.errors.push(
          `Insight ${index + 1}: Invalid confidence '${metadata.confidence}' (must be 0.0-1.0)`,
        );
        report.isCompliant = false;
      }

      // Check color compliance
      if (metadata.color && metadata.category) {
        const expectedColor =
          COLOR_MAPPING[metadata.category as keyof typeof COLOR_MAPPING];
        if (expectedColor && metadata.color !== expectedColor) {
          report.issues.suggestions.push(
            `Insight ${index + 1}: Consider using standard color '${expectedColor}' for category '${metadata.category}' instead of '${metadata.color}'`,
          );
        }
      }

      // Check icon compliance
      if (metadata.icon && metadata.category) {
        const expectedIcon =
          ICON_MAPPING[metadata.category as keyof typeof ICON_MAPPING];
        if (expectedIcon && metadata.icon !== expectedIcon) {
          report.issues.suggestions.push(
            `Insight ${index + 1}: Consider using standard icon '${expectedIcon}' for category '${metadata.category}' instead of '${metadata.icon}'`,
          );
        }
      }
    });
  }

  // Validate metrics compliance
  if (Object.keys(sampleMetrics).length === 0) {
    report.issues.errors.push("No sample metrics found in template");
    report.isCompliant = false;
  } else {
    // Check required metrics
    CORE_METRICS.required.forEach((requiredMetric) => {
      if (!(requiredMetric in sampleMetrics)) {
        report.issues.warnings.push(
          `Missing required metric: ${requiredMetric}`,
        );
      }
    });

    // Check metric values are in valid range
    Object.entries(sampleMetrics).forEach(([metricName, value]) => {
      if (typeof value === "number") {
        if (value < 0 || value > 1) {
          report.issues.errors.push(
            `Metric '${metricName}': Invalid value '${value}' (must be 0.0-1.0)`,
          );
          report.isCompliant = false;
        }
      }
    });
  }

  // Check for required insight compliance
  const communicationInsight = sampleInsights.find(
    (insight) =>
      insight.title?.toLowerCase().includes("communication") &&
      insight.title?.toLowerCase().includes("effectiveness"),
  );
  if (!communicationInsight) {
    report.issues.warnings.push("Missing Communication Effectiveness insight");
  }

  const emotionalTimeline = sampleInsights.find(
    (insight) =>
      insight.type === "chart" &&
      (insight.title?.toLowerCase().includes("emotional") ||
        insight.title?.toLowerCase().includes("emotion")),
  );
  if (!emotionalTimeline) {
    report.issues.warnings.push("Missing emotional timeline chart insight");
  }

  return report;
}

function generateComplianceReport(): void {
  console.log("🔍 Template Standards Validation Report");
  console.log("=".repeat(50));
  console.log();

  const reports: ValidationReport[] = [];
  let totalCompliant = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalSuggestions = 0;

  // Validate each built-in template
  BUILT_IN_TEMPLATES.forEach((template) => {
    const report = validateTemplate(template);
    reports.push(report);

    if (report.isCompliant) {
      totalCompliant++;
    }

    totalErrors += report.issues.errors.length;
    totalWarnings += report.issues.warnings.length;
    totalSuggestions += report.issues.suggestions.length;

    // Print individual template report
    const status = report.isCompliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT";
    console.log(`${status} | ${template.name} (${template.id})`);

    if (report.issues.errors.length > 0) {
      console.log("  🚨 ERRORS:");
      report.issues.errors.forEach((error) => console.log(`    - ${error}`));
    }

    if (report.issues.warnings.length > 0) {
      console.log("  ⚠️  WARNINGS:");
      report.issues.warnings.forEach((warning) =>
        console.log(`    - ${warning}`),
      );
    }

    if (report.issues.suggestions.length > 0) {
      console.log("  💡 SUGGESTIONS:");
      report.issues.suggestions.forEach((suggestion) =>
        console.log(`    - ${suggestion}`),
      );
    }

    console.log();
  });

  // Print summary
  console.log("📊 SUMMARY");
  console.log("-".repeat(25));
  console.log(`Total Templates: ${BUILT_IN_TEMPLATES.length}`);
  console.log(`Compliant: ${totalCompliant}`);
  console.log(`Non-Compliant: ${BUILT_IN_TEMPLATES.length - totalCompliant}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log(`Total Suggestions: ${totalSuggestions}`);
  console.log();

  const complianceRate = (totalCompliant / BUILT_IN_TEMPLATES.length) * 100;
  console.log(`Compliance Rate: ${complianceRate.toFixed(1)}%`);

  if (complianceRate === 100) {
    console.log("🎉 All templates are fully compliant with standards!");
  } else if (complianceRate >= 80) {
    console.log(
      "👍 Most templates are compliant. Address remaining issues for full compliance.",
    );
  } else {
    console.log(
      "⚠️  Significant standardization work needed. Please address compliance issues.",
    );
  }

  // Exit with error code if there are compliance issues
  if (totalErrors > 0 || complianceRate < 100) {
    process.exit(1);
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  try {
    generateComplianceReport();
  } catch (error) {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  }
}

export { validateTemplate, generateComplianceReport };
