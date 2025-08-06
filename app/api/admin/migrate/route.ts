import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow admins to run migrations
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    console.log('🔄 Admin-triggered database migration started');
    
    // Run migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('✅ Admin-triggered migrations completed');
    
    return NextResponse.json({
      success: true,
      message: "Database migrations completed successfully",
      output: stdout,
      warnings: stderr || null
    });
    
  } catch (error) {
    console.error('❌ Admin migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Migration failed",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only allow admins to check migration status
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check migration status
    const { stdout, stderr } = await execAsync('npx prisma migrate status');
    
    return NextResponse.json({
      success: true,
      status: stdout,
      warnings: stderr || null
    });
    
  } catch (error) {
    console.error('Migration status check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Status check failed",
    }, { status: 500 });
  }
}