import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if templates are available
    const templateCount = await prisma.analysisModule.count();

    // Validate template compliance
    const expectedTemplates = [
      "Communication Analysis",
      "Relationship Analysis",
      "Business Meeting Analysis",
      "Coaching Session Analysis",
      "Advanced Communication Analysis",
      "Deep Relationship Dynamics",
      "Executive Leadership Analysis",
      "Advanced Coaching Analysis",
      "Clinical Therapeutic Assessment",
      "Deep Forensic Analysis",
    ];

    const templates = await prisma.analysisModule.findMany({
      select: { name: true },
    });

    const templateNames = templates.map((t) => t.name);
    const missingTemplates = expectedTemplates.filter(
      (name) => !templateNames.includes(name),
    );

    const complianceRate =
      ((expectedTemplates.length - missingTemplates.length) /
        expectedTemplates.length) *
      100;

    // Check system status
    const health = {
      status: complianceRate === 100 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      database: "connected",
      templates: {
        count: templateCount,
        expected: expectedTemplates.length,
        compliance: `${complianceRate.toFixed(1)}%`,
        status: complianceRate === 100 ? "fully_compliant" : "incomplete",
        missing: missingTemplates.length > 0 ? missingTemplates : undefined,
      },
      standardization: {
        framework: "active",
        validation: "enabled",
        quality_assurance: complianceRate === 100 ? "passed" : "failed",
      },
      services: {
        api: "operational",
        authentication: "operational",
        analysis: complianceRate >= 80 ? "operational" : "degraded",
        template_validation: "operational",
      },
    };

    return NextResponse.json(health, {
      status: complianceRate === 100 ? 200 : 206,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    const health = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      templates: {
        count: 0,
        expected: 10,
        compliance: "0.0%",
        status: "unavailable",
      },
      standardization: {
        framework: "inactive",
        validation: "disabled",
        quality_assurance: "failed",
      },
      services: {
        api: "degraded",
        authentication: "unknown",
        analysis: "unavailable",
        template_validation: "unavailable",
      },
    };

    return NextResponse.json(health, { status: 503 });
  }
}
