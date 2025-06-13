---
title: "Storage API Reference"
description: "API documentation for Scopecraft's storage system"
version: "1.0"
status: "draft"
category: "reference"
updated: "2025-06-13"
authors: ["system"]
related:
  - ../02-architecture/system-architecture.md
  - ../02-architecture/code-organization.md
  - ../03-guides/storage-migration.md
---

# Storage API Reference

## Overview

The storage API provides a unified interface for managing task storage locations across different storage modes (legacy and centralized). This document covers the key modules and their APIs.

## ConfigurationManager

Singleton service that manages project configuration and storage settings.

### Import

```typescript
import { ConfigurationManager } from '@scopecraft/cmd/core/config';
```

### Methods

#### getInstance()
```typescript
static getInstance(): ConfigurationManager
```
Returns the singleton instance of the configuration manager.

#### getProjectRoot()
```typescript
getProjectRoot(): string | null
```
Returns the current project root path, or null if not configured.

#### setRootFromCLI(path: string)
```typescript
setRootFromCLI(path: string): void
```
Sets the project root from CLI parameter. Takes precedence over other sources.

#### getRootConfig(runtime?: RuntimeConfig)
```typescript
getRootConfig(runtime?: RuntimeConfig): RootConfig
```
Returns the complete root configuration including source and validation status.

### Example Usage

```typescript
const configManager = ConfigurationManager.getInstance();
const projectRoot = configManager.getProjectRoot();

if (projectRoot) {
  console.log(`Working in project: ${projectRoot}`);
}
```

## TaskStoragePathEncoder

Utility class for encoding and decoding project paths for centralized storage.

### Import

```typescript
import { TaskStoragePathEncoder } from '@scopecraft/cmd/core';
```

### Methods

#### encode(projectPath: string)
```typescript
static encode(projectPath: string): string
```
Encodes a project path into a flat, readable directory name.

**Example:**
```typescript
const encoded = TaskStoragePathEncoder.encode('/Users/alice/projects/myapp');
// Returns: "users-alice-projects-myapp"
```

#### decode(encodedPath: string)
```typescript
static decode(encodedPath: string): string
```
Decodes an encoded path back to a filesystem path (best-effort).

#### getProjectStorageRoot(projectPath: string)
```typescript
static getProjectStorageRoot(projectPath: string): string
```
Returns the root storage directory for a project.

**Example:**
```typescript
const storageRoot = TaskStoragePathEncoder.getProjectStorageRoot('/projects/myapp');
// Returns: "/Users/alice/.scopecraft/projects/projects-myapp"
```

#### getTaskStorageRoot(projectPath: string)
```typescript
static getTaskStorageRoot(projectPath: string): string
```
Returns the tasks directory for a project.

#### validateEncoded(encodedPath: string)
```typescript
static validateEncoded(encodedPath: string): boolean
```
Validates that an encoded path looks reasonable.

### Security Functions

#### validateScopecraftPath(targetPath: string)
```typescript
function validateScopecraftPath(targetPath: string): void
```
Validates that a path is within the ~/.scopecraft directory. Throws an error if not.

### Constants

```typescript
const STORAGE_PERMISSIONS = {
  DIRECTORY: 0o700,  // drwx------ (user only)
  FILE: 0o600,       // -rw------- (user only)
};
```

## Path Resolution API

The centralized path resolution system for all storage operations.

### Import

```typescript
import { 
  createPathContext, 
  resolvePath, 
  PATH_TYPES 
} from '@scopecraft/cmd/core/paths';
```

### Types

```typescript
type PathType = 'templates' | 'modes' | 'tasks' | 'sessions' | 'config';

interface PathContext {
  executionRoot: string;    // Current working directory
  mainRepoRoot: string;     // Main git repository root
  worktreeRoot?: string;    // Git worktree root (if applicable)
  userHome: string;         // User's home directory
}
```

### Functions

#### createPathContext(projectRoot: string)
```typescript
function createPathContext(projectRoot: string): PathContext
```
Creates a path context from a project root. Results are cached for performance.

#### resolvePath(featureType: PathType, context: PathContext)
```typescript
function resolvePath(featureType: PathType, context: PathContext): string
```
Resolves a path based on the configured strategy.

