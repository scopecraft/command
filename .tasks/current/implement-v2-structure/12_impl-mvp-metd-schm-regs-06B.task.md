# Implement MVP metadata schema registry

---
type: chore
status: Done
area: core
priority: high
tags:
  - refactor
  - architecture
  - mvp
---


## Instruction
Implement a minimal viable metadata schema registry to fix the hardcoded status/type issues blocking the CRUD refactoring. Focus on the 80/20 approach - get core functionality working with clean boundaries between layers, leave TODOs for complex edge cases.

The goal is to centralize metadata definitions (status, type, priority) with proper transformations between layers while maintaining backward compatibility.

**Implementation Plan**: See `metadata-mvp-implementation-plan.md` in this directory
**Architecture Specification**: See `/docs/specs/metadata-architecture.md`

## Tasks
- [x] Create default metadata schema JSON with current hardcoded values
- [x] Implement schema loading service (pure functions, composable)
- [x] Add status/priority transformers (normalize/denormalize)
- [x] Update MCP layer to use transformers at boundaries
- [ ] Update CLI formatters to use schema for display
- [x] Fix TypeScript type generation from schema
- [x] Test core flows work with new architecture
- [ ] Document TODOs for future enhancements

## Deliverable
✅ Working metadata schema registry with core features:
- Created default-schema.json with all enum values (status, type, priority, workflowState)
- Added emoji AND Lucide icon support to schema
- Built schema-service.ts with transformation and lookup functions
- MCP layer properly transforming between formats
- Schema service centralizes all metadata definitions

❌ Not completed (created as separate subtasks):
- Core formatters still have hardcoded values (see task 15)
- Task UI still has hardcoded values (see task 16)
- CLI formatters not updated

## What was achieved:
- Infrastructure is in place
- MCP layer fully integrated
- Schema includes all needed fields (name, label, emoji, icon)
- Helper functions available for all layers

## What's blocking CRUD refactoring:
- Core and UI still have hardcoded values
- Need tasks 15 and 16 completed for true schema-driven system

## Log
- 2025-06-01: Created task to unblock CRUD refactoring with MVP metadata approach
- 2025-06-02: 2025-06-02: Added reference to related task reds-tas-con-api-for-cns-hand-05A (content API redesign)
- This task is 80% complete and handles section-based content reading/writing
- Relevant for template system integration with metadata schema
- Important: Architecture must support task relations with semantic types (e.g., 'blocks', 'depends-on', 'relates-to')
- Relations should be first-class citizens in metadata schema even if not immediately implemented
- 2025-06-02: Implemented MVP metadata schema registry:
  - Created default-schema.json with all enum values (including workflow states)
  - Built schema-service.ts with transformation functions
  - Updated MCP transformers to use schema service
  - Tested task creation with proper label storage ("In Progress", "High")
  - Schema service now centralizes all metadata definitions
  - Ready for future enhancements (project schemas, emojis, aliases)
- 2025-06-03: Completed MVP infrastructure: schema with icons/emojis, service layer, MCP integration. Created subtasks 15 & 16 for Core and UI integration. Realized the goal wasn't fully achieved - still have hardcoded values blocking CRUD refactoring.
