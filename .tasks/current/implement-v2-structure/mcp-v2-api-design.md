# MCP V2 API Design

## Overview

This document outlines the final API design for updating the MCP server to support the V2 workflow-based task system.

## Design Principles

1. **Minimal API Surface**: Fewer, more flexible tools (like REST APIs)
2. **Consistent Parameters**: `parent_id` available where needed for subtask context
3. **Smart Defaults**: Common operations simple, advanced features available
4. **Extensible Filtering**: Leverage v2's `[key: string]: unknown` for custom filters

## Zod Schema Definitions

### Common Enums and Types

```typescript
// Get task types dynamically from templates
const templates = listTemplates();
const taskTypes = templates.map(t => t.description).filter(Boolean);
const availableTaskTypes = taskTypes.length > 0 
  ? taskTypes 
  : ['feature', 'bug', 'chore', 'documentation', 'test', 'spike'];

// Core enums
const taskTypeEnum = z.enum(availableTaskTypes as [string, ...string[]]);
const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Done', 'Blocked', 'Archived']);
const taskPriorityEnum = z.enum(['Highest', 'High', 'Medium', 'Low']);
const workflowStateEnum = z.enum(['backlog', 'current', 'archive']);
const areaEnum = z.enum(['cli', 'mcp', 'ui', 'core', 'docs', 'general']);
```

## Core Tools

### 1. Task CRUD Operations

#### task_list

```typescript
const taskListRawShape = {
  // Workflow location filtering
  location: z
    .union([
      workflowStateEnum,
      z.array(workflowStateEnum)
    ])
    .describe('Filter by workflow location(s): backlog, current, or archive')
    .optional(),
    
  // Core filters
  type: taskTypeEnum
    .describe('Filter by task type (based on available templates)')
    .optional(),
    
  status: taskStatusEnum
    .describe('Filter by task status')
    .optional(),
    
  area: z.string()
    .describe('Filter by area (e.g., "cli", "mcp", "ui")')
    .optional(),
    
  // Include options  
  include_archived: z.boolean()
    .describe('Include archived tasks in results (default: false)')
    .default(false)
    .optional(),
    
  include_parent_tasks: z.boolean()
    .describe('Include parent task folders in results (default: true)')
    .default(true)
    .optional(),
    
  // Subtask filtering
  parent_id: z.string()
    .describe('List only subtasks of this parent task ID')
    .optional(),
    
  // Custom frontmatter filters
  priority: taskPriorityEnum
    .describe('Filter by priority level')
    .optional(),
    
  assignee: z.string()
    .describe('Filter by assigned username')
    .optional(),
    
  tags: z.array(z.string())
    .describe('Filter by tags (e.g., ["backend", "api"])')
    .optional(),
    
  // Output control
  include_content: z.boolean()
    .describe('Include full task content in response (default: false)')
    .default(false)
    .optional(),
};

server.registerTool('task_list', {
  description: 'Lists tasks with powerful filtering across workflow states. Supports filtering by type, status, area, priority, assignee, and tags. Can list subtasks of a specific parent or search across all tasks.',
  inputSchema: taskListRawShape,
  annotations: {
    title: 'List Tasks',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
});
```

#### task_get

```typescript
const taskGetRawShape = {
  id: z.string()
    .describe('Task ID to retrieve (e.g., "auth-feature-05A" or "02_implement-api-05B")')
    .min(1),
    
  parent_id: z.string()
    .describe('Parent task ID for subtask resolution. Helps locate subtasks like "02_implement-api"')
    .optional(),
    
  format: z.enum(['full', 'summary', 'tree'])
    .describe('Output format: full (all content), summary (metadata only), tree (parent with subtasks)')
    .default('full')
    .optional(),
};

server.registerTool('task_get', {
  description: 'Retrieves complete details of a specific task. For subtasks, provide parent_id to help with resolution. Use tree format to see parent task with all subtasks.',
  inputSchema: taskGetRawShape,
  annotations: {
    title: 'Get Task Details',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
});
```

#### task_create

