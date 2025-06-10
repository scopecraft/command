#!/usr/bin/env bun
/**
 * Comprehensive CLI Command Regression Tests
 *
 * This test suite captures the exact current behavior of ALL CLI commands
 * to ensure backward compatibility during the functional refactor.
 *
 * Tests ALL command signatures, options, and behaviors to catch any
 * breaking changes during the environment configuration refactor.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import simpleGit from 'simple-git';

// Import ALL command handlers
import {
  handleCreateCommand,
  handleDeleteCommand,
  handleGetCommand,
  handleInitCommand,
  handleListCommand,
  handleListTemplatesCommand,
  handleTaskMoveCommand,
  handleUpdateCommand,
  handleNextTaskCommand,
  handleCurrentTaskCommand,
  handleMarkCompleteNextCommand,
} from '../../src/cli/commands.js';
import { handleDispatchCommand } from '../../src/cli/commands/dispatch-commands.js';
import {
  handleEnvCloseCommand,
  handleEnvCreateCommand,
  handleEnvListCommand,
  handleEnvPathCommand,
} from '../../src/cli/commands/env-commands.js';
import { handlePlanCommand } from '../../src/cli/commands/plan-commands.js';
import { handleWorkCommand } from '../../src/cli/commands/work-commands.js';
import { ConfigurationManager } from '../../src/core/config/configuration-manager.js';
import * as core from '../../src/core/index.js';

// Test environment setup
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'scopecraft-regression-cli-commands');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

// Mock console to capture output
let consoleOutput: string[] = [];
let consoleError: string[] = [];
let processExitCode: number | undefined;

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

// Mock external dependencies
let mockChannelCoderResult = { success: true, sessionName: 'regression-session-123', data: { pid: 12345 } };
let mockChannelCoderCalls: any[] = [];
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

// Mock ChannelCoder integration
const mockChannelCoder = {
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

  // Create comprehensive test data
  const tasks = [
    {
      title: 'Simple Task for Testing',
      type: 'feature' as core.TaskType,
      area: 'regression',
      workflowState: 'current' as core.WorkflowState,
    },
    {
      title: 'Bug Task for Testing',
      type: 'bug' as core.TaskType,
      area: 'regression',
      workflowState: 'current' as core.WorkflowState,
    },
    {
      title: 'Backlog Task for Testing',
      type: 'chore' as core.TaskType,
      area: 'regression',
      workflowState: 'backlog' as core.WorkflowState,
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
      title: 'Regression Test Parent Feature',
      type: 'feature',
      area: 'regression',
      workflowState: 'current',
    });

    if (parentResult.success && parentResult.data) {
      const parentId = parentResult.data.metadata.id;
      createdTasks.push(parentId);

      // Create subtasks
      const subtask1Result = await core.parent(TEST_PROJECT, parentId).create('First Regression Subtask', {
        type: 'feature',
        area: 'regression',
      });

      const subtask2Result = await core.parent(TEST_PROJECT, parentId).create('Second Regression Subtask', {
        type: 'feature',
        area: 'regression',
      });

      if (subtask1Result.success && subtask1Result.data) {
        createdTasks.push(`${parentId}/${subtask1Result.data.metadata.id}`);
      }
      if (subtask2Result.success && subtask2Result.data) {
        createdTasks.push(`${parentId}/${subtask2Result.data.metadata.id}`);
      }
    }
  } catch {
    // If parent creation fails, proceed with simple tasks
    console.log('Parent task creation failed, using simple tasks only');
  }

  return createdTasks;
}

describe('CLI Command Regression Tests', () => {
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    await cleanup();
    testTaskIds = await setupTestProject();
    
    // Setup module mocks
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
    mockChannelCoderResult = { success: true, sessionName: 'regression-session-123', data: { pid: 12345 } };
    mockChannelCoderCalls = [];
    mockInquirerResponse = null;
  });

  describe('init command', () => {
    test('should handle init with default options', async () => {
      const tempDir = join(process.env.TMPDIR || '/tmp', 'test-init-default');
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      mkdirSync(tempDir, { recursive: true });

      setupMocks();
      
      try {
        await handleInitCommand({ rootDir: tempDir });
        
        expect(consoleOutput.some((line) => line.includes('Initialized Scopecraft v2 project structure'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('.tasks/backlog/'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Next steps:'))).toBe(true);
        
        // Verify directory structure was created
        expect(existsSync(join(tempDir, '.tasks', 'backlog'))).toBe(true);
        expect(existsSync(join(tempDir, '.tasks', 'current'))).toBe(true);
        expect(existsSync(join(tempDir, '.tasks', 'archive'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    });

    test('should handle init with mode option', async () => {
      setupMocks();
      
      try {
        await handleInitCommand({ mode: 'standalone' });
        
        // Should complete successfully (specific mode handling is implementation detail)
        expect(consoleOutput.some((line) => line.includes('Initialized') || line.includes('already initialized'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task list command', () => {
    test('should list tasks with default options', async () => {
      setupMocks();
      
      try {
        await handleListCommand({});
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        // Should show tasks in some format
        const outputText = consoleOutput.join(' ');
        expect(outputText.length).toBeGreaterThan(0);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle all list command options', async () => {
      setupMocks();
      
      try {
        await handleListCommand({
          status: 'To Do',
          type: 'feature',
          assignee: 'test-user',
          tags: ['test', 'regression'],
          subdirectory: 'regression',
          location: 'current',
          format: 'json',
        });
        
        // Should handle all options without error
        expect(processExitCode).toBeUndefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle workflow location flags', async () => {
      for (const flag of ['backlog', 'current', 'archive']) {
        setupMocks();
        
        try {
          await handleListCommand({ [flag]: true });
          
          expect(processExitCode).toBeUndefined();
        } catch (error: any) {
          if (!error.message.includes('process.exit')) {
            throw error;
          }
        } finally {
          restoreMocks();
        }
      }
    });

    test('should handle all format options', async () => {
      for (const format of ['tree', 'table', 'json', 'minimal', 'workflow']) {
        setupMocks();
        
        try {
          await handleListCommand({ format });
          
          expect(processExitCode).toBeUndefined();
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

  describe('task get command', () => {
    test('should get task with valid ID', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleGetCommand(taskId, {});
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        const outputText = consoleOutput.join(' ');
        expect(outputText).toContain(taskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle all get command options', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      for (const format of ['default', 'json', 'markdown', 'full']) {
        setupMocks();
        
        try {
          await handleGetCommand(taskId, { format });
          
          expect(processExitCode).toBeUndefined();
        } catch (error: any) {
          if (!error.message.includes('process.exit')) {
            throw error;
          }
        } finally {
          restoreMocks();
        }
      }
    });

    test('should handle contentOnly option', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleGetCommand(taskId, { contentOnly: true });
        
        expect(processExitCode).toBeUndefined();
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle invalid task ID', async () => {
      setupMocks();
      
      try {
        await handleGetCommand('invalid-task-id', {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('Error'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task create command', () => {
    test('should create task with required options', async () => {
      setupMocks();
      
      try {
        await handleCreateCommand({
          title: 'Test Regression Task',
          type: 'feature',
        });
        
        expect(consoleOutput.some((line) => line.includes('✓ Created task:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Location:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Next steps:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle all create command options', async () => {
      setupMocks();
      
      try {
        await handleCreateCommand({
          id: 'regression-test-123',
          title: 'Full Options Regression Task',
          type: 'bug',
          status: 'In Progress',
          priority: 'High',
          assignee: 'test-user',
          location: 'current',
          subdirectory: 'regression',
          depends: ['task1', 'task2'],
          previous: 'prev-task',
          next: 'next-task',
          tags: ['regression', 'test'],
          content: 'Test content for regression',
          template: 'bug',
        });
        
        expect(consoleOutput.some((line) => line.includes('✓ Created task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle parent option for subtask creation', async () => {
      const parentId = testTaskIds.find((id) => !id.includes('/'));
      
      if (parentId) {
        setupMocks();
        
        try {
          await handleCreateCommand({
            title: 'Regression Subtask',
            type: 'feature',
            parent: parentId,
          });
          
          expect(consoleOutput.some((line) => line.includes('✓ Created task:'))).toBe(true);
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

  describe('task update command', () => {
    test('should update task with various options', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, {
          title: 'Updated Regression Task',
          status: 'In Progress',
          priority: 'High',
        });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle location move during update', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, {
          location: 'archive',
        });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('✓ Moved to archive') || line.includes('Warning:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task status shortcut commands', () => {
    test('should handle start command', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, { status: 'In Progress' });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle complete command', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, { status: 'Done' });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle block command', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, { status: 'Blocked' });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle review command', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleUpdateCommand(taskId, { status: 'In Review' });
        
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task delete command', () => {
    test('should require force flag for deletion', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleDeleteCommand(taskId, {});
        
        expect(consoleOutput.some((line) => line.includes('About to delete:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Use --force'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Deletion cancelled'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should delete with force flag', async () => {
      // Create a task specifically for deletion
      setupMocks();
      let taskToDelete: string;
      
      try {
        await handleCreateCommand({
          title: 'Task to Delete',
          type: 'chore',
        });
        
        const createOutput = consoleOutput.join(' ');
        const match = createOutput.match(/Created task: (\S+)/);
        taskToDelete = match ? match[1] : testTaskIds[0];
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
        taskToDelete = testTaskIds[0];
      } finally {
        restoreMocks();
      }
      
      setupMocks();
      
      try {
        await handleDeleteCommand(taskToDelete, { force: true });
        
        expect(consoleOutput.some((line) => line.includes('✓ Deleted task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('task move command', () => {
    test('should move task between workflow states', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      for (const target of ['toBacklog', 'toCurrent', 'toArchive']) {
        setupMocks();
        
        try {
          await handleTaskMoveCommand(taskId, { [target]: true });
          
          expect(consoleOutput.some((line) => line.includes('✓ Moved task to'))).toBe(true);
        } catch (error: any) {
          if (!error.message.includes('process.exit')) {
            throw error;
          }
        } finally {
          restoreMocks();
        }
      }
    });

    test('should handle updateStatus option', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleTaskMoveCommand(taskId, { toCurrent: true, updateStatus: true });
        
        expect(consoleOutput.some((line) => line.includes('✓ Moved task to'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Status:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle archiveDate option', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleTaskMoveCommand(taskId, { toArchive: true, archiveDate: '2024-12' });
        
        expect(consoleOutput.some((line) => line.includes('✓ Moved task to'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should require target location', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleTaskMoveCommand(taskId, {});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('process.exit(1)');
        expect(consoleError.some((line) => line.includes('Must specify target location'))).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });

  describe('workflow commands', () => {
    test('should handle workflow next command', async () => {
      setupMocks();
      
      try {
        await handleNextTaskCommand(undefined, {});
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        // Should either show next task or suggest promoting from backlog
        const outputText = consoleOutput.join(' ');
        expect(outputText.includes('Next task') || outputText.includes('No tasks') || outputText.includes('Consider promoting')).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle workflow current command', async () => {
      setupMocks();
      
      try {
        await handleCurrentTaskCommand({});
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        // Should either show tasks in progress or message about no tasks
        const outputText = consoleOutput.join(' ');
        expect(outputText.includes('Tasks in progress') || outputText.includes('No tasks currently in progress')).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle mark-complete-next command', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleMarkCompleteNextCommand(taskId, {});
        
        // Should mark task complete and show next task
        expect(consoleOutput.some((line) => line.includes('✓ Updated task:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('template commands', () => {
    test('should list templates', async () => {
      setupMocks();
      
      try {
        await handleListTemplatesCommand();
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        // Should either show templates or no templates message
        const outputText = consoleOutput.join(' ');
        expect(outputText.includes('templates') || outputText.includes('Templates should be placed')).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('environment commands', () => {
    test('should create environment for task', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleEnvCreateCommand(taskId);
        
        expect(consoleOutput.some((line) => 
          line.includes('Created environment') || line.includes('Switched to existing environment')
        )).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Path:'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Branch:'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should list environments', async () => {
      setupMocks();
      
      try {
        await handleEnvListCommand({});
        
        expect(consoleOutput.length).toBeGreaterThan(0);
        const outputText = consoleOutput.join(' ');
        expect(outputText.includes('Active Environments') || outputText.includes('No active environments')).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle env list format options', async () => {
      for (const format of ['table', 'json', 'minimal']) {
        setupMocks();
        
        try {
          await handleEnvListCommand({ format });
          
          expect(processExitCode).toBeUndefined();
        } catch (error: any) {
          if (!error.message.includes('process.exit')) {
            throw error;
          }
        } finally {
          restoreMocks();
        }
      }
    });

    test('should get environment path', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      // First create environment
      setupMocks();
      try {
        await handleEnvCreateCommand(taskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Then get path
      setupMocks();
      
      try {
        await handleEnvPathCommand(taskId);
        
        expect(consoleOutput.length).toBe(1);
        expect(consoleOutput[0]).toContain(taskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should close environment', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      // First create environment
      setupMocks();
      try {
        await handleEnvCreateCommand(taskId);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Then close without force (should ask for confirmation)
      setupMocks();
      
      try {
        await handleEnvCloseCommand(taskId);
        
        expect(consoleOutput.some((line) => line.includes('About to close environment'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Use --force'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
      
      // Then close with force
      setupMocks();
      
      try {
        await handleEnvCloseCommand(taskId, { force: true });
        
        expect(consoleOutput.some((line) => line.includes('Closed environment'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('work command', () => {
    test('should start interactive session for task', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleWorkCommand(taskId, [], {});
        
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
    });

    test('should handle work command with all options', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleWorkCommand(taskId, ['additional', 'context'], {
          mode: 'implement',
          noDocker: true,
          dryRun: true,
          data: '{"test": "data"}',
        });
        
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle session resumption', async () => {
      setupMocks();
      
      try {
        await handleWorkCommand(undefined, [], { session: 'existing-session-123' });
        
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].options.session).toBe('existing-session-123');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should show what would happen with dry-run mode', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleWorkCommand(taskId, ['fix the bug'], { 
          mode: 'diagnose',
          dryRun: true 
        });
        
        // With dry-run, should show what WOULD happen without executing
        expect(consoleOutput.some((line) => line.includes('DRY RUN'))).toBe(true);
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        
        // Should show the command that would be executed
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].options.dryRun).toBe(true);
        
        // Verify it captured all the parameters
        expect(mockChannelCoderCalls[0].options.taskId).toBe(taskId);
        expect(mockChannelCoderCalls[0].promptPath).toContain('diagnose');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('dispatch command', () => {
    test('should start autonomous session for task', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleDispatchCommand(taskId, {});
        
        expect(consoleOutput.some((line) => line.includes('✅ Execution started successfully'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].type).toBe('autonomous');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle dispatch command with all options', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      setupMocks();
      
      try {
        await handleDispatchCommand(taskId, {
          mode: 'diagnose',
          exec: 'detached',
          dryRun: true,
          data: '{"test": "data"}',
        });
        
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
        expect(mockChannelCoderCalls[0].options.execType).toBe('detached');
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle all execution types', async () => {
      const taskId = testTaskIds.find((id) => !id.includes('/')) || testTaskIds[0];
      
      for (const exec of ['docker', 'detached', 'tmux']) {
        setupMocks();
        
        try {
          await handleDispatchCommand(taskId, { exec });
          
          expect(mockChannelCoderCalls).toHaveLength(1);
          expect(mockChannelCoderCalls[0].options.execType).toBe(exec);
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

  describe('plan command', () => {
    test('should start planning session', async () => {
      setupMocks();
      
      try {
        await handlePlanCommand('Add dark mode toggle', 'ui', ['Similar to system settings']);
        
        expect(consoleOutput.some((line) => line.includes('Environment ready'))).toBe(true);
        expect(mockChannelCoderCalls).toHaveLength(1);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });

    test('should handle planning with dry run', async () => {
      setupMocks();
      
      try {
        await handlePlanCommand('Test feature', 'core', [], { dryRun: true });
        
        expect(consoleOutput.some((line) => line.includes('DRY RUN'))).toBe(true);
      } catch (error: any) {
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      } finally {
        restoreMocks();
      }
    });
  });

  describe('error handling consistency', () => {
    test('should handle invalid task IDs consistently across commands', async () => {
      const invalidId = 'definitely-invalid-task-id-12345';
      
      const commandTests = [
        () => handleGetCommand(invalidId, {}),
        () => handleUpdateCommand(invalidId, { title: 'New Title' }),
        () => handleDeleteCommand(invalidId, { force: true }),
        () => handleTaskMoveCommand(invalidId, { toCurrent: true }),
        () => handleEnvCreateCommand(invalidId),
        () => handleEnvPathCommand(invalidId),
        () => handleWorkCommand(invalidId, [], {}),
        () => handleDispatchCommand(invalidId, {}),
      ];
      
      for (const commandTest of commandTests) {
        setupMocks();
        
        try {
          await commandTest();
          expect(false).toBe(true); // Should not reach here
        } catch (error: any) {
          expect(error.message).toContain('process.exit(1)');
          expect(consoleError.some((line) => line.includes('Error') || line.includes('not found'))).toBe(true);
        } finally {
          restoreMocks();
        }
      }
    });

    test('should handle missing required parameters consistently', async () => {
      setupMocks();
      
      try {
        // @ts-ignore - intentionally testing missing required params
        await handleCreateCommand({});
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        // Should handle validation error gracefully
        expect(error instanceof Error).toBe(true);
      } finally {
        restoreMocks();
      }
    });
  });
});