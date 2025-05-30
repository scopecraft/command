# Task UI 2.0 Architecture Document

## Overview

Task UI 2.0 is a complete rebuild of the task management interface, designed to be a production-ready application with modern React patterns, proper data fetching, and type-safe routing. This document serves as both the migration plan and the ongoing architecture reference.

### What is Scopecraft?

Scopecraft is a Markdown-Driven Task Management (MDTM) system that organizes tasks in a filesystem-based structure:
- Tasks are markdown files with YAML frontmatter
- Tasks live in workflow folders: `backlog/`, `current/`, `archive/`
- Parent tasks are folders containing subtasks with sequence numbers (01_, 02_)
- The system supports both CLI and UI interfaces

### Core Concepts

**Task Types**: 🌟 Feature, 🐞 Bug, 🧹 Chore, 📖 Documentation, 🧪 Test, 💡 Spike/Research

**Workflow States**:
- `backlog` - Tasks not yet started
- `current` - Active work in progress
- `archive` - Completed or abandoned tasks (organized by YYYY-MM)

**Task Structure**:
- Simple tasks: Single markdown files
- Parent tasks: Folders with `_overview.md` and numbered subtasks
- Subtasks: Files within parent folders (01_setup.md, 02_implement.md)

**Task Sections**:
- Instruction: What needs to be done
- Tasks: Checklist of steps
- Deliverable: Expected outcomes
- Log: Timestamped activity history

## Technology Stack

### Core Dependencies
- **React 18+** - UI framework
- **TypeScript** - Type safety throughout
- **Vite** - Build tool (keep what works)
- **TanStack Router** - Type-safe routing with search params
- **TanStack Query** - Server state management, caching, synchronization
- **Tailwind CSS** - Styling (already in use)
- **Radix UI** - Accessible component primitives (already in use)
- **Lucide React** - Icon library
- **clsx** - Utility for constructing className strings
- **date-fns** - Date manipulation

### Installation Commands
```bash
# Create new TanStack Router project with file-based routing and Tailwind CSS
npx create-tsrouter-app@latest task-ui-2 --template file-router --tailwind
cd task-ui-2

# Install additional dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install lucide-react clsx date-fns

# The create-tsrouter-app with these flags includes:
# - TanStack Router with file-based routing
# - TypeScript configuration
# - Vite setup
# - Tailwind CSS pre-configured
# - Route generation scripts
```

### Why This Stack?
- **TanStack Router**: Type-safe routes, search params as first-class citizens, route loaders
- **TanStack Query**: Eliminates manual refresh, automatic background refetching, optimistic updates
- **Together**: Perfect integration, shared concepts, excellent DX

## API Connection

### MCP Server Details
The MCP (Model Context Protocol) server runs on `http://localhost:3500/mcp` and provides:
- Session-based connection (requires initialization)
- JSON-RPC 2.0 protocol
- All task CRUD operations
- Parent task management
- Workflow transitions

### MCP Client Setup
```typescript
// lib/mcp-client.ts
const MCP_BASE_URL = import.meta.env.VITE_MCP_URL || 'http://localhost:3500/mcp'

// Session management is critical!
let sessionId: string | null = null

async function initializeSession() {
  const response = await fetch(MCP_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '0.1.0',
        capabilities: { roots: true },
        clientInfo: { name: 'Task UI 2.0', version: '2.0.0' }
      },
      id: 1
    })
  })
  
  sessionId = response.headers.get('mcp-session-id')
  if (!sessionId) throw new Error('Failed to initialize MCP session')
}
```

## Route Architecture

