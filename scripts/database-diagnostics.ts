#!/usr/bin/env tsx

/**
 * Database Diagnostics Tool
 * Checks for database inconsistencies, performance issues, and data integrity problems
 */

import { prisma } from "@/lib/prisma";
import chalk from "chalk";

interface DiagnosticResult {
  category: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: any;
  recommendation?: string;
}

class DatabaseDiagnostics {
  private results: DiagnosticResult[] = [];

  private addResult(result: DiagnosticResult) {
    this.results.push(result);
    const color = result.status === 'PASS' ? chalk.green : 
                  result.status === 'WARN' ? chalk.yellow : chalk.red;
    console.log(color(`[${result.status}] ${result.category}: ${result.message}`));
    if (result.details) console.log(chalk.gray(JSON.stringify(result.details, null, 2)));
    if (result.recommendation) console.log(chalk.blue(`💡 ${result.recommendation}`));
    console.log();
  }

  async checkDatabaseConnection() {
    console.log(chalk.bold('\n🔍 Checking Database Connection...'));
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      this.addResult({
        category: 'Database Connection',
        status: latency < 100 ? 'PASS' : latency < 500 ? 'WARN' : 'FAIL',
        message: `Connection established in ${latency}ms`,
        details: { latency },
        recommendation: latency > 500 ? 'Database connection is slow. Check network or database performance.' : undefined
      });
    } catch (error) {
      this.addResult({
        category: 'Database Connection',
        status: 'FAIL',
        message: 'Failed to connect to database',
        details: { error: error instanceof Error ? error.message : String(error) },
        recommendation: 'Check DATABASE_URL and database server status'
      });
    }
  }

  async checkTableCounts() {
    console.log(chalk.bold('\n📊 Checking Table Record Counts...'));
    try {
      const counts = await Promise.all([
        prisma.user.count(),
        prisma.backgroundJob.count(),
        prisma.analysis.count(),
        prisma.userTemplate.count(),
        prisma.platformError.count(),
        prisma.userActivity.count(),
        prisma.notification.count(),
      ]);

      const tables = ['users', 'backgroundJobs', 'analyses', 'userTemplates', 'platformErrors', 'userActivities', 'notifications'];
      
      tables.forEach((table, index) => {
        this.addResult({
          category: 'Table Counts',
          status: 'PASS',
          message: `${table}: ${counts[index]} records`,
          details: { table, count: counts[index] }
        });
      });

    } catch (error) {
      this.addResult({
        category: 'Table Counts',
        status: 'FAIL',
        message: 'Failed to retrieve table counts',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async checkBackgroundJobsHealth() {
    console.log(chalk.bold('\n⚙️ Checking Background Jobs Health...'));
    try {
      // Check for stuck jobs (processing for more than 30 minutes)
      const stuckJobs = await prisma.backgroundJob.count({
        where: {
          status: 'PROCESSING',
          startedAt: {
            lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        }
      });

      if (stuckJobs > 0) {
        this.addResult({
          category: 'Background Jobs',
          status: 'WARN',
          message: `${stuckJobs} jobs stuck in PROCESSING state`,
          details: { stuckJobs },
          recommendation: 'Consider resetting stuck jobs or investigating job processor'
        });
      } else {
        this.addResult({
          category: 'Background Jobs',
          status: 'PASS',
          message: 'No stuck jobs detected'
        });
      }

      // Check job distribution
      const jobsByStatus = await prisma.backgroundJob.groupBy({
        by: ['status'],
        _count: { id: true }
      });

      const statusMap = jobsByStatus.reduce((acc, job) => {
        acc[job.status] = job._count.id;
        return acc;
      }, {} as Record<string, number>);

      this.addResult({
        category: 'Background Jobs',
        status: 'PASS',
        message: 'Job status distribution',
        details: statusMap
      });

      // Check for failed jobs in last 24 hours
      const recentFailedJobs = await prisma.backgroundJob.count({
        where: {
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      if (recentFailedJobs > 10) {
        this.addResult({
          category: 'Background Jobs',
          status: 'WARN',
          message: `${recentFailedJobs} jobs failed in last 24 hours`,
          details: { recentFailedJobs },
          recommendation: 'High failure rate detected. Check error logs and API keys.'
        });
      }

    } catch (error) {
      this.addResult({
        category: 'Background Jobs',
        status: 'FAIL',
        message: 'Failed to check background jobs health',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async checkDataIntegrity() {
    console.log(chalk.bold('\n🔍 Checking Data Integrity...'));
    try {
      // Check for orphaned records
      const orphanedAnalyses = await prisma.analysis.count({
        where: {
          user: null
        }
      });

      if (orphanedAnalyses > 0) {
        this.addResult({
          category: 'Data Integrity',
          status: 'WARN',
          message: `${orphanedAnalyses} orphaned analysis records found`,
          recommendation: 'Clean up orphaned records to improve query performance'
        });
      }

      // Check for background jobs without users
      const orphanedJobs = await prisma.backgroundJob.count({
        where: {
          user: null
        }
      });

      if (orphanedJobs > 0) {
        this.addResult({
          category: 'Data Integrity',
          status: 'WARN',
          message: `${orphanedJobs} orphaned background job records found`,
          recommendation: 'Clean up orphaned job records'
        });
      }

      // Check for users without profiles
      const usersWithoutProfiles = await prisma.user.count({
        where: {
          profile: null
        }
      });

      if (usersWithoutProfiles > 0) {
        this.addResult({
          category: 'Data Integrity',
          status: 'WARN',
          message: `${usersWithoutProfiles} users without profiles`,
          recommendation: 'Create missing user profiles for complete data consistency'
        });
      }

      if (orphanedAnalyses === 0 && orphanedJobs === 0 && usersWithoutProfiles === 0) {
        this.addResult({
          category: 'Data Integrity',
          status: 'PASS',
          message: 'No orphaned records detected'
        });
      }

    } catch (error) {
      this.addResult({
        category: 'Data Integrity',
        status: 'FAIL',
        message: 'Failed to check data integrity',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async checkIndexPerformance() {
    console.log(chalk.bold('\n📈 Checking Index Performance...'));
    try {
      // Test common queries that should be fast
      const queries = [
        {
          name: 'Recent Background Jobs',
          query: () => prisma.backgroundJob.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
          })
        },
        {
          name: 'User Activity Lookup',
          query: () => prisma.userActivity.findMany({
            take: 10,
            where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            orderBy: { timestamp: 'desc' }
          })
        },
        {
          name: 'Platform Errors',
          query: () => prisma.platformError.findMany({
            take: 10,
            where: { isResolved: false },
            orderBy: { createdAt: 'desc' }
          })
        }
      ];

      for (const test of queries) {
        const start = Date.now();
        await test.query();
        const duration = Date.now() - start;
        
        this.addResult({
          category: 'Query Performance',
          status: duration < 100 ? 'PASS' : duration < 500 ? 'WARN' : 'FAIL',
          message: `${test.name}: ${duration}ms`,
          details: { query: test.name, duration },
          recommendation: duration > 500 ? `Query is slow. Consider adding indexes or optimizing the query.` : undefined
        });
      }

    } catch (error) {
      this.addResult({
        category: 'Query Performance',
        status: 'FAIL',
        message: 'Failed to test query performance',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async checkLargeDatasets() {
    console.log(chalk.bold('\n📦 Checking for Large Datasets...'));
    try {
      const tables = [
        { name: 'userActivity', query: () => prisma.userActivity.count() },
        { name: 'platformError', query: () => prisma.platformError.count() },
        { name: 'backgroundJob', query: () => prisma.backgroundJob.count() },
        { name: 'analysis', query: () => prisma.analysis.count() }
      ];

      for (const table of tables) {
        const count = await table.query();
        const status = count > 100000 ? 'WARN' : count > 10000 ? 'WARN' : 'PASS';
        
        this.addResult({
          category: 'Dataset Size',
          status,
          message: `${table.name}: ${count.toLocaleString()} records`,
          details: { table: table.name, count },
          recommendation: count > 50000 ? `Large dataset detected. Consider archiving old records or implementing pagination.` : undefined
        });
      }

    } catch (error) {
      this.addResult({
        category: 'Dataset Size',
        status: 'FAIL',
        message: 'Failed to check dataset sizes',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  async generateReport() {
    console.log(chalk.bold.blue('\n🏥 DATABASE HEALTH DIAGNOSTICS'));
    console.log(chalk.gray('=' .repeat(50)));

    await this.checkDatabaseConnection();
    await this.checkTableCounts();
    await this.checkBackgroundJobsHealth();
    await this.checkDataIntegrity();
    await this.checkIndexPerformance();
    await this.checkLargeDatasets();

    // Summary
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log(chalk.bold('\n📋 SUMMARY:'));
    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${warnings}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));

    if (failed > 0) {
      console.log(chalk.red.bold('\n🚨 CRITICAL ISSUES DETECTED!'));
      console.log(chalk.red('Please address failed checks immediately.'));
    } else if (warnings > 0) {
      console.log(chalk.yellow.bold('\n⚠️  WARNINGS DETECTED'));
      console.log(chalk.yellow('Consider addressing warnings to improve performance.'));
    } else {
      console.log(chalk.green.bold('\n✅ DATABASE HEALTH LOOKS GOOD!'));
    }

    console.log(chalk.gray('\nDiagnostics completed at: ' + new Date().toISOString()));
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  const diagnostics = new DatabaseDiagnostics();
  diagnostics.generateReport()
    .then(() => {
      console.log(chalk.blue('\n✨ Diagnostics complete!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('\n💥 Diagnostics failed:'), error);
      process.exit(1);
    });
}

export default DatabaseDiagnostics;