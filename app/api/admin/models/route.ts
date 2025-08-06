import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { aiModelConfigService } from '@/lib/admin-service';
import { z } from 'zod';

const modelConfigSchema = z.object({
  configKey: z.enum(['providers', 'defaultProvider', 'defaultModel', 'rateLimits', 'fallbackOptions']),
  value: z.any()
});

const providerToggleSchema = z.object({
  providerId: z.string().min(1),
  enabled: z.boolean()
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
    const providersOnly = searchParams.get('providers') === 'true';

    if (providersOnly) {
      const providers = await aiModelConfigService.getProviders();
      return NextResponse.json({
        success: true,
        data: { providers },
        timestamp: new Date().toISOString()
      });
    }

    const modelConfig = await aiModelConfigService.getModelConfig();

    return NextResponse.json({
      success: true,
      data: modelConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching AI model config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI model configuration' },
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
    const { action } = body;

    if (action === 'updateConfig') {
      // Validate input data for config update
      const validation = modelConfigSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid input data', 
            details: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }

      const { configKey, value } = validation.data;

      const updatedConfig = await aiModelConfigService.updateModelConfig(
        configKey,
        value,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        message: 'AI model configuration updated successfully',
        data: updatedConfig,
        timestamp: new Date().toISOString()
      });

    } else if (action === 'toggleProvider') {
      // Validate input data for provider toggle
      const validation = providerToggleSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid input data', 
            details: validation.error.flatten().fieldErrors 
          },
          { status: 400 }
        );
      }

      const { providerId, enabled } = validation.data;

      const updatedProvider = await aiModelConfigService.toggleProvider(
        providerId,
        enabled,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        message: `Provider ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: updatedProvider,
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: updateConfig, toggleProvider' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating AI model config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI model configuration' },
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
    const validation = modelConfigSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { configKey, value } = validation.data;

    const updatedConfig = await aiModelConfigService.updateModelConfig(
      configKey,
      value,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: 'AI model configuration updated successfully',
      data: updatedConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating AI model config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI model configuration' },
      { status: 500 }
    );
  }
}