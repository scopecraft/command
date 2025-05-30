#!/usr/bin/env bun

import { detached } from 'channelcoder';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseArgs } from 'util';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'log-dir': {
      type: 'string',
      default: '.autonomous-tasks/logs',
    },
    'parallel': {
      type: 'boolean',
      default: false,
    },
    'help': {
      type: 'boolean',
      short: 'h',
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help
if (values.help || positionals.length === 0) {
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Executor${colors.reset}`);
  console.log('\nUsage:');
  console.log('  bun run scripts/implement-autonomous.ts <taskId> [parentId] [options]');
  console.log('\nExamples:');
  console.log('  # Execute a subtask within a parent');
  console.log('  bun run scripts/implement-autonomous.ts 01_investigate-api-05A fix-mcp-api-res-cnsstncy-05A');
  console.log('\n  # Execute a standalone task');
  console.log('  bun run scripts/implement-autonomous.ts fix-typo-bug-05B');
  console.log('\n  # Execute multiple tasks in parallel');
  console.log('  bun run scripts/implement-autonomous.ts task1 task2 task3 --parallel');
  console.log('\nOptions:');
  console.log('  --log-dir <path>  Directory for execution logs (default: .autonomous-tasks/logs)');
  console.log('  --parallel        Execute multiple tasks in parallel');
  console.log('  -h, --help        Show this help message');
  process.exit(0);
}

// Ensure log directory exists
async function ensureLogDir(logDir: string) {
  await fs.mkdir(logDir, { recursive: true });
}

// Generate log filename
function getLogFilename(taskId: string, parentId?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = parentId ? `${parentId}_${taskId}` : taskId;
  return `${prefix}_${timestamp}.log`;
}

// Execute a single task
async function executeTask(taskId: string, parentId?: string, logDir?: string) {
  const logFile = logDir ? path.join(logDir, getLogFilename(taskId, parentId)) : undefined;
  
  console.log(`\n${colors.cyan}Starting autonomous execution:${colors.reset}`);
  console.log(`  Task: ${colors.bright}${taskId}${colors.reset}`);
  if (parentId) {
    console.log(`  Parent: ${colors.bright}${parentId}${colors.reset}`);
  }
  if (logFile) {
    console.log(`  Log: ${colors.dim}${logFile}${colors.reset}`);
  }
  
  try {
    const result = await detached('.tasks/.modes/implement/autonomous.md', {
      data: {
        taskId,
        ...(parentId && { parentId }),
      },
      ...(logFile && { logFile }),
    });
    
    if (result.data?.pid) {
      console.log(`${colors.green}✅ Task started successfully${colors.reset}`);
      console.log(`  PID: ${colors.bright}${result.data.pid}${colors.reset}`);
      console.log(`  Mode: ${colors.yellow}Fully autonomous - no interaction possible${colors.reset}`);
      console.log(`  Output: All updates will be written to the task file itself`);
      
      return { success: true, pid: result.data.pid, taskId, parentId, logFile };
    } else {
      throw new Error('Failed to start task - no PID returned');
    }
  } catch (error) {
    console.error(`${colors.red}❌ Failed to start task:${colors.reset}`, error);
    return { success: false, taskId, parentId, error };
  }
}

// Main execution
async function main() {
  const logDir = values['log-dir'] as string;
  const isParallel = values.parallel;
  
  // Ensure log directory exists if specified
  if (logDir) {
    await ensureLogDir(logDir);
  }
  
  // Parse task arguments
  let tasks: Array<{ taskId: string; parentId?: string }> = [];
  
  if (isParallel) {
    // In parallel mode, each positional is a taskId
    tasks = positionals.map(taskId => ({ taskId }));
  } else {
    // In single mode, first is taskId, second (optional) is parentId
    const [taskId, parentId] = positionals;
    tasks = [{ taskId, parentId }];
  }
  
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Executor${colors.reset}`);
  console.log(`${colors.dim}This executes tasks with no user interaction - all output goes to task files${colors.reset}`);
  
  // Execute tasks
  if (isParallel && tasks.length > 1) {
    console.log(`\n${colors.yellow}Executing ${tasks.length} tasks in parallel...${colors.reset}`);
    
    const promises = tasks.map(({ taskId, parentId }) => 
      executeTask(taskId, parentId, logDir)
    );
    
    const results = await Promise.all(promises);
    
    // Summary
    console.log(`\n${colors.bright}Execution Summary:${colors.reset}`);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
      console.log(`${colors.green}✅ Started: ${successful.length} tasks${colors.reset}`);
      successful.forEach(r => {
        console.log(`   - ${r.taskId} (PID: ${r.pid})`);
      });
    }
    
    if (failed.length > 0) {
      console.log(`${colors.red}❌ Failed: ${failed.length} tasks${colors.reset}`);
      failed.forEach(r => {
        console.log(`   - ${r.taskId}`);
      });
    }
  } else {
    // Single task execution
    const { taskId, parentId } = tasks[0];
    await executeTask(taskId, parentId, logDir);
  }
  
  console.log(`\n${colors.dim}Monitor task progress by checking the task files directly${colors.reset}`);
  console.log(`${colors.dim}Use 'bun run dev:cli task get <taskId>' to view task status${colors.reset}`);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});