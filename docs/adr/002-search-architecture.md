# ADR-002: Search Architecture Selection - Orama

**Status:** Approved  
**Date:** 2025-06-13  
**Authors:** Architecture Synthesis Team  
**Reviewers:** Pending User Review  

## Context

Scopecraft requires a lightweight yet powerful search solution to enable users to find tasks, documents, and (future) session data efficiently. This ADR documents the decision to adopt Orama as our primary search library based on comprehensive research from three parallel analysis tasks.

### Research Foundation

This decision synthesizes findings from three Phase 1 research tasks:

**Research Sources:**
- **Solution Discovery** (01_disc-and-cat-sea-slt-acr-dff-06S) - Cataloged 25+ search solutions
- **Requirements Analysis** (01_anal-sea-rqr-and-sys-cnstrnts-06K) - Defined evaluation framework  
- **Solution Evaluation** (01_eval-sear-sltns-agan-rqrmnts-06Y) - Tested top candidates

## Decision

We will adopt **Orama** as our primary search solution, with **MiniSearch** documented as a fallback option for extreme memory-constrained environments.

### Key Decision Factors

1. **Performance Requirements Met**
   - Query latency: 0.28ms average (requirement: <100ms) ✅
   - Memory footprint: 0.39MB (requirement: <50MB) ✅
   - Index time: 11.75ms for test dataset ✅

2. **Feature Completeness**
   - Full-text search with fuzzy matching ✅
   - Faceted search with `where` clauses ✅
   - Vector search capability (future-proofing) ✅
   - TypeScript-first with zero dependencies ✅

3. **Extensibility**
   - Plugin architecture for custom functionality
   - Support for mixed content types (tasks, docs, sessions)
   - Clean API for future enhancements
   - Vector embeddings for semantic search evolution

## Architecture Decisions Matrix

| Decision Point | Options Considered | Selected | Rationale |
|---|---|---|---|
| **Search Library** | Orama, MiniSearch, FlexSearch, Fuse.js | Orama | Best feature set, future-proof |
| **Architecture Pattern** | Embedded vs Server vs Service | Service in core/ | Clean boundaries, testable |
| **Index Storage** | Memory-only vs Persistent | Persistent in project path | Fast startup, survives restarts |
| **Index Strategy** | Single vs Multi-index | Single unified index | Simpler, supports cross-type search |
| **Update Model** | Batch vs Incremental | Incremental | Real-time updates, better UX |
| **Integration Approach** | Direct vs Adapter pattern | Adapter pattern | Library independence |

## Implementation Architecture

### Directory Structure

**Code Structure:**
```
core/search/
├── search-service.ts         # Main search interface
├── adapters/
│   ├── orama-adapter.ts     # Orama implementation
│   └── search-adapter.ts    # Base adapter interface
├── index-manager.ts         # Persistence & incremental updates
├── ranking/
│   └── version-aware.ts     # Custom ranking algorithms
└── types.ts                 # Search schemas and types

mcp/handlers/
├── search-handlers.ts       # MCP search endpoints

tasks-ui/components/search/
├── SearchBar.tsx           # Main search interface
├── SearchFilters.tsx       # Faceted search filters
└── SearchResults.tsx       # Results display
```

**Data Storage (following ADR-001 pattern):**
```
~/.scopecraft/
└── projects/
    └── users-davidpaquet-projects-scopecraft-v2/
        ├── tasks/           # Task storage
        ├── sessions/        # Session storage
        └── search/          # Search indexes
            ├── index.json   # Orama search index
            └── metadata.json # Index version, last update
```

### Core Search Service Interface
```typescript
export interface SearchService {
  // Core operations
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  index(item: SearchableItem): Promise<void>;
  update(id: string, item: Partial<SearchableItem>): Promise<void>;
  remove(id: string): Promise<void>;
  
  // Bulk operations
  reindex(): Promise<void>;
  clear(): Promise<void>;
  
  // Persistence
  save(): Promise<void>;
  load(): Promise<void>;
}

export interface SearchOptions {
  type?: ContentType[];        // Filter by content type
  facets?: Record<string, any>; // Faceted search filters
  limit?: number;              // Result limit
  offset?: number;             // Pagination offset
}
```

### Orama Configuration
```typescript
const searchSchema = {
  id: 'string',
  type: 'enum',              // task, document, session
  title: 'string',
  content: 'string',
  metadata: {
    status: 'string',
    priority: 'string',
    area: 'string',
    tags: 'string[]',
    assignee: 'string',
    modified: 'number'      // For version-aware ranking
  }
};

const oramaConfig = {
  schema: searchSchema,
  components: {
    tokenizer: {
      stemming: true,
      stopWords: customStopWords
    }
  }
};
```

### Search Storage Integration

Following the established path resolution pattern, search will be added to the centralized storage system:

**1. Add to PATH_TYPES (types.ts):**
```typescript
export const PATH_TYPES = {
  TEMPLATES: 'templates',
  MODES: 'modes',
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  CONFIG: 'config',
  SEARCH: 'search',  // New path type
} as const;
```

**2. Add strategy (strategies.ts):**
```typescript
/**
 * Centralized search strategy
 * Search indexes stored under ~/.scopecraft/projects/{encoded}/search/
 */
export const centralizedSearchStrategy: PathStrategy = (context: PathContext): string => {
  return join(centralizedStrategy(context), 'search');
};

// Add to pathStrategies mapping
[PATH_TYPES.SEARCH]: [
  centralizedSearchStrategy, // Only: ~/.scopecraft/projects/{encoded}/search/
],
```

