# Implement write operation normalization in MCP handlers

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
tags:
  - implementation
  - 'team:backend'
  - 'execution:autonomous'
  - write-operations
---


## Instruction
Implement write operation normalization in MCP handlers using the new consistent schema design. Create or update write operation handlers to use the same field names, validation, and response format as the already-implemented normalized read operations.

**Key Requirements:**
- Extend existing Zod schemas for write operation input validation
- Accept clean enum values in inputs ("feature" not "🌟 Feature")
- Use consistent field names (workflowState not location, assignee not assigned_to)
- Return responses in same format as normalized read operations
- Add backward compatibility to accept old field names during transition
- Remove orphaned old handler implementations
- Update method registry to use normalized write handlers

**Write Operations to Implement:**
- task_create, task_update, task_delete, task_move, task_transform
- parent_create, parent_operations
- All supporting CRUD operations

## Tasks
- [ ] Extend Zod schemas in schemas.ts to include write operation input schemas
- [ ] Create normalized write handlers in normalized-handlers.ts or new file
- [ ] Implement task_create handler with new schema and field names
- [ ] Implement task_update handler with new schema
- [ ] Implement task_delete handler with consistent response format
- [ ] Implement task_move handler with workflowState instead of target_state
- [ ] Implement task_transform handler with new schema
- [ ] Implement parent_create handler with consistent field names
- [ ] Implement parent_operations handler with new schema
- [ ] Add input validation and transformation for backward compatibility
- [ ] Update method registry to use normalized write handlers
- [ ] Remove old write handler implementations from handlers.ts
- [ ] Test all write operations with new schemas and field names

## Deliverable
✅ **Complete Write Operation Normalization:**
- Extended Zod schemas for all write operation inputs
- Normalized write handlers with consistent field names and response format
- Backward compatibility support for old field names
- Updated method registry pointing to normalized handlers
- Removed orphaned old write handler code
- All write operations now consistent with read operations
- UI can use same field names for both read and write operations

## Log
