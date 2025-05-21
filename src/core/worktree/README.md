# Worktree Service

This module provides services for working with Git worktrees, enabling the dashboard to display information about active worktrees and their status.

## Core Components

### WorktreeService

The main service for Git worktree operations, providing methods to:

- List all worktrees in a repository
- Get detailed information about a specific worktree
- Check the status of a worktree (clean, modified, etc.)
- Get changed files in a worktree
- Retrieve commit information
- Extract task IDs from branch names

### TaskCorrelationService

Service for correlating worktrees with task metadata, providing methods to:

- Link worktrees with task metadata based on branch names
- Get task status and workflow information
- Retrieve feature progress information
- Extract development mode from task tags

### CacheManager

Utility for caching Git operations to improve performance, providing:

- Time-based caching with configurable TTL
- Methods to get, set, and invalidate cache entries
- Utility for computing and caching values

## Data Models

The module defines Zod schemas and TypeScript types for:

- Worktree information
- Worktree status
- Changed files
- Commit information
- Feature progress
- Workflow status
- Development mode

## Usage Examples

### Basic worktree listing

```typescript
import { WorktreeService } from '../core/worktree';

// Create a new WorktreeService instance
const worktreeService = new WorktreeService('/path/to/repository');

// List all worktrees
const worktrees = await worktreeService.listWorktrees();

// Print worktree info
worktrees.forEach(worktree => {
  console.log(`Worktree: ${worktree.path}`);
  console.log(`Branch: ${worktree.branch}`);
  console.log(`Status: ${worktree.status}`);
  console.log('---');
});
```

### With task correlation

```typescript
import { WorktreeService, TaskCorrelationService } from '../core/worktree';

// Create services
const worktreeService = new WorktreeService('/path/to/repository');
const taskCorrelationService = new TaskCorrelationService(worktreeService);

// Get worktrees with task metadata
const worktrees = await worktreeService.listWorktrees();
const worktreesWithTasks = await taskCorrelationService.correlateWorktreesWithTasks(worktrees);

// Use the enhanced worktree information
worktreesWithTasks.forEach(worktree => {
  console.log(`Worktree: ${worktree.path}`);
  console.log(`Branch: ${worktree.branch}`);
  console.log(`Task: ${worktree.taskId || 'None'}`);
  console.log(`Task Status: ${worktree.taskStatus || 'N/A'}`);
  console.log('---');
});
```

### Worktree Monitor Script

The project includes a worktree monitor script that uses the service to track changes in worktrees:

```bash
# Run the monitor
bun run worktree-monitor
```

The script provides real-time updates about:
- Worktree status changes
- New commits
- Changed files
- Task information

## Error Handling

The module includes custom error types:
- `WorktreeNotFoundError`: When a worktree doesn't exist
- `GitOperationError`: When a git operation fails
- `TaskCorrelationError`: When task metadata correlation fails

Each service method has proper error handling with meaningful error messages.

## Performance Considerations

- Git operations are cached to minimize filesystem access
- Throttling is implemented for frequent status checks
- Efficient parsing of git output
- Default cache TTL is 30 seconds, configurable per service instance