```typescript
const taskCreateRawShape = {
  // Required fields
  title: z.string()
    .describe('Task title/summary. Will be used to generate task ID.')
    .min(3)
    .max(200),
    
  type: taskTypeEnum
    .describe('Task type (must match available templates)'),
    
  area: z.string()
    .describe('Task area (e.g., "cli", "mcp", "ui", "core")')
    .default('general'),
    
  // Optional metadata
  status: taskStatusEnum
    .describe('Initial task status')
    .default('To Do')
    .optional(),
    
  priority: taskPriorityEnum
    .describe('Task priority level')
    .default('Medium')
    .optional(),
    
  location: workflowStateEnum
    .describe('Workflow location for new task')
    .default('backlog')
    .optional(),
    
  // Parent/subtask relationship
  parent_id: z.string()
    .describe('Parent task ID - creates this as a subtask with auto-generated sequence number')
    .optional(),
    
  sequence: z.string()
    .regex(/^\d{2}$/)
    .describe('Explicit sequence number for subtask (e.g., "01", "02"). Auto-generated if not provided.')
    .optional(),
    
  // Template
  template: z.string()
    .describe('Template name to use for initial content (see template_list)')
    .optional(),
    
  // Custom frontmatter
  assignee: z.string()
    .describe('Username of person assigned to this task')
    .optional(),
    
  tags: z.array(z.string())
    .describe('Tags for categorization (e.g., ["backend", "api"])')
    .optional(),
    
  custom_metadata: z.record(z.unknown())
    .describe('Additional custom frontmatter fields')
    .optional(),
    
  // Initial content sections
  instruction: z.string()
    .describe('Initial instruction section content (markdown)')
    .optional(),
    
  tasks: z.array(z.string())
    .describe('Checklist items for the tasks section (e.g., ["Design API", "Implement endpoints"])')
    .optional(),
    
  deliverable: z.string()
    .describe('Initial deliverable section content (markdown)')
    .optional(),
};

server.registerTool('task_create', {
  description: 'Creates a new task with auto-generated ID based on title. Can create standalone tasks or subtasks within a parent. Supports templates and custom initial content. Tasks default to backlog unless specified.',
  inputSchema: taskCreateRawShape,
  annotations: {
    title: 'Create Task',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
});
```

#### task_update

```typescript
const taskUpdateRawShape = {
  id: z.string()
    .describe('Task ID to update'),
    
  parent_id: z.string()
    .describe('Parent task ID for subtask resolution')
    .optional(),
    
  // Title update (rare but supported)
  title: z.string()
    .describe('New task title (Note: does not change task ID)')
    .optional(),
    
  // Frontmatter updates
  frontmatter: z.object({
    type: taskTypeEnum.optional(),
    status: taskStatusEnum.optional(),
    area: z.string().optional(),
    priority: taskPriorityEnum.optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
    .catchall(z.unknown()) // Allow custom fields
    .describe('Update frontmatter fields. Only specified fields are changed.')
    .optional(),
    
  // Section updates
  sections: z.object({
    instruction: z.string()
      .describe('Replace instruction section content')
      .optional(),
    tasks: z.string()
      .describe('Replace tasks section content (use markdown checklist format)')
      .optional(),
    deliverable: z.string()
      .describe('Replace deliverable section content')
      .optional(),
    log: z.string()
      .describe('Replace log section content (usually append new entries)')
      .optional(),
  })
    .catchall(z.string()) // Allow custom sections
    .describe('Update task sections. Only specified sections are changed.')
    .optional(),
    
  // Log entry helper
  add_log_entry: z.string()
    .describe('Convenience: Add a timestamped entry to the log section (appends, doesn\'t replace)')
    .optional(),
};

server.registerTool('task_update', {
  description: 'Updates a task\'s metadata and/or content. Supports partial updates - only specified fields change. Can update frontmatter (status, priority, etc.) and sections (instruction, tasks, etc.) independently.',
  inputSchema: taskUpdateRawShape,
  annotations: {
    title: 'Update Task',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
});
```

#### task_move

