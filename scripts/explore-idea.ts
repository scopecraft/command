#!/usr/bin/env bun

import { detached } from 'channelcoder';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import * as readline from 'readline';

// Types
interface IdeaJob {
  id: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  pid?: number;
  taskId?: string;  // Scopecraft task ID once created
  startTime?: number;
  endTime?: number;
  logFile?: string;
}

// In-memory state (no persistence)
let jobQueue: IdeaJob[] = [];
let parallelism = 3;
let jobCounter = 0;

// Directories (still need these for logs)
const JOBS_DIR = '.idea-explorer/jobs';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Clear screen
function clearScreen() {
  console.clear();
  console.log('\x1b[H\x1b[2J');
}

// Ensure log directory exists
async function ensureLogDir() {
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

// Process job
async function processJob(job: IdeaJob): Promise<number | undefined> {
  const jobDir = path.join(JOBS_DIR, job.id);
  await fs.mkdir(jobDir, { recursive: true });
  
  const logFile = path.join(jobDir, 'output.log');
  job.logFile = logFile;

  const result = await detached('scripts/prompts/explore-idea.md', {
    data: {
      ideaDescription: job.description,
    },
    logFile,
  });
  
  return result.data?.pid;
}

// Format job status line
function formatJob(job: IdeaJob): string {
  const icon = {
    queued: '⏳',
    running: '⚡',
    completed: '✅',
    failed: '❌',
  }[job.status];
  
  const color = {
    queued: colors.yellow,
    running: colors.blue,
    completed: colors.green,
    failed: colors.red,
  }[job.status];
  
  // Build status info
  let statusInfo = job.status.padEnd(10);
  
  // Add task ID if available
  if (job.taskId) {
    statusInfo += ` ${colors.cyan}[${job.taskId}]${colors.reset}`;
  }
  
  // Add timing info
  if (job.status === 'running' && job.startTime) {
    const elapsed = Math.floor((Date.now() - job.startTime) / 1000);
    statusInfo += ` ${colors.dim}(${elapsed}s)${colors.reset}`;
  } else if (job.status === 'completed' && job.startTime && job.endTime) {
    const duration = Math.floor((job.endTime - job.startTime) / 1000);
    statusInfo += ` ${colors.dim}(${duration}s)${colors.reset}`;
  }
  
  // Truncate description for display
  const displayDesc = job.description.length > 40 
    ? job.description.substring(0, 40) + '...'
    : job.description;
  
  return `  ${icon} ${color}${displayDesc.padEnd(45)}${colors.reset} ${statusInfo}`;
}

// Display UI
function displayUI() {
  clearScreen();
  
  // Header
  console.log(`${colors.cyan}${colors.bright}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}│          🚀 Idea Explorer - Job Queue               │${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}└─────────────────────────────────────────────────────┘${colors.reset}`);
  
  // Refresh indicator
  const now = new Date().toLocaleTimeString();
  console.log(`${colors.dim}Auto-refresh: ON (pauses while typing) | Last update: ${now}${colors.reset}`);
  
  // Stats
  const stats = {
    queued: jobQueue.filter(j => j.status === 'queued').length,
    running: jobQueue.filter(j => j.status === 'running').length,
    completed: jobQueue.filter(j => j.status === 'completed').length,
  };
  
  console.log(`\n${colors.bright}Status:${colors.reset} Queue: ${colors.yellow}${stats.queued}${colors.reset} | Running: ${colors.blue}${stats.running}/${parallelism}${colors.reset} | Done: ${colors.green}${stats.completed}${colors.reset}\n`);
  
  // Queue
  console.log(`${colors.bright}Jobs:${colors.reset}`);
  if (jobQueue.length === 0) {
    console.log(`${colors.dim}  No jobs in queue${colors.reset}`);
  } else {
    jobQueue.forEach(job => console.log(formatJob(job)));
  }
  
  // Commands
  console.log(`\n${colors.bright}Commands:${colors.reset}`);
  console.log(`  ${colors.green}Type any text${colors.reset} - Submit a new idea`);
  console.log(`  ${colors.yellow}/refresh${colors.reset} or ${colors.yellow}/r${colors.reset} - Refresh display`);
  console.log(`  ${colors.blue}/parallel <n>${colors.reset} - Set parallelism (current: ${parallelism})`);
  console.log(`  ${colors.red}/clear${colors.reset} - Clear completed jobs`);
  console.log(`  ${colors.dim}/quit${colors.reset} - Exit`);
  console.log(`\n> `);
}

// Process queue
async function processQueue() {
  const running = jobQueue.filter(j => j.status === 'running');
  const queued = jobQueue.filter(j => j.status === 'queued');
  
  if (running.length < parallelism && queued.length > 0) {
    const job = queued[0];
    job.status = 'running';
    job.startTime = Date.now();
    
    const pid = await processJob(job);
    if (pid) {
      job.pid = pid;
    }
  }
}

// Check for completed jobs
async function checkCompletedJobs() {
  for (const job of jobQueue.filter(j => j.status === 'running')) {
    if (job.logFile && existsSync(job.logFile)) {
      try {
        const content = await fs.readFile(job.logFile, 'utf-8');
        if (content.includes('"type":"result"')) {
          job.status = 'completed';
          job.endTime = Date.now();
          
          // Try to extract task ID - Scopecraft format: FEAT-WORD-MMDD-XX
          const taskIdMatch = content.match(/(FEAT-[A-Z]+-\d{4}-[A-Z0-9]{2}|TASK-[A-Z]+-\d{3}|BUG-[A-Z]+-\d{3}|CHORE-[A-Z]+-\d{3}|SPIKE-[A-Z]+-\d{3}|TEST-[A-Z]+-\d{3})/);
          if (taskIdMatch) {
            job.taskId = taskIdMatch[0];
          }
        }
      } catch {}
    }
  }
}

// Main loop
async function main() {
  await ensureLogDir();
  
  // Handle command line args
  const args = process.argv.slice(2);
  if (args.length > 0 && !args[0].startsWith('-')) {
    // Single idea from command line
    const description = args.join(' ');
    console.log(`🚀 Processing idea: ${description}\n`);
    
    const job: IdeaJob = {
      id: `idea-${++jobCounter}`,
      description,
      status: 'running',
      startTime: Date.now(),
    };
    
    const pid = await processJob(job);
    if (pid) {
      console.log(`✅ Started processing (PID: ${pid})`);
      console.log(`📁 Log file: ${job.logFile}`);
    }
    return;
  }
  
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  // Background processing
  const processInterval = setInterval(processQueue, 2000);
  const checkInterval = setInterval(checkCompletedJobs, 3000);
  
  // Auto-refresh with smart detection
  let lastRefresh = Date.now();
  const refreshInterval = setInterval(() => {
    // Only refresh if readline prompt is empty
    // @ts-ignore - accessing private property but it works
    const currentLine = rl.line || '';
    
    if (currentLine.length === 0) {
      displayUI();
      lastRefresh = Date.now();
    }
  }, 10000);
  
  // Initial display
  displayUI();
  
  // Command loop
  rl.on('line', async (input) => {
    const trimmed = input.trim();
    
    // Check if it's a slash command
    if (trimmed.startsWith('/')) {
      const [cmd, ...args] = trimmed.substring(1).split(' ');
      
      switch (cmd) {
        case 'refresh':
        case 'r':
        case 'status':
          // Just refresh - displayUI() will be called at the end
          break;
          
        case 'parallel':
        case 'p':
          if (args[0]) {
            const n = parseInt(args[0]);
            if (n > 0 && n <= 10) {
              parallelism = n;
              console.log(`${colors.green}✓ Parallelism set to ${n}${colors.reset}`);
            }
          } else {
            console.log(`${colors.yellow}Current parallelism: ${parallelism}${colors.reset}`);
          }
          break;
          
        case 'clear':
        case 'c':
          jobQueue = jobQueue.filter(j => j.status !== 'completed');
          console.log(`${colors.green}✓ Cleared completed jobs${colors.reset}`);
          break;
          
        case 'quit':
        case 'q':
        case 'exit':
          clearInterval(processInterval);
          clearInterval(checkInterval);
          clearInterval(refreshInterval);
          rl.close();
          process.exit(0);
          
        default:
          console.log(`${colors.red}Unknown command: /${cmd}${colors.reset}`);
      }
    } else if (trimmed.length > 0) {
      // Any non-slash text is treated as a new idea
      jobQueue.push({
        id: `idea-${++jobCounter}`,
        description: trimmed,
        status: 'queued',
      });
      
      const preview = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;
      console.log(`${colors.green}✓ Added idea: ${preview}${colors.reset}`);
    }
    
    // Refresh display
    displayUI();
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(processInterval);
    clearInterval(checkInterval);
    clearInterval(refreshInterval);
    rl.close();
    process.exit(0);
  });
}

// Run
main().catch(console.error);