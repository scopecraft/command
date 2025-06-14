/**
 * Tests for OramaAdapter
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { OramaAdapter } from '../orama-adapter.js';
import type { SearchDocument, SearchIndex } from '../types.js';

describe('OramaAdapter', () => {
  let adapter: OramaAdapter;
  let index: SearchIndex;

  beforeEach(async () => {
    adapter = new OramaAdapter();
    index = await adapter.createIndex();
  });

  describe('createIndex', () => {
    it('should create an index successfully', async () => {
      expect(index).toBeDefined();
      expect(index.oramaInstance).toBeDefined();
    });

    it('should accept custom schema', async () => {
      const customSchema = {
        id: 'string',
        title: 'string',
        customField: 'number'
      };
      const customIndex = await adapter.createIndex(customSchema);
      expect(customIndex).toBeDefined();
    });
  });

  describe('document operations', () => {
    const testDoc: SearchDocument = {
      id: 'test-123',
      title: 'Test Task',
      content: 'This is a test task for search functionality',
      type: 'task',
      path: '/test/path',
      status: 'To Do',
      area: 'core',
      tags: ['test', 'search'],
      workflowState: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should add a document', async () => {
      await expect(adapter.addDocument(index, testDoc)).resolves.not.toThrow();
    });

    it('should search for added documents', async () => {
      await adapter.addDocument(index, testDoc);
      
      const results = await adapter.search(index, {
        query: 'test task'
      });
      
      expect(results.length).toBe(1);
      expect(results[0].document.id).toBe('test-123');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should remove documents', async () => {
      await adapter.addDocument(index, testDoc);
      await adapter.removeDocument(index, 'test-123');
      
      const results = await adapter.search(index, {
        query: 'test task'
      });
      
      expect(results.length).toBe(0);
    });

    it('should bulk index documents', async () => {
      const documents: SearchDocument[] = [
        { ...testDoc, id: 'doc-1', title: 'First Document' },
        { ...testDoc, id: 'doc-2', title: 'Second Document' },
        { ...testDoc, id: 'doc-3', title: 'Third Document' }
      ];
      
      await adapter.bulkIndex(index, documents);
      
      const results = await adapter.search(index, {
        query: 'document'
      });
      
      expect(results.length).toBe(3);
    });
  });

  describe('search functionality', () => {
    beforeEach(async () => {
      const documents: SearchDocument[] = [
        {
          id: 'feat-1',
          title: 'Authentication Feature',
          content: 'Implement user authentication with JWT tokens',
          type: 'task',
          path: '/tasks/feat-1',
          status: 'To Do',
          area: 'security',
          tags: ['auth', 'backend'],
          workflowState: 'backlog',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'bug-1',
          title: 'Fix Login Bug',
          content: 'Users cannot login with special characters in password',
          type: 'task',
          path: '/tasks/bug-1',
          status: 'In Progress',
          area: 'security',
          tags: ['bug', 'urgent'],
          workflowState: 'current',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'doc-1',
          title: 'API Documentation',
          content: 'Document all REST API endpoints with examples',
          type: 'doc',
          path: '/docs/api',
          area: 'documentation',
          tags: ['docs', 'api'],
          workflowState: 'backlog',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      await adapter.bulkIndex(index, documents);
    });

    it('should search by text query', async () => {
      const results = await adapter.search(index, {
        query: 'authentication'
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].document.title).toContain('Authentication');
    });

    it('should filter by type', async () => {
      const results = await adapter.search(index, {
        types: ['doc']
      });
      
      expect(results.length).toBe(1);
      expect(results[0].document.type).toBe('doc');
    });

    it('should filter by status', async () => {
      const results = await adapter.search(index, {
        filters: {
          status: ['In Progress']
        }
      });
      
      expect(results.length).toBe(1);
      expect(results[0].document.status).toBe('In Progress');
    });

    it('should filter by area', async () => {
      const results = await adapter.search(index, {
        filters: {
          area: ['security']
        }
      });
      
      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result.document.area).toBe('security');
      });
    });

    it('should filter by workflow state', async () => {
      const results = await adapter.search(index, {
        filters: {
          workflowState: ['current']
        }
      });
      
      expect(results.length).toBe(1);
      expect(results[0].document.workflowState).toBe('current');
    });

    it('should respect limit', async () => {
      const results = await adapter.search(index, {
        query: '',
        limit: 2
      });
      
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should boost title matches', async () => {
      const results = await adapter.search(index, {
        query: 'API'
      });
      
      // Title match should score higher
      expect(results[0].document.title).toContain('API');
    });

    it('should extract excerpts', async () => {
      const results = await adapter.search(index, {
        query: 'JWT tokens'
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].excerpt).toBeDefined();
      expect(results[0].excerpt).toContain('JWT');
    });
  });

  describe('persistence', () => {
    it('should save and load index', async () => {
      const doc: SearchDocument = {
        id: 'persist-test',
        title: 'Persistence Test',
        content: 'Testing save and load functionality',
        type: 'task',
        path: '/test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await adapter.addDocument(index, doc);
      
      // Save index
      const tempPath = `/tmp/test-index-${Date.now()}.orama`;
      await adapter.saveIndex(index, tempPath);
      
      // Load index
      const loadedIndex = await adapter.loadIndex(tempPath);
      
      // Search in loaded index
      const results = await adapter.search(loadedIndex, {
        query: 'Persistence'
      });
      
      expect(results.length).toBe(1);
      expect(results[0].document.id).toBe('persist-test');
      
      // Clean up
      const fs = await import('node:fs/promises');
      await fs.unlink(tempPath);
    });
  });
});