**3. Add convenience function (path-resolver.ts):**
```typescript
export function getSearchPath(context: PathContext): string {
  return resolvePath(PATH_TYPES.SEARCH, context);
}
```

**4. Use in SearchService:**
```typescript
export class SearchService {
  constructor(private pathContext: PathContext) {}
  
  private getSearchStoragePath(): string {
    return getSearchPath(this.pathContext);
  }
  
  private getIndexPath(): string {
    return join(this.getSearchStoragePath(), 'index.json');
  }
}
```

## Implementation Plan

### Phase 2: Core Search Service (4-5 hours)

**Task:** `design-core-search-service-{id}`
- Define SearchService interface and types
- Implement OramaAdapter with full functionality
- Create IndexManager for persistence
- Add version-aware ranking algorithm

**Task:** `implement-search-indexing-{id}`
- Index existing tasks on startup
- Implement incremental updates
- Add document indexing
- Create reindexing command

### Phase 3: Integration Layer (3-4 hours)

**Task:** `implement-mcp-search-{id}`
- Add search endpoints to MCP
- Integrate with existing task/document handlers
- Implement search result schemas
- Add search method documentation

**Task:** `implement-cli-search-{id}`
- Add `sc search` command
- Implement result formatting
- Add search filters support
- Create search help documentation

### Phase 4: UI Components (4-5 hours)

**Task:** `implement-search-ui-{id}`
- Create SearchBar component
- Implement real-time search
- Add SearchFilters for faceted search
- Create SearchResults display

**Task:** `implement-search-ux-{id}`
- Add keyboard shortcuts
- Implement search history
- Add result highlighting
- Create empty state handling

## Risk Mitigation

### Identified Risks

1. **Performance Degradation at Scale**
   - Mitigation: Implement pagination, lazy loading
   - Fallback: Switch to MiniSearch if needed

2. **Index Corruption**
   - Mitigation: Atomic writes, backup before updates
   - Recovery: Rebuild index from source data

3. **Memory Growth**
   - Mitigation: Monitor index size, implement pruning
   - Fallback: Move to disk-based solution if needed

4. **Search Quality Issues**
   - Mitigation: Tunable ranking, user feedback
   - Solution: Iterative improvements based on usage

## Migration Strategy

### From No Search to Orama

1. **Phase 1**: Install dependencies, create service structure
2. **Phase 2**: Implement core service with basic indexing
3. **Phase 3**: Add MCP/CLI integration
4. **Phase 4**: Deploy UI components
5. **Phase 5**: Monitor and optimize

### Future Migration Path

If Orama needs replacement:
1. Implement new adapter following interface
2. Run parallel indexing for comparison
3. A/B test search quality
4. Gradual rollout with feature flag
5. Remove old adapter

## Comparison with Alternatives

### Why Orama over MiniSearch?

**Orama Advantages:**
- Vector search capability (future semantic search)
- Native faceted search with `where` clauses
- Plugin architecture for extensibility
- More modern architecture (2023-2024)

**MiniSearch Advantages:**
- 10x smaller memory footprint (0.03MB vs 0.39MB)
- Simpler API, easier to understand
- Battle-tested in production
- Better for memory-constrained environments

**Decision:** Orama's extensibility outweighs memory difference

### Why Orama over FlexSearch?

**FlexSearch Issues:**
- No faceted search support (critical requirement)
- Complex API increases maintenance burden
- Less active community
- Performance gains not worth feature loss

### Why Not Graph Databases?

**Considered:** SurrealDB, KuzuDB, LevelGraph

**Decision:** Deferred for future enhancement
- Adds complexity for MVP
- Search is primary need, not relationships
- Can layer graph capabilities later
- Orama handles current requirements

## Success Metrics

- **Query Performance**: 95% of queries <100ms
- **Search Quality**: 90%+ relevant results in top-5
- **Memory Usage**: Total footprint <50MB
- **User Satisfaction**: Positive feedback on search accuracy
- **Development Velocity**: Search features completed in 2 weeks

## Future Enhancements

### Near-term (3-6 months)
- Session search integration
- Search analytics and popular queries
- Saved searches and alerts
- Advanced query syntax

### Long-term (6-12 months)
- Vector embeddings for semantic search
- Graph layer for relationship queries
- Multi-language support
- External knowledge base integration

## Dependencies

- **Storage Migration**: ADR-001 provides ~/.scopecraft/ location ✅
- **Environment Config**: Functional architecture available ✅
- **TypeScript**: Project already uses TypeScript ✅

## Related Documents

- [Search Solution Discovery](../../.tasks/backlog/implmnt-cor-sea-sol-for-tas-06A/01_disc-and-cat-sea-slt-acr-dff-06S.task.md)
- [Requirements Analysis](../../.tasks/backlog/implmnt-cor-sea-sol-for-tas-06A/01_anal-sea-rqr-and-sys-cnstrnts-06K.task.md)
- [Solution Evaluation](../../.tasks/backlog/implmnt-cor-sea-sol-for-tas-06A/01_eval-sear-sltns-agan-rqrmnts-06Y.task.md)

## Approval

This ADR is approved based on:
- ✅ Comprehensive evaluation of 25+ solutions
- ✅ Performance testing with real Scopecraft data
- ✅ Clear requirements and scoring framework
- ✅ Future extensibility considerations
- ✅ Clean architecture with adapter pattern
- ✅ Risk mitigation strategies identified

**Status**: Ready for Phase 2 design and implementation

---

*This ADR documents the decision to adopt Orama as Scopecraft's search solution, providing a foundation for efficient task and document discovery with room for future enhancements.*