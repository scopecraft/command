#!/usr/bin/env bun

import { join } from 'path';
import { execSync } from 'child_process';
import { WorktreeService, Worktree, WorktreeStatus, TaskCorrelationService } from '../src/core/worktree/index.js';

/**
 * Simple CLI monitor that uses WorktreeService
 */
class WorktreeMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private worktreeService: WorktreeService;
  private taskCorrelationService: TaskCorrelationService;
  private lastState: Map<string, string> = new Map();
  
  constructor(repoPath: string) {
    this.worktreeService = new WorktreeService(repoPath);
    this.taskCorrelationService = new TaskCorrelationService(this.worktreeService);
  }
  
  async start() {
    console.log('🚀 Starting Worktree Monitor...');
    console.log(`📁 Repository: ${this.worktreeService.getRepositoryPath()}`);
    
    try {
      // Initial discovery
      const worktrees = await this.worktreeService.listWorktrees(false);
      console.log(`📋 Found ${worktrees.length} worktree(s)`);
      
      // Correlate with task metadata
      const correlatedWorktrees = await this.taskCorrelationService.correlateWorktreesWithTasks(worktrees);
      
      // Display initial status
      for (const worktree of correlatedWorktrees) {
        await this.displayWorktreeInfo(worktree);
      }
      
      // Start polling for changes
      this.intervalId = setInterval(async () => {
        await this.checkForChanges();
      }, 5000);
      
      console.log('✅ Monitoring started. Press Ctrl+C to stop.\n');
      
      // Handle termination
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
      
      // This approach keeps the process alive
      return new Promise<void>(() => {
        // This promise intentionally never resolves, keeping the process alive
        // until SIGINT or SIGTERM is received
        
        // Log a status message every 5 minutes to show we're still running
        setInterval(() => {
          const now = new Date().toISOString();
          console.log(`[${now}] Monitor active - watching ${this.lastState.size} worktrees`);
        }, 5 * 60 * 1000);
      });
      
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      process.exit(1);
    }
  }
  
  private async displayWorktreeInfo(worktree: Worktree) {
    const statusEmoji = this.getStatusEmoji(worktree.status);
    console.log(`${statusEmoji} Worktree: ${worktree.path}`);
    console.log(`   Branch: ${worktree.branch}`);
    console.log(`   Commit: ${worktree.headCommit.substring(0, 7)}`);
    
    if (worktree.taskId) {
      console.log(`   Task: ${worktree.taskId} - ${worktree.taskTitle || 'Unknown'}`);
      if (worktree.taskStatus) {
        console.log(`   Status: ${worktree.taskStatus}`);
      }
    }
    
    if (worktree.changedFiles && worktree.changedFiles.length > 0) {
      console.log(`   Changes: ${worktree.changedFiles.length} file(s)`);
      for (const file of worktree.changedFiles.slice(0, 3)) {
        console.log(`     ${file.status[0].toUpperCase()} ${file.path}`);
      }
      if (worktree.changedFiles.length > 3) {
        console.log(`     ... and ${worktree.changedFiles.length - 3} more`);
      }
    }
    
    if (worktree.featureProgress) {
      const progress = worktree.featureProgress;
      const total = progress.totalTasks;
      const completed = progress.completed;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      console.log(`   Feature: ${percent}% complete (${completed}/${total} tasks)`);
    }
    
    console.log('');
    
    // Save current state for change detection
    this.lastState.set(worktree.path, JSON.stringify({
      status: worktree.status,
      headCommit: worktree.headCommit,
      changedFiles: worktree.changedFiles?.length || 0
    }));
  }
  
  private getStatusEmoji(status: WorktreeStatus): string {
    switch (status) {
      case WorktreeStatus.CLEAN: return '✅';
      case WorktreeStatus.MODIFIED: return '📝';
      case WorktreeStatus.UNTRACKED: return '🆕';
      case WorktreeStatus.CONFLICT: return '⚠️';
      default: return '❓';
    }
  }
  
  private async checkForChanges() {
    const worktrees = await this.worktreeService.listWorktrees(false);
    const correlatedWorktrees = await this.taskCorrelationService.correlateWorktreesWithTasks(worktrees);
    
    for (const worktree of correlatedWorktrees) {
      const prevState = this.lastState.get(worktree.path);
      
      if (!prevState) {
        // New worktree
        console.log(`🆕 New worktree detected: ${worktree.path}`);
        await this.displayWorktreeInfo(worktree);
        continue;
      }
      
      const currentState = JSON.stringify({
        status: worktree.status,
        headCommit: worktree.headCommit,
        changedFiles: worktree.changedFiles?.length || 0
      });
      
      if (prevState !== currentState) {
        // Something changed
        console.log(`🔄 [${new Date().toISOString()}] Changes detected in ${worktree.branch}`);
        await this.displayWorktreeInfo(worktree);
      }
    }
    
    // Check for removed worktrees
    const currentPaths = new Set(worktrees.map(w => w.path));
    for (const [path] of this.lastState) {
      if (!currentPaths.has(path)) {
        console.log(`🗑️ Worktree removed: ${path}`);
        this.lastState.delete(path);
      }
    }
  }
  
  stop() {
    console.log('\n🛑 Stopping Worktree Monitor...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    console.log('✅ Monitor stopped.');
    process.exit(0);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  let repoPath: string;
  
  if (args.length === 0) {
    // If no repository path is provided, use the current repository
    try {
      repoPath = execSync('git rev-parse --show-toplevel').toString().trim();
      console.log(`No repository path provided, using current repository: ${repoPath}`);
    } catch (error) {
      console.error('Error: Not a git repository. Please provide a repository path.');
      console.error('Usage: bun run scripts/worktree-monitor.ts <repository-path>');
      process.exit(1);
    }
  } else {
    repoPath = args[0];
    console.log(`Using provided repository path: ${repoPath}`);
  }
  
  const monitor = new WorktreeMonitor(repoPath);
  await monitor.start();
}

// Run the main function directly without checking Bun.main
// This ensures the script runs correctly in the Bun runtime
main().catch(error => {
  console.error('Error running worktree monitor:', error);
  process.exit(1);
});