#!/usr/bin/env bun

/**
 * Task Finish Script
 * 
 * Automates the task completion workflow:
 * 1. Verify task is marked as done
 * 2. Close the worktree environment
 * 3. Merge the branch back to main
 * 
 * Designed for AI agents with clear error messages
 */

import { Command } from 'commander';
import { execSync } from 'child_process';

const program = new Command();

interface TaskInfo {
  id: string;
  status: string;
  title: string;
  type: string;
  parentId?: string;
}

interface EnvironmentInfo {
  path: string;
  branch: string;
  taskId: string;
}

// Run command with detailed error reporting
async function runCommand(
  cmd: string,
  description: string,
  options: { allowFailure?: boolean; captureOutput?: boolean } = {}
): Promise<{ success: boolean; output: string; error?: string }> {
  console.log(`\n🔧 ${description}...`);
  
  try {
    const output = execSync(cmd, { 
      encoding: 'utf8',
      stdio: options.captureOutput ? 'pipe' : 'inherit'
    });
    
    return { 
      success: true, 
      output: output || '' 
    };
  } catch (error: any) {
    const errorMessage = error.stderr || error.message || 'Unknown error';
    
    if (!options.allowFailure) {
      console.error(`❌ Failed: ${errorMessage}`);
    }
    
    return { 
      success: false, 
      output: error.stdout || '',
      error: errorMessage 
    };
  }
}

// Get task information using sc task get
async function getTaskInfo(taskId: string): Promise<TaskInfo | null> {
  const result = await runCommand(
    `bun run dev:cli task get "${taskId}" --format json`,
    `Fetching task information for ${taskId}`,
    { captureOutput: true, allowFailure: true }
  );
  
  if (!result.success) {
    console.error('\n❌ TASK NOT FOUND');
    console.error(`Could not find task with ID: ${taskId}`);
    console.error('\nPossible reasons:');
    console.error('1. Task ID is incorrect');
    console.error('2. Task was deleted');
    console.error('3. You are not in a Scopecraft project');
    console.error('\nAction: Verify the task ID using: bun run dev:cli task list');
    return null;
  }
  
  try {
    const task = JSON.parse(result.output);
    return {
      id: task.metadata?.id || taskId,
      status: task.document?.frontmatter?.status || 'unknown',
      title: task.document?.title || 'Untitled',
      type: task.document?.frontmatter?.type || 'unknown',
      parentId: task.document?.frontmatter?.parentId
    };
  } catch (error) {
    console.error('\n❌ PARSE ERROR');
    console.error('Failed to parse task information');
    console.error('Raw output:', result.output);
    return null;
  }
}

// Check if worktree exists for the task
async function getEnvironmentInfo(taskId: string): Promise<EnvironmentInfo | null> {
  const result = await runCommand(
    `bun run dev:cli env list --format json`,
    'Checking for active environment',
    { captureOutput: true }
  );
  
  if (!result.success) {
    return null;
  }
  
  try {
    const environments = JSON.parse(result.output);
    const env = environments.find((e: any) => 
      e.taskId === taskId || 
      e.branch === `task/${taskId}` ||
      e.branch === taskId
    );
    
    if (!env) {
      console.error('\n⚠️  NO ACTIVE ENVIRONMENT');
      console.error(`No worktree found for task: ${taskId}`);
      console.error('\nThis might be OK if:');
      console.error('1. Work was done directly on main branch');
      console.error('2. Environment was already closed');
      console.error('\nAction: Check if branch exists with: git branch --list "*${taskId}*"');
      return null;
    }
    
    return {
      path: env.path,
      branch: env.branch,
      taskId: env.taskId
    };
  } catch (error) {
    console.error('Failed to parse environment list');
    return null;
  }
}

