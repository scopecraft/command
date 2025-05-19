+++
id = "TASK-REFACTORSIGNATURES-0519-AA"
title = "Refactor All CRUD Operations to Options Pattern"
type = "refactor"
status = "📋 Ready to Start"
priority = "🔼 High"
created_date = "2025-05-19"
updated_date = "2025-05-19"
assigned_to = ""
phase = "backlog"
subdirectory = "FEATURE_path-utils-fix"
parent_task = "path-utils-fix"
depends_on = ["FEAT-FIXPATH-0519-JY"]
tags = ["AREA:core", "refactoring", "api-design"]
+++

# Refactor All CRUD Operations to Options Pattern

Complete refactoring of all CRUD operations across the codebase to use the options object pattern for better extensibility, runtime config support, and consistency.

## Context

During the implementation of FEAT-FIXPATH-0519-JY, we discovered that CRUD operations have mixed parameter patterns. Some functions use positional parameters while others use options objects, and many are missing runtime config support. This task documents all functions that need refactoring to ensure consistent API design.

### Update: Directory Utilities Now Complete

As part of FEAT-FIXPATH-0519-JY, we've completed the implementation of comprehensive directory utilities in `src/core/task-manager/directory-utils.ts`. These utilities should be used throughout the CRUD refactoring:

- **Phase utilities**: `getPhaseDirectory()`, `listPhaseDirectories()`, `phaseExists()`
- **Subdirectory utilities**: `isFeatureDirectory()`, `isAreaDirectory()`, `listSubdirectories()`, `subdirectoryExists()`
- **System directory utilities**: `getTemplatesDirectory()`, `getConfigDirectory()`, `isSystemDirectory()`
- **Path utilities**: `getFilePath()`, `getOverviewFilePath()`, `isOverviewFile()`
- **Name utilities**: `toSafeDirectoryName()`, `extractNameFromDirectory()`

All these functions properly handle runtime config propagation, which should be leveraged during the refactoring.

## Complete List of Functions to Refactor

### 1. Task CRUD Operations (src/core/task-manager/task-crud.ts)

#### ✅ listTasks - Already uses options pattern
```typescript
// Current signature - NO CHANGE NEEDED
export async function listTasks(options: TaskFilterOptions = {}): Promise<OperationResult<Task[]>>
```

#### ✅ getTask - Already refactored
```typescript
// Current signature (refactored in FEAT-FIXPATH-0519-JY)
export async function getTask(
  id: string,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>>
```

#### ❌ createTask - Needs refactoring
```typescript
// Current signature
export async function createTask(
  task: Task,
  subdirectory?: string,
  config?: RuntimeConfig
): Promise<OperationResult<Task>>

// Proposed signature
export async function createTask(
  task: Task,
  options?: {
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>>
```

#### ❌ updateTask - Needs refactoring
```typescript
// Current signature
export async function updateTask(
  id: string,
  updates: TaskUpdateOptions,
  phase?: string,
  subdirectory?: string
): Promise<OperationResult<Task>>

// Proposed signature
export async function updateTask(
  id: string,
  updates: TaskUpdateOptions,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task>>
```

#### ❌ deleteTask - Needs refactoring
```typescript
// Current signature
export async function deleteTask(
  id: string,
  phase?: string,
  subdirectory?: string
): Promise<OperationResult<void>>

// Proposed signature
export async function deleteTask(
  id: string,
  options?: {
    phase?: string;
    subdirectory?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>>
```

### 2. Phase CRUD Operations (src/core/task-manager/phase-crud.ts)

#### ❌ listPhases - Needs runtime config
```typescript
// Current signature
export async function listPhases(): Promise<OperationResult<Phase[]>>

// Proposed signature
export async function listPhases(
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Phase[]>>
```

#### ❌ createPhase - Needs runtime config
```typescript
// Current signature
export async function createPhase(phase: Phase): Promise<OperationResult<Phase>>

// Proposed signature
export async function createPhase(
  phase: Phase,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Phase>>
```

#### ❌ updatePhase - Needs runtime config
```typescript
// Current signature
export async function updatePhase(
  id: string,
  updates: Partial<Phase>
): Promise<OperationResult<Phase>>

// Proposed signature
export async function updatePhase(
  id: string,
  updates: Partial<Phase>,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Phase>>
```

#### ❌ deletePhase - Needs runtime config
```typescript
// Current signature
export async function deletePhase(
  id: string,
  force = false
): Promise<OperationResult<void>>

// Proposed signature
export async function deletePhase(
  id: string,
  options?: {
    force?: boolean;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>>
```

### 3. Feature CRUD Operations (src/core/task-manager/feature-crud.ts)

#### ❌ listFeatures - Needs runtime config in options
```typescript
// Current signature
export async function listFeatures(
  options: FeatureFilterOptions = {}
): Promise<OperationResult<Feature[]>>

// Note: FeatureFilterOptions interface needs to include config?: RuntimeConfig
```

#### ❌ getFeature - Needs refactoring
```typescript
// Current signature
export async function getFeature(id: string, phase?: string): Promise<OperationResult<Feature>>

// Proposed signature
export async function getFeature(
  id: string,
  options?: {
    phase?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Feature>>
```

