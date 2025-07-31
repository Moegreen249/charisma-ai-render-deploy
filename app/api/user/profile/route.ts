import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional(),
  jobTitle: z.string().max(100, 'Job title must be less than 100 characters').optional(),
  skills: z.array(z.string()),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
  }).optional(),
  isPublic: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    console.log('Profile API: Starting GET request');
    
    const session = await getServerSession(authOptions);
    console.log('Profile API: Session check:', session ? 'Session found' : 'No session');

    if (!session || !session.user?.id) {
      console.log('Profile API: Unauthorized - no session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('Profile API: Looking for profile for user:', session.user.id);

    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    console.log('Profile API: Profile found:', profile ? 'Yes' : 'No');

    if (!profile) {
      console.log('Profile API: Creating default profile for user:', session.user.id);
      
      // Create default profile
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          skills: [],
          socialLinks: {},
          preferences: {
            theme: 'system',
            notifications: true,
            newsletter: false,
          },
          isPublic: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });
      
      console.log('Profile API: Default profile created');
    }

    console.log('Profile API: Returning profile data');
    return NextResponse.json(profile);

  } catch (error) {
    console.error('Profile API Error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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
    const validatedData = profileSchema.parse(body);

    // Convert dateOfBirth string to Date if provided
    const updateData = {
      ...validatedData,
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
    };

    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (profile) {
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });
    } else {
      profile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          ...updateData,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile,
    });

  } catch (error) {
    console.error('Error updating user profile:', error);

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