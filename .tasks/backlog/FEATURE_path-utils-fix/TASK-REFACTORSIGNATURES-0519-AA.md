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

### 🔲 Remaining Work - Signature Updates

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

For CLI, the config comes from the global context:
```typescript
const config = projectConfig.getRuntimeConfig(); // Or similar
```

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
