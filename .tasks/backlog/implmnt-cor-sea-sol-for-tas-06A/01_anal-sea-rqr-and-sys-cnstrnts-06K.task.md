# Analyze search requirements and system constraints

---
type: spike
status: done
area: core
tags:
  - research
  - requirements
  - analysis
  - 'team:architect'
  - 'execution:autonomous'
---


## Instruction
Analyze the complete search requirements and system constraints for Scopecraft's search solution.

Core Requirements:
- Task content and metadata search
- Work document search
- Version-aware ranking
- Local-first architecture (index stored in ~/.scopecraft/, not in git)
- Sub-100ms latency, <50MB footprint
- 95%+ relevant results in top 5

Extensibility Requirements:
- Architecture must support adding new content types post-launch
- Future: AI session search (.sessions/ directory)
- Future: Selective content indexing (e.g., user messages vs full transcripts)
- Future: Graph-based relationship tracking

Relationship Tracking (Future):
- Task → Subtask hierarchies
- Document → Document references
- Session → Task associations
- Cross-cutting links and dependencies
- Knowledge graph construction from content

Search UX Requirements:
- Faceted search support (filter by type: task, document, session)
- Relevance-based ranking across content types
- Context-aware results (show why something matched)
- Future: "Find related" functionality using graph

Technical Constraints:
- Must integrate cleanly with MCP and UI layers
- Cannot depend on external services
- Must handle incremental updates efficiently
- Should support both exact and fuzzy matching
- Graph features optional for MVP but architecture should support

## Tasks
- [x] Document all searchable content types (task metadata, content, documents)
- [x] Analyze typical search patterns and use cases
- [x] Define performance requirements (latency, throughput)
- [x] Assess resource constraints (memory, CPU, storage)
- [x] Identify deployment constraints (single process, multi-instance, etc.)
- [x] Determine integration requirements (MCP, UI, CLI)
- [x] Consider future scalability needs
- [x] Define search quality requirements
- [x] Identify any special features needed (fuzzy search, filters, facets)
- [x] Document version-awareness requirements for search results

## Deliverable
# Search Solution Requirements Analysis

### 1. Content Analysis

### Types of Content to Search

**Primary Content Types:**
1. **Task Files** (.task.md)
   - Metadata: id, title, type, status, priority, area, tags, assignee
   - Sections: instruction, tasks, deliverable, log
   - Structure: TOML frontmatter + Markdown content

2. **Parent Task Overviews** (_overview.md)
   - Metadata: parent task summaries and progress tracking
   - Hierarchical relationships to subtasks

3. **Work Documents** 
   - Investigation reports, analysis documents
   - Research findings, design documents
   - Variable structure, rich content

4. **Documentation** (/docs)
   - YAML frontmatter with title, version, status, authors, related
   - Structured guides, references, specifications
   - Cross-references and relationships

**Future Content Types (Extensibility):**
1. **AI Session Data** (.sessions/)
   - JSON metadata: sessionName, taskId, parentId, status, type
   - Log files: conversation transcripts, tool usage
   - Selective indexing: user messages vs full transcripts

### Data Volume Estimates

**Current Volume:**
- Task files: 203 files, 2.0MB total (~10KB average)
- Documentation: 63 files, 724KB total (~11KB average)
- Sessions: 676KB (metadata + logs)
- **Total current content: ~3.4MB**

**Projected Growth (12 months):**
- Tasks: 5x growth → 1,000 files, 10MB
- Documentation: 2x growth → 125 files, 1.5MB
- Sessions: 10x growth → 7MB
- **Projected total: ~18MB content, ~25MB with indexes**

### Structure of Searchable Data

**Metadata Fields (High Priority for Search):**
- title, type, status, priority, area, tags, assignee
- version, status, category, authors (docs)
- taskId, parentId, sessionName, type (sessions)

**Content Fields (Medium Priority):**
- instruction, deliverable sections (tasks)
- full markdown content (docs)
- user messages (sessions)

**Relationships (Future Enhancement):**
- Task → Subtask hierarchies
- Document → Document references  
- Session → Task associations
- Cross-cutting dependencies

### Update Frequency Patterns

- **High Frequency**: Task status/priority updates (multiple times daily)
- **Medium Frequency**: Task content updates, new task creation (daily)
- **Low Frequency**: Documentation updates (weekly/monthly)
- **Batch Frequency**: Session data (per AI interaction)

### 2. User Requirements

### Common Search Patterns

**By Work Context:**
1. "Find tasks assigned to me"
2. "Show all tasks in area X"
3. "What's the status of feature Y?"
4. "Find documentation about Z"

**By Content:**
1. "Tasks mentioning specific keywords"
2. "Search for implementation details"
3. "Find related work or dependencies"
4. "Locate specific error messages or solutions"

**By Time/Status:**
1. "Recent activity in project"
2. "Completed tasks this week"
3. "Blocked or high-priority items"

### Expected Query Types

**Exact Match:**
- Task IDs, specific technical terms
- Status values, area names

