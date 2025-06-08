# Worktree Dashboard Architecture Document

## Executive Summary

This document outlines the architecture for implementing the Worktree Dashboard feature. Based on analysis of the existing prototype implementation, this document defines:

1. Core data models and interfaces 
2. Service layer for git operations using simple-git
3. API endpoints for worktree discovery and status information
4. Integration strategies for task metadata
5. Code organization and structure
6. Implementation priorities and scope decisions for v1

The architecture is designed to support real-time worktree status monitoring, efficient polling, and seamless integration with the existing Tasks UI components.

## Prototype Analysis

### Data Flow and Component Structure

The current prototype implementation consists of:

1. **UI Components**:
   - `WorktreeDashboard`: Main container component with data fetching and refresh logic
   - `WorktreeCard`: Displays individual worktree information
   - Supporting components: `FeatureProgress`, `WorkflowStatusBadge`, `ModeIndicator`

2. **Data Models**:
   - `Worktree`: Core data model with git and task-related properties
   - Supporting enums: `WorktreeStatus`, `WorkflowStatus`, `DevelopmentMode`

3. **API Client**:
   - Currently using mock data for development
   - Placeholder endpoints defined for future implementation

### Essential UI Requirements

Based on the prototype analysis, the following UI elements require backend support:

| UI Component | Data Field | Source | Priority |
|--------------|------------|--------|----------|
| WorktreeCard | path | Git | High |
| WorktreeCard | branch | Git | High |
| WorktreeCard | headCommit | Git | High |
| WorktreeCard | status | Git | High |
| WorktreeCard | lastActivity | Git | High |
| WorktreeCard | changedFiles | Git | High |
| WorktreeCard | taskId | Task Metadata | Medium |
| WorktreeCard | taskTitle | Task Metadata | Medium |
| WorktreeCard | taskStatus | Task Metadata | Medium |
| WorktreeCard | workflowStatus | Derived | Medium |
| WorktreeCard | featureProgress | Task Metadata | Low |
| WorktreeCard | mode | Task Metadata | Low |

### Refresh Patterns

The prototype implements:

1. Auto-refresh mechanism at configurable intervals (default 30 seconds)
2. Manual refresh for all worktrees
3. Selective refresh for individual worktrees
4. UI state updates during loading/error conditions

## Simplegit Capabilities Assessment

### Worktree Discovery and Parsing

Based on the sample script and simplegit documentation:

1. **Capabilities**:
   - Simple-git can execute raw git commands using `.raw()` method
   - Primary worktree discovery uses `git worktree list --porcelain`
   - Porcelain output provides structured data that's easily parseable

2. **Implementation Approach**:
   ```typescript
   async discoverWorktrees(): Promise<Worktree[]> {
     const git = simpleGit(this.repoPath);
     const result = await git.raw(['worktree', 'list', '--porcelain']);
     return this.parseWorktrees(result);
   }
   ```

3. **Data Structure**:
   The porcelain format provides detailed information:
   ```
   worktree /path/to/worktree
   HEAD abcd1234...
   branch refs/heads/feature-branch
   ```

### Status Retrieval and Change Detection

1. **Status Detection**:
   - `git status --porcelain` provides machine-readable status output
   - Can be filtered and parsed to determine file changes
   - Status categories: modified, added, deleted, untracked, renamed, conflicted

2. **Last Commit Information**:
   - `git log -1 --format="%H|%s|%an|%ad"` retrieves commit hash, message, author, and date
   - Hash comparison can detect new commits

3. **Implementation Considerations**:
   - Cache results to minimize git operations
   - Use status hash comparison to detect changes between polls
   - Throttle rapid consecutive status checks

### System Integration

1. **Branch-Task Correlation**:
   - Extract task ID from branch name using regex patterns
   - Common patterns: `feature/TASK-123`, `bugfix/FEAT-123-description`
   - Fall back to branch name when pattern doesn't match

2. **Performance Considerations**:
   - Git operations are I/O-bound and potentially expensive
   - Implement caching with TTL (Time To Live)
   - Avoid polling too frequently (minimum 5-10 seconds between checks)
   - Throttle concurrent git operations

3. **OS Considerations**:
   - Path handling must be OS-agnostic (use `path.join()`)
   - File existence checks before operations
   - Handle cases where worktree paths in git don't exist on filesystem

## Architecture Design

### Component Architecture