### Route Structure
```
/                                    # Dashboard (redirect to /tasks)
/tasks                              # Task list (all tasks)
  ?location=current|backlog|archive # Filter by workflow state
  ?type=feature|bug|chore          # Filter by type
  ?status=todo|progress|done       # Filter by status
  ?view=table|kanban|tree          # View mode
  
/tasks/:taskId                      # Task detail view
  ?mode=view|edit                   # View or edit mode

/parents                            # Parent task list
  ?location=current|backlog|archive # Filter by workflow state
  
/parents/:parentId                  # Parent task detail
  ?tab=overview|subtasks|activity   # Tab selection
  
/parents/:parentId/:subtaskId       # Subtask detail (nested route)

/workflow                           # Workflow dashboard
  /workflow/current                 # Current sprint view
  /workflow/planning                # Backlog planning view
  /workflow/archive                 # Archived tasks by month
  
/search                            # Global search
  ?q=search+terms                  # Search query
  ?in=tasks|content|all           # Search scope

/settings                          # App settings
  /settings/projects              # Project configuration
  /settings/preferences           # User preferences
```

### Route to MCP Endpoint Mapping

| Route | MCP Methods | Purpose |
|-------|-------------|----------|
| `/tasks` | `task_list` with filters:<br>- `location`: from URL param<br>- `type`: from URL param<br>- `status`: from URL param<br>- `task_type`: 'simple' (no parents)<br>- `include_content`: false (list view) | Display filterable task list |
| `/tasks/:taskId` | `task_get` with:<br>- `id`: from route param<br>- `format`: 'full'<br>- `parent_id`: if subtask (detect from ID) | Show full task details |
| `/tasks/:taskId?mode=edit` | `task_get` + `task_update` | Edit mode uses same get, then update on save |
| `/parents` | `parent_list` with:<br>- `location`: from URL param<br>- `include_progress`: true<br>- `include_subtasks`: false | List all parent tasks with progress |
| `/parents/:parentId` | `task_get` with:<br>- `id`: parentId<br>- `format`: 'full'<br>+ `task_list` with:<br>- `parent_id`: parentId<br>- `include_content`: true | Parent overview + subtask list |
| `/parents/:parentId/:subtaskId` | `task_get` with:<br>- `id`: subtaskId<br>- `parent_id`: parentId<br>- `format`: 'full' | Subtask detail with parent context |
| `/workflow/current` | `workflow_current` or<br>`task_list` with:<br>- `location`: 'current'<br>- `status`: 'In Progress' | Active work dashboard |
| `/workflow/planning` | `task_list` with:<br>- `location`: 'backlog'<br>- `task_type`: 'top-level' | Planning view of backlog |
| `/workflow/archive` | `task_list` with:<br>- `location`: 'archive'<br>- `include_archived`: true<br>Group by archive date in UI | Historical view |
| `/search?q=term` | `task_list` with:<br>- All locations<br>- `include_content`: true<br>Then client-side search | Global search (no server search API) |
| `/settings/projects` | `list_projects`<br>`get_current_root`<br>`init_root` | Project root management |

### Key Architectural Decisions

1. **Simple Tasks vs Parent Tasks**: Two different list views (`/tasks` and `/parents`) because they have different UI needs and filters

2. **Subtask Routes**: Nested under parent (`/parents/:parentId/:subtaskId`) to maintain context

3. **Search Strategy**: Client-side search because MCP doesn't have search endpoint - fetch all with content and filter in browser

4. **Workflow Views**: Separate routes for different workflow states rather than just filters, emphasizing workflow-first approach

5. **No Area Routes**: Areas are just filters, not first-class routes (different from V1)

## Data Architecture with TanStack Query

### Critical MCP Operations Needed

| Operation | MCP Method | When Used | Mutation? |
|-----------|------------|-----------|------------|
| List all tasks | `task_list` | Task list page, search | Query |
| Get task details | `task_get` | Task detail view, edit form | Query |
| Create task | `task_create` | New task button/form | Mutation |
| Update task | `task_update` | Edit form save, status change, quick edits | Mutation |
| Delete task | `task_delete` | Delete button | Mutation |
| Move task | `task_move` | Workflow state change (backlog→current) | Mutation |
| List parent tasks | `parent_list` | Parent task list view | Query |
| Create parent | `parent_create` | New parent task | Mutation |
| Parent operations | `parent_operations` | Reorder subtasks, make parallel | Mutation |
| Transform task | `task_transform` | Promote to parent, extract subtask | Mutation |
| Get templates | `template_list` | New task form | Query |
| Complete task | `workflow_mark_complete_next` | Mark done button | Mutation |
| Current workflow | `workflow_current` | Dashboard widget | Query |
| Project config | `get_current_root`, `init_root` | Settings page | Query/Mutation |

