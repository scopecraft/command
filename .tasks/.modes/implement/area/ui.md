# UI Area Guide

## Quick Architecture Overview
The UI (tasks-ui) is a modern React application using TanStack Router, React Query, Tailwind CSS, and Storybook. It features URL-based filtering, real-time data updates, and a CLI-inspired design system.

**IMPORTANT**: See `tasks-ui/README.md` for full architecture details.

## Technology Stack
- **TanStack Router** - File-based routing with type safety
- **React Query** - Server state management with caching
- **Tailwind CSS** - Utility-first styling
- **Storybook** - Component development and documentation
- **Zod** - Runtime validation for search params
- **Bun** - High-performance server runtime

## Key Files and Utilities

### UI Structure (tasks-ui)
- `tasks-ui/src/main.tsx` - App entry with React Query setup
- `tasks-ui/src/routes/` - File-based routing
- `tasks-ui/src/components/` - Component library
- `tasks-ui/src/lib/api/client.ts` - Comprehensive API client
- `tasks-ui/src/lib/api/hooks.ts` - React Query hooks
- `tasks-ui/server.ts` - Bun API server (:8899)
- `tasks-ui/.storybook/` - Storybook configuration

### Component Organization
```
components/
├── TaskTable.tsx        - Main task list display
├── ParentTaskCard.tsx   - Parent task with subtasks
├── SubtaskList.tsx      - Subtask management
├── TaskTypeIcon.tsx     - Consistent task icons
├── WorkflowStateBadge.tsx - Status badges
├── Sidebar.tsx          - Navigation sidebar
├── MetadataEditor/      - Task metadata editing
└── ui/                  - Base UI components
```

### API Integration
```typescript
// Using React Query hooks
import { useTasks, useParentTask } from '@/lib/api/hooks';

// API client
import { apiClient } from '@/lib/api/client';
```

## Storybook-First Development

**IMPORTANT**: When creating new UI components or features, ALWAYS prototype in Storybook first!

### Storybook Workflow
```bash
# Start Storybook
bun run storybook

# Create a new story file BEFORE the component
touch tasks-ui/src/components/NewComponent.stories.tsx
```

### Story Structure
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NewComponent } from './NewComponent';

const meta = {
  title: 'Components/NewComponent',
  component: NewComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NewComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Design variations FIRST
export const Default: Story = {
  args: {
    // Props
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Something went wrong',
  },
};
```

### Benefits of Storybook-First
1. **Rapid iteration** - No need to navigate through app
2. **Edge case testing** - Easy to test all states
3. **Documentation** - Stories serve as live docs
4. **Isolation** - Focus on component behavior
5. **Review-friendly** - Stakeholders can review in Storybook

## Common Patterns

### Component Structure
```tsx
interface TaskCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  // 1. State and hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. Event handlers
  const handleSave = async () => {
    // Implementation
  };
  
  // 3. Render
  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Component content */}
    </div>
  );
}
```

### API Hooks Pattern
```tsx
// Custom hook for data fetching
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => apiClient.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Styling with Tailwind
```tsx
// Use consistent spacing and colors
<div className="space-y-4">
  <h2 className="text-2xl font-bold">Tasks</h2>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {/* Grid items */}
  </div>
</div>

// CLI-inspired styling
<pre className="bg-black text-green-400 p-4 rounded font-mono">
  {output}
</pre>
```

### State Management
```tsx
// Local state for UI
const [filter, setFilter] = useState<Filter>();

// Server state with React Query
const { data, isLoading, error } = useTasks(filter);

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateTask,
  onMutate: async (newTask) => {
    // Optimistically update UI
  },
});
```

## Do's and Don'ts

### Do's
- ✅ ALWAYS create Storybook stories first
- ✅ Use existing components from tasks-ui
- ✅ Follow the new tech stack (TanStack Router, React Query)
- ✅ Store filters in URL search params
- ✅ Use Zod for search param validation
- ✅ Make UI responsive (mobile-first)
- ✅ Handle all states in stories (loading, error, empty)
- ✅ Use TypeScript strictly
- ✅ Test in Storybook before integrating
- ✅ Use consistent Tailwind spacing

### Don'ts
- ❌ Create components without stories
- ❌ Use inline styles
- ❌ Skip Storybook prototyping
- ❌ Forget accessibility testing in stories
- ❌ Make direct API calls (use React Query hooks)
- ❌ Use any TypeScript type
- ❌ Hard-code values that should be props

## Testing Approach

### Storybook Testing
```bash
# Test all component states in Storybook
bun run storybook

# Visual regression testing
# - Check all story variations
# - Test responsive breakpoints
# - Verify keyboard navigation
# - Check accessibility
```

### Development Testing
```bash
# Full stack development (recommended)
bun run ui:dev
# Opens: http://localhost:3000

# Or run separately:
bun run ui:dev:api    # API server on :8899
bun run ui:dev:ui     # Vite dev on :3000

# Build and preview
bun run ui:build
bun run ui:preview
```

### Manual E2E Testing
- Create/update tasks through UI
- Test URL filter persistence
- Verify real-time updates
- Check error states
- Test responsive design

## Data Flow Architecture
```
User Action → Component → React Query Hook → API Client 
→ Vite Proxy (:3000) → Bun Server (:8899) → MCP Handlers → V2 Core
```

Key points:
- React Query handles caching and refetching
- URL params persist filter state
- 30-second auto-refresh when visible
- Optimistic updates for better UX

## Related Documentation
- **Full Architecture**: `tasks-ui/README.md` (MUST READ!)
- **Components**: `tasks-ui/src/components/`
- **Example Stories**: Check Storybook for component examples
- **API Integration**: `tasks-ui/src/lib/api/`

## Common Tasks for UI Area
- Building new components (Storybook first!)
- Adding new routes/pages
- Implementing URL-based filters
- Creating React Query hooks
- Improving loading/error states
- Enhancing mobile responsiveness
- Adding keyboard shortcuts
- Writing comprehensive stories