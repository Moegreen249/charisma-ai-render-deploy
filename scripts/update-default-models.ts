#!/usr/bin/env tsx

import { prisma } from "@/lib/prisma";
import chalk from "chalk";

/**
 * Script to update existing AI feature configurations with latest Gemini models
 * Sets gemini-2.5-flash as default and gemini-2.5-pro as fallback
 */

async function updateDefaultModels() {
  console.log(chalk.blue.bold('🔄 Updating AI feature configurations with latest Gemini models'));

  try {
    // Get all existing AI feature configurations
    const existingConfigs = await prisma.adminSettings.findMany({
      where: {
        category: 'ai_features',
        isActive: true,
      },
    });

    console.log(chalk.gray(`Found ${existingConfigs.length} AI feature configurations`));

    for (const config of existingConfigs) {
      const featureData = config.value as any;
      let updated = false;

      // Update default models to latest Gemini 2.5 Flash
      if (featureData.defaultModel !== 'gemini-2.5-flash') {
        console.log(chalk.yellow(`📝 Updating ${config.key} default model: ${featureData.defaultModel} → gemini-2.5-flash`));
        featureData.defaultModel = 'gemini-2.5-flash';
        updated = true;
      }

      // Update fallback models with latest recommendations
      if (featureData.fallbackModels) {
        const currentFallbacks = featureData.fallbackModels;
        const newFallbacks = {
          'google-gemini': 'gemini-2.5-pro',
          'openai': 'gpt-4o-mini',
          'anthropic': 'claude-3-5-haiku',
          'google-vertex-ai': 'gemini-2.5-pro',
          'google-genai': 'gemini-2.5-pro',
          ...currentFallbacks // Keep any existing custom fallbacks
        };

        // Check if any fallbacks need updating
        for (const [provider, model] of Object.entries(newFallbacks)) {
          if (currentFallbacks[provider] !== model) {
            console.log(chalk.cyan(`  🔧 ${config.key} fallback ${provider}: ${currentFallbacks[provider] || 'none'} → ${model}`));
            updated = true;
          }
        }

        featureData.fallbackModels = newFallbacks;
      }

      // Save updated configuration
      if (updated) {
        await prisma.adminSettings.update({
          where: { id: config.id },
          data: {
            value: featureData,
            description: `${config.description} (Updated with Gemini 2.5 models)`,
          },
        });

        console.log(chalk.green(`✅ Updated ${config.key} configuration`));
      } else {
        console.log(chalk.gray(`ℹ️  ${config.key} already using latest models`));
      }
    }

    // Also update any hardcoded story settings
    console.log(chalk.blue('\n🎭 Checking story generation settings...'));
    
    const storySettings = await prisma.storySettings.findMany();
    
    for (const setting of storySettings) {
      if (setting.defaultModel !== 'gemini-2.5-flash') {
        console.log(chalk.yellow(`📝 Updating story setting default model: ${setting.defaultModel} → gemini-2.5-flash`));
        
        await prisma.storySettings.update({
          where: { id: setting.id },
          data: {
            defaultModel: 'gemini-2.5-flash',
            defaultProvider: 'google-gemini',
          },
        });

        console.log(chalk.green(`✅ Updated story setting ${setting.id}`));
      }
    }

    console.log(chalk.green.bold('\n🚀 All configurations updated successfully!'));
    console.log(chalk.gray('Latest Gemini models are now set as defaults:'));
    console.log(chalk.white('  • Primary: gemini-2.5-flash (best price-performance)'));
    console.log(chalk.white('  • Fallback: gemini-2.5-pro (best overall capabilities)'));

  } catch (error) {
    console.error(chalk.red.bold('❌ Error updating configurations:'), error);
    throw error;
  }
}

async function showCurrentStatus() {
  console.log(chalk.blue.bold('\n📊 Current AI Model Configuration Status:'));
  
  const features = await prisma.adminSettings.findMany({
    where: {
      category: 'ai_features',
      isActive: true,
    },
  });

  for (const feature of features) {
    const config = feature.value as any;
    console.log(chalk.white(`\n🔹 ${feature.key}:`));
    console.log(chalk.gray(`   Default: ${config.defaultModel || 'not set'}`));
    
    if (config.fallbackModels) {
      console.log(chalk.gray('   Fallbacks:'));
      for (const [provider, model] of Object.entries(config.fallbackModels)) {
        console.log(chalk.gray(`     • ${provider}: ${model}`));
      }
    }
  }
}

if (require.main === module) {
  updateDefaultModels()
    .then(() => showCurrentStatus())
    .then(() => {
      console.log(chalk.green.bold('\n✨ All done! Your AI features are now using the latest Gemini models.'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red.bold('\n💥 Update failed:'), error);
      process.exit(1);
    });
}

export { updateDefaultModels, showCurrentStatus };