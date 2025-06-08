/**
 * Unit tests for WorktreePathResolver
 * 
 * Tests the critical path resolution logic that centralizes
 * all worktree path patterns.
 */

import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { join, resolve, dirname, basename } from 'node:path';
import { WorktreePathResolver } from '../../../../src/core/environment/worktree-path-resolver.js';
import { ConfigurationManager } from '../../../../src/core/config/configuration-manager.js';
import { EnvironmentError, EnvironmentErrorCodes } from '../../../../src/core/environment/types.js';

describe('WorktreePathResolver', () => {
  let resolver: WorktreePathResolver;
  let mockConfig: ConfigurationManager;
  
  beforeEach(() => {
    // Create a mock configuration manager
    mockConfig = {
      getRootConfig: mock(() => ({
        path: '/Users/test/projects/my-awesome-project',
        source: 'test',
        validated: true,
      })),
    } as any;
    
    resolver = new WorktreePathResolver(mockConfig);
  });
  
  describe('getWorktreeBasePath', () => {
    test('should return correct worktree base path for project', async () => {
      const basePath = await resolver.getWorktreeBasePath();
      expect(basePath).toBe('/Users/test/projects/my-awesome-project.worktrees');
    });
    
    test('should handle project names with spaces', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: '/Users/test/projects/My Cool Project',
        source: 'test',
        validated: true,
      }));
      
      const basePath = await resolver.getWorktreeBasePath();
      expect(basePath).toBe('/Users/test/projects/my cool project.worktrees');
    });
    
    test('should handle project names with special characters', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: '/Users/test/projects/project-2024_v1.0',
        source: 'test',
        validated: true,
      }));
      
      const basePath = await resolver.getWorktreeBasePath();
      expect(basePath).toBe('/Users/test/projects/project-2024_v1.0.worktrees');
    });
    
    test('should work for different project paths', async () => {
      const testCases = [
        {
          projectPath: '/home/alice/code/scopecraft',
          expected: '/home/alice/code/scopecraft.worktrees',
        },
        {
          projectPath: '/Users/bob/work/client-app',
          expected: '/Users/bob/work/client-app.worktrees',
        },
        {
          projectPath: '/var/projects/awesome-tool',
          expected: '/var/projects/awesome-tool.worktrees',
        },
      ];
      
      for (const testCase of testCases) {
        mockConfig.getRootConfig = mock(() => ({
          path: testCase.projectPath,
          source: 'test',
          validated: true,
        }));
        
        const resolver = new WorktreePathResolver(mockConfig);
        const basePath = await resolver.getWorktreeBasePath();
        expect(basePath).toBe(testCase.expected);
      }
    });
    
    test('should throw error when no valid project root', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: null,
        source: 'test',
        validated: false,
      }));
      
      await expect(resolver.getWorktreeBasePath()).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreeBasePath()).rejects.toMatchObject({
        code: EnvironmentErrorCodes.CONFIGURATION_ERROR,
      });
    });
    
    test('should wrap unexpected errors', async () => {
      mockConfig.getRootConfig = mock(() => {
        throw new Error('Unexpected error');
      });
      
      await expect(resolver.getWorktreeBasePath()).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreeBasePath()).rejects.toMatchObject({
        code: EnvironmentErrorCodes.PATH_RESOLUTION_FAILED,
      });
    });
  });
  
  describe('getWorktreePath', () => {
    test('should return correct worktree path for task', async () => {
      const taskId = 'implement-auth-05A';
      const worktreePath = await resolver.getWorktreePath(taskId);
      expect(worktreePath).toBe('/Users/test/projects/my-awesome-project.worktrees/implement-auth-05A');
    });
    
    test('should handle task IDs with special characters', async () => {
      const taskId = 'fix-bug_123-06B';
      const worktreePath = await resolver.getWorktreePath(taskId);
      expect(worktreePath).toBe('/Users/test/projects/my-awesome-project.worktrees/fix-bug_123-06B');
    });
    
    test('should throw error for empty task ID', async () => {
      await expect(resolver.getWorktreePath('')).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreePath('')).rejects.toMatchObject({
        code: EnvironmentErrorCodes.INVALID_TASK_ID,
      });
    });
    
    test('should throw error for null task ID', async () => {
      await expect(resolver.getWorktreePath(null as any)).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreePath(null as any)).rejects.toMatchObject({
        code: EnvironmentErrorCodes.INVALID_TASK_ID,
      });
    });
    
    test('should throw error for undefined task ID', async () => {
      await expect(resolver.getWorktreePath(undefined as any)).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreePath(undefined as any)).rejects.toMatchObject({
        code: EnvironmentErrorCodes.INVALID_TASK_ID,
      });
    });
    
    test('should propagate base path errors', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: null,
        source: 'test',
        validated: false,
      }));
      
      await expect(resolver.getWorktreePath('task-123')).rejects.toThrow(EnvironmentError);
      await expect(resolver.getWorktreePath('task-123')).rejects.toMatchObject({
        code: EnvironmentErrorCodes.CONFIGURATION_ERROR,
      });
    });
  });
  
  describe('getProjectName', () => {
    test('should return lowercase project name', async () => {
      const projectName = await resolver.getProjectName();
      expect(projectName).toBe('my-awesome-project');
    });
    
    test('should handle project names with uppercase', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: '/Users/test/projects/MyProject',
        source: 'test',
        validated: true,
      }));
      
      const projectName = await resolver.getProjectName();
      expect(projectName).toBe('myproject');
    });
    
    test('should throw error when no valid project root', async () => {
      mockConfig.getRootConfig = mock(() => ({
        path: null,
        source: 'test',
        validated: false,
      }));
      
      await expect(resolver.getProjectName()).rejects.toThrow(EnvironmentError);
      await expect(resolver.getProjectName()).rejects.toMatchObject({
        code: EnvironmentErrorCodes.CONFIGURATION_ERROR,
      });
    });
  });
  
  describe('path pattern isolation', () => {
    test('should have the pattern defined only in getWorktreeBasePath', async () => {
      // This test verifies our architectural requirement that the path pattern
      // is only defined in one place. We check this by ensuring that
      // getWorktreePath calls getWorktreeBasePath rather than duplicating logic
      
      let basePathCalled = false;
      const originalGetBasePath = resolver.getWorktreeBasePath.bind(resolver);
      resolver.getWorktreeBasePath = mock(async () => {
        basePathCalled = true;
        return originalGetBasePath();
      });
      
      await resolver.getWorktreePath('test-task');
      expect(basePathCalled).toBe(true);
    });
  });
});