**Fuzzy Match:**
- Partial remembering of titles
- Typos in technical terms
- Similar concept searches

**Faceted Search:**
- Filter by: type, status, area, assignee
- Combine: text search + metadata filters
- Multi-type: search across tasks + docs

**Future Graph Queries:**
- "Find related to this task"
- "Show dependency chain"
- "Trace session to originating task"

### Response Time Expectations

- **Primary Goal**: Sub-100ms latency
- **Acceptable**: 100-200ms for complex queries
- **Maximum**: 500ms (perceived as slow)
- **Timeout**: 2 seconds (user abandons search)

### Result Quality Needs

- **Target**: 95%+ relevant results in top 5
- **Minimum**: 80% relevance in top 10
- **Ranking Priorities**: 
  1. Exact metadata match
  2. Title/heading relevance
  3. Content relevance
  4. Recency bias for tied scores

### 3. System Constraints

### Deployment Model Limitations

**Architecture**: Local-first, single-process Node.js application
- Must integrate with existing MCP server (localhost)
- No external service dependencies
- Index stored in ~/.scopecraft/ (not in git)

**Resource Budgets:**
- **Memory**: <50MB total footprint (including indexes)
- **Startup**: <2 seconds index loading time
- **CPU**: Minimal impact on main application performance
- **Disk**: Index size <2x content size (~10MB current, ~50MB projected)

### Integration Touchpoints

**MCP Server Integration:**
- New search endpoints in MCP API
- Search results follow existing response schemas
- Integration with task/parent/document handlers

**UI Layer Integration:**
- Search component in tasks-ui/
- Results display with existing task/doc components
- Faceted search filters in sidebar

**CLI Integration:**
- New search commands in CLI
- Support for programmatic search from scripts
- Output formatting for terminal display

### Development Constraints

**Technology Stack:**
- Must use TypeScript/Node.js
- Zero external service dependencies
- Compatible with existing Zod schemas

**Existing Patterns:**
- Follow current core/ service architecture
- Use existing error handling patterns
- Maintain consistency with current API design

### 4. Feature Requirements

### Must-Have Features (MVP)

**Core Search:**
- [P0] Full-text search across tasks, docs
- [P0] Metadata-based filtering (type, status, area)
- [P0] Exact and fuzzy matching
- [P0] Result ranking by relevance
- [P0] Sub-100ms query response time

**Integration:**
- [P0] MCP API endpoints for search
- [P0] Basic UI search interface
- [P0] CLI search commands
- [P0] Index persistence and loading

### Nice-to-Have Features (Post-MVP)

**Enhanced Search:**
- [P1] Context-aware results (show why matched)
- [P1] Auto-suggestions and query completion
- [P1] Search within results (refinement)
- [P1] Saved searches and search history

**User Experience:**
- [P1] Advanced faceted search UI
- [P1] Search result previews
- [P1] Keyboard shortcuts for quick search
- [P1] Search analytics and usage metrics

### Future Considerations

**Extensibility:**
- [P2] Plugin architecture for new content types
- [P2] Custom ranking algorithms
- [P2] Integration with external knowledge sources

**Graph-Based Features:**
- [P2] "Find related" functionality
- [P2] Relationship traversal queries
- [P2] Knowledge graph visualization
- [P2] Session-to-task association tracking

### Deal-Breakers

**Performance:**
- Index size >50MB
- Query latency >500ms for simple searches
- Startup time >5 seconds

**Architecture:**
- External service dependencies
- Incompatibility with existing MCP patterns
- Breaking changes to current APIs

### 5. Evaluation Criteria

### Weighted Scoring Framework

**Performance (40% weight):**
- Query latency (15%): <100ms = 100, <200ms = 80, <500ms = 50
- Index size (10%): <25MB = 100, <40MB = 80, <50MB = 50
- Startup time (10%): <1s = 100, <2s = 80, <5s = 50
- Memory usage (5%): <25MB = 100, <40MB = 80, <50MB = 50

**Search Quality (30% weight):**
- Relevance (15%): 95%+ top-5 = 100, 90%+ = 80, 80%+ = 50
- Coverage (10%): All content types = 100, partial = 70
- Features (5%): Fuzzy + faceted = 100, one missing = 80

**Integration (20% weight):**
- API compatibility (10%): Perfect fit = 100, minor changes = 80
- UI integration (5%): Seamless = 100, requires refactoring = 60
- CLI integration (5%): Full support = 100, basic = 80

**Maintainability (10% weight):**
- Code quality (5%): TypeScript, documented = 100
- Dependencies (5%): Zero external = 100, minimal = 80

### Pass/Fail Criteria

**Must Pass:**
- Query latency <500ms (95th percentile)
- Total memory footprint <50MB
- Zero external service dependencies
- Compatible with current MCP architecture

**Should Pass:**
- Search quality >80% relevance in top-10
- Index size <2x content size
- Startup time <5 seconds

### Trade-off Priorities

