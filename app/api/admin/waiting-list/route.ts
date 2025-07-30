import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get entries with pagination
    const [entries, totalCount, stats] = await Promise.all([
      prisma.waitingList.findMany({
        where: whereClause,
        orderBy: { position: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          useCase: true,
          source: true,
          position: true,
          isNotified: true,
          inviteCode: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.waitingList.count({ where: whereClause }),
      prisma.waitingList.aggregate({
        _count: {
          id: true,
        },
        where: {
          isNotified: true,
        },
      }),
    ]);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSignups = await prisma.waitingList.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalSignups: totalCount,
        notifiedCount: stats._count.id || 0,
        recentSignups,
      },
    });
  } catch (error) {
    console.error("Admin waiting list query error:", error);
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
    const { action, entryIds, data } = body;

    switch (action) {
      case "notify_users":
        // Mark users as notified
        if (!entryIds || !Array.isArray(entryIds)) {
          return NextResponse.json(
            { error: "Entry IDs required" },
            { status: 400 },
          );
        }

        await prisma.waitingList.updateMany({
          where: {
            id: { in: entryIds },
          },
          data: {
            isNotified: true,
            invitedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `${entryIds.length} users marked as notified`,
        });

      case "add_user":
        // Manually add a user to waiting list
        const { email, name, company, useCase, source } = data;

        if (!email || !name) {
          return NextResponse.json(
            { error: "Email and name are required" },
            { status: 400 },
          );
        }

        // Check if email already exists
        const existing = await prisma.waitingList.findUnique({
          where: { email },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Email already exists on waiting list" },
            { status: 409 },
          );
        }

        // Get next position
        const currentCount = await prisma.waitingList.count();
        const position = currentCount + 1;

        // Create entry
        const newEntry = await prisma.waitingList.create({
          data: {
            email,
            name,
            company: company || null,
            useCase: useCase || null,
            source: source || "admin_added",
            position,
            isNotified: false,
          },
        });

        // Generate invite code
        const inviteCode = `CHA-${position.toString().padStart(4, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await prisma.waitingList.update({
          where: { id: newEntry.id },
          data: { inviteCode },
        });

        return NextResponse.json({
          success: true,
          entry: { ...newEntry, inviteCode },
          message: "User added to waiting list",
        });

      case "remove_users":
        // Remove users from waiting list
        if (!entryIds || !Array.isArray(entryIds)) {
          return NextResponse.json(
            { error: "Entry IDs required" },
            { status: 400 },
          );
        }

        await prisma.waitingList.deleteMany({
          where: {
            id: { in: entryIds },
          },
        });

        // Reorder positions after deletion
        const remainingEntries = await prisma.waitingList.findMany({
          orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < remainingEntries.length; i++) {
          await prisma.waitingList.update({
            where: { id: remainingEntries[i].id },
            data: { position: i + 1 },
          });
        }

        return NextResponse.json({
          success: true,
          message: `${entryIds.length} users removed from waiting list`,
        });

      case "reorder_positions":
        // Reorder all positions based on creation date
        const allEntries = await prisma.waitingList.findMany({
          orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < allEntries.length; i++) {
          await prisma.waitingList.update({
            where: { id: allEntries[i].id },
            data: { position: i + 1 },
          });
        }

        return NextResponse.json({
          success: true,
          message: "Positions reordered successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin waiting list action error:", error);
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
        { error: "Entry ID is required" },
        { status: 400 },
      );
    }

    // Update the entry
    const updatedEntry = await prisma.waitingList.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
      message: "Entry updated successfully",
    });
  } catch (error) {
    console.error("Admin waiting list update error:", error);
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
        { error: "Entry ID is required" },
        { status: 400 },
      );
    }

    // Delete the entry
    await prisma.waitingList.delete({
      where: { id },
    });

    // Reorder positions after deletion
    const remainingEntries = await prisma.waitingList.findMany({
      orderBy: { createdAt: "asc" },
    });

    for (let i = 0; i < remainingEntries.length; i++) {
      await prisma.waitingList.update({
        where: { id: remainingEntries[i].id },
        data: { position: i + 1 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
    });
  } catch (error) {
    console.error("Admin waiting list deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
