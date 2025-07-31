import { performSelfReflection } from '@/lib/ai-self-reflection';

class CharismaScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly REFLECTION_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  start() {
    if (this.isRunning) {
      console.log('CharismaAI Scheduler: Already running');
      return;
    }

    console.log('CharismaAI Scheduler: Starting self-reflection scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.runSelfReflection();

    // Then run every 5 minutes
    this.intervalId = setInterval(() => {
      this.runSelfReflection();
    }, this.REFLECTION_INTERVAL);

    console.log(`CharismaAI Scheduler: Scheduled to run every ${this.REFLECTION_INTERVAL / 1000 / 60} minutes`);
  }

  stop() {
    if (!this.isRunning) {
      console.log('CharismaAI Scheduler: Not running');
      return;
    }

    console.log('CharismaAI Scheduler: Stopping...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('CharismaAI Scheduler: Stopped');
  }

  private async runSelfReflection() {
    try {
      console.log('CharismaAI Scheduler: Running scheduled self-reflection...');
      const startTime = Date.now();
      
      const feeling = await performSelfReflection();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (feeling) {
        console.log(`CharismaAI Scheduler: Self-reflection completed in ${duration}ms`);
        console.log(`CharismaAI: Currently feeling "${feeling.feeling_adjective}" ${feeling.feeling_emoji} (mood: ${feeling.calculated_mood_score}/10)`);
      } else {
        console.warn('CharismaAI Scheduler: Self-reflection returned null');
      }
    } catch (error) {
      console.error('CharismaAI Scheduler: Error during scheduled self-reflection:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.REFLECTION_INTERVAL / 1000 / 60,
      nextRunIn: this.intervalId ? 'Soon' : 'Not scheduled',
    };
  }
}

// Create a singleton instance
export const charismaScheduler = new CharismaScheduler();

// Auto-start in production environments
if (process.env.NODE_ENV === 'production' || process.env.AUTO_START_SCHEDULER === 'true') {
  console.log('CharismaAI: Auto-starting scheduler...');
  charismaScheduler.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('CharismaAI: Received SIGTERM, stopping scheduler...');
    charismaScheduler.stop();
  });

  process.on('SIGINT', () => {
    console.log('CharismaAI: Received SIGINT, stopping scheduler...');
    charismaScheduler.stop();
  });
}

export default charismaScheduler;