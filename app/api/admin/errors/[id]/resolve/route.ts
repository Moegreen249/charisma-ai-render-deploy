import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { resolvedBy, note } = body;

    // Update the error as resolved
    const updatedError = await prisma.platformError.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || session.user.id,
        resolution: note,
      },
      select: {
        id: true,
        category: true,
        severity: true,
        message: true,
        isResolved: true,
        resolvedAt: true,
        resolvedBy: true,
      },
    });

    // Log the resolution activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'error_resolved',
        category: 'admin',
        metadata: {
          errorId: id,
          errorCategory: updatedError.category,
          errorSeverity: updatedError.severity,
          errorMessage: updatedError.message,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Error resolved successfully',
      error: {
        id: updatedError.id,
        category: updatedError.category,
        severity: updatedError.severity,
        message: updatedError.message,
        resolved: updatedError.isResolved,
        resolvedAt: updatedError.resolvedAt,
        resolvedBy: updatedError.resolvedBy,
      },
    });

  } catch (error) {
    console.error('Failed to resolve error:', error);

    // Log this failure as a platform error
    try {
      await prisma.platformError.create({
        data: {
          category: 'SYSTEM',
          severity: 'MEDIUM',
          message: `Failed to resolve error ${params.id}`,
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: `/api/admin/errors/${params.id}/resolve`,
        },
      });
    } catch (logError) {
      console.error('Failed to log error resolution failure:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to resolve error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Delete the error record
    await prisma.platformError.delete({
      where: { id },
    });

    // Log the deletion activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'error_deleted',
        category: 'admin',
        metadata: {
          errorId: id,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Error deleted successfully',
    });

  } catch (error) {
    console.error('Failed to delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete error' },
      { status: 500 }
    );
  }
}