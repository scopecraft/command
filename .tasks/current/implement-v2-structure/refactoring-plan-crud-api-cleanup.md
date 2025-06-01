# CRUD API Refactoring Plan

## Objective
Refactor the task management API to use clean CRUD naming conventions and fix architectural inconsistencies that cause bugs with subtask operations.

## Current Issues to Fix

### 1. Inconsistent Parameter Signatures
- `getTask(projectRoot, taskId, config?, parentId?)` ✅ Supports parentId
- `deleteTask(projectRoot, taskId, config?)` ❌ Missing parentId support
- This causes the subtask deletion bug we discovered

### 2. Duplicate Functions
- `addSubtask` exists in both `parent-tasks.ts` and `task-operations.ts`

### 3. Non-Standard Naming
- Functions use `createTask`, `getTask` etc. instead of standard CRUD `create`, `get`

### 4. Mixed Abstraction Levels
- Basic CRUD mixed with parent-specific logic
- No clear builder pattern for parent operations

## Target API Design

### task-crud.ts (Foundation Layer)
```typescript
// Clean CRUD operations with consistent signatures
export async function create(
  projectRoot: string,
  options: TaskCreateOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>>

export async function get(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>>

export async function update(
  projectRoot: string,
  taskId: string,
  updates: TaskUpdateOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>>

export async function delete(
  projectRoot: string,
  taskId: string,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<void>>

export async function move(
  projectRoot: string,
  taskId: string,
  options: TaskMoveOptions,
  config?: ProjectConfig,
  parentId?: string
): Promise<OperationResult<Task>>

export async function list(
  projectRoot: string,
  options?: TaskListOptions,
  config?: ProjectConfig
): Promise<OperationResult<Task[]>>
```

### parent-tasks.ts (Builder Pattern Layer)
```typescript
// Builder pattern for parent-scoped operations
export function parent(projectRoot: string, parentId: string, config?: ProjectConfig) {
  return {
    // CRUD operations scoped to parent
    async create(title: string, options?: SubtaskOptions): Promise<OperationResult<Task>> {
      return create(projectRoot, {...}, config, parentId);
    },
    
    async get(subtaskId?: string): Promise<OperationResult<Task | ParentTask>> {
      if (subtaskId) {
        return get(projectRoot, subtaskId, config, parentId);
      }
      return getParentTask(projectRoot, parentId, config);
    },
    
    async update(updates: TaskUpdateOptions): Promise<OperationResult<Task>> {
      return update(projectRoot, parentId, updates, config);
    },
    
    async delete(cascade = false): Promise<OperationResult<void>> {
      if (cascade) {
        return deleteParentTask(projectRoot, parentId, config);
      }
      throw new Error('Must specify cascade=true to delete parent task');
    },
    
    async list(): Promise<OperationResult<Task[]>> {
      const parent = await getParentTask(projectRoot, parentId, config);
      return { success: true, data: parent.data?.subtasks || [] };
    },
    
    // Parent-specific operations
    async getStats() { /* ... */ },
    async resequence(mapping: SequenceMapping[]) { /* ... */ },
    async parallelize(subtaskIds: string[]) { /* ... */ }
  };
}
```

### task-operations.ts (True Multi-Task Operations Only)
```typescript
// ANALYSIS: Current functions are mostly single-parent operations, not multi-task
// Current: resequenceSubtasks, parallelizeSubtasks, updateSubtaskSequence → Move to parent builder
// Current: promoteToParent, extractSubtask, adoptTask → Move to parent builder  
// Current: addSubtask → Remove (duplicate of parent().create())

// After cleanup, only TRUE multi-task operations remain:
export async function bulkMoveToWorkflow(taskIds: string[], targetWorkflow: WorkflowState)
export async function bulkUpdateStatus(taskIds: string[], status: TaskStatus)
export async function bulkArchive(taskIds: string[], archiveDate?: string)

// NOTE: If no true multi-task operations exist, DELETE this entire file
// Most "operations" are actually parent-scoped and belong in parent builder
```

## Refactoring Steps (Methodical & Incrementally Testable)

### Phase 1: Core CRUD Rename (Foundation)
**Goal**: Rename functions without breaking functionality
**Validation**: Build + existing tests pass

1. **Backup current state**
   ```bash
   git add -A && git commit -m "backup: before CRUD refactoring"
   ```

2. **Use VS Code's rename symbol feature** (see instructions below)
   - One function at a time
   - Compile after each rename to catch issues early

3. **Add missing parentId parameters** to functions that need them
   - Only add parameters, don't change logic yet

4. **Update export statements** in core/index.ts

5. **TEST CHECKPOINT**: 
   ```bash
   npm run build
   npm test
   ```
   **STOP HERE** if any tests fail - fix before proceeding

6. **USER ACTION REQUIRED**: Manual import fixes
   - VS Code may miss some dynamic imports
   - Review and fix any remaining compilation errors
   - **Ask user to confirm**: "All imports fixed and build successful?"