```typescript
const taskMoveRawShape = {
  id: z.string()
    .describe('Task ID to move'),
    
  parent_id: z.string()
    .describe('Parent task ID for subtask resolution')
    .optional(),
    
  target_state: workflowStateEnum
    .describe('Target workflow location: backlog, current, or archive'),
    
  archive_date: z.string()
    .regex(/^\d{4}-\d{2}$/)
    .describe('Archive month in YYYY-MM format (required when moving to archive)')
    .optional(),
    
  update_status: z.boolean()
    .describe('Auto-update task status based on workflow transition (e.g., current→Done, backlog→To Do)')
    .default(true)
    .optional(),
};

server.registerTool('task_move', {
  description: 'Moves tasks between workflow states (backlog/current/archive). Automatically updates status based on transition unless disabled. Archive moves require YYYY-MM date.',
  inputSchema: taskMoveRawShape,
  annotations: {
    title: 'Move Task',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
  },
});
```

#### task_delete

```typescript
const taskDeleteRawShape = {
  id: z.string()
    .describe('Task ID to delete'),
    
  parent_id: z.string()
    .describe('Parent task ID for subtask resolution')
    .optional(),
    
  cascade: z.boolean()
    .describe('For parent tasks: delete entire folder including all subtasks')
    .default(false)
    .optional(),
};

server.registerTool('task_delete', {
  description: 'Permanently deletes a task file. For parent tasks, use cascade:true to delete the entire folder with subtasks. This operation cannot be undone.',
  inputSchema: taskDeleteRawShape,
  annotations: {
    title: 'Delete Task',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
  },
});
```

### 2. Parent Task Operations

#### parent_list

```typescript
const parentListRawShape = {
  location: z
    .union([
      workflowStateEnum,
      z.array(workflowStateEnum)
    ])
    .describe('Filter by workflow location(s)')
    .optional(),
    
  area: z.string()
    .describe('Filter by area')
    .optional(),
    
  include_progress: z.boolean()
    .describe('Include subtask completion statistics (done/total count)')
    .default(true)
    .optional(),
    
  include_subtasks: z.boolean()
    .describe('Include full subtask list with each parent')
    .default(false)
    .optional(),
};

server.registerTool('parent_list', {
  description: 'Lists parent tasks (folders with _overview.md). Shows task hierarchies and optionally includes progress stats and subtask details. Parent tasks represent complex work with multiple subtasks.',
  inputSchema: parentListRawShape,
  annotations: {
    title: 'List Parent Tasks',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
});
```

#### parent_create

```typescript
const parentCreateRawShape = {
  title: z.string()
    .describe('Parent task title. Will create folder with _overview.md')
    .min(3)
    .max(200),
    
  type: taskTypeEnum
    .describe('Task type for the parent overview'),
    
  area: z.string()
    .describe('Task area')
    .default('general'),
    
  status: taskStatusEnum
    .describe('Initial status')
    .default('To Do')
    .optional(),
    
  priority: taskPriorityEnum
    .describe('Priority level')
    .default('Medium')
    .optional(),
    
  location: workflowStateEnum
    .describe('Workflow location')
    .default('backlog')
    .optional(),
    
  // Parent-specific content
  overview_content: z.string()
    .describe('Initial content for _overview.md instruction section')
    .optional(),
    
  subtasks: z.array(z.object({
    title: z.string()
      .describe('Subtask title'),
    sequence: z.string()
      .regex(/^\d{2}$/)
      .describe('Sequence number (e.g., "01", "02"). Auto-generated if not provided.')
      .optional(),
    parallel_with: z.string()
      .describe('Make parallel with this subtask ID (same sequence number)')
      .optional(),
  }))
    .describe('Initial subtasks to create')
    .optional(),
    
  // Custom frontmatter
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
};

server.registerTool('parent_create', {
  description: 'Creates a parent task folder with _overview.md and optional initial subtasks. Parent tasks organize complex work with multiple subtasks that can be sequenced or run in parallel.',
  inputSchema: parentCreateRawShape,
  annotations: {
    title: 'Create Parent Task',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
});
```

#### parent_operations

