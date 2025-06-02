# Implement MVP metadata schema registry

---
type: chore
status: todo
area: core
priority: high
tags: [refactor, architecture, mvp]
---


## Instruction
Implement a minimal viable metadata schema registry to fix the hardcoded status/type issues blocking the CRUD refactoring. Focus on the 80/20 approach - get core functionality working with clean boundaries between layers, leave TODOs for complex edge cases.

The goal is to centralize metadata definitions (status, type, priority) with proper transformations between layers while maintaining backward compatibility.

**Implementation Plan**: See `metadata-mvp-implementation-plan.md` in this directory
**Architecture Specification**: See `/docs/specs/metadata-architecture.md`

## Tasks
- [ ] Create default metadata schema JSON with current hardcoded values
- [ ] Implement schema loading service (pure functions, composable)
- [ ] Add status/priority transformers (normalize/denormalize)
- [ ] Update MCP layer to use transformers at boundaries
- [ ] Update CLI formatters to use schema for display
- [ ] Fix TypeScript type generation from schema
- [ ] Test core flows work with new architecture
- [ ] Document TODOs for future enhancements

## Deliverable
- Working metadata schema registry with core features
- MCP layer properly transforming between formats
- CLI displaying correct human-readable values
- All existing tests passing
- Clear TODOs for remaining 20% edge cases
- No more type errors from status/priority mismatches

## Log
- 2025-06-01: Created task to unblock CRUD refactoring with MVP metadata approach