**Priority Order:**
1. **Performance** over features (meet latency/memory constraints first)
2. **Integration** over novelty (work with existing architecture)
3. **Extensibility** over optimization (prepare for future growth)
4. **Simplicity** over completeness (MVP over comprehensive v1)

### Risk Tolerance Levels

**Low Risk (Acceptable):**
- Using established libraries (MiniSearch, FlexSearch)
- Following existing architectural patterns
- Gradual feature rollout

**Medium Risk (Manageable):**
- Custom ranking algorithms
- Advanced UI features
- Performance optimization edge cases

**High Risk (Avoid):**
- Custom search engine implementation
- Breaking changes to existing APIs
- Experimental or unproven technologies

### Recommended Approach

Based on this analysis, recommend:

1. **Library**: MiniSearch for memory optimization or FlexSearch for performance
2. **Architecture**: Service layer in core/ with MCP/UI/CLI integration
3. **Phasing**: MVP with basic search, then extensibility features
4. **Storage**: ~/.scopecraft/search.idx with incremental updates

## Log
- 2025-06-09: Updated to include local-first requirement, faceted search, and future extensibility needs for session search
- 2025-06-09: Added graph/relationship tracking as future requirement for handling links, references, and knowledge relationships
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-sea-rqr-and-sys-cnstrnts-06K
  - Analysis: Type=spike, tags=[research,requirements,analysis,team:architect,execution:autonomous], area=core
  - Selected Mode: exploration (spike + research + analysis = requirements research)
  - Reasoning: Task focuses on understanding/analyzing requirements and constraints, not building
  - Loading: exploration/base.md, guidance/architecture-patterns.md
  - Starting Discovery Phase: Analyzing existing codebase and content types
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-sea-rqr-and-sys-cnstrnts-06K
  - Analysis: Type=spike, tags=[research,requirements,analysis,team:architect,execution:autonomous], area=core
  - Selected Mode: exploration (spike + research + analysis = requirements research)
  - Reasoning: Task focuses on understanding/analyzing requirements and constraints, not building
  - Loading: exploration/base.md, guidance/architecture-patterns.md
  - Starting Discovery Phase: Analyzing existing codebase and content types
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-sea-rqr-and-sys-cnstrnts-06K
  - Analysis: Type=spike, tags=[research,requirements,analysis,team:architect,execution:autonomous], area=core
  - Selected Mode: exploration (spike + research + analysis = requirements research)
  - Reasoning: Task focuses on understanding/analyzing requirements and constraints, not building
  - Loading: exploration/base.md, guidance/architecture-patterns.md
  - Starting Discovery Phase: Analyzing existing codebase and content types
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-sea-rqr-and-sys-cnstrnts-06K
  - Analysis: Type=spike, tags=[research,requirements,analysis,team:architect,execution:autonomous], area=core
  - Selected Mode: exploration (spike + research + analysis = requirements research)
  - Reasoning: Task focuses on understanding/analyzing requirements and constraints, not building
  - Loading: exploration/base.md, guidance/architecture-patterns.md
  - Starting Discovery Phase: Analyzing existing codebase and content types
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-sea-rqr-and-sys-cnstrnts-06K
  - Analysis: Type=spike, tags=[research,requirements,analysis,team:architect,execution:autonomous], area=core
  - Selected Mode: exploration (spike + research + analysis = requirements research)
  - Reasoning: Task focuses on understanding/analyzing requirements and constraints, not building
  - Loading: exploration/base.md, guidance/architecture-patterns.md
  - Starting Discovery Phase: Analyzing existing codebase and content types
- 2025-06-09: Discovery Phase - Found content types:
  1. Task files: .task.md (1.5-3KB avg)
  2. Parent task overviews: _overview.md
  3. Work documents: investigation reports, analysis docs
  4. Session data: .sessions/ JSON + logs
  5. Documentation: /docs/ guides and templates
  - Proceeding to analyze data volumes and structure
- 2025-06-09: Research Phase started:
  Data Structure Analysis:
  - Task metadata: id, title, type, status, priority, area, tags
  - Content sections: instruction, tasks, deliverable, log
  - Doc metadata: YAML frontmatter with title, version, status, authors
  - Volume: 203 tasks (2MB), 63 docs (724KB), sessions (676KB)
  - Moving to external research on search solutions
- 2025-06-09: Analysis Phase complete:
  - Found optimal libraries: MiniSearch (memory-optimized) & FlexSearch (performance-optimized)
  - Integration points: MCP server (localhost), UI client (/api), CLI tools
  - Architecture pattern: Local-first, no external dependencies
  - Moving to Synthesis Phase: Writing comprehensive requirements document
- 2025-06-09: === EXECUTION COMPLETE ===
  - Mode Used: exploration
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: 0 (all requirements analyzed and documented)
  - Follow-up: Comprehensive requirements document ready for implementation
  - Key Findings: MiniSearch/FlexSearch optimal, 18MB projected growth, sub-100ms achievable
  - Architecture: Local-first service in core/ with MCP/UI/CLI integration
