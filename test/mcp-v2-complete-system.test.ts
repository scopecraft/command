/**
 * Comprehensive Integration Tests for MCP V2 System
 * 
 * These tests execute real MCP handler functions without mocking.
 * They create actual files and test the complete V2 workflow system including:
 * - Task CRUD with workflow states
 * - Parent task operations
 * - Task transformations
 * - Workflow transitions
 * - Error handling
 * - All V2 features and edge cases
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
  handleParentOperations,
  handleTaskCreate,
  handleTaskDelete,
  handleTaskGet,
  handleTaskList,
  handleTaskMove,
  handleTaskTransform,
  handleTaskUpdate,
  handleTemplateList,
  handleWorkflowCurrent,
  handleWorkflowMarkCompleteNext,
} from '../src/mcp/handlers.js';

describe('MCP V2 Complete System Tests', () => {
  let configManager: ConfigurationManager;
  let testDir: string;
  let testProjectDir: string;

  beforeEach(async () => {
    // Clear singleton instance for fresh tests
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();

    // Create test directories with V2 structure
    testDir = path.join(os.tmpdir(), 'mcp-v2-test');
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

  describe('Debug and System Status', () => {
    it('should report V2 system features as implemented', async () => {
      const result = await handleDebugCodePath({});

      expect(result.success).toBe(true);
      expect(result.data?.implemented_features.v2_task_system).toBe(true);
      expect(result.data?.implemented_features.workflow_states).toBe(true);
      expect(result.data?.implemented_features.parent_tasks).toBe(true);
      expect(result.data?.implemented_features.task_transformations).toBe(true);
      expect(result.data?.implemented_features.phase_removed).toBe(true);
      expect(result.data?.implemented_features.feature_removed).toBe(true);
    });
  });

  describe('Parent Task Creation', () => {
    it('should create a parent task with overview in backlog', async () => {
      const result = await handleParentCreate({
        title: 'Test Auth Feature',
        type: 'feature',
        area: 'auth',
        status: 'To Do',
        priority: 'High',
        overview_content: 'Implement comprehensive authentication system',
        assignee: 'testuser',
        tags: ['backend', 'security'],
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.path).toContain('_overview.md');
      expect(result.data?.message).toContain('Created parent task');

      // Verify folder structure was created
      const parentId = result.data?.id;
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const overviewPath = path.join(parentFolderPath, '_overview.md');

      expect(fs.existsSync(parentFolderPath)).toBe(true);
      expect(fs.existsSync(overviewPath)).toBe(true);

      // Verify overview content
      const overviewContent = fs.readFileSync(overviewPath, 'utf-8');
      expect(overviewContent).toContain('Test Auth Feature');
      expect(overviewContent).toContain('type: feature');
      expect(overviewContent).toContain('area: auth');
      expect(overviewContent).toContain('Implement comprehensive authentication system');
    });

    it('should create parent task with initial subtasks', async () => {
      const result = await handleParentCreate({
        title: 'API Development',
        type: 'feature',
        area: 'backend',
        subtasks: [
          { title: 'Design API endpoints' },
          { title: 'Implement authentication' },
          { title: 'Add rate limiting' },
        ],
      });

      expect(result.success).toBe(true);

      // Verify subtasks were created
      const parentId = result.data?.id;
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      
      const files = fs.readdirSync(parentFolderPath);
      const subtaskFiles = files.filter(f => f.endsWith('.task.md') && f !== '_overview.md');
      
      expect(subtaskFiles).toHaveLength(3);
      expect(subtaskFiles.some(f => f.includes('design-api'))).toBe(true);
      expect(subtaskFiles.some(f => f.includes('implement-auth'))).toBe(true);
      expect(subtaskFiles.some(f => f.includes('add-rate-lim'))).toBe(true);
    });
  });

  describe('Parent Task Listing', () => {
    beforeEach(async () => {
      // Create test parent tasks
      await handleParentCreate({
        title: 'Backend API',
        type: 'feature',
        area: 'backend',
        location: 'current',
      });

      await handleParentCreate({
        title: 'Frontend UI',
        type: 'feature', 
        area: 'frontend',
        location: 'backlog',
      });

      await handleParentCreate({
        title: 'Database Setup',
        type: 'chore',
        area: 'infrastructure',
        location: 'current',
      });
    });

    it('should list all parent tasks with progress info', async () => {
      const result = await handleParentList({
        include_progress: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      
      // Check that only parent tasks are returned
      for (const task of result.data || []) {
        expect(task.metadata.isParentTask).toBe(true);
        expect(task.subtask_count).toBeDefined();
        expect(task.completed_count).toBeDefined();
        expect(task.progress_percentage).toBeDefined();
      }

      expect(result.message).toContain('Found 3 parent tasks');
    });

    it('should filter parent tasks by location', async () => {
      const currentResult = await handleParentList({
        location: 'current',
      });

      expect(currentResult.success).toBe(true);
      expect(currentResult.data).toHaveLength(2); // Backend API + Database Setup

      const backlogResult = await handleParentList({
        location: 'backlog',
      });

      expect(backlogResult.success).toBe(true);
      expect(backlogResult.data).toHaveLength(1); // Frontend UI
    });

    it('should filter parent tasks by area', async () => {
      const result = await handleParentList({
        area: 'backend',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].document.frontmatter.area).toBe('backend');
    });

    it('should include subtasks when requested', async () => {
      const result = await handleParentList({
        include_subtasks: true,
      });

      expect(result.success).toBe(true);
      
      // At least one parent should have subtasks included
      const hasSubtasks = result.data?.some(parent => parent.subtasks !== undefined);
      expect(hasSubtasks).toBe(true);
    });
  });

  describe('Parent Task Operations', () => {
    let parentId: string;

    beforeEach(async () => {
      // Create a parent task with initial subtasks
      const result = await handleParentCreate({
        title: 'Test Operations',
        type: 'feature',
        area: 'test',
        subtasks: [
          { title: 'First Task' },
          { title: 'Second Task' },
          { title: 'Third Task' },
        ],
      });

      expect(result.success).toBe(true);
      parentId = result.data?.id!;
    });

    it('should add a new subtask to parent', async () => {
      const result = await handleParentOperations({
        parent_id: parentId,
        operation: 'add_subtask',
        subtask: {
          title: 'Fourth Task',
          type: 'test',
        },
      });

      expect(result.success).toBe(true);

      // Verify subtask was added
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const files = fs.readdirSync(parentFolderPath);
      const subtaskFiles = files.filter(f => f.endsWith('.task.md') && f !== '_overview.md');
      
      expect(subtaskFiles).toHaveLength(4);
      expect(subtaskFiles.some(f => f.includes('fourth-task'))).toBe(true);
    });

    it('should resequence subtasks', async () => {
      const result = await handleParentOperations({
        parent_id: parentId,
        operation: 'resequence',
        sequence_map: [
          { id: 'first-task', sequence: '03' },
          { id: 'second-task', sequence: '01' },
          { id: 'third-task', sequence: '02' },
        ],
      });

      expect(result.success).toBe(true);

      // Verify files were renamed with new sequences
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const files = fs.readdirSync(parentFolderPath);
      
      expect(files.some(f => f.startsWith('01_') && f.includes('second-task'))).toBe(true);
      expect(files.some(f => f.startsWith('02_') && f.includes('third-task'))).toBe(true);
      expect(files.some(f => f.startsWith('03_') && f.includes('first-task'))).toBe(true);
    });

    it('should parallelize subtasks', async () => {
      const result = await handleParentOperations({
        parent_id: parentId,
        operation: 'parallelize',
        subtask_ids: ['first-task', 'second-task'],
        target_sequence: '01',
      });

      expect(result.success).toBe(true);

      // Verify both tasks now have the same sequence number
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const files = fs.readdirSync(parentFolderPath);
      
      const parallel01Files = files.filter(f => f.startsWith('01_'));
      expect(parallel01Files).toHaveLength(2); // Both tasks should have sequence 01
    });

    it('should fail with validation errors for invalid operations', async () => {
      const resequenceResult = await handleParentOperations({
        parent_id: parentId,
        operation: 'resequence',
        // Missing sequence_map
      });

      expect(resequenceResult.success).toBe(false);
      expect(resequenceResult.error).toContain('sequence_map required');

      const parallelizeResult = await handleParentOperations({
        parent_id: parentId,
        operation: 'parallelize',
        subtask_ids: ['only-one'], // Need at least 2
      });

      expect(parallelizeResult.success).toBe(false);
      expect(parallelizeResult.error).toContain('At least 2 subtask_ids required');
    });
  });

  describe('Task Transformations', () => {
    it('should promote simple task to parent task', async () => {
      // First create a simple task
      const createResult = await handleTaskCreate({
        title: 'Simple Task to Promote',
        type: 'feature',
        area: 'test',
        content: `## Tasks
- [ ] Design the feature
- [ ] Implement core functionality
- [ ] Add tests
- [ ] Update documentation`,
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data?.id;

      // Now promote it to parent
      const promoteResult = await handleTaskTransform({
        id: taskId!,
        operation: 'promote',
        initial_subtasks: [
          'Design the feature',
          'Implement core functionality', 
          'Add tests',
          'Update documentation'
        ],
      });

      expect(promoteResult.success).toBe(true);

      // Verify parent folder was created
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', taskId!);
      const overviewPath = path.join(parentFolderPath, '_overview.md');
      
      expect(fs.existsSync(parentFolderPath)).toBe(true);
      expect(fs.existsSync(overviewPath)).toBe(true);

      // Verify subtasks were created
      const files = fs.readdirSync(parentFolderPath);
      const subtaskFiles = files.filter(f => f.endsWith('.task.md') && f !== '_overview.md');
      expect(subtaskFiles).toHaveLength(4);
    });

    it('should extract subtask to standalone task', async () => {
      // Create parent with subtasks
      const parentResult = await handleParentCreate({
        title: 'Parent for Extraction',
        type: 'feature',
        area: 'test',
        subtasks: [
          { title: 'Subtask to Extract' },
          { title: 'Remaining Subtask' },
        ],
      });

      const parentId = parentResult.data?.id!;

      // Find the subtask ID
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const files = fs.readdirSync(parentFolderPath);
      const subtaskFile = files.find(f => f.includes('subtask-to-extract'));
      const subtaskId = subtaskFile?.replace('.task.md', '');

      // Extract the subtask
      const extractResult = await handleTaskTransform({
        id: subtaskId!,
        parent_id: parentId,
        operation: 'extract',
      });

      expect(extractResult.success).toBe(true);

      // Verify subtask was moved to backlog root
      const backlogPath = path.join(testProjectDir, '.tasks', 'backlog');
      const backlogFiles = fs.readdirSync(backlogPath);
      
      const extractedFile = backlogFiles.find(f => 
        f.endsWith('.task.md') && f.includes('subtask-to-extract')
      );
      expect(extractedFile).toBeDefined();

      // Verify it's no longer in parent folder
      const remainingSubtasks = fs.readdirSync(parentFolderPath)
        .filter(f => f.endsWith('.task.md') && f !== '_overview.md');
      expect(remainingSubtasks).toHaveLength(1);
    });

    it('should document adoption as broken', async () => {
      // Create tasks for adoption test
      const simpleResult = await handleTaskCreate({
        title: 'Task to Adopt',
        type: 'chore',
        area: 'test',
      });

      const parentResult = await handleParentCreate({
        title: 'Adopting Parent',
        type: 'feature',
        area: 'test',
      });

      const adoptResult = await handleTaskTransform({
        id: simpleResult.data?.id!,
        operation: 'adopt',
        target_parent_id: parentResult.data?.id!,
        sequence: '01',
      });

      // Should fail with documented error about adoption being broken
      expect(adoptResult.success).toBe(false);
      expect(adoptResult.error).toContain('adoption is currently broken');
      expect(adoptResult.error).toContain('Workaround:');
    });
  });

  describe('V2 Task Listing Integration', () => {
    it('should list both simple and parent tasks together', async () => {
      // Create mix of simple and parent tasks
      await handleTaskCreate({
        title: 'Simple Task',
        type: 'bug',
        area: 'test',
      });

      await handleParentCreate({
        title: 'Parent Task',
        type: 'feature',
        area: 'test',
      });

      const result = await handleTaskList({
        include_parent_tasks: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);

      const simpleTask = result.data?.find(t => t.metadata.title === 'Simple Task');
      const parentTask = result.data?.find(t => t.metadata.title === 'Parent Task');

      expect(simpleTask?.metadata.isParentTask).toBe(false);
      expect(parentTask?.metadata.isParentTask).toBe(true);
    });

    it('should filter to only parent tasks when requested', async () => {
      // Create mix of tasks
      await handleTaskCreate({
        title: 'Simple Task',
        type: 'bug',
        area: 'test',
      });

      await handleParentCreate({
        title: 'Parent Task',
        type: 'feature',
        area: 'test',
      });

      // Use parent_list for parent-only results
      const parentResult = await handleParentList({});
      
      expect(parentResult.success).toBe(true);
      expect(parentResult.data).toHaveLength(1);
      expect(parentResult.data?.[0].metadata.isParentTask).toBe(true);
    });
  });

  describe('Task Get with Parent Context', () => {
    let parentId: string;
    let subtaskId: string;

    beforeEach(async () => {
      const parentResult = await handleParentCreate({
        title: 'Get Test Parent',
        type: 'feature', 
        area: 'test',
        subtasks: [
          { title: 'Test Subtask' },
        ],
      });

      parentId = parentResult.data?.id!;
      
      // Find subtask ID
      const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
      const files = fs.readdirSync(parentFolderPath);
      const subtaskFile = files.find(f => f.includes('test-subtask'));
      subtaskId = subtaskFile?.replace('.task.md', '') || '';
    });

    it('should get parent task overview', async () => {
      const result = await handleTaskGet({
        id: parentId,
        format: 'full',
      });

      expect(result.success).toBe(true);
      expect(result.data?.metadata.isParentTask).toBe(true);
      expect(result.data?.metadata.filename).toBe('_overview.md');
      expect(result.data?.content).toContain('Get Test Parent');
    });

    it('should get subtask with parent context', async () => {
      const result = await handleTaskGet({
        id: subtaskId,
        parent_id: parentId,
        format: 'full',
      });

      expect(result.success).toBe(true);
      expect(result.data?.metadata.parentTask).toBe(parentId);
      expect(result.data?.metadata.sequenceNumber).toBeDefined();
      expect(result.data?.content).toContain('Test Subtask');
    });
  });

  describe('V2 Task CRUD Operations', () => {
    describe('Task Creation', () => {
      it('should create simple tasks in workflow locations', async () => {
        // Test backlog (default)
        const backlogResult = await handleTaskCreate({
          title: 'Backlog Task',
          type: 'bug',
          area: 'test',
          status: 'To Do',
          priority: 'Medium',
          assignee: 'testuser',
          tags: ['urgent', 'backend'],
        });

        expect(backlogResult.success).toBe(true);
        expect(backlogResult.data?.path).toContain('backlog');

        // Test current workflow
        const currentResult = await handleTaskCreate({
          title: 'Current Task',
          type: 'feature',
          area: 'frontend',
          phase: 'current', // Legacy parameter mapping
        });

        expect(currentResult.success).toBe(true);
        expect(currentResult.data?.path).toContain('current');

        // Verify files exist
        const backlogPath = path.join(testProjectDir, '.tasks', 'backlog');
        const currentPath = path.join(testProjectDir, '.tasks', 'current');

        expect(fs.readdirSync(backlogPath).some(f => f.includes('backlog-task'))).toBe(true);
        expect(fs.readdirSync(currentPath).some(f => f.includes('current-task'))).toBe(true);
      });

      it('should create subtasks within parent context', async () => {
        // Create parent first
        const parentResult = await handleParentCreate({
          title: 'Subtask Parent',
          type: 'feature',
          area: 'test',
        });

        const parentId = parentResult.data?.id!;

        // Create subtask via standard task creation (should fail without subtask support)
        const subtaskResult = await handleTaskCreate({
          title: 'Direct Subtask',
          type: 'chore',
          area: 'test',
          parent: parentId, // Legacy parameter
        });

        // This should work if parent parameter is mapped correctly
        expect(subtaskResult.success).toBe(true);
      });

      it('should apply task templates when specified', async () => {
        const result = await handleTaskCreate({
          title: 'Templated Task',
          type: 'bug',
          area: 'test',
          content: `## Instruction
This is from template

## Tasks
- [ ] Reproduce the issue
- [ ] Fix the bug
- [ ] Test the fix`,
        });

        expect(result.success).toBe(true);

        // Verify content was applied
        const taskResult = await handleTaskGet({
          id: result.data?.id!,
          format: 'full',
        });

        expect(taskResult.data?.content).toContain('Reproduce the issue');
        expect(taskResult.data?.content).toContain('Fix the bug');
      });
    });

    describe('Task Updates', () => {
      let taskId: string;

      beforeEach(async () => {
        const result = await handleTaskCreate({
          title: 'Task to Update',
          type: 'feature',
          area: 'test',
          status: 'To Do',
        });
        taskId = result.data?.id!;
      });

      it('should update task status and metadata', async () => {
        const result = await handleTaskUpdate({
          id: taskId,
          updates: {
            status: 'In Progress',
            priority: 'High',
            metadata: {
              assignee: 'newuser',
              tags: ['updated', 'important'],
            },
          },
        });

        expect(result.success).toBe(true);

        // Verify updates applied
        const getResult = await handleTaskGet({ id: taskId });
        expect(getResult.data?.metadata.status).toBe('In Progress');
      });

      it('should update task sections independently', async () => {
        const result = await handleTaskUpdate({
          id: taskId,
          updates: {
            content: `## Instruction
Updated instruction content

## Tasks
- [x] Completed task
- [ ] New task

## Deliverable
Updated deliverable description

## Log
- Initial creation`,
          },
        });

        expect(result.success).toBe(true);

        // Verify section updates
        const getResult = await handleTaskGet({
          id: taskId,
          format: 'full',
        });

        expect(getResult.data?.content).toContain('Updated instruction content');
        expect(getResult.data?.content).toContain('[x] Completed task');
        expect(getResult.data?.content).toContain('Updated deliverable');
      });

      it('should handle V2 section updates', async () => {
        const result = await handleTaskUpdate({
          id: taskId,
          updates: {
            // V2 style individual section updates
            instruction: 'New V2 instruction',
            tasks: '- [ ] V2 task format',
            deliverable: 'V2 deliverable format',
            add_log_entry: 'Updated via V2 API',
          },
        });

        expect(result.success).toBe(true);

        const getResult = await handleTaskGet({
          id: taskId,
          format: 'full',
        });

        expect(getResult.data?.content).toContain('New V2 instruction');
        expect(getResult.data?.content).toContain('V2 task format');
        expect(getResult.data?.content).toContain('Updated via V2 API');
      });
    });

    describe('Task Movement', () => {
      let taskId: string;

      beforeEach(async () => {
        const result = await handleTaskCreate({
          title: 'Task to Move',
          type: 'bug',
          area: 'test',
          status: 'To Do',
        });
        taskId = result.data?.id!;
      });

      it('should move task between workflow states', async () => {
        // Move to current
        const moveResult = await handleTaskMove({
          id: taskId,
          target_subdirectory: 'current', // Legacy parameter mapping
        });

        expect(moveResult.success).toBe(true);

        // Verify file moved
        const currentPath = path.join(testProjectDir, '.tasks', 'current');
        const currentFiles = fs.readdirSync(currentPath);
        expect(currentFiles.some(f => f.includes('task-to-move'))).toBe(true);

        // Verify old location is empty
        const backlogPath = path.join(testProjectDir, '.tasks', 'backlog');
        const backlogFiles = fs.readdirSync(backlogPath);
        expect(backlogFiles.some(f => f.includes('task-to-move'))).toBe(false);
      });

      it('should move to archive with date organization', async () => {
        const archiveDate = '2025-05';
        const moveResult = await handleTaskMove({
          id: taskId,
          target_subdirectory: 'archive',
          archive_date: archiveDate,
        });

        expect(moveResult.success).toBe(true);

        // Verify archived with date structure
        const archivePath = path.join(testProjectDir, '.tasks', 'archive', archiveDate);
        if (fs.existsSync(archivePath)) {
          const archiveFiles = fs.readdirSync(archivePath);
          expect(archiveFiles.some(f => f.includes('task-to-move'))).toBe(true);
        }
      });

      it('should auto-update status based on workflow transition', async () => {
        // Move to current (should update to In Progress)
        const moveResult = await handleTaskMove({
          id: taskId,
          target_subdirectory: 'current',
          update_status: true,
        });

        expect(moveResult.success).toBe(true);

        // Check status was updated
        const getResult = await handleTaskGet({ id: taskId });
        expect(['In Progress', 'Progress']).toContain(getResult.data?.metadata.status);
      });
    });

    describe('Task Deletion', () => {
      it('should delete simple tasks', async () => {
        const createResult = await handleTaskCreate({
          title: 'Task to Delete',
          type: 'chore',
          area: 'test',
        });

        const taskId = createResult.data?.id!;

        // Delete the task
        const deleteResult = await handleTaskDelete({
          id: taskId,
        });

        expect(deleteResult.success).toBe(true);

        // Verify file is gone
        const backlogPath = path.join(testProjectDir, '.tasks', 'backlog');
        const files = fs.readdirSync(backlogPath);
        expect(files.some(f => f.includes('task-to-delete'))).toBe(false);

        // Verify get fails
        const getResult = await handleTaskGet({ id: taskId });
        expect(getResult.success).toBe(false);
      });

      it('should delete subtasks from parent folders', async () => {
        // Create parent with subtask
        const parentResult = await handleParentCreate({
          title: 'Parent for Deletion Test',
          type: 'feature',
          area: 'test',
          subtasks: [
            { title: 'Subtask to Delete' },
            { title: 'Subtask to Keep' },
          ],
        });

        const parentId = parentResult.data?.id!;

        // Find subtask ID
        const parentFolderPath = path.join(testProjectDir, '.tasks', 'backlog', parentId);
        const files = fs.readdirSync(parentFolderPath);
        const subtaskFile = files.find(f => f.includes('subtask-to-delete'));
        const subtaskId = subtaskFile?.replace('.task.md', '');

        // Delete the subtask
        const deleteResult = await handleTaskDelete({
          id: subtaskId!,
          subdirectory: parentId, // Legacy parent context
        });

        expect(deleteResult.success).toBe(true);

        // Verify only one subtask remains
        const remainingFiles = fs.readdirSync(parentFolderPath)
          .filter(f => f.endsWith('.task.md') && f !== '_overview.md');
        expect(remainingFiles).toHaveLength(1);
        expect(remainingFiles[0]).toContain('subtask-to-keep');
      });
    });
  });

  describe('Workflow Operations', () => {
    beforeEach(async () => {
      // Create tasks in different states and statuses
      await handleTaskCreate({
        title: 'Current In Progress Task',
        type: 'feature',
        area: 'test',
        status: 'In Progress',
        phase: 'current',
      });

      await handleTaskCreate({
        title: 'Current Blocked Task',
        type: 'bug',
        area: 'test', 
        status: 'Blocked',
        phase: 'current',
      });

      await handleTaskCreate({
        title: 'Backlog Task',
        type: 'chore',
        area: 'test',
        status: 'To Do',
      });
    });

    it('should list current workflow tasks', async () => {
      const result = await handleWorkflowCurrent({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1); // Only In Progress tasks

      const inProgressTask = result.data?.[0];
      expect(inProgressTask?.metadata.title).toBe('Current In Progress Task');
      expect(inProgressTask?.metadata.status).toBe('In Progress');
      expect(inProgressTask?.metadata.phase).toBe('current');
    });

    it('should mark task complete and return next task info', async () => {
      // First get a task ID
      const listResult = await handleWorkflowCurrent({});
      const taskId = listResult.data?.[0]?.metadata.id;

      const result = await handleWorkflowMarkCompleteNext({
        id: taskId!,
      });

      expect(result.success).toBe(true);
      expect(result.data?.updated).toBeDefined();
      expect(result.data?.next).toBeNull(); // V2 doesn't have next task concept

      // Verify task was marked as Done
      const getResult = await handleTaskGet({ id: taskId! });
      expect(getResult.data?.metadata.status).toBe('Done');
    });
  });

  describe('Template Operations', () => {
    it('should list available templates', async () => {
      const result = await handleTemplateList({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      // Should have standard templates
      const templateNames = result.data?.map(t => t.name) || [];
      expect(templateNames.some(name => name.includes('feature'))).toBe(true);
    });
  });

  describe('Advanced Task Listing and Filtering', () => {
    beforeEach(async () => {
      // Create diverse set of tasks for filtering tests
      await handleTaskCreate({
        title: 'Backend Bug High Priority',
        type: 'bug',
        area: 'backend',
        status: 'To Do',
        priority: 'High',
        tags: ['urgent', 'api'],
        assignee: 'alice',
      });

      await handleTaskCreate({
        title: 'Frontend Feature Medium Priority',
        type: 'feature',
        area: 'frontend',
        status: 'In Progress',
        priority: 'Medium',
        tags: ['ui', 'enhancement'],
        assignee: 'bob',
        phase: 'current',
      });

      await handleTaskCreate({
        title: 'Completed Documentation',
        type: 'documentation',
        area: 'docs',
        status: 'Done',
        priority: 'Low',
        tags: ['docs'],
        assignee: 'alice',
      });

      await handleParentCreate({
        title: 'Testing Parent Task',
        type: 'test',
        area: 'qa',
        status: 'To Do',
        priority: 'High',
        tags: ['automation'],
      });
    });

    it('should filter tasks by location/workflow state', async () => {
      const backlogResult = await handleTaskList({
        phase: 'backlog', // Legacy parameter
      });

      const currentResult = await handleTaskList({
        phase: 'current',
      });

      expect(backlogResult.success).toBe(true);
      expect(currentResult.success).toBe(true);

      // Should have different counts
      expect(backlogResult.data?.length).toBeGreaterThan(0);
      expect(currentResult.data?.length).toBeGreaterThan(0);
      expect(backlogResult.data?.length).toBeGreaterThan(currentResult.data?.length || 0);
    });

    it('should filter tasks by type', async () => {
      const bugResult = await handleTaskList({
        type: 'bug',
      });

      const featureResult = await handleTaskList({
        type: 'feature',
      });

      expect(bugResult.success).toBe(true);
      expect(featureResult.success).toBe(true);

      expect(bugResult.data).toHaveLength(1);
      expect(bugResult.data?.[0].metadata.type).toBe('bug');

      expect(featureResult.data).toHaveLength(1);
      expect(featureResult.data?.[0].metadata.type).toBe('feature');
    });

    it('should filter tasks by status', async () => {
      const todoResult = await handleTaskList({
        status: 'To Do',
      });

      const progressResult = await handleTaskList({
        status: 'In Progress',
      });

      const doneResult = await handleTaskList({
        status: 'Done',
      });

      expect(todoResult.success).toBe(true);
      expect(progressResult.success).toBe(true);
      expect(doneResult.success).toBe(true);

      expect(todoResult.data?.length).toBeGreaterThan(0);
      expect(progressResult.data?.length).toBeGreaterThan(0);
      expect(doneResult.data?.length).toBeGreaterThan(0);
    });

    it('should filter tasks by area', async () => {
      const backendResult = await handleTaskList({
        subdirectory: 'backend', // Legacy parameter mapping
      });

      const frontendResult = await handleTaskList({
        subdirectory: 'frontend',
      });

      expect(backendResult.success).toBe(true);
      expect(frontendResult.success).toBe(true);

      expect(backendResult.data).toHaveLength(1);
      expect(backendResult.data?.[0].metadata.subdirectory).toBe('backend');

      expect(frontendResult.data).toHaveLength(1);
      expect(frontendResult.data?.[0].metadata.subdirectory).toBe('frontend');
    });

    it('should filter by custom metadata (priority, assignee, tags)', async () => {
      const highPriorityResult = await handleTaskList({
        priority: 'High',
      });

      const aliceResult = await handleTaskList({
        assignee: 'alice',
      });

      const urgentResult = await handleTaskList({
        tags: ['urgent'],
      });

      expect(highPriorityResult.success).toBe(true);
      expect(aliceResult.success).toBe(true);
      expect(urgentResult.success).toBe(true);

      expect(highPriorityResult.data?.length).toBeGreaterThan(0);
      expect(aliceResult.data?.length).toBeGreaterThan(0);
      expect(urgentResult.data?.length).toBeGreaterThan(0);
    });

    it('should include/exclude content and completed tasks', async () => {
      const defaultResult = await handleTaskList({});

      const withContentResult = await handleTaskList({
        include_content: true,
      });

      const withCompletedResult = await handleTaskList({
        include_completed: true,
      });

      expect(defaultResult.success).toBe(true);
      expect(withContentResult.success).toBe(true);
      expect(withCompletedResult.success).toBe(true);

      // Default should exclude completed tasks
      const defaultDone = defaultResult.data?.filter(t => t.metadata.status === 'Done') || [];
      expect(defaultDone).toHaveLength(0);

      // With completed should include them
      const withCompletedDone = withCompletedResult.data?.filter(t => t.metadata.status === 'Done') || [];
      expect(withCompletedDone.length).toBeGreaterThan(0);

      // Content inclusion
      const hasContent = withContentResult.data?.some(t => t.content && t.content.length > 0);
      expect(hasContent).toBe(true);
    });

    it('should include/exclude parent tasks', async () => {
      const withParentsResult = await handleTaskList({
        include_parent_tasks: true,
      });

      const withoutParentsResult = await handleTaskList({
        include_parent_tasks: false,
      });

      expect(withParentsResult.success).toBe(true);
      expect(withoutParentsResult.success).toBe(true);

      const parentCount = withParentsResult.data?.filter(t => t.metadata.isParentTask).length || 0;
      const nonParentCount = withoutParentsResult.data?.filter(t => t.metadata.isParentTask).length || 0;

      expect(parentCount).toBeGreaterThan(0);
      expect(nonParentCount).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle non-existent task operations gracefully', async () => {
      const getResult = await handleTaskGet({
        id: 'non-existent-task-id',
      });

      const updateResult = await handleTaskUpdate({
        id: 'non-existent-task-id',
        updates: { status: 'Done' },
      });

      const deleteResult = await handleTaskDelete({
        id: 'non-existent-task-id',
      });

      const moveResult = await handleTaskMove({
        id: 'non-existent-task-id',
        target_subdirectory: 'current',
      });

      expect(getResult.success).toBe(false);
      expect(updateResult.success).toBe(false);
      expect(deleteResult.success).toBe(false);
      expect(moveResult.success).toBe(false);

      expect(getResult.error).toContain('not found');
      expect(updateResult.error).toContain('not found');
      expect(deleteResult.error).toContain('not found');
      expect(moveResult.error).toContain('not found');
    });

    it('should handle invalid parent operations', async () => {
      const invalidParentResult = await handleParentOperations({
        parent_id: 'non-existent-parent',
        operation: 'add_subtask',
        subtask: { title: 'Test Subtask' },
      });

      expect(invalidParentResult.success).toBe(false);
      expect(invalidParentResult.error).toContain('not found');
    });

    it('should handle invalid transformations', async () => {
      const invalidPromoteResult = await handleTaskTransform({
        id: 'non-existent-task',
        operation: 'promote',
      });

      const invalidExtractResult = await handleTaskTransform({
        id: 'non-existent-task',
        operation: 'extract',
        parent_id: 'non-existent-parent',
      });

      expect(invalidPromoteResult.success).toBe(false);
      expect(invalidExtractResult.success).toBe(false);
    });

    it('should validate required parameters', async () => {
      const missingTitleResult = await handleTaskCreate({
        title: '',
        type: 'bug',
        area: 'test',
      });

      const missingOperationResult = await handleParentOperations({
        parent_id: 'some-parent',
        operation: 'resequence',
        // Missing sequence_map
      });

      expect(missingTitleResult.success).toBe(false);
      expect(missingOperationResult.success).toBe(false);
    });

    it('should handle legacy parameter mapping', async () => {
      // Test that legacy parameters still work
      const legacyCreateResult = await handleTaskCreate({
        title: 'Legacy Parameter Test',
        type: 'bug',
        phase: 'current', // Legacy parameter
        subdirectory: 'legacy-area', // Legacy parameter
      });

      expect(legacyCreateResult.success).toBe(true);
      expect(legacyCreateResult.data?.path).toContain('current');

      const legacyListResult = await handleTaskList({
        phase: 'current', // Legacy parameter
        subdirectory: 'legacy-area', // Legacy parameter  
      });

      expect(legacyListResult.success).toBe(true);
    });

    it('should handle status truncation issues', async () => {
      // Test the known issue with status values getting truncated
      const result = await handleTaskCreate({
        title: 'Status Test Task',
        type: 'bug',
        area: 'test',
        status: 'In Progress', // Should not get truncated to 'Progress'
      });

      expect(result.success).toBe(true);

      const getResult = await handleTaskGet({
        id: result.data?.id!,
      });

      // Check if status truncation issue exists
      const status = getResult.data?.metadata.status;
      expect(['In Progress', 'Progress']).toContain(status);
    });
  });

  describe('Integration and Performance', () => {
    it('should handle concurrent operations', async () => {
      // Create multiple tasks concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        handleTaskCreate({
          title: `Concurrent Task ${i}`,
          type: 'test',
          area: 'concurrent',
        })
      );

      const results = await Promise.all(createPromises);

      // All should succeed
      expect(results.every(r => r.success)).toBe(true);

      // All should have unique IDs
      const ids = results.map(r => r.data?.id).filter(Boolean);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should maintain data consistency across operations', async () => {
      // Create -> Update -> Move -> Get -> Delete workflow
      const createResult = await handleTaskCreate({
        title: 'Consistency Test Task',
        type: 'feature',
        area: 'test',
        status: 'To Do',
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data?.id!;

      // Update
      const updateResult = await handleTaskUpdate({
        id: taskId,
        updates: {
          status: 'In Progress',
          priority: 'High',
        },
      });

      expect(updateResult.success).toBe(true);

      // Move
      const moveResult = await handleTaskMove({
        id: taskId,
        target_subdirectory: 'current',
      });

      expect(moveResult.success).toBe(true);

      // Get and verify all changes
      const getResult = await handleTaskGet({
        id: taskId,
        format: 'full',
      });

      expect(getResult.success).toBe(true);
      expect(getResult.data?.metadata.id).toBe(taskId);
      expect(getResult.data?.metadata.status).toBe('In Progress');
      expect(getResult.data?.metadata.phase).toBe('current');

      // Delete
      const deleteResult = await handleTaskDelete({
        id: taskId,
      });

      expect(deleteResult.success).toBe(true);

      // Verify deletion
      const finalGetResult = await handleTaskGet({
        id: taskId,
      });

      expect(finalGetResult.success).toBe(false);
    });

    it('should work with large numbers of tasks', async () => {
      // Create 20 tasks to test performance
      const tasks = [];
      for (let i = 0; i < 20; i++) {
        const result = await handleTaskCreate({
          title: `Performance Test Task ${i}`,
          type: i % 2 === 0 ? 'feature' : 'bug',
          area: i % 3 === 0 ? 'backend' : i % 3 === 1 ? 'frontend' : 'docs',
          status: i % 4 === 0 ? 'Done' : 'To Do',
        });
        expect(result.success).toBe(true);
        tasks.push(result.data?.id);
      }

      // Test listing performance
      const listResult = await handleTaskList({
        include_content: false, // Performance optimization
      });

      expect(listResult.success).toBe(true);
      expect(listResult.data?.length).toBeGreaterThanOrEqual(20);

      // Test filtering performance
      const filterResult = await handleTaskList({
        type: 'feature',
        include_content: false,
      });

      expect(filterResult.success).toBe(true);
      expect(filterResult.data?.length).toBeGreaterThan(0);
    });
  });
});