```typescript
const parentOperationsRawShape = {
  parent_id: z.string()
    .describe('Parent task ID to operate on'),
    
  operation: z.enum(['resequence', 'parallelize', 'add_subtask'])
    .describe('Operation to perform on parent\'s subtasks'),
    
  // For resequence operation
  sequence_map: z.array(z.object({
    id: z.string()
      .describe('Subtask ID (without parent path)'),
    sequence: z.string()
      .regex(/^\d{2}$/)
      .describe('New sequence number'),
  }))
    .describe('[resequence] New sequence assignments for subtasks')
    .optional(),
    
  // For parallelize operation
  subtask_ids: z.array(z.string())
    .describe('[parallelize] Subtask IDs to make parallel (will share same sequence)')
    .min(2)
    .optional(),
    
  target_sequence: z.string()
    .regex(/^\d{2}$/)
    .describe('[parallelize] Sequence number to assign to all parallel tasks')
    .optional(),
    
  // For add_subtask operation  
  subtask: z.object({
    title: z.string()
      .describe('New subtask title'),
    type: taskTypeEnum
      .describe('Subtask type')
      .optional(),
    after: z.string()
      .describe('Insert after this subtask ID (e.g., "02_design-api")')
      .optional(),
    sequence: z.string()
      .regex(/^\d{2}$/)
      .describe('Explicit sequence number (alternative to "after")')
      .optional(),
    template: z.string()
      .describe('Template to use for subtask content')
      .optional(),
  })
    .describe('[add_subtask] New subtask details')
    .optional(),
};

server.registerTool('parent_operations', {
  description: 'Perform bulk operations on a parent task\'s subtasks. Resequence to reorder tasks, parallelize to make tasks run simultaneously, or add new subtasks at specific positions.',
  inputSchema: parentOperationsRawShape,
  annotations: {
    title: 'Parent Task Operations',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
});
```

### 3. Task Transformation

#### task_transform

```typescript
const taskTransformRawShape = {
  id: z.string()
    .describe('Task ID to transform'),
    
  parent_id: z.string()
    .describe('Current parent ID (required for extract operation on subtasks)')
    .optional(),
    
  operation: z.enum(['promote', 'extract', 'adopt'])
    .describe('Transformation operation: promote (simple→parent), extract (subtask→simple), adopt (simple→subtask)'),
    
  // For promote operation
  initial_subtasks: z.array(z.string())
    .describe('[promote] Checklist items from tasks section to convert to subtasks')
    .optional(),
    
  // For adopt operation
  target_parent_id: z.string()
    .describe('[adopt] Parent task to adopt this task into (WARNING: adoption is currently broken in core)')
    .optional(),
    
  sequence: z.string()
    .regex(/^\d{2}$/)
    .describe('[adopt] Sequence number for adopted subtask')
    .optional(),
    
  after: z.string()
    .describe('[adopt] Insert after this existing subtask (alternative to sequence)')
    .optional(),
};

server.registerTool('task_transform', {
  description: 'Transform tasks between simple and parent forms. Promote creates a parent folder from a simple task. Extract pulls a subtask out to standalone. Adopt moves a task into a parent (currently broken - will document in response).',
  inputSchema: taskTransformRawShape,
  annotations: {
    title: 'Transform Task Structure',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
});
```

## Migration Strategy

1. **Phase Removal**: Remove all phase_* tools with clear error messages
2. **Feature → Parent**: Map feature_* tools to parent operations internally
3. **Backward Compatibility**: Accept old parameters where sensible
4. **Clear Migration Path**: Tool descriptions explain v1→v2 changes

## Error Handling Examples

```typescript
// Subtask not found
{
  "error": "Task '02-update' not found",
  "suggestions": [
    "If this is a subtask, provide parent_id parameter",
    "Use parent_list to find parent tasks",
    "Task might be archived - set include_archived: true"
  ]
}

// Phase tool removed  
{
  "error": "Phase operations no longer supported",
  "migration": "Use workflow locations instead: backlog, current, or archive",
  "example": "Use task_move with target_state parameter"
}

// Multiple tasks found
{
  "error": "Multiple tasks found matching '02-update'",
  "matches": [
    {"id": "02-update-api-05A", "parent": "auth-feature"},
    {"id": "02-update-docs-05B", "parent": "docs-improvement"}
  ],
  "suggestion": "Provide parent_id or use full task ID"
}
```

## Handler Implementation Examples

### Task List Handler