**Example:**
```typescript
const context = createPathContext('/projects/myapp');
const tasksPath = resolvePath(PATH_TYPES.TASKS, context);
// Returns: ~/.scopecraft/projects/projects-myapp/tasks
```

#### resolvePathWithPrecedence(featureType: PathType, context: PathContext)
```typescript
function resolvePathWithPrecedence(
  featureType: PathType, 
  context: PathContext
): string[]
```
Returns all possible paths in order of precedence.

#### resolveExistingPath(featureType: PathType, context: PathContext)
```typescript
function resolveExistingPath(
  featureType: PathType, 
  context: PathContext
): string
```
Finds the first existing path from precedence list.

### Path Type Strategies

| Path Type | Primary Location | Fallback |
|-----------|-----------------|----------|
| templates | `.tasks/.templates/` (repo) | `~/.scopecraft/templates/` |
| modes | `.tasks/.modes/` (repo) | None |
| tasks | `~/.scopecraft/projects/{encoded}/tasks/` | None |
| sessions | `~/.scopecraft/projects/{encoded}/sessions/` | None |
| config | `~/.scopecraft/projects/{encoded}/config/` | `.tasks/` (repo) |

## Storage Utils (Deprecated)

**Note:** The following functions from `directory-utils.ts` are deprecated. Use the path resolution API instead.

### Deprecated Functions

```typescript
// DEPRECATED - Use resolvePath(PATH_TYPES.TEMPLATES, context)
export function getTemplatesDirectory(projectRoot: string): string

// DEPRECATED - Use resolvePath(PATH_TYPES.CONFIG, context)
export function getConfigDirectory(projectRoot: string): string
```

### Still Supported

```typescript
// Get workflow directories (these remain unchanged)
export function getWorkflowDirectory(
  projectRoot: string,
  state: WorkflowState,
  config?: ProjectConfig
): string

export function getTasksDirectory(projectRoot: string): string
```

## Usage Examples

### Complete Example: Task Creation

```typescript
import { ConfigurationManager } from '@scopecraft/cmd/core/config';
import { createPathContext, resolvePath, PATH_TYPES } from '@scopecraft/cmd/core/paths';
import { getWorkflowDirectory } from '@scopecraft/cmd/core';

// Get project root
const configManager = ConfigurationManager.getInstance();
const projectRoot = configManager.getProjectRoot();

if (!projectRoot) {
  throw new Error('No project root configured');
}

// Create path context
const context = createPathContext(projectRoot);

// Get task storage location
const backlogDir = getWorkflowDirectory(projectRoot, 'backlog');

// Get templates location
const templatesPath = resolvePath(PATH_TYPES.TEMPLATES, context);

console.log(`Creating task in: ${backlogDir}`);
console.log(`Using templates from: ${templatesPath}`);
```

### Example: Multi-Worktree Support

```typescript
import { WorktreePathResolver } from '@scopecraft/cmd/core/environment';
import { TaskStoragePathEncoder } from '@scopecraft/cmd/core';

const resolver = new WorktreePathResolver();
const mainRoot = resolver.getMainRepositoryRootSync();

// All worktrees share the same encoded path
const encoded = TaskStoragePathEncoder.encode(mainRoot);
console.log(`Shared storage: ~/.scopecraft/projects/${encoded}/`);
```

## Best Practices

1. **Always use the path resolution API** - Don't hardcode paths
2. **Create path context once** - It's cached, reuse it
3. **Check path existence** - Use `resolveExistingPath` when reading
4. **Validate paths** - Use security functions for user input
5. **Handle errors** - Storage operations can fail

## Migration Notes

When migrating from legacy code:

1. Replace hardcoded `.tasks/` paths with API calls
2. Use `createPathContext` instead of passing raw paths
3. Update imports to use the new modules
4. Test with both storage modes if supporting legacy

## Future API Changes

The following features are planned:

- **Storage mode configuration**: Runtime switching between modes
- **Cloud storage adapter**: Remote task storage
- **Storage metrics**: Usage tracking and optimization
- **Batch operations**: Efficient multi-task operations