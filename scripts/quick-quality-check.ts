#!/usr/bin/env tsx
import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n🚀 Quick Quality Check\n'));

const checks = [
  {
    name: 'TypeScript',
    command: 'npx tsc --noEmit',
    required: true,
  },
  {
    name: 'ESLint (errors only)',
    command: 'npx eslint . --ext .ts,.tsx --quiet --max-warnings 0',
    required: false,
  },
];

let hasErrors = false;

for (const check of checks) {
  process.stdout.write(`${check.name}... `);
  
  try {
    execSync(check.command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(chalk.green('✓'));
  } catch (error) {
    console.log(chalk.red('✗'));
    if (check.required) {
      hasErrors = true;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  ${errorMessage}`));
    }
  }
}

if (hasErrors) {
  console.log(chalk.red('\n❌ Quality check failed!'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✅ All checks passed!'));
}

console.log(chalk.gray('\nFor detailed analysis, run: npm run quality'));