# Update Task UI for V2 Structure

---
type: chore
status: done
area: ui
assignee: null
parent: implement-v2-structure
---


## Instruction
Build a new V2 Task UI using a UI-first approach with mock providers. Replace the old phase/feature structure with the new workflow-based system. Create fresh V2 components rather than fixing existing ones.

**UPDATED APPROACH**: The MCP server is complete and production-ready. We can now adapt our UI to work with the existing MCP endpoints rather than designing new APIs. The mock providers were useful for Phase 1 design, but we can move directly to real implementation.

### Implementation Strategy
1. ✅ Create mock V2 providers for Storybook development (Phase 1)
2. ✅ Build new V2 components using mock providers (Phase 1)
3. Adapt UI to work with completed MCP API endpoints (Phase 3)
4. Build API client layer to connect to MCP server
5. Replace mock providers with real implementation
6. Document any gaps where MCP changes might be beneficial

### Key Principles
- **UI-first development** - Design drives data, not vice versa
- **Mock providers for Storybook** - No API definitions needed upfront
- **Don't fix old components** - Build V2 fresh
- **Type-safe with V2 types** - Use imported core types throughout
- **Progressive migration** - Old and new can coexist

## Tasks
### Phase 0: Storybook Groundwork (1-2 days)
- [x] Set up Storybook in tasks-ui project
- [x] Configure Storybook with Tailwind styles and essential addons
- [x] Create story for filter-panel (pure component)
- [x] Create stories for other pure components (TaskContent, TaskMetadata, Breadcrumb, Toast)
- [x] Establish component development pattern (story-first)

### Completed Analysis & Planning
- [x] Review entire tasks-ui codebase for impact analysis
- [x] Document all components that reference phases
- [x] Document all API calls that need updating
- [x] Update TypeScript types to match new structure
- [x] Create comprehensive migration analysis document
- [x] Update implementation plan with Storybook-first approach
### Phase 1: Core Components (Rename Old, Build New) ✅ COMPLETED
- [x] Rename TaskContext.tsx → TaskContext.old.tsx
- [x] Create new TaskContext with MockTaskProvider for Storybook
- [x] Build ParentTaskCard component with Storybook stories (3 variants)
- [x] Build SubtaskList component with sequence/parallel examples
- [x] Build WorkflowStateBadge component (StatusBadge, PriorityIndicator included)
- [x] Build TaskTypeIcon component (Lucide icons, no emojis)
- [x] Build TaskTable component with search and filtering
- [x] Build SearchInput component
- [x] Build TaskManagementView (complete table + search + filter experience)
- [x] Build ParentTaskDetailPage showcase
- [x] Build SimpleTaskDetailPage showcase (unified editing)
- [x] Build SubtaskDetailPage showcase (with parent context)
- [x] Build DocumentDetailPage showcase (tags, minimal header)
- [x] Build WorkflowDashboard showcase
- [x] Build MixedTaskList showcase
- [x] Build ComponentShowcase (overview of all components)
- [x] Export all components in v2/index.ts

### Phase 2: API Integration & Real Implementation ✅ COMPLETED
- [x] Review completed MCP API endpoints and adapt UI to match
- [x] Build API client layer that connects to existing MCP server
- [x] Create real TaskContext implementation (replace mock)
- [x] Map UI operations to available MCP functions
- [x] Add error handling and loading states
- [x] Test integration between UI and MCP backend
- [x] Update showcase stories to use real data (verify components work)
- [x] Consider adding React Query if caching/optimization needed
- [x] Document any gaps where MCP team changes might be needed
- [x] Set up development environment with ui2:dev scripts
- [x] Configure Vite proxy for seamless API calls
- [x] Integrate React Query with URL-based filters
- [x] Add 30-second auto-refresh when window is visible
- [x] Fix filter data mapping for live API responses

### Phase 3: Claude Assistant Integration (Updated Focus)
**Note**: Task create/edit redesign and worktree refactor have been moved to separate tasks:
- Create/Edit UI: `reds-tas-cre-and-edi-ui-for-v2-05A`
- Worktree Refactor: `refc-work-dash-for-v2-05A`

#### Completed Navigation Work
- [x] **Build ParentTaskListView** - Implemented with:
  - Uses TaskTable with subtask progress display
  - Shows subtask counts and completion percentage (e.g., "3/5 subtasks (60%)")
  - Includes progress bar visualization
  - Filter by status, workflow, area
  - Search functionality
  - Bulk actions support
  - Proper routing to parent detail pages
- [x] Build parent routes infrastructure (/parents/, /parents/$parentId, /parents/$parentId/$subtaskId)
- [x] Fix parent/subtask routing with proper Outlet handling
- [x] Add document display from parent_get response
- [x] Fix sidebar navigation with proper status values
- [x] **Fix Recent Tasks in Sidebar** - Now shows real data:
  - Queries for recently updated tasks from current and backlog
  - Shows actual task icons and titles based on task type
  - Items are clickable with proper routing (parent vs simple tasks)
  - Updates automatically every minute when window is visible
  - Also added dynamic workflow counts that update every 2 minutes

