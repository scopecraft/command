#!/usr/bin/env bun

import { session, monitorLog } from 'channelcoder';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseArgs } from 'util';
import { homedir } from 'os';

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
    'help': {
      type: 'boolean',
      short: 'h',
    },
    'continue': {
      type: 'string',
      short: 'c',
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help
if (values.help || (positionals.length === 0 && !values.continue)) {
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Executor${colors.reset}`);
  console.log('\nUsage:');
  console.log('  implement-auto <taskId> [parentId]     Start autonomous task');
  console.log('  implement-auto --continue <taskId>     Continue task with feedback');
  console.log('\nExamples:');
  console.log('  # Execute a subtask within a parent');
  console.log('  implement-auto 01_investigate-api-05A fix-mcp-api-res-cnsstncy-05A');
  console.log('\n  # Execute a standalone task');
  console.log('  implement-auto fix-typo-bug-05B');
  console.log('\n  # Continue a task that needs feedback');
  console.log('  implement-auto --continue 01_investigate-api-05A "Yes, use option 2"');
  console.log('\nOptions:');
  console.log('  -c, --continue <taskId>  Continue existing task with feedback');
  console.log('  -h, --help               Show this help message');
  console.log('\nMonitor tasks with: monitor-auto');
  process.exit(0);
}

// Constants
const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const AUTONOMOUS_BASE_DIR = path.join(PROJECT_ROOT, '.tasks/.autonomous-sessions');
const LOG_DIR = path.join(AUTONOMOUS_BASE_DIR, 'logs');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(LOG_DIR, { recursive: true });
}

// Generate session name from task ID
function getSessionName(taskId: string, parentId?: string): string {
  // Use task ID as the primary identifier
  const base = parentId ? `${taskId}-${parentId}` : taskId;
  // Add timestamp for uniqueness but keep task ID prominent
  return `task-${base}-${Date.now()}`;
}

// Get session info path
function getSessionInfoPath(sessionName: string): string {
  return path.join(AUTONOMOUS_BASE_DIR, `${sessionName}.info.json`);
}

// Save session info for monitor
async function saveSessionInfo(sessionName: string, taskId: string, parentId?: string, logFile?: string) {
  const info = {
    sessionName,
    taskId,
    parentId,
    logFile,
    startTime: new Date().toISOString(),
    status: 'running',
    pid: process.pid,
  };
  
  await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
}

// Load session info
async function loadSessionInfo(taskId: string): Promise<any | null> {
  try {
    // Find the most recent session for this task
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR);
    const infoFiles = files.filter(f => f.includes(`task-${taskId}`) && f.endsWith('.info.json'));
    
    if (infoFiles.length === 0) return null;
    
    // Sort by timestamp (newest first)
    infoFiles.sort((a, b) => b.localeCompare(a));
    
    const content = await fs.readFile(path.join(AUTONOMOUS_BASE_DIR, infoFiles[0]), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Execute a single task
async function executeTask(taskId: string, parentId?: string) {
  const sessionName = getSessionName(taskId, parentId);
  const logFile = path.join(LOG_DIR, `${sessionName}.log`);
  
  console.log(`\n${colors.cyan}Starting autonomous execution:${colors.reset}`);
  console.log(`  Task: ${colors.bright}${taskId}${colors.reset}`);
  if (parentId) {
    console.log(`  Parent: ${colors.bright}${parentId}${colors.reset}`);
  }
  console.log(`  Session: ${colors.dim}${sessionName}${colors.reset}`);
  console.log(`  Log: ${colors.dim}${logFile}${colors.reset}`);
  
  try {
    // Create session with meaningful name
    const s = session({
      name: sessionName,
      autoSave: true,
    });
    
    // Save session info for monitor
    await saveSessionInfo(sessionName, taskId, parentId, logFile);
    
    console.log(`${colors.yellow}Starting detached process...${colors.reset}`);
    
    // Build the prompt with task context
    const promptFile = '.tasks/.modes/implement/autonomous.md';
    
    // Start detached process
    const result = await s.detached(promptFile, {
      data: {
        taskId,
        ...(parentId && { parentId }),
      },
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Task started successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
        
        // Update session info with PID
        const info = await loadSessionInfo(taskId);
        if (info) {
          info.pid = result.pid;
          await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
        }
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      console.log(`  Continue with: ${colors.cyan}implement-auto --continue ${taskId}${colors.reset}`);
      
      return { success: true, taskId, parentId, sessionName, logFile };
    } else {
      console.error(`${colors.red}❌ Failed to start task: ${result.error}${colors.reset}`);
      return { success: false, taskId, parentId, error: result.error };
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Task execution failed:${colors.reset}`, error);
    return { success: false, taskId, parentId, error };
  }
}

// Continue an existing task
async function continueTask(taskId: string, feedback: string) {
  console.log(`\n${colors.cyan}Continuing task:${colors.reset}`);
  console.log(`  Task: ${colors.bright}${taskId}${colors.reset}`);
  
  try {
    // Load session info
    const info = await loadSessionInfo(taskId);
    if (!info) {
      console.error(`${colors.red}❌ No session found for task: ${taskId}${colors.reset}`);
      console.log(`\nHint: Use ${colors.cyan}monitor-auto${colors.reset} to see running tasks`);
      return { success: false, taskId };
    }
    
    console.log(`  Session: ${colors.dim}${info.sessionName}${colors.reset}`);
    
    // Load the session
    const s = await session.load(info.sessionName);
    
    // Create new log file for continuation
    const logFile = path.join(LOG_DIR, `${info.sessionName}-continue-${Date.now()}.log`);
    
    console.log(`${colors.yellow}Continuing session...${colors.reset}`);
    
    // Continue with feedback
    const result = await s.detached(feedback, {
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Task continued successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      
      return { success: true, taskId, sessionName: info.sessionName };
    } else {
      console.error(`${colors.red}❌ Failed to continue task: ${result.error}${colors.reset}`);
      return { success: false, taskId, error: result.error };
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error continuing task:${colors.reset}`, error);
    return { success: false, taskId, error };
  }
}

// Main execution
async function main() {
  // Ensure directories exist
  await ensureDirectories();
  
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Executor${colors.reset}`);
  
  // Handle continue mode
  if (values.continue) {
    const taskId = values.continue as string;
    const feedback = positionals.join(' ') || 'Please continue';
    await continueTask(taskId, feedback);
    return;
  }
  
  // Normal execution mode
  if (positionals.length === 0) {
    console.error(`${colors.red}No task ID provided${colors.reset}`);
    process.exit(1);
  }
  
  const [taskId, parentId] = positionals;
  
  console.log(`${colors.dim}Tasks execute in background - output goes to task files${colors.reset}`);
  
  await executeTask(taskId, parentId);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});