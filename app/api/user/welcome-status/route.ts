import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        welcome: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no welcome record exists, create one with default values
    if (!user.welcome) {
      const welcome = await prisma.userWelcome.create({
        data: {
          userId: user.id,
          hasSeenWelcome: false,
          onboardingStep: 0,
        },
      });

      return NextResponse.json({
        hasSeenWelcome: welcome.hasSeenWelcome,
        onboardingStep: welcome.onboardingStep,
        welcomeShownAt: welcome.welcomeShownAt,
      });
    }

    return NextResponse.json({
      hasSeenWelcome: user.welcome.hasSeenWelcome,
      onboardingStep: user.welcome.onboardingStep,
      welcomeShownAt: user.welcome.welcomeShownAt,
    });
  } catch (error) {
    console.error("Welcome status fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { hasSeenWelcome, onboardingStep } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create welcome status
    const welcome = await prisma.userWelcome.upsert({
      where: { userId: user.id },
      update: {
        hasSeenWelcome:
          hasSeenWelcome !== undefined ? hasSeenWelcome : undefined,
        onboardingStep:
          onboardingStep !== undefined ? onboardingStep : undefined,
        welcomeShownAt: hasSeenWelcome ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        hasSeenWelcome: hasSeenWelcome || false,
        onboardingStep: onboardingStep || 0,
        welcomeShownAt: hasSeenWelcome ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      hasSeenWelcome: welcome.hasSeenWelcome,
      onboardingStep: welcome.onboardingStep,
      welcomeShownAt: welcome.welcomeShownAt,
    });
  } catch (error) {
    console.error("Welcome status update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
