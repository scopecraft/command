# Design consistent API response schema

---
type: "\U0001F41E Bug"
status: To Do
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
- [ ] Define standard response envelope structure
- [ ] Decide on consistent field naming conventions
- [ ] Document logical grouping vs flat structure trade-offs
- [ ] Create TypeScript interfaces for response types
- [ ] Consider both UI and AI agent use cases
- [ ] Define how to handle task type detection clearly
- [ ] Ensure progress information is consistently available
- [ ] Consider versioning strategy for breaking changes

## Deliverable
Design document with:
1. Normalized task response schema (consider logical grouping vs pure flatness)
2. Response envelope structure for consistency
3. Field naming conventions and rationale
4. TypeScript interface definitions
5. Examples for different task types (simple, parent, subtask)
6. Migration strategy from current format
7. Considerations for both UI and AI agent consumers

## Log
