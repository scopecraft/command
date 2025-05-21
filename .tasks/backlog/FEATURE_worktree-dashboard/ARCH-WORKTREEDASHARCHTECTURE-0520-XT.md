+++
id = "ARCH-WORKTREEDASHARCHTECTURE-0520-XT"
title = "Worktree Dashboard Architecture Analysis and Design"
type = "architecture"
status = "🟢 Done"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-21"
assigned_to = ""
phase = "backlog"
parent_task = "worktree-dashboard"
tags = [ "AREA:core", "AREA:UI", "AREA:architecture", "TaskWorktree" ]
subdirectory = "FEATURE_worktree-dashboard"
+++

# Architecture Task: Worktree Dashboard Implementation Analysis and Design

## Introduction
This architecture task will analyze the existing worktree dashboard prototype, determine essential functionality for v1, design the necessary services and APIs, and establish implementation priorities.

## Analysis Phase

### Analyze Prototype Implementation
- [x] Review WorktreeCard and WorktreeDashboard component requirements
- [x] Document data fields currently used in UI components
- [x] Identify UI interaction patterns that require backend support
- [x] Analyze refresh patterns and data loading requirements
- [x] Review error handling and edge cases in the prototype

### Map Essential Data Requirements
- [x] Document essential git information needed from simplegit
- [x] Identify which worktree metadata is critical for v1
- [x] Determine minimum task metadata needed from MCP
- [x] Investigate complexity of retrieving detailed tasks under features using rootPath
- [x] Document which UI elements can be simplified or deferred to v2

## Simplegit Capabilities Assessment

### Research Current Git Operation Capabilities
- [x] Review the sample script for applicable patterns
- [x] Research simplegit methods for worktree discovery (`git worktree list --porcelain`)
- [x] Document available methods for status retrieval (`git status --porcelain`)
- [x] Investigate commit history and timestamp retrieval options
- [x] Research branch tracking and remote status detection

### System Integration Evaluation
- [x] Determine how to correlate git branches with task IDs
- [x] Research performance considerations for multiple worktree polling
- [x] Document any limitations in simplegit for worktree operations
- [x] Identify any OS-specific considerations for file paths
- [x] Evaluate error handling patterns for git operations

## Design Phase

### Component Architecture
- [x] Design WorktreeService class structure and responsibilities
- [x] Define data models and interfaces for git operations
- [x] Map integration points between UI components and services
- [x] Design caching strategy for performance optimization
- [x] Document error handling approach

### API Definition
- [x] Define specific API endpoints required for dashboard
- [x] Design request/response schemas for each endpoint
- [x] Map which git operations are needed for each API
- [x] Document direct MCP handler integration approach for task metadata
- [x] Define error response format and status codes

### Integration Strategy
- [x] Document how WorktreeService will interact with simplegit
- [x] Define integration pattern for calling MCP handlers with rootPath
- [x] Design refresh strategy for dashboard data
- [x] Plan how to handle worktree discovery and status detection
- [x] Map task/feature correlation with branch names

## Decision Phase

### v1 Scope Decisions
- [x] Decide on inclusion/exclusion of detailed feature tasks (based on investigation)
- [x] Finalize which status indicators can be implemented for v1
- [x] Determine if any additional UI simplifications are needed
- [x] Decide on refresh rate and polling strategy
- [x] Set performance targets for 5-10 concurrent worktrees

### Implementation Priorities
- [x] Rank API endpoints by implementation priority
- [x] Identify potential technical challenges and risks
- [x] Determine testing strategy for git operations
- [x] Document any security considerations for git access
- [x] Plan phased implementation approach

## Documentation Phase

### Technical Documentation
- [x] Document final architecture decisions with rationale
- [x] Create interface specifications for all components
- [x] Document data flow diagrams for key operations
- [x] Create API specification with examples
- [x] Document caching and performance strategies

