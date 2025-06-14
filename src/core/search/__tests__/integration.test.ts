/**
 * Integration test for search service
 * Tests the actual functionality without mocking
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { SearchService } from '../search-service.js';
import { OramaAdapter } from '../orama-adapter.js';
import { SearchIndexer } from '../indexer.js';
import type { SearchDocument } from '../types.js';

describe('Search Service Integration', () => {
  let searchService: SearchService;
  let adapter: OramaAdapter;
  let index: any;
  
  beforeEach(async () => {
    // Use a fake project root to avoid path resolution issues
    searchService = SearchService.getInstance('/fake/project/root');
    adapter = new OramaAdapter();
    index = await adapter.createIndex();
  });

  it('should perform end-to-end search', async () => {
    // Create test documents
    const docs: SearchDocument[] = [
      {
        id: 'task-1',
        title: 'Implement Authentication',
        content: 'Build JWT-based authentication system with refresh tokens',
        type: 'task',
        path: '/tasks/task-1',
        status: 'To Do',
        area: 'security',
        tags: ['auth', 'backend'],
        workflowState: 'backlog',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Fix Login Bug',
        content: 'Users cannot login when password contains special characters',
        type: 'task',
        path: '/tasks/task-2',
        status: 'In Progress',
        area: 'security',
        tags: ['bug', 'urgent'],
        workflowState: 'current',
        priority: 'highest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-3',
        title: 'Write API Documentation',
        content: 'Document all REST endpoints with examples and error codes',
        type: 'task',
        path: '/tasks/task-3',
        status: 'To Do',
        area: 'documentation',
        tags: ['docs'],
        workflowState: 'backlog',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Index documents
    await adapter.bulkIndex(index, docs);

    // Test 1: Basic text search
    const authResults = await adapter.search(index, { query: 'authentication' });
    expect(authResults.length).toBe(1);
    expect(authResults[0].document.id).toBe('task-1');
    expect(authResults[0].score).toBeGreaterThan(0);

    // Test 2: Search with type filter
    const taskResults = await adapter.search(index, { types: ['task'] });
    expect(taskResults.length).toBe(3);

    // Test 3: Search with status filter
    const inProgressResults = await adapter.search(index, {
      filters: { status: ['In Progress'] }
    });
    expect(inProgressResults.length).toBe(1);
    expect(inProgressResults[0].document.id).toBe('task-2');

    // Test 4: Search with area filter
    const securityResults = await adapter.search(index, {
      filters: { area: ['security'] }
    });
    expect(securityResults.length).toBe(2);

    // Test 5: Combined search and filter
    const bugResults = await adapter.search(index, {
      query: 'bug',
      filters: { area: ['security'] }
    });
    expect(bugResults.length).toBe(1);
    expect(bugResults[0].document.id).toBe('task-2');

    // Test 6: Workflow state filter
    const currentResults = await adapter.search(index, {
      filters: { workflowState: ['current'] }
    });
    expect(currentResults.length).toBe(1);
    expect(currentResults[0].document.workflowState).toBe('current');

    // Test 7: Limit results
    const limitedResults = await adapter.search(index, {
      query: '',
      limit: 2
    });
    expect(limitedResults.length).toBeLessThanOrEqual(2);

    // Test 8: Extract excerpt
    const excerptResults = await adapter.search(index, {
      query: 'special characters'
    });
    expect(excerptResults.length).toBe(1);
    expect(excerptResults[0].excerpt).toContain('special characters');
    expect(excerptResults[0].excerpt).toContain('**special characters**'); // Should be highlighted
  });

  it('should handle edge cases gracefully', async () => {
    // Empty query should return all documents
    await adapter.addDocument(index, {
      id: 'test-doc',
      title: 'Test',
      content: 'Test content',
      type: 'task',
      path: '/test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const allResults = await adapter.search(index, {});
    expect(allResults.length).toBe(1);

    // Non-matching query should return empty
    const noResults = await adapter.search(index, {
      query: 'nonexistentterm'
    });
    expect(noResults.length).toBe(0);

    // Invalid filter values should be handled
    const invalidFilter = await adapter.search(index, {
      filters: { status: ['InvalidStatus'] }
    });
    expect(invalidFilter.length).toBe(0);
  });

  it('should maintain performance under load', async () => {
    // Add 100 documents
    const largeDocs: SearchDocument[] = [];
    for (let i = 0; i < 100; i++) {
      largeDocs.push({
        id: `doc-${i}`,
        title: `Document ${i}`,
        content: `This is the content for document number ${i} with various keywords`,
        type: i % 2 === 0 ? 'task' : 'task',
        path: `/docs/doc-${i}`,
        status: i % 3 === 0 ? 'To Do' : 'In Progress',
        area: i % 4 === 0 ? 'core' : 'ui',
        tags: [`tag${i % 5}`],
        workflowState: i % 2 === 0 ? 'backlog' : 'current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await adapter.bulkIndex(index, largeDocs);

    // Test search performance
    const start = performance.now();
    const results = await adapter.search(index, {
      query: 'document',
      filters: { area: ['core'] }
    });
    const searchTime = performance.now() - start;

    expect(searchTime).toBeLessThan(100); // Should be under 100ms
    expect(results.length).toBeGreaterThan(0);
  });
});