#!/usr/bin/env bun
/**
 * Unit Tests for Path Strategies
 *
 * Tests the individual path resolution strategies that determine
 * where different features store their data.
 */

import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import {
  centralizedConfigStrategy,
  centralizedSessionsStrategy,
  centralizedStrategy,
  centralizedTasksStrategy,
  globalTemplatesStrategy,
  globalUserStrategy,
  localOverrideStrategy,
  pathStrategies,
  repoModesStrategy,
  repoStrategy,
  repoTemplatesStrategy,
} from '../../../../src/core/paths/strategies.js';
import { PATH_TYPES, type PathContext } from '../../../../src/core/paths/types.js';
import { TaskStoragePathEncoder } from '../../../../src/core/task-storage-path-encoder.js';

describe('Path Strategies', () => {
  const mockContext: PathContext = {
    executionRoot: '/test/project',
    mainRepoRoot: '/test/main-repo',
    worktreeRoot: '/test/project',
    userHome: '/test/home',
  };

  describe('Repository strategies', () => {
    test('repoStrategy should return .tasks in execution root', () => {
      const result = repoStrategy(mockContext);
      expect(result).toBe('/test/project/.tasks');
    });

    test('repoTemplatesStrategy should return .tasks/.templates', () => {
      const result = repoTemplatesStrategy(mockContext);
      expect(result).toBe('/test/project/.tasks/.templates');
    });

    test('repoModesStrategy should return .tasks/.modes', () => {
      const result = repoModesStrategy(mockContext);
      expect(result).toBe('/test/project/.tasks/.modes');
    });
  });

  describe('Centralized strategies', () => {
    test('centralizedStrategy should use main repo root for encoding', () => {
      const result = centralizedStrategy(mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}`);
    });

    test('centralizedTasksStrategy should return centralized tasks path', () => {
      const result = centralizedTasksStrategy(mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}/tasks`);
    });

    test('centralizedSessionsStrategy should return centralized sessions path', () => {
      const result = centralizedSessionsStrategy(mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}/sessions`);
    });

    test('centralizedConfigStrategy should return centralized config path', () => {
      const result = centralizedConfigStrategy(mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}/config`);
    });
  });

  describe('Global strategies', () => {
    test('globalUserStrategy should return user scopecraft directory', () => {
      const result = globalUserStrategy(mockContext);
      expect(result).toBe('/test/home/.scopecraft');
    });

    test('globalTemplatesStrategy should return global templates path', () => {
      const result = globalTemplatesStrategy(mockContext);
      expect(result).toBe('/test/home/.scopecraft/templates');
    });
  });

  describe('Local override strategy', () => {
    test('localOverrideStrategy should return local override path', () => {
      const result = localOverrideStrategy(mockContext);
      expect(result).toBe('/test/project/.local/.tasks');
    });
  });

  describe('pathStrategies configuration', () => {
    test('templates should have repo primary and global fallback', () => {
      const strategies = pathStrategies[PATH_TYPES.TEMPLATES];
      expect(strategies).toHaveLength(2);
      
      const primary = strategies[0](mockContext);
      const fallback = strategies[1](mockContext);
      
      expect(primary).toBe('/test/project/.tasks/.templates');
      expect(fallback).toBe('/test/home/.scopecraft/templates');
    });

    test('modes should only have repo strategy', () => {
      const strategies = pathStrategies[PATH_TYPES.MODES];
      expect(strategies).toHaveLength(1);
      
      const result = strategies[0](mockContext);
      expect(result).toBe('/test/project/.tasks/.modes');
    });

    test('tasks should only have centralized strategy', () => {
      const strategies = pathStrategies[PATH_TYPES.TASKS];
      expect(strategies).toHaveLength(1);
      
      const result = strategies[0](mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}/tasks`);
    });

    test('sessions should only have centralized strategy', () => {
      const strategies = pathStrategies[PATH_TYPES.SESSIONS];
      expect(strategies).toHaveLength(1);
      
      const result = strategies[0](mockContext);
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(result).toBe(`/test/home/.scopecraft/projects/${encoded}/sessions`);
    });

    test('config should have centralized primary and repo fallback', () => {
      const strategies = pathStrategies[PATH_TYPES.CONFIG];
      expect(strategies).toHaveLength(2);
      
      const primary = strategies[0](mockContext);
      const fallback = strategies[1](mockContext);
      
      const encoded = TaskStoragePathEncoder.encode('/test/main-repo');
      expect(primary).toBe(`/test/home/.scopecraft/projects/${encoded}/config`);
      expect(fallback).toBe('/test/project/.tasks');
    });
  });

  describe('worktree handling', () => {
    test('repo strategies should use execution root (worktree path)', () => {
      const worktreeContext: PathContext = {
        executionRoot: '/test/worktree',
        mainRepoRoot: '/test/main-repo',
        worktreeRoot: '/test/worktree',
        userHome: '/test/home',
      };

      expect(repoStrategy(worktreeContext)).toBe('/test/worktree/.tasks');
      expect(repoTemplatesStrategy(worktreeContext)).toBe('/test/worktree/.tasks/.templates');
      expect(repoModesStrategy(worktreeContext)).toBe('/test/worktree/.tasks/.modes');
    });

    test('centralized strategies should use main repo root', () => {
      const worktreeContext: PathContext = {
        executionRoot: '/test/worktree',
        mainRepoRoot: '/test/main-repo',
        worktreeRoot: '/test/worktree',
        userHome: '/test/home',
      };

      const encoded = TaskStoragePathEncoder.encode('/test/main-repo'); // Not worktree
      expect(centralizedTasksStrategy(worktreeContext)).toBe(`/test/home/.scopecraft/projects/${encoded}/tasks`);
      expect(centralizedSessionsStrategy(worktreeContext)).toBe(`/test/home/.scopecraft/projects/${encoded}/sessions`);
    });
  });

  describe('path encoding consistency', () => {
    test('should produce consistent encoding for same path', () => {
      const context1: PathContext = {
        executionRoot: '/test/project',
        mainRepoRoot: '/test/project',
        worktreeRoot: undefined,
        userHome: '/test/home',
      };

      const context2: PathContext = {
        executionRoot: '/test/worktree',
        mainRepoRoot: '/test/project',
        worktreeRoot: '/test/worktree',
        userHome: '/test/home',
      };

      // Both contexts have same main repo, should produce same centralized paths
      const tasks1 = centralizedTasksStrategy(context1);
      const tasks2 = centralizedTasksStrategy(context2);
      
      expect(tasks1).toBe(tasks2);
    });

    test('should produce different encoding for different projects', () => {
      const context1: PathContext = {
        executionRoot: '/test/project1',
        mainRepoRoot: '/test/project1',
        worktreeRoot: undefined,
        userHome: '/test/home',
      };

      const context2: PathContext = {
        executionRoot: '/test/project2',
        mainRepoRoot: '/test/project2',
        worktreeRoot: undefined,
        userHome: '/test/home',
      };

      const tasks1 = centralizedTasksStrategy(context1);
      const tasks2 = centralizedTasksStrategy(context2);
      
      expect(tasks1).not.toBe(tasks2);
      expect(tasks1).toContain('/test/home/.scopecraft/projects/');
      expect(tasks2).toContain('/test/home/.scopecraft/projects/');
    });
  });
});