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

## Technical Architecture

### Storage Location

Search indexes will be stored in the centralized storage location following ADR-001:
```
~/.scopecraft/
└── projects/
    └── {encoded-project-path}/
        └── search/          # Search indexes
```

### Integration Approach

- **Adapter Pattern**: Search implementation will be abstracted behind an interface to allow future library changes
- **Service Layer**: Search functionality will be implemented as a service in the core layer
- **Path Resolution**: Will use the existing path resolution system by adding SEARCH to PATH_TYPES



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

## Future Migration Considerations

The adapter pattern ensures that if Orama needs replacement in the future, we can implement a new adapter following the same interface without disrupting the rest of the system. The centralized storage location also makes it easy to rebuild indexes with a different library if needed.

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
- **Index Size**: <2x content size
- **Startup Time**: <2 seconds with index loading


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

**Status**: Approved for implementation

---

*This ADR documents the decision to adopt Orama as Scopecraft's search solution, providing a foundation for efficient task and document discovery with room for future enhancements.*