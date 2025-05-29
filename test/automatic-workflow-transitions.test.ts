/**
 * Test automatic workflow transitions based on status changes
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createTask, updateTask, getTask } from '../src/core/v2/task-crud.js';
import type { V2Config } from '../src/core/v2/types.js';

describe('Automatic Workflow Transitions', () => {
  const testDir = join(process.cwd(), 'test-automatic-transitions');
  const config: V2Config = {
    autoWorkflowTransitions: true,
  };

  beforeEach(() => {
    // Clean up and create test directory
    if (rmSync) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'backlog'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'current'), { recursive: true });
    mkdirSync(join(testDir, '.tasks', 'archive'), { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (rmSync) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should move task from backlog to current when status changes to "In Progress"', async () => {
    // Create a task in backlog
    const createResult = await createTask(testDir, {
      title: 'Test task for workflow transition',
      type: 'feature',
      workflowState: 'backlog',
      area: 'test',
    }, config);

    expect(createResult.success).toBe(true);
    expect(createResult.data?.metadata.path).toContain('.tasks/backlog');

    const taskId = createResult.data!.metadata.id;

    // Update status to "In Progress" - should trigger auto-transition
    const updateResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'In Progress' }
    }, config);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/current');
    expect(updateResult.data?.document.frontmatter.status).toBe('In Progress');
  });

  it('should move task from archive to current when status changes to "In Progress"', async () => {
    // Create a task in archive
    const createResult = await createTask(testDir, {
      title: 'Test archived task reopening',
      type: 'bug',
      workflowState: 'archive',
      area: 'test',
      frontmatter: { status: 'Done' },
    }, config);

    expect(createResult.success).toBe(true);
    expect(createResult.data?.metadata.path).toContain('.tasks/archive');

    const taskId = createResult.data!.metadata.id;

    // Update status to "In Progress" - should trigger auto-transition
    const updateResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'In Progress' }
    }, config);

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/current');
    expect(updateResult.data?.document.frontmatter.status).toBe('In Progress');
  });

  it('should move task from archive to current when status changes to "To Do"', async () => {
    // Create a task in archive
    const createResult = await createTask(testDir, {
      title: 'Test archived task reopening to To Do',
      type: 'chore',
      workflowState: 'archive',
      area: 'test',
    }, config);

    expect(createResult.success).toBe(true);
    const taskId = createResult.data!.metadata.id;

    // First set it to "Done" to establish proper archive state
    const doneResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'Done' }
    }, config);
    expect(doneResult.success).toBe(true);
    expect(doneResult.data?.metadata.path).toContain('.tasks/archive'); // Should stay in archive

    // Now update status to "To Do" - should trigger auto-transition
    const updateResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'To Do' }
    }, config);

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/current');
    expect(updateResult.data?.document.frontmatter.status).toBe('To Do');
  });

  it('should NOT auto-transition when status changes to "Done"', async () => {
    // Create a task in current
    const createResult = await createTask(testDir, {
      title: 'Test task completion',
      type: 'feature',
      workflowState: 'current',
      area: 'test',
      frontmatter: { status: 'In Progress' },
    }, config);

    expect(createResult.success).toBe(true);
    expect(createResult.data?.metadata.path).toContain('.tasks/current');

    const taskId = createResult.data!.metadata.id;

    // Update status to "Done" - should NOT trigger auto-transition
    const updateResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'Done' }
    }, config);

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/current'); // Still in current
    expect(updateResult.data?.document.frontmatter.status).toBe('Done');
  });

  it('should NOT auto-transition when autoWorkflowTransitions is disabled', async () => {
    const disabledConfig: V2Config = {
      autoWorkflowTransitions: false,
    };

    // Create a task in backlog
    const createResult = await createTask(testDir, {
      title: 'Test disabled auto-transitions',
      type: 'feature',
      workflowState: 'backlog',
      area: 'test',
    }, disabledConfig);

    expect(createResult.success).toBe(true);
    const taskId = createResult.data!.metadata.id;

    // Update status to "In Progress" - should NOT trigger auto-transition
    const updateResult = await updateTask(testDir, taskId, {
      frontmatter: { status: 'In Progress' }
    }, disabledConfig);

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/backlog'); // Still in backlog
    expect(updateResult.data?.document.frontmatter.status).toBe('In Progress');
  });

  it('should NOT auto-transition when status does not change', async () => {
    // Create a task in backlog with default "To Do" status
    const createResult = await createTask(testDir, {
      title: 'Test no status change',
      type: 'feature',
      workflowState: 'backlog',
      area: 'test',
    }, config);

    expect(createResult.success).toBe(true);
    const taskId = createResult.data!.metadata.id;

    // First update to set it to "To Do" (should not trigger transition since it's already "To Do")
    const updateResult = await updateTask(testDir, taskId, {
      title: 'Updated title',
      frontmatter: { status: 'To Do' } // Same status
    }, config);

    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.metadata.path).toContain('.tasks/backlog'); // Still in backlog
    expect(updateResult.data?.document.frontmatter.status).toBe('To Do');
  });
});