import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  htmlContent: z.string().optional(),
  category: z.string().default('general'),
  isActive: z.boolean().default(true),
  variables: z.array(z.string()).optional(),
  styling: z.record(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // Check if requester is admin
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    // Build where clause
    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    // Fetch templates with Prisma
    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates: templates || [] });

  } catch (error) {
    console.error('Error in email-templates API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // Check if requester is admin
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = emailTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid template data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const templateData = validationResult.data;

    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name: templateData.name },
      select: { id: true }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }

    // Create new template
    const newTemplate = await prisma.emailTemplate.create({
      data: {
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        htmlContent: templateData.htmlContent,
        category: templateData.category,
        isActive: templateData.isActive,
        variables: templateData.variables,
        styling: templateData.styling,
        isBuiltIn: false
      }
    });

    return NextResponse.json({
      template: newTemplate,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // Check if requester is admin
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

    // Parse request body
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Validate update data
    const validationResult = emailTemplateSchema.partial().safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid template data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Update template
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: validationResult.data
    });

    return NextResponse.json({
      template: updatedTemplate,
      message: 'Template updated successfully'
    });

  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // Check if requester is admin
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

    // Get template ID from query params
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template is built-in (cannot be deleted)
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      select: { isBuiltIn: true }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.isBuiltIn) {
      return NextResponse.json(
        { error: 'Built-in templates cannot be deleted' },
        { status: 403 }
      );
    }

    // Delete template
    await prisma.emailTemplate.delete({
      where: { id: templateId }
    });

    return NextResponse.json({
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
