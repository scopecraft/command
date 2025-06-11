#!/usr/bin/env bun
/**
 * Environment Resolution Regression Tests
 *
 * This test suite captures the exact current behavior of environment resolution
 * including parent/subtask sharing, task ID resolution, worktree paths, and
 * branch naming patterns.
 *
 * Critical for ensuring the refactor maintains all environment resolution logic.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import simpleGit from 'simple-git';

import { ConfigurationManager } from '../../src/core/config/configuration-manager.js';
import {
  BranchNamingService,
  DockerConfigService,
  ModeDefaultsService,
} from '../../src/core/environment/configuration-services.js';
import { EnvironmentResolver } from '../../src/core/environment/resolver.js';
import { WorktreeManager } from '../../src/core/environment/worktree-manager.js';
import { WorktreePathResolver } from '../../src/core/environment/worktree-path-resolver.js';
import * as core from '../../src/core/index.js';

// Test environment setup
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'scopecraft-regression-env-resolution');
const WORKTREE_BASE = join(TEST_PROJECT, '..', `${TEST_PROJECT.split('/').pop()}.worktrees`);

async function cleanup() {
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

  // Create test task hierarchy
  const tasks = [];

  // Create simple tasks
  const simpleTask1 = await core.create(TEST_PROJECT, {
    title: 'Simple Environment Task',
    type: 'feature',
    area: 'env-test',
    workflowState: 'current',
  });
  if (simpleTask1.success && simpleTask1.data) {
    tasks.push({
      id: simpleTask1.data.metadata.id,
      type: 'simple',
    });
  }

  const simpleTask2 = await core.create(TEST_PROJECT, {
    title: 'Another Simple Task',
    type: 'bug',
    area: 'env-test',
    workflowState: 'backlog',
  });
  if (simpleTask2.success && simpleTask2.data) {
    tasks.push({
      id: simpleTask2.data.metadata.id,
      type: 'simple',
    });
  }

  // Create parent tasks with subtasks
  const parent1Result = await core.createParent(TEST_PROJECT, {
    title: 'Parent Feature One',
    type: 'feature',
    area: 'env-test',
    workflowState: 'current',
  });

  if (parent1Result.success && parent1Result.data) {
    const parentId = parent1Result.data.metadata.id;
    tasks.push({
      id: parentId,
      type: 'parent',
      subtasks: [],
    });

    // Create subtasks
    const subtask1 = await core.parent(TEST_PROJECT, parentId).create('Subtask One', {
      type: 'feature',
      area: 'env-test',
    });

    const subtask2 = await core.parent(TEST_PROJECT, parentId).create('Subtask Two', {
      type: 'feature',
      area: 'env-test',
    });

    if (subtask1.success && subtask1.data) {
      tasks[tasks.length - 1].subtasks.push(subtask1.data.metadata.id);
    }
    if (subtask2.success && subtask2.data) {
      tasks[tasks.length - 1].subtasks.push(subtask2.data.metadata.id);
    }
  }

  // Create another parent for edge case testing
  const parent2Result = await core.createParent(TEST_PROJECT, {
    title: 'Parent Feature Two',
    type: 'feature',
    area: 'env-test',
    workflowState: 'backlog',
  });

  if (parent2Result.success && parent2Result.data) {
    const parentId = parent2Result.data.metadata.id;
    tasks.push({
      id: parentId,
      type: 'parent',
      subtasks: [],
    });

    const subtask = await core.parent(TEST_PROJECT, parentId).create('Solo Subtask', {
      type: 'chore',
      area: 'env-test',
    });

    if (subtask.success && subtask.data) {
      tasks[tasks.length - 1].subtasks.push(subtask.data.metadata.id);
    }
  }

  return tasks;
}

describe('Environment Resolution Regression Tests', () => {
  let testTasks: any[] = [];
  let resolver: EnvironmentResolver;
  let branchService: BranchNamingService;
  let dockerService: DockerConfigService;
  let modeService: ModeDefaultsService;
  let pathResolver: WorktreePathResolver;
  let worktreeManager: WorktreeManager;

  beforeAll(async () => {
    await cleanup();
    testTasks = await setupTestProject();
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(() => {
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(TEST_PROJECT);

    // Initialize services
    branchService = new BranchNamingService();
    dockerService = new DockerConfigService();
    modeService = new ModeDefaultsService();
    pathResolver = new WorktreePathResolver(TEST_PROJECT);
    worktreeManager = new WorktreeManager(TEST_PROJECT);
    resolver = new EnvironmentResolver(TEST_PROJECT);
  });

  describe('Task ID Resolution', () => {
    test('should resolve simple task IDs directly', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      const result = await resolver.resolveTaskEnvironment(simpleTask.id);

      expect(result.success).toBe(true);
      expect(result.environment).toBeDefined();
      expect(result.environment!.taskId).toBe(simpleTask.id);
      expect(result.environment!.isParentEnvironment).toBe(false);
      expect(result.environment!.resolvedFromSubtask).toBe(false);
    });

    test('should resolve parent task IDs directly', async () => {
      const parentTask = testTasks.find((t) => t.type === 'parent');
      if (!parentTask) {
        throw new Error('No parent task found in test data');
      }

      const result = await resolver.resolveTaskEnvironment(parentTask.id);

      expect(result.success).toBe(true);
      expect(result.environment).toBeDefined();
      expect(result.environment!.taskId).toBe(parentTask.id);
      expect(result.environment!.isParentEnvironment).toBe(true);
      expect(result.environment!.resolvedFromSubtask).toBe(false);
    });

    test('should resolve subtask IDs to parent environment', async () => {
      const parentTask = testTasks.find((t) => t.type === 'parent' && t.subtasks.length > 0);
      if (!parentTask || !parentTask.subtasks[0]) {
        throw new Error('No parent with subtasks found in test data');
      }

      const subtaskId = parentTask.subtasks[0];
      const result = await resolver.resolveTaskEnvironment(subtaskId);

      expect(result.success).toBe(true);
      expect(result.environment).toBeDefined();
      expect(result.environment!.taskId).toBe(parentTask.id); // Should resolve to parent
      expect(result.environment!.isParentEnvironment).toBe(true);
      expect(result.environment!.resolvedFromSubtask).toBe(true);
      expect(result.environment!.originalTaskId).toBe(subtaskId);
    });

    test('should handle non-existent task IDs', async () => {
      const result = await resolver.resolveTaskEnvironment('non-existent-task-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Task not found');
      expect(result.environment).toBeUndefined();
    });

    test('should handle empty task IDs', async () => {
      const result = await resolver.resolveTaskEnvironment('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Task ID is required');
      expect(result.environment).toBeUndefined();
    });
  });

  describe('Worktree Path Resolution', () => {
    test('should generate consistent worktree paths for simple tasks', () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      const path1 = pathResolver.getWorktreePath(simpleTask.id);
      const path2 = pathResolver.getWorktreePath(simpleTask.id);

      expect(path1).toBe(path2); // Should be consistent
      expect(path1).toBe(join(WORKTREE_BASE, simpleTask.id));
    });

    test('should generate consistent worktree paths for parent tasks', () => {
      const parentTask = testTasks.find((t) => t.type === 'parent');
      if (!parentTask) {
        throw new Error('No parent task found in test data');
      }

      const path = pathResolver.getWorktreePath(parentTask.id);

      expect(path).toBe(join(WORKTREE_BASE, parentTask.id));
    });

    test('should resolve worktree base directory correctly', () => {
      const base = pathResolver.getWorktreeBase();

      expect(base).toBe(WORKTREE_BASE);
      expect(base).toContain('.worktrees');
      expect(base).toContain(TEST_PROJECT.split('/').pop());
    });

    test('should check if path is worktree correctly', () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      const worktreePath = pathResolver.getWorktreePath(simpleTask.id);
      const isWorktree = pathResolver.isWorktreePath(worktreePath);
      const isNotWorktree = pathResolver.isWorktreePath(TEST_PROJECT);

      expect(isWorktree).toBe(true);
      expect(isNotWorktree).toBe(false);
    });
  });

  describe('Branch Naming Patterns', () => {
    test('should generate consistent branch names', () => {
      const taskIds = ['feature-123', 'bug-fix-456', 'task_with_underscore'];

      for (const taskId of taskIds) {
        const branchName = branchService.getBranchName(taskId);

        expect(branchName).toBe(`task/${taskId}`);
        expect(branchName).toMatch(/^task\//);
      }
    });

    test('should extract task IDs from branch names', () => {
      const testCases = [
        { branch: 'task/feature-123', expected: 'feature-123' },
        { branch: 'task/bug-fix-456', expected: 'bug-fix-456' },
        { branch: 'task/task_with_underscore', expected: 'task_with_underscore' },
        { branch: 'main', expected: null },
        { branch: 'feature/something', expected: null },
        { branch: 'task-without-slash', expected: null },
      ];

      for (const { branch, expected } of testCases) {
        const extracted = branchService.extractTaskIdFromBranch(branch);
        expect(extracted).toBe(expected);
      }
    });

    test('should have inverse branch operations', () => {
      const taskIds = testTasks.map((t) => t.id).filter(Boolean);

      for (const taskId of taskIds) {
        const branchName = branchService.getBranchName(taskId);
        const extracted = branchService.extractTaskIdFromBranch(branchName);

        expect(extracted).toBe(taskId);
      }
    });

    test('should use consistent default base branch', () => {
      const baseBranch = branchService.getDefaultBaseBranch();

      expect(baseBranch).toBe('main');
    });
  });

  describe('Environment Creation and Switching', () => {
    test('should create environment for simple task', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      const result = await worktreeManager.createOrSwitchEnvironment(simpleTask.id);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.path).toBe(pathResolver.getWorktreePath(simpleTask.id));
      expect(result.data!.branch).toBe(branchService.getBranchName(simpleTask.id));
      expect(result.data!.taskId).toBe(simpleTask.id);
      expect(result.data!.created || result.data!.switched).toBe(true);

      // Verify worktree exists
      expect(existsSync(result.data!.path)).toBe(true);
    });

    test('should reuse existing environment on second call', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      // First call creates
      const result1 = await worktreeManager.createOrSwitchEnvironment(simpleTask.id);
      expect(result1.data!.created).toBe(true);

      // Second call switches
      const result2 = await worktreeManager.createOrSwitchEnvironment(simpleTask.id);
      expect(result2.data!.switched).toBe(true);
      expect(result2.data!.created).toBeUndefined();
      expect(result2.data!.path).toBe(result1.data!.path);
    });

    test('should share environment between parent and subtasks', async () => {
      const parentTask = testTasks.find((t) => t.type === 'parent' && t.subtasks.length > 0);
      if (!parentTask || !parentTask.subtasks[0]) {
        throw new Error('No parent with subtasks found in test data');
      }

      // Create environment for parent
      const parentResult = await worktreeManager.createOrSwitchEnvironment(parentTask.id);
      expect(parentResult.success).toBe(true);

      // Resolve subtask environment
      const subtaskResolution = await resolver.resolveTaskEnvironment(parentTask.subtasks[0]);
      expect(subtaskResolution.success).toBe(true);
      expect(subtaskResolution.environment!.taskId).toBe(parentTask.id);

      // Try to create environment for subtask - should use parent's
      const subtaskResult = await worktreeManager.createOrSwitchEnvironment(
        subtaskResolution.environment!.taskId
      );

      expect(subtaskResult.data!.path).toBe(parentResult.data!.path);
      expect(subtaskResult.data!.switched).toBe(true); // Should switch, not create
    });
  });

  describe('Environment Listing', () => {
    test('should list all active environments', async () => {
      // Create a few environments
      const tasksToCreate = testTasks.slice(0, 2);

      for (const task of tasksToCreate) {
        await worktreeManager.createOrSwitchEnvironment(task.id);
      }

      const environments = await worktreeManager.listEnvironments();

      expect(environments.length).toBeGreaterThanOrEqual(tasksToCreate.length);

      for (const task of tasksToCreate) {
        const env = environments.find((e) => e.taskId === task.id);
        expect(env).toBeDefined();
        expect(env!.branch).toBe(branchService.getBranchName(task.id));
        expect(env!.path).toBe(pathResolver.getWorktreePath(task.id));
      }
    });

    test('should include branch and path info in listings', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      await worktreeManager.createOrSwitchEnvironment(simpleTask.id);
      const environments = await worktreeManager.listEnvironments();

      const env = environments.find((e) => e.taskId === simpleTask.id);
      expect(env).toBeDefined();
      expect(env!.branch).toMatch(/^task\//);
      expect(env!.path).toContain('.worktrees');
      expect(env!.path).toContain(simpleTask.id);
    });
  });

  describe('Environment Cleanup', () => {
    test('should close environment and cleanup worktree', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      // Create environment
      const createResult = await worktreeManager.createOrSwitchEnvironment(simpleTask.id);
      expect(createResult.success).toBe(true);
      const envPath = createResult.data!.path;
      expect(existsSync(envPath)).toBe(true);

      // Close environment
      const closeResult = await worktreeManager.closeEnvironment(simpleTask.id);
      expect(closeResult.success).toBe(true);

      // Verify cleanup
      expect(existsSync(envPath)).toBe(false);

      // Verify not in listings
      const environments = await worktreeManager.listEnvironments();
      const env = environments.find((e) => e.taskId === simpleTask.id);
      expect(env).toBeUndefined();
    });

    test('should handle closing non-existent environment', async () => {
      const result = await worktreeManager.closeEnvironment('non-existent-task-789');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No environment found');
    });

    test('should keep branch by default when closing', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      const branchName = branchService.getBranchName(simpleTask.id);

      // Create environment
      await worktreeManager.createOrSwitchEnvironment(simpleTask.id);

      // Check branch exists
      const git = simpleGit(TEST_PROJECT);
      const branches = await git.branch();
      expect(branches.all).toContain(branchName);

      // Close environment
      await worktreeManager.closeEnvironment(simpleTask.id);

      // Branch should still exist
      const branchesAfter = await git.branch();
      expect(branchesAfter.all).toContain(branchName);
    });
  });

  describe('Docker Configuration', () => {
    test('should provide consistent Docker configuration', () => {
      const defaultImage = dockerService.getDefaultImage();
      const workspacePath = dockerService.getWorkspaceMountPath();
      const runArgs = dockerService.getDockerRunArgs();
      const envVars = dockerService.getDockerEnvVars();

      expect(defaultImage).toBe('my-claude:authenticated');
      expect(workspacePath).toBe('/workspace');
      expect(runArgs).toContain('--rm');
      expect(runArgs).toContain('-it');
      expect(envVars).toEqual({});
    });
  });

  describe('Mode Defaults', () => {
    test('should infer correct mode from task type', async () => {
      const testCases = [
        { type: 'bug', expectedMode: 'diagnose' },
        { type: 'feature', expectedMode: 'implement' },
        { type: 'spike', expectedMode: 'explore' },
        { type: 'chore', expectedMode: 'implement' },
        { type: 'documentation', expectedMode: 'implement' },
        { type: 'test', expectedMode: 'implement' },
        { type: 'idea', expectedMode: 'explore' },
      ];

      for (const { type, expectedMode } of testCases) {
        const task = await core.get(TEST_PROJECT, testTasks[0].id);
        if (task.success && task.data) {
          // Mock task with different type
          const mockTask = {
            ...task.data,
            document: {
              ...task.data.document,
              frontmatter: {
                ...task.data.document.frontmatter,
                type: type as core.TaskType,
              },
            },
          };

          const mode = modeService.inferMode(mockTask);
          expect(mode).toBe(expectedMode);
        }
      }
    });

    test('should override with mode tag when present', async () => {
      const task = await core.get(TEST_PROJECT, testTasks[0].id);
      if (task.success && task.data) {
        // Mock task with mode tag
        const mockTask = {
          ...task.data,
          document: {
            ...task.data.document,
            frontmatter: {
              ...task.data.document.frontmatter,
              type: 'feature' as core.TaskType, // Would normally be 'implement'
              tags: ['mode:explore', 'other-tag'],
            },
          },
        };

        const mode = modeService.inferMode(mockTask);
        expect(mode).toBe('explore'); // Tag overrides type
      }
    });

    test('should use orchestrate mode for parent tasks', async () => {
      const parentTask = testTasks.find((t) => t.type === 'parent');
      if (!parentTask) {
        throw new Error('No parent task found in test data');
      }

      const task = await core.get(TEST_PROJECT, parentTask.id);
      if (task.success && task.data) {
        const mode = modeService.inferMode(task.data);
        expect(mode).toBe('orchestrate');
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle task IDs with special characters', async () => {
      // Create task with special characters
      const specialTask = await core.create(TEST_PROJECT, {
        title: 'Task with special-chars_123',
        type: 'feature',
        area: 'test',
      });

      if (specialTask.success && specialTask.data) {
        const taskId = specialTask.data.metadata.id;
        const result = await resolver.resolveTaskEnvironment(taskId);

        expect(result.success).toBe(true);
        expect(result.environment!.taskId).toBe(taskId);

        // Test branch naming
        const branchName = branchService.getBranchName(taskId);
        expect(branchName).toBe(`task/${taskId}`);

        // Test path resolution
        const path = pathResolver.getWorktreePath(taskId);
        expect(path).toContain(taskId);
      }
    });

    test('should handle concurrent environment operations', async () => {
      const simpleTask = testTasks.find((t) => t.type === 'simple');
      if (!simpleTask) {
        throw new Error('No simple task found in test data');
      }

      // Simulate concurrent calls
      const promises = [
        worktreeManager.createOrSwitchEnvironment(simpleTask.id),
        worktreeManager.createOrSwitchEnvironment(simpleTask.id),
        worktreeManager.createOrSwitchEnvironment(simpleTask.id),
      ];

      const results = await Promise.all(promises);

      // All should succeed
      expect(results.every((r) => r.success)).toBe(true);

      // Only one should have created
      const createdCount = results.filter((r) => r.data?.created).length;
      expect(createdCount).toBe(1);

      // Others should have switched
      const switchedCount = results.filter((r) => r.data?.switched).length;
      expect(switchedCount).toBe(2);
    });

    test('should handle deeply nested subtask resolution', async () => {
      // This tests the current behavior - subtasks resolve to parent
      const parentTask = testTasks.find((t) => t.type === 'parent' && t.subtasks.length > 1);
      if (!parentTask) {
        throw new Error('No parent with multiple subtasks found');
      }

      // All subtasks should resolve to same parent environment
      const resolutions = await Promise.all(
        parentTask.subtasks.map((id) => resolver.resolveTaskEnvironment(id))
      );

      expect(resolutions.every((r) => r.success)).toBe(true);
      expect(resolutions.every((r) => r.environment!.taskId === parentTask.id)).toBe(true);
      expect(resolutions.every((r) => r.environment!.isParentEnvironment)).toBe(true);
      expect(resolutions.every((r) => r.environment!.resolvedFromSubtask)).toBe(true);
    });
  });
});
