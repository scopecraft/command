#!/usr/bin/env bun
import { parseTaskPath, getTaskFilePath, getTasksDirectory } from './src/core/task-manager/directory-utils.js';
import path from 'node:path';

// Test cases from the PRD
const testCases = [
  { file: '.tasks/TEST/TASK-001.md', expected: { phase: 'TEST', subdirectory: undefined } },
  { file: '.tasks/production/feature/TASK-002.md', expected: { phase: 'production', subdirectory: 'feature' } },
  { file: '.tasks/dev/feature/auth/TASK-003.md', expected: { phase: 'dev', subdirectory: 'feature/auth' } },
  { file: '.tasks/.config/test.toml', expected: { phase: undefined, subdirectory: undefined } },
  { file: '.tasks/TASK-ROOT.md', expected: { phase: undefined, subdirectory: undefined } },
];

console.log('Testing path parsing...\n');

for (const test of testCases) {
  const absolutePath = path.resolve(test.file);
  const result = parseTaskPath(absolutePath);
  
  console.log(`File: ${test.file}`);
  console.log(`Result: phase="${result.phase}", subdirectory="${result.subdirectory}"`);
  console.log(`Expected: phase="${test.expected.phase}", subdirectory="${test.expected.subdirectory}"`);
  
  const phaseMatch = result.phase === test.expected.phase;
  const subdirMatch = result.subdirectory === test.expected.subdirectory;
  
  console.log(`Match: ${phaseMatch && subdirMatch ? '✅' : '❌'}\n`);
}

console.log('\nTesting getTaskFilePath...\n');

const filePath = getTaskFilePath('TASK-001', 'TEST');
console.log(`Task ID: TASK-001, Phase: TEST`);
console.log(`Result: ${filePath}\n`);

const filePathWithSubdir = getTaskFilePath('TASK-002', 'production', 'feature');
console.log(`Task ID: TASK-002, Phase: production, Subdirectory: feature`);
console.log(`Result: ${filePathWithSubdir}\n`);

// Test with relative root
console.log('Testing with relative root...\n');
const relativeRoot = './e2e_test/worktree-test';
const relativeConfig = { rootDir: relativeRoot };

const tasksDir = getTasksDirectory(relativeConfig);
console.log(`Tasks directory with relative root: ${tasksDir}`);
const absoluteTasksDir = path.resolve(tasksDir);
console.log(`Absolute tasks directory: ${absoluteTasksDir}`);

const testFile = path.join(tasksDir, 'test', 'TASK-001.md');
const parseResult = parseTaskPath(testFile, relativeConfig);
console.log(`\nParsing ${testFile}`);
console.log(`Result: phase="${parseResult.phase}", subdirectory="${parseResult.subdirectory}"`);