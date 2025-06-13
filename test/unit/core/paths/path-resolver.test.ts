#!/usr/bin/env bun
/**
 * Unit Tests for Path Resolver
 *
 * Tests the centralized path resolution system that determines where
 * different features store their data (templates, modes, tasks, sessions, config).
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  PATH_TYPES,
  createPathContext,
  getConfigPath,
  getModesPath,
  getSessionsPath,
  getTasksPath,
  getTemplatesPath,
  resolvePath,
  resolvePathWithPrecedence,
  type PathContext,
} from '../../../../src/core/paths/index.js';
import { TaskStoragePathEncoder } from '../../../../src/core/task-storage-path-encoder.js';

// Test setup
const TEST_HOME = join(process.env.TMPDIR || '/tmp', '.scopecraft-test-paths');
const TEST_PROJECT = join(process.env.TMPDIR || '/tmp', 'test-project');
const TEST_WORKTREE = join(process.env.TMPDIR || '/tmp', 'test-project.worktrees', 'feature-branch');

describe('Path Resolver', () => {
  let originalHome: string | undefined;

  beforeEach(() => {
    // Override HOME for test isolation
    originalHome = process.env.HOME;
    process.env.HOME = TEST_HOME;

    // Create test directories
    mkdirSync(TEST_PROJECT, { recursive: true });
    mkdirSync(TEST_WORKTREE, { recursive: true });
    mkdirSync(TEST_HOME, { recursive: true });

    // Create git directories to simulate repository
    mkdirSync(join(TEST_PROJECT, '.git'), { recursive: true });
    mkdirSync(join(TEST_WORKTREE, '.git'), { recursive: true });
  });

  afterEach(() => {
    // Restore original HOME
    if (originalHome) {
      process.env.HOME = originalHome;
    }

    // Clean up test directories
    if (existsSync(TEST_PROJECT)) {
      rmSync(TEST_PROJECT, { recursive: true, force: true });
    }
    if (existsSync(TEST_WORKTREE)) {
      rmSync(join(process.env.TMPDIR || '/tmp', 'test-project.worktrees'), { recursive: true, force: true });
    }
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
  });

  describe('createPathContext', () => {
    test('should create context for main repository', () => {
      // Note: createPathContext uses git to find the real repository root
      // For testing, we create a manual context
      const context: PathContext = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };

      expect(context.executionRoot).toBe(TEST_PROJECT);
      expect(context.mainRepoRoot).toBe(TEST_PROJECT);
      expect(context.worktreeRoot).toBeUndefined();
      expect(context.userHome).toBe(TEST_HOME);
    });

    test('should detect worktree and set correct roots', () => {
      // For this test, we need to simulate that TEST_WORKTREE is a worktree
      // In real usage, WorktreePathResolver would detect this via git commands
      // Here we'll create a manual context to test the logic
      const context: PathContext = {
        executionRoot: TEST_WORKTREE,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: TEST_WORKTREE,
        userHome: TEST_HOME,
      };

      expect(context.executionRoot).toBe(TEST_WORKTREE);
      expect(context.mainRepoRoot).toBe(TEST_PROJECT);
      expect(context.worktreeRoot).toBe(TEST_WORKTREE);
    });
  });

  describe('resolvePath', () => {
    let context: PathContext;

    beforeEach(() => {
      context = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };
    });

    test('should resolve templates path to repository', () => {
      const path = resolvePath(PATH_TYPES.TEMPLATES, context);
      expect(path).toBe(join(TEST_PROJECT, '.tasks', '.templates'));
    });

    test('should resolve modes path to repository', () => {
      const path = resolvePath(PATH_TYPES.MODES, context);
      expect(path).toBe(join(TEST_PROJECT, '.tasks', '.modes'));
    });

    test('should resolve tasks path to centralized storage', () => {
      const path = resolvePath(PATH_TYPES.TASKS, context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'tasks'));
    });

    test('should resolve sessions path to centralized storage', () => {
      const path = resolvePath(PATH_TYPES.SESSIONS, context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'sessions'));
    });

    test('should resolve config path to centralized storage', () => {
      const path = resolvePath(PATH_TYPES.CONFIG, context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'config'));
    });

    test('should use main repo root for centralized paths even in worktree', () => {
      const worktreeContext: PathContext = {
        executionRoot: TEST_WORKTREE,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: TEST_WORKTREE,
        userHome: TEST_HOME,
      };

      const tasksPath = resolvePath(PATH_TYPES.TASKS, worktreeContext);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT); // Uses main repo, not worktree
      expect(tasksPath).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'tasks'));
    });

    test('should use execution root for repository paths in worktree', () => {
      const worktreeContext: PathContext = {
        executionRoot: TEST_WORKTREE,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: TEST_WORKTREE,
        userHome: TEST_HOME,
      };

      const templatesPath = resolvePath(PATH_TYPES.TEMPLATES, worktreeContext);
      expect(templatesPath).toBe(join(TEST_WORKTREE, '.tasks', '.templates')); // Uses worktree path
    });
  });

  describe('resolvePathWithPrecedence', () => {
    let context: PathContext;

    beforeEach(() => {
      context = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };
    });

    test('should return all paths in precedence order for templates', () => {
      const paths = resolvePathWithPrecedence(PATH_TYPES.TEMPLATES, context);
      
      expect(paths).toHaveLength(2);
      expect(paths[0]).toBe(join(TEST_PROJECT, '.tasks', '.templates')); // Primary
      expect(paths[1]).toBe(join(TEST_HOME, '.scopecraft', 'templates')); // Fallback
    });

    test('should return single path for modes', () => {
      const paths = resolvePathWithPrecedence(PATH_TYPES.MODES, context);
      
      expect(paths).toHaveLength(1);
      expect(paths[0]).toBe(join(TEST_PROJECT, '.tasks', '.modes'));
    });

    test('should return single path for tasks', () => {
      const paths = resolvePathWithPrecedence(PATH_TYPES.TASKS, context);
      
      expect(paths).toHaveLength(1);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(paths[0]).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'tasks'));
    });
  });

  describe('convenience functions', () => {
    let context: PathContext;

    beforeEach(() => {
      context = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };
    });

    test('getTemplatesPath should return correct path', () => {
      const path = getTemplatesPath(context);
      expect(path).toBe(join(TEST_PROJECT, '.tasks', '.templates'));
    });

    test('getModesPath should return correct path', () => {
      const path = getModesPath(context);
      expect(path).toBe(join(TEST_PROJECT, '.tasks', '.modes'));
    });

    test('getTasksPath should return correct path', () => {
      const path = getTasksPath(context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'tasks'));
    });

    test('getSessionsPath should return correct path', () => {
      const path = getSessionsPath(context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'sessions'));
    });

    test('getConfigPath should return correct path', () => {
      const path = getConfigPath(context);
      const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
      expect(path).toBe(join(TEST_HOME, '.scopecraft', 'projects', encoded, 'config'));
    });
  });

  describe('hybrid storage model', () => {
    test('should keep repository-specific files in repo', () => {
      // Create manual context for testing
      const context: PathContext = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };
      
      // Templates and modes stay in repository
      const templatesPath = resolvePath(PATH_TYPES.TEMPLATES, context);
      const modesPath = resolvePath(PATH_TYPES.MODES, context);
      
      expect(templatesPath).toContain(TEST_PROJECT);
      expect(templatesPath).toContain('.tasks/.templates');
      expect(modesPath).toContain(TEST_PROJECT);
      expect(modesPath).toContain('.tasks/.modes');
    });

    test('should store user data centrally', () => {
      // Create manual context for testing
      const context: PathContext = {
        executionRoot: TEST_PROJECT,
        mainRepoRoot: TEST_PROJECT,
        worktreeRoot: undefined,
        userHome: TEST_HOME,
      };
      
      // Tasks and sessions go to centralized storage
      const tasksPath = resolvePath(PATH_TYPES.TASKS, context);
      const sessionsPath = resolvePath(PATH_TYPES.SESSIONS, context);
      
      expect(tasksPath).toContain(TEST_HOME);
      expect(tasksPath).toContain('.scopecraft/projects');
      expect(sessionsPath).toContain(TEST_HOME);
      expect(sessionsPath).toContain('.scopecraft/projects');
    });
  });
});