### Handoff Materials
- [x] Prepare implementation guidelines for development team
- [x] Document known limitations and v2 considerations
- [x] Create reference links to sample code and examples
- [x] Document test cases for critical functionality
- [x] Prepare architectural review presentation

## Acceptance Criteria
- [x] Complete analysis of prototype with clear v1 requirements
- [x] Defined API specifications with request/response schemas
- [x] Clear decision on inclusion of detailed feature tasks
- [x] Documented integration approach for task metadata via MCP
- [x] Prioritized implementation plan with identified risks
- [x] Technical documentation sufficient for implementation

## Implementation Log

### 2025-05-21: Initial Architecture Analysis

Today I completed a comprehensive architecture analysis for the Worktree Dashboard feature. The work included:

1. Analyzed existing WorktreeCard and WorktreeDashboard components to understand data requirements and UI patterns
2. Examined the sample git operations script for worktree discovery and status monitoring patterns
3. Researched simplegit capabilities for worktree operations, noting that it supports raw git commands execution
4. Designed core data models and interfaces for the WorktreeService
5. Created simple implementation strategies without premature optimization
6. Defined API endpoints and response schemas
7. Documented integration strategies for task metadata
8. Made scope decisions for v1 implementation
9. Prioritized implementation tasks
10. Created comprehensive architecture document at `/docs/worktree-dashboard-architecture.md`

### 2025-05-22: Code Organization and Final Documentation

Completed the architecture document with additional sections:

1. Added a code organization section to define the module structure
2. Recommended organizing files in the `/src/core/worktree` directory following existing patterns
3. Simplified the implementation approach by removing premature optimization (caching)
4. Updated the execution plan with a clear phased approach
5. Added examples of Bun server implementation (instead of Express)
6. Created folder structure recommendations for core, MCP, and UI components
7. Added a sample testing script that leverages core services for easier validation

Files created:
- `/docs/worktree-dashboard-architecture.md` - Comprehensive architecture document

The architecture document now covers all aspects of implementing the feature, including data models, service layer design, API specifications, code organization and integration strategies. The next steps will involve implementing the WorktreeService class and integrating it with the UI components.

### Human Review Required

Implementation decisions to verify:
- [x] Simplified approach without complex caching mechanisms
- [x] Task ID extraction patterns from branch names may need enhancement
- [x] Performance targets (5-10 concurrent worktrees) should be verified in production
- [x] Refresh interval defaults (30 seconds) should be validated with users

Technical assumptions:
- [x] Simplegit raw commands will provide sufficient performance
- [x] Core module structure follows existing patterns
- [x] TaskCorrelationService design fits with broader MCP integration patterns
- [x] Error handling strategy is comprehensive enough for all edge cases
- [x] API security measures will adequately protect against command injection

## References

### Prototype Implementation
Start looking at the following files for the prototype implementation:
- WorktreeCard component: `/src/components/WorktreeCard.tsx`
- WorktreeDashboard component: `/src/components/WorktreeDashboard.tsx`
- Completed feature task: `/.tasks/backlog/FEATURE_worktree-dashboard/FEAT-CREATEWORKTREEDASHBOARD-0520-ZB.md`

