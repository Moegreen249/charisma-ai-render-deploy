import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all custom themes from database
    const themes = await prisma.customTheme.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      themes: themes.map(theme => ({
        ...theme,
        config: JSON.parse(theme.config)
      }))
    });

  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme } = await request.json();
    
    if (!theme || !theme.name || !theme.colors) {
      return NextResponse.json(
        { error: 'Invalid theme data' },
        { status: 400 }
      );
    }

    // Save theme to database
    const savedTheme = await prisma.customTheme.create({
      data: {
        name: theme.name,
        config: JSON.stringify(theme),
        createdBy: session.user.id,
      }
    });

    return NextResponse.json({ 
      success: true, 
      theme: {
        ...savedTheme,
        config: JSON.parse(savedTheme.config)
      }
    });

  } catch (error) {
    console.error('Error saving theme:', error);
    return NextResponse.json(
      { error: 'Failed to save theme' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { themeId, theme } = await request.json();
    
    if (!themeId || !theme) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Update theme in database
    const updatedTheme = await prisma.customTheme.update({
      where: { id: themeId },
      data: {
        name: theme.name,
        config: JSON.stringify(theme),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      theme: {
        ...updatedTheme,
        config: JSON.parse(updatedTheme.config)
      }
    });

  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('id');
    
    if (!themeId) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Delete theme from database
    await prisma.customTheme.delete({
      where: { id: themeId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Theme deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}