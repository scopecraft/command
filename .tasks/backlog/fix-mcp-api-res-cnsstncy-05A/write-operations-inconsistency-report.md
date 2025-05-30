# MCP Write Operations Inconsistency Report

## Executive Summary

This report documents the inconsistencies between MCP write operations and the normalized read operations. The read operations (task_list, task_get, parent_list, parent_get) have been normalized using Zod schemas with consistent field naming and response formats. However, the write operations still use the old format, creating significant API inconsistencies that impact UI teams trying to build against a consistent API.

## Key Inconsistencies Overview

### 1. Field Naming Mismatches

| Read Operations (Normalized) | Write Operations (Current) | Notes |
|------------------------------|----------------------------|-------|
| `workflowState` | `location` | Different names for same concept |
| `assignee` | `assignee` | Consistent, but sometimes `assigned_to` in legacy code |
| Clean enum values | Raw emoji strings | Read: `"bug"`, Write: `"🐞 Bug"` |

### 2. Response Format Differences

- **Read operations**: Use consistent Zod-validated response envelope with `success`, `data`, `error`, `message`, and optional `metadata`
- **Write operations**: Use inconsistent formats with varying field names and structures

### 3. Schema Validation

- **Read operations**: Full Zod schema validation on inputs and outputs
- **Write operations**: No schema validation, manual type checking only

## Detailed Analysis by Operation

### Task Create (`task_create`)

**Input Parameters (TaskCreateParams):**
```typescript
{
  title: string;
  type: TaskType;  // Expects clean enum but no validation
  area?: string;
  status?: TaskStatus;  // Expects clean enum
  priority?: TaskPriority;  // Expects clean enum
  location?: WorkflowState;  // Should be workflowState
  parent_id?: string;
  assignee?: string;
  tags?: string[];
  root_dir?: string;
}
```

**Inconsistencies:**
- Uses `location` instead of `workflowState`
- No input validation for enums
- No schema definition for the response

**Response Format:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    path: string;
  };
  message: string;
}
```

### Task Update (`task_update`)

**Input Parameters (TaskUpdateParams):**
```typescript
{
  id: string;
  parent_id?: string;
  updates: {
    title?: string;
    status?: TaskStatus;  // No validation
    priority?: TaskPriority;  // No validation
    area?: string;
    assignee?: string;
    tags?: string[];
    instruction?: string;
    tasks?: string;
    deliverable?: string;
    log?: string;
    add_log_entry?: string;  // Special convenience field
  };
  root_dir?: string;
}
```

**Inconsistencies:**
- Flattened structure mixes metadata and content updates
- No validation on enum values
- Response format uses generic `formatV2Response` without schema

### Task Delete (`task_delete`)

**Input Parameters:**
```typescript
{
  id: string;
  parent_id?: string;
  cascade?: boolean;
  root_dir?: string;
}
```

**Response:** Generic V2 response format without schema validation

### Task Move (`task_move`)

**Input Parameters:**
```typescript
{
  id: string;
  parent_id?: string;
  target_state: WorkflowState;  // Correctly named but no validation
  archive_date?: string;
  update_status?: boolean;
  root_dir?: string;
}
```

**Response:** Generic V2 response format

### Task Transform (`task_transform`)

**Input Parameters:**
```typescript
{
  id: string;
  parent_id?: string;
  operation: 'promote' | 'extract' | 'adopt';
  initial_subtasks?: string[];
  target_parent_id?: string;
  sequence?: string;
  after?: string;
  root_dir?: string;
}
```

**Issues:**
- The `adopt` operation is documented as broken in the code
- Error message suggests manual workaround
- No schema validation

### Parent Create (`parent_create`)

**Input Parameters:**
```typescript
{
  title: string;
  type: TaskType;  // V2 type but no validation
  area?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  location?: WorkflowState;  // Should be workflowState
  overview_content?: string;
  subtasks?: Array<{
    title: string;
    sequence?: string;
    parallel_with?: string;
  }>;
  assignee?: string;
  tags?: string[];
  root_dir?: string;
}
```

**Inconsistencies:**
- Uses `location` instead of `workflowState`
- Uses `overview_content` instead of structured sections
- No schema validation

### Parent Operations (`parent_operations`)

**Input Parameters:**
```typescript
{
  parent_id: string;
  operation: 'resequence' | 'parallelize' | 'add_subtask';
  // Operation-specific fields...
  root_dir?: string;
}
```

**Issues:**
- The `resequence` operation has a placeholder implementation
- Complex union type without proper validation
- No schema definition

## Impact on UI Teams

### 1. **Inconsistent Field Names**
UI teams must maintain mappings between read and write field names:
```typescript
// UI code needs to do this:
const createData = {
  location: readData.workflowState,  // Field name translation
  type: "bug",  // Must know to use clean enum
  // ...
};
```

### 2. **Type Safety Issues**
Without Zod schemas on write operations:
- No compile-time type safety
- No runtime validation
- Errors only discovered at runtime

### 3. **Response Handling Complexity**
Different response formats between read and write:
```typescript
// Read response (normalized)
{
  success: true,
  data: Task[],  // Strongly typed
  metadata: { timestamp, version, count }
}

// Write response (inconsistent)
{
  success: true,
  data: { id, path },  // Different structure
  message: string
}
```

### 4. **Error Handling Inconsistency**
- Read operations: Consistent error format with optional error field
- Write operations: Various error formats, some with error field, some without

## Type Field Handling

### Read Operations (Normalized)
- Input: Clean enum values (`"bug"`, `"feature"`)
- Output: Clean enum values
- Validation: Zod enum schema

### Write Operations (Current)
- Input: Expects clean enum values but no validation
- Internal: May need to handle emoji prefixes
- Output: Varies by operation

## Recommendations

1. **Immediate Actions:**
   - Add Zod schemas for all write operations
   - Standardize field names (`location` → `workflowState`)
   - Implement consistent response envelopes

2. **Short-term Improvements:**
   - Add input validation for all enum fields
   - Fix the broken `adopt` operation
   - Complete the `resequence` implementation

3. **Long-term Goals:**
   - Unify all operations under the same schema system
   - Generate TypeScript types from Zod schemas
   - Add comprehensive error handling

## Technical Debt

1. **Mixed Handler Types:**
   - Some handlers use normalized handlers (read operations)
   - Others use legacy handlers (write operations)
   - Creates maintenance burden

2. **Schema Duplication:**
   - Input types defined in `types.ts`
   - Output schemas in `schemas.ts`
   - No single source of truth

3. **Validation Gaps:**
   - Read operations: Full validation
   - Write operations: No validation
   - Inconsistent error messages

## Conclusion

The current state of MCP write operations creates significant challenges for API consumers. The lack of schema validation, inconsistent field naming, and varied response formats make it difficult to build reliable clients. Implementing the normalized schema approach used in read operations across all write operations would greatly improve the API's consistency and usability.