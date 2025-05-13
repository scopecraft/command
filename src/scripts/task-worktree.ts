#!/usr/bin/env bun
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { Command } from 'commander';
import {
  listTasks,
  getTask,
  updateTask,
  findNextTask,
  projectConfig,
  formatTasksList as formatTaskList,
  formatTaskDetail as formatTask
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

// Helper function to launch Claude for task finishing
async function launchClaudeFinish(taskId: string, mergePreference: string, worktreeDir: string) {
  // Create context for Claude
  const context = {
    taskId,
    mergePreference,
    worktreeDir
  };

  // Launch Claude with the task-finish command
  console.log(`Launching Claude to finish task ${taskId}...`);

  try {
    // Launch Claude from the main repository instead of the worktree
    const claudeProcess = Bun.spawn([
      'claude',
      `/project:task-finish ${JSON.stringify(context)}`
    ], {
      stdio: ['inherit', 'inherit', 'inherit'],
      // No cwd specified - will run from current directory (main repository)
    });

    // Wait for Claude process to complete
    await claudeProcess.exited;

    console.log(`Task ${taskId} finishing process completed.`);
    return true;
  } catch (error) {
    console.error('Failed to launch Claude for task finishing:', error);
    return false;
  }
}

// Helper function to update task status
async function updateTaskStatus(taskId: string, worktreeDir: string) {
  const task = await getTask(taskId);

  // Check if already completed
  if (task.success && task.data?.metadata.status === '🟢 Done') {
    console.log('Task already marked as completed');
    return true;
  }

  // Update task
  const result = await updateTask(taskId, {
    metadata: {
      status: '🟢 Done',
      updated_date: new Date().toISOString().split('T')[0]
    }
  });

  if (result.success) {
    // Commit the task status update
    try {
      // Get the relative path from worktree to the task file
      const relativeFilePath = path.relative(REPO_ROOT, result.data.filePath);
      // Add and commit the task status update
      execSync(`cd "${worktreeDir}" && git add "${relativeFilePath}" && git commit -m "Mark task ${taskId} as completed"`, { stdio: 'inherit' });
      return true;
    } catch (error) {
      console.error('Failed to commit task status update:', error);
      return false;
    }
  }

  return false;
}

// Add commands
program
  .command('start')
  .description('Start working on a task in a new worktree')
  .argument('[taskId]', 'Optional task ID to work on')
  .option('-n, --no-claude', 'Do not launch Claude after creating worktree')
  .action(startWorktree);

program
  .command('finish')
  .description('Finish working on a task and merge changes')
  .argument('[taskId]', 'Optional task ID to finish')
  .option('--merge <mode>', 'Merge mode: local or pr', 'ask')
  .action(finishWorktree);

program
  .command('list')
  .description('List all current task worktrees')
  .action(listWorktrees);

// Start command implementation
async function startWorktree(taskId?: string, options?: { claude?: boolean }) {
  const launchClaude = options?.claude !== false;
  
  // If no task ID provided, show available tasks and prompt
  if (!taskId) {
    const tasks = await listTasks({ status: '🟡 To Do' });
    console.log('Available tasks:');
    console.log(formatTaskList(tasks.data || []));

    const nextTask = await findNextTask();
    console.log('\nRecommended next task:');
    if (nextTask.data) {
      console.log(formatTask(nextTask.data));
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
  console.log(`Creating worktree for task: ${taskId} - ${task.title}`);
  
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
    
    // Mark task as in progress
    await updateTask(taskId, { metadata: { status: '🔵 In Progress' } });
    
    console.log(`Worktree created at ${worktreeDir}`);
    
    if (launchClaude) {
      console.log(`Installing dependencies in the worktree directory...`);

      // Install dependencies in the worktree
      execSync('bun install', {
        stdio: 'inherit',
        cwd: worktreeDir
      });

      console.log(`Launching Claude in the worktree directory...`);

      // Use Bun.spawn to change directory and launch Claude
      process.chdir(worktreeDir);

      const claudeProcess = Bun.spawn(['claude', `/project:task-context ${taskId}`], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cwd: worktreeDir,
      });

      // Wait for Claude process to complete
      await claudeProcess.exited;
    } else {
      console.log(`To start working on this task with Claude, run:`);
      console.log(`cd ${worktreeDir} && bun install && claude "/project:task-context ${taskId}"`);
    }
    
  } catch (error) {
    console.error('Error creating worktree:', error);
    process.exit(1);
  }
}

// Finish command implementation
async function finishWorktree(taskId?: string, options?: { merge?: string }) {
  // Check if we're running from a worktree
  const isInWorktree = fs.existsSync('.git') && fs.statSync('.git').isFile() && fs.readFileSync('.git', 'utf8').trim().startsWith('gitdir:');
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

    console.error(`Error: This command should be run from the main repository.`);
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
      const hasChanges = execSync(`cd "${worktreeDir}" && git status --porcelain`).toString().trim() !== '';
      if (hasChanges) {
        console.log('Warning: You have uncommitted changes in the worktree.');
        console.log('Please commit or stash your changes before finishing the worktree.');
        process.exit(1);
      }
    } catch (error) {
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

    // We'll leave worktree removal to a separate cleanup task or to Claude
    // Don't remove the worktree here as Claude needs to run in it
    let worktreeRemoved = false;
    if (!fs.existsSync(worktreeDir)) {
      console.log(`Worktree directory ${worktreeDir} does not exist.`);
    }

    // Get merge preference from options or prompt the user
    let mergePreference = options?.merge || 'ask';

    // If mergePreference is ask, prompt user
    if (mergePreference === 'ask') {
      console.log('Choose a merge option:');
      console.log('1. Local merge directly to main');
      console.log('2. Create a pull request');

      const response = await new Promise<string>(resolve => {
        process.stdin.once('data', data => {
          resolve(data.toString().trim());
        });
      });

      mergePreference = response === '1' ? 'local' : 'pr';
    }

    console.log(`Selected merge option: ${mergePreference}`);

    // Let Claude handle the task status update after merging to avoid merge conflicts
    console.log(`Task status will be updated by Claude after merging to avoid conflicts...`);

    // Check if .claude directory exists
    const claudeDirExists = fs.existsSync('.claude/commands/task-finish.md');
    if (!claudeDirExists) {
      console.log(`Warning: Claude command directory not found. Creating minimal structure...`);
      fs.mkdirSync('.claude/commands', { recursive: true });
      // We've already created the task-finish.md file earlier in this implementation
    }

    // Launch Claude to handle the merge process
    console.log(`Starting automated task completion process...`);
    const claudeSuccess = await launchClaudeFinish(taskId, mergePreference, worktreeDir);

    // If Claude integration failed, provide fallback instructions
    if (!claudeSuccess) {
      console.log(`\nAutomated task completion failed. You can complete the task manually:`);

      if (mergePreference === 'local') {
        console.log(`\nTo merge directly to main, run:`);
        console.log(`git checkout main`);
        console.log(`git merge --no-ff ${taskId}`);
        console.log(`git push origin main`);
      } else {
        console.log(`\nTo create a PR for this branch, run:`);
        console.log(`git push -u origin ${taskId}`);
        console.log(`gh pr create --base main --head ${taskId}`);
      }

      console.log(`\nTo remove the worktree when you're done, run:`);
      console.log(`git worktree remove "${worktreeDir}"`);
    }

    // Claude will handle the worktree cleanup if successful
    console.log(`\nThe worktree will be automatically removed by Claude after successful merge.`);
    
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

// Run the program
program.parse(process.argv);