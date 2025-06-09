#!/usr/bin/env bun
/**
 * Integration Tests for CLI Command Interactions
 *
 * Tests how env, work, and dispatch commands work together in real scenarios:
 * - Work → env list (verify environment created)
 * - Dispatch → monitoring (session files created)
 * - Parent/subtask environment sharing
 * - Error recovery flows
 * - Cross-command state consistency
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { simpleGit } from 'simple-git';

import { handleDispatchCommand } from '../../src/cli/commands/dispatch-commands.js';
import { handleEnvListCommand, handleEnvCreateCommand } from '../../src/cli/commands/env-commands.js';
import { handleWorkCommand } from '../../src/cli/commands/work-commands.js';
import { ConfigurationManager } from '../../src/core/config/configuration-manager.js';
import * as core from '../../src/core/index.js';

// Test project setup - use temp directory to avoid conflicts
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'scopecraft-test-cli-integration');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

// Mock modules and console for testing
let consoleOutput: string[] = [];
let consoleError: string[] = [];
let processExitCode: number | undefined;

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

// Mock ChannelCoder integration
let mockChannelCoderResult = { success: true, sessionName: 'integration-session-123', data: { pid: 54321 } };
let mockChannelCoderCalls: any[] = [];

// Mock inquirer for interactive selection
let mockInquirerResponse: any = null;

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
  executeInteractiveTask: async (promptPath: string, options: any) => {
    mockChannelCoderCalls.push({ promptPath, options, type: 'interactive' });
    return mockChannelCoderResult;
  },
  executeAutonomousTask: async (promptPath: string, options: any) => {
    mockChannelCoderCalls.push({ promptPath, options, type: 'autonomous' });
    return mockChannelCoderResult;
  },
  resolveModePromptPath: (projectRoot: string, mode: string) => {
    return join(projectRoot, `.modes/${mode}.md`);
  },
  buildTaskData: (taskId: string, instruction: string, additionalPrompt: string) => ({ taskId, instruction, additionalPrompt }),
};

// Mock inquirer
const mockInquirer = {
  prompt: async (questions: any[]) => {
    if (mockInquirerResponse === null) {
      throw new Error('User cancelled');
    }
    return { selected: mockInquirerResponse };
  },
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

  // Create test tasks for integration scenarios
  const tasks = [
    {
      title: 'Integration Test Task',
      type: 'feature' as core.TaskType,
      area: 'integration',
      workflowState: 'current' as core.WorkflowState,
    },
    {
      title: 'Shared Environment Task',
      type: 'bug' as core.TaskType,
      area: 'integration',
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

  // Create a parent task with subtasks for environment sharing tests
  try {
    const parentResult = await core.createParent(TEST_PROJECT, {
      title: 'Integration Parent Feature',
      type: 'feature',
      area: 'integration',
      workflowState: 'current',
    });

    if (parentResult.success && parentResult.data) {
      const parentId = parentResult.data.metadata.id;
      createdTasks.push(parentId);

      // Create multiple subtasks
      const subtaskResult1 = await core.parent(TEST_PROJECT, parentId).create('First Subtask', {
        type: 'feature',
        area: 'integration',
      });

      const subtaskResult2 = await core.parent(TEST_PROJECT, parentId).create('Second Subtask', {
        type: 'feature', 
        area: 'integration',
      });

      if (subtaskResult1.success && subtaskResult1.data) {
        createdTasks.push(`${parentId}/${subtaskResult1.data.metadata.id}`);
      }
      if (subtaskResult2.success && subtaskResult2.data) {
        createdTasks.push(`${parentId}/${subtaskResult2.data.metadata.id}`);
      }
    }
  } catch {
    // If parent creation fails, proceed with simple tasks
    console.log('Parent task creation failed, using simple tasks only');
  }

  return createdTasks;
}

describe('CLI integration tests', () => {
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    await cleanup();
    testTaskIds = await setupTestProject();
    
    // Setup module mocks after imports are resolved
    const channelCoderModule = await import('../../src/integrations/channelcoder/index.js');
    Object.assign(channelCoderModule, mockChannelCoder);
    
    const inquirerModule = await import('inquirer');
    Object.assign(inquirerModule.default, mockInquirer);
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(TEST_PROJECT);
    
    // Reset mocks
    mockChannelCoderResult = { success: true, sessionName: 'integration-session-123', data: { pid: 54321 } };
    mockChannelCoderCalls = [];
    mockInquirerResponse = null;
  });

  describe('work → env list integration', () => {
    test('should create environment when work is run, then show it in env list', async () => {
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      // Step 1: Run work command (should create environment)
      setupMocks();
      
      try {
        await handleWorkCommand(simpleTaskId, [], { mode: 'implement' });
        
        // Verify work command succeeded
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].type).toBe('interactive');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Step 2: Run env list (should show the created environment)
      setupMocks();
      
      try {
        await handleEnvListCommand();
        
        // Should show the environment that was created by work command
        expect(consoleOutput.some((line) => line.includes('Active Environments:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes(simpleTaskId))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Task ID'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Branch'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Path'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
    
    test('should show multiple environments when multiple tasks are worked on', async () => {
      const task1 = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      const task2 = testTaskIds.filter((id) => !id.includes('/'))[1] || testTaskIds[1];
      
      if (!task2) {
        console.log('Need at least 2 simple tasks for this test, skipping');
        return;
      }
      
      // Create environments for both tasks
      setupMocks();
      try {
        await handleWorkCommand(task1, [], { mode: 'implement' });
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      setupMocks();
      try {
        await handleWorkCommand(task2, [], { mode: 'explore' });
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // List environments - should show both
      setupMocks();
      
      try {
        await handleEnvListCommand();
        
        expect(consoleOutput.some((line) => line.includes(task1))).toBe(true);
        expect(consoleOutput.some((line) => line.includes(task2))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Active Environments:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('dispatch → session management integration', () => {
    test('should create session info when dispatch is run', async () => {
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      setupMocks();
      
      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'detached', mode: 'implement' });
        
        // Verify session creation
        expect(consoleOutput.some((line) => line.includes('✅ Execution started successfully'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Session: integration-session-123'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('PID: 54321'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Resume with: sc dispatch --session integration-session-123'))).toBe(true);
        
        // Verify ChannelCoder was called for autonomous execution
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].type).toBe('autonomous');
        expect(mockChannelCoderCalls[0].options.execType).toBe('detached');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
    
    test('should resume session with dispatch --session', async () => {
      setupMocks();
      
      try {
        await handleDispatchCommand(undefined, { 
          session: 'existing-session-789', 
          exec: 'docker',
          mode: 'explore'
        });
        
        // Verify session resume
        expect(consoleOutput.some((line) => line.includes('Resuming session: existing-session-789'))).toBe(true);
        expect(mockChannelCoderCalls[0].options.session).toBe('existing-session-789');
        expect(mockChannelCoderCalls[0].options.taskId).toBe('session-resume');
        expect(mockChannelCoderCalls[0].promptPath).toBe('Continue task execution from where you left off');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('parent/subtask environment sharing', () => {
    test('should resolve subtask to parent environment', async () => {
      const subtaskEntry = testTaskIds.find((id) => id.includes('/'));
      if (!subtaskEntry) {
        console.log('No subtask found in test data, skipping test');
        return;
      }
      
      const [parentId, subtaskId] = subtaskEntry.split('/');
      
      // Step 1: Create environment using parent ID
      setupMocks();
      
      try {
        await handleEnvCreateCommand(parentId);
        
        expect(consoleOutput.some((line) => line.includes('Created environment') || line.includes('Switched to existing environment'))).toBe(true);
        
        // Verify environment was created with parent path
        const expectedParentPath = join(WORKTREE_BASE, parentId);
        expect(existsSync(expectedParentPath)).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Step 2: Use subtask ID with work command (should use same environment)
      setupMocks();
      
      try {
        await handleWorkCommand(subtaskId, [], { mode: 'implement' });
        
        // Should successfully use the parent environment
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
        
        // Verify worktree path contains parent ID (environment resolution)
        expect(mockChannelCoderCalls[0].options.worktree.path).toContain(parentId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Step 3: List environments - should show shared environment
      setupMocks();
      
      try {
        await handleEnvListCommand();
        
        // Should show the parent environment (not separate subtask environments)
        expect(consoleOutput.some((line) => line.includes(parentId))).toBe(true);
        // Should not show subtask as separate environment
        expect(consoleOutput.some((line) => line.includes(subtaskId) && !line.includes(parentId))).toBe(false);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('error recovery flows', () => {
    test('should handle work command failure gracefully', async () => {
      setupMocks();
      mockChannelCoderResult = { success: false, error: 'ChannelCoder connection failed' };
      
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      try {
        await handleWorkCommand(simpleTaskId, [], { mode: 'implement' });
        
        // Should show ChannelCoder failure but environment should still be created
        expect(consoleError.some((line) => line.includes('Session failed: ChannelCoder connection failed'))).toBe(true);
        
        // Environment should still be reported as ready
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Even after work failure, env list should show the created environment
      setupMocks();
      
      try {
        await handleEnvListCommand();
        
        expect(consoleOutput.some((line) => line.includes(simpleTaskId))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
    
    test('should handle dispatch command failure gracefully', async () => {
      setupMocks();
      mockChannelCoderResult = { success: false, error: 'Docker execution failed' };
      
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      try {
        await handleDispatchCommand(simpleTaskId, { exec: 'docker' });
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('Execution failed: Docker execution failed'))).toBe(true);
        
        // Environment should still be reported as ready before failure
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('cross-command consistency', () => {
    test('should maintain consistent task ID validation across commands', async () => {
      const invalidTaskId = 'definitely-non-existent-task-12345';
      
      // Test work command with invalid ID
      setupMocks();
      
      try {
        await handleWorkCommand(invalidTaskId, [], {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes(`Task '${invalidTaskId}' not found`))).toBe(true);
      } finally {
        restoreMocks();
      }
      
      // Test dispatch command with same invalid ID
      setupMocks();
      
      try {
        await handleDispatchCommand(invalidTaskId, {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes(`Task '${invalidTaskId}' not found`))).toBe(true);
      } finally {
        restoreMocks();
      }
      
      // Test env create command with same invalid ID
      setupMocks();
      
      try {
        await handleEnvCreateCommand(invalidTaskId);
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes(`Task '${invalidTaskId}' not found`))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
    
    test('should maintain consistent environment paths across commands', async () => {
      const simpleTaskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      let capturedPath: string | undefined;
      
      // Create environment with env command
      setupMocks();
      
      try {
        await handleEnvCreateCommand(simpleTaskId);
        
        const pathLine = consoleOutput.find((line) => line.includes('Path:'));
        if (pathLine) {
          capturedPath = pathLine.split('Path:')[1].trim();
        }
        
        expect(capturedPath).toBeDefined();
        expect(capturedPath).toContain(simpleTaskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Use work command - should use same path
      setupMocks();
      
      try {
        await handleWorkCommand(simpleTaskId, [], {});
        
        expect(mockChannelCoderCalls[0].options.worktree.path).toBe(capturedPath);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Use dispatch command - should use same path
      setupMocks();
      
      try {
        await handleDispatchCommand(simpleTaskId, {});
        
        expect(mockChannelCoderCalls[0].options.worktree.path).toBe(capturedPath);
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