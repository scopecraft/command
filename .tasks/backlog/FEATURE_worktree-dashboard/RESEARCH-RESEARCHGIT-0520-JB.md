+++
id = "RESEARCH-RESEARCHGIT-0520-JB"
title = "Research Git Worktree Integration with simplegit"
type = "research"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "backlog"
tags = [ "AREA:core", "TaskWorktree" ]
subdirectory = "FEATURE_worktree-dashboard"
+++

# Research Git Worktree Integration with simplegit

This research task will investigate how to effectively implement git worktree operations and monitoring using the simplegit package for the Worktree Dashboard feature.

## WebSearch Queries
- "git worktree operations simplegit js implementation examples"
- "git worktree status monitor node.js 2024"
- "git worktree branch tracking typescript library"
- "efficient git status polling performance 2025"
- "secure git operations via API React web"

## Questions to Answer
- How can we detect and list all active git worktrees for a repository using simplegit?
- What is the most efficient way to extract git status information (changes, branch, commit) for multiple worktrees?
- How can we correlate git branch names with task IDs reliably?
- What are the performance implications of frequently polling git status?
- What security considerations exist when exposing git operations via web APIs?

## Technical Areas to Investigate

### Git Worktree Discovery
- Commands for listing active worktrees
- Parsing worktree output for path, branch, and status information
- Detecting when worktrees are added or removed

### Git Status Monitoring
- Efficient ways to check uncommitted changes
- Retrieving last commit information
- Determining when a worktree was last active

### Status Polling Strategies
- Event-based vs. time-based polling
- Optimal refresh intervals for balancing performance and responsiveness
- Caching strategies to minimize redundant operations

### Security Considerations
- Sanitization of git command inputs
- Limiting API operations to safe, read-only commands
- Handling file system access permissions across operating systems

## Libraries to Evaluate
- simplegit implementation details and limitations
- Alternative libraries if simplegit is insufficient
- Complementary packages for efficient polling and caching

## Reference Implementation

The following script provides a starting point for monitoring git worktrees and can be used as reference for the implementation:

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

### Key Implementation Points to Adapt from Reference

1. **Worktree discovery using `git worktree list --porcelain`**
   - The script already parses the output format correctly
   - Need to adapt this approach to use simplegit instead of direct exec calls

2. **Git status monitoring approach**
   - Uses polling with configurable intervals
   - Includes status change detection to minimize redundant output
   - Has throttling mechanisms for rapid changes

3. **Data model**
   - Defines a Worktree interface that can be reused and expanded
   - Includes methods for handling status, commits, and changes

4. **Error handling**
   - Handles edge cases like non-existent paths
   - Silently handles some errors while logging important ones

## Deliverables
- Documentation of simplegit usage for worktree operations
- Code examples for key operations (discovery, status checking)
- Recommendations for polling frequency and caching strategy
- Security guidelines for git operations via API
- Performance benchmarks for different polling approaches

## Acceptance Criteria
- [ ] Document all necessary git worktree commands and their simplegit equivalents
- [ ] Provide working code examples for worktree discovery and status checking
- [ ] Determine optimal polling strategy with performance considerations
- [ ] Identify security risks and mitigation strategies
- [ ] Make clear recommendations for implementation approach