#### Claude Assistant Integration ✅ COMPLETED
- [x] **Port WebSocket Infrastructure**
  - [x] Copy WebSocket setup from `tasks-ui/websocket/` directory
  - [x] Ensure WebSocket types and schemas are compatible
  - [x] Set up WebSocket connection management
- [x] **Port Claude Components**
  - [x] Copy components from `tasks-ui/src/components/claude/`
  - [x] ConnectionStatus - Shows WebSocket connection state
  - [x] MessageStream - Displays Claude's responses
  - [x] PromptForm - Input for sending messages to Claude
  - [x] SessionButton - Session management UI
- [x] **Create Claude Routes**
  - [x] Add `/assistant` route in v2 with TanStack Router
  - [x] Create Claude assistant page using ported components
  - [x] Ensure proper layout integration
- [x] **Wire Up ClaudeAgentButton**
  - [x] Connect existing ClaudeAgentButton to start sessions
  - [x] Handle session state management
  - [x] Add proper navigation to Claude page from sidebar
- [x] **Create Storybook Demos**
  - [x] Build comprehensive PromptForm stories with all states
  - [x] Create full Claude Assistant interface stories
  - [x] Include realistic conversation flows and error states
- [ ] **Backend Integration Review** (Moved to separate task)
  - [ ] ⚠️ Backend review moved to `revw-and-fix-cla-ass-bac-intg-05A`

#### Supporting Integration ✅ COMPLETED
- [x] Ensure Toast notifications work for connection status
- [x] Add assistant link to sidebar navigation
- [x] Update any API client code for Claude endpoints
- [ ] Test with real Claude backend (moved to separate task)
### Phase 4: Basic Testing & Completion ✅ COMPLETED
- [x] Core V2 UI functionality working with MCP backend
- [x] All essential components built and tested in Storybook
- [x] Claude Assistant integration with frontend components
- [x] Real API integration with React Query

**Note**: Advanced UI features moved to separate task `Task Management UI Improvements`

## Deliverable
### Completed
- ✅ Storybook development environment configured and running
- ✅ FilterPanel story created as example of pure component development
- ✅ TypeScript types updated to use core types (no v2 prefix)
- ✅ Comprehensive UI migration analysis document with mockups
- ✅ Established .old.tsx renaming pattern for cleaner migration

### Phase Status
- ✅ Phase 1: COMPLETED - All core V2 components built with CLI-inspired design
- ✅ Phase 2: COMPLETED - React Query integration with URL-based filters and live API data
- 🔄 Phase 3: Ready to start - Pages & Navigation using showcase templates

### Phase 2 Achievements
- **API Client**: Comprehensive client with all V2 MCP endpoints
- **React Query Integration**: Hooks for tasks, parents, workflow operations with 30-second auto-refresh
- **URL-based Filters**: TanStack Router search params for persistence and sharing
- **Data Mapping**: Fixed normalization for live API responses
- **Loading States**: Proper loading and error handling throughout
- **Development Setup**: Complete ui2:dev scripts and Vite proxy configuration
- **Documentation**: Comprehensive README with architecture diagram and file links
- **Bug Report**: Identified and documented MCP handler issue (task: mcp-hnd-not-rtr-par-tas-wit-05A)

### Available V2 Components (Check Storybook for examples!)
Components exported from `v2/index.ts`:
- **TaskTypeIcon** - Icons for all task types (parent, bug, feature, etc.)
- **WorkflowStateBadge** - Shows backlog/current/archive states
- **StatusBadge** - Task status with CLI symbols (✓, →, ○, ⊗)
- **PriorityIndicator** - Priority levels (Highest, High, Medium, Low)
- **ParentTaskCard** - 3 variants (compact, default, detailed)
- **SubtaskList** - Tree and compact views with highlighting
- **TaskTable** - Full table with sorting, selection, actions
- **TaskManagementView** - Complete list view with search/filter

### Showcase Views Ready as Page Templates
- **ParentTaskDetailPage** - Parent task with overview editing
- **SimpleTaskDetailPage** - Simple task with unified content
- **SubtaskDetailPage** - Subtask with parent context
- **DocumentDetailPage** - Document view with tags
- **WorkflowDashboard** - Kanban-style workflow view
- **MixedTaskList** - Mixed parent/simple tasks
- **ComponentShowcase** - Component library overview

