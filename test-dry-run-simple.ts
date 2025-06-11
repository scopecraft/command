#!/usr/bin/env bun
/**
 * Simple test to isolate dry-run bug
 */

import { existsSync, mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import simpleGit from 'simple-git';

import { handleWorkCommand } from './src/cli/commands/work-commands.js';
import { ConfigurationManager } from './src/core/config/configuration-manager.js';
import * as core from './src/core/index.js';

const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'simple-dry-run-test');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

async function setup() {
  console.log('Setting up test project...');
  
  // Clean up first
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
  if (existsSync(WORKTREE_BASE)) {
    await rm(WORKTREE_BASE, { recursive: true, force: true });
  }
  
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
    title: 'Simple Test Task',
    type: 'feature',
    area: 'test',
    workflowState: 'current',
  });
  
  if (!result.success || !result.data) {
    throw new Error('Failed to create test task');
  }
  
  return result.data.metadata.id;
}

async function testDryRun(taskId: string) {
  console.log(`Testing dry-run with task: ${taskId}`);
  
  // Check worktree doesn't exist before
  const worktreePath = join(WORKTREE_BASE, taskId);
  console.log(`Checking if worktree exists before: ${worktreePath}`);
  const existsBefore = existsSync(worktreePath);
  console.log(`Exists before: ${existsBefore}`);
  
  // Run the work command in dry-run mode
  console.log('Running work command in dry-run mode...');
  try {
    await handleWorkCommand(taskId, [], { dryRun: true });
    console.log('Work command completed');
  } catch (error) {
    console.error('Work command failed:', error);
    throw error;
  }
  
  // Check if worktree was created (it shouldn't be)
  console.log(`Checking if worktree exists after: ${worktreePath}`);
  const existsAfter = existsSync(worktreePath);
  console.log(`Exists after: ${existsAfter}`);
  
  if (existsAfter) {
    console.error('BUG: Worktree was created in dry-run mode!');
    return false;
  } else {
    console.log('SUCCESS: No worktree created in dry-run mode');
    return true;
  }
}

async function main() {
  try {
    const taskId = await setup();
    const success = await testDryRun(taskId);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();