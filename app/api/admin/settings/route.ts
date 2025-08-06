import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  analyticsEnabled: boolean;
  maxFileSize: string;
  sessionTimeout: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system settings from database
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: SystemSettings = {
        siteName: 'CharismaAI',
        siteDescription: 'AI-Powered Conversation Analytics',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        analyticsEnabled: true,
        maxFileSize: '10',
        sessionTimeout: '24'
      };

      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ 
      settings: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        maintenanceMode: settings.maintenanceMode,
        registrationEnabled: settings.registrationEnabled,
        emailNotifications: settings.emailNotifications,
        analyticsEnabled: settings.analyticsEnabled,
        maxFileSize: settings.maxFileSize,
        sessionTimeout: settings.sessionTimeout
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 });
    }

    // Validate settings data
    const validatedSettings = {
      siteName: String(settings.siteName || 'CharismaAI'),
      siteDescription: String(settings.siteDescription || 'AI-Powered Conversation Analytics'),
      maintenanceMode: Boolean(settings.maintenanceMode),
      registrationEnabled: Boolean(settings.registrationEnabled),
      emailNotifications: Boolean(settings.emailNotifications),
      analyticsEnabled: Boolean(settings.analyticsEnabled),
      maxFileSize: String(settings.maxFileSize || '10'),
      sessionTimeout: String(settings.sessionTimeout || '24')
    };

    // Upsert settings in database
    const updatedSettings = await prisma.systemSettings.upsert({
      where: { id: 1 }, // Single settings record
      update: validatedSettings,
      create: { ...validatedSettings, id: 1 }
    });

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}