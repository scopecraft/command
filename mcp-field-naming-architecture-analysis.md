# MCP Field Naming Architecture Analysis

## Executive Summary

The MCP implementation has a **fundamental architectural mismatch** between how tools are registered (with snake_case field names) and how handlers expect parameters (with camelCase field names). This creates a systematic failure in write operations where field transformations are missing.

## 1. Architectural Layers Analysis

### 1.1 Tool Registration Layer (core-server.ts)
- **Purpose**: Registers MCP tools with the SDK
- **Field Convention**: Uses **snake_case** for all parameters
- **Example**:
  ```typescript
  const taskCreateRawShape = {
    parent_id: z.string().optional(),  // snake_case
    location: workflowStateEnum,        // snake_case
    // etc.
  };
  ```

### 1.2 Schema Definition Layer (schemas.ts)
- **Purpose**: Defines Zod schemas for validation and type safety
- **Field Convention**: Uses **camelCase** for all fields
- **Example**:
  ```typescript
  export const TaskCreateInputSchema = WriteOperationContextSchema.extend({
    parentId: z.string().optional(),    // camelCase
    workflowState: WorkflowStateSchema,  // camelCase
    // etc.
  });
  ```

### 1.3 Handler Layer (normalized-write-handlers.ts)
- **Purpose**: Processes requests and validates with Zod schemas
- **Field Convention**: Expects **camelCase** (matching schemas)
- **Issue**: Receives **snake_case** from MCP tool registration

### 1.4 Method Registry (handlers.ts)
- **Purpose**: Routes method calls to appropriate handlers
- **Note**: Simple pass-through, no transformation

## 2. The Core Problem

### Write Operations Field Mismatch

When a write operation is called:

1. **MCP Tool receives**: `{ parent_id: "123", location: "backlog" }`
2. **Handler validates with**: `TaskCreateInputSchema.parse(rawParams)`
3. **Schema expects**: `{ parentId: "123", workflowState: "backlog" }`
4. **Result**: Validation fails or fields are ignored

### Specific Field Mappings Required

| MCP Tool Field (snake_case) | Schema Field (camelCase) | Operations Affected |
|----------------------------|-------------------------|-------------------|
| `parent_id` | `parentId` | task_create, task_update, task_delete, task_move, task_transform |
| `location` | `workflowState` | task_create, parent_create |
| `target_state` | `targetState` | task_move |
| `archive_date` | `archiveDate` | task_move |
| `update_status` | `updateStatus` | task_move |
| `overview_content` | `overviewContent` | parent_create |
| `parallel_with` | `parallelWith` | parent_create (subtasks) |
| `initial_subtasks` | `initialSubtasks` | task_transform |
| `target_parent_id` | `targetParentId` | task_transform |
| `sequence_map` | `sequenceMap` | parent_operations |
| `subtask_ids` | `subtaskIds` | parent_operations |
| `target_sequence` | `targetSequence` | parent_operations |
| `add_log_entry` | `addLogEntry` | task_update |

## 3. Why Read Operations Work

Read operations work because they have proper transformation in `normalized-handlers.ts`:

```typescript
// Task list handler transforms incoming params
const transformedParams = {
  workflowState: params.location,  // Maps location -> workflowState
  taskType: params.task_type,      // Maps task_type -> taskType
  includeCompleted: params.include_completed,
  // etc.
};
```

## 4. Partial Fix in parent_operations

The `handleParentOperationsNormalized` function has a **manual transformation**:

```typescript
// Transform snake_case fields from MCP to camelCase for schema
const transformedParams = rawParams as any;

if (transformedParams?.parent_id !== undefined) {
  transformedParams.parentId = transformedParams.parent_id;
  delete transformedParams.parent_id;
}
// ... more transformations
```

This proves the issue exists and shows one solution approach.

## 5. Architectural Patterns Identified

### Current Pattern (Broken)
1. MCP tools define snake_case fields
2. Handlers expect camelCase fields
3. No systematic transformation layer
4. Manual patches in some handlers

### Desired Pattern
1. MCP tools define fields (convention TBD)
2. Transformation layer converts to internal format
3. Handlers work with consistent internal format
4. Response transformation back to MCP format

## 6. Solution Options

### Option 1: Transform at Handler Entry (Recommended)
- Add transformation logic at the start of each handler
- Similar to `parent_operations` but systematic
- Maintains current tool definitions
- Example:
  ```typescript
  function transformWriteParams(params: any, operation: string) {
    const transformed = { ...params };
    // Apply operation-specific transformations
    if (transformed.parent_id) {
      transformed.parentId = transformed.parent_id;
      delete transformed.parent_id;
    }
    // ... more transformations
    return transformed;
  }
  ```

### Option 2: Change Tool Registration to camelCase
- Modify all tool registrations to use camelCase
- Breaking change for any existing MCP clients
- Cleaner but requires migration

### Option 3: Middleware Layer
- Add transformation middleware between tool registration and handlers
- Most architecturally clean
- Requires restructuring the registration flow

### Option 4: Dual Schema Support
- Make schemas accept both snake_case and camelCase
- Complex and error-prone
- Not recommended

## 7. Recommended Architectural Solution

### Immediate Fix (Phase 1)
1. Create a `parameter-transformer.ts` module with transformation functions
2. Apply transformations at the start of each write handler
3. Use the pattern from `parent_operations` as a template
4. Test each operation thoroughly

### Long-term Solution (Phase 2)
1. Design a middleware transformation layer
2. Define clear boundaries between MCP interface and internal core
3. Consider using discriminated unions for operation-specific params
4. Implement comprehensive integration tests

### Implementation Priority
1. **Critical**: task_create, task_update (most commonly used)
2. **High**: parent_create, parent_operations
3. **Medium**: task_move, task_delete
4. **Low**: task_transform (already partially broken)

## 8. Testing Strategy

### Unit Tests Needed
- Parameter transformation functions
- Each handler with both formats
- Schema validation with transformed params

### Integration Tests Needed
- Full MCP flow for each operation
- Field name validation
- Response format validation

## 9. Conclusion

The MCP write operations have a systematic architectural issue where snake_case fields from tool registration don't match the camelCase fields expected by Zod schemas. This requires a transformation layer that's currently missing in most handlers. The issue is fixable but requires systematic changes across all write operations.

The recommended approach is to add transformation logic at the handler level (like `parent_operations` already does) as an immediate fix, then design a proper middleware layer for the long-term solution.