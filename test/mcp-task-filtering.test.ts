/**
 * MCP Task Filtering Tests
 * 
 * Tests the task_type filtering functionality specifically
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import {
  handleParentCreate,
  handleTaskCreate,
  handleTaskList,
} from '../src/mcp/handlers.js';

describe('MCP Task Type Filtering Tests', () => {
  let configManager: ConfigurationManager;
  let testDir: string;
  let testProjectDir: string;

  beforeEach(async () => {
    // Clear singleton instance for fresh tests
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();

    // Create test directories with V2 structure
    testDir = path.join(os.tmpdir(), 'mcp-task-filtering-test');
    testProjectDir = path.join(testDir, 'test-project');

    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(testProjectDir, { recursive: true });
    
    // Create V2 workflow directories
    fs.mkdirSync(path.join(testProjectDir, '.tasks', 'backlog'), { recursive: true });
    fs.mkdirSync(path.join(testProjectDir, '.tasks', 'current'), { recursive: true });
    fs.mkdirSync(path.join(testProjectDir, '.tasks', 'archive'), { recursive: true });

    // Set the test project as root
    configManager.setRootFromSession(testProjectDir);
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Task Type Filtering', () => {
    beforeEach(async () => {
      // Create test data: mix of simple tasks and parent tasks
      await handleTaskCreate({
        title: 'Simple Task One',
        type: 'bug',
        area: 'test',
      });

      await handleTaskCreate({
        title: 'Simple Task Two',
        type: 'feature',
        area: 'test',
      });

      await handleParentCreate({
        title: 'Parent Task One',
        type: 'feature',
        area: 'test',
        subtasks: [
          { title: 'Subtask One' },
          { title: 'Subtask Two' },
        ],
      });

      await handleParentCreate({
        title: 'Parent Task Two',
        type: 'chore',
        area: 'test',
      });
    });

    it('should return all tasks when task_type=all', async () => {
      const result = await handleTaskList({
        task_type: 'all',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(6); // 2 simple + 2 parent + 2 subtasks
    });

    it('should return only simple tasks when task_type=simple', async () => {
      const result = await handleTaskList({
        task_type: 'simple',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      
      // All should be simple tasks (not parent, not subtask)
      result.data?.forEach(task => {
        expect(task.metadata.isParentTask).toBe(false);
        expect(task.metadata.parentTask).toBeUndefined();
      });
    });

    it('should return only parent tasks when task_type=parent', async () => {
      const result = await handleTaskList({
        task_type: 'parent',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      
      // All should be parent tasks
      result.data?.forEach(task => {
        expect(task.metadata.isParentTask).toBe(true);
      });
    });

    it('should return only subtasks when task_type=subtask', async () => {
      const result = await handleTaskList({
        task_type: 'subtask',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      
      // All should be subtasks
      result.data?.forEach(task => {
        expect(task.metadata.isParentTask).toBe(false);
        expect(task.metadata.parentTask).toBeDefined();
      });
    });

    it('should return simple and parent tasks when task_type=top-level (FAILING TEST)', async () => {
      const result = await handleTaskList({
        task_type: 'top-level',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(4); // 2 simple + 2 parent (no subtasks)
      
      // Should include simple tasks and parent tasks, but not subtasks
      const hasSimple = result.data?.some(task => 
        !task.metadata.isParentTask && !task.metadata.parentTask
      );
      const hasParent = result.data?.some(task => task.metadata.isParentTask);
      const hasSubtask = result.data?.some(task => task.metadata.parentTask);
      
      expect(hasSimple).toBe(true);
      expect(hasParent).toBe(true);
      expect(hasSubtask).toBe(false);
    });

    it('should return top-level tasks by default', async () => {
      const result = await handleTaskList({});

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(4); // 2 simple + 2 parent (no subtasks)
      
      // Should include simple tasks and parent tasks, but not subtasks
      const hasSimple = result.data?.some(task => 
        !task.metadata.isParentTask && !task.metadata.parentTask
      );
      const hasParent = result.data?.some(task => task.metadata.isParentTask);
      const hasSubtask = result.data?.some(task => task.metadata.parentTask);
      
      expect(hasSimple).toBe(true);
      expect(hasParent).toBe(true);
      expect(hasSubtask).toBe(false);
    });
  });
});