### Phase 2: Update Core Consumers (Layer by Layer)
**Goal**: Update consumers to use new API one layer at a time
**Validation**: Each layer tested before moving to next

#### Phase 2A: Update MCP Layer First
1. **Update normalized-handlers.ts** to use new CRUD names
2. **Update normalized-write-handlers.ts** to use new CRUD names
3. **TEST CHECKPOINT**:
   ```bash
   npm test test/mcp-operations-integration.test.ts
   # OR create simple e2e test script
   ```

#### Phase 2B: Update Parent-Tasks Layer
1. **Update parent-tasks.ts** to use new CRUD functions
2. **TEST CHECKPOINT**:
   ```bash
   npm test test/*parent*.test.ts
   ```

#### Phase 2C: Update CLI Layer  
1. **Update cli/commands.ts** to use new CRUD functions
2. **TEST CHECKPOINT**:
   ```bash
   npm test test/*cli*.test.ts
   # OR manual CLI smoke test
   ```

#### Phase 2D: Update Task-Operations Layer
1. **Update task-operations.ts** to use new CRUD functions (before moving)
2. **TEST CHECKPOINT**:
   ```bash
   npm test test/*operations*.test.ts
   ```

### Phase 3: Builder Pattern Implementation (Clean Architecture)
**Goal**: Replace old architecture with clean builder pattern
**Validation**: New API works correctly, old functions removed

#### Phase 3A: Create Builder (Clean Implementation)
1. **Create parent() builder function** in parent-tasks.ts
   - Implement clean builder API
   - No need to keep old functions - go straight to clean architecture
2. **TEST CHECKPOINT**:
   ```bash
   # Test that new builder API works
   npm test
   ```

#### Phase 3B: Replace Operations with Builder Methods (Clean Transition)
1. **Replace resequenceSubtasks** with parent().resequence()
   - Delete old function, implement builder method
   - **TEST**: Verify resequence works via MCP with new API
2. **Replace parallelizeSubtasks** with parent().parallelize()  
   - Delete old function, implement builder method
   - **TEST**: Verify parallelize works via MCP with new API
3. **Replace other operations** one by one - delete old, implement new, test each

#### Phase 3C: Update MCP to Use Builder
1. **Update MCP handlers** to use builder for parent operations
2. **TEST CHECKPOINT**:
   ```bash
   npm test test/mcp-operations-integration.test.ts
   # Test all MCP parent operations work
   ```

### Phase 4: File Cleanup (Safe Deletion)
**Goal**: Remove duplicate/obsolete code safely
**Validation**: No references to deleted code remain

1. **Remove duplicate addSubtask** from task-operations.ts
2. **Search for remaining task-operations.ts usage**:
   ```bash
   rg "task-operations" --type ts
   ```
3. **If no usage found**: DELETE task-operations.ts
4. **Update core/index.ts exports** (remove task-operations exports)
5. **TEST CHECKPOINT**:
   ```bash
   npm run build
   npm test
   ```

### Phase 5: End-to-End Validation
**Goal**: Verify all original bugs are fixed
**Validation**: Comprehensive testing of problem scenarios

1. **Create/Run E2E Test Script**:
   ```bash
   # Option A: Enhance existing test
   npm test test/mcp-operations-integration.test.ts
   
   # Option B: Create new e2e script
   node scripts/test-crud-refactoring.js
   ```

2. **Manual Bug Validation**:
   - [ ] MCP subtask creation works (creates in parent folder)
   - [ ] MCP subtask deletion works (no parent folder error)
   - [ ] MCP parent resequence works  
   - [ ] CLI operations still work
   - [ ] All tests pass

3. **Performance/Regression Check**:
   ```bash
   npm run build
   npm test
   npm run code-check
   ```

## VS Code Refactoring Instructions

### Step 1: Rename createTask to create
1. Open `src/core/task-crud.ts`
2. Right-click on the `createTask` function name (line ~49)
3. Select "Rename Symbol" (or press F2)
4. Type `create` and press Enter
5. VS Code will show a preview of all changes
6. Click "Apply" to rename across entire codebase

### Step 2: Rename getTask to get
1. Right-click on `getTask` function name (line ~137)
2. Select "Rename Symbol" (F2)
3. Type `get` and press Enter
4. Apply changes

### Step 3: Rename updateTask to update
1. Right-click on `updateTask` function name (line ~252)
2. Select "Rename Symbol" (F2)
3. Type `update` and press Enter
4. Apply changes

### Step 4: Rename deleteTask to delete
1. Right-click on `deleteTask` function name (line ~360)
2. Select "Rename Symbol" (F2)
3. Type `delete` and press Enter
4. Apply changes

### Step 5: Rename moveTask to move
1. Right-click on `moveTask` function name (line ~400)
2. Select "Rename Symbol" (F2)
3. Type `move` and press Enter
4. Apply changes

### Step 6: Rename listTasks to list
1. Right-click on `listTasks` function name (line ~488)
2. Select "Rename Symbol" (F2)
3. Type `list` and press Enter
4. Apply changes

