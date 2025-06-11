#!/usr/bin/env bun
/**
 * Core test for dry-run worktree creation
 */

import { existsSync, mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import simpleGit from 'simple-git';

import { handleWorkCommand } from './src/cli/commands/work-commands.js';
import { ConfigurationManager } from './src/core/config/configuration-manager.js';
import * as core from './src/core/index.js';

const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'dry-run-core-test');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

async function main() {
  // Clean up first
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
  if (existsSync(WORKTREE_BASE)) {
    await rm(WORKTREE_BASE, { recursive: true, force: true });
  }
  
  console.log('Setting up test project...');
  mkdirSync(TEST_PROJECT, { recursive: true });
  
  const git = simpleGit(TEST_PROJECT);
  await git.init();
  await git.addConfig('user.name', 'Test User');
  await git.addConfig('user.email', 'test@example.com');
  await git.raw(['commit', '--allow-empty', '-m', 'Initial commit']);
  
  core.initializeProjectStructure(TEST_PROJECT);
  
  const configManager = ConfigurationManager.getInstance();
  configManager.setRootFromCLI(TEST_PROJECT);
  
  // Create a simple task
  const result = await core.create(TEST_PROJECT, {
    title: 'Core Test Task',
    type: 'feature',
    area: 'test',
    workflowState: 'current',
  });
  
  if (!result.success || !result.data) {
    throw new Error('Failed to create test task');
  }
  
  const taskId = result.data.metadata.id;
  const worktreePath = join(WORKTREE_BASE, taskId);
  
  console.log(`Task ID: ${taskId}`);
  console.log(`Expected worktree path: ${worktreePath}`);
  
  // Check before
  console.log(`Worktree exists before: ${existsSync(worktreePath)}`);
  
  // Suppress output for the test
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => {};
  console.error = () => {};
  
  try {
    // Run dry-run command
    await handleWorkCommand(taskId, [], { dryRun: true });
  } catch (error) {
    console.log = originalLog;
    console.error = originalError;
    console.error('Command failed:', error);
    process.exit(1);
  }
  
  console.log = originalLog;
  console.error = originalError;
  
  // Check after
  const existsAfter = existsSync(worktreePath);
  console.log(`Worktree exists after: ${existsAfter}`);
  
  if (existsAfter) {
    console.error('❌ FAILED: Worktree was created in dry-run mode');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS: No worktree created in dry-run mode');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});