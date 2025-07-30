import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const seoSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().min(1, 'Site description is required'),
  siteKeywords: z.string().min(1, 'Site keywords are required'),
  siteUrl: z.string().url('Valid URL is required'),
  ogImage: z.string().url().optional().or(z.literal('')),
  twitterHandle: z.string().optional().or(z.literal('')),
  googleAnalyticsId: z.string().optional().or(z.literal('')),
  vercelAnalytics: z.boolean(),
  robotsTxt: z.string().min(1, 'Robots.txt content is required'),
  sitemapEnabled: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let seoSettings = await prisma.seoSettings.findFirst();

    if (!seoSettings) {
      // Create default SEO settings
      seoSettings = await prisma.seoSettings.create({
        data: {
          siteName: 'CharismaAI',
          siteDescription: 'AI-powered communication analysis platform that provides insights into conversation patterns, emotional dynamics, and communication effectiveness.',
          siteKeywords: 'AI, communication, analysis, conversation, insights, emotional intelligence, chat analysis',
          siteUrl: 'https://charismaai.vercel.app',
          vercelAnalytics: true,
          robotsTxt: 'User-agent: *\nAllow: /',
          sitemapEnabled: true,
        },
      });
    }

    return NextResponse.json(seoSettings);

  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = seoSchema.parse(body);

    let seoSettings = await prisma.seoSettings.findFirst();

    if (seoSettings) {
      seoSettings = await prisma.seoSettings.update({
        where: { id: seoSettings.id },
        data: validatedData,
      });
    } else {
      seoSettings = await prisma.seoSettings.create({
        data: validatedData,
      });
    }

    return NextResponse.json({
      message: 'SEO settings updated successfully',
      settings: seoSettings,
    });

  } catch (error) {
    console.error('Error updating SEO settings:', error);

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