### Query Strategy

1. **List Views**: Always use `task_list` with appropriate filters
2. **Detail Views**: Use `task_get` with full format
3. **Parent Views**: Combine `task_get` for overview + `task_list` for subtasks
4. **Mutations**: Invalidate related queries after success
5. **Optimistic Updates**: For status changes and quick edits only

### Mutation Operations Required

| User Action | MCP Method | Optimistic? | Invalidates |
|-------------|------------|-------------|-------------|
| Change task status | `task_update` with status | Yes | Task detail, task lists |
| Edit task content | `task_update` with sections | No | Task detail |
| Create new task | `task_create` | No | Task lists, parent progress |
| Delete task | `task_delete` | Yes | Task lists, parent progress |
| Move to current | `task_move` to 'current' | Yes | All task lists |
| Archive task | `task_move` to 'archive' | Yes | All task lists |
| Reorder subtasks | `parent_operations` resequence | No | Parent detail, subtask list |
| Make tasks parallel | `parent_operations` parallelize | No | Parent detail, subtask list |
| Convert to parent | `task_transform` promote | No | Task lists (changes structure) |
| Extract subtask | `task_transform` extract | No | Parent detail, task lists |
| Add log entry | `task_update` with add_log_entry | No | Task detail only |

### Real-time Updates Strategy

```typescript
// hooks/useRealtimeSync.ts
export const useRealtimeSync = () => {
  const queryClient = useQueryClient()
  
  // Poll for updates when window is focused
  useEffect(() => {
    const onFocus = () => {
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.lists(),
        refetchType: 'active' 
      })
    }
    
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])
  
  // Optional: WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket('/ws')
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      
      switch (update.type) {
        case 'task:updated':
          queryClient.setQueryData(
            taskKeys.detail(update.id),
            update.data
          )
          break
        case 'task:created':
          queryClient.invalidateQueries({ 
            queryKey: taskKeys.lists() 
          })
          break
      }
    }
    
    return () => ws.close()
  }, [])
}
```

## Component Architecture

### Folder Structure
```
src/
├── routes/              # Route components
│   ├── __root.tsx      # Root layout with providers
│   ├── index.tsx       # Home/redirect
│   ├── tasks/
│   │   ├── index.tsx   # Task list
│   │   └── $taskId.tsx # Task detail
│   ├── parents/
│   │   ├── index.tsx   # Parent list
│   │   ├── $parentId/
│   │   │   ├── index.tsx    # Parent detail
│   │   │   └── $subtaskId.tsx # Subtask detail
│   └── workflow/
│       ├── index.tsx   # Workflow dashboard
│       ├── current.tsx # Current sprint
│       └── archive.tsx # Archive view
│
├── components/         # Reusable components
│   ├── tasks/         # Task-specific components
│   ├── parents/       # Parent task components
│   ├── workflow/      # Workflow components
│   └── ui/           # Generic UI components
│
├── queries/           # TanStack Query definitions
│   ├── tasks.ts
│   ├── parents.ts
│   └── workflow.ts
│
├── mutations/         # Mutation hooks
│   ├── tasks.ts
│   └── parents.ts
│
├── hooks/            # Custom hooks
│   ├── useTaskFilters.ts
│   ├── useRealtimeSync.ts
│   └── useKeyboardShortcuts.ts
│
├── lib/              # Utilities
│   ├── mcp-client.ts # MCP API client
│   └── utils.ts
│
└── types/            # TypeScript types
    └── index.ts

### Essential Type Definitions
```typescript
// types/index.ts
export type TaskType = '🌟 Feature' | '🐞 Bug' | '🧹 Chore' | '📖 Documentation' | '🧪 Test' | '💡 Spike/Research'
export type TaskStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked' | 'Archived'
export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low'
export type WorkflowState = 'backlog' | 'current' | 'archive'

