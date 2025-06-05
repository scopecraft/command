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
    'interactive': {
      type: 'boolean',
      short: 'i',
    },
  },
  strict: true,
  allowPositionals: true,
});

// Show help
if (values.help || positionals.length === 0) {
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Executor${colors.reset}`);
  console.log('\nUsage:');
  console.log('  auto <taskId> [parentId]           Execute a task autonomously');
  console.log('  auto --continue <taskId>           Continue task execution');
  console.log('\nExamples:');
  console.log('  # Execute a standalone task');
  console.log('  auto implement-auth-05A');
  console.log('\n  # Execute a subtask with parent context');
  console.log('  auto 02_desg-ui-appr-06E ui-redesign-06A');
  console.log('\n  # Continue execution after manual intervention');
  console.log('  auto --continue implement-auth-05A');
  console.log('\nOptions:');
  console.log('  -c, --continue <taskId>    Continue existing execution');
  console.log('  -i, --interactive          Run in interactive mode (monitor and steer)');
  console.log('  -h, --help                 Show this help message');
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
function getSessionName(taskId: string): string {
  return `auto-${taskId}-${Date.now()}`;
}

// Get session info path
function getSessionInfoPath(sessionName: string): string {
  return path.join(AUTONOMOUS_BASE_DIR, `${sessionName}.info.json`);
}

// Save session info for monitor
async function saveSessionInfo(sessionName: string, taskId: string, parentId: string | undefined, logFile?: string) {
  const info = {
    sessionName,
    taskId,
    parentId,
    logFile,
    startTime: new Date().toISOString(),
    status: 'running',
    pid: process.pid,
    type: 'autonomous-task',
  };
  
  await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
}

// Load session info
async function loadSessionInfo(taskId: string): Promise<any | null> {
  try {
    // Find the most recent autonomous session for this task
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR);
    const infoFiles = files.filter(f => 
      f.includes(`auto-${taskId}`) && f.endsWith('.info.json')
    );
    
    if (infoFiles.length === 0) return null;
    
    // Sort by timestamp (newest first)
    infoFiles.sort((a, b) => b.localeCompare(a));
    
    const content = await fs.readFile(path.join(AUTONOMOUS_BASE_DIR, infoFiles[0]), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Execute autonomous task
async function executeTask(taskId: string, parentId?: string, interactive: boolean = false) {
  const sessionName = getSessionName(taskId);
  const logFile = path.join(LOG_DIR, `${sessionName}.log`);
  
  console.log(`\n${colors.cyan}Starting ${interactive ? 'interactive' : 'autonomous'} task execution:${colors.reset}`);
  console.log(`  Task: ${colors.bright}${taskId}${colors.reset}`);
  if (parentId) {
    console.log(`  Parent: ${colors.dim}${parentId}${colors.reset}`);
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
    
    console.log(`${colors.yellow}Starting task execution...${colors.reset}`);
    
    // Build the prompt with task context
    const promptFile = '.tasks/.modes/orchestration/autonomous.md';
    
    if (interactive) {
      // Run in interactive mode
      const result = await s.interactive(promptFile, {
        data: {
          taskId,
          parentId,
        },
        logFile,
        stream: true,
        outputFormat: 'stream-json',
      });
      
      if (result.success) {
        console.log(`${colors.green}✅ Interactive session completed${colors.reset}`);
        return { success: true, taskId, parentId, sessionName, logFile };
      } else {
        console.error(`${colors.red}❌ Interactive session failed: ${result.error}${colors.reset}`);
        return { success: false, taskId, error: result.error };
      }
    } else {
      // Start detached process
      const result = await s.detached(promptFile, {
        data: {
          taskId,
          parentId,
        },
        logFile,
        stream: true,
        outputFormat: 'stream-json',
      });
      
      if (result.success) {
        console.log(`${colors.green}✅ Task execution started successfully${colors.reset}`);
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
        console.log(`  Continue with: ${colors.cyan}auto --continue ${taskId}${colors.reset}`);
        
        return { success: true, taskId, parentId, sessionName, logFile };
      } else {
        console.error(`${colors.red}❌ Failed to start task execution: ${result.error}${colors.reset}`);
        return { success: false, taskId, error: result.error };
      }
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Task execution failed:${colors.reset}`, error);
    return { success: false, taskId, error };
  }
}

// Continue task execution
async function continueTask(taskId: string) {
  console.log(`\n${colors.cyan}Continuing task execution:${colors.reset}`);
  console.log(`  Task: ${colors.bright}${taskId}${colors.reset}`);
  
  try {
    // Load session info
    const info = await loadSessionInfo(taskId);
    if (!info) {
      console.error(`${colors.red}❌ No execution session found for task: ${taskId}${colors.reset}`);
      console.log(`\nHint: Use ${colors.cyan}monitor-auto${colors.reset} to see running sessions`);
      return { success: false, taskId };
    }
    
    console.log(`  Session: ${colors.dim}${info.sessionName}${colors.reset}`);
    
    // Load the session
    const s = await session.load(info.sessionName);
    
    // Create new log file for continuation
    const logFile = path.join(LOG_DIR, `${info.sessionName}-continue-${Date.now()}.log`);
    
    console.log(`${colors.yellow}Continuing task execution...${colors.reset}`);
    
    // Continue execution
    const result = await s.detached("Continue task execution from where you left off", {
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Execution continued successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      
      return { success: true, taskId, sessionName: info.sessionName };
    } else {
      console.error(`${colors.red}❌ Failed to continue execution: ${result.error}${colors.reset}`);
      return { success: false, taskId, error: result.error };
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error continuing execution:${colors.reset}`, error);
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
    await continueTask(taskId);
    return;
  }
  
  // Normal execution mode
  const taskId = positionals[0];
  const parentId = positionals[1];
  const interactive = values.interactive as boolean;
  
  if (!interactive) {
    console.log(`${colors.dim}Execution runs in background - check task for updates${colors.reset}`);
  }
  
  await executeTask(taskId, parentId, interactive);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});