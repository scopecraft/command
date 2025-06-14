/**
 * Search Service Type Definitions
 * Following Scopecraft's existing type patterns
 */

import type { TaskPriority, TaskStatus, WorkflowState, ISOTimestamp } from '../types.js';

/**
 * Operation result pattern used throughout Scopecraft
 */
export type OperationResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Search query structure matching TaskListOptions pattern
 */
export interface SearchQuery {
  query?: string;                      // Text query
  types?: ('task' | 'parent' | 'doc')[];         // Filter by content type
  filters?: {                          // Basic filters - matches TaskListOptions pattern
    status?: string[];
    area?: string[];
    tags?: string[];
    workflowState?: WorkflowState[];
  };
  limit?: number;                      // Max results (default: 50)
}

/**
 * Search results with performance metrics
 */
export interface SearchResults {
  results: SearchResult[];
  totalCount: number;
  queryTime: number;                   // For performance monitoring
}

/**
 * Individual search result
 */
export interface SearchResult {
  document: SearchDocument;
  score: number;
  excerpt?: string;                    // Highlighted snippet
}

/**
 * Document schema following Scopecraft's existing type patterns
 */
export interface SearchDocument {
  id: string;
  title: string;
  content: string;                     // Processed for search
  type: 'task' | 'parent' | 'doc';
  path: string;
  
  // Task-specific fields (matching TaskMetadata structure)
  status?: TaskStatus;                 // Using existing enum
  area?: string;
  tags?: string[];
  workflowState?: WorkflowState;       // Using existing enum
  priority?: TaskPriority;             // Using existing enum
  assignee?: string;
  
  // Parent task context
  isParentTask?: boolean;
  parentTask?: string;
  
  // Timestamps
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Adapter interface for search libraries
 */
export interface SearchAdapter {
  createIndex(schema?: IndexSchema): Promise<SearchIndex>;
  search(index: SearchIndex, query: SearchQuery): Promise<SearchResult[]>;
  addDocument(index: SearchIndex, doc: SearchDocument): Promise<void>;
  removeDocument(index: SearchIndex, id: string): Promise<void>;
  bulkIndex(index: SearchIndex, documents: SearchDocument[]): Promise<void>;
  saveIndex(index: SearchIndex, path: string): Promise<void>;
  loadIndex(path: string): Promise<SearchIndex>;
}

/**
 * Index schema definition
 */
export interface IndexSchema {
  [field: string]: string | { type: string; [key: string]: any };
}

/**
 * Search index abstraction
 */
export interface SearchIndex {
  // Implementation-specific, wrapped by adapter
  [key: string]: any;
}

/**
 * Content change for incremental indexing
 */
export interface ContentChange {
  type: 'add' | 'update' | 'delete';
  id: string;
  path: string;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  enabled: boolean;                    // Feature flag
  indexFile: string;                   // Default: 'project-index.orama'
  maxResults: number;                  // Default: 100
  cacheEnabled: boolean;               // Default: true
  cacheTtl: number;                    // Default: 5 minutes
}

/**
 * Default search configuration
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enabled: true,
  indexFile: 'project-index.orama',
  maxResults: 100,
  cacheEnabled: true,
  cacheTtl: 300000
};

/**
 * Search error class following ConfigurationError pattern
 */
export class SearchError extends Error {
  constructor(
    message: string,
    public operation: string,
    public cause?: Error,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SearchError';
  }
}