### Sample Git Operations Script
```typescript
#!/usr/bin/env bun

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { watch } from 'fs';
import { readFile, stat, readdir } from 'fs/promises';
import { join, basename, dirname } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface Worktree {
  path: string;
  head: string;
  branch: string;
  isBare?: boolean;
}

class ClaudeCodeMonitor {
  private watchers: Map<string, any> = new Map();
  private processCheckInterval: NodeJS.Timeout | null = null;
  private gitCheckInterval: NodeJS.Timeout | null = null;
  private lastCommits: Map<string, string> = new Map();
  private lastClaudeProcesses: Set<string> = new Set();
  private lastGitStatus: Map<string, string> = new Map();
  private fileChangeQueue: Map<string, NodeJS.Timeout> = new Map();
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async start() {
    console.log('🚀 Starting Claude Code Monitor...');
    console.log(`📁 Repository: ${this.repoPath}`);
    
    try {
      const worktrees = await this.discoverWorktrees();
      console.log(`📋 Found ${worktrees.length} worktree(s)`);
      
      for (const worktree of worktrees) {
        await this.setupWorktreeMonitoring(worktree);
      }
      
      this.startProcessMonitoring();
      this.startGitMonitoring(worktrees);
      
      console.log('✅ Monitoring started. Press Ctrl+C to stop.\n');
      
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
      
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      process.exit(1);
    }
  }

  async discoverWorktrees(): Promise<Worktree[]> {
    try {
      const result = await execAsync('git worktree list --porcelain', { cwd: this.repoPath });
      console.log('Raw worktree output:');
      console.log(result.stdout);
      console.log('---');
      return this.parseWorktrees(result.stdout);
    } catch (error) {
      console.error('Failed to list worktrees:', error);
      return [];
    }
  }

  private parseWorktrees(output: string): Worktree[] {
    const lines = output.trim().split('\n');
    const worktrees: Worktree[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('worktree ')) {
        // Extract the path from "worktree /path/to/worktree"
        const path = line.substring(9); // Remove "worktree "
        
        // Get HEAD info (next line)
        const headLine = lines[i + 1] || '';
        let head = '';
        if (headLine.startsWith('HEAD ')) {
          head = headLine.substring(5);
        }
        
        // Get branch info (next line after HEAD)
        const branchLine = lines[i + 2] || '';
        let branch = 'detached';
        if (branchLine.startsWith('branch ')) {
          branch = branchLine.substring(7);
        } else if (branchLine.startsWith('detached')) {
          branch = 'detached';
        }
        
        // Check if path exists before adding
        if (existsSync(path)) {
          worktrees.push({
            path,
            head,
            branch,
            isBare: line.includes('bare')
          });
        } else {
          console.log(`⚠️  Skipping non-existent worktree: ${path}`);
        }
        
        // Skip the processed lines
        i += 2;
      }
    }
    
    return worktrees;
  }

  async setupWorktreeMonitoring(worktree: Worktree) {
    console.log(`🔍 Setting up monitoring for: ${worktree.path} (${worktree.branch})`);
    
    // Verify the worktree path exists
    if (!existsSync(worktree.path)) {
      console.log(`⚠️  Worktree path does not exist: ${worktree.path}`);
      return;
    }
    
    // Watch Claude-specific directories and files
    const watchPaths = [
      join(worktree.path, '.claude'),
      join(worktree.path, 'CLAUDE.md'),
      join(worktree.path, '.mcp.json')
    ];

    for (const path of watchPaths) {
      if (existsSync(path)) {
        try {
          const watcher = watch(path, { recursive: true }, (eventType, filename) => {
            this.handleClaudeFileChange(worktree, eventType, filename);
          });
          this.watchers.set(`${worktree.path}:${path}`, watcher);
        } catch (error) {
          console.log(`⚠️  Could not watch ${path}: ${error.message}`);
        }
      }
    }

    // Watch for general file changes - only if the path exists
    try {
      const generalWatcher = watch(worktree.path, { recursive: true }, (eventType, filename) => {
        if (filename && !filename.startsWith('.git/') && !filename.includes('node_modules/')) {
          this.handleGeneralFileChange(worktree, eventType, filename);
        }
      });
      this.watchers.set(`${worktree.path}:general`, generalWatcher);
    } catch (error) {
      console.log(`⚠️  Could not watch general files in ${worktree.path}: ${error.message}`);
    }

    // Show initial git status
    await this.showInitialGitStatus(worktree);
  }

  private handleClaudeFileChange(worktree: Worktree, eventType: string, filename: string | null) {
    if (!filename) return;
    
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] Claude file ${eventType}: ${filename} in ${worktree.branch}`);
  }

  private handleGeneralFileChange(worktree: Worktree, eventType: string, filename: string) {
    // Throttle rapid changes
    const changeKey = `${worktree.path}:${filename}`;
    
    if (this.fileChangeQueue.has(changeKey)) {
      clearTimeout(this.fileChangeQueue.get(changeKey)!);
    }
    
    this.fileChangeQueue.set(changeKey, setTimeout(() => {
      const timestamp = new Date().toISOString();
      
      // Only log certain file types
      const ext = filename.toLowerCase();
      const isCodeFile = ext.endsWith('.ts') || ext.endsWith('.js') || ext.endsWith('.tsx') || 
                        ext.endsWith('.jsx') || ext.endsWith('.md') || ext.endsWith('.json') ||
                        ext.endsWith('.py') || ext.endsWith('.rs') || ext.endsWith('.go');
      
      if (isCodeFile) {
        console.log(`📄 [${timestamp}] File ${eventType}: ${filename} in ${worktree.branch}`);
      }
      
      this.fileChangeQueue.delete(changeKey);
    }, 1000));
  }

  async showInitialGitStatus(worktree: Worktree) {
    try {
      // Skip detached worktrees without valid paths
      if (worktree.branch === 'detached' && !existsSync(worktree.path)) {
        console.log(`⚠️  Skipping git status for non-existent detached worktree`);
        return;
      }
      
      const result = await execAsync('git status --porcelain', { cwd: worktree.path });
      if (result.stdout.trim()) {
        const changes = result.stdout.trim().split('\n');
        console.log(`📊 [INITIAL] ${worktree.branch} has ${changes.length} uncommitted change(s):`);
        
        for (const change of changes.slice(0, 5)) {
          console.log(`     ${change}`);
        }
        
        if (changes.length > 5) {
          console.log(`     ... and ${changes.length - 5} more file(s)`);
        }
      } else {
        console.log(`✅ [INITIAL] ${worktree.branch} is clean`);
      }
    } catch (error) {
      if (worktree.branch !== 'detached') {
        console.log(`⚠️  Error checking initial git status for ${worktree.branch}: ${error.message}`);
      }
    }
  }

  startProcessMonitoring() {
    this.processCheckInterval = setInterval(async () => {
      await this.checkClaudeProcesses();
    }, 10000);
  }

  async checkClaudeProcesses() {
    try {
      const result = await execAsync('ps aux');
      const processes = result.stdout.split('\n')
        .filter(line => line.includes('claude'))
        .filter(line => !line.includes('grep') && !line.includes('claude-monitor'))
        .filter(line => {
          return line.includes('/bin/claude') || 
                 line.includes('/opt/homebrew/bin/claude') ||
                 (line.includes('claude') && !line.includes('docker') && !line.includes('socat'));
        });

      const currentProcesses = new Set<string>();
      
      for (const proc of processes) {
        const parts = proc.trim().split(/\s+/);
        const pid = parts[1];
        
        try {
          const cwdResult = await execAsync(`lsof -p ${pid} | grep cwd`);
          const workingDir = cwdResult.stdout.split(/\s+/)[8];
          const processKey = `${pid}:${workingDir}`;
          currentProcesses.add(processKey);
          
          if (!this.lastClaudeProcesses.has(processKey)) {
            console.log(`🤖 [${new Date().toISOString()}] New Claude process: PID ${pid} in ${workingDir}`);
          }
        } catch (error) {
          // Skip if can't get working directory
        }
      }
      
      // Check for stopped processes
      for (const oldProcess of this.lastClaudeProcesses) {
        if (!currentProcesses.has(oldProcess)) {
          const [pid, dir] = oldProcess.split(':');
          console.log(`🛑 [${new Date().toISOString()}] Claude process stopped: PID ${pid} in ${dir}`);
        }
      }
      
      this.lastClaudeProcesses = currentProcesses;
    } catch (error) {
      // Silently handle errors
    }
  }

  startGitMonitoring(worktrees: Worktree[]) {
    this.gitCheckInterval = setInterval(async () => {
      for (const worktree of worktrees) {
        await this.checkGitActivity(worktree);
      }
    }, 5000);
  }

  async checkGitActivity(worktree: Worktree) {
    try {
      // Skip detached worktrees without valid paths
      if (worktree.branch === 'detached' && !existsSync(worktree.path)) {
        return;
      }
      
      // Check for uncommited changes
      const result = await execAsync('git status --porcelain', { cwd: worktree.path });
      const statusHash = result.stdout.trim();
      const lastStatus = this.lastGitStatus.get(worktree.path) || '';
      
      // Show periodic status updates
      const now = Date.now();
      const lastCheck = parseInt(this.lastGitStatus.get(`${worktree.path}:lastcheck`) || '0');
      const thirty_seconds_ago = now - (30 * 1000);
      
      if (lastCheck < thirty_seconds_ago && statusHash) {
        const changes = statusHash.split('\n');
        console.log(`🔄 [${new Date().toISOString()}] Status ${worktree.branch}: ${changes.length} uncommitted file(s)`);
        this.lastGitStatus.set(`${worktree.path}:lastcheck`, now.toString());
      }
      
      if (statusHash !== lastStatus) {
        if (statusHash) {
          const changes = statusHash.split('\n');
          console.log(`📝 [${new Date().toISOString()}] Git changes in ${worktree.branch}: ${changes.length} file(s)`);
          
          for (const change of changes.slice(0, 3)) {
            console.log(`     ${change}`);
          }
          
          if (changes.length > 3) {
            console.log(`     ... and ${changes.length - 3} more file(s)`);
          }
        } else if (lastStatus) {
          console.log(`✅ [${new Date().toISOString()}] All changes committed in ${worktree.branch}`);
        }
        
        this.lastGitStatus.set(worktree.path, statusHash);
      }
      
      // Check for new commits
      const commitResult = await execAsync('git log -1 --format="%H"', { cwd: worktree.path });
      const currentHead = commitResult.stdout.trim();
      
      if (this.lastCommits.has(worktree.path)) {
        const lastHead = this.lastCommits.get(worktree.path);
        
        if (lastHead !== currentHead) {
          console.log(`📤 [${new Date().toISOString()}] New commit in ${worktree.branch}!`);
          
          // Get commit info
          const infoResult = await execAsync(
            `git log -1 --format="%s|%an|%ad" ${currentHead}`, 
            { cwd: worktree.path }
          );
          
          const [message, author, date] = infoResult.stdout.trim().split('|');
          console.log(`     📋 Message: "${message}"`);
          console.log(`     👤 Author: ${author}`);
          console.log(`     📅 Date: ${date}`);
        }
      }
      
      this.lastCommits.set(worktree.path, currentHead);
    } catch (error) {
      // Only log errors for non-detached worktrees
      if (worktree.branch !== 'detached') {
        console.log(`⚠️  Git check error for ${worktree.branch}: ${error.message}`);
      }
    }
  }

  stop() {
    console.log('\n🛑 Stopping Claude Code Monitor...');
    
    // Close all file watchers
    for (const [key, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();
    
    // Clear intervals
    if (this.processCheckInterval) {
      clearInterval(this.processCheckInterval);
    }
    
    if (this.gitCheckInterval) {
      clearInterval(this.gitCheckInterval);
    }
    
    console.log('✅ Monitor stopped.');
    process.exit(0);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: bun run claude-monitor.ts <repository-path>');
    process.exit(1);
  }
  
  const repoPath = args[0];
  
  // Verify it's a git repository
  if (!existsSync(join(repoPath, '.git'))) {
    console.error('Error: Not a git repository');
    process.exit(1);
  }
  
  const monitor = new ClaudeCodeMonitor(repoPath);
  await monitor.start();
}

if (import.meta.main) {
  main().catch(console.error);
}
```
