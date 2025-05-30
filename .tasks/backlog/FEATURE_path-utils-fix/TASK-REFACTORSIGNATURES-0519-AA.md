+++
id = "TASK-REFACTORSIGNATURES-0519-AA"
title = "Refactor All CRUD Operations to Options Pattern"
type = "refactor"
status = "🟢 Done"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
subdirectory = "FEATURE_path-utils-fix"
parent_task = "path-utils-fix"
depends_on = [ "FEAT-FIXPATH-0519-JY" ]
tags = [ "AREA:core", "refactoring", "api-design" ]
+++

# Refactor All CRUD Operations to Options Pattern

Complete refactoring of all CRUD operations across the codebase to use the options object pattern for better extensibility, runtime config support, and consistency.

## Status: ✅ Nearly Complete

### ✅ Completed

1. **Core CRUD Refactoring** (Steps 1-7)
   - All task CRUD operations refactored
   - All feature CRUD operations refactored
   - All area CRUD operations refactored
   - All phase CRUD operations refactored
   - Auxiliary functions updated (relationships, move, workflow)
   - Template manager updated
   - Interface updates completed

2. **Tests for CRUD Layer**
   - Created comprehensive test suite for all refactored functions
   - Fixed runtime config propagation in ProjectConfig
   - All 17 tests passing