export interface V2TaskMetadata {
  title: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  area?: string
  assignee?: string
  tags?: string[]
  created_date?: string
  updated_date?: string
}

export interface V2Task {
  id: string
  path: string
  location: WorkflowState
  parent_id?: string
  is_parent?: boolean
  metadata: V2TaskMetadata
  document?: {
    metadata: V2TaskMetadata
    sections?: {
      instruction?: string
      tasks?: string
      deliverable?: string
      log?: string
    }
  }
}

export interface V2ParentTask extends V2Task {
  is_parent: true
  subtasks?: V2Task[]
  progress?: {
    total: number
    completed: number
    in_progress: number
    blocked: number
  }
}
```
```

### Component Patterns

#### Route Components
```typescript
// routes/tasks/$taskId.tsx
export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailRoute,
  loader: ({ params }) => 
    queryClient.ensureQueryData(taskQueries.detail(params.taskId)),
  errorComponent: TaskErrorBoundary,
  pendingComponent: TaskDetailSkeleton,
})

function TaskDetailRoute() {
  const { taskId } = Route.useParams()
  const { mode = 'view' } = Route.useSearch()
  const { data: task } = useSuspenseQuery(taskQueries.detail(taskId))
  
  return mode === 'edit' 
    ? <TaskEditView task={task} />
    : <TaskDetailView task={task} />
}
```

#### Smart vs Presentational Components
```typescript
// components/tasks/TaskCard.tsx (Presentational)
interface TaskCardProps {
  task: Task
  onStatusChange?: (status: TaskStatus) => void
  onEdit?: () => void
}

export function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  // Pure UI component, no data fetching
}

// components/tasks/TaskCardContainer.tsx (Smart)
export function TaskCardContainer({ taskId }: { taskId: string }) {
  const { data: task } = useQuery(taskQueries.detail(taskId))
  const updateStatus = useUpdateTaskStatus()
  const navigate = useNavigate()
  
  return (
    <TaskCard
      task={task}
      onStatusChange={(status) => updateStatus.mutate({ taskId, status })}
      onEdit={() => navigate({ to: '/tasks/$taskId', params: { taskId }, search: { mode: 'edit' } })}
    />
  )
}
```

## State Management

### Server State (TanStack Query)
- All API data managed by TanStack Query
- No Redux/Zustand needed for server state
- Automatic caching, refetching, synchronization

### Client State (Minimal)
- URL state for filters (managed by router)
- UI state (modals, toggles) in local component state
- User preferences in localStorage + settings query

### Eliminated Contexts
These manual contexts are replaced by TanStack Query:
- ❌ TaskContext → ✅ useQuery(taskQueries.list())
- ❌ FeatureContext → ✅ useQuery(parentQueries.list())
- ❌ PhaseContext → ✅ URL state (workflow filter)
- ❌ AreaContext → ✅ URL state (area filter)

## UI Component Requirements

### Essential Views to Build

1. **Task List View** (`/tasks`)
   - Table with columns: Type icon, Title, Status, Priority, Area, Assignee
   - Inline status change dropdown
   - Row click → detail view
   - Bulk selection for operations
   - Filter panel (workflow state, type, status)

2. **Parent Task List** (`/parents`)
   - Card layout showing progress bars
   - Subtask count badges
   - Expandable to show subtask list inline
   - Quick add subtask button

3. **Task Detail View** (`/tasks/:id`)
   - Header: Type, Title (editable), Status dropdown
   - Tabs: Instruction | Tasks | Deliverable | Log
   - Markdown rendering for content
   - Edit mode: Same layout but with textareas
   - Action bar: Edit, Move, Convert to Parent, Delete