### Architecture Documentation
- **README.md**: Complete architecture overview with Mermaid diagram
- **Technology Stack**: TanStack Router, React Query, Bun Server, MCP integration
- **Data Flow**: Detailed explanation of component → API → MCP → filesystem flow
- **File Structure**: Links to all important files and components
- **Development Workflow**: Setup instructions and URL structure
- **Known Issues**: Documented MCP handler bug with workaround plan

## Log
- 2025-05-27: Task created as part of V2 implementation
- 2025-05-28: Completed comprehensive UI migration analysis
  - Reviewed entire tasks-ui codebase (20+ components)
  - Documented all phase/feature references and API changes needed
  - Updated TypeScript types to import v2 core types
  - Created detailed migration analysis with mockups and implementation strategy
  - Identified 4-phase implementation approach with risk assessment
  - Generated 15 design questions for review and decision-making
- 2025-05-29: Set up Storybook development environment
  - Successfully installed Storybook with React Vite support
  - Configured preview.ts to include Tailwind CSS styles
  - Created first story for FilterPanel component (pure component)
  - Demonstrated various filter states and interactive behavior
  - Established foundation for component-first development
  - Added root-level scripts for easy Storybook access
  - Cleaned up example stories and assets
- 2025-05-29: Revised implementation strategy for UI-first development
  - Identified that current components are tightly coupled to context
  - Initially considered React Query but realized it forces API-first approach
  - Decided on mock providers for true UI-first development
  - Build V2 components with mock data, define APIs after UI stabilizes
  - React Query becomes optional future enhancement
  - Focus on designing UI without backend constraints
- 2025-05-29: Completed Phase 1 foundation - Context setup with mock providers
  - Successfully renamed TaskContext.tsx → TaskContext.old.tsx  
  - Created new V2-compatible TaskContext with comprehensive interface
  - Built MockTaskProvider for Storybook development with realistic V2 data
  - Added mock-data-v2.ts with parent tasks, subtasks, and workflow examples
  - Created interactive Storybook story demonstrating context operations
  - All TypeScript checks pass - no breaking changes detected
  - Ready to build first V2 components (ParentTaskCard, SubtaskList, etc.)
- 2025-05-29: Completed Phase 1 - Beautiful V2 component creation with CLI-inspired design
  - Built TaskTypeIcon with full task type support (📁 parent, 📄 simple, 🐛 bug, 🌟 feature, etc.)
  - Created WorkflowStateBadge, StatusBadge, PriorityIndicator with CLI status symbols (✓ Done, → In Progress, ○ To Do, ⊗ Blocked)
  - Developed ParentTaskCard with 3 variants (compact, default, detailed) for different use cases
  - Implemented SubtaskList with sophisticated tree view matching CLI patterns:
    - Proper sequence ordering (01, 02, 03...)
    - Parallel task visualization (04a, 04b with ├─┬ structure)
    - Clean tree characters (├──, └──, │) like CLI output
    - Multiple display modes (tree, compact, flat)
  - Created comprehensive Storybook stories for all components showing:
    - All variants and configurations
    - Realistic mock data scenarios
    - CLI comparison examples
    - Interactive demos
  - Built complete showcase stories demonstrating:
    - Full parent task detail page layout
    - Workflow dashboard with kanban-style columns  
    - Mixed task list views
    - Component library overview
  - All components follow design principles: clean, accessible, better than before
  - Created component index for easy importing
- 2025-05-29: 2025-05-29: Completed major UX improvements to parent task detail layout
  - Streamlined header by removing separate Quick Actions section
  - Condensed title/badges/tags to 2 lines instead of 3 for better space efficiency  
  - Integrated Start Agent button directly into header
  - Added Documents widget to sidebar for future document management
  - Documents widget follows same design patterns as Subtasks (consistent headers, actions, spacing)
  - Included sample document types (PRD, Technical Spec, Research) with type icons and metadata
  - Replaced all emojis with professional Lucide icons:
    - GitBranch icon for Subtasks (represents task hierarchy/dependencies)
    - Files icon for Documents (clearly indicates multiple documents)
  - Updated Button components to use proper design system instead of inline styles
  - All buttons now use atlas theme with consistent hover effects and focus states
  - Layout now prioritizes content over chrome - cleaner, more professional appearance
  - Ready for Phase 2: Navigation & Routing Implementation
- 2025-05-29: Completed Phase 1 showcase views
  - Built SimpleTaskDetailPage showcase with full task detail layout:
    - Header with task icon, title, status/priority/workflow badges
    - Action bar for task operations (move, archive, duplicate, delete)
    - 4 document sections (Instruction, Tasks, Deliverable, Log) with edit buttons
    - Sidebar widgets for related tasks, activity feed, and quick stats
    - Professional layout using atlas theme buttons throughout
  - Built SubtaskDetailPage showcase with subtask-specific features:
    - Parent task breadcrumb navigation
    - Subtask navigation bar with prev/next controls
    - Sibling subtasks list with highlight support
    - Parent task overview widget with progress tracking
    - Dependencies widget for future relationship management
  - Added highlight functionality to SubtaskList component:
    - Both tree and compact variants support highlightTaskId prop
    - Highlighted tasks show with primary color background and border
    - Enables current subtask indication in detail views
  - All showcases demonstrate realistic V2 workflow with proper data structures
  - Components ready for Phase 2 integration into actual pages
