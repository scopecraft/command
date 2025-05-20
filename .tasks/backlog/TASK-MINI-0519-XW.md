+++
id = "TASK-MINI-0519-XW"
title = "Task UI - Minimize sections in the sidebar"
type = "🌟 Feature"
status = "🟣 Review"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "backlog"
+++

# Task UI - Minimize sections in the sidebar

## Overview
Add the ability to collapse/expand sidebar sections (Views, Phases, Features, Areas) to optimize screen space and improve navigation in the Tasks UI.

## Requirements

### Functional Requirements
1. Add collapse/expand toggle buttons to each sidebar section header
2. Save the expanded/collapsed state of each section to user preferences in localStorage
3. Persist the state between sessions
4. Include section title in the header even when collapsed
5. Animate the collapse/expand transitions
6. Add keyboard shortcuts for collapsing/expanding sections

### Technical Requirements
- Maintain accessibility with aria-expanded attributes and keyboard navigation
- Minimize re-renders when toggling sections
- Ensure collapsed state is not reset when data changes (phases, features, areas)
- Update UI layout calculations on collapse/expand to prevent layout shifts

## Implementation Log

### 2025-05-20: Feature Implemented

#### 1. Updated data model
- Enhanced UIState interface to include collapsedSections object
- Added toggle functionality in UIContext
- Configured localStorage persistence for section collapse state

#### 2. Created UI components
- Implemented SectionHeader component with accessibility attributes
- Added ChevronDown/ChevronRight icons for visual indication
- Applied smooth CSS transitions for collapse/expand animations

#### 3. Added keyboard accessibility
- Implemented proper ARIA attributes (aria-expanded, aria-controls)
- Used semantic button element for toggle controls
- Added Alt+Number keyboard shortcuts (Alt+1 for Views, Alt+2 for Phases, etc.)

#### 4. Implementation decisions
- Used CSS height transitions for smooth animations
- Maintained section headers even when sections are collapsed
- Preserved the "+ Create" buttons within section headers
- Ensured responsive behavior for all screen sizes

#### Files modified:
- `tasks-ui/src/lib/types/index.ts`: Updated UIState interface
- `tasks-ui/src/context/UIContext.tsx`: Added toggle functionality and localStorage persistence
- `tasks-ui/src/components/layout/Sidebar.tsx`: Implemented collapsible sections

## UI/UX Design

### User Flow
1. User clicks on the toggle icon in a section header to collapse/expand that section
2. The section content smoothly collapses/expands with animation
3. The toggle icon changes to indicate the current state
4. The section remains collapsed/expanded when navigating between views

### Key Components
- **Section Header**: Contains title and toggle button
- **Toggle Button**: Icon that rotates to show state (chevron pointing down when expanded, right when collapsed)
- **Section Content**: The collapsible portion that hides/shows

## Technical Design

### Components Affected
- **Sidebar.tsx**: Add section collapse/expand functionality
- **UIContext.tsx**: Add state for tracking section expansion
- **types/index.ts**: Update UIState interface to include collapsed sections

### Data Model Changes
Update the UIState interface to include collapsed sections:

```typescript
export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeView: 'home' | 'list' | 'detail' | 'form' | 'create' | 'graph';
  activeTaskId: string | null;
  toasts: Toast[];
  collapsedSections: {
    views?: boolean;
    phases?: boolean;
    features?: boolean;
    areas?: boolean;
  };
}
```

*Note: TypeScript interfaces shown are illustrative examples, not prescriptive*

### API Changes
No API changes required as this is a purely client-side UI enhancement.

## Implementation Notes
- Use CSS transitions for smooth animations when collapsing/expanding
- Leverage React's useEffect to manage localStorage persistence
- Consider implementing a reusable CollapsibleSection component
- Ensure that the section header remains visible even when the section is collapsed
- Use a chevron or similar icon that rotates based on the expanded/collapsed state
- If a user collapses all sections, ensure they still have a way to expand them again

## Testing Approach
- Unit test collapsed state persistence in localStorage
- Test that collapsed state remains after route changes
- Verify proper animation transitions
- Test keyboard shortcuts functionality
- Test across different screen sizes (responsive behavior)

## Task Breakdown Preview

### UI Tasks
- [x] Update UIContext with collapsible sections state
- [x] Create CollapsibleSection component (or enhance Sidebar.tsx directly)
- [x] Implement toggle button and animation
- [x] Add keyboard shortcuts for collapsing/expanding sections

### Core Tasks 
- [x] Implement localStorage persistence of collapsed state

### Test Tasks
- [ ] Test collapsed state persistence
- [ ] Test UI interactions and animations
- [ ] Test keyboard accessibility

## Human Review Required

### Technical decisions made:
- Used existing lucide-react icons library for chevron icons
- Implemented toggles directly in Sidebar.tsx rather than creating a separate component
- Chose CSS height transitions for animations (simple and effective)
- Selected Alt+Number keyboard shortcuts for consistency

### Design decisions to confirm:
- [ ] UI/UX flow assumptions
- [ ] Animation style and duration (currently using duration-300 = 300ms)
- [ ] Icon selection for collapse/expand (currently using ChevronDown/ChevronRight)
- [ ] Keyboard shortcut selection (currently using Alt+1, Alt+2, etc.)

### Implementation concerns:
- [ ] Task breakdown completeness
- [ ] Testing strategy adequacy

This section ensures critical decisions are reviewed before implementation begins.
