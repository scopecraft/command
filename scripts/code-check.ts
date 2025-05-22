#!/usr/bin/env bun

/**
 * Code Quality Check Script v2
 * 
 * Runs TypeScript and Biome checks with smart filtering
 * Usage: bun scripts/code-check.ts [options]
 * 
 * Default behavior:
 * - Check files changed since last commit
 * - Filter TypeScript errors to changed files only
 * - Run full project TypeScript check for safety
 * 
 * Options:
 * --staged        Check staged files only
 * --base=<ref>    Compare against specific branch/commit (e.g., --base=main)
 * --full          Check all files (old behavior)
 * --no-ts         Skip TypeScript check entirely
 * --show-all-ts   Show all TypeScript errors, not just filtered ones
 * --only=<check>  Run only specific check (biome|typescript)
 */

import { parseArgs } from 'util';
import { simpleGit } from 'simple-git';

// Parse command line arguments
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    staged: { type: 'boolean', default: false },
    base: { type: 'string' },
    full: { type: 'boolean', default: false },
    'no-ts': { type: 'boolean', default: false },
    'show-all-ts': { type: 'boolean', default: false },
    only: { type: 'string' },
    format: { type: 'string', default: 'human' }, // human or json
    help: { type: 'boolean', default: false },
  }
});

// Show help if requested
if (values.help) {
  console.log(`
🔍 Code Quality Check Script v2

Usage: bun scripts/code-check.ts [options]

Default behavior:
  Check files changed since last commit, with filtered TypeScript errors

Options:
  --staged           Check staged files only
  --base=<ref>       Compare against specific branch/commit (e.g., --base=main)
  --full             Check all files (old behavior)
  --no-ts            Skip TypeScript check entirely
  --show-all-ts      Show all TypeScript errors, not just filtered ones
  --only=<check>     Run only specific check (biome|typescript)
  --format=json      Output results in JSON format
  --help             Show this help message

Examples:
  bun scripts/code-check.ts                    # Default: check changed files
  bun scripts/code-check.ts --staged           # Check only staged files
  bun scripts/code-check.ts --base=main        # Check against main branch
  bun scripts/code-check.ts --only=biome       # Run only Biome check
  bun scripts/code-check.ts --full --show-all-ts  # Full check with all TS errors
`);
  process.exit(0);
}

const git = simpleGit();

// Determine what files to check
async function getFilesToCheck(): Promise<{ files: string[], mode: string, base?: string }> {
  if (values.full) {
    return { files: [], mode: 'full' };
  }
  
  if (values.staged) {
    const stagedFiles = await git.diff(['--staged', '--name-only']);
    return { 
      files: stagedFiles.split('\n').filter(f => f.trim()), 
      mode: 'staged' 
    };
  }
  
  if (values.base) {
    try {
      const diffFiles = await git.diff(['--name-only', `${values.base}...HEAD`]);
      return { 
        files: diffFiles.split('\n').filter(f => f.trim()), 
        mode: 'base-comparison',
        base: values.base 
      };
    } catch (error) {
      console.error(`❌ Error: Could not compare against '${values.base}'. Branch/commit may not exist.`);
      process.exit(1);
    }
  }
  
  // Default: files changed since last commit
  try {
    const changedFiles = await git.diff(['--name-only', 'HEAD~1']);
    return { 
      files: changedFiles.split('\n').filter(f => f.trim()), 
      mode: 'since-last-commit' 
    };
  } catch (error) {
    // Fallback to staged files if no previous commit
    const stagedFiles = await git.diff(['--staged', '--name-only']);
    return { 
      files: stagedFiles.split('\n').filter(f => f.trim()), 
      mode: 'staged-fallback' 
    };
  }
}

// Filter files for specific tools
function filterFilesForTool(files: string[], tool: 'biome' | 'typescript'): string[] {
  return files.filter(file => {
    if (!file || !file.trim()) return false;
    
    if (tool === 'biome') {
      return file.match(/\.(ts|tsx|js|jsx|json)$/);
    }
    
    if (tool === 'typescript') {
      return file.match(/\.(ts|tsx)$/);
    }
    
    return false;
  });
}

