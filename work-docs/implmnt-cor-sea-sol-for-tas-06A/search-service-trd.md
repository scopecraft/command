# Technical Requirements Document: Search Service MVP

**Version**: 1.0  
**Date**: 2025-06-13  
**Status**: Draft  
**Author**: Autonomous Agent (Task 03_desi-tchncal-rqrmnts-sear-06U)  

## Executive Summary

This TRD defines the MVP search implementation for Scopecraft - a two-person team building a pre-launch product. We're implementing working search that doesn't suck, with good architectural bones for future growth, without over-engineering for enterprise scale we don't need yet.

**What we're building**: Fast search across tasks and docs with clean architecture that can grow.  
**What we're not building**: Enterprise search infrastructure for thousands of users.

## ⚠️ IMPORTANT SCOPE CHANGE NOTICE

**This TRD was significantly revised from initial enterprise-scale approach to MVP-appropriate scope.**

### What Changed and Why

**Original Approach**: 47-section enterprise TRD with multi-tenant architecture, distributed services, complex migration orchestration, AI enhancement frameworks, and service extraction planning.

**Revised Approach**: 12-section MVP-focused TRD with solid foundations that can grow naturally.

**Rationale for Change**:
- **Team Reality**: Two co-founders building pre-launch product, not enterprise team serving thousands
- **Avoid Architecture Astronaut Debt**: Don't build complexity we won't need for years
- **Maintain Quality**: Still solid engineering patterns, just right-sized for our actual needs
- **Enable Growth**: Architecture can evolve naturally when we actually need advanced features

**What We Kept** (Solid Foundations):
- Clean service architecture with adapter pattern
- Good TypeScript interfaces and error handling  
- Integration with existing path resolution system
- Basic performance monitoring and testing strategy
- Support for future cross-project search

**What We Removed** (Over-Engineering):
- Multi-tenant search (Scopecraft is local tool, no tenancy concept)
- Distributed service preparation (not needed for local dev tool)
- Complex migration orchestration (simple setup is fine)
- AI enhancement frameworks (future feature, not MVP requirement)
- Advanced telemetry and monitoring (basic metrics sufficient)
- Vector search preparation (can add when actually needed)

**Impact on Implementation Planning**: 
- Timeline reduced from enterprise-scale to 3 weeks
- Complexity reduced while maintaining architectural quality
- Focus shifted to "working search that makes Scopecraft more useful"

**For Orchestrator**: Please read this task's full log to understand the scope refinement. The search service is still architecturally sound, just appropriately sized for our current team and product stage.

### Key MVP Capabilities
- **Sub-100ms search** across tasks and documentation 
- **Clean adapter pattern** so we can swap search libraries if needed
- **Simple setup** - run one command, search works
- **CLI/MCP integration** so you can actually use it
- **Good TypeScript interfaces** for maintainable code

## 1. Architecture Overview

### Service Structure
```
src/core/search/
├── index.ts              # Public exports
├── search-service.ts     # Main service class  
├── orama-adapter.ts      # Orama integration
├── indexer.ts           # Content indexing
├── types.ts             # TypeScript interfaces
└── __tests__/           # Tests
```

### Integration Points
- **Storage**: Uses existing path resolution, stores in `~/.scopecraft/projects/{encoded}/search/`
- **CLI**: New `search` command group 
- **MCP**: New search operations in MCP server
- **Core**: Integrates with existing task/doc loading

### Data Flow
```
Content Changes → Indexer → Orama Index → Search Service → Results
      ↑                                         ↑
   Tasks/Docs                              CLI/MCP Query
```

## 2. Core Interfaces

### Search Service Pattern
Following the Scopecraft service architecture pattern (similar to `ConfigurationManager` and `TaskCRUD`):

