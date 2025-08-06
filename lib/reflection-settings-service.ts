import { prisma } from './prisma';
import { charismaScheduler } from './background/charisma-scheduler';

export class ReflectionSettingsService {
  /**
   * Get the current reflection interval from database
   */
  async getReflectionInterval(): Promise<number> {
    try {
      const settings = await prisma.systemSettings.findFirst({
        select: { reflectionInterval: true }
      });
      
      return settings?.reflectionInterval || 5; // Default to 5 minutes
    } catch (error) {
      console.error('Failed to get reflection interval from database:', error);
      return 5; // Fallback to default
    }
  }

  /**
   * Set the reflection interval in database and update scheduler
   */
  async setReflectionInterval(minutes: number): Promise<void> {
    if (minutes < 1) {
      throw new Error('Reflection interval must be at least 1 minute');
    }

    if (minutes > 1440) { // 24 hours
      throw new Error('Reflection interval cannot exceed 24 hours (1440 minutes)');
    }

    try {
      // Update database
      await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: { 
          reflectionInterval: minutes,
          updatedAt: new Date()
        },
        create: { 
          id: 1,
          reflectionInterval: minutes 
        }
      });

      // Update scheduler
      charismaScheduler.setReflectionInterval(minutes);

      console.log(`Reflection interval updated to ${minutes} minutes`);
    } catch (error) {
      console.error('Failed to set reflection interval:', error);
      throw new Error('Failed to update reflection interval');
    }
  }

  /**
   * Initialize scheduler with database settings
   */
  async initializeScheduler(): Promise<void> {
    try {
      const interval = await this.getReflectionInterval();
      charismaScheduler.setReflectionInterval(interval);
      console.log(`Scheduler initialized with ${interval} minute interval`);
    } catch (error) {
      console.error('Failed to initialize scheduler with database settings:', error);
      // Continue with default settings
    }
  }

  /**
   * Get reflection settings summary
   */
  async getReflectionSettings() {
    const interval = await this.getReflectionInterval();
    const schedulerStatus = charismaScheduler.getStatus();

    return {
      intervalMinutes: interval,
      schedulerStatus,
      isRunning: schedulerStatus.isRunning,
      nextRunIn: schedulerStatus.nextRunIn
    };
  }
}

// Export singleton instance
export const reflectionSettingsService = new ReflectionSettingsService();