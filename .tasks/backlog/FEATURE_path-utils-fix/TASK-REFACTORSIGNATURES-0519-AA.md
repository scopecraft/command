+++
id = "TASK-REFACTORSIGNATURES-0519-AA"
title = "Refactor All CRUD Operations to Options Pattern"
type = "refactor"
status = "🔵 In Progress"
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

## Status: In Progress

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

### 🔲 Remaining Work - Signature Updates for Other Entities

Still need to update signatures for:
- Feature CLI commands (createFeature, updateFeature, deleteFeature, getFeature)
- Feature MCP handlers 
- Area CLI commands (createArea, updateArea, deleteArea, getArea)  
- Area MCP handlers
- Phase CLI commands (createPhase, updatePhase, deletePhase, listPhases)
- Phase MCP handlers
- Helper functions (updateRelationships)
- Tests that use any of these functions

**IMPORTANT NOTE**: After completing all entity updates, we need to add config/root parameters to all MCP parameter types (TaskCreateParams, TaskUpdateParams, etc.) so MCP clients can pass runtime configuration through the MCP interface.

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
