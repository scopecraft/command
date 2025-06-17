/**
 * Orama Adapter Implementation
 * Wraps Orama API to implement SearchAdapter interface
 */

import { type AnyOrama, create, insert, load, remove, save, search } from '@orama/orama';
import { getSchema } from '../metadata/index.js';
import type {
  IndexSchema,
  SearchAdapter,
  SearchDocument,
  SearchIndex,
  SearchQuery,
  SearchResult,
} from './types.js';

/**
 * Get Orama schema by combining metadata service enums with Task types
 */
function getOramaSchema() {
  const _metadataSchema = getSchema();

  // Core document fields (from SearchDocument)
  const schema: Record<string, string> = {
    // Base fields
    id: 'string',
    title: 'string',
    content: 'string',
    path: 'string',

    // Extended type to support future doc types (sessions, etc)
    type: 'enum',

    // From TaskFrontmatter (via metadata service enums)
    status: 'enum',
    phase: 'enum',
    area: 'string',
    tags: 'string[]',
    workflowState: 'enum',
    priority: 'enum',
    assignee: 'string',

    // From TaskMetadata
    isParentTask: 'boolean',
    parentTask: 'string',
    createdAt: 'string', // ISOTimestamp
    updatedAt: 'string', // ISOTimestamp
  };

  return schema;
}

/**
 * Orama adapter implementing the SearchAdapter interface
 */
