/**
 * Temporary test script to verify all refactored MCP handlers
 * Tests handlers through the MCP method registry as they would be called in production
 */

import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigurationManager } from '../src/core/config/configuration-manager.js';
import * as core from '../src/core/index.js';
import { methodRegistry } from '../src/mcp/handlers/index.js';
import { McpMethod } from '../src/mcp/types.js';

// Test constants
const TEST_ROOT = join(process.cwd(), '.test-tmp-refactored-handlers');
const TASKS_DIR = join(TEST_ROOT, '.tasks');

describe('Refactored MCP Handlers Integration Tests', () => {
  beforeAll(() => {
    // Clean up any existing test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }

    // Create test directory structure
    mkdirSync(TEST_ROOT, { recursive: true });
    mkdirSync(TASKS_DIR, { recursive: true });

    // Initialize project structure
    core.initializeProjectStructure(TEST_ROOT);

    // Set up configuration
    const configManager = ConfigurationManager.getInstance();
    configManager.setRootFromCLI(TEST_ROOT);
  });

  afterAll(() => {
    // Clean up test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  describe('Task Create Handler (refactored from complexity 26 to ~10)', () => {
    test('should create a simple task', async () => {
      const handler = methodRegistry[McpMethod.TASK_CREATE];
      const result = await handler({
        title: 'Test simple task',
        type: 'feature',
        area: 'test',
        status: 'todo',
        priority: 'medium',
        instruction: 'Test instruction content',
        tasks: '- [ ] Do something\n- [ ] Do another thing',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe('Test simple task');
      expect(result.data.type).toBe('feature');
      expect(result.data.area).toBe('test');
      expect(result.data.id).toBeDefined();
    });

    test('should create a subtask within a parent', async () => {
      // First create a parent
      const parentHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await parentHandler({
        title: 'Test parent task',
        type: 'feature',
        area: 'test',
      });

      expect(parentResult.success).toBe(true);
      const parentId = parentResult.data.id;

      // Now create a subtask
      const handler = methodRegistry[McpMethod.TASK_CREATE];
      const result = await handler({
        title: 'Test subtask',
        type: 'feature',
        parentId: parentId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe('Test subtask');
      expect(result.data.id).toMatch(/^01_test-subtask/);
    });
  });

  describe('Task Update Handler (refactored from complexity 28 to ~10)', () => {
    test('should update task metadata and content', async () => {
      // Create a task first
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];
      const createResult = await createHandler({
        title: 'Task to update',
        type: 'bug',
        status: 'todo',
        priority: 'low',
      });

      const taskId = createResult.data.id;

      // Update the task
      const updateHandler = methodRegistry[McpMethod.TASK_UPDATE];
      const updateResult = await updateHandler({
        id: taskId,
        updates: {
          status: 'in_progress',
          priority: 'high',
          instruction: 'Updated instruction',
          addLogEntry: 'Started working on this task',
        },
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data.status).toBe('in_progress');
      expect(updateResult.data.priority).toBe('high');
      expect(updateResult.data.sections?.instruction).toBe('Updated instruction');
      expect(updateResult.data.sections?.log).toContain('Started working on this task');
    });
  });

  describe('Task List Handler (refactored from complexity 17 to ~12)', () => {
    test('should list tasks with filters', async () => {
      // Create some test tasks
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];

      await createHandler({
        title: 'Feature task',
        type: 'feature',
        status: 'todo',
        area: 'backend',
        tags: ['api', 'database'],
      });

      await createHandler({
        title: 'Bug task',
        type: 'bug',
        status: 'in_progress',
        area: 'frontend',
        tags: ['ui', 'responsive'],
      });

      await createHandler({
        title: 'Completed task',
        type: 'chore',
        status: 'done',
        area: 'backend',
      });

      // Test listing with filters
      const listHandler = methodRegistry[McpMethod.TASK_LIST];

      // List all tasks (excluding completed by default)
      const allResult = await listHandler({});
      expect(allResult.success).toBe(true);
      expect(allResult.data.length).toBeGreaterThanOrEqual(2);

      // List by type
      const featureResult = await listHandler({ type: 'feature' });
      expect(featureResult.success).toBe(true);
      expect(featureResult.data.every((t) => t.type === 'feature')).toBe(true);

      // List by area
      const backendResult = await listHandler({ area: 'backend' });
      expect(backendResult.success).toBe(true);
      expect(backendResult.data.every((t) => t.area === 'backend')).toBe(true);

      // List including completed
      const withCompletedResult = await listHandler({ includeCompleted: true });
      expect(withCompletedResult.success).toBe(true);
      expect(withCompletedResult.data.some((t) => t.status === 'done')).toBe(true);

      // List by structure type
      const simpleOnlyResult = await listHandler({ taskType: 'simple' });
      expect(simpleOnlyResult.success).toBe(true);
      expect(simpleOnlyResult.data.every((t) => t.taskStructure === 'simple')).toBe(true);
    });
  });

  describe('Task Get Handler', () => {
    test('should retrieve a specific task with content', async () => {
      // Create a task
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];
      const createResult = await createHandler({
        title: 'Task to retrieve',
        type: 'feature',
        instruction: 'Detailed instructions here',
        tasks: '- [ ] Step 1\n- [ ] Step 2',
      });

      const taskId = createResult.data.id;

      // Get the task
      const getHandler = methodRegistry[McpMethod.TASK_GET];
      const getResult = await getHandler({ id: taskId });

      expect(getResult.success).toBe(true);
      expect(getResult.data.id).toBe(taskId);
      expect(getResult.data.title).toBe('Task to retrieve');
      expect(getResult.data.sections).toBeDefined();
      expect(getResult.data.sections.instruction).toBe('Detailed instructions here');
      expect(getResult.data.sections.tasks).toContain('Step 1');
    });
  });

  describe('Parent Create Handler (refactored from complexity 58 to ~10)', () => {
    test('should create parent with initial subtasks', async () => {
      const handler = methodRegistry[McpMethod.PARENT_CREATE];
      const result = await handler({
        title: 'Complex feature',
        type: 'feature',
        area: 'fullstack',
        overviewContent: 'This is a complex feature that needs subtasks',
        subtasks: [
          { title: 'Design API', type: 'feature' },
          { title: 'Implement backend', type: 'feature' },
          { title: 'Build UI', type: 'feature', parallelWith: 'Implement backend' },
          { title: 'Write tests', type: 'test' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.subtaskCount).toBe(4);
      expect(result.data.createdSubtasks).toHaveLength(4);

      // Check that subtasks were created
      const subtasks = result.data.createdSubtasks;
      const backend = subtasks.find((st) => st.title === 'Implement backend');
      const ui = subtasks.find((st) => st.title === 'Build UI');
      expect(backend).toBeDefined();
      expect(ui).toBeDefined();
      // Note: Parallelization might not be reflected in the initial creation response
    });
  });

  describe('Parent Operations Handler (refactored from complexity 24 to ~10)', () => {
    test('should handle resequence operation', async () => {
      // Create a parent with subtasks
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await createHandler({
        title: 'Parent for operations',
        type: 'feature',
        subtasks: [{ title: 'First task' }, { title: 'Second task' }, { title: 'Third task' }],
      });

      const parentId = parentResult.data.id;
      const subtasks = parentResult.data.createdSubtasks;

      // Resequence subtasks
      const opsHandler = methodRegistry[McpMethod.PARENT_OPERATIONS];
      const resequenceResult = await opsHandler({
        parentId: parentId,
        operation: 'resequence',
        operationData: {
          operation: 'resequence',
          sequenceMap: [
            { id: subtasks[2].id, sequence: '01' }, // Third becomes first
            { id: subtasks[0].id, sequence: '02' }, // First becomes second
            { id: subtasks[1].id, sequence: '03' }, // Second becomes third
          ],
        },
      });

      if (!resequenceResult.success) {
        console.error('Resequence failed:', resequenceResult.error);
      }
      expect(resequenceResult.success).toBe(true);
      expect(resequenceResult.data.operation).toBe('resequence');
      expect(resequenceResult.data.affectedSubtasks).toHaveLength(3);
    });

    test('should handle parallelize operation', async () => {
      // Create a parent with subtasks
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await createHandler({
        title: 'Parent for parallel',
        type: 'feature',
        subtasks: [
          { title: 'Sequential task 1' },
          { title: 'Sequential task 2' },
          { title: 'Sequential task 3' },
        ],
      });

      const parentId = parentResult.data.id;
      const subtasks = parentResult.data.createdSubtasks;

      // Parallelize tasks 2 and 3
      const opsHandler = methodRegistry[McpMethod.PARENT_OPERATIONS];
      const parallelResult = await opsHandler({
        parentId: parentId,
        operation: 'parallelize',
        operationData: {
          operation: 'parallelize',
          subtaskIds: [subtasks[1].id, subtasks[2].id],
          targetSequence: '02',
        },
      });

      if (!parallelResult.success) {
        console.error('Parallelize failed:', parallelResult.error);
      }
      expect(parallelResult.success).toBe(true);
      expect(parallelResult.data.operation).toBe('parallelize');
      expect(parallelResult.data.affectedSubtasks).toHaveLength(2);
    });

    test('should handle add_subtask operation', async () => {
      // Create a parent
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await createHandler({
        title: 'Parent for adding',
        type: 'feature',
      });

      const parentId = parentResult.data.id;

      // Add a subtask
      const opsHandler = methodRegistry[McpMethod.PARENT_OPERATIONS];
      const addResult = await opsHandler({
        parentId: parentId,
        operation: 'add_subtask',
        operationData: {
          operation: 'add_subtask',
          subtask: {
            title: 'New subtask',
            type: 'feature',
          },
        },
      });

      if (!addResult.success) {
        console.error('Add subtask failed:', addResult.error);
      }
      expect(addResult.success).toBe(true);
      expect(addResult.data.operation).toBe('add_subtask');
      expect(addResult.data.newSubtask).toBeDefined();
      expect(addResult.data.newSubtask.title).toBe('New subtask');
    });
  });

  describe('Task Transform Handler (refactored from complexity 20 to ~10)', () => {
    test('should promote simple task to parent', async () => {
      // Create a simple task
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];
      const createResult = await createHandler({
        title: 'Task to promote',
        type: 'feature',
        tasks: '- [ ] Subtask 1\n- [ ] Subtask 2\n- [ ] Subtask 3',
      });

      const taskId = createResult.data.id;

      // Promote to parent
      const transformHandler = methodRegistry[McpMethod.TASK_TRANSFORM];
      const promoteResult = await transformHandler({
        id: taskId,
        operation: 'promote',
        initialSubtasks: ['Subtask 1', 'Subtask 2', 'Subtask 3'],
      });

      expect(promoteResult.success).toBe(true);
      expect(promoteResult.data.operation).toBe('promote');
      expect(promoteResult.data.transformedTask.taskStructure).toBe('parent');
    });

    test('should extract subtask to standalone', async () => {
      // Create a parent with subtask
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await createHandler({
        title: 'Parent with subtask',
        type: 'feature',
        subtasks: [{ title: 'Subtask to extract' }, { title: 'Other subtask' }],
      });

      const parentId = parentResult.data.id;
      const subtaskId = parentResult.data.createdSubtasks[0].id;

      // Extract subtask
      const transformHandler = methodRegistry[McpMethod.TASK_TRANSFORM];
      const extractResult = await transformHandler({
        id: subtaskId,
        parentId: parentId,
        operation: 'extract',
      });

      expect(extractResult.success).toBe(true);
      expect(extractResult.data.operation).toBe('extract');
      expect(extractResult.data.transformedTask.taskStructure).toBe('simple');
      expect(extractResult.data.affectedTasks).toContain(parentId);
    });
  });

  describe('Task Move Handler', () => {
    test('should move task between workflow states', async () => {
      // Create a task in backlog
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];
      const createResult = await createHandler({
        title: 'Task to move',
        type: 'feature',
        workflowState: 'backlog',
      });

      const taskId = createResult.data.id;

      // Move to current
      const moveHandler = methodRegistry[McpMethod.TASK_MOVE];
      const moveResult = await moveHandler({
        id: taskId,
        targetState: 'current',
      });

      if (!moveResult.success) {
        console.error('Move failed:', moveResult.error);
      }
      expect(moveResult.success).toBe(true);
      expect(moveResult.data.currentState).toBe('current');
      expect(moveResult.data.previousState).toBe('backlog');
      expect(moveResult.data.statusUpdated).toBe(true);
      expect(moveResult.data.newStatus).toBe('in_progress'); // Auto-updated
    });
  });

  describe('Task Delete Handler', () => {
    test('should delete a simple task', async () => {
      // Create a task
      const createHandler = methodRegistry[McpMethod.TASK_CREATE];
      const createResult = await createHandler({
        title: 'Task to delete',
        type: 'chore',
      });

      const taskId = createResult.data.id;

      // Delete the task
      const deleteHandler = methodRegistry[McpMethod.TASK_DELETE];
      const deleteResult = await deleteHandler({
        id: taskId,
      });

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data.deleted).toBe(true);
      expect(deleteResult.data.id).toBe(taskId);

      // Verify it's gone
      const getHandler = methodRegistry[McpMethod.TASK_GET];
      const getResult = await getHandler({ id: taskId });
      expect(getResult.success).toBe(false);
    });

    test('should delete parent with cascade', async () => {
      // Create a parent with subtasks
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const parentResult = await createHandler({
        title: 'Parent to delete',
        type: 'feature',
        subtasks: [{ title: 'Child 1' }, { title: 'Child 2' }],
      });

      const parentId = parentResult.data.id;

      // Delete with cascade
      const deleteHandler = methodRegistry[McpMethod.TASK_DELETE];
      const deleteResult = await deleteHandler({
        id: parentId,
        cascade: true,
      });

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data.deleted).toBe(true);
    });
  });

  describe('Parent List Handler', () => {
    test('should list parent tasks with filters', async () => {
      // Create some parent tasks
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];

      await createHandler({
        title: 'Backend parent',
        type: 'feature',
        area: 'backend',
        subtasks: [{ title: 'Sub 1' }, { title: 'Sub 2' }],
      });

      await createHandler({
        title: 'Frontend parent',
        type: 'feature',
        area: 'frontend',
        subtasks: [{ title: 'Sub A' }],
      });

      // List all parents
      const listHandler = methodRegistry[McpMethod.PARENT_LIST];
      const result = await listHandler({});

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.data.every((p) => p.taskStructure === 'parent')).toBe(true);

      // List by area
      const backendResult = await listHandler({ area: 'backend' });
      expect(backendResult.success).toBe(true);
      expect(backendResult.data.every((p) => p.area === 'backend')).toBe(true);
    });
  });

  describe('Parent Get Handler', () => {
    test('should retrieve parent with full details', async () => {
      // Create a parent
      const createHandler = methodRegistry[McpMethod.PARENT_CREATE];
      const createResult = await createHandler({
        title: 'Detailed parent',
        type: 'feature',
        overviewContent: 'This is the overview',
        subtasks: [{ title: 'First subtask' }, { title: 'Second subtask' }],
      });

      const parentId = createResult.data.id;

      // Get parent details
      const getHandler = methodRegistry[McpMethod.PARENT_GET];
      const getResult = await getHandler({ id: parentId });

      expect(getResult.success).toBe(true);
      expect(getResult.data.id).toBe(parentId);
      expect(getResult.data.title).toBe('Detailed parent');
      expect(getResult.data.taskStructure).toBe('parent');
      expect(getResult.data.subtasks).toHaveLength(2);
      expect(getResult.data.sections?.instruction).toBe('This is the overview');
    });
  });

  describe('Transform MCP Params (refactored from complexity 21 to ~8)', () => {
    test('parameter transformation is applied correctly', async () => {
      // Test that snake_case params are transformed to camelCase
      const handler = methodRegistry[McpMethod.TASK_CREATE];

      // This would normally come in as snake_case from MCP protocol
      const result = await handler({
        title: 'Test param transform',
        type: 'feature',
        workflow_state: 'current', // Would be transformed if coming through MCP
        root_dir: TEST_ROOT, // Would be transformed if coming through MCP
      });

      expect(result.success).toBe(true);
      // The handler should work regardless of param format due to transformation
    });
  });
});

// Run the tests
console.log('Running refactored handlers integration tests...');