// Parse TypeScript errors and filter by file paths
function parseAndFilterTSErrors(tsOutput: string, filesToShow: string[]): { filteredErrors: string[], totalErrors: number, filteredCount: number } {
  if (!tsOutput.trim()) {
    return { filteredErrors: [], totalErrors: 0, filteredCount: 0 };
  }
  
  const lines = tsOutput.split('\n');
  const errors: string[] = [];
  const filteredErrors: string[] = [];
  
  for (const line of lines) {
    if (line.includes(': error TS')) {
      errors.push(line);
      
      // Check if this error is in one of the files we care about
      const matchesFile = filesToShow.some(file => line.includes(file));
      if (matchesFile) {
        filteredErrors.push(line);
      }
    }
  }
  
  return {
    filteredErrors,
    totalErrors: errors.length,
    filteredCount: filteredErrors.length
  };
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
  console.log('🔍 Running Code Quality Check v2...\n');
  
  const { files, mode, base } = await getFilesToCheck();
  
  let modeDescription = mode;
  if (mode === 'base-comparison') {
    modeDescription = `comparing against ${base}`;
  } else if (mode === 'since-last-commit') {
    modeDescription = 'files changed since last commit';
  } else if (mode === 'staged-fallback') {
    modeDescription = 'staged files (no previous commit found)';
  }
  
  console.log(`📝 Check mode: ${modeDescription}`);
  if (files.length > 0 && mode !== 'full') {
    console.log(`📁 Files to check: ${files.length}`);
  }
  console.log();
  
  const results = {
    mode: modeDescription,
    files: files.length,
    biome: { success: false as any },
    typescript: { success: false as any },
    overall: false
  };
  
  const shouldRunBiome = !values.only || values.only === 'biome';
  const shouldRunTypeScript = (!values.only || values.only === 'typescript') && !values['no-ts'];
  
  // Run checks in parallel when possible
  const promises: Promise<void>[] = [];
  
  // Biome check
  if (shouldRunBiome) {
    promises.push((async () => {
      let biomeCmd: string[];
      
      if (mode === 'full') {
        biomeCmd = ['bun', 'x', 'biome', 'check', '--write', '.'];
      } else {
        const biomeFiles = filterFilesForTool(files, 'biome');
        if (biomeFiles.length > 0) {
          biomeCmd = ['bun', 'x', 'biome', 'check', '--write', ...biomeFiles];
        } else {
          console.log('🧹 Biome Check: No relevant files to check.');
          results.biome = { success: true, stdout: '', stderr: '', exitCode: 0 };
          return;
        }
      }
      
      results.biome = await runCommand(biomeCmd, '🧹 Biome Check:');
    })());
  } else {
    results.biome = { success: true, stdout: 'Skipped', stderr: '', exitCode: 0 };
  }
  
  // TypeScript check
  if (shouldRunTypeScript) {
    promises.push((async () => {
      const tsResult = await runCommand(
        ['bun', 'x', 'tsc', '--noEmit', '--pretty', 'false'], 
        '📏 TypeScript Check:'
      );
      
      if (mode === 'full' || values['show-all-ts']) {
        results.typescript = tsResult;
      } else {
        // Filter TypeScript errors to only show relevant files
        const { filteredErrors, totalErrors, filteredCount } = parseAndFilterTSErrors(
          tsResult.stdout + tsResult.stderr, 
          files
        );
        
        const hasFilteredErrors = filteredCount > 0;
        const filteredOutput = hasFilteredErrors ? filteredErrors.join('\n') : '';
        
        // Show filtered results
        if (hasFilteredErrors) {
          console.log(filteredOutput);
        }
        
        // Show summary
        if (totalErrors > 0) {
          console.log(`\n📊 TypeScript Summary: ${filteredCount} error(s) in changed files, ${totalErrors} total project error(s)`);
          if (totalErrors > filteredCount) {
            console.log('💡 Use --show-all-ts to see all project errors');
          }
        }
        
        results.typescript = {
          success: filteredCount === 0,
          stdout: filteredOutput,
          stderr: '',
          exitCode: hasFilteredErrors ? 1 : 0,
          totalErrors,
          filteredCount
        };
      }
    })());
  } else {
    results.typescript = { success: true, stdout: 'Skipped', stderr: '', exitCode: 0 };
  }
  
  // Wait for all checks to complete
  await Promise.all(promises);
  
  // Overall result
  results.overall = results.biome.success && results.typescript.success;
  
  // Summary
  console.log('\n📊 Final Summary:');
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