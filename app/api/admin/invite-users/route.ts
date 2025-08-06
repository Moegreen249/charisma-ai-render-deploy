import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { generateTempPassword } from '@/lib/utils';
import { sendWelcomeEmail } from '@/lib/email';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schema
const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  personalMessage: z.string().optional(),
  template: z.string().default('default')
});

const inviteUsersRequestSchema = z.object({
  users: z.array(inviteUserSchema).min(1, 'At least one user is required')
});

interface InviteUser {
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  personalMessage?: string;
  template: string;
}

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
  tempPassword?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = inviteUsersRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { users } = validationResult.data;

    // Check if requester is admin using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Verify admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const results: InviteResult[] = [];

    for (const user of users) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { email: true }
        });

        if (existingUser) {
          results.push({
            email: user.email,
            success: false,
            error: 'User with this email already exists'
          });
          continue;
        }

        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Create user in database
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role || 'USER',
            requirePasswordChange: true,
          }
        });

        // Store invitation record
        await prisma.invitation.create({
          data: {
            userId: newUser.id,
            email: user.email,
            name: user.name,
            role: user.role || 'USER',
            personalMessage: user.personalMessage,
            templateId: user.template,
            status: 'PENDING',
            invitedBy: session.user.id,
          }
        });

        // Prepare template variables for email
        const templateVariables = {
          name: user.name,
          email: user.email,
          tempPassword: tempPassword,
          loginUrl: `${process.env.NEXTAUTH_URL}/auth/signin`,
          personalMessage: user.personalMessage
        };

        // Select template based on user role
        const templateId = user.role === 'ADMIN' ? 'admin' : 'default';

        // Send welcome email
        try {
          const emailResult = await sendWelcomeEmail(
            user.email,
            templateId,
            templateVariables
          );

          results.push({
            email: user.email,
            success: true,
            tempPassword: tempPassword,
            error: emailResult.success ? undefined : 'User created but email failed to send'
          });
        } catch (emailError) {
          console.error(`Email error for ${user.email}:`, emailError);
          results.push({
            email: user.email,
            success: true,
            tempPassword: tempPassword,
            error: 'User created but email failed to send'
          });
        }

      } catch (userError) {
        console.error(`Unexpected error for user ${user.email}:`, userError);
        results.push({
          email: user.email,
          success: false,
          error: userError instanceof Error ? userError.message : 'Unknown error occurred'
        });
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Error in invite-users API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
