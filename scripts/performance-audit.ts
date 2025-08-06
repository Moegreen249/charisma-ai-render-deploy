#!/usr/bin/env tsx

/**
 * Performance audit script
 * Analyzes bundle sizes, lighthouse scores, and other performance metrics
 */

import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';

interface BundleStats {
  total: number;
  gzipped: number;
  chunks: { name: string; size: number }[];
}

interface PerformanceReport {
  bundleSize: BundleStats;
  lighthouse?: any;
  recommendations: string[];
  timestamp: string;
}

async function getBundleSize(): Promise<BundleStats> {
  console.log(chalk.blue('📦 Analyzing bundle size...'));
  
  try {
    const buildDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(buildDir, 'static');
    
    if (!(await fs.stat(buildDir).catch(() => false))) {
      throw new Error('Build directory not found. Run "npm run build" first.');
    }
    
    // Get all JS files from the build
    const chunks: { name: string; size: number }[] = [];
    let totalSize = 0;
    
    async function analyzeDir(dir: string, prefix = '') {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = await fs.stat(filePath);
          
          if (stat.isDirectory()) {
            await analyzeDir(filePath, `${prefix}${file}/`);
          } else if (file.endsWith('.js') || file.endsWith('.css')) {
            const size = stat.size;
            totalSize += size;
            chunks.push({
              name: `${prefix}${file}`,
              size: Math.round(size / 1024) // KB
            });
          }
        }
      } catch (error) {
        // Directory might not exist, skip
      }
    }
    
    await analyzeDir(staticDir);
    
    // Sort by size descending
    chunks.sort((a, b) => b.size - a.size);
    
    return {
      total: Math.round(totalSize / 1024), // KB
      gzipped: Math.round(totalSize * 0.3 / 1024), // Estimate 70% compression
      chunks: chunks.slice(0, 10) // Top 10 largest chunks
    };
  } catch (error) {
    console.error(chalk.red('Error analyzing bundle size:'), error);
    return { total: 0, gzipped: 0, chunks: [] };
  }
}

async function runLighthouse(url: string): Promise<any> {
  console.log(chalk.blue('🚨 Running Lighthouse audit...'));
  
  return new Promise((resolve) => {
    const lighthouse = spawn('npx', [
      'lighthouse',
      url,
      '--output=json',
      '--chrome-flags="--headless"',
      '--quiet'
    ]);
    
    let output = '';
    lighthouse.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    lighthouse.on('close', (code) => {
      if (code === 0) {
        try {
          const report = JSON.parse(output);
          resolve({
            performance: report.lhr.categories.performance.score * 100,
            accessibility: report.lhr.categories.accessibility.score * 100,
            bestPractices: report.lhr.categories['best-practices'].score * 100,
            seo: report.lhr.categories.seo.score * 100,
            fcp: report.lhr.audits['first-contentful-paint'].numericValue,
            lcp: report.lhr.audits['largest-contentful-paint'].numericValue,
            cls: report.lhr.audits['cumulative-layout-shift'].numericValue
          });
        } catch (error) {
          console.warn(chalk.yellow('Could not parse Lighthouse results'));
          resolve(null);
        }
      } else {
        console.warn(chalk.yellow('Lighthouse audit failed (lighthouse not installed?)'));
        resolve(null);
      }
    });
  });
}

function generateRecommendations(report: PerformanceReport): string[] {
  const recommendations: string[] = [];
  
  // Bundle size recommendations
  if (report.bundleSize.total > 1000) { // > 1MB
    recommendations.push('🚨 Bundle size is large (>1MB). Consider code splitting.');
  }
  
  if (report.bundleSize.chunks.some(chunk => chunk.size > 500)) { // > 500KB
    recommendations.push('📦 Some chunks are very large. Consider splitting them further.');
  }
  
  // Lighthouse recommendations
  if (report.lighthouse) {
    if (report.lighthouse.performance < 90) {
      recommendations.push('⚡ Performance score is below 90. Optimize loading times.');
    }
    
    if (report.lighthouse.fcp > 2000) {
      recommendations.push('🎨 First Contentful Paint is slow (>2s). Optimize above-the-fold content.');
    }
    
    if (report.lighthouse.lcp > 2500) {
      recommendations.push('🖼️ Largest Contentful Paint is slow (>2.5s). Optimize images and critical path.');
    }
    
    if (report.lighthouse.cls > 0.1) {
      recommendations.push('📐 Cumulative Layout Shift is high (>0.1). Fix layout stability issues.');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Performance looks good! Keep monitoring regularly.');
  }
  
  return recommendations;
}

async function main() {
  console.log(chalk.bold.blue('🚀 Starting Performance Audit\\n'));
  
  const startTime = Date.now();
  
  // Get bundle size analysis
  const bundleSize = await getBundleSize();
  
  // Run Lighthouse if URL provided
  let lighthouse = null;
  const url = process.argv[2];
  if (url) {
    lighthouse = await runLighthouse(url);
  }
  
  // Generate report
  const report: PerformanceReport = {
    bundleSize,
    lighthouse,
    recommendations: [],
    timestamp: new Date().toISOString()
  };
  
  report.recommendations = generateRecommendations(report);
  
  // Display results
  console.log(chalk.bold.green('\\n📊 Performance Report'));
  console.log(chalk.gray('='.repeat(50)));
  
  console.log(chalk.bold('\\n📦 Bundle Analysis:'));
  console.log(`Total size: ${chalk.yellow(report.bundleSize.total + 'KB')} (gzipped: ~${chalk.green(report.bundleSize.gzipped + 'KB')})`);
  
  if (report.bundleSize.chunks.length > 0) {
    console.log('\\nLargest chunks:');
    report.bundleSize.chunks.forEach((chunk, i) => {
      const color = chunk.size > 500 ? chalk.red : chunk.size > 200 ? chalk.yellow : chalk.green;
      console.log(`  ${i + 1}. ${chunk.name}: ${color(chunk.size + 'KB')}`);
    });
  }
  
  if (lighthouse) {
    console.log(chalk.bold('\\n🚨 Lighthouse Scores:'));
    console.log(`Performance: ${chalk.yellow(Math.round(lighthouse.performance))}/100`);
    console.log(`Accessibility: ${chalk.yellow(Math.round(lighthouse.accessibility))}/100`);
    console.log(`Best Practices: ${chalk.yellow(Math.round(lighthouse.bestPractices))}/100`);
    console.log(`SEO: ${chalk.yellow(Math.round(lighthouse.seo))}/100`);
    
    console.log(chalk.bold('\\n⏱️ Core Web Vitals:'));
    console.log(`FCP: ${chalk.yellow(Math.round(lighthouse.fcp))}ms`);
    console.log(`LCP: ${chalk.yellow(Math.round(lighthouse.lcp))}ms`);
    console.log(`CLS: ${chalk.yellow(lighthouse.cls.toFixed(3))}`);
  }
  
  console.log(chalk.bold('\\n💡 Recommendations:'));
  report.recommendations.forEach(rec => {
    console.log(`  ${rec}`);
  });
  
  // Save report
  const reportPath = path.join(process.cwd(), 'performance-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  const duration = Date.now() - startTime;
  console.log(chalk.gray(`\\n📝 Report saved to ${reportPath}`));
  console.log(chalk.gray(`⏱️ Audit completed in ${duration}ms`));
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as performanceAudit };