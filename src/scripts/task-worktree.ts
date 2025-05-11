#!/usr/bin/env bun
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { TaskManager } from '../core/task-manager';
import { ProjectConfig } from '../core/project-config';
import { TaskFormatter } from '../core/formatters';

// Initialize command structure
const program = new Command();
program
  .name('task-worktree')
  .description('Specialized CLI for task worktree management in roo-task-cli');

// Base paths
const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const WORKTREES_DIR = path.resolve(path.dirname(REPO_ROOT), 'roo-task-cli.worktrees');

// Initialize task manager
const projectConfig = new ProjectConfig();
const taskManager = new TaskManager(projectConfig);
const formatter = new TaskFormatter();

// Add commands
program
  .command('start')
  .description('Start working on a task in a new worktree')
  .argument('[taskId]', 'Optional task ID to work on')
  .option('-n, --no-claude', 'Do not launch Claude after creating worktree')
  .action(startWorktree);

program
  .command('finish')
  .description('Finish working on a task and clean up the worktree')
  .argument('[taskId]', 'Optional task ID to finish')
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
    const tasks = await taskManager.listTasks({ status: '🟡 To Do' });
    console.log('Available tasks:');
    console.log(formatter.formatTaskList(tasks.data || []));
    
    const nextTask = await taskManager.getNextTask();
    console.log('\nRecommended next task:');
    if (nextTask.data) {
      console.log(formatter.formatTask(nextTask.data));
    } else {
      console.log('No next task found.');
    }
    
    // In the actual implementation, we would prompt for input
    // But for now, let's just throw an error
    throw new Error('Please provide a task ID when running this command');
  }
  
  // Get task details
  const taskResult = await taskManager.getTask(taskId);
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
    await taskManager.updateTask(taskId, { status: '🔵 In Progress' });
    
    console.log(`Worktree created at ${worktreeDir}`);
    
    if (launchClaude) {
      console.log(`Launching Claude in the worktree directory...`);
      
      // Use Bun.spawn to change directory and launch Claude
      process.chdir(worktreeDir);
      
      const claudeProcess = Bun.spawn(['claude'], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cwd: worktreeDir,
      });
      
      // Wait for Claude process to complete
      await claudeProcess.exited;
    } else {
      console.log(`To start working on this task with Claude, run:`);
      console.log(`cd ${worktreeDir} && claude`);
      console.log(`Then use the slash command: /project:task-context ${taskId}`);
    }
    
  } catch (error) {
    console.error('Error creating worktree:', error);
    process.exit(1);
  }
}

// Finish command implementation
async function finishWorktree(taskId?: string) {
  // If no task ID provided, try to determine from current directory
  if (!taskId) {
    const currentDir = path.basename(process.cwd());
    // Simple check if we're in a worktree
    if (fs.existsSync('.git') && fs.existsSync(path.join(REPO_ROOT, '.git/worktrees', currentDir))) {
      taskId = currentDir;
    } else {
      console.error('Error: Not in a task worktree directory. Please provide a task ID.');
      process.exit(1);
    }
  }
  
  console.log(`Finishing worktree for task: ${taskId}`);
  
  // Check for uncommitted changes
  const hasChanges = execSync('git status --porcelain').toString().trim() !== '';
  if (hasChanges) {
    console.log('Warning: You have uncommitted changes.');
    console.log('Please commit or stash your changes before finishing the worktree.');
    process.exit(1);
  }
  
  // Check if branch exists
  const branchExists = execSync(`git branch --list ${taskId}`).toString().trim() !== '';
  if (!branchExists) {
    console.error(`Branch ${taskId} does not exist.`);
    process.exit(1);
  }
  
  try {
    // Get task details
    const taskResult = await taskManager.getTask(taskId);
    if (!taskResult.success || !taskResult.data) {
      console.error(`Task ${taskId} not found.`);
      process.exit(1);
    }
    
    // Remove worktree
    const worktreeDir = path.join(WORKTREES_DIR, taskId);
    execSync(`git worktree remove "${worktreeDir}"`);
    
    // Ask what to do with the task
    console.log('Choose an action for the task:');
    console.log('1. Mark as Done');
    console.log('2. Mark as In Review');
    console.log('3. Leave task status unchanged');
    
    // In an interactive CLI we would prompt for input
    // For now, we'll just mark it as Done
    await taskManager.updateTask(taskId, { status: '🟢 Done' });
    
    console.log(`Worktree for task ${taskId} has been removed.`);
    console.log(`Task ${taskId} has been marked as Done.`);
    console.log(`\nTo create a PR for this branch, run:`);
    console.log(`git push -u origin ${taskId}`);
    console.log(`gh pr create --base main --head ${taskId}`);
    
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