#### 1. WorktreeService Class

```typescript
class WorktreeService {
  private cacheManager: CacheManager;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.cacheManager = new CacheManager();
  }

  async listWorktrees(): Promise<Worktree[]> { /* ... */ }
  async getWorktreeStatus(path: string): Promise<WorktreeStatus> { /* ... */ }
  async getChangedFiles(path: string): Promise<ChangedFile[]> { /* ... */ }
  async getLastCommit(path: string): Promise<CommitInfo> { /* ... */ }
  async getLastActivity(path: string): Promise<Date> { /* ... */ }
  async correlateWithTaskMetadata(worktrees: Worktree[]): Promise<Worktree[]> { /* ... */ }
}
```

// No separate CacheManager needed for initial implementation
```

#### 3. TaskCorrelationService

```typescript
class TaskCorrelationService {
  constructor(private mcpClient: McpClient) {}
  
  async correlateWorktreeWithTask(worktree: Worktree): Promise<Worktree> { /* ... */ }
  async getTaskMetadata(taskId: string): Promise<TaskMetadata> { /* ... */ }
  async getFeatureProgress(featureId: string): Promise<FeatureProgress> { /* ... */ }
}
```

#### 4. Error Handling Strategy

- Implement domain-specific error classes:
  - `WorktreeNotFoundError`
  - `GitOperationError`
  - `TaskCorrelationError`

- All service methods should:
  - Handle expected errors gracefully
  - Provide meaningful error messages
  - Fall back to default values when possible
  - Log detailed errors for troubleshooting

### Data Models and Interfaces

```typescript
// Core Worktree interface
interface Worktree {
  // Git properties
  path: string;
  branch: string;
  headCommit: string;
  status: WorktreeStatus;
  lastActivity?: Date;
  changedFiles?: ChangedFile[];
  
  // Task properties
  taskId?: string;
  taskTitle?: string;
  taskStatus?: string;
  workflowStatus?: WorkflowStatus;
  mode?: {
    current?: DevelopmentMode;
    next?: DevelopmentMode;
  };
  
  // Feature properties
  featureProgress?: FeatureProgress;
  
  // UI state
  isLoading?: boolean;
  error?: string;
}

// Git status types
enum WorktreeStatus {
  CLEAN = 'clean',
  MODIFIED = 'modified',
  UNTRACKED = 'untracked',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown'
}

// Changed files in a worktree
interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'untracked' | 'renamed' | 'conflicted';
  oldPath?: string; // For renamed files
}

// Last commit information
interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

// Feature progress information
interface FeatureProgress {
  totalTasks: number;
  completed: number;
  inProgress: number;
  blocked: number;
  toDo: number;
  tasks?: {
    id: string;
    title: string;
    status: string;
  }[];
}

// Dashboard configuration
interface WorktreeDashboardConfig {
  refreshInterval: number;
  showTaskInfo: boolean;
  maxWorktrees?: number;
}
```

### API Definition

#### 1. Core API Endpoints

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/worktrees` | GET | List all worktrees | none | `Worktree[]` |
| `/api/worktrees/:path` | GET | Get specific worktree details | path (encoded) | `Worktree` |
| `/api/worktrees/:path/status` | GET | Get status for a worktree | path (encoded) | `WorktreeStatus` |
| `/api/worktrees/:path/changes` | GET | Get changed files | path (encoded) | `ChangedFile[]` |
| `/api/worktrees/summary` | GET | Get summary statistics | none | `WorktreeSummary` |
| `/api/worktrees/config` | GET | Get dashboard config | none | `WorktreeDashboardConfig` |
| `/api/worktrees/config` | POST | Update dashboard config | config object | `WorktreeDashboardConfig` |

#### 2. API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

#### 3. MCP Handler Integration

For task metadata integration, use direct MCP handler calls:

```typescript
// Get task metadata by ID
async getTaskMetadata(taskId: string): Promise<TaskMetadata> {
  const result = await this.mcpClient.callHandler('task_get', { 
    id: taskId 
  });
  
  if (!result.success) {
    throw new TaskCorrelationError(`Failed to get task: ${result.message}`);
  }
  
  return result.data;
}

// Get feature progress
async getFeatureProgress(featureId: string): Promise<FeatureProgress> {
  const result = await this.mcpClient.callHandler('feature_get', {
    id: featureId,
    include_tasks: true
  });
  
  if (!result.success) {
    throw new TaskCorrelationError(`Failed to get feature: ${result.message}`);
  }
  
  return {
    totalTasks: result.data.tasks.length,
    completed: result.data.tasks.filter(t => t.status.includes('Done')).length,
    inProgress: result.data.tasks.filter(t => t.status.includes('Progress')).length,
    blocked: result.data.tasks.filter(t => t.status.includes('Block')).length,
    toDo: result.data.tasks.filter(t => t.status.includes('To Do')).length,
    tasks: result.data.tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status
    }))
  };
}
```

### Integration Strategy

#### 1. WorktreeService with simple-git

```typescript
async discoverWorktrees(): Promise<Worktree[]> {
  try {
    const git = simpleGit(this.repoPath);
    const result = await git.raw(['worktree', 'list', '--porcelain']);
    const worktrees = this.parseWorktrees(result);
    
    // Fetch status for each worktree
    const worktreesWithStatus = await Promise.all(
      worktrees.map(async (worktree) => {
        try {
          const status = await this.getWorktreeStatus(worktree.path);
          const lastCommit = await this.getLastCommit(worktree.path);
          
          return {
            ...worktree,
            status,
            headCommit: lastCommit.hash,
            lastActivity: new Date(lastCommit.date)
          };
        } catch (error) {
          return {
            ...worktree,
            status: WorktreeStatus.UNKNOWN,
            error: error.message
          };
        }
      })
    );
    
    return worktreesWithStatus;
  } catch (error) {
    throw new GitOperationError(`Failed to discover worktrees: ${error.message}`);
  }
}
```

#### 2. Task Metadata Integration

```typescript
async correlateWithTaskMetadata(worktrees: Worktree[]): Promise<Worktree[]> {
  return Promise.all(
    worktrees.map(async (worktree) => {
      try {
        // Extract task ID from branch name
        const taskId = this.extractTaskId(worktree.branch);
        if (!taskId) return worktree;
        
        // Fetch task metadata
        const task = await this.taskCorrelationService.getTaskMetadata(taskId);
        
        // Enhance worktree with task data
        return {
          ...worktree,
          taskId,
          taskTitle: task.title,
          taskStatus: task.status,
          workflowStatus: this.mapTaskStatusToWorkflow(task.status)
        };
      } catch (error) {
        // Return original worktree if correlation fails
        return worktree;
      }
    })
  );
}
```

#### 3. Refresh Strategy

```typescript
// In API handler
async refreshWorktree(path: string): Promise<ApiResponse<Worktree>> {
  try {
    // Fetch fresh data directly
    const worktree = await this.worktreeService.getWorktree(path);
    
    return {
      success: true,
      data: worktree
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to refresh worktree: ${error.message}`
    };
  }
}
```

## Scope and Implementation Decisions

### v1 Scope Decisions

1. **Feature Tasks Display**:
   - Include detailed feature tasks in v1
   - Display up to 10 tasks per feature for performance
   - Show task ID, title, and status only
   
2. **Status Indicators**:
   - Implement all defined WorktreeStatus values
   - Support WorkflowStatus mapping from task status
   - Include changed files count and details
   
3. **UI Simplifications**:
   - Keep all current UI components as designed
   - Optimize for 5-10 concurrent worktrees
   - Consider performance impact with large number of worktrees
   
4. **Refresh Strategy**:
   - Default interval: 30 seconds
   - Allow user configuration (min 5 seconds, max 5 minutes)
   - Cache invalidation on manual refresh
   
5. **Performance Targets**:
   - Support up to 20 concurrent worktrees
   - Maximum 1 second latency for status updates
   - Throttle git operations to minimize resource usage

### Implementation Priorities

| Component | Priority | Reason |
|-----------|----------|--------|
| WorktreeService Core | High | Foundation for all git operations |
| Worktree Discovery | High | Required for dashboard to function |
| Status Detection | High | Essential for worktree overview |
| Changed Files Tracking | Medium | Important but can be simplified initially |
| Task Metadata Integration | Medium | Enhances UI but not critical for basic function |
| Feature Progress | Low | Nice to have but complex, can be deferred |
| Dashboard Config | Medium | Required for user preferences |

### Technical Challenges and Risks

1. **Git Performance**:
   - Risk: Git operations may be slow with many worktrees
   - Mitigation: Implement caching and throttling
   
2. **Task ID Correlation**:
   - Risk: Branch names may not follow consistent patterns
   - Mitigation: Support multiple extraction patterns with fallbacks
   
3. **Path Handling**:
   - Risk: Cross-platform path issues
   - Mitigation: Use Node.js path utilities consistently
   
4. **API Security**:
   - Risk: Path traversal or command injection
   - Mitigation: Strict input validation and path normalization

### Testing Strategy

1. **Unit Tests**:
   - Mock git operations for predictable results
   - Test different worktree states (clean, modified, etc.)
   - Verify error handling paths
   
2. **Integration Tests**:
   - Test with actual git repos and worktrees
   - Verify refresh strategy works as expected
   - Test task metadata correlation
   
3. **Performance Tests**:
   - Benchmark with 5, 10, and 20 worktrees
   - Measure impact of different refresh intervals
   - Verify caching improves performance

## Code Organization

### Module Structure

The worktree functionality should be organized following the existing pattern of separating core logic from UI and API components:

```
/src
  /core
    /worktree
      types.ts           # Core Worktree interface and types
      worktree-service.ts  # Main service implementation
      index.ts           # Public API exports
  /mcp
    /handlers
      worktree-handlers.ts # MCP handlers for worktree operations
  /tasks-ui
    /server
      worktree-api.ts    # API endpoints for Bun server
    /components
      /worktree
        # Existing UI components stay here