```typescript
export class SearchService {
  private static instance: SearchService | null = null;
  private projectRoot: string;
  private adapter: SearchAdapter;
  private indexer: SearchIndexer;
  private isInitialized = false;
  
  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.adapter = new OramaAdapter();
    this.indexer = new SearchIndexer(this.adapter);
  }
  
  // Singleton pattern used throughout Scopecraft
  public static getInstance(projectRoot?: string): SearchService {
    if (!SearchService.instance || (projectRoot && SearchService.instance.projectRoot !== projectRoot)) {
      if (!projectRoot) {
        const configManager = ConfigurationManager.getInstance();
        projectRoot = configManager.getRootConfig().path;
      }
      SearchService.instance = new SearchService(projectRoot);
    }
    return SearchService.instance;
  }
  
  // Core operations following OperationResult pattern
  async search(query: SearchQuery): Promise<OperationResult<SearchResults>>;
  async indexProject(): Promise<OperationResult<void>>;
  async updateIndex(changes: ContentChange[]): Promise<OperationResult<void>>;
  
  // Lifecycle
  async initialize(): Promise<OperationResult<void>>;
  async shutdown(): Promise<void>;
}

export interface SearchQuery {
  query?: string;                    // Text query
  types?: ('task' | 'doc')[];       // Filter by content type
  filters?: {                       // Basic filters - matches TaskListOptions pattern
    status?: string[];
    area?: string[];
    tags?: string[];
    workflowState?: WorkflowState[];
  };
  limit?: number;                   // Max results (default: 50)
}

export interface SearchResults {
  results: SearchResult[];
  totalCount: number;
  queryTime: number;                // For performance monitoring
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  excerpt?: string;                 // Highlighted snippet
}
```

### Document Schema
Following Scopecraft's existing type patterns (`Task`, `TaskMetadata`):

```typescript
export interface SearchDocument {
  id: string;
  title: string;
  content: string;                  // Processed for search
  type: 'task' | 'doc';
  path: string;
  
  // Task-specific fields (matching TaskMetadata structure)
  status?: TaskStatus;              // Using existing enum
  area?: string;
  tags?: string[];
  workflowState?: WorkflowState;    // Using existing enum
  priority?: TaskPriority;          // Using existing enum
  assignee?: string;
  
  // Parent task context
  isParentTask?: boolean;
  parentTask?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

## 3. Orama Integration

### Adapter Pattern
```typescript
export interface SearchAdapter {
  createIndex(schema: IndexSchema): Promise<SearchIndex>;
  search(index: SearchIndex, query: SearchQuery): Promise<SearchResult[]>;
  addDocument(index: SearchIndex, doc: SearchDocument): Promise<void>;
  removeDocument(index: SearchIndex, id: string): Promise<void>;
}

export class OramaAdapter implements SearchAdapter {
  // Orama-specific implementation
  // Wraps Orama API so we can swap libraries later if needed
}
```

### Index Schema
```typescript
const ORAMA_SCHEMA = {
  id: 'string',
  title: 'string',
  content: 'string',
  type: 'enum',
  status: 'string',
  area: 'string',
  tags: 'string[]',
  workflowState: 'enum',
  createdAt: 'string',
  updatedAt: 'string'
};
```

## 4. Content Indexing

### Indexer Implementation
Following Scopecraft's core service patterns with proper error handling:

```typescript
export class SearchIndexer {
  constructor(private adapter: SearchAdapter) {}
  
