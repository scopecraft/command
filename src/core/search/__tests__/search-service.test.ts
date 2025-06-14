/**
 * Tests for SearchService
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { SearchService } from '../search-service.js';
import * as core from '../../index.js';

describe('SearchService', () => {
  // Use a test project in /tmp to ensure complete isolation from the real project
  const testProjectRoot = join('/tmp', `scopecraft-search-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  let searchService: SearchService;

  beforeEach(() => {
    // Create test project directory
    mkdirSync(testProjectRoot, { recursive: true });
    
    // Create a scopecraft config file to ensure proper project isolation
    const configPath = join(testProjectRoot, '.scopecraft.json');
    const config = { path: testProjectRoot };
    require('fs').writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // Initialize project structure
    core.initializeProjectStructure(testProjectRoot);
    
    // Get search service instance
    searchService = SearchService.getInstance(testProjectRoot);
  });

  afterEach(async () => {
    // Shutdown service
    await searchService.shutdown();
    
    // Clean up test directory
    rmSync(testProjectRoot, { recursive: true, force: true });
    
    // Also clean up centralized storage for this test project
    const { TaskStoragePathEncoder } = await import('../../task-storage-path-encoder.js');
    const encoded = TaskStoragePathEncoder.encode(testProjectRoot);
    const centralizedPath = join(process.env.HOME || '', '.scopecraft', 'projects', encoded);
    rmSync(centralizedPath, { recursive: true, force: true });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const result = await searchService.initialize();
      expect(result.success).toBe(true);
    });

    it('should create search directory on initialization', async () => {
      const result = await searchService.initialize();
      expect(result.success).toBe(true);
      
      // Check that search directory exists
      const fs = await import('node:fs');
      const searchPath = join(process.env.HOME || '', '.scopecraft', 'projects');
      expect(fs.existsSync(searchPath)).toBe(true);
    });
  });

  describe('indexing', () => {
    it('should index an empty project', async () => {
      await searchService.initialize();
      const result = await searchService.indexProject();
      if (!result.success) {
        console.error('Index failed:', result.error);
      }
      expect(result.success).toBe(true);
    });

    it('should index tasks when present', async () => {
      // Create a test task
      const createResult = await core.create(testProjectRoot, {
        title: 'Test Search Task',
        type: 'feature',
        area: 'core',
        customMetadata: {
          assignee: 'test-user'
        }
      });
      expect(createResult.success).toBe(true);

      // Initialize and index
      await searchService.initialize();
      const indexResult = await searchService.indexProject();
      if (!indexResult.success) {
        console.error('Index failed:', indexResult.error);
      }
      expect(indexResult.success).toBe(true);

      // Search for the task
      const searchResult = await searchService.search({
        query: 'Test Search Task'
      });
      expect(searchResult.success).toBe(true);
      expect(searchResult.data?.totalCount).toBe(1);
      expect(searchResult.data?.results[0].document.title).toBe('Test Search Task');
    });
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      // Create various test tasks
      await core.create(testProjectRoot, {
        title: 'Authentication Feature',
        type: 'feature',
        area: 'security',
        tags: ['security', 'backend']
      });

      await core.create(testProjectRoot, {
        title: 'Fix Login Bug',
        type: 'bug',
        area: 'security',
        status: 'In Progress'
      });

      await core.create(testProjectRoot, {
        title: 'API Documentation',
        type: 'documentation',
        area: 'core'
      });

      // Initialize and index
      await searchService.initialize();
      await searchService.indexProject();
    });

    it('should find tasks by title', async () => {
      const result = await searchService.search({
        query: 'Authentication'
      });
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.results[0].document.title).toBe('Authentication Feature');
    });

    it('should find tasks by partial match', async () => {
      const result = await searchService.search({
        query: 'Login'
      });
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.results[0].document.title).toBe('Fix Login Bug');
    });

    it('should filter by type', async () => {
      const result = await searchService.search({
        types: ['bug']
      });
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.results[0].document.type).toBe('bug');
    });

    it('should filter by status', async () => {
      const result = await searchService.search({
        filters: {
          status: ['In Progress']
        }
      });
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.results[0].document.status).toBe('In Progress');
    });

    it('should filter by area', async () => {
      const result = await searchService.search({
        filters: {
          area: ['core']
        }
      });
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(1);
      expect(result.data?.results[0].document.area).toBe('core');
    });

    it('should respect limit parameter', async () => {
      const result = await searchService.search({
        query: '',
        limit: 2
      });
      expect(result.success).toBe(true);
      expect(result.data?.results.length).toBeLessThanOrEqual(2);
    });

    it('should return query time', async () => {
      const result = await searchService.search({
        query: 'test'
      });
      expect(result.success).toBe(true);
      expect(result.data?.queryTime).toBeGreaterThan(0);
      expect(result.data?.queryTime).toBeLessThan(100); // Should be fast
    });
  });

  describe('performance', () => {
    it('should complete queries in under 100ms', async () => {
      // Create 50 test tasks
      for (let i = 0; i < 50; i++) {
        await core.create(testProjectRoot, {
          title: `Task ${i}`,
          type: i % 2 === 0 ? 'feature' : 'bug',
          area: 'test',
          tags: [`tag${i % 5}`]
        });
      }

      await searchService.initialize();
      await searchService.indexProject();

      // Test multiple queries
      const queries = ['Task', 'feature', 'bug', 'tag1', 'Task 25'];
      
      for (const query of queries) {
        const result = await searchService.search({ query });
        expect(result.success).toBe(true);
        expect(result.data?.queryTime).toBeLessThan(100);
      }
    });
  });

  describe('error handling', () => {
    it('should handle search before initialization gracefully', async () => {
      const result = await searchService.search({
        query: 'test'
      });
      expect(result.success).toBe(true); // Should auto-initialize
    });

    it('should handle empty search gracefully', async () => {
      await searchService.initialize();
      const result = await searchService.search({});
      expect(result.success).toBe(true);
      expect(result.data?.totalCount).toBe(0);
    });

    it('should recover from corrupted index', async () => {
      await searchService.initialize();
      await searchService.indexProject();
      
      // Corrupt the index file
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const encoder = await import('../../task-storage-path-encoder.js');
      
      const encoded = encoder.TaskStoragePathEncoder.encode(testProjectRoot);
      const indexPath = path.join(
        process.env.HOME || '',
        '.scopecraft',
        'projects',
        encoded,
        'search',
        'project-index.orama'
      );
      
      await fs.writeFile(indexPath, 'corrupted data');
      
      // Should recover and rebuild
      const newService = SearchService.getInstance(testProjectRoot);
      const result = await newService.search({ query: 'test' });
      expect(result.success).toBe(true);
    });
  });
});