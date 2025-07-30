import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // Get active countdown configuration
    const countdown = await prisma.launchCountdown.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!countdown) {
      // Return default countdown if none exists
      return NextResponse.json({
        targetDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 30 days from now
        title: "CharismaAI is Coming Soon",
        subtitle: "Get ready for AI-powered communication insights",
        isActive: true,
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        completedTitle: "CharismaAI is Now Live!",
        completedSubtitle: "Start analyzing your conversations today",
      });
    }

    return NextResponse.json({
      targetDate: countdown.targetDate.toISOString(),
      title: countdown.title,
      subtitle: countdown.subtitle,
      isActive: countdown.isActive,
      showDays: countdown.showDays,
      showHours: countdown.showHours,
      showMinutes: countdown.showMinutes,
      showSeconds: countdown.showSeconds,
      completedTitle: countdown.completedTitle,
      completedSubtitle: countdown.completedSubtitle,
    });
  } catch (error) {
    console.error("Launch countdown fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user from database to check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      targetDate,
      title,
      subtitle,
      isActive,
      showDays,
      showHours,
      showMinutes,
      showSeconds,
      completedTitle,
      completedSubtitle,
    } = body;

    // Validate required fields
    if (!targetDate) {
      return NextResponse.json(
        { error: "Target date is required" },
        { status: 400 },
      );
    }

    // Validate date format
    const parsedDate = new Date(targetDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    // Deactivate all existing countdowns
    await prisma.launchCountdown.updateMany({
      data: { isActive: false },
    });

    // Create new countdown
    const countdown = await prisma.launchCountdown.create({
      data: {
        targetDate: parsedDate,
        title: title || "CharismaAI is Coming Soon",
        subtitle: subtitle || "Get ready for AI-powered communication insights",
        isActive: isActive !== undefined ? isActive : true,
        showDays: showDays !== undefined ? showDays : true,
        showHours: showHours !== undefined ? showHours : true,
        showMinutes: showMinutes !== undefined ? showMinutes : true,
        showSeconds: showSeconds !== undefined ? showSeconds : true,
        completedTitle: completedTitle || "CharismaAI is Now Live!",
        completedSubtitle:
          completedSubtitle || "Start analyzing your conversations today",
      },
    });

    return NextResponse.json({
      success: true,
      countdown: {
        id: countdown.id,
        targetDate: countdown.targetDate.toISOString(),
        title: countdown.title,
        subtitle: countdown.subtitle,
        isActive: countdown.isActive,
        showDays: countdown.showDays,
        showHours: countdown.showHours,
        showMinutes: countdown.showMinutes,
        showSeconds: countdown.showSeconds,
        completedTitle: countdown.completedTitle,
        completedSubtitle: countdown.completedSubtitle,
      },
    });
  } catch (error) {
    console.error("Launch countdown creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user from database to check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Countdown ID is required" },
        { status: 400 },
      );
    }

    // Update the countdown
    const countdown = await prisma.launchCountdown.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      countdown: {
        id: countdown.id,
        targetDate: countdown.targetDate.toISOString(),
        title: countdown.title,
        subtitle: countdown.subtitle,
        isActive: countdown.isActive,
        showDays: countdown.showDays,
        showHours: countdown.showHours,
        showMinutes: countdown.showMinutes,
        showSeconds: countdown.showSeconds,
        completedTitle: countdown.completedTitle,
        completedSubtitle: countdown.completedSubtitle,
      },
    });
  } catch (error) {
    console.error("Launch countdown update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user from database to check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Countdown ID is required" },
        { status: 400 },
      );
    }

    // Delete the countdown
    await prisma.launchCountdown.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Countdown deleted successfully",
    });
  } catch (error) {
    console.error("Launch countdown deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
