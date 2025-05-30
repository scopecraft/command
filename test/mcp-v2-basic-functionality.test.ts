/**
 * Basic MCP V2 Functionality Tests
 *
 * These tests verify the core V2 functionality that's currently working.
 * This is a smaller, focused test suite that validates what's implemented.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import {
  handleDebugCodePath,
  handleParentCreate,
  handleParentList,
  handleTaskCreate,
  handleTaskGet,
  handleTaskList,
  handleTemplateList,
} from '../src/mcp/handlers.js';

describe('MCP V2 Basic Functionality Tests', () => {
  let configManager: ConfigurationManager;
  let testDir: string;
  let testProjectDir: string;

  beforeEach(async () => {
    // Clear singleton instance for fresh tests
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();

    // Create test directories with V2 structure
    testDir = path.join(os.tmpdir(), 'mcp-v2-basic-test');
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

  describe('System Status', () => {
    it('should report V2 system as implemented', async () => {
      const result = await handleDebugCodePath({});

      expect(result.success).toBe(true);
      expect(result.data?.implemented_features.v2_task_system).toBe(true);
      expect(result.data?.implemented_features.workflow_states).toBe(true);
      expect(result.data?.implemented_features.parent_tasks).toBe(true);
      expect(result.data?.implemented_features.phase_removed).toBe(true);
      expect(result.data?.implemented_features.feature_removed).toBe(true);
    });
  });

  describe('Template Operations', () => {
    it('should list available templates', async () => {
      const result = await handleTemplateList({});

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Basic Task Operations', () => {
    it('should create simple tasks in backlog by default', async () => {
      const result = await handleTaskCreate({
        title: 'Basic Test Task',
        type: 'bug',
        subdirectory: 'test', // Using legacy parameter that should work
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.path).toContain('backlog');

      // Verify file was created
      const backlogPath = path.join(testProjectDir, '.tasks', 'backlog');
      const files = fs.readdirSync(backlogPath);
      expect(files.some((f) => f.includes('basic-test-task'))).toBe(true);
    });

    it('should create tasks in current workflow', async () => {
      const result = await handleTaskCreate({
        title: 'Current Test Task',
        type: 'feature',
        area: 'test',
        location: 'current',
      });

      expect(result.success).toBe(true);
      expect(result.data?.path).toContain('current');

      // Verify file was created in current
      const currentPath = path.join(testProjectDir, '.tasks', 'current');
      const files = fs.readdirSync(currentPath);
      expect(files.some((f) => f.includes('current-test-task'))).toBe(true);
    });

    it('should get existing tasks', async () => {
      // Create a task first
      const createResult = await handleTaskCreate({
        title: 'Task to Get',
        type: 'chore',
        area: 'test',
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data?.id;

      // Now get it
      const getResult = await handleTaskGet({
        id: taskId!,
        format: 'full',
      });

      expect(getResult.success).toBe(true);
      expect(getResult.data?.metadata.id).toBe(taskId);
      expect(getResult.data?.content).toContain('Task to Get');
    });

    it('should list tasks from workflow locations', async () => {
      // Create tasks in different locations
      await handleTaskCreate({
        title: 'Backlog Task',
        type: 'bug',
        area: 'test',
      });

      await handleTaskCreate({
        title: 'Current Task',
        type: 'feature',
        area: 'test',
        location: 'current',
      });

      // List all tasks
      const allResult = await handleTaskList({});
      expect(allResult.success).toBe(true);
      expect(allResult.data?.length).toBeGreaterThanOrEqual(2);

      // List backlog tasks
      const backlogResult = await handleTaskList({
        location: 'backlog',
      });
      expect(backlogResult.success).toBe(true);
      expect(backlogResult.data?.length).toBeGreaterThan(0);

      // List current tasks
      const currentResult = await handleTaskList({
        location: 'current',
      });
      expect(currentResult.success).toBe(true);
      expect(currentResult.data?.length).toBeGreaterThan(0);
    });
  });

  describe('Parent Task Operations', () => {
    it('should create parent tasks', async () => {
      const result = await handleParentCreate({
        title: 'Test Parent Task',
        type: 'feature',
        area: 'test',
        overview_content: 'This is a test parent task',
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.path).toContain('_overview.md');

      // Verify folder structure
      const parentId = result.data?.id;
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const overviewPath = path.join(parentFolderPath, '_overview.md');

      expect(fs.existsSync(parentFolderPath)).toBe(true);
      expect(fs.existsSync(overviewPath)).toBe(true);

      // Verify content
      const content = fs.readFileSync(overviewPath, 'utf-8');
      expect(content).toContain('Test Parent Task');
      expect(content).toContain('This is a test parent task');
    });

    it('should create parent tasks with subtasks', async () => {
      const result = await handleParentCreate({
        title: 'Parent with Subtasks',
        type: 'feature',
        area: 'test',
        subtasks: [{ title: 'First Subtask' }, { title: 'Second Subtask' }],
      });

      expect(result.success).toBe(true);

      // Verify subtasks were created
      const parentId = result.data?.id;
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);

      const files = fs.readdirSync(parentFolderPath);
      const subtaskFiles = files.filter((f) => f.endsWith('.task.md') && f !== '_overview.md');

      expect(subtaskFiles).toHaveLength(2);
      expect(subtaskFiles.some((f) => f.includes('first-subtask'))).toBe(true);
      expect(subtaskFiles.some((f) => f.includes('second-subtask'))).toBe(true);
    });

    it('should list parent tasks', async () => {
      // Create a mix of simple and parent tasks
      await handleTaskCreate({
        title: 'Simple Task',
        type: 'bug',
        subdirectory: 'test',
      });

      await handleParentCreate({
        title: 'Parent Task',
        type: 'feature',
        area: 'test',
      });

      // List parent tasks
      const result = await handleParentList({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1); // Only the parent task
      expect(result.data?.[0].metadata.isParentTask).toBe(true);
      expect(result.data?.[0].document.title).toBe('Parent Task');
    });

    it('should include progress info for parent tasks', async () => {
      // Create parent with subtasks
      const parentResult = await handleParentCreate({
        title: 'Parent for Progress',
        type: 'feature',
        area: 'test',
        subtasks: [{ title: 'Subtask One' }, { title: 'Subtask Two' }],
      });

      expect(parentResult.success).toBe(true);

      // List with progress
      const listResult = await handleParentList({
        include_progress: true,
      });

      expect(listResult.success).toBe(true);
      expect(listResult.data).toHaveLength(1);

      const parent = listResult.data?.[0];
      expect(parent?.subtask_count).toBe(2);
      expect(parent?.completed_count).toBe(0);
      expect(parent?.progress_percentage).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent task gracefully', async () => {
      const result = await handleTaskGet({
        id: 'non-existent-task-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should validate required parameters', async () => {
      const result = await handleTaskCreate({
        title: '', // Empty title should fail
        type: 'bug',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle concurrent task creation', async () => {
      const promises = Array.from({ length: 3 }, (_, i) =>
        handleTaskCreate({
          title: `Concurrent Task ${i}`,
          type: 'test',
          area: 'concurrent',
        })
      );

      const results = await Promise.all(promises);

      // All should succeed
      expect(results.every((r) => r.success)).toBe(true);

      // All should have unique IDs
      const ids = results.map((r) => r.data?.id).filter(Boolean);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should create and list mixed task types', async () => {
      // Create various task types
      await handleTaskCreate({
        title: 'Bug Task',
        type: 'bug',
        area: 'mixed',
      });

      await handleTaskCreate({
        title: 'Feature Task',
        type: 'feature',
        area: 'mixed',
        location: 'current',
      });

      await handleParentCreate({
        title: 'Parent Feature',
        type: 'feature',
        area: 'mixed',
      });

      // List all tasks
      const allResult = await handleTaskList({});

      expect(allResult.success).toBe(true);
      expect(allResult.data?.length).toBe(3);

      // Check task types
      const types = allResult.data?.map((t) => t.metadata.type) || [];
      expect(types).toContain('bug');
      expect(types).toContain('feature');
    });
  });
});
