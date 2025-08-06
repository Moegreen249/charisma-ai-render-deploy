#!/usr/bin/env node

/**
 * Story Settings Initialization Script
 * 
 * This script initializes the StorySettings table with default values.
 * Run this after database migration to ensure story functionality works.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeStorySettings() {
  try {
    console.log('🚀 Initializing Story Settings...');

    // Check if settings already exist
    const existingSettings = await prisma.storySettings.findFirst();
    
    if (existingSettings) {
      console.log('✅ Story settings already exist. Skipping initialization.');
      return;
    }

    // Get the first admin user to assign as updater
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Please create an admin user first.');
      console.log('   Run: npm run setup-admin');
      return;
    }

    // Create default story settings
    const defaultSettings = await prisma.storySettings.create({
      data: {
        isEnabled: false, // Start disabled for safety
        freeTrialDays: 7,
        maxFreeStories: 3,
        systemPrompt: "Transform this analysis into an engaging story with a clear timeline. Create chapters that flow naturally and make complex information easy to understand without overwhelming the reader.",
        promptVersion: 'v1.0',
        allowedProviders: ['google', 'openai', 'anthropic'],
        defaultProvider: 'google',
        defaultModel: 'gemini-2.5-flash',
        timeoutSeconds: 120,
        isProFeature: true,
        updatedBy: adminUser.id,
      }
    });

    console.log('✅ Story settings initialized successfully!');
    console.log('📝 Settings created with ID:', defaultSettings.id);
    console.log('🔧 Story feature is currently DISABLED. Enable it in admin panel.');
    
  } catch (error) {
    console.error('❌ Error initializing story settings:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Settings may already exist. This is normal.');
    } else if (error.code === 'P2003') {
      console.log('💡 Foreign key constraint failed. Make sure admin user exists.');
    } else {
      console.log('💡 Make sure database migration has been run: npx prisma migrate deploy');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeStorySettings()
  .then(() => {
    console.log('🎉 Story initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error);
    process.exit(1);
  });