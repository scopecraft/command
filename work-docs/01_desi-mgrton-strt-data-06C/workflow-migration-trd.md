# Technical Requirements Document: Three-State to Two-State Workflow Migration

**Task:** 01_desi-mgrton-strt-data-06C  
**Date:** 2025-06-17  
**Author:** Design Agent  
**Status:** Final  

## Executive Summary

This document defines a precise, minimal approach for migrating Scopecraft's workflow system from directory-based states (backlog/current/archive) to metadata-driven phases. The solution leverages existing metadata infrastructure to eliminate workflow corruption while maintaining system simplicity.

### Key Insight
The root issue isn't the three states - it's that workflow state is conflated with physical location. By decoupling these concerns, we solve the corruption issues while enabling richer workflows.

## Architecture Overview

### The Problem
Current system couples two orthogonal concerns:
1. **Physical location** (where files live)
2. **Workflow phase** (what stage work is in)

This coupling causes:
- Workflow transitions require file movements (corruption risk)
- Parent tasks can be split across directories
- Rigid workflow limited to 3 predefined states

### The Solution
Separate these concerns:
- **Location**: Only `current/` (active work) and `archive/` (completed work)
- **Phase**: Metadata field for workflow stage (backlog, active, released, custom...)

### Why This Works
- No file movement except archival (eliminates corruption)
- Parent tasks always stay together
- Unlimited workflow phases without directory proliferation
- Leverages existing metadata normalization infrastructure

## Core Changes

### 1. Metadata Schema Extension <!-- area:core -->

```json
// src/core/metadata/default-schema.json
// ADD new phase enum after priority:
"phase": {
  "values": [
    { "name": "backlog", "label": "Backlog", "emoji": "📋", "icon": "inbox" },
    { "name": "active", "label": "Active", "emoji": "🚀", "icon": "play" },
    { "name": "released", "label": "Released", "emoji": "✅", "icon": "package" }
  ]
}

// MODIFY workflowState enum:
"workflowState": {
  "values": [
    { "name": "current", "label": "Current", "emoji": "🎯", "icon": "play" },
    { "name": "archive", "label": "Archive", "emoji": "📦", "icon": "folder-archive" }
  ]
}
```

### 2. Type System Updates <!-- area:core -->

```typescript
// src/core/types.ts

// Line 24: Update WorkflowState
export type WorkflowState = 'current' | 'archive';

// After line 30: Add phase type
export type TaskPhase = 'backlog' | 'active' | 'released' | string;

// Line 52: Add phase to TaskFrontmatter optional fields
phase?: TaskPhase;

// Line 283: Update ProjectConfig.workflowFolders
workflowFolders?: {
  current: string;
  archive: string;
};

// Line 285: Add default phase
defaultPhase?: TaskPhase; // defaults to 'backlog'
```

### 3. Metadata Normalization <!-- area:core -->

```typescript
// src/core/field-normalizers.ts
// ADD after normalizeTaskType function:

export function normalizePhase(value: unknown): string {
  return normalizeEnumValue('phase', value);
}
```

### 4. Remove Workflow Transitions <!-- area:core -->

```typescript
// src/core/task-crud.ts

// DELETE lines 1033-1044 (getStatusForWorkflow function)
// DELETE line 569 (status update in moveSimpleTask)
// DELETE line 620 (status update in moveParentTask)
// MODIFY line 287: Remove autoWorkflowTransitions from ProjectConfig usage
```

## Implementation Strategy

### Phase 1: Metadata Infrastructure <!-- area:core -->
1. Extend schema with phase enum
2. Update types to remove backlog state
3. Add phase normalizer using existing infrastructure
4. Remove automatic workflow transitions

### Phase 2: Migration Execution
1. One-time script to move backlog → current
2. Add phase:backlog to moved tasks
3. Handle parent tasks as complete units
4. Clean up empty directories

### Phase 3: System Updates
1. Update CLI list filters <!-- area:cli -->
2. Update MCP query handlers <!-- area:mcp -->
3. Update UI filter components <!-- area:ui -->

## Migration Script Design

### Approach
One-time script leveraging existing infrastructure:

