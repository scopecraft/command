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

### Search Service
```typescript
export class SearchService {
  constructor(projectRoot: string);
  
  // Core operations
  async search(query: SearchQuery): Promise<SearchResults>;
  async indexProject(): Promise<void>;
  async updateIndex(changes: ContentChange[]): Promise<void>;
  
  // Lifecycle
  async initialize(): Promise<void>;
  async shutdown(): Promise<void>;
}

export interface SearchQuery {
  query?: string;                    // Text query
  types?: ('task' | 'doc')[];       // Filter by content type
  filters?: {                       // Basic filters
    status?: string[];
    area?: string[];
    tags?: string[];
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
```typescript
export interface SearchDocument {
  id: string;
  title: string;
  content: string;                  // Processed for search
  type: 'task' | 'doc';
  path: string;
  
  // Task-specific fields
  status?: string;
  area?: string;
  tags?: string[];
  workflowState?: 'current' | 'backlog' | 'archive';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

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
```typescript
export class SearchIndexer {
  async indexProject(): Promise<void> {
    // Scan all tasks and docs
    // Process content for search
    // Build Orama index
    // Save to disk
  }
  
  async updateIndex(changes: ContentChange[]): Promise<void> {
    // Handle incremental updates
    // Add/update/remove documents as needed
  }
  
  private processTaskContent(task: TaskDocument): string {
    // Extract searchable text from task sections
    // Remove markdown formatting
    // Return clean text for indexing
  }
  
  private processDocContent(docPath: string): string {
    // Extract text from markdown files
    // Handle frontmatter
    // Return searchable content
  }
}
```

### Content Processing
- **Tasks**: Extract from title, instruction, tasks, deliverable sections
- **Docs**: Extract from markdown content, respect frontmatter
- **Cleanup**: Remove markdown formatting, normalize whitespace
- **Incremental**: Only reindex changed files

## 5. CLI Integration

### New Commands
```bash
# Search across all content
sc search "authentication logic"

# Search with filters
sc search "bug fix" --type task --status in_progress

# Search in specific area
sc search "API design" --area core

# Reindex project
sc search reindex
```

### CLI Implementation
```typescript
// Add to CLI command structure
export const searchCommands = {
  search: {
    description: 'Search tasks and documentation',
    options: {
      type: { choices: ['task', 'doc'] },
      status: { type: 'array' },
      area: { type: 'string' },
      limit: { type: 'number', default: 20 }
    },
    handler: async (args) => {
      const service = new SearchService(getProjectRoot());
      const results = await service.search(args);
      displaySearchResults(results);
    }
  },
  reindex: {
    description: 'Rebuild search index',
    handler: async () => {
      const service = new SearchService(getProjectRoot());
      await service.indexProject();
      console.log('Search index rebuilt');
    }
  }
};
```

## 6. MCP Integration

### MCP Operations
```typescript
// Add to MCP server
export const searchOperations = {
  search: {
    name: 'search',
    description: 'Search tasks and documentation',
    inputSchema: SearchQuerySchema,
    handler: async (params: SearchQuery) => {
      const service = getSearchService();
      return await service.search(params);
    }
  },
  
  reindex: {
    name: 'search_reindex', 
    description: 'Rebuild search index',
    handler: async () => {
      const service = getSearchService();
      await service.indexProject();
      return { success: true };
    }
  }
};
```

## 7. Setup and Configuration

### Path Integration
```typescript
// Add to path resolution
export const PATH_TYPES = {
  // ... existing types
  SEARCH: 'search',
} as const;

// Storage strategy
export const searchPathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'search');
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

## 8. Error Handling

### Simple but Solid
```typescript
export class SearchError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export class SearchService {
  async search(query: SearchQuery): Promise<SearchResults> {
    try {
      // Normal search flow
    } catch (error) {
      // Log error but don't crash
      console.warn('Search error:', error);
      
      // Return empty results gracefully
      return {
        results: [],
        totalCount: 0,
        queryTime: 0
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
```typescript
describe('SearchService', () => {
  describe('basic functionality', () => {
    it('should return results for valid queries');
    it('should handle empty queries gracefully');
    it('should apply filters correctly');
  });
  
  describe('indexing', () => {
    it('should index task files correctly');
    it('should index doc files correctly');
    it('should handle incremental updates');
  });
  
  describe('performance', () => {
    it('should complete queries under 100ms');
    it('should handle 1000+ documents without issues');
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

## Conclusion

This search implementation provides solid foundations without over-engineering:

- **Works well**: Fast search across your content
- **Clean architecture**: Easy to understand and modify
- **Room to grow**: Can evolve as needs change
- **No technical debt**: Good patterns from the start
- **No architecture astronaut debt**: Simple enough to actually build

The goal is working search that makes Scopecraft more useful, built with good engineering practices that won't bite us later.

---

**Next Steps**:
1. Review this right-sized approach
2. Start with Phase 1 implementation
3. Test with real usage
4. Iterate based on actual needs