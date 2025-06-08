/**
 * Unit tests for EnvironmentResolver
 * 
 * Tests the environment resolution logic that handles
 * parent/subtask relationships.
 */

import { describe, expect, test, beforeEach, mock, spyOn } from 'bun:test';
import { EnvironmentResolver } from '../../../../src/core/environment/resolver.js';
import { WorktreeManager } from '../../../../src/core/environment/worktree-manager.js';
import { BranchNamingService } from '../../../../src/core/environment/configuration-services.js';
import { EnvironmentError, EnvironmentErrorCodes } from '../../../../src/core/environment/types.js';
import * as taskCrud from '../../../../src/core/task-crud.js';
import type { Task, OperationResult } from '../../../../src/core/types.js';

describe('EnvironmentResolver', () => {
  let resolver: EnvironmentResolver;
  let mockWorktreeManager: WorktreeManager;
  let mockBranchNaming: BranchNamingService;
  
  // Mock task data
  const mockParentTask: Task = {
    metadata: {
      id: 'implement-auth-05A',
      filename: 'implement-auth-05A.task.md',
      path: '/test/implement-auth-05A.task.md',
      location: { workflowState: 'current' },
      isParentTask: true,
    },
    document: {
      title: 'Implement Authentication',
      frontmatter: {
        type: 'feature',
        status: 'in_progress',
        area: 'auth',
      },
      sections: {
        instruction: 'Build auth system',
        tasks: '- [ ] Design',
        deliverable: 'Auth system',
        log: '',
      },
    },
  };
  
  const mockSubtask: Task = {
    metadata: {
      id: '01_design-auth',
      filename: '01_design-auth.task.md',
      path: '/test/implement-auth-05A/01_design-auth.task.md',
      location: { workflowState: 'current' },
      isParentTask: false,
      parentTask: 'implement-auth-05A',
      sequenceNumber: '01',
    },
    document: {
      title: 'Design Authentication',
      frontmatter: {
        type: 'feature',
        status: 'todo',
        area: 'auth',
      },
      sections: {
        instruction: 'Design the auth flow',
        tasks: '- [ ] Create diagrams',
        deliverable: 'Design docs',
        log: '',
      },
    },
  };
  
  const mockSimpleTask: Task = {
    metadata: {
      id: 'fix-bug-06B',
      filename: 'fix-bug-06B.task.md',
      path: '/test/fix-bug-06B.task.md',
      location: { workflowState: 'current' },
      isParentTask: false,
    },
    document: {
      title: 'Fix Login Bug',
      frontmatter: {
        type: 'bug',
        status: 'todo',
        area: 'auth',
      },
      sections: {
        instruction: 'Fix the bug',
        tasks: '- [ ] Debug',
        deliverable: 'Fixed bug',
        log: '',
      },
    },
  };
  
  beforeEach(() => {
    // Mock worktree manager
    mockWorktreeManager = {
      exists: mock(async () => false),
      create: mock(async (taskId: string) => ({
        path: `/test/worktrees/${taskId}`,
        branch: `task/${taskId}`,
        taskId,
        commit: 'abc123',
      })),
      list: mock(async () => []),
    } as any;
    
    // Mock branch naming service
    mockBranchNaming = new BranchNamingService();
    
    // Create resolver with mocks
    resolver = new EnvironmentResolver(mockWorktreeManager, mockBranchNaming);
  });
  
  describe('resolveEnvironmentId', () => {
    test('should return parent ID for subtasks', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: true,
        data: mockSubtask,
      } as OperationResult<Task>);
      
      const envId = await resolver.resolveEnvironmentId('01_design-auth');
      expect(envId).toBe('implement-auth-05A');
      expect(getTaskSpy).toHaveBeenCalledWith(expect.any(String), '01_design-auth');
      
      getTaskSpy.mockRestore();
    });
    
    test('should return task ID for parent tasks', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: true,
        data: mockParentTask,
      } as OperationResult<Task>);
      
      const envId = await resolver.resolveEnvironmentId('implement-auth-05A');
      expect(envId).toBe('implement-auth-05A');
      
      getTaskSpy.mockRestore();
    });
    
    test('should return task ID for simple tasks', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: true,
        data: mockSimpleTask,
      } as OperationResult<Task>);
      
      const envId = await resolver.resolveEnvironmentId('fix-bug-06B');
      expect(envId).toBe('fix-bug-06B');
      
      getTaskSpy.mockRestore();
    });
    
    test('should throw error for empty task ID', async () => {
      await expect(resolver.resolveEnvironmentId('')).rejects.toThrow(EnvironmentError);
      await expect(resolver.resolveEnvironmentId('')).rejects.toMatchObject({
        code: EnvironmentErrorCodes.INVALID_TASK_ID,
      });
    });
    
    test('should throw error when task not found', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: false,
        error: 'Task not found',
      } as OperationResult<Task>);
      
      await expect(resolver.resolveEnvironmentId('non-existent')).rejects.toThrow(EnvironmentError);
      await expect(resolver.resolveEnvironmentId('non-existent')).rejects.toMatchObject({
        code: EnvironmentErrorCodes.TASK_NOT_FOUND,
      });
      
      getTaskSpy.mockRestore();
    });
  });
  
  describe('ensureEnvironment', () => {
    test('should return existing environment info', async () => {
      mockWorktreeManager.exists = mock(async () => true);
      mockWorktreeManager.list = mock(async () => [{
        path: '/test/worktrees/test-task',
        branch: 'task/test-task',
        taskId: 'test-task',
        commit: 'abc123',
      }]);
      
      const envInfo = await resolver.ensureEnvironment('test-task');
      expect(envInfo).toEqual({
        id: 'test-task',
        path: '/test/worktrees/test-task',
        branch: 'task/test-task',
        exists: true,
        isActive: true,
      });
    });
    
    test('should create new environment if not exists', async () => {
      mockWorktreeManager.exists = mock(async () => false);
      
      const envInfo = await resolver.ensureEnvironment('new-task');
      expect(envInfo).toEqual({
        id: 'new-task',
        path: '/test/worktrees/new-task',
        branch: 'task/new-task',
        exists: true,
        isActive: true,
      });
      expect(mockWorktreeManager.create).toHaveBeenCalledWith('new-task');
    });
    
    test('should throw error for empty environment ID', async () => {
      await expect(resolver.ensureEnvironment('')).rejects.toThrow(EnvironmentError);
      await expect(resolver.ensureEnvironment('')).rejects.toMatchObject({
        code: EnvironmentErrorCodes.INVALID_TASK_ID,
      });
    });
  });
  
  describe('getEnvironmentInfo', () => {
    test('should return environment info if exists', async () => {
      mockWorktreeManager.exists = mock(async () => true);
      mockWorktreeManager.list = mock(async () => [{
        path: '/test/worktrees/test-task',
        branch: 'task/test-task',
        taskId: 'test-task',
        commit: 'abc123',
      }]);
      
      const envInfo = await resolver.getEnvironmentInfo('test-task');
      expect(envInfo).toEqual({
        id: 'test-task',
        path: '/test/worktrees/test-task',
        branch: 'task/test-task',
        exists: true,
        isActive: true,
      });
    });
    
    test('should return null if not exists', async () => {
      mockWorktreeManager.exists = mock(async () => false);
      
      const envInfo = await resolver.getEnvironmentInfo('non-existent');
      expect(envInfo).toBe(null);
    });
    
    test('should return null for empty ID', async () => {
      const envInfo = await resolver.getEnvironmentInfo('');
      expect(envInfo).toBe(null);
    });
    
    test('should return null on errors', async () => {
      mockWorktreeManager.exists = mock(async () => {
        throw new Error('Git error');
      });
      
      const envInfo = await resolver.getEnvironmentInfo('error-task');
      expect(envInfo).toBe(null);
    });
  });
  
  describe('helper methods', () => {
    test('getTaskEnvironmentInfo should resolve task first', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: true,
        data: mockSubtask,
      } as OperationResult<Task>);
      
      mockWorktreeManager.exists = mock(async () => true);
      mockWorktreeManager.list = mock(async () => [{
        path: '/test/worktrees/implement-auth-05A',
        branch: 'task/implement-auth-05A',
        taskId: 'implement-auth-05A',
        commit: 'abc123',
      }]);
      
      const envInfo = await resolver.getTaskEnvironmentInfo('01_design-auth');
      expect(envInfo).toEqual({
        id: 'implement-auth-05A', // Parent ID, not subtask ID
        path: '/test/worktrees/implement-auth-05A',
        branch: 'task/implement-auth-05A',
        exists: true,
        isActive: true,
      });
      
      getTaskSpy.mockRestore();
    });
    
    test('ensureTaskEnvironment should resolve task first', async () => {
      const getTaskSpy = spyOn(taskCrud, 'get').mockResolvedValue({
        success: true,
        data: mockSubtask,
      } as OperationResult<Task>);
      
      mockWorktreeManager.exists = mock(async () => false);
      
      const envInfo = await resolver.ensureTaskEnvironment('01_design-auth');
      expect(envInfo.id).toBe('implement-auth-05A'); // Parent ID
      expect(mockWorktreeManager.create).toHaveBeenCalledWith('implement-auth-05A');
      
      getTaskSpy.mockRestore();
    });
  });
});