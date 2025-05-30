# V2 API Implementation Plan

## Overview
We need to connect the already-built V2 UI components to the production-ready MCP server. The UI was built with mock providers, and now we need to swap in real data.

## Current State Analysis

### What We Have
1. **V2 UI Components** (Already Built):
   - ParentTaskCard, SubtaskList, TaskTable, WorkflowStateBadge
   - TaskManagementView, V2Showcase with all view templates
   - MockTaskProvider with fake data

2. **MCP Server** (Production Ready):
   - Full V2 API with all endpoints documented
   - HTTP transport at `/mcp` endpoint
   - Session-based communication

3. **Existing V1 API Client**:
   - `core-client.ts` with REST-style calls
   - Used by old components (being replaced)

## Key API Differences to Handle

### Endpoint Mapping
| V1 Endpoint | V2 MCP Method | Key Differences |
|-------------|---------------|-----------------|
| GET /api/tasks | task_list | - V2 uses workflow states not phases<br>- Different filter params<br>- Returns V2Task structure |
| GET /api/tasks/:id | task_get | - Needs parent_id for subtasks<br>- Different response structure |
| POST /api/tasks | task_create | - Auto-generates IDs<br>- Location instead of phase |
| PUT /api/tasks/:id | task_update | - Section-based updates<br>- Add log entries |
| DELETE /api/tasks/:id | task_delete | - Cascade option for parents |
| GET /api/phases | ❌ No equivalent | Phases removed in V2 |
| GET /api/features | parent_list | Features are now parent tasks |
| POST /api/tasks/move | task_move | Workflow state transitions |

### Data Structure Changes
```typescript
// V1 Task
{
  id: string,
  title: string,
  phase: string,
  subdirectory: string,
  content: string,
  // ...
}

// V2 Task  
{
  id: string,
  title: string,
  location: WorkflowState,
  parent_id?: string,
  path: string,
  document: {
    metadata: V2TaskMetadata,
    sections: {
      instruction: string,
      tasks: string,
      deliverable: string,
      log: string
    }
  }
}
```

## Implementation Approach

### Phase 1: MCP Client Foundation (2-3 hours)
Build minimal MCP client with:
1. Session management (initialize, maintain session ID)
2. Core method caller with error handling
3. Just the methods we actively use:
   - `listTasks()` - For task lists/tables
   - `getTask()` - For detail views  
   - `updateTask()` - For status changes, edits
   - `createTask()` - For new tasks
   - `moveTask()` - For workflow transitions
   - `listParentTasks()` - For parent task views

### Phase 2: Data Adapters (1-2 hours)
Create adapters to handle the transition:
```typescript
// Adapt V2 data to match what UI expects during transition
export function adaptV2Response(v2Task: V2Task): UITask {
  return {
    ...v2Task,
    content: v2Task.document?.sections?.instruction || '',
    phase: v2Task.location, // Map workflow state to "phase" temporarily
    // etc.
  };
}
```

### Phase 3: TaskContext Integration (2-3 hours)
1. Create `RealTaskProvider` that uses MCP client
2. Keep `MockTaskProvider` for Storybook stories
3. Update `TaskContext` to switch between them
4. Handle loading states and errors

### Phase 4: Test & Fix (2-3 hours)
1. Test each showcase view with real data
2. Fix type mismatches as we find them
3. Update components that need adjustments
4. Ensure create/update/delete flows work

## Technical Implementation Details

### MCP Client Structure
```typescript
// mcp-client.ts
class MCPClient {
  private sessionId: string | null = null;
  
  // Initialize session on first call
  private async ensureSession() { ... }
  
  // Generic method caller
  private async call<T>(method: string, params?: any): Promise<T> { ... }
  
  // Public API matching our needs
  async listTasks(filters?: TaskListParams) { ... }
  async getTask(id: string, parentId?: string) { ... }
  // etc.
}
```

### Session Management
- Initialize on first API call
- Store session ID for subsequent requests  
- Handle session expiry/reconnection
- Clean up on page unload

### Error Handling
- Convert MCP errors to user-friendly messages
- Retry logic for network failures
- Fallback to cached data where appropriate

## Migration Strategy

### What Stays the Same
- Component structure and props
- UI logic and interactions  
- Storybook stories (still use mocks)

### What Changes
- TaskContext provider implementation
- API calls switch from REST to MCP
- Some data transformations needed
- Error handling patterns

### Incremental Rollout
1. Start with read-only operations (list, get)
2. Add write operations (create, update)
3. Add complex operations (move, transform)
4. Remove old API client once stable

## Success Metrics
- [ ] V2 components display real task data
- [ ] CRUD operations work end-to-end
- [ ] Workflow transitions functional
- [ ] Parent/subtask relationships correct
- [ ] No regressions in existing UI
- [ ] Can dogfood our own task management

## Timeline Estimate
- **Day 1**: MCP client + TaskContext (4-5 hours)
- **Day 2**: Testing, fixes, polish (3-4 hours)
- **Total**: ~8 hours of focused work

## Next Steps
1. Build MCP client with core methods
2. Create RealTaskProvider
3. Test with V2Showcase stories
4. Fix issues as we find them
5. Ship it! 🚀