#!/usr/bin/env bun

/**
 * Code Quality Check Script
 * 
 * Runs TypeScript and Biome checks on staged or changed files
 * Usage: bun scripts/code-check.ts [--staged|--changed|--all]
 * 
 * Default behavior:
 * - If files are staged, check staged files
 * - Otherwise, check changed files
 * - Use --all to check everything
 */

import { parseArgs } from 'util';

// Parse command line arguments
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    staged: { type: 'boolean', default: false },
    changed: { type: 'boolean', default: false },
    all: { type: 'boolean', default: false },
    format: { type: 'string', default: 'human' }, // human or json
  }
});

// Determine what to check
async function determineCheckMode() {
  if (values.all) return 'all';
  if (values.staged) return 'staged';
  if (values.changed) return 'changed';
  
  // Auto-detect: check if there are staged files
  const gitStatus = Bun.spawn(['git', 'diff', '--staged', '--name-only'], {
    stdout: 'pipe'
  });
  
  let stagedFiles = '';
  if (gitStatus.stdout) {
    const reader = gitStatus.stdout.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stagedFiles += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  await gitStatus.exited;
  return stagedFiles.trim() ? 'staged' : 'changed';
}

// Get changed files for Biome
async function getChangedFiles(mode: string): Promise<string[]> {
  const gitCmd = mode === 'staged' 
    ? ['git', 'diff', '--staged', '--name-only']
    : ['git', 'diff', '--name-only'];
    
  const proc = Bun.spawn(gitCmd, {
    stdout: 'pipe'
  });
  
  let stdout = '';
  if (proc.stdout) {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stdout += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  await proc.exited;
  
  // Filter for TypeScript/JavaScript files that match Biome patterns
  return stdout.trim().split('\n').filter(file => {
    if (!file) return false;
    return file.match(/\.(ts|tsx|js|jsx|json)$/);
  });
}

// Run a command and capture output
async function runCommand(cmd: string[], description: string) {
  console.log(`\n${description}`);
  
  const proc = Bun.spawn(cmd, {
    stdout: 'pipe',
    stderr: 'pipe'
  });
  
  // Read stdout using the streaming API
  let stdout = '';
  if (proc.stdout) {
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stdout += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  // Read stderr
  let stderr = '';
  if (proc.stderr) {
    const reader = proc.stderr.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stderr += decoder.decode(value);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  const exitCode = await proc.exited;
  
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  
  return {
    success: exitCode === 0,
    stdout,
    stderr,
    exitCode
  };
}

// Main check function
async function runChecks() {
  console.log('🔍 Running Code Quality Check...\n');
  
  const mode = await determineCheckMode();
  console.log(`📝 Check mode: ${mode}\n`);
  
  const results = {
    mode,
    biome: { success: false },
    typescript: { success: false },
    overall: false
  };
  
  // Run Biome check
  let biomeCmd: string[];
  
  if (mode === 'all') {
    biomeCmd = ['bun', 'x', 'biome', 'check', '--write', '.'];
  } else {
    // For staged/changed modes, get the list of files and pass them directly
    const changedFiles = await getChangedFiles(mode);
    if (changedFiles.length > 0) {
      biomeCmd = ['bun', 'x', 'biome', 'check', '--write', ...changedFiles];
    } else {
      console.log('🧹 Biome Check:');
      console.log('No files to check.');
      results.biome = { success: true, stdout: '', stderr: '', exitCode: 0 };
      biomeCmd = []; // Skip running Biome
    }
  }
  
  if (biomeCmd.length > 0) {
    results.biome = await runCommand(biomeCmd, '🧹 Biome Check:');
  }
  
  // Run TypeScript check (always full project to catch cross-file errors)
  results.typescript = await runCommand(
    ['bun', 'x', 'tsc', '--noEmit'], 
    '📏 TypeScript Check (full project):'
  );
  
  // Overall result
  results.overall = results.biome.success && results.typescript.success;
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Biome: ${results.biome.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  TypeScript: ${results.typescript.success ? '✅ Pass' : '❌ Fail'}`);
  console.log(`  Overall: ${results.overall ? '✅ All checks passed!' : '❌ Some checks failed'}`);
  
  // Output JSON if requested
  if (values.format === 'json') {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(results, null, 2));
  }
  
  // Exit with appropriate code
  process.exit(results.overall ? 0 : 1);
}

// Run the checks
runChecks().catch(error => {
  console.error('❌ Error running checks:', error);
  process.exit(1);
});