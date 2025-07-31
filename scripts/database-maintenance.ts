#!/usr/bin/env tsx

/**
 * Database Maintenance Script
 * Cleans up old records and optimizes database performance
 */

import { prisma } from "@/lib/prisma";
import chalk from "chalk";

class DatabaseMaintenance {
  
  async cleanupOldUserActivities() {
    console.log(chalk.blue('🧹 Cleaning up old user activities...'));
    
    // Keep activities for last 30 days only
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.userActivity.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(chalk.green(`✅ Deleted ${deleted.count} old user activity records`));
    return deleted.count;
  }

  async cleanupResolvedErrors() {
    console.log(chalk.blue('🧹 Cleaning up resolved errors...'));
    
    // Keep resolved errors for last 7 days only
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.platformError.deleteMany({
      where: {
        isResolved: true,
        resolvedAt: {
          lt: sevenDaysAgo
        }
      }
    });
    
    console.log(chalk.green(`✅ Deleted ${deleted.count} old resolved error records`));
    return deleted.count;
  }

  async cleanupCompletedJobs() {
    console.log(chalk.blue('🧹 Cleaning up old completed background jobs...'));
    
    // Keep completed/failed jobs for last 7 days only
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.backgroundJob.deleteMany({
      where: {
        status: {
          in: ['COMPLETED', 'FAILED', 'CANCELLED']
        },
        completedAt: {
          lt: sevenDaysAgo
        }
      }
    });
    
    console.log(chalk.green(`✅ Deleted ${deleted.count} old background job records`));
    return deleted.count;
  }

  async resetStuckJobs() {
    console.log(chalk.blue('🔄 Resetting stuck background jobs...'));
    
    // Reset jobs that have been processing for more than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const updated = await prisma.backgroundJob.updateMany({
      where: {
        status: 'PROCESSING',
        startedAt: {
          lt: thirtyMinutesAgo
        }
      },
      data: {
        status: 'FAILED',
        error: 'Job timed out and was automatically reset',
        completedAt: new Date(),
        currentStep: 'Timed out'
      }
    });
    
    console.log(chalk.green(`✅ Reset ${updated.count} stuck background jobs`));
    return updated.count;
  }

  async createMissingUserProfiles() {
    console.log(chalk.blue('👤 Creating missing user profiles...'));
    
    // Find users without profiles
    const usersWithoutProfiles = await prisma.user.findMany({
      where: {
        profile: null
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    let created = 0;
    for (const user of usersWithoutProfiles) {
      try {
        await prisma.userProfile.create({
          data: {
            userId: user.id,
            skills: [],
            socialLinks: {},
            preferences: {
              theme: 'dark',
              notifications: true,
              newsletter: false,
            },
            settings: {
              apiKeys: {},
              selectedModel: 'gemini-2.5-flash',
              selectedProvider: 'google',
              selectedAnalysisTemplate: 'communication-analysis',
              notifications: {
                email: true,
                push: false,
                sms: false,
                newsletter: true,
                updates: true,
                security: true,
              },
              preferences: {
                theme: 'dark',
                language: 'en',
                timezone: 'UTC',
                autoSave: true,
                compactMode: false,
              },
            },
            isPublic: false,
          }
        });
        created++;
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ Failed to create profile for user ${user.email}: ${error}`));
      }
    }
    
    console.log(chalk.green(`✅ Created ${created} missing user profiles`));
    return created;
  }

  async updateStatistics() {
    console.log(chalk.blue('📊 Updating database statistics...'));
    
    try {
      // This would run ANALYZE on PostgreSQL to update query planner statistics
      await prisma.$executeRaw`ANALYZE;`;
      console.log(chalk.green('✅ Database statistics updated'));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Failed to update statistics: ${error}`));
    }
  }

  async vacuumDatabase() {
    console.log(chalk.blue('🧽 Running database vacuum...'));
    
    try {
      // This would run VACUUM on PostgreSQL to reclaim space
      await prisma.$executeRaw`VACUUM;`;
      console.log(chalk.green('✅ Database vacuum completed'));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Failed to run vacuum: ${error}`));
    }
  }

  async generateReport() {
    console.log(chalk.bold.blue('\n🔧 DATABASE MAINTENANCE'));
    console.log(chalk.gray('=' .repeat(40)));

    const results = {
      userActivitiesDeleted: 0,
      errorsDeleted: 0,
      jobsDeleted: 0,
      jobsReset: 0,
      profilesCreated: 0
    };

    try {
      results.userActivitiesDeleted = await this.cleanupOldUserActivities();
      results.errorsDeleted = await this.cleanupResolvedErrors();
      results.jobsDeleted = await this.cleanupCompletedJobs();
      results.jobsReset = await this.resetStuckJobs();
      results.profilesCreated = await this.createMissingUserProfiles();
      
      await this.updateStatistics();
      await this.vacuumDatabase();

      console.log(chalk.bold('\n📋 MAINTENANCE SUMMARY:'));
      console.log(chalk.green(`🗑️ User activities cleaned: ${results.userActivitiesDeleted}`));
      console.log(chalk.green(`🗑️ Resolved errors cleaned: ${results.errorsDeleted}`));
      console.log(chalk.green(`🗑️ Completed jobs cleaned: ${results.jobsDeleted}`));
      console.log(chalk.green(`🔄 Stuck jobs reset: ${results.jobsReset}`));
      console.log(chalk.green(`👤 User profiles created: ${results.profilesCreated}`));

      const totalCleaned = results.userActivitiesDeleted + results.errorsDeleted + results.jobsDeleted;
      console.log(chalk.bold.green(`\n✨ Total records cleaned: ${totalCleaned}`));
      
      if (totalCleaned > 0) {
        console.log(chalk.blue('💡 Database performance should be improved!'));
      }

    } catch (error) {
      console.error(chalk.red('\n💥 Maintenance failed:'), error);
      throw error;
    }

    console.log(chalk.gray('\nMaintenance completed at: ' + new Date().toISOString()));
  }
}

// Run maintenance if called directly
if (require.main === module) {
  const maintenance = new DatabaseMaintenance();
  maintenance.generateReport()
    .then(() => {
      console.log(chalk.blue('\n✅ Database maintenance complete!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('\n💥 Database maintenance failed:'), error);
      process.exit(1);
    });
}

export default DatabaseMaintenance;