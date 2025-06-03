# Clean up UI components after API normalization

---
type: chore
status: Done
area: ui
assignee: null
tags:
  - refactoring
  - cleanup
  - v2
priority: High
parent: implement-v2-structure
---


## Instruction
# 🎉 MCP API Response Consistency - COMPLETE!

**Status: ✅ READY FOR UI INTEGRATION**

The MCP API response consistency issues have been fully resolved. All 4 core endpoints now return normalized, consistent responses with clean schemas. The UI can now consume a predictable API structure across all task operations.

## Tasks
### Phase 1: Update Type Definitions
- [ ] Update `/src/lib/types.ts` to match new normalized API response
- [ ] Remove duplicate field definitions (workflow vs workflow_state)
- [ ] Create single Task interface that works for all endpoints
- [ ] Remove complex type unions and conditional types

### Phase 2: Clean Data Access Components
- [ ] **TaskTypeIcon** (`/src/components/v2/TaskTypeIcon.tsx`)
  - [ ] Remove `extractTaskType()` function
  - [ ] Accept simple `type` prop instead of analyzing task object
  - [ ] Remove all deep property checks
- [ ] **ParentTaskListView** (`/src/components/v2/ParentTaskListView.tsx`)
  - [ ] Remove complex data mapping in `useMemo` (lines 39-69)
  - [ ] Remove all normalization helper functions
  - [ ] Pass data directly to TaskTable
- [ ] **TaskManagementView** (`/src/components/v2/TaskManagementView.tsx`)
  - [ ] Remove data normalization in `useMemo` (lines 37-59)
  - [ ] Remove helper functions (normalizeStatus, normalizeWorkflow, normalizeType)
  - [ ] Simplify metadata extraction
- [ ] **TaskTable** (`/src/components/v2/TaskTable.tsx`)
  - [ ] Remove workflow field fallbacks
  - [ ] Simplify subtask detection logic
  - [ ] Clean up parent task checks
- [ ] **Sidebar** (`/src/components/v2/Sidebar.tsx`)
  - [ ] Remove `normalizeTaskType()` function
  - [ ] Simplify recent tasks mapping
  - [ ] Remove metadata extraction

### Phase 3: Update Route Components
- [ ] `/src/routes/tasks/index.tsx` - Simplified data handling
- [ ] `/src/routes/tasks/$taskId.tsx` - Remove content extraction, simplify parent detection
- [ ] `/src/routes/parents/index.tsx` - Direct data passing
- [ ] `/src/routes/parents/$parentId.tsx` - Cleaner document handling

### Phase 4: Clean API Hooks
- [ ] Update `/src/lib/api/hooks.ts` if any client-side transformation needed
- [ ] Simplify `useRecentTasks` sorting logic
- [ ] Remove complex data access patterns

### Phase 5: Remove Utilities
- [ ] Delete any data transformation utilities that are no longer needed
- [ ] Update or remove task routing utilities if they do type detection

### Phase 6: Testing & Verification
- [ ] Update all mock data in tests to use normalized format
- [ ] Update Storybook stories with new data structure
- [ ] Verify all features still work correctly
- [ ] Run full test suite

## Deliverable
### Completed Cleanup
- All components simplified to work with normalized data
- No more deep property access or fallback chains
- Single source of truth for data structure
- Cleaner, more maintainable codebase

### Code Quality Improvements
- ~40-50% reduction in component complexity
- Better TypeScript inference
- Elimination of `any` types
- Consistent data access patterns

### Documentation
- Updated component prop documentation
- Updated README with new data structure
- Migration notes for any breaking changes

### Specific Metrics
- Remove all instances of:
  - `task.metadata?.field` patterns
  - `task.document?.frontmatter` access
  - Multiple field name checks (`workflow` vs `workflow_state`)
  - Complex parent task detection logic
  - Type emoji stripping code

## Log
- 2025-05-30: Task created to track UI cleanup work after API normalization is complete. Detailed cleanup plan documented based on current implementation analysis.
- 2025-05-30: 2025-05-30: 🎉 MCP API NORMALIZATION COMPLETE! Added comprehensive integration guide with Zod schemas location, API changes, and specific examples for UI team integration.

## Key benefits for task ui
### 🎯 **Consistent Data Structure**
- **Single format** across all endpoints (no more nested vs flat inconsistencies)
- **Discriminated unions** with `taskStructure` field for reliable task type detection
- **Predictable response envelope** with consistent metadata

### 🔧 **Ready-to-Use Zod Schemas**
- **No need to reimplement typing** - use our Zod schemas directly
- **Runtime validation** included
- **TypeScript types** auto-generated from schemas

### 🧹 **Clean Data**
- **No emoji prefixes** in API responses (`"feature"` not `"🌟 Feature"`)
- **Consistent field names** (`workflowState` not `location`, `assignee` not `assigned_to`)
- **Normalized enums** across all endpoints

## Api changes summary
### Before vs After

**OLD (Inconsistent):**
```typescript
// task_list returned nested structure
{
  metadata: { id: "...", isParentTask: true },
  document: { frontmatter: { type: feature, status: "To Do" } }
}

// parent_list returned flat structure  
{
  id: "...", 
  type: "parent_task",
  progress: { done: 2, total: 5 }  // Only in parent_list!
}
```

