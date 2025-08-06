import { charismaScheduler } from '@/lib/background/charisma-scheduler';
import { reflectionSettingsService } from '@/lib/reflection-settings-service';

let initialized = false;

export async function initializeCharisma() {
  if (initialized) {
    return;
  }

  console.log('CharismaAI: Initializing self-reflection system...');
  
  try {
    // Initialize scheduler with database settings
    await reflectionSettingsService.initializeScheduler();
    
    // Start the scheduler
    charismaScheduler.start();
    
    initialized = true;
    console.log('CharismaAI: Self-reflection system initialized successfully');
  } catch (error) {
    console.error('CharismaAI: Failed to initialize self-reflection system:', error);
    // Still mark as initialized to prevent repeated attempts
    initialized = true;
  }
}

// Auto-initialize in production or when explicitly enabled
if (typeof window === 'undefined') { // Server-side only
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CHARISMA_SELF_REFLECTION === 'true') {
    // Delay initialization slightly to ensure all modules are loaded
    setTimeout(() => {
      initializeCharisma();
    }, 1000);
  }
}