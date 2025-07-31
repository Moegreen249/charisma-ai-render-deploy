import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  isApproved: z.boolean().default(false),
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        approvedAt: true,
        approvedBy: true,
        rejectedAt: true,
        rejectionReason: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users,
      total: users.length,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    // Validate input data
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, isApproved } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        approvedBy: isApproved ? session.user.id : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        approvedAt: true,
        approvedBy: true,
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: newUser.id,
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
    });

    // Log user creation activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'admin_user_created',
        category: 'admin',
        metadata: {
          createdUserId: newUser.id,
          createdUserEmail: newUser.email,
          createdUserRole: newUser.role,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Log error to platform error system
    try {
      await prisma.platformError.create({
        data: {
          category: 'SYSTEM',
          severity: 'HIGH',
          message: 'Failed to create user via admin API',
          stackTrace: error instanceof Error ? error.stack : String(error),
          endpoint: '/api/admin/users',
        },
      });
    } catch (logError) {
      console.error('Failed to log user creation error:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}