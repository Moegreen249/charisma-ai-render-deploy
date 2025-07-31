import { charismaScheduler } from '@/lib/background/charisma-scheduler';

let initialized = false;

export function initializeCharisma() {
  if (initialized) {
    return;
  }

  console.log('CharismaAI: Initializing self-reflection system...');
  
  // Start the scheduler
  charismaScheduler.start();
  
  initialized = true;
  console.log('CharismaAI: Self-reflection system initialized successfully');
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