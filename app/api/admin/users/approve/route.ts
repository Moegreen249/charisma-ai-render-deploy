import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const approveSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action, reason } = approveSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isApproved: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isApproved: true,
          approvedBy: session.user.id,
          approvedAt: new Date(),
          rejectedAt: null,
          rejectionReason: null,
        },
      });

      return NextResponse.json({
        message: `User ${user.name || user.email} has been approved successfully`,
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isApproved: false,
          rejectedAt: new Date(),
          rejectionReason: reason || 'Account rejected by admin',
          approvedAt: null,
          approvedBy: null,
        },
      });

      return NextResponse.json({
        message: `User ${user.name || user.email} has been rejected`,
      });
    }

  } catch (error) {
    console.error('Error updating user status:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}