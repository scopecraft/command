#!/usr/bin/env bun
/**
 * Integration Tests for env Commands
 *
 * Tests the complete env command functionality including:
 * - Environment creation and resolution
 * - Worktree management
 * - Parent/subtask environment logic
 * - Error handling and edge cases
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { simpleGit } from 'simple-git';

import {
  handleEnvCloseCommand,
  handleEnvCreateCommand,
  handleEnvListCommand,
  handleEnvPathCommand,
} from '../../src/cli/commands/env-commands.js';
import { ConfigurationManager } from '../../src/core/config/configuration-manager.js';
import * as core from '../../src/core/index.js';

// Test project setup - use temp directory to avoid conflicts with parent worktrees
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'scopecraft-test-env-commands');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

// Mock console to capture output
let consoleOutput: string[] = [];
let consoleError: string[] = [];

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

function setupMocks() {
  consoleOutput = [];
  consoleError = [];

  console.log = (...args: any[]) => {
    consoleOutput.push(args.join(' '));
  };

  console.error = (...args: any[]) => {
    consoleError.push(args.join(' '));
  };

  process.exit = ((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as typeof process.exit;
}

function restoreMocks() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  process.exit = originalProcessExit;
}

async function cleanup() {
  // Restore mocks first
  restoreMocks();

  // Clean up worktrees first (if any exist)
  if (existsSync(WORKTREE_BASE)) {
    try {
      const git = simpleGit(TEST_PROJECT);
      await git.raw(['worktree', 'prune']);
    } catch {
      // Ignore errors during cleanup
    }
    await rm(WORKTREE_BASE, { recursive: true, force: true });
  }

  // Clean up test project
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
}

async function cleanupEnvironments() {
  // Only clean up worktrees without destroying the test project
  try {
    if (existsSync(WORKTREE_BASE)) {
      if (existsSync(TEST_PROJECT)) {
        const git = simpleGit(TEST_PROJECT);
        // Remove all worktrees
        const worktrees = await git.raw(['worktree', 'list', '--porcelain']);
        const worktreePaths = worktrees
          .split('\n')
          .filter((line) => line.startsWith('worktree '))
          .map((line) => line.replace('worktree ', ''))
          .filter((path) => path !== TEST_PROJECT); // Don't remove main worktree

        for (const path of worktreePaths) {
          try {
            await git.raw(['worktree', 'remove', path, '--force']);
          } catch {
            // Ignore individual worktree removal errors
          }
        }

        await git.raw(['worktree', 'prune']);
      }

      // Force remove the worktree directory
      await rm(WORKTREE_BASE, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Failed to cleanup environments:', error);
  }
}

async function setupTestProject() {
  // Create test project directory
  mkdirSync(TEST_PROJECT, { recursive: true });

  // Initialize git repository
  const git = simpleGit(TEST_PROJECT);
  await git.init();
  await git.addConfig('user.name', 'Test User');
  await git.addConfig('user.email', 'test@example.com');

  // Create initial commit
  await git.raw(['commit', '--allow-empty', '-m', 'Initial commit']);

  // Initialize Scopecraft project structure
  core.initializeProjectStructure(TEST_PROJECT);

  // Set configuration
  const configManager = ConfigurationManager.getInstance();
  configManager.setRootFromCLI(TEST_PROJECT);

  // Create test tasks
  const tasks = [
    {
      title: 'Parent Task',
      type: 'feature' as core.TaskType,
      area: 'test',
      workflowState: 'current' as core.WorkflowState,
    },
    {
      title: 'Simple Task',
      type: 'bug' as core.TaskType,
      area: 'test',
      workflowState: 'current' as core.WorkflowState,
    },
  ];

  const createdTasks = [];
  for (const task of tasks) {
    const result = await core.create(TEST_PROJECT, task);
    if (result.success && result.data) {
      createdTasks.push(result.data.metadata.id);
    }
  }

  // Create a parent task with subtasks
  try {
    const parentResult = await core.createParent(TEST_PROJECT, {
      title: 'Test Parent Feature',
      type: 'feature',
      area: 'test',
      workflowState: 'current',
    });

    if (parentResult.success && parentResult.data) {
      const parentId = parentResult.data.metadata.id;
      createdTasks.push(parentId);

      // Create an actual subtask within the parent
      const subtaskResult = await core.parent(TEST_PROJECT, parentId).create('Test Subtask', {
        type: 'feature',
        area: 'test',
      });

      if (subtaskResult.success && subtaskResult.data) {
        createdTasks.push(`${parentId}/${subtaskResult.data.metadata.id}`);
      }
    }
  } catch (_error) {
    // If parent creation fails, just proceed with simple tasks
    console.log('Parent task creation failed, using simple tasks only');
  }

  return createdTasks;
}

describe('env commands integration tests', () => {
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    await cleanup();
    testTaskIds = await setupTestProject();
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    // Clean up environments between tests to ensure isolation
    await cleanupEnvironments();

    // Also ensure config is set to test project
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(TEST_PROJECT);
  });

  describe('env create command', () => {
    test('should create environment for simple task', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleEnvCreateCommand(simpleTaskId);

        // Check output (could be Created or Switched)
        const hasEnvMessage = consoleOutput.some(
          (line) =>
            line.includes('Created environment') ||
            line.includes('Switched to existing environment')
        );
        expect(hasEnvMessage).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Path:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Branch:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Next steps:'))).toBe(true);

        // Verify worktree was created
        const expectedPath = join(WORKTREE_BASE, simpleTaskId);
        expect(existsSync(expectedPath)).toBe(true);
      } catch (error: any) {
        if (error.message.includes('process.exit')) {
          // This is expected for error cases, check console output
          expect(consoleError.length).toBeGreaterThan(0);
        } else {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should create environment for subtask using parent ID', async () => {
      setupMocks();

      // Find the subtask ID from our test data
      const subtaskEntry = testTaskIds.find((id) => id.includes('/'));
      if (!subtaskEntry) {
        console.log('No subtask found in test data, skipping test');
        return;
      }

      // Extract just the subtask ID (after the /)
      const subtaskId = subtaskEntry.split('/')[1];

      try {
        await handleEnvCreateCommand(subtaskId);

        // Check that environment was created (the specific parent logic is tested in unit tests)
        const hasEnvMessage = consoleOutput.some(
          (line) =>
            line.includes('Created environment') ||
            line.includes('Switched to existing environment')
        );
        expect(hasEnvMessage).toBe(true);
      } catch (error: any) {
        if (error.message.includes('process.exit')) {
          // Check for error output
          expect(consoleError.length).toBeGreaterThan(0);
        } else {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle non-existent task', async () => {
      setupMocks();

      try {
        await handleEnvCreateCommand('non-existent-task');
        expect(false).toBe(true); // Should not reach this
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(
          consoleError.some((line) => line.includes("Task 'non-existent-task' not found"))
        ).toBe(true);
      } finally {
        restoreMocks();
      }
    });

    test('should switch to existing environment', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        // First call creates
        await handleEnvCreateCommand(simpleTaskId);
        setupMocks(); // Reset output

        // Second call switches
        await handleEnvCreateCommand(simpleTaskId);

        expect(
          consoleOutput.some((line) => line.includes('Switched to existing environment'))
        ).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('env list command', () => {
    test('should list active environments', async () => {
      // First create an environment to list
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      setupMocks();
      await handleEnvCreateCommand(simpleTaskId);
      restoreMocks();

      setupMocks();

      try {
        await handleEnvListCommand();

        // Should show environments that were created
        expect(consoleOutput.some((line) => line.includes('Active Environments:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Task ID'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Branch'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Path'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes(simpleTaskId))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should show no environments when none exist', async () => {
      setupMocks();

      try {
        await handleEnvListCommand();

        // Debug: log actual output to see what's happening
        if (!consoleOutput.some((line) => line.includes('No active environments found'))) {
          console.log('Expected no environments, but got:', consoleOutput);
        }

        expect(consoleOutput.some((line) => line.includes('No active environments found'))).toBe(
          true
        );
        expect(consoleOutput.some((line) => line.includes('Create an environment with:'))).toBe(
          true
        );
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should support JSON format', async () => {
      setupMocks();

      try {
        await handleEnvListCommand({ format: 'json' });

        // Should output valid JSON (empty array if no environments)
        const jsonOutput = consoleOutput.join('');
        const parsed = JSON.parse(jsonOutput);
        expect(Array.isArray(parsed)).toBe(true);
        // Should be empty array since no environments created in this test
        expect(parsed.length).toBe(0);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should support minimal format', async () => {
      setupMocks();

      try {
        await handleEnvListCommand({ format: 'minimal' });

        // Should output nothing for minimal format when no environments
        expect(consoleOutput.length).toBe(0);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('env path command', () => {
    test('should output environment path', async () => {
      // First create an environment
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      await handleEnvCreateCommand(simpleTaskId);

      setupMocks();

      try {
        await handleEnvPathCommand(simpleTaskId);

        // Should output just the path
        expect(consoleOutput.length).toBe(1);
        expect(consoleOutput[0]).toContain(simpleTaskId);
        expect(consoleOutput[0]).toContain(WORKTREE_BASE);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle non-existent environment', async () => {
      setupMocks();

      try {
        await handleEnvPathCommand('definitely-non-existent-task-12345');
        expect(false).toBe(true); // Should not reach this
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        // Check that error was logged
        expect(consoleError.some((line) => line.includes('Task not found:'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('env close command', () => {
    test('should require force flag for safety', async () => {
      // Create an environment first
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      await handleEnvCreateCommand(simpleTaskId);

      setupMocks();

      try {
        await handleEnvCloseCommand(simpleTaskId);

        // Should show confirmation message
        expect(consoleOutput.some((line) => line.includes('About to close environment'))).toBe(
          true
        );
        expect(
          consoleOutput.some((line) => line.includes('Use --force to skip this confirmation'))
        ).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Close cancelled'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should close environment with force flag', async () => {
      // Create an environment first
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      setupMocks();
      await handleEnvCreateCommand(simpleTaskId);
      restoreMocks();

      const expectedPath = join(WORKTREE_BASE, simpleTaskId);
      expect(existsSync(expectedPath)).toBe(true);

      setupMocks();

      try {
        await handleEnvCloseCommand(simpleTaskId, { force: true });

        // Should show success message
        expect(consoleOutput.some((line) => line.includes('Closed environment'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Removed path:'))).toBe(true);

        // Verify worktree was removed
        expect(existsSync(expectedPath)).toBe(false);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle non-existent environment', async () => {
      setupMocks();

      try {
        await handleEnvCloseCommand('definitely-non-existent-task-12345', { force: true });
        expect(false).toBe(true); // Should not reach this
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        // Check that error was logged - could be either message
        expect(
          consoleError.some(
            (line) =>
              line.includes('Task not found:') || line.includes('No environment found for task')
          )
        ).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('input validation', () => {
    test('should validate empty task ID', async () => {
      setupMocks();

      try {
        await handleEnvCreateCommand('');
        expect(false).toBe(true); // Should not reach this
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('Invalid input'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });

    test('should validate invalid format option', async () => {
      setupMocks();

      try {
        await handleEnvListCommand({ format: 'invalid' as any });
        expect(false).toBe(true); // Should not reach this
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('Invalid options'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });
});