// Check git status in worktree
async function checkWorktreeStatus(envPath: string): Promise<{ clean: boolean; details?: string }> {
  const result = await runCommand(
    `git -C "${envPath}" status --porcelain`,
    'Checking worktree for uncommitted changes',
    { captureOutput: true, allowFailure: true }
  );
  
  const changes = result.output.trim();
  if (changes) {
    console.error('\n❌ UNCOMMITTED CHANGES DETECTED');
    console.error('The worktree has uncommitted changes:');
    console.error(changes);
    console.error('\nAction required:');
    console.error(`1. cd "${envPath}"`);
    console.error('2. Review changes with: git status');
    console.error('3. Commit with: git add . && git commit -m "Your message"');
    console.error('4. Or stash with: git stash');
    console.error('5. Then run this script again');
    
    return { clean: false, details: changes };
  }
  
  return { clean: true };
}

// Get current branch
async function getCurrentBranch(): Promise<string> {
  const result = await runCommand(
    'git branch --show-current',
    'Getting current branch',
    { captureOutput: true }
  );
  
  return result.output.trim();
}

// Check if branch exists
async function branchExists(branchName: string): Promise<boolean> {
  const result = await runCommand(
    `git branch --list "${branchName}"`,
    `Checking if branch ${branchName} exists`,
    { captureOutput: true, allowFailure: true }
  );
  
  return result.output.trim() !== '';
}

