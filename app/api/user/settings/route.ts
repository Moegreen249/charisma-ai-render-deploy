import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  apiKeys: z.record(z.string()).optional(),
  selectedModel: z.string().optional(),
  selectedProvider: z.string().optional(),
  selectedAnalysisTemplate: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    updates: z.boolean().optional(),
    security: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    autoSave: z.boolean().optional(),
    compactMode: z.boolean().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        settings: true,
      },
    });

    if (!profile) {
      // Create default profile with settings
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          skills: [],
          socialLinks: {},
          preferences: {
            theme: 'dark',
            notifications: true,
            newsletter: false,
          },
          settings: {
            apiKeys: {},
            selectedModel: 'gemini-2.5-flash',
            selectedProvider: 'google',
            selectedAnalysisTemplate: 'communication-analysis',
            notifications: {
              email: true,
              push: false,
              sms: false,
              newsletter: true,
              updates: true,
              security: true,
            },
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC',
              autoSave: true,
              compactMode: false,
            },
          },
          isPublic: false,
        },
        select: {
          settings: true,
        },
      });
    }

    return NextResponse.json(profile.settings || {});

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Get current settings
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { settings: true },
    });

    const currentSettings = (profile?.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ...validatedData,
      // Merge nested objects properly
      notifications: {
        ...currentSettings.notifications,
        ...validatedData.notifications,
      },
      preferences: {
        ...currentSettings.preferences,
        ...validatedData.preferences,
      },
      apiKeys: {
        ...currentSettings.apiKeys,
        ...validatedData.apiKeys,
      },
    };

    if (profile) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          settings: updatedSettings,
        },
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          skills: [],
          socialLinks: {},
          preferences: {
            theme: 'dark',
            notifications: true,
            newsletter: false,
          },
          settings: updatedSettings,
          isPublic: false,
        },
      });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });

  } catch (error) {
    console.error('Error updating user settings:', error);

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