```typescript
export async function handleTaskList(params: z.infer<typeof taskListSchema>) {
  try {
    // Convert location to workflowStates array
    const workflowStates = params.location 
      ? Array.isArray(params.location) ? params.location : [params.location]
      : undefined;
      
    // Build v2 list options
    const listOptions: v2.TaskListOptions = {
      workflowStates,
      type: params.type,
      status: params.status,
      area: params.area,
      includeArchived: params.include_archived,
      includeParentTasks: params.include_parent_tasks,
      // Custom filters through extensible system
      priority: params.priority,
      assignee: params.assignee,
      tags: params.tags,
    };
    
    // Handle parent_id for subtask listing
    if (params.parent_id) {
      const parent = await v2.getParentTask(params.parent_id);
      if (!parent.success) {
        return formatError(`Parent task not found: ${params.parent_id}`);
      }
      // Return subtasks of parent
      return formatResponse({
        success: true,
        data: parent.data.subtasks,
      });
    }
    
    const result = await v2.listTasks(listOptions);
    return formatResponse(result);
  } catch (error) {
    return formatError(error);
  }
}
```

### Task Update Handler with Section Support

```typescript
export async function handleTaskUpdate(params: z.infer<typeof taskUpdateSchema>) {
  try {
    // Build update options
    const updates: v2.TaskUpdateOptions = {};
    
    if (params.title) updates.title = params.title;
    if (params.frontmatter) updates.frontmatter = params.frontmatter;
    if (params.sections) updates.sections = params.sections;
    
    // Handle add_log_entry convenience
    if (params.add_log_entry) {
      const task = await v2.getTask(params.id, { parentId: params.parent_id });
      if (!task.success) return formatError(task.error);
      
      const currentLog = task.data.document.sections.log || '';
      const timestamp = v2.formatLogTimestamp();
      const newLogEntry = `\n- ${timestamp}: ${params.add_log_entry}`;
      
      updates.sections = {
        ...updates.sections,
        log: currentLog + newLogEntry,
      };
    }
    
    const result = await v2.updateTask(params.id, updates, {
      parentId: params.parent_id,
    });
    
    return formatResponse(result);
  } catch (error) {
    return formatError(error);
  }
}
```

## Architecture Strategy (CRITICAL)

### PROPER MCP PATTERN - Use Handler Functions
The .old file shows the correct pattern. We must use **handlers** not direct core calls:

```typescript
// CORRECT: Use handler functions (like .old file)
// In core-server.ts tool registration:
async (params: z.infer<typeof taskListSchema>) => {
  try {
    const result = await handleTaskList(params);  // ← Handler function
    return result; // Handler already formats for MCP
  } catch (error) {
    return formatError(error);
  }
}

// In handlers.ts:
export async function handleTaskList(params: TaskListParams) {
  const config = params.root_dir ? { tasksDir: params.root_dir } : undefined;
  
  // Convert to V2 list options
  const listOptions: v2.TaskListOptions = { ... };
  const result = await v2.listTasks(projectRoot, listOptions);
  
  // Transform V2 format to MCP format
  return formatV2Response(result);
}
```

**Why handlers are essential:**
1. **MCP-specific parameter handling** (`root_dir` → config mapping)
2. **Parameter transformation** (MCP params → V2 core params)  
3. **Response formatting** (V2 format → MCP format)
4. **Separation of concerns** (MCP logic separate from core business logic)

### File Strategy

1. **Update handlers.ts**: Convert all handlers to use V2 core functions
2. **Update core-server.ts**: Use handler functions, NOT direct core calls
3. **Keep .old files**: As reference until migration complete
4. **Remove methodRegistry**: Dead code causing format issues

### Handler Responsibilities

**Handlers must:**
- Handle `root_dir` parameter properly
- Transform MCP parameters to V2 parameters  
- Call appropriate V2 core functions
- Transform V2 responses to MCP format
- Handle errors consistently

**Core-server.ts must:**
- Register tools with proper Zod schemas
- Call handler functions (not core directly)
- Use proper formatResponse/formatError from .old file

## Implementation Priority Order

### CRITICAL (Must fix first)
1. **Refactor Architecture** - Fix handler pattern to match .old file
2. **Remove V2 Terminology** - Clean user-facing strings  
3. **Remove Legacy Parameters** - No backward compatibility (phase/subdirectory)
4. **Fix Zod Enums** - Restore proper enum definitions

### HIGH (Core functionality failures)  
5. **Fix Core Operations** - Get basic CRUD working
   - task_list filters (area, parent tasks, completed exclusion)
   - task_move (workflow transitions)
   - resequence operation parameter mapping
   - task transformations (promote/extract)