  async indexProject(projectRoot: string): Promise<OperationResult<void>> {
    try {
      // Use existing core functions to scan tasks
      const listOptions: TaskListOptions = {
        includeArchived: true,
        workflowStates: ['backlog', 'current', 'archive']
      };
      
      const taskResult = await core.list(projectRoot, listOptions);
      if (!taskResult.success) {
        return { success: false, error: taskResult.error };
      }
      
      // Process each task into SearchDocument
      const documents: SearchDocument[] = [];
      for (const task of taskResult.data || []) {
        const doc = this.processTaskToDocument(task);
        if (doc) documents.push(doc);
      }
      
      // Index documents using adapter
      await this.adapter.bulkIndex(documents);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown indexing error'
      };
    }
  }
  
  async updateIndex(changes: ContentChange[]): Promise<OperationResult<void>> {
    try {
      for (const change of changes) {
        switch (change.type) {
          case 'add':
          case 'update':
            const doc = await this.processFileToDocument(change.path);
            if (doc) await this.adapter.addDocument(doc);
            break;
          case 'delete':
            await this.adapter.removeDocument(change.id);
            break;
        }
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }
  
  private processTaskToDocument(task: Task): SearchDocument | null {
    try {
      // Use existing task-parser functions for content extraction
      const content = this.extractSearchableContent(task.document);
      
      return {
        id: task.metadata.id,
        title: task.document.title,
        content,
        type: 'task',
        path: task.metadata.path,
        status: task.document.frontmatter.status,
        area: task.document.frontmatter.area,
        tags: task.document.frontmatter.tags,
        workflowState: task.metadata.workflowState,
        priority: task.document.frontmatter.priority,
        assignee: task.document.frontmatter.assignee,
        isParentTask: task.metadata.isParentTask,
        parentTask: task.metadata.parentTask,
        createdAt: task.metadata.createdAt || new Date().toISOString(),
        updatedAt: task.metadata.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.warn(`Failed to process task ${task.metadata.id}:`, error);
      return null;
    }
  }
  
  private extractSearchableContent(document: TaskDocument): string {
    // Use existing parseTaskDocument sections
    const sections = [
      document.title,
      document.sections?.instruction || '',
      document.sections?.tasks || '',
      document.sections?.deliverable || ''
    ];
    
    return sections
      .join(' ')
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove code blocks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
```

### Content Processing
- **Tasks**: Extract from title, instruction, tasks, deliverable sections
- **Docs**: Extract from markdown content, respect frontmatter
- **Cleanup**: Remove markdown formatting, normalize whitespace
- **Incremental**: Only reindex changed files

## 5. CLI Integration

### Command Structure
Following Scopecraft's entity-command CLI pattern in `/src/cli/entity-commands.ts`:

```bash
# Search across all content
sc search "authentication logic"

# Search with filters (matching existing CLI patterns)
sc search "bug fix" --type task --status in_progress

# Search in specific area
sc search "API design" --area core

# Reindex project
sc search reindex
```

### CLI Implementation
Following the existing CLI command registration pattern from `entity-commands.ts`:

```typescript
// Add to src/cli/entity-commands.ts
/**
 * Set up search commands following existing pattern
 * @param program Root commander program
 */
export function setupSearchCommands(program: Command): void {
  const searchCommand = new Command('search')
    .description('Search tasks and documentation')
    .addHelpText('before', '\nSEARCH COMMANDS\n===============\n')
    .addHelpText(
      'after',
      `
Examples:
  sc search "authentication logic"                    # Basic text search
  sc search "bug fix" --type task --status todo      # Search with filters
  sc search "API design" --area core --limit 10      # Search in specific area
  sc search reindex                                   # Rebuild search index

See 'sc search <command> --help' for more information on specific commands.`
    );

  // Search query command
  searchCommand
    .command('query')
    .alias('q')
    .argument('[query]', 'Search query text')
    .option('--type <types...>', 'Filter by content type (task, doc)')
    .option('--status <statuses...>', 'Filter by task status')
    .option('--area <area>', 'Filter by task area')
    .option('--tags <tags...>', 'Filter by tags')
    .option('--limit <number>', 'Maximum results to return', '20')
    .option('--format <format>', 'Output format (table, json, detail)', 'table')
    .description('Search tasks and documentation')
    .action(async (query, options) => {
      await handleSearchCommand(query, options);
    });

  // Search reindex command
  searchCommand
    .command('reindex')
    .description('Rebuild search index')
    .action(async () => {
      await handleSearchReindexCommand();
    });

  // Make 'query' the default subcommand
  searchCommand
    .argument('[query]', 'Search query text')
    .option('--type <types...>', 'Filter by content type (task, doc)')
    .option('--status <statuses...>', 'Filter by task status')
    .option('--area <area>', 'Filter by task area')  
    .option('--tags <tags...>', 'Filter by tags')
    .option('--limit <number>', 'Maximum results to return', '20')
    .option('--format <format>', 'Output format (table, json, detail)', 'table')
    .action(async (query, options) => {
      await handleSearchCommand(query, options);
    });

  program.addCommand(searchCommand);
}

// Add to src/cli/commands.ts
export async function handleSearchCommand(
  query: string,
  options: {
    type?: string[];
    status?: string[];
    area?: string;
    tags?: string[];
    limit?: string;
    format?: string;
  }
): Promise<void> {
  try {
    // 1. Get project root (following existing pattern)
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;
    
    // 2. Initialize search service
    const searchService = getSearchService(projectRoot);
    await searchService.initialize();
    
    // 3. Build search query (following existing option parsing)
    const searchQuery: SearchQuery = {
      query: query?.trim() || undefined,
      types: options.type as ('task' | 'doc')[],
      filters: {
        status: options.status,
        area: options.area ? [options.area] : undefined,
        tags: options.tags,
      },
      limit: parseInt(options.limit || '20', 10),
    };
    
    // 4. Execute search
    const results = await searchService.search(searchQuery);
    
    if (results.totalCount === 0) {
      console.log('No results found.');
      return;
    }
    
    // 5. Format and display (following existing formatter pattern)
    const format = (options.format || 'table') as OutputFormat;
    console.log(formatSearchResults(results, format));
    
    // 6. Show summary (following existing pattern)
    console.log(`\nFound ${results.totalCount} results in ${results.queryTime}ms`);
    
  } catch (error) {
    // 7. Error handling (following existing pattern)
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

export async function handleSearchReindexCommand(): Promise<void> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const projectRoot = configManager.getRootConfig().path;
    
    const searchService = getSearchService(projectRoot);
    console.log('Rebuilding search index...');
    
    await searchService.indexProject();
    
    console.log('✓ Search index rebuilt successfully');
    
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
```

### Terminal Output Formatting

```typescript
// Add to src/cli/formatters.ts
export function formatSearchResults(
  results: SearchResults,
  format: OutputFormat
): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }
  
  if (format === 'table') {
    // Following existing table formatter pattern from formatTasksList
    const headers = ['Type', 'Title', 'Area', 'Status', 'Score'];
    const rows = results.results.map(result => {
      const doc = result.document;
      return [
        doc.type.toUpperCase(),
        truncateText(doc.title, 50),
        doc.area || '-',
        doc.status || '-',
        result.score.toFixed(2)
      ];
    });
    
    return formatTable(headers, rows);
  }
  
  // Detail format (default)
  return results.results.map(result => {
    const doc = result.document;
    let output = `\n${doc.type.toUpperCase()}: ${doc.title}`;
    output += `\n  ID: ${doc.id}`;
    output += `\n  Path: ${doc.path}`;
    if (doc.status) output += `\n  Status: ${doc.status}`;
    if (doc.area) output += `\n  Area: ${doc.area}`;
    if (doc.tags?.length) output += `\n  Tags: ${doc.tags.join(', ')}`;
    output += `\n  Score: ${result.score.toFixed(2)}`;
    if (result.excerpt) {
      const cleanExcerpt = result.excerpt.replace(/<[^>]*>/g, ''); // Remove HTML
      output += `\n  Excerpt: ${truncateText(cleanExcerpt, 100)}`;
    }
    return output;
  }).join('\n');
}
```

## 6. MCP Integration

### MCP Handler Implementation
Following the exact patterns from `/src/mcp/handlers/read-handlers.ts` and `/src/mcp/handlers/write-handlers.ts`:

```typescript
// Add to src/mcp/types.ts
export enum McpMethod {
  // ... existing methods
  SEARCH = 'search',
  SEARCH_REINDEX = 'search_reindex',
}

// Add to src/mcp/schemas.ts - Following existing Zod schema patterns
export const SearchQuerySchema = z.object({
  rootDir: z.string().optional(),
  query: z.string().optional(),
  types: z.array(z.enum(['task', 'doc'])).optional(),
  filters: z.object({
    status: z.array(z.string()).optional(),
    area: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  limit: z.number().min(1).max(100).default(50).optional(),
});

export const SearchReindexSchema = z.object({
  rootDir: z.string().optional(),
});

export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
export type SearchReindexInput = z.infer<typeof SearchReindexSchema>;

// Add to src/mcp/handlers/read-handlers.ts
/**
 * Handle search operation following existing handler patterns
 * Complexity: ~12 (following handler complexity guidelines)
 */
export async function handleSearch(params: SearchQueryInput): Promise<McpResponse<SearchResults>> {
  try {
    // 1. Get project root (following existing pattern)
    const projectRoot = getProjectRoot(params);
    
    // 2. Initialize search service (lazy initialization)
    const searchService = getSearchService(projectRoot);
    await searchService.initialize();
    
    // 3. Execute search
    const results = await searchService.search({
      query: params.query,
      types: params.types,
      filters: params.filters,
      limit: params.limit,
    });
    
    // 4. Return success response (following response-utils pattern)
    return createSuccessResponse(
      {
        results: results.results,
        totalCount: results.totalCount,
        queryTime: results.queryTime,
      },
      `Found ${results.totalCount} results`
    );
    
  } catch (error) {
    // 5. Error handling (following existing pattern)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Search operation failed',
      'Search service temporarily unavailable'
    );
  }
}

export async function handleSearchReindex(params: SearchReindexInput): Promise<McpResponse<{ success: boolean }>> {
  try {
    const projectRoot = getProjectRoot(params);
    const searchService = getSearchService(projectRoot);
    
    await searchService.indexProject();
    
    return createSuccessResponse(
      { success: true },
      'Search index rebuilt successfully'
    );
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Reindex operation failed',
      'Failed to rebuild search index'
    );
  }
}

// Add to src/mcp/handlers/index.ts methodRegistry
export const methodRegistry: McpMethodRegistry = {
  // ... existing handlers
  [McpMethod.SEARCH]: createMcpHandler(handleSearch),
  [McpMethod.SEARCH_REINDEX]: createMcpHandler(handleSearchReindex),
};
```

## 7. Setup and Configuration

### Path Integration
Following the existing centralized storage pattern from `/src/core/paths/`:

```typescript
// Add to src/core/paths/types.ts
export const PATH_TYPES = {
  // ... existing types
  SEARCH: 'search',
} as const;

// Add to src/core/paths/strategies.ts
/**
 * Search storage strategy - uses centralized storage
 */
export const searchStrategy: PathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'search');
};

// Add to src/core/paths/index.ts  
export const PATH_STRATEGIES: Record<PathType, PathStrategy> = {
  // ... existing strategies
  [PATH_TYPES.SEARCH]: searchStrategy,
};
```

### Configuration
```typescript
export interface SearchConfig {
  enabled: boolean;                 // Feature flag
  indexFile: string;               // Default: 'project-index.orama'
  maxResults: number;              // Default: 100
  cacheEnabled: boolean;           // Default: true
  cacheTtl: number;               // Default: 5 minutes
}

// Simple defaults - no complex configuration
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  enabled: true,
  indexFile: 'project-index.orama',
  maxResults: 100,
  cacheEnabled: true,
  cacheTtl: 300000
};
```

### SearchService Implementation
Following ConfigurationManager singleton pattern from `/src/core/config/configuration-manager.ts`:

```typescript
// src/core/search/search-service.ts
/**
 * Search Service following Scopecraft singleton pattern
 * Based on ConfigurationManager implementation pattern
 */
export class SearchService {
  private static instances: Map<string, SearchService> = new Map();
  private isInitialized = false;
  private adapter: SearchAdapter | null = null;
  private projectRoot: string;
  
  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }
  
  /**
   * Get singleton instance for project root (following ConfigurationManager pattern)
   */
  public static getInstance(projectRoot: string): SearchService {
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
      
      // 2. Load or create index
      const indexPath = this.getIndexPath();
      if (fs.existsSync(indexPath)) {
        await this.loadIndex();
      } else {
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
    if (!this.isInitialized || !this.adapter) {
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
      const results = await this.adapter!.search(query);
      const queryTime = performance.now() - startTime;
      
      return {
        success: true,
        data: {
          results,
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
      if (!this.adapter) {
        this.adapter = new OramaAdapter();
      }
      
      // Use existing core functions for loading tasks
      const listResult = await core.list(this.projectRoot, {});
      if (!listResult.success || !listResult.data) {
        return {
          success: false,
          error: 'Failed to load tasks for indexing',
        };
      }
      
      // Process and index tasks
      for (const task of listResult.data) {
        const document = this.processTaskToDocument(task);
        if (document) {
          await this.adapter.addDocument(document);
        }
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
   * Get index path using existing path resolution
   */
  private getIndexPath(): string {
    // Use existing path resolution patterns
    const context = createPathContext(this.projectRoot);
    const searchDir = resolvePath(PATH_TYPES.SEARCH, context);
    return path.join(searchDir, 'project-index.orama');
  }
  
  /**
   * Process task to search document (following existing patterns)
   */
  private processTaskToDocument(task: core.Task): SearchDocument | null {
    try {
      return {
        id: task.metadata.id,
        title: task.document.title,
        content: this.extractSearchableContent(task.document),
        type: 'task' as const,
        path: task.metadata.path,
        status: task.document.frontmatter.status,
        area: task.document.frontmatter.area,
        tags: task.document.frontmatter.tags || [],
        workflowState: task.metadata.location?.workflowState,
        createdAt: task.metadata.createdAt || new Date().toISOString(),
        updatedAt: task.metadata.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.warn(`Failed to process task ${task.metadata.id}:`, error);
      return null;
    }
  }
}

// Global service access following existing patterns
export function getSearchService(projectRoot?: string): SearchService {
  const configManager = ConfigurationManager.getInstance();
  const root = projectRoot || configManager.getRootConfig().path;
  
  return SearchService.getInstance(root);
}
```

## 8. Error Handling

### Following Scopecraft Error Patterns
Using the same error handling patterns as `ConfigurationError` and other core services:

```typescript
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

export class SearchService {
  async search(query: SearchQuery): Promise<OperationResult<SearchResults>> {
    try {
      // Ensure service is initialized
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }
      
      // Execute search
      const startTime = Date.now();
      const results = await this.adapter.search(this.index, query);
      const queryTime = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          results,
          totalCount: results.length,
          queryTime
        }
      };
      
    } catch (error) {
      // Log error for debugging but don't crash
      console.warn('Search operation failed:', error);
      
      // Return graceful failure following OperationResult pattern
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search operation failed'
      };
    }
  }
  
  async initialize(): Promise<OperationResult<void>> {
    try {
      // Check if index exists
      const searchPath = resolvePath(PATH_TYPES.SEARCH, 
        createPathContext(this.projectRoot));
      const indexPath = join(searchPath, 'project-index.orama');
      
      if (!existsSync(indexPath)) {
        // Need to build initial index
        const indexResult = await this.indexProject();
        if (!indexResult.success) {
          return indexResult;
        }
      } else {
        // Load existing index
        await this.loadIndex(indexPath);
      }
      
      this.isInitialized = true;
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize search service: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      };
    }
  }
}
```

### Recovery Strategy
- **Index corruption**: Rebuild automatically on startup
- **Query errors**: Return empty results, log issue
- **Performance issues**: Simple timeout, fallback to empty results
- **Storage errors**: Graceful degradation, search disabled

## 9. Performance Requirements

### MVP Targets
- **Query time**: <100ms for 95% of queries
- **Memory usage**: <10MB additional overhead
- **Index size**: <2x content size
- **Startup time**: <1 second including index load

### Simple Monitoring
```typescript
export class SearchService {
  private queryTimes: number[] = [];
  
  async search(query: SearchQuery): Promise<SearchResults> {
    const startTime = Date.now();
    const results = await this.performSearch(query);
    
    const queryTime = Date.now() - startTime;
    this.queryTimes.push(queryTime);
    
    // Simple performance tracking
    if (queryTime > 100) {
      console.warn(`Slow search query: ${queryTime}ms`);
    }
    
    return { ...results, queryTime };
  }
}
```

## 10. Testing Strategy

### Test Structure
Following the existing test patterns in the codebase:

```typescript
describe('SearchService', () => {
  let searchService: SearchService;
  let testProjectRoot: string;
  
  beforeEach(async () => {
    // Set up test project similar to existing core tests
    testProjectRoot = await setupTestProject();
    searchService = SearchService.getInstance(testProjectRoot);
  });
  
  afterEach(async () => {
    // Clean up test data
    await cleanupTestProject(testProjectRoot);
  });
  
  describe('basic functionality', () => {
    it('should return results for valid queries', async () => {
      // Create test task with known content
      await createTestTask(testProjectRoot, {
        title: 'Authentication Service',
        content: 'Implement user authentication with JWT tokens'
      });
      
      const result = await searchService.search({ query: 'authentication' });
      
      expect(result.success).toBe(true);
      expect(result.data!.results).toHaveLength(1);
      expect(result.data!.results[0].document.title).toContain('Authentication');
    });
    
    it('should handle empty queries gracefully', async () => {
      const result = await searchService.search({ query: '' });
      
      expect(result.success).toBe(true);
      expect(result.data!.results).toEqual([]);
    });
    
    it('should apply filters correctly', async () => {
      // Create tasks with different statuses
      await createTestTask(testProjectRoot, { 
        title: 'Bug fix', 
        status: 'To Do' 
      });
      await createTestTask(testProjectRoot, { 
        title: 'Feature work', 
        status: 'Done' 
      });
      
      const result = await searchService.search({
        query: '*',
        filters: { status: ['To Do'] }
      });
      
      expect(result.success).toBe(true);
      expect(result.data!.results).toHaveLength(1);
      expect(result.data!.results[0].document.title).toBe('Bug fix');
    });
  });
  
  describe('indexing', () => {
    it('should index task files correctly', async () => {
      const indexResult = await searchService.indexProject();
      expect(indexResult.success).toBe(true);
      
      // Verify index was created
      const searchPath = resolvePath(PATH_TYPES.SEARCH, 
        createPathContext(testProjectRoot));
      expect(existsSync(join(searchPath, 'project-index.orama'))).toBe(true);
    });
    
    it('should handle incremental updates', async () => {
      // Index initial state
      await searchService.indexProject();
      
      // Add new task
      const newTask = await createTestTask(testProjectRoot, {
        title: 'New Task',
        content: 'Recently added content'
      });
      
      // Update index
      const updateResult = await searchService.updateIndex([{
        type: 'add',
        id: newTask.metadata.id,
        path: newTask.metadata.path
      }]);
      
      expect(updateResult.success).toBe(true);
      
      // Search should find new task
      const searchResult = await searchService.search({ query: 'recently' });
      expect(searchResult.data!.results).toHaveLength(1);
    });
  });
  
  describe('performance', () => {
    it('should complete queries under 100ms', async () => {
      // Create moderate amount of test data
      for (let i = 0; i < 100; i++) {
        await createTestTask(testProjectRoot, {
          title: `Task ${i}`,
          content: `Content for task number ${i} with searchable text`
        });
      }
      
      await searchService.indexProject();
      
      const startTime = Date.now();
      const result = await searchService.search({ query: 'searchable' });
      const queryTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(queryTime).toBeLessThan(100);
    });
  });
  
  describe('error handling', () => {
    it('should recover from index corruption', async () => {
      // Corrupt the index file
      const searchPath = resolvePath(PATH_TYPES.SEARCH, 
        createPathContext(testProjectRoot));
      const indexPath = join(searchPath, 'project-index.orama');
      
      // Create corrupted index
      writeFileSync(indexPath, 'corrupted data');
      
      // Should rebuild automatically
      const result = await searchService.search({ query: 'test' });
      expect(result.success).toBe(true);
    });
  });
});
```

### Integration Tests
- **Real content**: Test with actual task/doc files
- **CLI integration**: Test command execution
- **MCP integration**: Test MCP operations
- **Performance**: Basic benchmarks with realistic data

## 11. Implementation Plan

### Phase 1: Core Search (Week 1)
1. Create search service structure
2. Implement Orama adapter
3. Basic content indexing
4. Simple query interface
5. Unit tests

### Phase 2: Integration (Week 2)  
1. CLI command implementation
2. MCP operation integration
3. Path resolution integration
4. Integration tests
5. Basic error handling

### Phase 3: Polish (Week 3)
1. Performance optimization
2. Better content processing
3. Improved error messages
4. Documentation
5. Final testing

## 12. Future Growth Points

### What We're Building For
- **Cross-project search**: Search across all your local projects at once
- **Better ranking**: When we understand usage patterns
- **More content types**: Sessions, knowledge entries
- **UI integration**: When we build the web interface
- **Advanced filters**: As users request them

### What We're Not Building Yet
- Vector/semantic search
- Advanced analytics
- Service extraction
- Enterprise features

### Growth Strategy
The MVP architecture enables natural growth:
1. **Cross-project search**: Search multiple project indexes and merge results (Unix composability)
2. **More content types**: Add to document schema
3. **Better search**: Improve ranking algorithms
4. **More interfaces**: Add web UI when ready
5. **Better performance**: Optimize when we hit limits
6. **Advanced features**: Add when users need them

## Appendix: Concrete Implementation Patterns Observed

Based on deep analysis of the Scopecraft codebase, here are the specific patterns to follow:

### A. MCP Handler Structure Pattern
**Observed in**: `/src/mcp/handlers/read-handlers.ts`, `/src/mcp/handlers/write-handlers.ts`

1. **Handler Registration**: All handlers go through `createMcpHandler()` wrapper in `methodRegistry`
2. **Input Validation**: Every handler starts with `Schema.parse(rawParams)` using Zod
3. **Project Root Resolution**: Use `getProjectRoot(params)` utility consistently  
4. **Error Response Pattern**: Use `createErrorResponse()` for consistent error formatting
5. **Response Envelope**: Always return `{ success, data, message }` structure
6. **Complexity Limit**: Keep handler functions under 15 lines by extracting utilities

### B. Core Service Pattern
**Observed in**: `/src/core/task-crud.ts`, `/src/core/config/configuration-manager.ts`

1. **Singleton Pattern**: Services use `getInstance()` with project-specific instances
2. **OperationResult**: All operations return `{ success: boolean, data?: T, error?: string }`
3. **Constructor Privacy**: Private constructors with static factory methods
4. **Initialization**: Lazy initialization with `isInitialized` flags
5. **Core Integration**: Services call existing `core.*` functions rather than duplicating logic

### C. CLI Command Pattern  
**Observed in**: `/src/cli/entity-commands.ts`, `/src/cli/commands.ts`

1. **Entity Groups**: Commands organized by entity (`task`, `parent`, `search`)
2. **Commander.js**: Uses `Command` class with `.option()` and `.action()` chaining
3. **Error Handling**: Use `printError()`, `printSuccess()`, `printWarning()` for consistent output
4. **ConfigManager**: Always get project root via `ConfigurationManager.getInstance()`
5. **Process Exit**: Use `process.exit(1)` on errors, not exceptions

### D. Path Resolution Pattern
**Observed in**: `/src/core/paths/`, `/src/mcp/handlers/shared/config-utils.ts`

1. **Centralized Storage**: All data goes in `~/.scopecraft/projects/{encoded}/`
2. **Path Types**: Define in `PATH_TYPES` enum, implement strategy function
3. **Context Creation**: Use `createPathContext(projectRoot)` then `resolvePath(type, context)`
4. **Migration Support**: Path system handles migration between storage strategies

### E. Validation Pattern
**Observed in**: `/src/mcp/handlers/shared/validation-utils.ts`

1. **Return Objects**: Validation functions return `{ isValid: boolean, error?: string }`
2. **Enum Validation**: Check against existing enums like `WorkflowState`, `TaskStatus`
3. **File Existence**: Use `existsSync()` checks with meaningful error messages
4. **Graceful Degradation**: Log warnings, continue processing when possible

### F. Error Handling Pattern
**Observed in**: `/src/core/config/types.ts`, throughout handlers

1. **Custom Error Classes**: Extend `Error` with context properties (`source`, `operation`)
2. **Error Context**: Include operation name and relevant context data
3. **Graceful Recovery**: Services should degrade gracefully, not crash
4. **Logging Strategy**: Use `console.warn()` for recoverable errors, `console.error()` for failures

### G. Testing Pattern
**Observed in**: Existing test structure expectations

1. **Test Isolation**: Each test sets up and tears down its own project
2. **Real Data**: Tests use actual task creation/manipulation, not mocks
3. **Error Cases**: Explicitly test error conditions and recovery
4. **Performance Tests**: Include timing assertions for critical operations

## Conclusion

This search implementation provides solid foundations without over-engineering:

- **Works well**: Fast search across your content
- **Clean architecture**: Easy to understand and modify  
- **Follows Scopecraft patterns**: Consistent with existing codebase architecture
- **Room to grow**: Can evolve as needs change
- **No technical debt**: Good patterns from the start
- **No architecture astronaut debt**: Simple enough to actually build

The goal is working search that makes Scopecraft more useful, built with good engineering practices that won't bite us later.

---

**Next Steps**:
1. Review this right-sized approach with concrete implementation patterns
2. Start with Phase 1 implementation following the observed patterns
3. Test with real usage using existing test patterns
4. Iterate based on actual needs