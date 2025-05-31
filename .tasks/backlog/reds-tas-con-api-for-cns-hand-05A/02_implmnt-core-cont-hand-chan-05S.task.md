# Implement core content handling changes

---
type: feature
status: To Do
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
- [ ] Create serializeContentOnly() function
- [ ] Update serializeTaskDocument() with options parameter
- [ ] Add custom section support to TaskUpdateOptions
- [ ] Implement content transformation utilities
- [ ] Update getTask to return new content fields
- [ ] Add backward compatibility flags
- [ ] Update parent task handling for content
- [ ] Write unit tests for all changes

## Deliverable
- Updated core modules with new content handling
- Backward compatible implementation
- Comprehensive unit tests
- No breaking changes to existing API

## Log