- 2025-05-29: Simplified task detail views for consistency
  - Unified all task detail pages to follow parent task pattern:
    - Single editable content area instead of 4 separate sections
    - Consistent header structure across all types
    - Same editing experience (textarea with markdown)
  - Removed unnecessary one-off widgets:
    - Activity Feed (was only in simple tasks)
    - Quick Stats (was only in simple tasks)  
    - Parent Task Overview (was only in subtasks)
    - Dependencies (was only in subtasks)
  - Visual consistency improvements:
    - Updated sibling subtasks widget to use SubtasksIcon
    - Removed extra navigation bars for cleaner appearance
    - Normalized badge and metadata display
  - Added DocumentDetailPage showcase:
    - Follows same layout pattern as tasks
    - Shows document navigation in sidebar
    - Links back to parent task context
  - Result: Cleaner, more predictable UI that's easier to understand
- 2025-05-29: Completed V2 Sidebar and ClaudeAgentButton
  - Created V2 Sidebar with collapsible sections matching existing UI patterns:
    - Navigation section with quick filters for Tasks and Parent Tasks (To Do, In Progress, All)
    - Workflow section showing backlog/current/archive with counts
    - Recent tasks section showing last 5 tasks with proper icons
    - Single "New Task" button at bottom (simplified from 2 buttons)
  - Built ClaudeAgentButton component:
    - Atlas variant styling with chevron icon
    - Three states: Default, Starting (disabled), Active (with pulse indicator)
    - Proper session state management for future Claude integration
  - Fixed icon system usage:
    - Sidebar now uses shared TaskTypeIcon from lib/icons.tsx
    - Removed duplicate icon mappings
    - Consistent icon usage across all V2 components
  - Created Storybook stories demonstrating functionality
  - Removed redundant theme/responsive stories (Storybook handles these)
  - Phase 1 is now FULLY COMPLETED with all core components ready
- 2025-05-30: Phase 2 API Integration completed - Built comprehensive React Query integration with URL-based filters. Created API client with all V2 MCP endpoints, added hooks for tasks/parents/workflow operations, configured 30-second auto-refresh when window visible, integrated filters with TanStack Router search params for URL persistence, fixed filter data mapping for live API responses, and added proper loading/error states. Task management page now shows real-time data with working filters that persist in URL.
- 2025-05-30: Phase 3 routing implementation completed - Implemented dedicated /parents/ routes architecture with parent list, parent detail, and subtask views. Fixed React hooks ordering issue in parent route, added Outlet for proper nested routing, resolved SubtaskList key warnings, integrated supporting documents display from parent_get response with smart type detection. Parent routes now work correctly with /parents/$parentId for parent tasks and /parents/$parentId/$subtaskId for subtasks. Documents widget displays actual files from MCP response.
- 2025-05-30: Fixed Recent Tasks in Sidebar - Replaced hardcoded mock data with real API integration. Created useRecentTasks hook that fetches tasks from current and backlog sorted by updated date, added proper task type normalization for icon display, implemented correct routing for parent vs simple tasks. Also added useWorkflowCounts hook to show dynamic task counts in workflow section. Both hooks use appropriate refresh intervals (1 minute for recent tasks, 2 minutes for workflow counts) and only refresh when window is visible.
- 2025-05-30: Implemented ParentTaskListView - Created dedicated parent task list view that extends TaskManagementView with parent-specific features. Added subtask progress display to TaskTable showing "X/Y subtasks (Z%)" with visual progress bar. Created proper types file defining Task, ParentTask, and TableTask interfaces. Updated parent list route to use new component with search params support. Parent tasks now display with real progress data from the API's include_progress flag.
- 2025-05-30: Fixed Storybook configuration issues - Added CSS import to preview.tsx to restore styling, copied mock-data-v2.ts from v1 for story data, added JetBrains Mono font loading via preview-head.html, configured theme support with @storybook/addon-themes for light/dark mode switching. Also updated root package.json storybook command to point to task-ui-2 to avoid confusion.
- 2025-05-30: Refactored Phase 3 plan - Created separate tasks for task create/edit UI redesign (reds-tas-cre-and-edi-ui-for-v2-05A) and worktree dashboard refactor (refc-work-dash-for-v2-05A). Updated Phase 3 to focus solely on Claude Assistant integration, which should be straightforward since the backend hasn't changed. Created cleanup subtask (06_clen-up-ui-com-aft-api-05H) to track UI normalization work after MCP API consistency fixes.