export class OramaAdapter implements SearchAdapter {
  /**
   * Prepare document for Orama by ensuring all fields have values
   * Orama doesn't handle undefined/null well, so we convert to empty strings
   */
  private prepareDocument(doc: SearchDocument): any {
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      type: doc.type,
      path: doc.path,
      status: doc.status || '',
      phase: doc.phase || '',
      area: doc.area || '',
      tags: doc.tags || [],
      workflowState: doc.workflowState || 'current',
      priority: doc.priority || '',
      assignee: doc.assignee || '',
      isParentTask: doc.isParentTask || false,
      parentTask: doc.parentTask || '',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  /**
   * Create a new search index
   */
  async createIndex(schema?: IndexSchema): Promise<SearchIndex> {
    // Use provided schema or default Orama schema
    const indexSchema = schema || getOramaSchema();

    const db = await create({
      schema: indexSchema as any,
      components: {
        tokenizer: {
          // Better tokenization for technical content
          stemming: true,
          stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'],
        },
      },
    });

    // Wrap Orama instance to match our interface
    return { oramaInstance: db } as SearchIndex;
  }

  /**
   * Search the index
   */
  async search(index: SearchIndex, query: SearchQuery): Promise<SearchResult[]> {
    const orama = (index as any).oramaInstance as AnyOrama;
    // Build Orama query
    const oramaQuery: any = {};

    // Text search
    if (query.query?.trim()) {
      oramaQuery.term = query.query;
      oramaQuery.properties = ['id', 'title', 'content'];
      oramaQuery.boost = {
        id: 3, // ID matches are most important (exact identifier)
        title: 2, // Title matches are more important
        content: 1,
      };
    }

    // Build filters
    const where: any = {};

    if (query.types && query.types.length > 0) {
      // Orama doesn't support array contains for enum fields
      // We'll filter in post-processing instead
    }

    if (query.filters) {
      if (query.filters.status && query.filters.status.length > 0) {
        where.status = query.filters.status;
      }

      if (query.filters.phase && query.filters.phase.length > 0) {
        where.phase = query.filters.phase;
      }

      if (query.filters.area && query.filters.area.length > 0) {
        where.area = query.filters.area;
      }

      if (query.filters.workflowState && query.filters.workflowState.length > 0) {
        // Handle in post-processing due to enum limitations
      }

      // Tags require special handling in Orama
      if (query.filters.tags && query.filters.tags.length > 0) {
        // For now, we'll search in content for tags
        // TODO: Implement proper tag filtering when Orama supports array contains
      }
    }

    // Add where clause if we have filters
    if (Object.keys(where).length > 0) {
      oramaQuery.where = where;
    }

    // Set limit
    oramaQuery.limit = query.limit || 50;

    // Execute search
    const results = await search(orama, oramaQuery);

    // Post-process results for type and workflowState filtering
    let hits = results.hits;
    if (query.types && query.types.length > 0) {
      hits = hits.filter((hit: any) => query.types?.includes(hit.document.type));
    }
    if (query.filters?.workflowState && query.filters.workflowState.length > 0) {
      hits = hits.filter((hit: any) =>
        query.filters?.workflowState?.includes(hit.document.workflowState)
      );
    }

    // Map Orama results to our format
    return hits.map((hit: any) => ({
      document: hit.document as SearchDocument,
      score: hit.score,
      // TODO: Extract excerpt with highlights when Orama supports it
      excerpt: this.extractExcerpt(hit.document.content, query.query),
    }));
  }

  /**
   * Add a document to the index
   */
  async addDocument(index: SearchIndex, doc: SearchDocument): Promise<void> {
    const orama = (index as any).oramaInstance as AnyOrama;
    const preparedDoc = this.prepareDocument(doc);
    await insert(orama, preparedDoc);
  }

  /**
   * Remove a document from the index
   */
  async removeDocument(index: SearchIndex, id: string): Promise<void> {
    const orama = (index as any).oramaInstance as AnyOrama;
    await remove(orama, id);
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(index: SearchIndex, documents: SearchDocument[]): Promise<void> {
    // Orama doesn't have a bulk insert, so we insert one by one
    // This is still performant for our use case
    for (const doc of documents) {
      try {
        // Try to remove existing document first to avoid duplicates
        await this.removeDocument(index, doc.id);
      } catch {
        // Document doesn't exist, that's fine
      }
      await this.addDocument(index, doc);
    }
  }

  /**
   * Save index to disk
   */
  async saveIndex(index: SearchIndex, path: string): Promise<void> {
    const orama = (index as any).oramaInstance as AnyOrama;

    // Get all documents for saving
    const allDocs = await search(orama, { limit: 10000 });

    const data = {
      documents: allDocs.hits.map((hit) => hit.document),
      schema: getOramaSchema(),
    };

    // Use Node.js fs to write the data
    const fs = await import('node:fs/promises');
    await fs.writeFile(path, JSON.stringify(data));
  }

  /**
   * Load index from disk
   */
  async loadIndex(path: string): Promise<SearchIndex> {
    const fs = await import('node:fs/promises');
    const data = await fs.readFile(path, 'utf-8');
    const parsedData = JSON.parse(data);

    // Since Orama's load is having issues, let's rebuild the index
    // This is acceptable for MVP - we can optimize later
    const orama = await create({
      schema: getOramaSchema() as any,
      components: {
        tokenizer: {
          stemming: true,
          stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'],
        },
      },
    });

    // Re-index the documents from the saved data
    if (parsedData.documents && Array.isArray(parsedData.documents)) {
      for (const doc of parsedData.documents) {
        await insert(orama, doc);
      }
    }

    return { oramaInstance: orama } as SearchIndex;
  }

  /**
   * Extract excerpt from content
   * Simple implementation - can be enhanced later
   */
  private extractExcerpt(content: string, query?: string): string {
    if (!query || !content) {
      // Return first 150 chars if no query
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }

    // Find query in content (case insensitive)
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
      // Query not found, return beginning
      return content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }

    // Extract context around the match
    const contextBefore = 50;
    const contextAfter = 100;
    const start = Math.max(0, index - contextBefore);
    const end = Math.min(content.length, index + query.length + contextAfter);

    let excerpt = content.substring(start, end);

    // Add ellipsis if needed
    if (start > 0) excerpt = `...${excerpt}`;
    if (end < content.length) excerpt = `${excerpt}...`;

    // Simple highlight (can be enhanced with proper HTML escaping)
    const highlightedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    excerpt = excerpt.replace(new RegExp(`(${highlightedQuery})`, 'gi'), '**$1**');

    return excerpt;
  }
}
