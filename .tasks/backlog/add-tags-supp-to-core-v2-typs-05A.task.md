# Add tags support to core v2 types

---
type: chore
status: To Do
area: general
priority: Medium
tags:
  - core
  - v2-design
---


## Instruction

The core v2 types currently don't include tags as a first-class citizen in the TaskFrontmatter interface. Tags are being used throughout the system (CLI supports --tags, tasks have tags in frontmatter), but they're relegated to the generic `[key: string]: unknown` extension mechanism.

This is problematic because:
1. Tags are a fundamental organizational concept used across task management systems
2. The CLI already treats tags as a primary filter/attribute
3. Without type safety, different parts of the codebase might implement tags differently
4. MCP tools need to support tag filtering, but have to treat it as a custom field

### Proposed Change
Add `tags?: string[]` as an optional typed field in TaskFrontmatter, similar to how `priority` is handled.


## Tasks

- [ ] Review current tag usage across the codebase
- [ ] Add `tags?: string[]` to TaskFrontmatter interface in v2/types.ts
- [ ] Update task CRUD operations to properly handle tags
- [ ] Ensure TaskListOptions includes typed tag filtering
- [ ] Update formatters to display tags consistently
- [ ] Add tests for tag operations

## Deliverable

- Updated TaskFrontmatter interface with typed tags field
- Consistent tag handling across all v2 operations
- Type-safe tag filtering in list operations
- Documentation updates reflecting tags as core feature

## Log

- 2025-05-28: Task created during MCP v2 update planning. Identified that tags are used everywhere but not properly typed in core v2.