#### ❌ createFeature - Needs major refactoring
```typescript
// Current signature - too many parameters
export async function createFeature(
  name: string,
  title: string,
  phase: string,
  type = '🌟 Feature',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Feature>>

// Proposed signature
export async function createFeature(
  name: string,
  options: {
    title: string;
    phase: string;
    type?: string;
    description?: string;
    assignee?: string;
    tags?: string[];
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Feature>>
```

#### ❌ updateFeature - Needs refactoring
```typescript
// Current signature
export async function updateFeature(
  id: string,
  updates: FeatureUpdateOptions,
  phase?: string
): Promise<OperationResult<Feature>>

// Proposed signature
export async function updateFeature(
  id: string,
  updates: FeatureUpdateOptions,
  options?: {
    phase?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Feature>>
```

#### ❌ deleteFeature - Needs refactoring
```typescript
// Current signature
export async function deleteFeature(
  id: string,
  phase?: string,
  force = false
): Promise<OperationResult<void>>

// Proposed signature
export async function deleteFeature(
  id: string,
  options?: {
    phase?: string;
    force?: boolean;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>>
```

### 4. Area CRUD Operations (src/core/task-manager/area-crud.ts)

#### ❌ listAreas - Needs runtime config in options
```typescript
// Current signature
export async function listAreas(options: AreaFilterOptions = {}): Promise<OperationResult<Area[]>>

// Note: AreaFilterOptions interface needs to include config?: RuntimeConfig
```

#### ❌ getArea - Needs refactoring
```typescript
// Current signature
export async function getArea(id: string, phase?: string): Promise<OperationResult<Area>>

// Proposed signature
export async function getArea(
  id: string,
  options?: {
    phase?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Area>>
```

#### ❌ createArea - Needs major refactoring
```typescript
// Current signature - too many parameters
export async function createArea(
  name: string,
  title: string,
  phase: string,
  type = '🏛️ Area',
  description?: string,
  assignee?: string,
  tags?: string[]
): Promise<OperationResult<Area>>

// Proposed signature
export async function createArea(
  name: string,
  options: {
    title: string;
    phase: string;
    type?: string;
    description?: string;
    assignee?: string;
    tags?: string[];
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Area>>
```

#### ❌ updateArea - Needs refactoring
```typescript
// Current signature
export async function updateArea(
  id: string,
  updates: AreaUpdateOptions,
  phase?: string
): Promise<OperationResult<Area>>

// Proposed signature
export async function updateArea(
  id: string,
  updates: AreaUpdateOptions,
  options?: {
    phase?: string;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Area>>
```

#### ❌ deleteArea - Needs refactoring
```typescript
// Current signature
export async function deleteArea(
  id: string,
  phase?: string,
  force = false
): Promise<OperationResult<void>>

// Proposed signature
export async function deleteArea(
  id: string,
  options?: {
    phase?: string;
    force?: boolean;
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>>
```

### 5. Template Manager Operations (src/core/template-manager.ts)

#### ❌ getTemplatesDirectory - Needs runtime config
```typescript
// Current signature
export function getTemplatesDirectory(): string

// Proposed signature
export function getTemplatesDirectory(config?: RuntimeConfig): string
```

#### ❌ initializeTemplates - Needs runtime config
```typescript
// Current signature
export function initializeTemplates(): void

// Proposed signature
export function initializeTemplates(config?: RuntimeConfig): void
```

#### ❌ listTemplates - Needs runtime config
```typescript
// Current signature
export function listTemplates(): TemplateInfo[]

// Proposed signature
export function listTemplates(config?: RuntimeConfig): TemplateInfo[]
```

#### ❌ getTemplate - Needs runtime config
```typescript
// Current signature
export function getTemplate(templateId: string): string | null

// Proposed signature
export function getTemplate(templateId: string, config?: RuntimeConfig): string | null
```

#### ❌ applyTemplate - Likely OK as-is
```typescript
// Current signature - probably doesn't need config
export function applyTemplate(templateContent: string, values: Record<string, any>): string
```

### 6. Auxiliary Operations

#### Task Relationships (src/core/task-manager/task-relationships.ts)

#### ❌ updateRelationships - Needs runtime config
```typescript
// Current signature
export async function updateRelationships(task: Task): Promise<OperationResult<void>>

// Proposed signature
export async function updateRelationships(
  task: Task,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<void>>
```

#### Task Move (src/core/task-manager/task-move.ts)

#### ❌ moveTask - Needs runtime config in options
```typescript
// Current signature
export async function moveTask(
  id: string,
  options: {
    targetSubdirectory: string;
    targetPhase?: string;
    searchPhase?: string;
    searchSubdirectory?: string;
  }
): Promise<OperationResult<Task>>

// Note: Add config?: RuntimeConfig to the existing options interface
```

#### Task Workflow (src/core/task-manager/task-workflow.ts)

#### ❌ findNextTask - Needs runtime config
```typescript
// Current signature
export async function findNextTask(taskId?: string): Promise<OperationResult<Task | null>>

// Proposed signature
export async function findNextTask(
  taskId?: string,
  options?: {
    config?: RuntimeConfig;
  }
): Promise<OperationResult<Task | null>>
```

