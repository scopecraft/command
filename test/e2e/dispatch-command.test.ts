#!/usr/bin/env bun
/**
 * Integration Tests for dispatch Command
 *
 * Tests the complete dispatch command functionality including:
 * - Docker execution mode
 * - Detached execution mode
 * - Tmux execution mode
 * - Session continuation and management
 * - Mode prompt loading
 * - Session file creation and verification
 * - ChannelCoder integration
 * - Error handling and edge cases
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { simpleGit } from 'simple-git';

import { handleDispatchCommand } from '../../src/cli/commands/dispatch-commands.js';
import { ConfigurationManager } from '../../src/core/config/configuration-manager.js';
import * as core from '../../src/core/index.js';

// Test project setup - use temp directory to avoid conflicts
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'scopecraft-test-dispatch-command');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

// Mock modules and console for testing
let consoleOutput: string[] = [];
let consoleError: string[] = [];
let processExitCode: number | undefined;

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

// Mock ChannelCoder integration
let mockChannelCoderResult = {
  success: true,
  sessionName: 'test-session-123',
  data: { pid: 12345 },
};
let mockChannelCoderCalls: any[] = [];

function setupMocks() {
  consoleOutput = [];
  consoleError = [];
  processExitCode = undefined;
  mockChannelCoderCalls = [];

  console.log = (...args: any[]) => {
    consoleOutput.push(args.join(' '));
  };

  console.error = (...args: any[]) => {
    consoleError.push(args.join(' '));
  };

  process.exit = ((code?: number) => {
    processExitCode = code;
    throw new Error(`process.exit(${code})`);
  }) as typeof process.exit;
}

function restoreMocks() {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  process.exit = originalProcessExit;
}

// Mock the ChannelCoder integration module
const originalModule = await import('../../src/integrations/channelcoder/index.js');
const mockChannelCoder = {
  ...originalModule,
  executeAutonomousTask: async (promptPath: string, options: any) => {
    mockChannelCoderCalls.push({ promptPath, options });
    return mockChannelCoderResult;
  },
  resolveModePromptPath: (projectRoot: string, mode: string) => {
    return join(projectRoot, `.modes/${mode}.md`);
  },
  buildTaskData: (taskId: string, instruction: string, additionalPrompt: string) => ({
    taskId,
    instruction,
    additionalPrompt,
  }),
};

async function cleanup() {
  restoreMocks();

  // Clean up worktrees first
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
      title: 'Simple Dispatch Task',
      type: 'feature' as core.TaskType,
      area: 'test',
      workflowState: 'current' as core.WorkflowState,
    },
    {
      title: 'Bug Fix Task',
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

      // Create subtask
      const subtaskResult = await core.parent(TEST_PROJECT, parentId).create('Test Subtask', {
        type: 'feature',
        area: 'test',
      });

      if (subtaskResult.success && subtaskResult.data) {
        createdTasks.push(`${parentId}/${subtaskResult.data.metadata.id}`);
      }
    }
  } catch {
    // If parent creation fails, proceed with simple tasks
    console.log('Parent task creation failed, using simple tasks only');
  }

  return createdTasks;
}

describe('dispatch command integration tests', () => {
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    await cleanup();
    testTaskIds = await setupTestProject();

    // Setup module mocks after imports are resolved
    const channelCoderModule = await import('../../src/integrations/channelcoder/index.js');
    Object.assign(channelCoderModule, mockChannelCoder);
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(TEST_PROJECT);

    // Reset mocks
    mockChannelCoderResult = {
      success: true,
      sessionName: 'test-session-123',
      data: { pid: 12345 },
    };
    mockChannelCoderCalls = [];
  });

  describe('execution modes', () => {
    test('should launch in docker mode by default', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});

        // Verify success output
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Launching Claude in docker mode'))).toBe(
          true
        );
        expect(consoleOutput.some((line) => line.includes('Docker image:'))).toBe(true);

        // Verify ChannelCoder was called with correct execution type
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].options.execType).toBe('docker');
        expect(mockChannelCoderCalls[0].options.docker).toBeDefined();
        expect(mockChannelCoderCalls[0].options.docker.image).toBeTruthy();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should launch in detached mode when specified', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'detached' });

        expect(
          consoleOutput.some((line) => line.includes('Launching Claude in detached mode'))
        ).toBe(true);
        expect(mockChannelCoderCalls[0].options.execType).toBe('detached');
        expect(mockChannelCoderCalls[0].options.docker).toBeUndefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should launch in tmux mode when specified', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'tmux' });

        expect(consoleOutput.some((line) => line.includes('Launching Claude in tmux mode'))).toBe(
          true
        );
        expect(consoleOutput.some((line) => line.includes('✓ Tmux window created'))).toBe(true);
        expect(
          consoleOutput.some((line) => line.includes('Attach with: tmux attach -t scopecraft'))
        ).toBe(true);
        expect(mockChannelCoderCalls[0].options.execType).toBe('tmux');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('session management', () => {
    test('should start new session and provide session info', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});

        expect(
          consoleOutput.some((line) => line.includes('✅ Execution started successfully'))
        ).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Session: test-session-123'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('PID: 12345'))).toBe(true);
        expect(
          consoleOutput.some((line) =>
            line.includes('Resume with: sc dispatch --session test-session-123')
          )
        ).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should resume existing session', async () => {
      setupMocks();

      try {
        await handleDispatchCommand(undefined, { session: 'existing-session-456' });

        expect(
          consoleOutput.some((line) => line.includes('Resuming session: existing-session-456'))
        ).toBe(true);
        expect(mockChannelCoderCalls[0].options.session).toBe('existing-session-456');
        expect(mockChannelCoderCalls[0].options.taskId).toBe('session-resume');
        expect(mockChannelCoderCalls[0].promptPath).toBe(
          'Continue task execution from where you left off'
        );
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should not show resume instructions for tmux mode', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'tmux' });

        // Should show tmux instructions instead of session resume
        expect(
          consoleOutput.some((line) => line.includes('Resume with: sc dispatch --session'))
        ).toBe(false);
        expect(consoleOutput.some((line) => line.includes('Attach with: tmux attach'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('mode handling', () => {
    test('should use auto mode by default', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});

        expect(consoleOutput.some((line) => line.includes('auto mode'))).toBe(true);
        expect(mockChannelCoderCalls[0].promptPath).toContain('auto.md');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should respect mode override', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { mode: 'implement' });

        expect(consoleOutput.some((line) => line.includes('implement mode'))).toBe(true);
        expect(mockChannelCoderCalls[0].promptPath).toContain('implement.md');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should support all execution modes', async () => {
      const modes = ['auto', 'implement', 'explore', 'orchestrate', 'diagnose'];

      for (const mode of modes) {
        setupMocks();

        const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

        try {
          await handleDispatchCommand(simpleTaskId, { mode });

          expect(consoleOutput.some((line) => line.includes(`${mode} mode`))).toBe(true);
          expect(mockChannelCoderCalls[0].promptPath).toContain(`${mode}.md`);
        } catch (error: any) {
          if (!error.message.includes('process.exit')) {
            throw error;
          }
        } finally {
          restoreMocks();
        }
      }
    });
  });

  describe('environment integration', () => {
    test('should create and report environment path', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});

        expect(consoleOutput.some((line) => line.includes('Environment ready:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Working in:'))).toBe(true);

        // Verify worktree info is passed to ChannelCoder
        expect(mockChannelCoderCalls[0].options.worktree).toBeDefined();
        expect(mockChannelCoderCalls[0].options.worktree.path).toContain(simpleTaskId);
        expect(mockChannelCoderCalls[0].options.worktree.branch).toBeDefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle subtask with parent resolution', async () => {
      setupMocks();

      const subtaskEntry = testTaskIds.find((id) => id.includes('/'));
      if (!subtaskEntry) {
        console.log('No subtask found in test data, skipping test');
        return;
      }

      const subtaskId = subtaskEntry.split('/')[1];

      try {
        await handleDispatchCommand(subtaskId, {});

        // Should successfully resolve environment and launch
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);

        // Should have parent ID for orchestration
        expect(mockChannelCoderCalls[0].options.parentId).toBeDefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('docker configuration', () => {
    test('should configure docker mounts and environment for docker mode', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'docker', mode: 'implement' });

        const dockerConfig = mockChannelCoderCalls[0].options.docker;
        expect(dockerConfig).toBeDefined();
        expect(dockerConfig.image).toBeTruthy();
        expect(dockerConfig.mounts).toHaveLength(1);
        expect(dockerConfig.mounts[0]).toContain('/workspace:rw');
        expect(dockerConfig.env.TASK_ID).toBe(simpleTaskId);
        expect(dockerConfig.env.WORK_MODE).toBe('implement');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should not configure docker for non-docker modes', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'detached' });

        expect(mockChannelCoderCalls[0].options.docker).toBeUndefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('dry run mode', () => {
    test('should show execution plan without running', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {
          dryRun: true,
          mode: 'implement',
          exec: 'docker',
        });

        expect(
          consoleOutput.some((line) =>
            line.includes('[DRY RUN] Would launch Claude in docker mode')
          )
        ).toBe(true);
        expect(consoleOutput.some((line) => line.includes('[DRY RUN] Would work in:'))).toBe(true);
        expect(
          consoleOutput.some((line) => line.includes('[DRY RUN] Would use Docker image:'))
        ).toBe(true);
        expect(mockChannelCoderCalls[0].options.dryRun).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should show dry run for session resume', async () => {
      setupMocks();

      try {
        await handleDispatchCommand(undefined, {
          session: 'test-session',
          dryRun: true,
          exec: 'detached',
        });

        expect(
          consoleOutput.some((line) =>
            line.includes('[DRY RUN] Would resume session: test-session')
          )
        ).toBe(true);
        expect(
          consoleOutput.some((line) => line.includes('[DRY RUN] Would execute in detached mode'))
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

  describe('error handling', () => {
    test('should require task ID or session', async () => {
      setupMocks();

      try {
        await handleDispatchCommand(undefined, {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(
          consoleError.some((line) => line.includes('Task ID is required for dispatch command'))
        ).toBe(true);
      } finally {
        restoreMocks();
      }
    });

    test('should handle non-existent task ID', async () => {
      setupMocks();

      try {
        await handleDispatchCommand('non-existent-task', {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(
          consoleError.some((line) => line.includes("Task 'non-existent-task' not found"))
        ).toBe(true);
      } finally {
        restoreMocks();
      }
    });

    test('should handle missing project root', async () => {
      setupMocks();

      // Clear project root
      const configManager = ConfigurationManager.getInstance();
      configManager.setRootFromCLI('');

      try {
        await handleDispatchCommand('test-task', {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('No project root found'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });

    test('should handle ChannelCoder execution failure', async () => {
      setupMocks();
      mockChannelCoderResult = { success: false, error: 'ChannelCoder execution failed' };

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(
          consoleError.some((line) =>
            line.includes('Execution failed: ChannelCoder execution failed')
          )
        ).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task data building', () => {
    test('should build task data correctly for new tasks', async () => {
      setupMocks();

      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];

      try {
        await handleDispatchCommand(simpleTaskId, {});

        expect(mockChannelCoderCalls[0].options.taskId).toBe(simpleTaskId);
        expect(mockChannelCoderCalls[0].options.data).toBeDefined();
        expect(mockChannelCoderCalls[0].options.data.taskId).toBe(simpleTaskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should build session data correctly for resume', async () => {
      setupMocks();

      try {
        await handleDispatchCommand(undefined, { session: 'resume-session' });

        expect(mockChannelCoderCalls[0].options.data.sessionName).toBe('resume-session');
        expect(mockChannelCoderCalls[0].options.taskId).toBe('session-resume');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });
});
