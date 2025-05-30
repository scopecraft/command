# Add tests for API response consistency

---
type: "\U0001F41E Bug"
status: To Do
area: mcp
tags:
  - testing
  - 'team:qa'
  - 'execution:autonomous'
---


## Instruction
Add comprehensive tests for the new Zod-based MCP API schema. Test both the schema validation itself and the response consistency across all 4 endpoints. Focus on discriminated union validation, clean enum values, logical structure consistency, and proper MCP outputSchema integration.

**Key Test Areas:**
- Zod schema validation for all task types
- Response envelope consistency
- Discriminated union behavior (taskStructure field)
- Field naming consistency across endpoints
- Clean enum values (no emoji prefixes)
- Token-efficient endpoint behavior
- Basic filtering functionality
- MCP outputSchema integration

## Tasks
- [ ] Test Zod schema validation for all task types (SimpleTask, SubTask, ParentTask)
- [ ] Test discriminated union behavior (taskStructure field)
- [ ] Test response envelope consistency across all endpoints
- [ ] Test field naming consistency (workflowState, assignee, etc.)
- [ ] Test clean enum values (no emoji prefixes in type, status, priority)
- [ ] Test task_list endpoint with various filters and options
- [ ] Test task_get endpoint for all task types
- [ ] Test parent_list endpoint with progress data
- [ ] Test parent_get endpoint with full subtask inclusion
- [ ] Test basic filtering functionality (workflowState, area, assignee, tags)
- [ ] Test advancedFilter warning behavior (should log warning and ignore)
- [ ] Test MCP outputSchema generation from Zod schemas
- [ ] Test error response format consistency
- [ ] Add integration tests for transformation layer
- [ ] Test token optimization features (includeContent, includeSubtasks flags)

## Deliverable
- Comprehensive test suite for Zod schema validation
- Response consistency tests across all 4 endpoints
- Schema transformation tests (core V2 → normalized schema)
- Basic filtering functionality tests
- MCP outputSchema integration tests
- Error handling and edge case tests
- Performance/token efficiency validation tests

## Log
