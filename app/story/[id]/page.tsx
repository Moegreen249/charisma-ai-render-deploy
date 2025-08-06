import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth-config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { StoryViewerErrorBoundary } from "@/components/story/StoryErrorBoundary";
import StoryViewer from "@/components/story/StoryViewer";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StoryPage({ params }: PageProps) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  
  // Get story with analysis data
  const story = await prisma.story.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      analysis: {
        select: {
          fileName: true,
          provider: true,
          modelId: true,
          analysisDate: true,
          templateId: true,
        }
      }
    }
  });

  if (!story) {
    notFound();
  }

  return (
    <UnifiedLayout>
      <StoryViewerErrorBoundary>
        <StoryViewer story={story} />
      </StoryViewerErrorBoundary>
    </UnifiedLayout>
  );
}