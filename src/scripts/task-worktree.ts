#!/usr/bin/env bun
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import {
  findNextTask,
  formatTaskDetail,
  formatTasksList,
  getFeature,
  getTask,
  listFeatures,
  listTasks,
  projectConfig,
  updateTask,
} from '../core/index.js';

// Initialize command structure
const program = new Command();
program
  .name('task-worktree')
  .description('Specialized CLI for task worktree management in roo-task-cli');

// Base paths
const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const WORKTREES_DIR = path.resolve(path.dirname(REPO_ROOT), 'roo-task-cli.worktrees');

// No need to initialize task manager - using imported functions directly

// Add commands
program
  .command('start')
  .description('Start working on a task in a new worktree')
  .argument('[taskId]', 'Optional task ID to work on')
  .action(startWorktree);

program
  .command('finish')
  .description('Finish working on a task and merge changes')
  .argument('[taskId]', 'Optional task ID to finish')
  .option('--merge <mode>', 'Merge mode: local or pr', 'ask')
  .action(finishWorktree);

program.command('list').description('List all current task worktrees').action(listWorktrees);

program
  .command('feat-start')
  .description('Start working on a feature in a new worktree')
  .argument('[featureId]', 'Optional feature ID to work on')
  .action(startFeatureWorktree);

// Start command implementation
async function startWorktree(taskId?: string) {
  // If no task ID provided, show available tasks and prompt
  if (!taskId) {
    const tasks = await listTasks({ status: '🟡 To Do', include_content: true });
    console.log('Available tasks:');
    console.log(formatTasksList(tasks.data || [], 'table'));

    const nextTask = await findNextTask();
    console.log('\nRecommended next task:');
    if (nextTask.data && nextTask.data !== null) {
      console.log(formatTaskDetail(nextTask.data, 'default'));
    } else {
      console.log('No next task found.');
    }

    // In the actual implementation, we would prompt for input
    // But for now, let's just throw an error
    throw new Error('Please provide a task ID when running this command');
  }

  // Get task details
  const taskResult = await getTask(taskId);
  if (!taskResult.success || !taskResult.data) {
    console.error(`Task ${taskId} not found.`);
    process.exit(1);
  }

  const task = taskResult.data;
  console.log(`Creating worktree for task: ${taskId} - ${task.metadata.title}`);

  // Create branch name from task ID
  const branchName = taskId;

  // Ensure worktrees directory exists
  if (!fs.existsSync(WORKTREES_DIR)) {
    fs.mkdirSync(WORKTREES_DIR, { recursive: true });
  }

  const worktreeDir = path.join(WORKTREES_DIR, taskId);

  try {
    // Mark task as in progress and commit before creating worktree
    const updateResult = await updateTask(taskId, { metadata: { status: '🔵 In Progress' } });

    if (updateResult.success && updateResult.data) {
      // Get the relative path to the task file
      if (updateResult.data?.filePath) {
        const relativeFilePath = path.relative(REPO_ROOT, updateResult.data.filePath);

        // Add and commit the status update
        execSync(`git add "${relativeFilePath}"`);
        execSync(`git commit -m "Start task ${taskId} - mark as in progress"`);
        console.log(`Committed task status update for ${taskId}`);
      }
    }

    // Create worktree with branch (after committing the status change)
    execSync(`git worktree add -b ${branchName} ${worktreeDir}`);

    console.log(`Worktree created at ${worktreeDir}`);

    // Install dependencies in the worktree regardless of Claude launch option
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
async function finishWorktree(providedTaskId?: string, _options?: { merge?: string }) {
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
    currentDir = path.basename(process.cwd());
    // Simple check if current directory name matches a worktree
    if (fs.existsSync('.git') && fs.existsSync(path.join('.git/worktrees', currentDir))) {
      taskId = currentDir;
    } else {
      console.error('Error: Not in a task worktree directory. Please provide a task ID.');
      process.exit(1);
    }
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
    // Get task details - directly from the core functions
    const taskResult = await getTask(taskId);

    if (!taskResult.success || !taskResult.data) {
      console.error(`Task ${taskId} not found.`);
      process.exit(1);
    }

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
      console.log('3. Mark the task as completed');
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

      // Update task status to completed only if not already done
      const task = taskResult.data;
      if (task.metadata.status !== '🟢 Done') {
        console.log('Updating task status to completed...');
        const updateResult = await updateTask(taskId, {
          metadata: {
            status: '🟢 Done',
            updated_date: new Date().toISOString().split('T')[0],
          },
        });

        if (updateResult.success) {
          console.log(`Task ${taskId} marked as completed.`);
        } else {
          console.log('Failed to update task status, but merge was successful.');
        }
      } else {
        console.log(`Task ${taskId} is already marked as completed.`);
      }

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
  console.log('Current task worktrees:');
  const output = execSync('git worktree list').toString();
  console.log(output);
}

// Feature start command implementation
async function startFeatureWorktree(featureId?: string) {
  // If no feature ID provided, show available features
  if (!featureId) {
    const features = await listFeatures({ include_tasks: true });
    console.log('Available features:');
    // Simple feature list format since formatFeaturesList doesn't exist
    features.data?.forEach((feature) => {
      console.log(`${feature.id} - ${feature.title} (${feature.tasks.length} tasks)`);
    });

    throw new Error('Please provide a feature ID when running this command');
  }

  // Get feature details
  const featureResult = await getFeature(featureId);
  if (!featureResult.success || !featureResult.data) {
    console.error(`Feature ${featureId} not found.`);
    process.exit(1);
  }

  const feature = featureResult.data;
  console.log(`Creating worktree for feature: ${featureId} - ${feature.title}`);

  // Create branch name from feature ID
  // Convert FEATURE_name to feature-name format for git branch
  const branchName = featureId.toLowerCase().replace(/_/g, '-');

  // Ensure worktrees directory exists
  if (!fs.existsSync(WORKTREES_DIR)) {
    fs.mkdirSync(WORKTREES_DIR, { recursive: true });
  }

  const worktreeDir = path.join(WORKTREES_DIR, featureId);

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

// Run the program
program.parse(process.argv);