```

### Core Module Design

The core module should:

1. Be completely independent of UI and API layers
2. Have well-defined interfaces for all public functions
3. Export only what's needed through index.ts files
4. Follow the same patterns as existing core modules (task, phase, etc.)

This organization makes the worktree functionality:
- Reusable across both CLI and UI
- Testable in isolation
- Consistent with the project's architecture
- Maintainable as a separate module

### Integration Points

The worktree service would be consumed by:

1. **MCP Handlers**: Expose worktree operations through MCP
2. **API Routes**: Provide REST endpoints for the UI
3. **CLI Commands**: Allow worktree operations from the CLI

All of these would import from the core module's public API. For example:

```typescript
// In mcp/handlers/worktree-handlers.ts
import { WorktreeService } from '../../core/worktree';

// In tasks-ui/server/worktree-api.ts
import { WorktreeService } from '../../core/worktree';
```

### Server Implementation with Bun

Use native Bun server capabilities for API implementation:

```typescript
// Example of a simplified Bun server endpoint
// In tasks-ui/server/worktree-api.ts

import { WorktreeService } from '../../core/worktree';

export function registerWorktreeRoutes(app) {
  const worktreeService = new WorktreeService();
  
  app.get('/api/worktrees', async (req, res) => {
    try {
      const worktrees = await worktreeService.listWorktrees();
      return Response.json({
        success: true,
        data: worktrees
      });
    } catch (error) {
      return Response.json({
        success: false,
        message: error.message
      }, { status: 500 });
    }
  });
  
  // Other endpoints...
}
```

## Execution Plan

### Phase 1: Core Implementation

1. Implement core WorktreeService with basic operations
2. Develop error handling strategy
3. Implement worktree discovery and status detection
4. Create types and interfaces in core module

### Phase 2: API Implementation

1. Define API endpoints in Bun server
2. Implement handlers for core operations
3. Add configuration management
4. Create dashboard summary statistics

### Phase 3: Integration

1. Implement task metadata correlation
2. Connect WorktreeService to API endpoints
3. Add feature progress tracking
4. Implement refresh strategy

### Phase 4: UI Integration

1. Connect UI components to real API endpoints
2. Implement auto-refresh mechanism
3. Add error handling and retry logic
4. Test with various worktree configurations

## Testing Scripts

To validate the implementation before full UI integration, a CLI script similar to the provided claude-monitor script will be created. This script will:

1. Use the new core services rather than direct git commands
2. Provide a simple way to test the functionality
3. Help identify any issues before UI integration

### Sample Testing Script

```typescript
#!/usr/bin/env bun

import { join } from 'path';
import { WorktreeService } from '../core/worktree';
import type { Worktree, WorktreeStatus } from '../core/worktree/types';

