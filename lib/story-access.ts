import { prisma } from "@/lib/prisma";

interface StoryAccessResult {
  allowed: boolean;
  reason?: string;
  requiresPro?: boolean;
  trialExpired?: boolean;
  usageExceeded?: boolean;
  trialDaysRemaining?: number;
  storiesRemaining?: number;
}

export async function validateStoryAccess(userId: string): Promise<StoryAccessResult> {
  try {
    // Get story settings
    const settings = await prisma.storySettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    // If story feature is disabled globally
    if (!settings?.isEnabled) {
      return {
        allowed: false,
        reason: "Story feature is currently disabled. Please check back later."
      };
    }

    // Get user's story usage
    const usage = await prisma.userStoryUsage.findUnique({
      where: { userId }
    });

    // If user is marked as pro, allow unlimited access
    if (usage?.isProUser) {
      return { allowed: true };
    }

    // For non-pro users, check free trial and limits
    const now = new Date();
    
    // If no usage record exists, this is their first story - create trial
    if (!usage || !usage.freeTrialStart) {
      // Create usage record with trial
      await prisma.userStoryUsage.upsert({
        where: { userId },
        update: {
          freeTrialStart: now,
        },
        create: {
          userId,
          freeTrialStart: now,
          storiesGenerated: 0,
        }
      });
      
      return { 
        allowed: true,
        trialDaysRemaining: settings.freeTrialDays,
        storiesRemaining: settings.maxFreeStories
      };
    }

    // Check if trial has expired
    const trialStart = usage.freeTrialStart!;
    const trialEndDate = new Date(trialStart.getTime() + (settings.freeTrialDays * 24 * 60 * 60 * 1000));
    const isTrialExpired = now > trialEndDate;
    
    if (isTrialExpired) {
      return {
        allowed: false,
        reason: "Your free trial has expired. Upgrade to Pro to continue generating stories.",
        requiresPro: true,
        trialExpired: true
      };
    }

    // Check usage limits
    if (usage.storiesGenerated >= settings.maxFreeStories) {
      const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      
      return {
        allowed: false,
        reason: `You've reached your free trial limit of ${settings.maxFreeStories} stories. Upgrade to Pro or wait ${daysRemaining} days for trial reset.`,
        requiresPro: true,
        usageExceeded: true,
        trialDaysRemaining: daysRemaining
      };
    }

    // Calculate remaining allowances
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const storiesRemaining = settings.maxFreeStories - usage.storiesGenerated;

    return {
      allowed: true,
      trialDaysRemaining: daysRemaining,
      storiesRemaining: storiesRemaining
    };

  } catch (error) {
    console.error('Story access validation error:', error);
    return {
      allowed: false,
      reason: "Unable to validate story access. Please try again."
    };
  }
}

export async function getUserStoryStats(userId: string) {
  try {
    const settings = await prisma.storySettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    const usage = await prisma.userStoryUsage.findUnique({
      where: { userId }
    });

    if (!settings) {
      return {
        isEnabled: false,
        isProUser: false,
        storiesGenerated: 0,
        maxFreeStories: 0,
        trialDaysRemaining: 0
      };
    }

    if (!usage) {
      return {
        isEnabled: settings.isEnabled,
        isProUser: false,
        storiesGenerated: 0,
        maxFreeStories: settings.maxFreeStories,
        trialDaysRemaining: settings.freeTrialDays,
        storiesRemaining: settings.maxFreeStories
      };
    }

    const now = new Date();
    const trialStart = usage.freeTrialStart;
    let trialDaysRemaining = 0;

    if (trialStart && !usage.isProUser) {
      const trialEndDate = new Date(trialStart.getTime() + (settings.freeTrialDays * 24 * 60 * 60 * 1000));
      trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    }

    return {
      isEnabled: settings.isEnabled,
      isProUser: usage.isProUser,
      storiesGenerated: usage.storiesGenerated,
      maxFreeStories: settings.maxFreeStories,
      trialDaysRemaining,
      storiesRemaining: usage.isProUser ? -1 : Math.max(0, settings.maxFreeStories - usage.storiesGenerated),
      lastStoryAt: usage.lastStoryAt
    };

  } catch (error) {
    console.error('Error getting user story stats:', error);
    return {
      isEnabled: false,
      isProUser: false,
      storiesGenerated: 0,
      maxFreeStories: 0,
      trialDaysRemaining: 0
    };
  }
}

export async function upgradeUserToPro(userId: string) {
  try {
    await prisma.userStoryUsage.upsert({
      where: { userId },
      update: {
        isProUser: true,
      },
      create: {
        userId,
        isProUser: true,
        storiesGenerated: 0,
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error upgrading user to pro:', error);
    return { success: false, error: 'Failed to upgrade user' };
  }
}