3. **CLI Task Commands Updated**
   - Updated all task commands to use new signatures
   - Removed references to getRuntimeConfig (doesn't exist)
   - Fixed bug in task-crud.ts (config reference)
   - All task operations now working properly

4. **MCP Task Handlers Updated**
   - Updated handleTaskCreate to use options pattern
   - Updated handleTaskUpdate to use options pattern
   - Updated handleTaskDelete to use options pattern
   - Updated handleTaskNext to use options pattern
   - Updated handleWorkflowMarkCompleteNext to use options pattern
   - All MCP task operations now using new signatures

5. **Feature Entity Updated**
   - Updated all Feature CLI commands to use options pattern
   - Updated all Feature MCP handlers to use options pattern
   - Added E2E tests for all Feature CRUD operations

6. **Area Entity Updated**
   - Updated all Area CLI commands to use options pattern
   - Updated all Area MCP handlers to use options pattern
   - Added E2E tests for all Area CRUD operations

7. **Phase Entity Updated**
   - Updated all Phase CLI commands to use options pattern
   - Updated all Phase MCP handlers to use options pattern
   - Added E2E tests for all Phase CRUD operations
   - Fixed missing message properties in CLI output

8. **Comprehensive E2E Test Suite**
   - Created complete test coverage for all entities
   - Fixed missing message properties in command outputs
   - All tests passing successfully

## Important Discoveries and Learnings

### Key Issues Found During Implementation

1. **ProjectMode Enum Removal**
   - The ProjectMode enum was removed in a prior refactor but was still being imported by MCP CLI files
   - Had to remove all references from `src/mcp/cli.ts` and `src/mcp/stdio-cli.ts`
   - Mode detection is now handled automatically by ConfigurationManager

2. **No getRuntimeConfig Method**
   - ProjectConfig doesn't have a `getRuntimeConfig()` method
   - Runtime config is passed through options but not available in CLI layer
   - For now, pass undefined and let internal logic handle root resolution

3. **Bug in createTask**
   - Found reference to undefined `config` variable instead of `options?.config`
   - Fixed in `src/core/task-manager/task-crud.ts` line 236

4. **Missing Message in updateTask**
   - updateTask was returning `{ success: true, data: task }` without a message
   - CLI commands expected a message property
   - Added `message: 'Task ${id} updated successfully'` to success response

5. **listTasks Signature**
   - listTasks uses a filter options object that includes config
   - Pattern: `listTasks({ status, type, phase, subdirectory, config })`
   - Don't need to wrap in another options object

6. **Test Considerations**
   - E2E tests can have ordering dependencies
   - Test failures may be due to state changes from previous tests
   - Always verify the actual cause of failures before assuming bugs

7. **Pattern for CLI Commands**
   - Don't need to get config: `const config = projectConfig.getRuntimeConfig();`
   - Just pass options without config: `createTask(task, { subdirectory })`
   - The CRUD layer will handle config resolution internally

8. **Phase Commands Missing Messages**
   - createPhase and updatePhase don't return message properties
   - CLI commands need to provide fallback messages
   - Fixed by adding: `result.message || \`Phase ${id} created successfully\``

## E2E Test Coverage Checklist

### Task Entity ✅
- [x] Create - tested (multiple scenarios)
- [x] List - tested (with filters)
- [x] Get - tested
- [x] Update - tested
- [x] Delete - tested (indirect through subdirectory operations)

### Feature Entity ✅
- [x] Create - tested
- [x] List - tested
- [x] Get - tested
- [x] Update - tested
- [x] Delete - tested with force

### Area Entity ✅
- [x] Create - tested
- [x] List - tested
- [x] Get - tested
- [x] Update - tested
- [x] Delete - tested with force

### Phase Entity ✅
- [x] Create - tested
- [x] List - tested
- [x] Get - N/A (phases don't have get command)
- [x] Update - tested
- [x] Delete - tested with force

### ✅ Refactoring Complete

All major refactoring work is complete:
- ✅ All CRUD operations refactored to options pattern
- ✅ All CLI commands updated to use new signatures
- ✅ All MCP handlers updated to use new signatures
- ✅ Helper functions (findNextTask) updated to use options pattern
- ✅ Comprehensive tests added for CRUD layer
- ✅ TypeScript compilation passes successfully

### 🔲 Remaining Work

All main tasks completed:
- ✅ Review CLI command help text to ensure --root-dir documentation is present
- ✅ Support the path option in the API layer (MCP handlers and parameter interfaces)
- ✅ Added comprehensive root_dir support across all MCP handlers
- ✅ Updated all MCP parameter interfaces with root_dir property

Additional tasks that could be done in a future iteration:
- Add comprehensive E2E tests for --root-dir functionality to test/run-root-dir-e2e.sh

**Note**: MCP types do not need config/root parameters as the MCP server handles configuration internally at the server level.

## Clear Instructions for Updating Callers

### 1. CLI Command Updates (src/cli/)

For each command, replace positional parameters with options objects:

#### Task Commands
```typescript
// OLD: createTask(task, subdirectory, config)
// NEW: createTask(task, { subdirectory, config })

// OLD: updateTask(id, updates, phase, subdirectory)
// NEW: updateTask(id, updates, { phase, subdirectory, config })

// OLD: deleteTask(id, phase, subdirectory)
// NEW: deleteTask(id, { phase, subdirectory, config })

// OLD: getTask(id, phase, subdirectory)
// NEW: getTask(id, { phase, subdirectory, config })
```

#### Feature Commands
```typescript
// OLD: createFeature(name, title, phase, type, description, assignee, tags)
// NEW: createFeature(name, { title, phase, type, description, assignee, tags, config })

// OLD: updateFeature(id, updates, phase)
// NEW: updateFeature(id, updates, { phase, config })

// OLD: deleteFeature(id, phase, force)
// NEW: deleteFeature(id, { phase, force, config })

// OLD: getFeature(id, phase)
// NEW: getFeature(id, { phase, config })
```

#### Area Commands
```typescript
// OLD: createArea(name, title, phase, type, description, assignee, tags)
// NEW: createArea(name, { title, phase, type, description, assignee, tags, config })

// OLD: updateArea(id, updates, phase)
// NEW: updateArea(id, updates, { phase, config })

// OLD: deleteArea(id, phase, force)
// NEW: deleteArea(id, { phase, force, config })

// OLD: getArea(id, phase)
// NEW: getArea(id, { phase, config })
```

#### Phase Commands
```typescript
// OLD: createPhase(phase)
// NEW: createPhase(phase, { config })

// OLD: updatePhase(id, updates)
// NEW: updatePhase(id, updates, { config })

// OLD: deletePhase(id, { force })
// NEW: deletePhase(id, { force, config })

// OLD: listPhases()
// NEW: listPhases({ config })
```

#### Helper Functions
```typescript
// OLD: findNextTask(taskId)
// NEW: findNextTask(taskId, { config })

// OLD: updateRelationships(task)
// NEW: updateRelationships(task, { config })
```

### 2. MCP Handler Updates (src/mcp/handlers.ts)

Similar pattern - wrap parameters in options objects. The MCP handlers typically get parameters from args object.

### 3. Test Updates

Any existing tests that call these functions need the same signature updates.

### 4. Config Parameter

For CLI commands - DO NOT pass config parameter:
```typescript
// Don't do this:
// const config = projectConfig.getRuntimeConfig();  // This method doesn't exist

// Do this instead - pass options without config:
const result = await createTask(task, { subdirectory });
const result = await updateTask(id, updates, { phase, subdirectory });
```

The CRUD functions handle config resolution internally.

### Example CLI Update

```typescript
// Before:
export async function createTaskCommand(title: string, options: any) {
  const task = { metadata: { title, ...options } };
  const result = await createTask(task, options.subdirectory);
  // ...
}

// After:
export async function createTaskCommand(title: string, options: any) {
  const config = getConfigFromContext(); // Get runtime config
  const task = { metadata: { title, ...options } };
  const result = await createTask(task, { 
    subdirectory: options.subdirectory,
    config 
  });
  // ...
}
```

## Key Points

1. **Minimal Changes**: Just wrap parameters in options objects
2. **Config Addition**: Add config from context to all calls
3. **Preserve Logic**: No business logic changes needed
4. **Type Safety**: TypeScript will guide the changes

## Testing Strategy

1. Run TypeScript compiler to find all places that need updates
2. Update each caller one by one
3. Run existing tests to ensure nothing breaks
4. Add E2E tests for --root-dir functionality

## Commits

- 9672bfb: Refactor all CRUD operations to use options pattern
- dd26675: Fix runtime config propagation and add comprehensive CRUD tests
- d3f6eec: Update task commands to use options pattern for runtime config
- 20864e5: Update MCP task handlers to use options pattern
- 1dce2c3: Update Feature CLI commands and MCP handlers to use options pattern
- 1c947e6: Update Area CLI commands and MCP handlers to use options pattern
- 8affdc3: Update E2E tests for Feature and Area operations
- 87e0de0: Update Phase CLI commands and MCP handlers to use options pattern
- ca4729f: Update refactoring task to reflect completion of all entity updates
- b60a361: Add comprehensive E2E tests for all CRUD operations and fix missing messages
