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
if (values.help || positionals.length === 0) {
  console.log(`${colors.cyan}${colors.bright}Autonomous Orchestration Executor${colors.reset}`);
  console.log('\nUsage:');
  console.log('  orchestrate-auto <parentId>           Start orchestration');
  console.log('  orchestrate-auto --continue <parentId> Continue orchestration');
  console.log('\nExamples:');
  console.log('  # Start orchestrating a parent task');
  console.log('  orchestrate-auto ui-redesign-06A');
  console.log('\n  # Continue orchestration after manual intervention');
  console.log('  orchestrate-auto --continue ui-redesign-06A');
  console.log('\nOptions:');
  console.log('  -c, --continue <parentId>  Continue existing orchestration');
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

// Generate session name from parent ID
function getSessionName(parentId: string): string {
  return `orchestrate-${parentId}-${Date.now()}`;
}

// Get session info path
function getSessionInfoPath(sessionName: string): string {
  return path.join(AUTONOMOUS_BASE_DIR, `${sessionName}.info.json`);
}

// Save session info for monitor
async function saveSessionInfo(sessionName: string, parentId: string, logFile?: string) {
  const info = {
    sessionName,
    parentId,
    logFile,
    startTime: new Date().toISOString(),
    status: 'running',
    pid: process.pid,
    type: 'orchestration',
  };
  
  await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
}

// Load session info
async function loadSessionInfo(parentId: string): Promise<any | null> {
  try {
    // Find the most recent orchestration session for this parent
    const files = await fs.readdir(AUTONOMOUS_BASE_DIR);
    const infoFiles = files.filter(f => 
      f.includes(`orchestrate-${parentId}`) && f.endsWith('.info.json')
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

// Execute orchestration
async function executeOrchestration(parentId: string) {
  const sessionName = getSessionName(parentId);
  const logFile = path.join(LOG_DIR, `${sessionName}.log`);
  
  console.log(`\n${colors.cyan}Starting autonomous orchestration:${colors.reset}`);
  console.log(`  Parent: ${colors.bright}${parentId}${colors.reset}`);
  console.log(`  Session: ${colors.dim}${sessionName}${colors.reset}`);
  console.log(`  Log: ${colors.dim}${logFile}${colors.reset}`);
  
  try {
    // Create session with meaningful name
    const s = session({
      name: sessionName,
      autoSave: true,
    });
    
    // Save session info for monitor
    await saveSessionInfo(sessionName, parentId, logFile);
    
    console.log(`${colors.yellow}Starting orchestration process...${colors.reset}`);
    
    // Build the prompt with parent context
    const promptFile = '.tasks/.modes/orchestration/autonomous.md';
    
    // Start detached process
    const result = await s.detached(promptFile, {
      data: {
        parentId,
      },
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Orchestration started successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
        
        // Update session info with PID
        const info = await loadSessionInfo(parentId);
        if (info) {
          info.pid = result.pid;
          await fs.writeFile(getSessionInfoPath(sessionName), JSON.stringify(info, null, 2));
        }
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      console.log(`  Continue with: ${colors.cyan}orchestrate-auto --continue ${parentId}${colors.reset}`);
      
      return { success: true, parentId, sessionName, logFile };
    } else {
      console.error(`${colors.red}❌ Failed to start orchestration: ${result.error}${colors.reset}`);
      return { success: false, parentId, error: result.error };
    }
  } catch (error) {
    console.error(`\n${colors.red}❌ Orchestration execution failed:${colors.reset}`, error);
    return { success: false, parentId, error };
  }
}

// Continue orchestration
async function continueOrchestration(parentId: string) {
  console.log(`\n${colors.cyan}Continuing orchestration:${colors.reset}`);
  console.log(`  Parent: ${colors.bright}${parentId}${colors.reset}`);
  
  try {
    // Load session info
    const info = await loadSessionInfo(parentId);
    if (!info) {
      console.error(`${colors.red}❌ No orchestration session found for parent: ${parentId}${colors.reset}`);
      console.log(`\nHint: Use ${colors.cyan}monitor-auto${colors.reset} to see running sessions`);
      return { success: false, parentId };
    }
    
    console.log(`  Session: ${colors.dim}${info.sessionName}${colors.reset}`);
    
    // Load the session
    const s = await session.load(info.sessionName);
    
    // Create new log file for continuation
    const logFile = path.join(LOG_DIR, `${info.sessionName}-continue-${Date.now()}.log`);
    
    console.log(`${colors.yellow}Continuing orchestration...${colors.reset}`);
    
    // Continue orchestration
    const result = await s.detached("Continue orchestration from where you left off", {
      logFile,
      stream: true,
      outputFormat: 'stream-json',
    });
    
    if (result.success) {
      console.log(`${colors.green}✅ Orchestration continued successfully${colors.reset}`);
      if (result.pid) {
        console.log(`  PID: ${result.pid}`);
      }
      console.log(`  Monitor with: ${colors.cyan}monitor-auto${colors.reset}`);
      
      return { success: true, parentId, sessionName: info.sessionName };
    } else {
      console.error(`${colors.red}❌ Failed to continue orchestration: ${result.error}${colors.reset}`);
      return { success: false, parentId, error: result.error };
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error continuing orchestration:${colors.reset}`, error);
    return { success: false, parentId, error };
  }
}

// Main execution
async function main() {
  // Ensure directories exist
  await ensureDirectories();
  
  console.log(`${colors.cyan}${colors.bright}Autonomous Orchestration Executor${colors.reset}`);
  
  // Handle continue mode
  if (values.continue) {
    const parentId = values.continue as string;
    await continueOrchestration(parentId);
    return;
  }
  
  // Normal execution mode
  const parentId = positionals[0];
  
  console.log(`${colors.dim}Orchestration runs in background - check parent task for updates${colors.reset}`);
  
  await executeOrchestration(parentId);
}

// Run
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});