```typescript
// scripts/migrate-workflow.ts

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getStoragePath } from '../src/core/paths/path-resolver.js';
import { move, update } from '../src/core/task-crud.js';
import { getTaskIdFromFilename } from '../src/core/directory-utils.js';

async function migrateWorkflow(projectRoot: string) {
  const storagePath = getStoragePath(projectRoot);
  const backlogPath = join(storagePath, 'tasks', 'backlog');
  
  if (!existsSync(backlogPath)) {
    console.log('No backlog directory found');
    return;
  }
  
  // Get all entries (files and directories)
  const entries = readdirSync(backlogPath, { withFileTypes: true });
  let migrated = 0;
  
  for (const entry of entries) {
    const taskId = entry.isDirectory() 
      ? entry.name 
      : getTaskIdFromFilename(entry.name);
    
    if (!taskId) continue;
    
    // Move to current (handles both simple and parent tasks)
    await move(projectRoot, taskId, { 
      targetState: 'current',
      updateStatus: false // Critical: don't auto-update
    });
    
    // Add phase metadata
    await update(projectRoot, taskId, {
      frontmatter: { phase: 'backlog' }
    });
    
    migrated++;
  }
  
  console.log(`Migrated ${migrated} tasks from backlog to current`);
  
  // Clean up empty backlog directory
  if (readdirSync(backlogPath).length === 0) {
    fs.rmSync(backlogPath, { recursive: true });
  }
}
```

### Why This Design Works
1. **Uses existing task-crud operations** - no reimplementation
2. **Handles parent tasks automatically** - move() knows about folders
3. **Leverages metadata update** - phase added through standard API
4. **Minimal code** - ~40 lines vs 400
5. **No new dependencies** - just our existing functions

## CLI Updates <!-- area:cli -->

### List Command Changes
```typescript
// src/cli/entity-commands.ts

// Add phase filter option
.option('--phase <phase>', 'Filter by workflow phase')

// Update list logic to:
// 1. Remove 'backlog' as a workflow state option
// 2. Add phase filtering
// 3. Display phase in output
```

### Migration Command
```typescript
// src/cli/commands.ts

// Add simple migration command
program
  .command('migrate-workflow')
  .description('Migrate from 3-state to 2-state workflow')
  .action(async () => {
    const { migrateWorkflow } = await import('../scripts/migrate-workflow.js');
    await migrateWorkflow(process.cwd());
  });
```

## MCP Updates <!-- area:mcp -->

### Handler Updates
```typescript
// src/mcp/handlers/read-handlers.ts

// Modify task_list handler:
// 1. Remove 'backlog' from location enum
// 2. Add 'phase' parameter
// 3. Include phase in response data

// src/mcp/transformers.ts
// Ensure phase is included in task transformation
```

## UI Updates <!-- area:ui -->

### Filter Components
```typescript
// tasks-ui/src/components/filters/

// 1. Remove 'Backlog' from workflow state dropdown
// 2. Add Phase dropdown with backlog/active/released
// 3. Update task cards to show phase badge
```

## Key Design Decisions

### 1. Phase as Open Enum
While schema defines common phases (backlog, active, released), the type accepts any string. This enables project-specific workflows without schema changes.

### 2. No Automatic Transitions
Removing `getStatusForWorkflow` eliminates the tight coupling between location and status. Tasks maintain their status regardless of workflow movement.

### 3. Leveraging Existing Infrastructure
- **Metadata normalization** - Phase uses the same enum system as other fields
- **Task CRUD operations** - Migration uses standard move/update
- **Path resolution** - No changes needed to centralized storage

### 4. Minimal Surface Area
Only 4 core files need modification:
- `default-schema.json` - Add phase enum
- `types.ts` - Update types
- `field-normalizers.ts` - Add normalizer
- `task-crud.ts` - Remove auto-transitions

## Architecture Principles Demonstrated

1. **Separation of Concerns**: Physical location ≠ workflow phase
2. **Composability**: Migration script composes existing operations
3. **Metadata Centralization**: Phase managed through metadata system
4. **Simplicity**: Elegant solution to complex problem
5. **Future-Proof**: Easy to extend without breaking changes

## Implementation Checklist

### Core Tasks <!-- area:core -->
- [ ] Update default-schema.json with phase enum
- [ ] Update types.ts (WorkflowState, TaskPhase, TaskFrontmatter)
- [ ] Add normalizePhase to field-normalizers.ts
- [ ] Remove getStatusForWorkflow from task-crud.ts
- [ ] Create migration script in scripts/
- [ ] Test migration with real data

### CLI Tasks <!-- area:cli -->
- [ ] Add --phase filter to list command
- [ ] Update display formatters for phase
- [ ] Add migrate-workflow command

### MCP Tasks <!-- area:mcp -->
- [ ] Update task_list handler for phase filtering
- [ ] Include phase in response data
- [ ] Update schemas

### Documentation Tasks
- [ ] Document phase concept in user guide
- [ ] Add migration instructions
- [ ] Update API documentation

## Success Criteria

1. **Zero Data Loss**: All tasks successfully migrated
2. **Parent Task Integrity**: No split parent tasks
3. **Backwards Compatible**: Existing tools continue working
4. **Performance**: Migration completes in seconds for typical projects
5. **Simplicity**: Implementation adds minimal complexity

---

*This TRD defines an elegant solution to workflow corruption by separating physical location from logical phase, leveraging Scopecraft's existing metadata infrastructure for a minimal, composable implementation.*