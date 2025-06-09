# Discover and catalog search solutions across different architectures

---
type: spike
status: todo
area: core
tags:
  - research
  - exploration
  - architecture
  - 'team:research'
  - 'execution:autonomous'
---


## Instruction
Discover and catalog search solutions across different categories with a focus on local-first, extensible architectures. Consider solutions that can handle diverse content types including structured data (tasks), unstructured documents, and streaming logs.

Key evaluation dimensions:
- Local-first indexing (no cloud dependencies)
- Extensibility to new content types without major refactoring
- Support for faceted search
- Ability to handle both static files and streaming content
- Memory efficiency for diverse content
- Partial content indexing (e.g., user vs assistant messages in sessions)
- Graph capabilities for relationship tracking (tasks → subtasks, documents → references)

Consider both traditional search engines and graph-aware solutions that could handle:
- Task dependency chains
- Document cross-references
- Session → task relationships
- Knowledge graph construction

## Tasks
- [ ] Research lightweight in-process search libraries (npm ecosystem)
- [ ] Explore embedded databases with search capabilities (e.g., SurrealDB in embedded mode)
- [ ] Investigate lightweight search servers (e.g., TypeSense, MeiliSearch)
- [ ] Look for innovative/emerging search solutions in the JS/TS ecosystem
- [ ] Check for graph databases that could handle both search and relationships
- [ ] Research vector/semantic search options if relevant
- [ ] Catalog solutions by architecture type
- [ ] Note licensing, maintenance status, and community health
- [ ] Create initial filtering criteria based on basic requirements

## Deliverable
Comprehensive catalog of search solutions organized by architecture type:

1. **In-Process Libraries**
   - Pure JS/TS libraries that run in the same process
   - No external dependencies
   - Examples found with pros/cons

2. **Embedded Databases**
   - Databases that can run embedded with search capabilities
   - Include SurrealDB and similar solutions
   - Note resource requirements

3. **Lightweight Search Servers**
   - Standalone but lightweight search engines
   - Include TypeSense and alternatives
   - Deployment complexity assessment

4. **Innovative Approaches**
   - Novel solutions discovered
   - Hybrid approaches
   - Future-looking options

For each solution, document:
- Basic architecture and deployment model
- Key features relevant to our use case
- Rough resource requirements
- Community/maintenance status
- Initial gut feeling on fit

## Log
- 2025-06-09: Updated requirements to emphasize local-first architecture and extensibility for future session search capability
- 2025-06-09: Added graph/relationship indexing as evaluation dimension for future link and reference tracking
