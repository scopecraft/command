# Design consistent API response schema

---
type: bug
status: Done
area: mcp
tags:
  - design
  - 'team:architect'
  - 'execution:interactive'
---


## Instruction
Design a consistent API response schema for all MCP endpoints that serves both the Task UI and AI agents effectively. The schema should provide a unified structure that works for all task types with clear naming, consistent patterns, and clean data. While the UI team suggested a flat format, prioritize consistency and logical structure over pure flatness - the UI can perform minor transformations as needed.

**Design Priorities:**
1. Consistency across all endpoints
2. Clear, unambiguous field names
3. Clean enum values (no emoji prefixes)
4. Logical grouping where it makes sense
5. Single source of truth for task properties
6. Works well for both human developers and AI consumers

## Tasks
- [x] Define standard response envelope structure
- [x] Decide on consistent field naming conventions
- [x] Document logical grouping vs flat structure trade-offs
- [x] Create TypeScript interfaces for response types
- [x] Consider both UI and AI agent use cases
- [x] Define how to handle task type detection clearly
- [x] Ensure progress information is consistently available
- [x] Consider versioning strategy for breaking changes

## Deliverable
Created comprehensive API schema design document: `api-schema-design.md`

Key design decisions:
1. **Discriminated unions** using `taskStructure` field for clear task type detection
2. **Logical grouping** maintained (e.g., progress object) while keeping primary fields accessible
3. **Clean enums** without emoji prefixes
4. **Consistent naming** (workflowState not location, camelCase throughout)
5. **Response envelope** for all endpoints with metadata
6. **Progressive enhancement** - optional content/subtasks based on parameters
7. **Migration strategy** with transformation layer first, core changes optional

## Log
- 2025-05-30: Designed comprehensive API response schema
  - Created discriminated union types for clear task differentiation
  - Defined consistent response envelope structure
  - Established field naming conventions (camelCase, clear names)
  - Balanced UI flat structure preference with logical grouping
  - Included file system info useful for both UI and AI
  - Provided complete TypeScript interfaces
  - Documented migration strategy and benefits for each audience
- 2025-05-30: Major revision based on feedback (api-schema-design-v2.md)
  - Switched to Zod schemas for single source of truth
  - Added comprehensive endpoint analysis (keep all 4 for token efficiency)
  - Documented input schemas for each endpoint
  - Added token cost considerations throughout
  - Removed deprecation concerns (V2 branch)
  - Showed MCP outputSchema integration
  - Considered future MCP resource migration
- 2025-05-30: Added advanced filtering schema and updated subsequent subtasks
  - Moved tags/assignee to top-level filters
  - Added advancedFilter object for future metadata (with TODO implementation)
  - Updated all subsequent subtasks to align with Zod approach
  - Marked subtask 06 as skip (no backward compatibility needed)
