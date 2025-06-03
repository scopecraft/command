# Replace hardcoded display labels with canonical names

---
type: chore
status: todo
area: core
---


## Instruction

Complete the migration from hardcoded display labels (like "To Do", "High") to canonical names (like "todo", "high") throughout the codebase. This follows the schema-driven approach where we store canonical names internally and display human-readable labels.

## Context

We've already:
- Updated TypeScript types to use canonical names
- Fixed task-crud.ts to use schema service for defaults
- Added TODO comment about generating types from schema

Remaining files with display labels:
- src/cli/commands.ts (lines 471, 485, 529)
- src/cli/formatters.ts (multiple comparisons)
- src/core/parent-tasks.ts (line 55)
- src/core/template-manager.ts (line 108)
- src/mcp/normalized-handlers.ts (line 138)

## Tasks

- [ ] Update CLI commands to use canonical names or schema lookups
- [ ] Update formatters to compare against canonical names
- [ ] Update parent-tasks.ts to use getDefaultStatus()
- [ ] Update template-manager.ts to use canonical names
- [ ] Update MCP normalized-handlers to use canonical names
- [ ] Consider creating a normalizeTaskType function
- [ ] Test all changes work correctly

## Deliverable

All hardcoded display labels replaced with canonical names from schema, following Postel's Law (accept any input, store canonical).

## Log

- 2025-06-03: Task created to track remaining work from schema integration
