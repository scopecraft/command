#!/usr/bin/env bun
/**
 * Script to find direct path usage that should use path-resolver
 * Run: bun run scripts/check-path-usage.ts
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// Patterns that indicate direct path usage
const PATTERNS_TO_CHECK = [
  /join\([^)]*['"](\.tasks|\.scopecraft)['"]/g,
  /['"]\.tasks\//g,
  /['"]\.scopecraft\//g,
  /\.tasks['"]\s*\+/g,
  /\.scopecraft['"]\s*\+/g,
];

// Files to exclude from checking
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.next/,
  /path-resolver\.ts$/,
  /strategies\.ts$/,
  /check-path-usage\.ts$/,
];

interface Issue {
  file: string;
  line: number;
  match: string;
  code: string;
}

function shouldExclude(path: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(path));
}

function checkFile(filePath: string): Issue[] {
  if (extname(filePath) !== '.ts' && extname(filePath) !== '.js') {
    return [];
  }
  
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: Issue[] = [];
  
  for (const pattern of PATTERNS_TO_CHECK) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (!match.index) continue;
      
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1];
      
      // Skip if it's in a comment
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      issues.push({
        file: filePath,
        line: lineNum,
        match: match[0],
        code: line.trim(),
      });
    }
  }
  
  return issues;
}

function scanDirectory(dir: string): Issue[] {
  const issues: Issue[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        issues.push(...scanDirectory(fullPath));
      } else if (stat.isFile()) {
        issues.push(...checkFile(fullPath));
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return issues;
}

function main() {
  console.log('🔍 Checking for direct path usage that should use path-resolver...\n');
  
  const srcDir = join(process.cwd(), 'src');
  const issues = scanDirectory(srcDir);
  
  if (issues.length === 0) {
    console.log('✅ No direct path usage found! All paths use the centralized resolver.\n');
    return;
  }
  
  console.log(`⚠️  Found ${issues.length} instances of direct path usage:\n`);
  
  // Group by file
  const byFile = new Map<string, Issue[]>();
  for (const issue of issues) {
    const relativePath = issue.file.replace(process.cwd() + '/', '');
    if (!byFile.has(relativePath)) {
      byFile.set(relativePath, []);
    }
    byFile.get(relativePath)!.push(issue);
  }
  
  // Display results
  for (const [file, fileIssues] of byFile) {
    console.log(`\n📁 ${file}:`);
    for (const issue of fileIssues) {
      console.log(`  Line ${issue.line}: ${issue.match}`);
      console.log(`    Code: ${issue.code}`);
    }
  }
  
  console.log('\n📝 Migration Guide:');
  console.log('  1. Import path resolver: import { resolvePath, createPathContext, PATH_TYPES } from "./paths/path-resolver"');
  console.log('  2. Create context: const context = createPathContext(projectRoot)');
  console.log('  3. Resolve paths: const path = resolvePath(PATH_TYPES.TEMPLATES, context)');
  console.log('\nSee src/core/paths/README.md for full migration guide.\n');
}

main();