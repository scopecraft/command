#!/usr/bin/env bun

import { session } from 'channelcoder';
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
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Creator${colors.reset}`);
  console.log('\nUsage:');
  console.log('  task-create <description>              Create task with auto-classification');
  console.log('  task-create --continue <session>       Continue task creation with feedback');
  console.log('\nExamples:');
  console.log('  # Create a feature task');
  console.log('  task-create "Add OAuth support to the CLI"');
  console.log('\n  # Create a bug task');
  console.log('  task-create "Fix status field not updating in MCP responses"');
  console.log('\n  # Continue if it needs feedback');
  console.log('  task-create --continue task-add-oauth-support-to-1234567890');
  console.log('\nOptions:');
  console.log('  -c, --continue <session>  Continue existing task creation with feedback');
  console.log('  -h, --help                Show this help message');
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

// Generate session name from description
function getSessionName(description: string): string {
  const sanitized = description.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `task-${sanitized}-${Date.now()}`;
}

// Get session info path
function getSessionInfoPath(sessionName: string): string {
  return path.join(AUTONOMOUS_BASE_DIR, `${sessionName}.info.json`);
}

// Save session info for monitor
async function saveSessionInfo(sessionName: string, description: string, logFile?: string) {
  const info = {
    sessionName,
    taskDescription: description,
    logFile,
    startTime: new Date().toISOString(),
    status: 'running',
    pid: process.pid,
    type: 'task-creator',
  };
  
  await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
}

// Load session info
async function loadSessionInfo(sessionName: string): Promise<any | null> {
  try {
    const content = await fs.readFile(getSessionInfoPath(sessionName), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Execute task creation
async function createTask(description: string) {
  const sessionName = getSessionName(description);
  const logFile = path.join(LOG_DIR, `${sessionName}.log`);
  
  console.log(`\n${colors.cyan}Starting autonomous task creation:${colors.reset}`);
  console.log(`  Description: ${colors.bright}${description}${colors.reset}`);
  console.log(`  Session: ${colors.dim}${sessionName}${colors.reset}`);
  console.log(`  Log: ${colors.dim}${logFile}${colors.reset}`);
  
  try {
    // Create session with meaningful name
    const s = session({
      name: sessionName,
      autoSave: true,
    });
    
    // Save session info for monitor
    await saveSessionInfo(sessionName, description, logFile);
    
    console.log(`${colors.yellow}Starting detached process...${colors.reset}`);
    
    // Use the enhanced explore-idea prompt
    const promptFile = 'scripts/prompts/task-creator-enhanced.md';
    
    // Start detached process
    const result = await s.detached(promptFile, {
      data: {
        ideaDescription: description,  // Keep same variable name as explore-idea
      },
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Task creation started successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
        
        // Update session info with PID
        const info = await loadSessionInfo(sessionName);
        if (info) {
          info.pid = result.pid;
          await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
        }
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      console.log(`  Continue with: ${colors.cyan}task-create --continue ${sessionName}${colors.reset}`);
      
      return { success: true, description, sessionName, logFile };
    } else {
      console.error(`${colors.red}❌ Failed to start task creation: ${result.error}${colors.reset}`);
      return { success: false, description, error: result.error };
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Task creation failed:${colors.reset}`, error);
    return { success: false, description, error };
  }
}

// Continue an existing task creation
async function continueTaskCreation(sessionName: string, feedback: string) {
  console.log(`\n${colors.cyan}Continuing task creation:${colors.reset}`);
  console.log(`  Session: ${colors.bright}${sessionName}${colors.reset}`);
  
  try {
    // Load session info
    const info = await loadSessionInfo(sessionName);
    if (!info) {
      console.error(`${colors.red}❌ No session found: ${sessionName}${colors.reset}`);
      console.log(`\nHint: Use ${colors.cyan}monitor-auto${colors.reset} to see running sessions`);
      return { success: false, sessionName };
    }
    
    // Load the session
    const s = await session.load(sessionName);
    
    // Create new log file for continuation
    const logFile = path.join(LOG_DIR, `${sessionName}-continue-${Date.now()}.log`);
    
    console.log(`${colors.yellow}Continuing session...${colors.reset}`);
    
    // Continue with feedback
    const result = await s.detached(feedback, {
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Task creation continued successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      
      return { success: true, sessionName };
    } else {
      console.error(`${colors.red}❌ Failed to continue task creation: ${result.error}${colors.reset}`);
      return { success: false, sessionName, error: result.error };
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error continuing task creation:${colors.reset}`, error);
    return { success: false, sessionName, error };
  }
}

// Main execution
async function main() {
  // Ensure directories exist
  await ensureDirectories();
  
  console.log(`${colors.cyan}${colors.bright}Autonomous Task Creator${colors.reset}`);
  
  // Handle continue mode
  if (values.continue) {
    const sessionName = values.continue as string;
    const feedback = positionals.join(' ') || 'Please continue';
    await continueTaskCreation(sessionName, feedback);
    return;
  }
  
  // Normal execution mode
  if (positionals.length === 0) {
    console.error(`${colors.red}No task description provided${colors.reset}`);
    process.exit(1);
  }
  
  const description = positionals.join(' ');
  
  console.log(`${colors.dim}Task creation executes in background - output goes to task files${colors.reset}`);
  
  await createTask(description);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});