4. **Parent Detail View** (`/parents/:id`)
   - Overview card with progress
   - Subtask list with drag handles for reordering
   - Parallel task indicators (same sequence number)
   - Add subtask inline form
   - Bulk actions: Make parallel, Resequence

5. **Workflow Dashboard** (`/workflow`)
   - Three columns: Backlog | Current | Done
   - Drag between columns to move tasks
   - Quick filters by area/assignee
   - "Start Sprint" to move backlog → current

### Components That Must Handle MCP Data

- **TaskTable**: Receives task list, emits status changes
- **TaskForm**: Load task data, submit updates
- **WorkflowBoard**: Multiple task lists, drag handlers
- **SubtaskManager**: Reorder, parallelize operations
- **TaskMover**: Workflow state transitions with confirmation

## Migration Strategy

### Phase 1: New Project Setup (Day 1)

#### 1. Project Initialization
```bash
# Create project and install dependencies (see Installation Commands above)
# Initialize Tailwind
npx tailwindcss init -p
```

#### 2. Configure Tailwind
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
```

#### 3. Set up Router
```typescript
// src/main.tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

#### 4. Create Root Route
```typescript
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  ),
})
```

#### 5. Run Route Generation
```bash
# Add to package.json scripts
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "routes": "tsr generate"
}

# Generate route tree
npm run routes
```

### Phase 2: Component Migration (Day 2-3)

#### Components to Copy
From `tasks-ui/src/components/v2/`:
- `TaskTable.tsx` - Main task list table
- `TaskTypeIcon.tsx` - Task type icons
- `WorkflowStateBadge.tsx` - Status badges
- `ParentTaskCard.tsx` - Parent task display
- `SubtaskList.tsx` - Subtask management
- `ClaudeAgentButton.tsx` - AI integration
- `Sidebar.tsx` - Navigation sidebar

From `tasks-ui/src/components/ui/`:
- `button.tsx`, `input.tsx`, `dialog.tsx` - UI primitives
- `search-input.tsx` - Search component
- `filter-panel.tsx` - Filter UI

#### Import Updates Required
```typescript
// Old (remove these)
import { useTaskContext } from '@/context/TaskContext'
import { useFeatureContext } from '@/context/FeatureContext'

// New (add these)
import { useQuery, useMutation } from '@tanstack/react-query'
import { taskQueries, taskKeys } from '@/queries/tasks'
```

#### Context to Query Migration
```typescript
// Old pattern
const { tasks, loading, error, refetch } = useTaskContext()

// New pattern
const { data: tasks, isLoading, error, refetch } = useQuery(taskQueries.list(filters))
```

### Phase 3: Feature Parity (Day 4)
1. Implement all CRUD operations
2. Add optimistic updates
3. Set up real-time sync
4. Add keyboard shortcuts

### Phase 4: Enhancements (Day 5)
1. Add features not possible before:
   - Instant search with caching
   - Offline support
   - Background sync
   - Undo/redo for mutations
2. Performance optimizations

## Benefits of This Architecture

### For Users
- **No more manual refresh** - Data updates automatically
- **Instant navigation** - Cached data loads instantly
- **Optimistic updates** - UI updates immediately
- **Offline support** - Works without connection
- **Better performance** - Smart caching and prefetching

### For Developers
- **Type-safe everything** - Routes, params, queries
- **Less code** - No manual state management
- **Better DX** - Hot reload, devtools, error boundaries
- **Easier testing** - Mockable queries, isolated components
- **Maintainable** - Clear patterns and organization

## Performance Considerations

### Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      cacheTime: 10 * 60 * 1000,    // 10 minutes  
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})
```

### Route Prefetching
```typescript
// Prefetch on hover
<Link
  to="/tasks/$taskId"
  params={{ taskId }}
  onMouseEnter={() => 
    queryClient.prefetchQuery(taskQueries.detail(taskId))
  }
