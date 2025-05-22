#!/usr/bin/env bun

/**
 * Simple Release Script
 * 
 * 1. Claude analyzes changes and creates release plan
 * 2. Script executes the mechanical parts
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { callClaude } from './utils/claude-helper';

const program = new Command();

interface ReleaseVersion {
  current_version: string;
  new_version: string;
  bump_type: string;
  confidence: string;
  reasoning: string;
  breaking_changes: boolean;
  notable_features: string[];
}

interface ReleaseMetadata {
  success: boolean;
  version: string;
  release_date: string;
  summary: string;
  breaking_changes: boolean;
  highlights: string[];
  categories_used: string[];
  total_changes: number;
  commit_count: number;
  files_changed: number;
}

async function runCommand(cmd: string[], description: string, showAllOutput = false, streaming = false): Promise<{ success: boolean; output: string }> {
  console.log(`🔧 ${description}`);
  
  const proc = Bun.spawn(cmd, {
    stdout: 'pipe',
    stderr: 'pipe'
  });
  
  let stdout = '';
  let stderr = '';
  
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
  if (stderr && (exitCode !== 0 || showAllOutput)) console.error(stderr);
  
  return {
    success: exitCode === 0,
    output: stdout
  };
}

// Run pre-flight checks
async function runPreflightChecks(): Promise<boolean> {
  console.log('\n🔍 Running Pre-flight Checks...');
  
  const checks = [
    {
      name: 'Code Quality Check',
      command: ['bun', 'run', 'code-check'],
      required: true
    },
    {
      name: 'Security Check', 
      command: ['bun', 'scripts/security-check.ts'],
      required: true
    },
    {
      name: 'Unit Tests',
      command: ['bun', 'test'],
      required: true
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const result = await runCommand(check.command, check.name);
    
    if (!result.success) {
      console.error(`❌ ${check.name} failed`);
      allPassed = false;
    } else {
      console.log(`✅ ${check.name} passed`);
    }
  }
  
  if (allPassed) {
    console.log('\n✅ All pre-flight checks passed!');
  } else {
    console.log('\n❌ Some pre-flight checks failed');
  }
  
  return allPassed;
}

// Build and validate (assumes code quality checks already passed in precheck)
async function buildAndValidate(): Promise<boolean> {
  console.log('\n🔨 Building and Validating...');
  
  const steps = [
    {
      name: 'Build Project',
      command: ['bun', 'run', 'build']
    },
    {
      name: 'Create Local Package',
      command: ['bun', 'run', 'publish:local']
    },
    {
      name: 'Test Local Installation',
      command: ['bun', 'run', 'install:local']
    }
  ];
  
  for (const step of steps) {
    const result = await runCommand(step.command, step.name);
    if (!result.success) {
      console.error(`❌ ${step.name} failed`);
      return false;
    }
    console.log(`✅ ${step.name} passed`);
  }
  
  return true;
}

// Check if git working directory is clean
async function ensureCleanGitStatus(): Promise<void> {
  console.log('\n🔍 Checking git working directory...');
  
  const result = await runCommand(['git', 'status', '--porcelain'], 'Check git status');
  
  if (!result.success) {
    throw new Error('Failed to check git status');
  }
  
  const isClean = result.output.trim() === '';
  
  if (!isClean) {
    console.error('❌ Git working directory is not clean!');
    console.error('   Please commit or stash your changes before proceeding.');
    console.error('   Run: git status');
    throw new Error('Git working directory is not clean');
  }
  
  console.log('✅ Git working directory is clean');
}

async function analyzeRelease(requestedVersion?: string, verbose = false): Promise<void> {
  console.log('🤖 Analyzing release with Claude...');
  
  // Get current version
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const currentVersion = pkg.version;
  
  // Get last tag
  const tagResult = await runCommand(['git', 'tag', '--sort=-version:refname'], 'Get latest tag');
  const lastTag = tagResult.success && tagResult.output ? 
    tagResult.output.trim().split('\n')[0] || 'HEAD~10' : 'HEAD~10';
  
  // Prepare data for Claude
  const data = {
    CURRENT_VERSION: currentVersion,
    LAST_TAG: lastTag,
    REQUESTED_VERSION: requestedVersion || '',
    RELEASE_DATE: new Date().toISOString().split('T')[0]
  };
  
  // Create .release directory
  if (!existsSync('.release')) {
    mkdirSync('.release');
  }
  
  console.log(`📋 Analysis Context:`);
  console.log(`  Current: ${currentVersion}`);
  console.log(`  Last Tag: ${lastTag}`);
  console.log(`  Requested: ${requestedVersion || 'auto-detect'}`);
  
  // Call Claude using the proper utility with direct piping
  console.log('🤖 Calling Claude for release analysis...');
  const result = await callClaude(
    'scripts/prompts/release-analysis.md',
    data,
    undefined,
    verbose
  );
  
  if (!result.success) {
    throw new Error('Claude analysis failed');
  }
  
  // Verify analysis files were created
  const requiredFiles = [
    '.release/version.json',
    '.release/changelog.md',
    '.release/metadata.json'
  ];
  
  const missingFiles = requiredFiles.filter(file => !existsSync(file));
  if (missingFiles.length > 0) {
    throw new Error(`Claude analysis incomplete. Missing files: ${missingFiles.join(', ')}`);
  }
  
  console.log('✅ Release analysis complete');
}

async function executeRelease(dryRun = false, skipBuild = false): Promise<void> {
  console.log('⚙️ Executing release...');
  
  // Check git status first (skip in dry-run)
  if (!dryRun) {
    await ensureCleanGitStatus();
  }
  
  // Load analysis results
  const version: ReleaseVersion = JSON.parse(readFileSync('.release/version.json', 'utf-8'));
  const metadata: ReleaseMetadata = JSON.parse(readFileSync('.release/metadata.json', 'utf-8'));
  const changelogContent = readFileSync('.release/changelog.md', 'utf-8');
  
  console.log(`\n📋 Release Plan:`);
  console.log(`  Version: ${version.current_version} → ${version.new_version}`);
  console.log(`  Type: ${version.bump_type}`);
  console.log(`  Confidence: ${version.confidence}`);
  console.log(`  Summary: ${metadata.summary}`);
  console.log(`  Changes: ${metadata.total_changes}`);
  
  if (version.breaking_changes) {
    console.warn('⚠️  Breaking changes detected!');
  }
  
  if (dryRun) {
    console.log('\n🔍 Dry run - showing what would be done:');
    console.log('  1. Update package.json version');
    console.log('  2. Update CHANGELOG.md');
    console.log('  3. Build and package');
    console.log('  4. Commit changes');
    console.log('  5. Create git tag');
    return;
  }
  
  // 1. Update package.json
  console.log('\n📦 Updating package.json...');
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  pkg.version = version.new_version;
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  
  // 2. Update CHANGELOG.md
  console.log('📄 Updating CHANGELOG.md...');
  let existingChangelog = '';
  try {
    existingChangelog = readFileSync('CHANGELOG.md', 'utf-8');
  } catch {
    existingChangelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  // Insert new changelog entry
  const lines = existingChangelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## ['));
  if (insertIndex >= 0) {
    lines.splice(insertIndex, 0, changelogContent, '');
  } else {
    lines.push('', changelogContent);
  }
  writeFileSync('CHANGELOG.md', lines.join('\n'));
  
  // 3. Run quality checks and build
  if (!dryRun && !skipBuild) {
    const buildSuccess = await buildAndValidate();
    if (!buildSuccess) {
      throw new Error('Build and validation failed');
    }
  } else {
    if (dryRun) {
      console.log('\n🔍 Would run build and packaging (skipped in dry-run)');
    } else {
      console.log('\n🔍 Skipping build and packaging (--skip-build)');
    }
  }
  
  // 5. Commit changes
  console.log('📝 Committing changes...');
  await runCommand(['git', 'add', 'package.json', 'CHANGELOG.md'], 'Stage files');
  
  const commitMessage = `Bump version to ${version.new_version}

${metadata.summary}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
  
  const commitResult = await runCommand(['git', 'commit', '-m', commitMessage], 'Create commit');
  if (!commitResult.success) {
    throw new Error('Failed to create commit');
  }
  
  // 6. Create tag
  console.log('🏷️  Creating git tag...');
  const tagName = `v${version.new_version}`;
  const tagResult = await runCommand(['git', 'tag', tagName], `Create tag ${tagName}`);
  if (!tagResult.success) {
    throw new Error(`Failed to create tag ${tagName}`);
  }
  
  console.log('\n🎉 Release prepared successfully!');
  console.log(`\nNext steps:`);
  console.log(`  1. Review: git show HEAD`);
  console.log(`  2. Push: git push origin main --tags`);
  console.log(`  3. Publish: npm publish`);
}

async function publishRelease(otp?: string): Promise<void> {
  console.log('🚀 Publishing release...');
  
  // Push to remote
  const pushResult = await runCommand(['git', 'push', 'origin', 'main', '--tags'], 'Push to remote');
  if (!pushResult.success) {
    throw new Error('Failed to push to remote');
  }
  
  // Create GitHub release (optional)
  const tagResult = await runCommand(['git', 'describe', '--tags', '--abbrev=0'], 'Get latest tag');
  if (tagResult.success) {
    const latestTag = tagResult.output.trim();
    console.log(`\n🏷️  Creating GitHub release for ${latestTag}...`);
    const ghResult = await runCommand(['gh', 'release', 'create', latestTag, '--generate-notes'], 'Create GitHub release');
    if (!ghResult.success) {
      console.warn('⚠️  GitHub release failed - you may need to install gh CLI');
    }
  }
  
  // Publish to npm (optional)
  console.log('\n📦 Publishing to npm...');
  const publishCommand = ['npm', 'publish'];
  if (otp) {
    publishCommand.push('--otp', otp);
  }
  const publishResult = await runCommand(publishCommand, 'Publish to npm');
  if (!publishResult.success) {
    console.warn('⚠️  npm publish failed - check authentication');
  }
  
  console.log('\n🎉 Release published!');
}

// Commands
program
  .name('release')
  .description('AI-assisted release management for Scopecraft Command')
  .version('1.0.0');

program
  .command('precheck')
  .description('Run pre-flight checks (code quality, security, tests)')
  .action(async () => {
    try {
      const checksPass = await runPreflightChecks();
      
      if (checksPass) {
        console.log('\n🎉 All pre-checks passed! Ready for release.');
        process.exit(0);
      } else {
        console.log('\n❌ Pre-checks failed. Please fix issues before release.');
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Pre-check failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze changes and create release plan')
  .argument('[version]', 'Requested version (optional)')
  .option('--verbose', 'Show detailed Claude output')
  .action(async (version, options) => {
    try {
      await analyzeRelease(version, options.verbose);
    } catch (error) {
      console.error(`❌ Analysis failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run the complete release process (assumes precheck already passed)')
  .argument('[version]', 'Target version (e.g., 1.2.3, patch, minor, major)')
  .option('--dry-run', 'Run without making any changes')
  .option('--skip-build', 'Skip build and validation')
  .option('--verbose', 'Show detailed Claude output for debugging')
  .action(async (version, options) => {
    try {
      await analyzeRelease(version, options.verbose);
      await executeRelease(options.dryRun, options.skipBuild);
    } catch (error) {
      console.error(`❌ Release failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('execute')
  .description('Execute the release plan')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    try {
      await executeRelease(options.dryRun);
    } catch (error) {
      console.error(`❌ Release failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('publish')
  .description('Publish the release (push, GitHub, npm)')
  .option('--otp <code>', 'One-time password for npm publish')
  .action(async (options) => {
    try {
      await publishRelease(options.otp);
    } catch (error) {
      console.error(`❌ Publish failed: ${error}`);
      process.exit(1);
    }
  });

program
  .command('full')
  .description('Complete release: analyze + execute + publish')
  .argument('[version]', 'Requested version (optional)')
  .option('--dry-run', 'Show what would be done without making changes')
  .option('--verbose', 'Show detailed Claude output')
  .option('--otp <code>', 'One-time password for npm publish')
  .action(async (version, options) => {
    try {
      await analyzeRelease(version, options.verbose);
      await executeRelease(options.dryRun);
      if (!options.dryRun) {
        await publishRelease(options.otp);
      }
    } catch (error) {
      console.error(`❌ Full release failed: ${error}`);
      process.exit(1);
    }
  });

if (import.meta.main) {
  program.parse();
}