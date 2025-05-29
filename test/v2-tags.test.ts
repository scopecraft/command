#!/usr/bin/env bun
/**
 * Tests for V2 Tags Support
 * 
 * Tests tag functionality including creation, filtering, and display
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as v2 from '../src/core/v2/index.js';

// Test project directory
const TEST_PROJECT = join(process.cwd(), '.test-project-v2-tags');

beforeEach(async () => {
  // Cleanup and initialize fresh project
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
  v2.initializeV2ProjectStructure(TEST_PROJECT);
});

afterEach(async () => {
  // Cleanup after tests
  if (existsSync(TEST_PROJECT)) {
    await rm(TEST_PROJECT, { recursive: true, force: true });
  }
});

describe('V2 Tags Support', () => {
  describe('Task Creation with Tags', () => {
    test('should create task with tags', async () => {
      const result = await v2.createTask(TEST_PROJECT, {
        title: 'Implement OAuth Login',
        type: 'feature',
        area: 'auth',
        tags: ['backend', 'security', 'api']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.document.frontmatter.tags).toEqual(['backend', 'security', 'api']);
    });

    test('should create task without tags', async () => {
      const result = await v2.createTask(TEST_PROJECT, {
        title: 'Update Documentation',
        type: 'documentation',
        area: 'docs'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.document.frontmatter.tags).toBeUndefined();
    });

    test('should handle empty tags array', async () => {
      const result = await v2.createTask(TEST_PROJECT, {
        title: 'Fix Bug',
        type: 'bug',
        area: 'core',
        tags: []
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Empty array should not be stored
      expect(result.data!.document.frontmatter.tags).toBeUndefined();
    });
  });

  describe('Task Filtering by Tags', () => {
    beforeEach(async () => {
      // Create test tasks with various tag combinations
      await v2.createTask(TEST_PROJECT, {
        title: 'Backend API',
        type: 'feature',
        area: 'backend',
        tags: ['api', 'backend', 'rest']
      });

      await v2.createTask(TEST_PROJECT, {
        title: 'Frontend Dashboard',
        type: 'feature',
        area: 'frontend',
        tags: ['ui', 'react', 'dashboard']
      });

      await v2.createTask(TEST_PROJECT, {
        title: 'Security Update',
        type: 'bug',
        area: 'auth',
        tags: ['security', 'backend', 'urgent']
      });

      await v2.createTask(TEST_PROJECT, {
        title: 'No Tags Task',
        type: 'chore',
        area: 'devops'
      });
    });

    test('should filter tasks by single tag', async () => {
      const result = await v2.listTasks(TEST_PROJECT, {
        tags: ['backend']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(2); // Backend API and Security Update

      const titles = result.data!.map(t => t.document.title).sort();
      expect(titles).toEqual(['Backend API', 'Security Update']);
    });

    test('should filter tasks by multiple tags (OR logic)', async () => {
      const result = await v2.listTasks(TEST_PROJECT, {
        tags: ['react', 'urgent']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(2); // Frontend Dashboard and Security Update

      const titles = result.data!.map(t => t.document.title).sort();
      expect(titles).toEqual(['Frontend Dashboard', 'Security Update']);
    });

    test('should return empty list when no tasks match tags', async () => {
      const result = await v2.listTasks(TEST_PROJECT, {
        tags: ['nonexistent']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(0);
    });

    test('should ignore tasks without tags when filtering', async () => {
      const result = await v2.listTasks(TEST_PROJECT, {
        tags: ['backend', 'ui', 'security']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(3); // All tasks except "No Tags Task"

      const titles = result.data!.map(t => t.document.title);
      expect(titles).not.toContain('No Tags Task');
    });

    test('should combine tag filter with other filters', async () => {
      const result = await v2.listTasks(TEST_PROJECT, {
        tags: ['backend'],
        type: 'feature'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(1); // Only Backend API

      expect(result.data![0].document.title).toBe('Backend API');
    });
  });

  describe('Task Update with Tags', () => {
    test('should update task tags', async () => {
      // Create initial task
      const createResult = await v2.createTask(TEST_PROJECT, {
        title: 'Update Task',
        type: 'feature',
        area: 'core',
        tags: ['initial', 'test']
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data!.metadata.id;

      // Update tags
      const updateResult = await v2.updateTask(TEST_PROJECT, taskId, {
        frontmatter: {
          tags: ['updated', 'modified', 'test']
        }
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data!.document.frontmatter.tags).toEqual(['updated', 'modified', 'test']);
    });

    test('should remove tags when set to empty array', async () => {
      // Create task with tags
      const createResult = await v2.createTask(TEST_PROJECT, {
        title: 'Remove Tags Task',
        type: 'chore',
        area: 'core',
        tags: ['temporary', 'remove-me']
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data!.metadata.id;

      // Remove tags by setting to empty array
      const updateResult = await v2.updateTask(TEST_PROJECT, taskId, {
        frontmatter: {
          tags: []
        }
      });

      expect(updateResult.success).toBe(true);
      // When tags is an empty array, it may be stored as [] or removed entirely
      const tags = updateResult.data!.document.frontmatter.tags;
      expect(!tags || tags.length === 0).toBe(true);
    });
  });

  describe('Tag Persistence', () => {
    test('should persist tags when moving task between workflows', async () => {
      // Create task in backlog with tags
      const createResult = await v2.createTask(TEST_PROJECT, {
        title: 'Moveable Task',
        type: 'feature',
        area: 'core',
        tags: ['persistent', 'workflow-test']
      });

      expect(createResult.success).toBe(true);
      const taskId = createResult.data!.metadata.id;

      // Move to current
      const moveResult = await v2.moveTask(TEST_PROJECT, taskId, {
        targetState: 'current'
      });

      expect(moveResult.success).toBe(true);
      expect(moveResult.data!.document.frontmatter.tags).toEqual(['persistent', 'workflow-test']);

      // Verify by reading
      const getResult = await v2.getTask(TEST_PROJECT, taskId);
      expect(getResult.success).toBe(true);
      expect(getResult.data!.document.frontmatter.tags).toEqual(['persistent', 'workflow-test']);
    });
  });

  describe('Type Safety', () => {
    test('should type check tags as string array', () => {
      // This is a compile-time test - the TypeScript compiler will ensure
      // that tags is properly typed as string[]
      const frontmatter: v2.TaskFrontmatter = {
        type: 'feature',
        status: 'To Do',
        area: 'test',
        tags: ['string1', 'string2'] // Should compile
      };

      expect(frontmatter.tags).toBeDefined();
      expect(Array.isArray(frontmatter.tags)).toBe(true);
    });

    test('should allow undefined tags', () => {
      const frontmatter: v2.TaskFrontmatter = {
        type: 'feature',
        status: 'To Do',
        area: 'test'
        // tags is optional
      };

      expect(frontmatter.tags).toBeUndefined();
    });
  });
});