>
```

### Bundle Splitting
- Route-based code splitting automatic with TanStack Router
- Lazy load heavy components (editors, charts)
- Separate vendor chunks

## Future Enhancements

### Planned Features
1. **Command palette** (Cmd+K) for quick navigation
2. **Bulk operations** with selection
3. **Drag-and-drop** for task reordering
4. **Rich text editing** for task content
5. **File attachments** support
6. **Activity feed** with real-time updates
7. **Collaborative editing** indicators

### Extension Points
- Plugin system for custom task types
- Custom workflow states
- Integration with external tools
- Export/import functionality

## Success Metrics
- [ ] Page load time < 1s
- [ ] Time to interactive < 2s  
- [ ] Zero manual refreshes needed
- [ ] All actions give instant feedback
- [ ] Works offline for read operations
- [ ] Accessible (WCAG 2.1 AA)

## Data Flow Examples

### Example 1: Loading Task List
```
User navigates to /tasks?location=current&type=feature
↓
Route loader calls: task_list({ location: 'current', type: '🌟 Feature', task_type: 'simple' })
↓
MCP returns: Array of V2Task objects
↓
UI renders: TaskTable component with filtering
```

### Example 2: Changing Task Status
```
User clicks status dropdown → selects "In Progress"
↓
Mutation calls: task_update(id, { status: 'In Progress' })
↓
Optimistic update: Change UI immediately
↓
MCP responds: Updated task object
↓
Invalidate queries: Task lists refresh in background
```

### Example 3: Creating Parent Task
```
User clicks "New Parent Task" → fills form
↓
Mutation calls: parent_create({ title, type, subtasks: [...] })
↓
MCP responds: Parent task with generated ID and subtask structure
↓
Redirect to: /parents/{new-id}
↓
Queries run: task_get(parentId) + task_list({ parent_id: parentId })
```

## Common Pitfalls & Solutions

### 1. MCP Session Management
**Problem**: Session expires or connection lost
**Solution**: Implement reconnection logic in MCP client
```typescript
async function callMCPMethod<T>(method: string, params?: any): Promise<T> {
  try {
    return await _callMethod(method, params)
  } catch (error) {
    if (error.message.includes('session')) {
      await initializeSession()
      return await _callMethod(method, params)
    }
    throw error
  }
}
```

### 2. TypeScript Strictness
**Problem**: Type errors with V2 data structures
**Solution**: Use type guards and proper null checking
```typescript
function isParentTask(task: V2Task): task is V2ParentTask {
  return task.is_parent === true
}
```

### 3. Query Key Consistency
**Problem**: Cache invalidation not working
**Solution**: Always use the key factory pattern
```typescript
// Good
queryClient.invalidateQueries({ queryKey: taskKeys.all })

// Bad
queryClient.invalidateQueries({ queryKey: ['tasks'] })
```

## Testing Strategy

### Local Development Setup
1. Start MCP server: `bun run mcp:http` (port 3500)
2. Start UI dev server: `npm run dev` (port 5173)
3. Create test data using CLI: `bun run dev:cli task create --title "Test Task" --type feature`

### Verify Integration
```typescript
// Quick test in browser console
const response = await fetch('http://localhost:3500/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'task_list',
    params: { location: 'current' },
    id: 1
  })
})
console.log(await response.json())
```

## Deployment Considerations

### Environment Variables
```bash
# .env.local
VITE_MCP_URL=http://localhost:3500/mcp
VITE_API_TIMEOUT=30000
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/mcp': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
    },
  },
})
```

## Conclusion

Task UI 2.0 represents a significant upgrade in architecture and user experience. By leveraging modern React patterns and the TanStack ecosystem, we eliminate common pain points while adding powerful new capabilities. The migration path is clear and can be executed incrementally, ensuring we maintain momentum while building a solid foundation for the future.

### Quick Reference Commands
```bash
# Start everything
bun run mcp:http        # Start MCP server
npm run dev            # Start UI dev server

# Create test data
bun run dev:cli task create --title "Test" --type feature
bun run dev:cli parent create --title "Epic" --type feature

# Check MCP is running
curl -X POST http://localhost:3500/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"task_list","id":1}'
```