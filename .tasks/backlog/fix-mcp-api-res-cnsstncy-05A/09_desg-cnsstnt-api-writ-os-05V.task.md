# Design consistent API write operation schema

---
type: bug
status: done
area: mcp
tags:
  - design
  - 'team:architect'
  - 'execution:interactive'
  - write-operations
parent: fix-mcp-api-res-cnsstncy-05A
---


## Instruction
Design consistent API write operation schemas that match the already-implemented normalized read schema format. Ensure write operations use the same field names, enum values, and response structures as the read operations for complete API consistency.

**Design Priorities:**
1. **Consistency with existing normalized read schema** - Use same field names (workflowState not location)
2. **Clean input validation** - Accept clean enum values ("feature" not "🌟 Feature")
3. **Consistent response format** - Same envelope structure as read operations
4. **Unified error handling** - Same error response format across all operations
5. **Zod schema integration** - Extend existing schemas for input validation
6. **Backward parameter mapping** - Handle both old and new field names during transition

**Write Operations to Design:**
- task_create, task_update, task_delete, task_move, task_transform
- parent_create, parent_operations
- All supporting CRUD operations

## Tasks
- [x] Extend existing Zod schemas to include input schemas for write operations
- [x] Design consistent field naming for all write operation inputs
- [x] Define clean enum value handling for write operations (accept clean values)
- [x] Design consistent response envelope structure for write operations
- [x] Create unified error response schema
- [x] Design backward compatibility parameter mapping (old → new field names)
- [x] Define validation rules for all write operation inputs
- [x] Create TypeScript interfaces for all write operation schemas
- [x] Document migration strategy from old write format to new format
- [x] Ensure write operation responses can be consumed by existing UI expecting normalized format

## Deliverable
✅ Comprehensive write operation schema design document: `write-operations-schema-design.md`

Key design decisions implemented:
1. **Field name consistency** - All write operations use workflowState, assignee, clean enums
2. **Unified response format** - Same envelope structure as normalized read operations
3. **Clean input validation** - Accept and validate clean enum values
4. **Backward compatibility** - Support both old and new field names during transition
5. **Zod integration** - Extend existing schemas for complete type safety
6. **Error consistency** - Same error response format across all operations

## Log
- 2025-05-30: Completed comprehensive schema design for all write operations. Created detailed design document with Zod schema definitions for task_create, task_update, task_delete, task_move, task_transform, parent_create, and parent_operations. Included backward compatibility strategy with deprecated field support, migration path with 3-phase approach, and consistent response envelope matching read operations. Key innovations: discriminated unions for complex operations, refine validators for deprecated fields, camelCase field naming throughout. Document saved to write-operations-schema-design.md
- 2025-05-30: REVISED after user feedback - Removed all backward compatibility complexity since MCP sessions are stateless. Clean break approach: only accept new field names (workflowState, parentId), no deprecated field handling, immediate availability for frontend. Simplified all schemas by removing .never() validators and refinements for old fields.