// Main finish task workflow
async function finishTask(taskId: string, options: { force?: boolean; skipMerge?: boolean }): Promise<void> {
  console.log(`\n🏁 Starting task finish workflow for: ${taskId}`);
  console.log('═'.repeat(50));
  
  // Step 1: Check task status
  console.log('\n📋 Step 1: Verify task status');
  const task = await getTaskInfo(taskId);
  if (!task) {
    process.exit(1);
  }
  
  console.log(`✓ Found task: ${task.title}`);
  console.log(`  Type: ${task.type}`);
  console.log(`  Status: ${task.status}`);
  
  if (task.status !== 'done' && task.status !== 'Done' && !options.force) {
    console.error('\n❌ TASK NOT COMPLETE');
    console.error(`Task status is "${task.status}" but should be "done"`);
    console.error('\nAction required:');
    console.error(`1. Complete the task: bun run dev:cli task complete "${taskId}"`);
    console.error('2. Or use --force to skip this check');
    process.exit(1);
  }
  
  if (task.status !== 'done' && task.status !== 'Done' && options.force) {
    console.warn('⚠️  Task not marked as done, but --force specified, continuing...');
  }
  
  // Step 2: Check for worktree
  console.log('\n🌳 Step 2: Check worktree environment');
  const env = await getEnvironmentInfo(taskId);
  
  let branchName: string;
  
  if (env) {
    console.log(`✓ Found active environment at: ${env.path}`);
    branchName = env.branch;
    
    // Check for uncommitted changes
    const status = await checkWorktreeStatus(env.path);
    if (!status.clean && !options.force) {
      process.exit(1);
    }
    
    if (!status.clean && options.force) {
      console.warn('⚠️  Uncommitted changes detected, but --force specified, continuing...');
    }
    
    // Close the worktree
    console.log('\n🔒 Closing worktree environment...');
    const closeResult = await runCommand(
      `bun run dev:cli env close "${taskId}" --force`,
      'Closing worktree',
      { allowFailure: true }
    );
    
    if (!closeResult.success) {
      console.error('\n❌ WORKTREE CLOSE FAILED');
      console.error('Failed to close the worktree environment');
      console.error('\nPossible reasons:');
      console.error('1. Git worktree has uncommitted changes');
      console.error('2. Worktree is already removed');
      console.error('\nAction: Manually remove with: git worktree remove --force <path>');
      
      if (!options.force) {
        process.exit(1);
      }
    } else {
      console.log('✓ Worktree closed successfully');
    }
  } else {
    // No worktree, check if branch exists
    console.log('⚠️  No active worktree found, checking for branch...');
    
    // Try different branch naming patterns
    const possibleBranches = [
      `task/${taskId}`,
      taskId,
      `feature/${taskId}`,
      `fix/${taskId}`
    ];
    
    let foundBranch: string | null = null;
    for (const branch of possibleBranches) {
      if (await branchExists(branch)) {
        foundBranch = branch;
        break;
      }
    }
    
    if (!foundBranch) {
      console.error('\n❌ NO BRANCH FOUND');
      console.error(`Could not find any branch for task: ${taskId}`);
      console.error('\nChecked patterns:');
      possibleBranches.forEach(b => console.error(`  - ${b}`));
      console.error('\nPossible reasons:');
      console.error('1. Work was done directly on main branch');
      console.error('2. Branch was already merged and deleted');
      console.error('3. Different branch naming convention used');
      console.error('\nAction: List all branches with: git branch -a');
      process.exit(1);
    }
    
    branchName = foundBranch;
    console.log(`✓ Found branch: ${branchName}`);
  }
  
  // Step 3: Merge branch
  if (!options.skipMerge) {
    console.log('\n🔀 Step 3: Merge branch to main');
    
    // Ensure we're on main
    const currentBranch = await getCurrentBranch();
    if (currentBranch !== 'main') {
      console.log('📍 Switching to main branch...');
      const checkoutResult = await runCommand(
        'git checkout main',
        'Switching to main branch'
      );
      
      if (!checkoutResult.success) {
        console.error('\n❌ CHECKOUT FAILED');
        console.error('Could not switch to main branch');
        console.error('\nAction: Resolve any conflicts or uncommitted changes first');
        process.exit(1);
      }
    }
    
    // Attempt merge
    console.log(`📥 Merging ${branchName} into main...`);
    const mergeResult = await runCommand(
      `git merge --no-ff "${branchName}" -m "Merge branch '${branchName}' - Complete task ${taskId}

Task: ${task.title}
Type: ${task.type}
Status: ${task.status}"`,
      'Merging branch',
      { allowFailure: true }
    );
    
    if (!mergeResult.success) {
      console.error('\n❌ MERGE FAILED');
      console.error('Git merge encountered conflicts or errors');
      console.error('\nCommon causes:');
      console.error('1. Merge conflicts need resolution');
      console.error('2. Branch already merged');
      console.error('3. Branch diverged significantly');
      console.error('\nAction for conflicts:');
      console.error('1. Resolve conflicts in affected files');
      console.error('2. git add <resolved files>');
      console.error('3. git commit');
      console.error(`4. git branch -d "${branchName}" (when ready)`);
      process.exit(1);
    }
    
    console.log('✓ Branch merged successfully');
    
    // Delete the branch
    console.log('\n🗑️  Deleting merged branch...');
    const deleteResult = await runCommand(
      `git branch -d "${branchName}"`,
      'Deleting branch',
      { allowFailure: true }
    );
    
    if (!deleteResult.success) {
      console.warn('⚠️  Could not delete branch (may not be fully merged)');
      console.log(`   To force delete: git branch -D "${branchName}"`);
    } else {
      console.log('✓ Branch deleted');
    }
  } else {
    console.log('\n⏭️  Skipping merge step (--skip-merge specified)');
  }
  
  // Summary
  console.log('\n✅ Task finish workflow completed!');
  console.log('═'.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`  Task: ${task.title} (${taskId})`);
  console.log(`  Status: ${task.status}`);
  console.log(`  Branch: ${branchName}`);
  console.log(`  Merged: ${options.skipMerge ? 'No (skipped)' : 'Yes'}`);
  
  console.log('\n📌 Next steps:');
  console.log('  1. Review the merge: git log --oneline -n 5');
  console.log('  2. Push to remote: git push origin main');
  if (task.parentId) {
    console.log(`  3. Update parent task: bun run dev:cli task get "${task.parentId}"`);
  }
}

// CLI setup
program
  .name('finish-task')
  .description('Automate task completion workflow (for AI agents)')
  .version('1.0.0');

program
  .argument('<taskId>', 'Task ID to finish')
  .option('-f, --force', 'Force completion even with warnings')
  .option('--skip-merge', 'Skip the merge step')
  .action(async (taskId, options) => {
    try {
      await finishTask(taskId, options);
    } catch (error: any) {
      console.error(`\n❌ Unexpected error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();