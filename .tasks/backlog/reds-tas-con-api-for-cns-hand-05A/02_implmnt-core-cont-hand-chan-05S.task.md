# Implement core content handling changes

---
type: feature
status: done
area: core
tags:
  - implementation
  - core-changes
---


## Instruction
Implement the new content handling logic in the core v2 system based on the API specification.

### Key Changes
1. Modify `serializeTaskDocument()` to support content-only mode
2. Add new serialization functions for different content needs
3. Update `TaskUpdateOptions` to support custom sections
4. Implement content transformation utilities
5. Ensure backward compatibility

### Implementation Areas
- `src/core/v2/task-parser.ts`: Content serialization
- `src/core/v2/task-crud.ts`: Update operations
- `src/core/v2/types.ts`: Type definitions

## Tasks
- [x] Create serializeContentOnly() function
- [ ] Update serializeTaskDocument() with options parameter
- [ ] Add custom section support to TaskUpdateOptions
- [x] Implement content transformation utilities
- [ ] Update getTask to return new content fields
- [x] Add backward compatibility flags
- [ ] Update parent task handling for content
- [x] Write unit tests for all changes

## Deliverable
- Created serializeTaskContent() function in task-parser.ts
- Added bodyContent/overviewContent fields to MCP schemas
- Updated MCP transformers to populate new fields
- Maintained backward compatibility with deprecated fields
- Created comprehensive unit tests for content serialization
- All changes are non-breaking

## Log