## Internal Calls to Update

After refactoring function signatures, all internal calls between these functions must be updated:

### Task CRUD internal calls
- createTask calls getTask - Update to use options pattern
- updateTask calls getTask - Update to use options pattern
- deleteTask calls getTask - Update to use options pattern

### Feature/Area CRUD calls
- All feature/area operations call listTasks internally
- Need to pass config through options

### Task Relationships calls
- updateRelationships calls getTask multiple times
- Needs to accept and pass config

### Task Workflow calls
- findNextTask calls getTask and listTasks
- Needs to accept and pass config

## Interface Updates Required

### Update existing interfaces
```typescript
// Add to TaskFilterOptions
interface TaskFilterOptions {
  // ... existing properties
  config?: RuntimeConfig;
}

// Add to FeatureFilterOptions
interface FeatureFilterOptions {
  // ... existing properties  
  config?: RuntimeConfig;
}

// Add to AreaFilterOptions
interface AreaFilterOptions {
  // ... existing properties
  config?: RuntimeConfig;
}
```

## Implementation Order

1. **Complete task-crud.ts** - createTask, updateTask, deleteTask
2. **Update interfaces** - Add config to filter options
3. **Refactor feature-crud.ts** - All functions
4. **Refactor area-crud.ts** - All functions  
5. **Refactor phase-crud.ts** - All functions
6. **Update auxiliary functions** - relationships, move, workflow
7. **Update template-manager.ts** - All functions
8. **Update all callers** - CLI, MCP, tests

## Directory Utilities Integration

During refactoring, replace direct path manipulations with directory utilities:

### Example Transformations
```typescript
// OLD: Direct path manipulation
const phaseDir = path.join(getTasksDirectory(), phase);

// NEW: Use directory utility
const phaseDir = getPhaseDirectory(phase, config);

// OLD: Manual directory type check
if (dirName.startsWith('FEATURE_')) { ... }

// NEW: Use utility function
if (isFeatureDirectory(dirName)) { ... }

// OLD: Building file paths
const filePath = path.join(tasksDir, phase, subdirectory, filename);

// NEW: Use utility function
const filePath = getFilePath(filename, phase, subdirectory, config);
```

### Key Benefits
- Consistent runtime config propagation
- Business rules encoded in one place
- Simplified error handling
- Better testability
- Type safety

## Testing Strategy

This project prefers integration tests, E2E tests, and snapshot tests over unit tests that merely check implementation details. Our testing approach should focus on:

1. **Integration tests**:
   - Test complete workflows (create task → update → move → delete)
   - Verify runtime config propagation through the entire stack
   - Test interactions between different CRUD modules
   - Use real file system operations (not mocks)

2. **E2E tests**:
   - Test CLI commands with different parameter combinations
   - Test MCP server operations end-to-end
   - Verify --root-dir parameter works correctly
   - Test error handling and edge cases

3. **Snapshot tests**:
   - Capture output of list operations before/after refactoring
   - Verify task file formats remain consistent
   - Test formatted output (tables, JSON, etc.)

4. **Regression tests**:
   - Ensure backward compatibility where possible
   - Test that existing workflows continue to work
   - Verify no data loss during operations

5. **Coverage focus**:
   - Test actual behavior, not implementation details
   - Focus on user-facing functionality
   - Avoid tests that just verify function calls

### Test File Organization

Following the project's existing patterns:

- **Integration tests**: `test/integration/crud-refactor.test.ts`
- **E2E tests**: `e2e_test/` directory with specific scenarios
- **Snapshot tests**: Store in `test/snapshots/` for comparison
- **Test utilities**: Create helper functions for common test scenarios

### CLI E2E Test Coverage

**Important**: The `test/run-root-dir-e2e.sh` script should be updated as each function is refactored to ensure comprehensive coverage. This E2E test script validates both root directory support AND the refactored CRUD operations.

For each refactored function:
1. Add corresponding test cases to `test/run-root-dir-e2e.sh`
2. Test all parameter combinations (with/without options)
3. Test with different `--root-dir` values (relative and absolute paths)
4. Test error scenarios and edge cases
5. Verify runtime config propagation works correctly
6. Ensure backward compatibility where applicable

The goal is to achieve 100% test coverage for all CLI commands, ensuring they work correctly with:
- Different root directory configurations
- The new options pattern
- Runtime config propagation
- All supported parameter combinations

## Breaking Changes

Functions with signature changes that may affect external callers:
- createFeature - Consolidates many parameters into options
- createArea - Consolidates many parameters into options
- deletePhase - Changes force parameter to options
- deleteFeature - Changes parameters to options
- deleteArea - Changes parameters to options

## Migration Guide

For external consumers of the API:
1. Update positional parameters to options objects
2. Ensure runtime config is passed where needed
3. Update any direct imports/calls
4. Test thoroughly before deployment

## Success Criteria

1. All functions use consistent options pattern
2. Runtime config supported throughout
3. All tests pass
4. API documentation updated
5. Breaking changes documented
6. Migration guide provided