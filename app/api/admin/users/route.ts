import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { userManagementService } from '@/lib/admin-service';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role, SubscriptionTier } from '@prisma/client';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role') as Role | undefined;
    const subscriptionTier = searchParams.get('subscriptionTier') as SubscriptionTier | undefined;
    const search = searchParams.get('search') || undefined;

    const filters = {
      ...(role && { role }),
      ...(subscriptionTier && { subscriptionTier }),
      ...(search && { search })
    };

    const result = await userManagementService.getUsers(page, limit, filters);

    return NextResponse.json({
      success: true,
      users: result.users, // Frontend expects 'users' key directly
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

const userUpdateSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['update_role', 'update_subscription', 'suspend', 'activate', 'delete']),
  data: z.record(z.any()).optional()
});

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
    
    // Validate input data
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { userId, action, data } = validation.data;

    let result;

    switch (action) {
      case 'update_role':
        if (!data?.role) {
          return NextResponse.json(
            { error: 'Role is required for update_role action' },
            { status: 400 }
          );
        }
        result = await userManagementService.updateUserRole(
          userId,
          data.role as Role,
          session.user.id
        );
        break;

      case 'update_subscription':
        if (!data?.tier || !data?.status) {
          return NextResponse.json(
            { error: 'Tier and status are required for update_subscription action' },
            { status: 400 }
          );
        }
        result = await userManagementService.updateUserSubscription(
          userId,
          {
            tier: data.tier as SubscriptionTier,
            status: data.status
          },
          session.user.id
        );
        break;

      case 'suspend':
        const reason = data?.reason || 'No reason provided';
        result = await userManagementService.suspendUser(
          userId,
          reason,
          session.user.id
        );
        break;

      case 'delete':
        result = await userManagementService.deleteUser(
          userId,
          session.user.id
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action} completed successfully`,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}