### Step 7: Update Export Statements
1. Open `src/core/index.ts`
2. Find the task-crud exports (around line 81-89)
3. Update them to the clean new names:
```typescript
export {
  create,
  get,
  update,
  delete,
  move,
  list,
  updateSection as updateTaskSection,
} from './task-crud.js';
```

### Step 8: Compile and Test
```bash
npm run build
npm test
```

## Expected Issues and Solutions

### Issue 1: 'delete' is a reserved word
**Solution**: Use bracket notation for imports if needed:
```typescript
import { delete as deleteTask } from './task-crud.js';
```

### Issue 2: Some dynamic calls might break
**Solution**: Search for string-based function calls:
```bash
rg "createTask|getTask|updateTask|deleteTask" --type ts
```

### Issue 3: Tests using old function names
**Solution**: Update test files with the same VS Code rename process

## Validation Checklist

After refactoring, verify these scenarios work:

### Basic CRUD Operations
- [ ] Create simple task: `create(projectRoot, options)`
- [ ] Create subtask: `create(projectRoot, options, config, parentId)`
- [ ] Get simple task: `get(projectRoot, taskId)`
- [ ] Get subtask: `get(projectRoot, subtaskId, config, parentId)`
- [ ] Update task: `update(projectRoot, taskId, updates)`
- [ ] Delete simple task: `delete(projectRoot, taskId)`
- [ ] Delete subtask: `delete(projectRoot, subtaskId, config, parentId)`

### Parent Builder Pattern
- [ ] Create subtask: `parent(projectRoot, parentId).create(title)`
- [ ] Get parent: `parent(projectRoot, parentId).get()`
- [ ] Get subtask: `parent(projectRoot, parentId).get(subtaskId)`
- [ ] List subtasks: `parent(projectRoot, parentId).list()`
- [ ] Delete parent: `parent(projectRoot, parentId).delete(cascade: true)`

### MCP Integration  
- [ ] MCP task_create with parent_id creates subtask
- [ ] MCP task_delete with parent_id deletes subtask
- [ ] MCP parent_operations resequence works
- [ ] MCP task_create without parent_id creates simple task

### Original Bug Fixes
- [ ] Subtask creation via MCP now works (was creating simple tasks)
- [ ] Subtask deletion via MCP now works (was failing with parent folder error)
- [ ] Parent operations resequence works (was failing with field naming)

## Benefits After Refactoring

1. **Consistent API**: All CRUD operations have same signature pattern
2. **Bug-free subtask operations**: Proper parentId handling throughout
3. **Better discoverability**: Builder pattern makes parent operations obvious
4. **Cleaner architecture**: Clear separation between CRUD, parent ops, and multi-task orchestration
5. **Standard naming**: Industry-standard CRUD vocabulary
6. **Future-proof**: Easy to extend with new operations following established patterns

## File Cleanup Analysis

### Files to Potentially DELETE:
- **task-operations.ts**: All current functions are single-parent operations, not true multi-task
  - If no true multi-task operations remain after moving to parent builder → DELETE
  - Remove from core/index.ts exports
  - Remove from CLI/MCP imports

### Files to SIGNIFICANTLY MODIFY:
- **task-crud.ts**: Rename all functions, add parentId params
- **parent-tasks.ts**: Add builder pattern, move operations from task-operations.ts
- **core/index.ts**: Update all exports
- **MCP handlers**: Use new API throughout
- **CLI commands**: Use new API throughout

## Timeline Estimate (Methodical Approach)

- **Phase 1** (Core CRUD rename + testing): 1 hour
  - Including git backup, VS Code renames, build testing, user confirmation
- **Phase 2** (Layer-by-layer consumer updates): 2.5 hours
  - 2A: MCP layer (30 min) + testing (15 min)
  - 2B: Parent-tasks layer (30 min) + testing (15 min)  
  - 2C: CLI layer (30 min) + testing (15 min)
  - 2D: Task-operations layer (30 min) + testing (15 min)
- **Phase 3** (Builder pattern implementation): 2 hours
  - 3A: Create builder (30 min) + testing (15 min)
  - 3B: Move operations one-by-one (60 min) + testing per operation
  - 3C: Update MCP handlers (30 min) + testing (15 min)
- **Phase 4** (File cleanup): 30 minutes
  - Safe deletion with usage checking
- **Phase 5** (E2E validation): 1 hour
  - Comprehensive testing of original bugs + regression check
- **Total**: ~7 hours (includes testing time and user confirmation steps)

**Benefits of methodical approach**:
- Early detection of issues (fail fast)
- Easier rollback (smaller commits)
- User involvement at key checkpoints
- Confidence in each step before proceeding

## Risk Mitigation

1. **Use VS Code rename** instead of manual find/replace (safer)
2. **Incremental approach** - one function at a time
3. **Clean exports** - no deprecated functions, clean API only
4. **Comprehensive testing** after each phase
5. **Git commits** after each successful phase for easy rollback