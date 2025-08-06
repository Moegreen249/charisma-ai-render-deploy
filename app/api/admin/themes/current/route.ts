import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET - Get current user's active theme
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user's current theme preference from AdminSettings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get theme preference from AdminSettings
    const themeSetting = await prisma.adminSettings.findUnique({
      where: {
        category_key: {
          category: 'user_preferences',
          key: `theme_${user.id}`,
        },
      },
    });

    const currentThemeId = (themeSetting?.value as any)?.themeId || 'charisma-default';

    return NextResponse.json({
      themeId: currentThemeId,
      success: true,
    });

  } catch (error) {
    console.error('Error fetching current theme:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current theme' },
      { status: 500 }
    );
  }
}

// POST - Set current user's active theme
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { themeId } = await request.json();

    if (!themeId) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert theme preference in AdminSettings
    await prisma.adminSettings.upsert({
      where: {
        category_key: {
          category: 'user_preferences',
          key: `theme_${user.id}`,
        },
      },
      update: {
        value: {
          themeId,
          updatedAt: new Date().toISOString(),
        },
        updatedBy: user.id,
      },
      create: {
        category: 'user_preferences',
        key: `theme_${user.id}`,
        value: {
          themeId,
          createdAt: new Date().toISOString(),
        },
        description: `Theme preference for user ${session.user.email}`,
        updatedBy: user.id,
      },
    });

    console.log(`Theme updated for user ${session.user.email}: ${themeId}`);

    return NextResponse.json({
      success: true,
      themeId,
      message: 'Theme preference updated successfully',
    });

  } catch (error) {
    console.error('Error updating current theme:', error);
    return NextResponse.json(
      { error: 'Failed to update current theme' },
      { status: 500 }
    );
  }
}