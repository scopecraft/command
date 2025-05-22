#!/usr/bin/env bun

/**
 * Release Management Script
 * 
 * Orchestrates the release process using a combination of automated checks
 * and AI-assisted content generation via Claude.
 * 
 * Usage: bun scripts/release.ts [version] [options]
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { callClaude, prepareGitData, validateVersionAnalysis, validateChangelogGeneration } from './utils/claude-helper';

const program = new Command();

interface PackageJson {
  version: string;
  [key: string]: any;
}

// Release state management
interface ReleaseState {
  currentVersion: string;
  targetVersion: string;
  lastTag: string;
  gitData: Record<string, any>;
  versionAnalysis?: any;
  changelogData?: any;
}

// Run a command and capture output
async function runCommand(cmd: string[], description: string) {
  console.log(`\n🔧 ${description}`);
  
  const proc = Bun.spawn(cmd, {
    stdout: 'pipe',
    stderr: 'pipe'
  });
  
  let stdout = '';
  let stderr = '';
  
  // Read stdout
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

// Load current package.json
function loadPackageJson(): PackageJson {
  try {
    const content = readFileSync('package.json', 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load package.json: ${error}`);
  }
}

// Update package.json version
function updatePackageVersion(newVersion: string) {
  const pkg = loadPackageJson();
  pkg.version = newVersion;
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✅ Updated package.json version to ${newVersion}`);
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

// Analyze version with Claude
async function analyzeVersion(state: ReleaseState, options: any = {}): Promise<void> {
  console.log('\n🤖 Analyzing Version Requirements...');
  
  const data = {
    current_version: state.currentVersion,
    target_version: state.targetVersion,
    last_tag: state.lastTag,
    ...state.gitData
  };
  
  if (options.verbose) {
    console.log('\n📊 Data being sent to Claude:');
    console.log(JSON.stringify(data, null, 2));
  }
  
  const result = await callClaude(
    'scripts/prompts/tasks/version-analysis.md',
    data,
    undefined,
    options.verbose || false
  );
  
  const validation = validateVersionAnalysis(result);
  if (!validation.success) {
    throw new Error(`Version analysis failed: ${validation.error}`);
  }
  
  state.versionAnalysis = validation.data;
  
  // Update target version if not specified or incorrect
  if (!state.targetVersion || state.versionAnalysis.recommended_version !== state.targetVersion) {
    console.log(`\n📋 Version Analysis Results:`);
    console.log(`  Current: ${state.currentVersion}`);
    console.log(`  Recommended: ${state.versionAnalysis.recommended_version}`);
    console.log(`  Change Type: ${state.versionAnalysis.change_type}`);
    console.log(`  Confidence: ${state.versionAnalysis.confidence}`);
    console.log(`  Reasoning: ${state.versionAnalysis.reasoning}`);
    
    if (state.versionAnalysis.breaking_changes) {
      console.warn(`⚠️  Breaking changes detected!`);
    }
    
    // Use recommended version
    state.targetVersion = state.versionAnalysis.recommended_version;
  }
}

// Generate changelog with Claude
async function generateChangelog(state: ReleaseState): Promise<void> {
  console.log('\n📝 Generating Changelog...');
  
  const data = {
    target_version: state.targetVersion,
    release_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    last_tag: state.lastTag,
    ...state.gitData
  };
  
  const result = await callClaude(
    'scripts/prompts/tasks/changelog-generation.md',
    data
  );
  
  const validation = validateChangelogGeneration(result);
  if (!validation.success) {
    throw new Error(`Changelog generation failed: ${validation.error}`);
  }
  
  state.changelogData = validation.data;
  
  console.log(`\n📋 Generated Changelog:`);
  console.log(`  Summary: ${state.changelogData.summary}`);
  console.log(`  Categories: ${state.changelogData.categories_used.join(', ')}`);
  console.log(`  Changes: ${state.changelogData.total_changes}`);
  
  if (state.changelogData.breaking_changes) {
    console.warn(`⚠️  Breaking changes in changelog!`);
  }
}

// Update CHANGELOG.md file
function updateChangelogFile(state: ReleaseState): void {
  console.log('\n📄 Updating CHANGELOG.md...');
  
  const changelogPath = 'CHANGELOG.md';
  let existingChangelog = '';
  
  try {
    existingChangelog = readFileSync(changelogPath, 'utf-8');
  } catch (error) {
    // File doesn't exist, create with header
    existingChangelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  // Insert new changelog entry
  const newEntry = `## [${state.targetVersion}] - ${new Date().toISOString().split('T')[0]}\n\n${state.changelogData.changelog_markdown}\n\n`;
  
  // Find insertion point (after header, before first existing entry)
  const lines = existingChangelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || lines.length;
  
  lines.splice(insertIndex, 0, ...newEntry.split('\n'));
  
  writeFileSync(changelogPath, lines.join('\n'));
  console.log(`✅ Updated CHANGELOG.md with version ${state.targetVersion}`);
}

// Build and validate
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
  }
  
  return true;
}

// Commit changes
async function commitChanges(state: ReleaseState): Promise<void> {
  console.log('\n📦 Committing Release Changes...');
  
  // Stage files
  await runCommand(['git', 'add', 'package.json', 'CHANGELOG.md'], 'Stage release files');
  
  // Create commit message
  const commitMessage = `Bump version to ${state.targetVersion}

- Update version in package.json to ${state.targetVersion}
- Add CHANGELOG entry for ${state.targetVersion} release
- ${state.changelogData.summary}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
  
  // Commit
  const result = await runCommand(['git', 'commit', '-m', commitMessage], 'Create release commit');
  
  if (!result.success) {
    throw new Error('Failed to create release commit');
  }
  
  console.log(`✅ Created release commit for ${state.targetVersion}`);
  
  // Create git tag
  const tagName = `v${state.targetVersion}`;
  const tagResult = await runCommand(['git', 'tag', tagName], `Create git tag ${tagName}`);
  
  if (!tagResult.success) {
    throw new Error(`Failed to create git tag ${tagName}`);
  }
  
  console.log(`✅ Created git tag ${tagName}`);
}

// Publish command
async function publishCommand(options: any = {}) {
  console.log('🚀 Publishing Release...');
  
  try {
    // Step 0: Check git status
    await ensureCleanGitStatus();
    // Step 1: Push commit and tags
    console.log('\n📤 Pushing to remote...');
    const pushResult = await runCommand(['git', 'push', 'origin', 'main', '--tags'], 'Push commit and tags');
    
    if (!pushResult.success) {
      throw new Error('Failed to push to remote repository');
    }
    
    console.log('✅ Pushed commit and tags to remote');
    
    // Step 2: Get the latest tag for GitHub release
    const tagResult = await runCommand(['git', 'describe', '--tags', '--abbrev=0'], 'Get latest tag', true);
    if (!tagResult.success) {
      throw new Error('Failed to get latest tag');
    }
    
    const latestTag = tagResult.stdout.trim();
    console.log(`\n📋 Latest tag: ${latestTag}`);
    
    // Step 3: Create GitHub release
    if (!options.skipGithub) {
      console.log('\n🏷️  Creating GitHub release...');
      const releaseResult = await runCommand(['gh', 'release', 'create', latestTag, '--generate-notes'], `Create GitHub release ${latestTag}`);
      
      if (!releaseResult.success) {
        console.warn('⚠️  Failed to create GitHub release - you may need to install gh CLI or authenticate');
        console.log(`   Manual: gh release create ${latestTag} --generate-notes`);
      } else {
        console.log(`✅ Created GitHub release ${latestTag}`);
      }
    }
    
    // Step 4: Publish to npm
    if (!options.skipNpm) {
      console.log('\n📦 Publishing to npm...');
      
      // Check if we're logged in to npm
      const whoamiResult = await runCommand(['npm', 'whoami'], 'Check npm authentication', true);
      if (!whoamiResult.success) {
        console.warn('⚠️  Not logged in to npm. Please run: npm login');
        console.log('   Then run: npm publish');
      } else {
        console.log(`📋 Publishing as: ${whoamiResult.stdout.trim()}`);
        
        const publishResult = await runCommand(['npm', 'publish'], 'Publish to npm');
        
        if (!publishResult.success) {
          throw new Error('Failed to publish to npm');
        }
        
        console.log('✅ Published to npm');
      }
    }
    
    console.log('\n🎉 Release Published Successfully!');
    console.log(`\nRelease Summary:`);
    console.log(`  📋 Version: ${latestTag}`);
    console.log(`  🔗 GitHub: https://github.com/your-org/your-repo/releases/tag/${latestTag}`);
    console.log(`  📦 npm: https://npmjs.com/package/@scopecraft/cmd`);
    
  } catch (error) {
    console.error(`\n❌ Publish failed: ${error}`);
    process.exit(1);
  }
}

// Pre-check command
async function precheckCommand() {
  console.log('🔍 Running Release Pre-checks...');
  
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
    console.error(`\n❌ Pre-check failed: ${error}`);
    process.exit(1);
  }
}

// Check if git working directory is clean and exit if not
async function ensureCleanGitStatus(): Promise<void> {
  console.log('\n🔍 Checking git working directory...');
  
  const result = await runCommand(['git', 'status', '--porcelain'], 'Check git status', true);
  
  if (!result.success) {
    throw new Error('Failed to check git status');
  }
  
  const isClean = result.stdout.trim() === '';
  
  if (!isClean) {
    console.error('❌ Git working directory is not clean!');
    console.error('   Please commit or stash your changes before proceeding.');
    console.error('   Run: git status');
    process.exit(1);
  }
  
  console.log('✅ Git working directory is clean');
}

// Main release command
async function releaseCommand(version?: string, options: any = {}) {
  console.log('🚀 Starting Release Process...');
  
  try {
    // Step 0: Check git status (skip in dry-run mode)
    if (!options.dryRun) {
      await ensureCleanGitStatus();
    }
    // Initialize release state
    const pkg = loadPackageJson();
    const gitData = await prepareGitData();
    
    const state: ReleaseState = {
      currentVersion: pkg.version,
      targetVersion: version || '',
      lastTag: gitData.last_tag,
      gitData
    };
    
    console.log(`\n📋 Release Context:`);
    console.log(`  Current Version: ${state.currentVersion}`);
    console.log(`  Last Tag: ${state.lastTag}`);
    console.log(`  Target Version: ${state.targetVersion || 'TBD'}`);
    
    // Step 1: Version analysis
    await analyzeVersion(state, options);
    
    // Step 2: Generate changelog
    await generateChangelog(state);
    
    // Step 3: Update files
    updatePackageVersion(state.targetVersion);
    updateChangelogFile(state);
    
    // Step 4: Build and validate
    if (!options.skipBuild) {
      const buildSuccess = await buildAndValidate();
      if (!buildSuccess) {
        console.error('\n❌ Build and validation failed - aborting release');
        process.exit(1);
      }
    }
    
    // Step 5: Commit changes
    if (!options.dryRun) {
      await commitChanges(state);
      
      console.log('\n🎉 Release Preparation Complete!');
      console.log(`\nNext steps:`);
      console.log(`  1. Review the changes: git show HEAD`);
      console.log(`  2. Publish the release: bun scripts/release.ts publish`);
      console.log(`\nOr publish manually:`);
      console.log(`  • Push: git push origin main --tags`);
      console.log(`  • GitHub: gh release create v${state.targetVersion} --generate-notes`);
      console.log(`  • npm: npm publish`);
      
    } else {
      console.log('\n🔍 Dry run complete - no changes committed');
    }
    
  } catch (error) {
    console.error(`\n❌ Release failed: ${error}`);
    process.exit(1);
  }
}

// CLI setup
program
  .name('release')
  .description('AI-assisted release management for Scopecraft Command')
  .version('1.0.0');

program
  .command('precheck')
  .description('Run pre-flight checks (code quality, security, tests)')
  .action(precheckCommand);

program
  .command('run')
  .description('Run the complete release process (assumes precheck already passed)')
  .argument('[version]', 'Target version (e.g., 1.2.3, patch, minor, major)')
  .option('--dry-run', 'Run without making any changes')
  .option('--skip-build', 'Skip build and validation')
  .option('--verbose', 'Show detailed Claude output for debugging')
  .action(releaseCommand);

program
  .command('publish')
  .description('Publish the release (push, GitHub release, npm publish)')
  .option('--skip-github', 'Skip GitHub release creation')
  .option('--skip-npm', 'Skip npm publishing')
  .action(publishCommand);

// Handle direct execution
if (import.meta.main) {
  program.parse();
}