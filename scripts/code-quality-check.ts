#!/usr/bin/env tsx
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';

interface QualityCheck {
  name: string;
  command: string;
  errorThreshold?: number;
  warningThreshold?: number;
  required?: boolean;
}

interface CheckResult {
  name: string;
  passed: boolean;
  errors: number;
  warnings: number;
  output: string;
  duration: number;
}

const qualityChecks: QualityCheck[] = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    required: true,
  },
  {
    name: 'ESLint',
    command: 'npx eslint . --ext .js,.jsx,.ts,.tsx --format json',
    errorThreshold: 0,
    warningThreshold: 100,
  },
  {
    name: 'Build Test',
    command: 'npm run build',
    required: true,
  },
  {
    name: 'Prettier Format Check',
    command: 'npx prettier --check "**/*.{js,jsx,ts,tsx,json,md}" --ignore-path .gitignore',
    required: false,
  },
];

class CodeQualityChecker {
  private results: CheckResult[] = [];
  private startTime: number = Date.now();

  async runChecks(): Promise<void> {
    console.log(chalk.bold.blue('\n🔍 Running Code Quality Checks...\n'));

    for (const check of qualityChecks) {
      await this.runCheck(check);
    }

    this.printSummary();
    this.generateReport();
    
    const hasRequiredFailures = this.results.some(
      result => !result.passed && qualityChecks.find(c => c.name === result.name)?.required
    );

    if (hasRequiredFailures) {
      console.log(chalk.red('\n❌ Required quality checks failed!'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n✅ All required quality checks passed!'));
    }
  }

  private async runCheck(check: QualityCheck): Promise<void> {
    const spinner = ora(`Running ${check.name}...`).start();
    const startTime = Date.now();

    try {
      const output = execSync(check.command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      const duration = Date.now() - startTime;
      let errors = 0;
      let warnings = 0;

      // Parse ESLint JSON output
      if (check.name === 'ESLint') {
        try {
          const eslintResults = JSON.parse(output);
          eslintResults.forEach((file: any) => {
            errors += file.errorCount || 0;
            warnings += file.warningCount || 0;
          });
        } catch {
          // If not JSON, count from text
          errors = (output.match(/error/gi) || []).length;
          warnings = (output.match(/warning/gi) || []).length;
        }
      }

      const passed = this.evaluateCheck(check, errors, warnings);

      this.results.push({
        name: check.name,
        passed,
        errors,
        warnings,
        output: output.substring(0, 1000), // Limit output length
        duration,
      });

      if (passed) {
        spinner.succeed(chalk.green(`${check.name} passed (${duration}ms)`));
      } else {
        spinner.warn(chalk.yellow(`${check.name} passed with issues (${errors} errors, ${warnings} warnings)`));
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const output = error.stdout || error.message || 'Unknown error';
      
      // Count errors and warnings from output
      const errors = (output.match(/error/gi) || []).length || 1;
      const warnings = (output.match(/warning/gi) || []).length;

      this.results.push({
        name: check.name,
        passed: false,
        errors,
        warnings,
        output: output.substring(0, 1000),
        duration,
      });

      if (check.required) {
        spinner.fail(chalk.red(`${check.name} failed (${duration}ms) - ${errors} errors`));
      } else {
        spinner.warn(chalk.yellow(`${check.name} failed (non-blocking) - ${errors} errors`));
      }
    }
  }

  private evaluateCheck(check: QualityCheck, errors: number, warnings: number): boolean {
    if (check.errorThreshold !== undefined && errors > check.errorThreshold) {
      return false;
    }
    if (check.warningThreshold !== undefined && warnings > check.warningThreshold) {
      return false;
    }
    return true;
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings, 0);

    console.log(chalk.bold.blue('\n📊 Code Quality Summary\n'));
    console.log(chalk.cyan('├─ Total Checks:'), this.results.length);
    console.log(chalk.green('├─ Passed:'), passed);
    console.log(chalk.red('├─ Failed:'), failed);
    console.log(chalk.yellow('├─ Total Errors:'), totalErrors);
    console.log(chalk.yellow('├─ Total Warnings:'), totalWarnings);
    console.log(chalk.cyan('└─ Duration:'), `${totalDuration}ms`);

    console.log(chalk.bold.blue('\n📋 Detailed Results\n'));
    
    const maxNameLength = Math.max(...this.results.map(r => r.name.length));
    
    this.results.forEach(result => {
      const status = result.passed ? chalk.green('✓') : chalk.red('✗');
      const name = result.name.padEnd(maxNameLength);
      const stats = `${result.errors} errors, ${result.warnings} warnings`;
      const time = `${result.duration}ms`;
      
      console.log(`${status} ${name} │ ${stats.padEnd(25)} │ ${time}`);
    });
  }

  private generateReport(): void {
    const reportDir = path.join(process.cwd(), 'quality-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(reportDir, `quality-report-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      summary: {
        totalChecks: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        totalErrors: this.results.reduce((sum, r) => sum + r.errors, 0),
        totalWarnings: this.results.reduce((sum, r) => sum + r.warnings, 0),
      },
      results: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`\n📄 Report saved to: ${reportPath}`));
  }
}

// Run the quality checker
const checker = new CodeQualityChecker();
checker.runChecks().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});