#!/usr/bin/env bun
import { parseTaskPath, getTasksDirectory } from './src/core/task-manager/directory-utils.js';
import path from 'node:path';

// Test with explicit config
const config = { rootPath: './e2e_test/worktree-test' };

console.log('Testing with config...\n');

// Get tasks directory with config
const tasksDir = getTasksDirectory(config);
console.log(`Tasks directory from config: ${tasksDir}`);
console.log(`Absolute tasks directory: ${path.resolve(tasksDir)}\n`);

// Create a test file path
const testFile = '/Users/davidpaquet/Projects/roo-task-cli/e2e_test/worktree-test/.tasks/test/feature/TASK-001.md';
console.log(`Test file: ${testFile}\n`);

// Parse with config
const result = parseTaskPath(testFile, config);
console.log('Parse result with config:');
console.log(`  phase: ${result.phase}`);
console.log(`  subdirectory: ${result.subdirectory}`);

// Check what getTasksDirectory returns with this config
const expectedTasksDir = path.resolve(config.rootPath, '.tasks');
console.log(`\nExpected tasks dir: ${expectedTasksDir}`);
console.log(`Actual tasks dir: ${path.resolve(tasksDir)}`);
console.log(`Match: ${expectedTasksDir === path.resolve(tasksDir)}`);