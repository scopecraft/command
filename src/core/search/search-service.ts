/**
 * Search Service following Scopecraft singleton pattern
 * Based on ConfigurationManager implementation pattern
 */

import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { createPathContext, resolvePath, PATH_TYPES } from '../paths/index.js';
import { OramaAdapter } from './orama-adapter.js';
import { SearchIndexer } from './indexer.js';
import {
  DEFAULT_SEARCH_CONFIG,
  type SearchAdapter,
  type SearchQuery,
  type SearchResults,
  type SearchIndex,
  type ContentChange,
  type SearchConfig,
  type OperationResult
} from './types.js';

/**
 * Search Service singleton implementation
 */
export class SearchService {
  private static instances: Map<string, SearchService> = new Map();
  private isInitialized = false;
  private adapter: SearchAdapter | null = null;
  private indexer: SearchIndexer | null = null;
  private index: SearchIndex | null = null;
  private projectRoot: string;
  private config: SearchConfig;
  
  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.config = DEFAULT_SEARCH_CONFIG;
  }
  
  /**
   * Get singleton instance for project root (following ConfigurationManager pattern)
   */
  public static getInstance(projectRoot?: string): SearchService {
    if (!projectRoot) {
      const configManager = ConfigurationManager.getInstance();
      const rootConfig = configManager.getRootConfig();
      if (!rootConfig.path) {
        throw new Error('No project root configured');
      }
      projectRoot = rootConfig.path;
    }
    
    if (!SearchService.instances.has(projectRoot)) {
      SearchService.instances.set(projectRoot, new SearchService(projectRoot));
    }
    return SearchService.instances.get(projectRoot)!;
  }
  
  /**
   * Initialize search service (following existing patterns)
   */
  public async initialize(): Promise<OperationResult<void>> {
    if (this.isInitialized) {
      return { success: true };
    }
    
    try {
      // 1. Initialize adapter
      this.adapter = new OramaAdapter();
      this.indexer = new SearchIndexer(this.adapter);
      
      // 2. Ensure search directory exists
      const context = createPathContext(this.projectRoot);
      const searchPath = resolvePath(PATH_TYPES.SEARCH, context);
      if (!existsSync(searchPath)) {
        await mkdir(searchPath, { recursive: true });
      }
      
      // 3. Load or create index
      const indexPath = this.getIndexPath();
      if (existsSync(indexPath)) {
        await this.loadIndex();
      } else {
        // Create new index
        this.index = await this.adapter.createIndex();
        await this.indexProject();
      }
      
      this.isInitialized = true;
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize search service',
      };
    }
  }
  
  /**
   * Search implementation returning OperationResult
   */
  public async search(query: SearchQuery): Promise<OperationResult<SearchResults>> {
    if (!this.isInitialized || !this.adapter || !this.index) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return {
          success: false,
          error: 'Search service not available',
        };
      }
    }
    
    try {
      const startTime = performance.now();
      const results = await this.adapter!.search(this.index!, query);
      const queryTime = performance.now() - startTime;
      
      // Apply limit if not already handled by adapter
      const limitedResults = results.slice(0, query.limit || this.config.maxResults);
      
      return {
        success: true,
        data: {
          results: limitedResults,
          totalCount: results.length,
          queryTime: Math.round(queryTime * 100) / 100, // Round to 2 decimals
        },
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search query failed',
      };
    }
  }
  
  /**
   * Index project following OperationResult pattern
   */
  public async indexProject(): Promise<OperationResult<void>> {
    try {
      if (!this.adapter || !this.indexer) {
        this.adapter = new OramaAdapter();
        this.indexer = new SearchIndexer(this.adapter);
      }
      
      if (!this.index) {
        this.index = await this.adapter.createIndex();
      }
      
      // Use indexer to process all tasks
      const indexResult = await this.indexer.indexProject(this.projectRoot, this.index);
      if (!indexResult.success) {
        return indexResult;
      }
      
      // Save index to disk
      await this.saveIndex();
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to index project',
      };
    }
  }
  
  /**
   * Update index for specific changes
   */
  public async updateIndex(changes: ContentChange[]): Promise<OperationResult<void>> {
    try {
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }
      
      if (!this.index || !this.indexer) {
        return {
          success: false,
          error: 'Search service not properly initialized'
        };
      }
      
      const updateResult = await this.indexer.updateIndex(
        this.index,
        changes,
        this.projectRoot
      );
      
      if (!updateResult.success) {
        return updateResult;
      }
      
      // Save updated index
      await this.saveIndex();
      
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update index'
      };
    }
  }
  
  /**
   * Shutdown service
   */
  public async shutdown(): Promise<void> {
    // Save index if needed
    if (this.index && this.adapter) {
      await this.saveIndex();
    }
    
    // Clear instance
    SearchService.instances.delete(this.projectRoot);
    this.isInitialized = false;
    this.adapter = null;
    this.indexer = null;
    this.index = null;
  }
  
  /**
   * Get the full path to the search index file
   * This is the ONLY place where we build search-related paths
   */
  private getIndexPath(): string {
    const context = createPathContext(this.projectRoot);
    const searchDir = resolvePath(PATH_TYPES.SEARCH, context);
    return join(searchDir, this.config.indexFile);
  }
  
  /**
   * Load index from disk
   */
  private async loadIndex(): Promise<void> {
    if (!this.adapter) {
      throw new Error('Adapter not initialized');
    }
    
    try {
      const indexPath = this.getIndexPath();
      this.index = await this.adapter.loadIndex(indexPath);
    } catch (error) {
      console.warn('Failed to load index, creating new one:', error);
      // Create new index if loading fails
      this.index = await this.adapter.createIndex();
      await this.indexProject();
    }
  }
  
  /**
   * Save index to disk
   */
  private async saveIndex(): Promise<void> {
    if (!this.adapter || !this.index) {
      return;
    }
    
    try {
      const indexPath = this.getIndexPath();
      await this.adapter.saveIndex(this.index, indexPath);
    } catch (error) {
      console.error('Failed to save search index:', error);
      // Non-fatal - search will still work in memory
    }
  }
}

/**
 * Global service access following existing patterns
 */
export function getSearchService(projectRoot?: string): SearchService {
  return SearchService.getInstance(projectRoot);
}