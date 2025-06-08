/**
 * Unit tests for Configuration Services
 * 
 * Tests the centralized configuration services that ensure
 * all magic values are defined in one place.
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import {
  BranchNamingService,
  DockerConfigService,
  ModeDefaultsService,
} from '../../../../src/core/environment/configuration-services.js';
import type { Task, TaskType } from '../../../../src/core/types.js';
import type { WorkMode } from '../../../../src/core/environment/types.js';

describe('BranchNamingService', () => {
  let service: BranchNamingService;
  
  beforeEach(() => {
    service = new BranchNamingService();
  });
  
  describe('getBranchName', () => {
    test('should return branch name with task prefix', () => {
      expect(service.getBranchName('implement-auth-05A')).toBe('task/implement-auth-05A');
      expect(service.getBranchName('fix-bug-06B')).toBe('task/fix-bug-06B');
    });
    
    test('should handle task IDs with special characters', () => {
      expect(service.getBranchName('task_123-test')).toBe('task/task_123-test');
    });
  });
  
  describe('getDefaultBaseBranch', () => {
    test('should return main as default', () => {
      expect(service.getDefaultBaseBranch()).toBe('main');
    });
  });
  
  describe('extractTaskIdFromBranch', () => {
    test('should extract task ID from branch name', () => {
      expect(service.extractTaskIdFromBranch('task/implement-auth-05A')).toBe('implement-auth-05A');
      expect(service.extractTaskIdFromBranch('task/fix-bug-06B')).toBe('fix-bug-06B');
    });
    
    test('should return null for non-task branches', () => {
      expect(service.extractTaskIdFromBranch('main')).toBe(null);
      expect(service.extractTaskIdFromBranch('feature/something')).toBe(null);
      expect(service.extractTaskIdFromBranch('task-without-slash')).toBe(null);
    });
    
    test('should handle edge cases', () => {
      expect(service.extractTaskIdFromBranch('')).toBe(null);
      expect(service.extractTaskIdFromBranch('task/')).toBe('');
    });
  });
  
  describe('pattern consistency', () => {
    test('should have inverse functions work correctly', () => {
      const taskIds = ['test-123', 'feature-auth-05A', 'bug_fix-06B'];
      
      for (const taskId of taskIds) {
        const branch = service.getBranchName(taskId);
        const extracted = service.extractTaskIdFromBranch(branch);
        expect(extracted).toBe(taskId);
      }
    });
  });
});

describe('DockerConfigService', () => {
  let service: DockerConfigService;
  
  beforeEach(() => {
    service = new DockerConfigService();
  });
  
  describe('getDefaultImage', () => {
    test('should return default Docker image', () => {
      expect(service.getDefaultImage()).toBe('my-claude:authenticated');
    });
  });
  
  describe('getWorkspaceMountPath', () => {
    test('should return workspace mount path', () => {
      expect(service.getWorkspaceMountPath()).toBe('/workspace');
    });
  });
  
  describe('getDockerRunArgs', () => {
    test('should return default Docker run arguments', () => {
      const args = service.getDockerRunArgs();
      expect(args).toContain('--rm');
      expect(args).toContain('-it');
    });
  });
  
  describe('getDockerEnvVars', () => {
    test('should return empty env vars by default', () => {
      const envVars = service.getDockerEnvVars();
      expect(envVars).toEqual({});
    });
  });
});

describe('ModeDefaultsService', () => {
  let service: ModeDefaultsService;
  
  beforeEach(() => {
    service = new ModeDefaultsService();
  });
  
  const createMockTask = (type: TaskType, isParent = false, tags: string[] = []): Task => ({
    metadata: {
      id: 'test-task',
      filename: 'test-task.task.md',
      path: '/test/test-task.task.md',
      location: { workflowState: 'current' },
      isParentTask: isParent,
    },
    document: {
      title: 'Test Task',
      frontmatter: {
        type,
        status: 'todo',
        area: 'test',
        tags,
      },
      sections: {
        instruction: '',
        tasks: '',
        deliverable: '',
        log: '',
      },
    },
  });
  
  describe('inferMode', () => {
    test('should return orchestrate for parent tasks', () => {
      const parentTask = createMockTask('feature', true);
      expect(service.inferMode(parentTask)).toBe('orchestrate');
    });
    
    test('should respect explicit mode tags', () => {
      const taskWithMode = createMockTask('feature', false, ['mode:explore', 'other-tag']);
      expect(service.inferMode(taskWithMode)).toBe('explore');
    });
    
    test('should ignore invalid mode tags', () => {
      const taskWithInvalidMode = createMockTask('bug', false, ['mode:invalid']);
      expect(service.inferMode(taskWithInvalidMode)).toBe('diagnose'); // Falls back to type-based
    });
    
    test('should infer mode based on task type', () => {
      expect(service.inferMode(createMockTask('bug'))).toBe('diagnose');
      expect(service.inferMode(createMockTask('spike'))).toBe('explore');
      expect(service.inferMode(createMockTask('feature'))).toBe('implement');
      expect(service.inferMode(createMockTask('chore'))).toBe('implement');
      expect(service.inferMode(createMockTask('documentation'))).toBe('implement');
      expect(service.inferMode(createMockTask('test'))).toBe('implement');
      expect(service.inferMode(createMockTask('idea'))).toBe('explore');
    });
    
    test('should default to implement for unknown types', () => {
      // This shouldn't happen with our type system, but testing the default
      const task = createMockTask('feature');
      (task.document.frontmatter as any).type = 'unknown-type';
      expect(service.inferMode(task)).toBe('implement');
    });
  });
  
  describe('isValidMode', () => {
    test('should validate correct modes', () => {
      expect(service.isValidMode('implement')).toBe(true);
      expect(service.isValidMode('explore')).toBe(true);
      expect(service.isValidMode('orchestrate')).toBe(true);
      expect(service.isValidMode('diagnose')).toBe(true);
    });
    
    test('should reject invalid modes', () => {
      expect(service.isValidMode('invalid')).toBe(false);
      expect(service.isValidMode('')).toBe(false);
      expect(service.isValidMode('IMPLEMENT')).toBe(false); // Case sensitive
    });
  });
  
  describe('getModeDescription', () => {
    test('should return correct descriptions', () => {
      expect(service.getModeDescription('implement')).toBe('Build and code the solution');
      expect(service.getModeDescription('explore')).toBe('Research and investigate options');
      expect(service.getModeDescription('orchestrate')).toBe('Manage subtasks and coordinate work');
      expect(service.getModeDescription('diagnose')).toBe('Debug and find root causes');
    });
  });
});