// Create a simple CLI monitor that uses our core services
class WorktreeMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private worktreeService: WorktreeService;
  private lastState: Map<string, string> = new Map();
  
  constructor(repoPath: string) {
    this.worktreeService = new WorktreeService(repoPath);
  }
  
  async start() {
    console.log('🚀 Starting Worktree Monitor...');
    console.log(`📁 Repository: ${this.worktreeService.getRepositoryPath()}`);
    
    try {
      // Initial discovery
      const worktrees = await this.worktreeService.listWorktrees();
      console.log(`📋 Found ${worktrees.length} worktree(s)`);
      
      // Display initial status
      for (const worktree of worktrees) {
        await this.displayWorktreeInfo(worktree);
      }
      
      // Start polling for changes
      this.intervalId = setInterval(async () => {
        await this.checkForChanges();
      }, 5000);
      
      console.log('✅ Monitoring started. Press Ctrl+C to stop.\n');
      
      // Handle termination
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
      
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error);
      process.exit(1);
    }
  }
  
  private async displayWorktreeInfo(worktree: Worktree) {
    const statusEmoji = this.getStatusEmoji(worktree.status);
    console.log(`${statusEmoji} Worktree: ${worktree.path}`);
    console.log(`   Branch: ${worktree.branch}`);
    console.log(`   Commit: ${worktree.headCommit.substring(0, 7)}`);
    
    if (worktree.taskId) {
      console.log(`   Task: ${worktree.taskId} - ${worktree.taskTitle || 'Unknown'}`);
    }
    
    if (worktree.changedFiles && worktree.changedFiles.length > 0) {
      console.log(`   Changes: ${worktree.changedFiles.length} file(s)`);
      for (const file of worktree.changedFiles.slice(0, 3)) {
        console.log(`     ${file.status[0].toUpperCase()} ${file.path}`);
      }
      if (worktree.changedFiles.length > 3) {
        console.log(`     ... and ${worktree.changedFiles.length - 3} more`);
      }
    }
    
    console.log('');
    
    // Save current state for change detection
    this.lastState.set(worktree.path, JSON.stringify({
      status: worktree.status,
      headCommit: worktree.headCommit,
      changedFiles: worktree.changedFiles?.length || 0
    }));
  }
  
  private getStatusEmoji(status: WorktreeStatus): string {
    switch (status) {
      case 'clean': return '✅';
      case 'modified': return '📝';
      case 'untracked': return '🆕';
      case 'conflict': return '⚠️';
      default: return '❓';
    }
  }
  
  private async checkForChanges() {
    const worktrees = await this.worktreeService.listWorktrees();
    
    for (const worktree of worktrees) {
      const prevState = this.lastState.get(worktree.path);
      
      if (!prevState) {
        // New worktree
        console.log(`🆕 New worktree detected: ${worktree.path}`);
        await this.displayWorktreeInfo(worktree);
        continue;
      }
      
      const currentState = JSON.stringify({
        status: worktree.status,
        headCommit: worktree.headCommit,
        changedFiles: worktree.changedFiles?.length || 0
      });
      
      if (prevState !== currentState) {
        // Something changed
        console.log(`🔄 [${new Date().toISOString()}] Changes detected in ${worktree.branch}`);
        await this.displayWorktreeInfo(worktree);
      }
    }
    
    // Check for removed worktrees
    const currentPaths = new Set(worktrees.map(w => w.path));
    for (const [path] of this.lastState) {
      if (!currentPaths.has(path)) {
        console.log(`🗑️ Worktree removed: ${path}`);
        this.lastState.delete(path);
      }
    }
  }
  
  stop() {
    console.log('\n🛑 Stopping Worktree Monitor...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    console.log('✅ Monitor stopped.');
    process.exit(0);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: bun run worktree-monitor.ts <repository-path>');
    process.exit(1);
  }
  
  const repoPath = args[0];
  const monitor = new WorktreeMonitor(repoPath);
  await monitor.start();
}

if (import.meta.main) {
  main().catch(console.error);
}
```

This script can be run directly with Bun to test the core services without requiring UI integration:

```bash
bun run scripts/worktree-monitor.ts /path/to/repository
```

## Conclusion

This architecture provides a robust foundation for implementing the Worktree Dashboard feature. By leveraging simple-git for git operations and integrating with existing task metadata systems, we can deliver a comprehensive worktree management solution in the Tasks UI.

The design prioritizes performance, reliability, and extensibility, while focusing on the core requirements for v1. Future iterations can build on this foundation to add more advanced features and optimizations.