### MEDIUM (Enhanced functionality)
6. **Complete V2 Features**
   - template functions with V2 core
   - task_update V2 section support
   
### LOW (Cleanup)
7. **Remove Dead Code** - methodRegistry after refactor complete

## Current Status (As of 2025-05-28)

**✅ FIXED - Critical Issues:**
- ✅ MCP tool registration pattern - now uses proper handler pattern from .old file
- ✅ Tool registration format error - fixed "no outputSchema" by adding formatResponse() calls  
- ✅ V2 terminology removed - clean user-facing experience (server name, descriptions, etc.)
- ✅ Legacy parameters completely removed - NO phase/subdirectory in schemas or handlers

**🔄 REMAINING - High Priority:**
- ✅ Zod enum definitions improved - leveraging proper MCP enum support, enhanced descriptions
- ❌ Core operations failing in tests (resequence, transform, move, listing filters)

**📋 REMAINING - Medium Priority:**
- ❌ Template functions need V2 core integration
- ❌ Task update V2 section support incomplete
- ❌ methodRegistry cleanup after refactor

## Testing Considerations

1. **Subtask Resolution**: Test with and without parent_id
2. **Filter Combinations**: Test native and custom filters
3. **Error Cases**: Missing tasks, invalid operations
4. **Migration Paths**: Old parameters still work where sensible

## Feature Tool Removal

Since the Task UI will need to adapt to the new parent task concept anyway, we will:

1. **Remove all feature_* tools completely**
2. **No compatibility mapping** - Clean break
3. **Clear error messages** for any attempts to use old tools

```typescript
// Error response for removed feature tools
if (method.startsWith('feature_')) {
  return {
    error: 'Feature tools have been replaced by parent task operations',
    migration: 'Use parent_list, parent_create, or parent_operations instead',
    documentation: 'See MCP v2 migration guide'
  };
}
```

## Open Questions

1. Should feature_* tools remain as permanent aliases or be deprecated with timeline?
2. How to handle workflow operations if removed from CLI?
3. Should we add a `parent_get` tool or is `task_get` sufficient?
4. Do we need bulk operations beyond parent_operations?

## Implementation Checklist

### Phase 1: Cleanup (DELETE operations)
- [ ] Delete handlePhaseList, handlePhaseCreate, handlePhaseUpdate, handlePhaseDelete from handlers.ts
- [ ] Remove PhaseListParams, PhaseCreateParams, etc. from types.ts
- [ ] Remove phase enums from types.ts
- [ ] Update methodRegistry to remove McpMethod.PHASE_* entries

### Phase 2: Update Imports (in-place)
- [ ] Update handlers.ts to import from '../core/v2/index.js'
- [ ] Add v2 types to types.ts imports
- [ ] Keep existing function names

### Phase 3: Update Existing Handlers (in-place)
- [ ] handleTaskList: Add workflow location support, remove phase
- [ ] handleTaskGet: Add parent_id parameter
- [ ] handleTaskCreate: Use location instead of phase
- [ ] handleTaskUpdate: Add section update support
- [ ] handleTaskMove: Update for workflow transitions
- [ ] handleTaskDelete: Add cascade support

### Phase 4: Add New Handlers (same file)
- [ ] Add handleParentList to handlers.ts
- [ ] Add handleParentCreate to handlers.ts  
- [ ] Add handleParentOperations to handlers.ts
- [ ] Add handleTaskTransform to handlers.ts

### Phase 5: Remove Feature Handlers
- [ ] Delete handleFeatureList from handlers.ts
- [ ] Delete handleFeatureGet from handlers.ts
- [ ] Delete handleFeatureCreate from handlers.ts
- [ ] Delete handleFeatureUpdate from handlers.ts
- [ ] Delete handleFeatureDelete from handlers.ts
- [ ] Remove feature types from types.ts
- [ ] Remove McpMethod.FEATURE_* from registry
- [ ] Add error handler for feature_* method calls

### Phase 6: Testing & Documentation
- [ ] Test MCP server by mounting in Claude Desktop
- [ ] Verify all tools appear with correct descriptions
- [ ] Test each tool operation via Claude
- [ ] Update tool descriptions in core-server.ts
- [ ] Add helpful error messages with migration hints
- [ ] Document breaking changes for UI team