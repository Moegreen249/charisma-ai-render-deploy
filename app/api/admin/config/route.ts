import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { adminService } from '@/lib/admin-service';
import { z } from 'zod';

const configUpdateSchema = z.object({
  category: z.enum(['ai_models', 'system', 'billing', 'features']),
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional()
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
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    let configs;
    if (category && key) {
      configs = await adminService.getConfig(category, key);
    } else if (category) {
      configs = await adminService.getConfig(category);
    } else {
      configs = await adminService.getAllConfigs();
    }

    return NextResponse.json({
      success: true,
      data: configs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
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
    
    // Validate input data
    const validation = configUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { category, key, value, description } = validation.data;

    const updatedConfig = await adminService.updateConfig(
      category,
      key,
      value,
      session.user.id,
      description
    );

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: updatedConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating admin config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    if (!category || !key) {
      return NextResponse.json(
        { error: 'Category and key are required' },
        { status: 400 }
      );
    }

    await adminService.deleteConfig(category, key);

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting admin config:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}