**NEW (Consistent):**
```typescript
// All endpoints return normalized structure
{
  id: "task-id",
  title: "Task Title", 
  taskStructure: "parent" | "simple" | "subtask",  // Single source of truth!
  type: "feature",          // Clean enum, no emojis
  status: "todo",           // Normalized
  workflowState: "current", // Consistent naming
  assignee: "username",     // Consistent naming
  progress: {               // Available for all parent tasks
    total: 5,
    completed: 2, 
    percentage: 40
  }
}
```

## 📁 zod schemas for ui integration
### **Location: `src/mcp/schemas.ts`**

**Import the schemas directly in your UI:**

```typescript
import { 
  TaskSchema,           // Union of all task types
  SimpleTaskSchema,     // Standalone tasks
  SubTaskSchema,        // Tasks within parents  
  ParentTaskSchema,     // Parent tasks with subtasks
  ParentTaskDetailSchema, // Full parent with all subtasks
  // Input schemas for API calls
  TaskListInputSchema,
  TaskGetInputSchema,
  ParentListInputSchema,
  ParentGetInputSchema
} from '../../../src/mcp/schemas.js';

// TypeScript types auto-generated
type Task = z.infer<typeof TaskSchema>;
type SimpleTask = z.infer<typeof SimpleTaskSchema>;
type ParentTask = z.infer<typeof ParentTaskSchema>;
```

### **Key Schema Features:**

**1. Discriminated Union for Task Detection:**
```typescript
// No more checking 5 different properties!
if (task.taskStructure === 'parent') {
  // It's a parent task, has progress and subtaskIds
  console.log(`Progress: ${task.progress.completed}/${task.progress.total}`);
} else if (task.taskStructure === 'subtask') {
  // It's a subtask, has parentId and sequenceNumber
  console.log(`Parent: ${task.parentId}, Sequence: ${task.sequenceNumber}`);
} else {
  // It's a simple standalone task
  console.log('Standalone task');
}
```

**2. Clean Enum Values:**
```typescript
// Before: "🌟 Feature" 
// After: "feature"
const cleanType = task.type; // "feature" | "bug" | "chore" | "documentation" | "test" | "spike"

// Before: "To Do"
// After: "todo" 
const cleanStatus = task.status; // "todo" | "in_progress" | "done" | "blocked" | "archived"
```

**3. Consistent Field Names:**
```typescript
// Before: task.metadata.location.workflowState vs task.location
// After: Always task.workflowState
const location = task.workflowState; // "backlog" | "current" | "archive"

// Before: task.assigned_to vs task.assignee
// After: Always task.assignee  
const assignee = task.assignee; // string | undefined
```

## Api endpoint changes
### **All endpoints now return consistent structure:**

**`task_list`** - List tasks with filtering
```typescript
// Input validation with Zod
const params = TaskListInputSchema.parse({
  location: ["current", "backlog"], 
  task_type: "top-level",
  include_content: false
});

// Response: Task[] with consistent structure
```

**`task_get`** - Get single task details  
```typescript
const params = TaskGetInputSchema.parse({
  id: "task-id",
  parent_id: "parent-id", // For subtasks
  format: "full"
});

// Response: Task with full content
```

**`parent_list`** - List parent tasks
```typescript  
const params = ParentListInputSchema.parse({
  location: "current",
  include_progress: true,
  include_subtasks: false
});

// Response: ParentTask[] with progress data
```

**`parent_get`** - Get parent with all subtasks
```typescript
const params = ParentGetInputSchema.parse({
  id: "parent-task-id"
});

// Response: ParentTaskDetail with all subtasks included
```

## Integration guide for ui team
### 1. **Replace Mock Data**
Your mock data in `task-ui-2/src/lib/api/mock-data-v2.ts` can now match the real API structure exactly.

### 2. **Update API Client** 
```typescript
// Use Zod schemas for validation
import { TaskSchema } from '../../../src/mcp/schemas.js';

const response = await fetch('/api/task_list', { 
  method: 'POST',
  body: JSON.stringify({ location: "current" })
});

const data = await response.json();
// Validate with Zod
const tasks = data.data.map(task => TaskSchema.parse(task));
```

### 3. **Simplify Component Logic**
```typescript
// Before: Complex parent detection
const isParent = task.metadata?.isParentTask || 
                task.type === 'parent_task' || 
                task.subtasks?.length > 0 || 
                task.task_type === 'parent';

// After: Simple discriminated union
const isParent = task.taskStructure === 'parent';
```

### 4. **Progress Display**
```typescript
// Before: Progress only available in parent_list
// After: Always available for parent tasks
{task.taskStructure === 'parent' && (
  <div>Progress: {task.progress.completed}/{task.progress.total}</div>
)}
```

## Files changed in mcp implementation
**New Files Created:**
- `src/mcp/schemas.ts` - **Zod schemas for UI to import**
- `src/mcp/transformers.ts` - Transformation utilities
- `src/mcp/normalized-handlers.ts` - New consistent handlers
- `src/mcp/output-schemas.ts` - JSON Schema generation

**Updated Files:**
- `src/mcp/handlers.ts` - Method registry updated
- `src/mcp/core-server.ts` - Using normalized handlers

## Validation & testing status
✅ **Tested in MCP Inspector** - Both `parent_list` and `parent_get` working  
✅ **Zod validation** - Runtime schema validation working  
✅ **Null handling** - Fixed assignee null/undefined issue  
✅ **Integration** - Core server properly using normalized handlers  

---

# UI Cleanup Tasks (Updated)

Now that the API normalization is complete, here's what needs to be updated in the UI components:
