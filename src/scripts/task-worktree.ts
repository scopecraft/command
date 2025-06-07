#!/usr/bin/env bun
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';

// Initialize command structure
const program = new Command();
program.name('task-worktree').description('Simple worktree management for tasks');

// Base paths
const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const WORKTREES_DIR = path.resolve(path.dirname(REPO_ROOT), 'scopecraft.worktrees');

// Add commands
program
  .command('start')
  .description('Create a worktree for a task')
  .argument('<taskId>', 'Task ID to work on')
  .action(startWorktree);

program
  .command('finish')
  .description('Finish working on a task and merge changes')
  .argument('[taskId]', 'Optional task ID to finish')
  .action(finishWorktree);

program.command('list').description('List all current worktrees').action(listWorktrees);

// Start command implementation
async function startWorktree(taskId: string) {
  console.log(`Creating worktree for task: ${taskId}`);

  // Create branch name from task ID
  const branchName = taskId;

  // Ensure worktrees directory exists
  if (!fs.existsSync(WORKTREES_DIR)) {
    fs.mkdirSync(WORKTREES_DIR, { recursive: true });
  }

  const worktreeDir = path.join(WORKTREES_DIR, taskId);

  try {
    // Create worktree with branch
    execSync(`git worktree add -b ${branchName} ${worktreeDir}`);
    console.log(`Worktree created at ${worktreeDir}`);

    // Install dependencies in the worktree
    console.log('Installing dependencies in the worktree directory...');
    execSync('bun install', {
      stdio: 'inherit',
      cwd: worktreeDir,
    });

    // Output the worktree directory to stdout for shell integration
    process.stdout.write(worktreeDir);
  } catch (error) {
    console.error('Error creating worktree:', error);
    process.exit(1);
  }
}

// Finish command implementation
async function finishWorktree(providedTaskId?: string) {
  let taskId = providedTaskId;

  // Check if we're running from a worktree
  const isInWorktree =
    fs.existsSync('.git') &&
    fs.statSync('.git').isFile() &&
    fs.readFileSync('.git', 'utf8').trim().startsWith('gitdir:');
  let currentDir = '';

  // If we're in a worktree, show error and exit
  if (isInWorktree) {
    currentDir = path.basename(process.cwd());
    console.log(`Detected running from worktree directory: ${currentDir}`);

    // If no task ID provided, use the current directory name as the task ID
    if (!taskId) {
      taskId = currentDir;
      console.log(`Using current directory as task ID: ${taskId}`);
    }

    console.error('Error: This command should be run from the main repository.');
    console.error(`Please run: cd "${REPO_ROOT}" && bun run tw-finish ${taskId}`);
    process.exit(1);
  }

  // Standard operation when run from main repository
  if (!taskId) {
    console.error('Error: Please provide a task ID.');
    process.exit(1);
  }

  console.log(`Finishing worktree for task: ${taskId}`);

  // Check for uncommitted changes in the worktree
  const worktreeDir = path.join(WORKTREES_DIR, taskId);

  // Only check for changes if the worktree directory exists
  if (fs.existsSync(worktreeDir)) {
    try {
      const hasChanges =
        execSync(`cd "${worktreeDir}" && git status --porcelain`).toString().trim() !== '';
      if (hasChanges) {
        console.log('Warning: You have uncommitted changes in the worktree.');
        console.log('Please commit or stash your changes before finishing the worktree.');
        process.exit(1);
      }
    } catch (_error) {
      console.log('Could not check worktree status. Continuing anyway...');
    }
  } else {
    console.log(`Worktree directory ${worktreeDir} does not exist.`);
  }

  // Check if branch exists
  const branchExists = execSync(`git branch --list ${taskId}`).toString().trim() !== '';
  if (!branchExists) {
    console.error(`Branch ${taskId} does not exist.`);
    process.exit(1);
  }

  try {
    // Check if we're on main branch
    const currentBranch = execSync('git branch --show-current').toString().trim();
    if (currentBranch !== 'main') {
      console.error('Error: You must be on the main branch to finish a task.');
      console.error(`Current branch: ${currentBranch}`);
      console.error('Please run: git checkout main');
      process.exit(1);
    }

    // Attempt to merge the branch
    console.log(`Attempting to merge branch ${taskId} into main...`);

    try {
      execSync(`git merge --no-ff ${taskId}`, { stdio: 'inherit' });
      console.log(`Successfully merged ${taskId} into main.`);

      // Ask for confirmation before cleaning up
      console.log('\nMerge successful! Ready to clean up the worktree and branch.');
      console.log('This will:');
      console.log(`1. Remove the worktree at ${worktreeDir}`);
      console.log(`2. Delete the branch ${taskId}`);
      console.log('\nDo you want to proceed with cleanup? (y/n): ');

      const response = await new Promise<string>((resolve) => {
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
      });

      if (response !== 'y' && response !== 'yes') {
        console.log('Cleanup cancelled. The merge is complete but the worktree and branch remain.');
        console.log('\nTo manually clean up later, run:');
        console.log(`git worktree remove "${worktreeDir}"`);
        console.log(`git branch -d ${taskId}`);
        process.exit(0);
      }

      // Only if user confirmed, clean up the worktree and branch
      console.log('Cleaning up worktree and branch...');

      // Remove the worktree
      if (fs.existsSync(worktreeDir)) {
        execSync(`git worktree remove "${worktreeDir}"`, { stdio: 'inherit' });
        console.log(`Removed worktree at ${worktreeDir}`);
      }

      // Delete the branch
      execSync(`git branch -d ${taskId}`, { stdio: 'inherit' });
      console.log(`Deleted branch ${taskId}`);

      console.log(`\nTask ${taskId} has been successfully completed!`);
      console.log('Remember to push your changes: git push origin main');
    } catch (_mergeError) {
      console.error('\nMerge failed! There are conflicts that need to be resolved.');
      console.error('Please resolve the conflicts manually and then clean up the worktree.');
      console.error('\nTo resolve conflicts:');
      console.error('1. Fix the conflicted files');
      console.error('2. git add <resolved files>');
      console.error('3. git commit');
      console.error(`4. git worktree remove "${worktreeDir}"`);
      console.error(`5. git branch -d ${taskId}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error finishing worktree:', error);
    process.exit(1);
  }
}

// List command implementation
function listWorktrees() {
  console.log('Current worktrees:');
  const output = execSync('git worktree list').toString();
  console.log(output);
}

// Run the program
program.parse(process.argv);
