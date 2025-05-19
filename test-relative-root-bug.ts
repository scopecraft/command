#!/usr/bin/env bun
import { parseTaskPath, getTasksDirectory } from './src/core/task-manager/directory-utils.js';
import path from 'node:path';

// Simulate the reported bug scenario
console.log('Testing relative root path bug fix...\n');

const relativeRoot = './e2e_test/worktree-test';
const config = { rootPath: relativeRoot };

const tasksDir = getTasksDirectory(config);
console.log(`Tasks directory: ${tasksDir}`);
console.log(`Resolved tasks directory: ${path.resolve(tasksDir)}\n`);

// Create a test file path in the tasks directory
const testFile = path.join(tasksDir, 'test', 'feature', 'TASK-001.md');
const absoluteTestFile = path.resolve(testFile);

console.log(`Test file path: ${testFile}`);
console.log(`Absolute test file path: ${absoluteTestFile}\n`);

// Parse the path - this was failing before the fix
const result = parseTaskPath(testFile, config);

console.log('Parse result:');
console.log(`  phase: ${result.phase}`);
console.log(`  subdirectory: ${result.subdirectory}`);

// Expected results
console.log('\nExpected:');
console.log(`  phase: test`);
console.log(`  subdirectory: feature`);

// Check if it matches
const isCorrect = result.phase === 'test' && result.subdirectory === 'feature';
console.log(`\nResult: ${isCorrect ? '✅ FIXED!' : '❌ STILL BROKEN'}`);

// Test another scenario - root level task
const rootLevelTask = path.join(tasksDir, 'TASK-ROOT.md');
const rootResult = parseTaskPath(rootLevelTask, config);

console.log('\n\nTesting root level task:');
console.log(`File: ${rootLevelTask}`);
console.log(`Result: phase="${rootResult.phase}", subdirectory="${rootResult.subdirectory}"`);
console.log(`Expected: phase=undefined, subdirectory=undefined`);

const rootCorrect = rootResult.phase === undefined && rootResult.subdirectory === undefined;
console.log(`Result: ${rootCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);