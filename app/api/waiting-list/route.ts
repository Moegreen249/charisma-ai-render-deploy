import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, company, useCase, source } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await prisma.waitingList.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered on waiting list" },
        { status: 409 },
      );
    }

    // Get current position (count of existing entries + 1)
    const currentCount = await prisma.waitingList.count();
    const position = currentCount + 1;

    // Create waiting list entry
    const waitingListEntry = await prisma.waitingList.create({
      data: {
        email,
        name,
        company: company || null,
        useCase: useCase || null,
        source: source || null,
        position,
        isNotified: false,
      },
    });

    // Generate invite code for future use
    const inviteCode = `CHA-${position.toString().padStart(4, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await prisma.waitingList.update({
      where: { id: waitingListEntry.id },
      data: { inviteCode },
    });

    return NextResponse.json({
      success: true,
      position,
      inviteCode,
      message: "Successfully joined the waiting list!",
    });
  } catch (error) {
    console.error("Waiting list signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      // Get specific user's position
      const entry = await prisma.waitingList.findUnique({
        where: { email },
        select: {
          position: true,
          createdAt: true,
          isNotified: true,
          inviteCode: true,
        },
      });

      if (!entry) {
        return NextResponse.json(
          { error: "Email not found on waiting list" },
          { status: 404 },
        );
      }

      return NextResponse.json(entry);
    } else {
      // Get waiting list stats (for admin or public display)
      const stats = await prisma.waitingList.aggregate({
        _count: true,
      });

      return NextResponse.json({
        totalSignups: stats._count || 0,
      });
    }
  } catch (error) {
    console.error("Waiting list query error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
