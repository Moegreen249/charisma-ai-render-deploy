# Code Quality Testing Guide

This document describes the code quality testing system implemented for the CharismaAI project.

## Overview

The code quality testing system ensures consistent code standards, catches potential issues early, and maintains high code quality across the project.

## Quick Start

```bash
# Run all quality checks
npm run quality

# Run specific checks
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint linting
npm run format:check   # Prettier formatting check

# Auto-fix issues
npm run quality:fix    # Fix ESLint and format issues
npm run format         # Format all files with Prettier
```

## Available Commands

### Main Quality Commands

- **`npm run quality`** - Runs comprehensive quality checks including TypeScript, ESLint, build test, and Prettier
- **`npm run quality:fix`** - Automatically fixes ESLint issues and formats code with Prettier
- **`npm run test:quality`** - Runs TypeScript, ESLint, and format checks (lighter than full quality check)

### Individual Checks

- **`npm run typecheck`** - Validates TypeScript types without building
- **`npm run lint`** - Runs ESLint to check for code issues
- **`npm run format`** - Formats all files with Prettier
- **`npm run format:check`** - Checks if files are properly formatted

## Quality Check Components

### 1. TypeScript Compilation Check
- Ensures all TypeScript code compiles without errors
- Validates type safety across the codebase
- **Required**: Build will fail if TypeScript errors exist

### 2. ESLint Analysis
- Checks for code quality issues and potential bugs
- Enforces coding standards and best practices
- Current configuration allows warnings but blocks on errors

### 3. Build Test
- Verifies the project builds successfully
- Catches runtime and configuration issues
- **Required**: Deployment will fail if build fails

### 4. Prettier Format Check
- Ensures consistent code formatting
- Non-blocking but recommended for consistency

## Quality Reports

After running `npm run quality`, a detailed report is generated in:
```
quality-reports/quality-report-[timestamp].json
```

The report includes:
- Summary of all checks performed
- Error and warning counts
- Execution time for each check
- Detailed results for debugging

## Pre-commit Hooks

To enable automatic quality checks before commits:

```bash
# Install husky
npm install --save-dev husky
npx husky install

# The pre-commit hook is already configured in .husky/pre-commit
```

The pre-commit hook will:
1. Run ESLint on staged files
2. Auto-fix fixable issues
3. Format files with Prettier
4. Run TypeScript check

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/code-quality.yml`) that:
- Runs on all pushes and pull requests
- Tests multiple Node.js versions
- Performs security audits
- Uploads quality reports as artifacts

## Configuration Files

- **`eslint.config.mjs`** - ESLint configuration
- **`.prettierrc.json`** - Prettier formatting rules
- **`.prettierignore`** - Files to ignore for formatting
- **`quality-config.json`** - Quality thresholds and rules
- **`tsconfig.json`** - TypeScript configuration

## Current Status

### Known Issues
- ~6,000 ESLint warnings (mostly about `any` types)
- ~2,000 ESLint errors in generated files
- These don't block deployment due to `ignoreDuringBuilds: true` in next.config.js

### Recommendations
1. Gradually fix TypeScript `any` warnings
2. Add proper types to improve type safety
3. Exclude generated files from linting
4. Set up stricter rules over time

## Troubleshooting

### "Command not found" errors
```bash
# Ensure dependencies are installed
npm install
```

### Too many linting errors
```bash
# Auto-fix what's possible
npm run quality:fix

# Or fix specific file types
npx eslint app/**/*.ts --fix
```

### Build failures
```bash
# Check TypeScript errors
npm run typecheck

# Check for missing dependencies
npm install
```

## Best Practices

1. Run `npm run quality` before pushing code
2. Fix errors before warnings
3. Use `npm run quality:fix` for quick fixes
4. Add new quality checks as needed
5. Keep quality reports for tracking improvements

## Future Enhancements

- [ ] Add unit test coverage checks
- [ ] Implement complexity analysis
- [ ] Add bundle size monitoring
- [ ] Create quality badges for README
- [ ] Set up quality gates for deployments