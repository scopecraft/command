# Design UI approach and create mockups

---
type: feature
status: done
area: ui
---


## Instruction
Design the UI approach for task creation and editing based on the synthesis decisions. Create visual mockups and component specifications for the hybrid approach.

### Input from Synthesis:
- **UI Pattern**: Hybrid (Modal for create, inline for edit)
- **Technical**: Extract and adapt DualUseMarkdown core pattern
- **Constraints**: Use shadcn/ui components wherever possible
- **MVP Scope**: Command palette, section editors, inline metadata

### Design Requirements:
1. **Command Palette Modal** (Cmd+K)
   - Use shadcn/ui Command component
   - Template selection interface
   - Minimal fields (title, type) for quick creation
   - Keyboard navigation throughout

2. **Section-based Editor**
   - Adapt DualUseMarkdown hover-to-edit pattern
   - Remove AI actions for MVP
   - Keep keyboard shortcuts (E to edit, Shift+Enter to save)
   - Style to match V2 Atlas theme

3. **Inline Metadata Editing**
   - Status, priority, tags, assignee fields
   - Hover states and edit affordances
   - Optimistic updates with loading states

### Deliverables:
- Figma mockups or detailed wireframes
- Component interaction specifications
- Keyboard shortcut documentation
- Style adaptation guide (Atlas theme)

## Tasks
- [x] Review V2 Atlas theme and existing components
- [x] Study shadcn/ui Command component capabilities
- [x] Design command palette modal flow
- [x] Create wireframes for section-based editing
- [x] Design inline metadata editing patterns
- [x] Document keyboard shortcuts and interactions
- [x] Create style guide for Atlas theme adaptation
- [x] Prepare design review presentation

## Deliverable
# Task Creation and Editing UI Design

## Log
- 2025-01-05 10:15: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 03_desg-ui-appr-and-cret-mock-06T
  - Analysis: UI design task with explicit "design" in title, area: ui, deliverables include mockups and specifications
  - Selected Mode: Design Mode
  - Reasoning: Title contains "Design UI approach", deliverables are design artifacts (mockups, specifications), clear design requirements provided
  - Loading: design/base.md principles, ui area patterns
- 2025-06-05: 2025-01-05 10:20: Completed review of V2 Atlas theme and existing components. Key findings:
- Atlas color palette with terminal-black background and cream text
- JetBrains Mono font with uppercase system labels
- Dot grid background pattern for depth
- Card components with subtle borders and hover lift effects
- Existing V2 components include TaskTypeIcon, WorkflowStateBadge, ParentTaskCard
- DualUseMarkdown provides hover-to-edit pattern with keyboard shortcuts
- 2025-06-05: 2025-01-05 10:25: Completed command palette modal design with detailed wireframes and flow states
- 2025-06-05: 2025-01-05 10:30: Completed all design deliverables:
- Command palette with 2-step flow (type selection → title input)
- Section-based editor adapting DualUseMarkdown hover-to-edit pattern
- Inline metadata editor with optimistic updates
- Comprehensive keyboard shortcuts documentation
- Atlas theme adaptation guide with CSS patterns
- 2025-06-05: 2025-01-05 10:35: Created design review presentation with:
- Executive summary of hybrid approach
- Key design decisions and rationale
- User experience flow diagrams
- Technical implementation phases
- MVP scope definition
- Success metrics and next steps
- 2025-06-05: 2025-01-05 10:40: === EXECUTION COMPLETE ===
  - Mode Used: Design Mode
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: 4 (see Design Review Presentation section)
  - Follow-up: None required - ready for implementation

## 1. command palette modal design (cmd+k)
### Visual Design Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  ╭───────────────────────────────────────────────────────────╮  │
│  │                    Create New Task                       │  │
│  ╰───────────────────────────────────────────────────────────╯  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🔍 Select task type...                              Cmd+K│  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ╭─────────────────────────────────────────────────────────╮  │
│  │ TASK TYPES                                              │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 📦 Feature          New functionality               F  │  │
│  │ 🐛 Bug              Fix an issue                    B  │  │
│  │ 🔧 Chore            Maintenance task                C  │  │
│  │ 📝 Documentation    Update docs                     D  │  │
│  │ 🧪 Test             Add/update tests                T  │  │
│  │ 🔬 Spike            Research/exploration            S  │  │
│  ╰─────────────────────────────────────────────────────────╯  │
│                                                                 │
│  ╭─────────────────────────────────────────────────────────╮  │
│  │ QUICK ACTIONS                                           │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 📋 Create from template                          Cmd+T  │  │
│  │ 👨‍👧‍👦 Create parent task                          Cmd+P  │  │
│  ╰─────────────────────────────────────────────────────────╯  │
└─────────────────────────────────────────────────────────────────┘
```

**Styling Notes:**
- Background: `rgba(18, 18, 18, 0.95)` with backdrop blur
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Font: JetBrains Mono
- Selected item: `background: var(--atlas-navy)` with `color: var(--cream)`
- Keyboard shortcuts: `color: var(--atlas-light)` aligned right

### Flow States

#### State 1: Type Selection (shown above)
- User presses Cmd+K
- Modal appears with task type selection
- Can type to filter or use single letter shortcuts

#### State 2: Title Input
```
┌─────────────────────────────────────────────────────────────────┐
│  ╭───────────────────────────────────────────────────────────╮  │
│  │                 Create New Feature                        │  │
│  ╰───────────────────────────────────────────────────────────╯  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Enter task title...                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ╭─────────────────────────────────────────────────────────╮  │
│  │ SUGGESTIONS                                             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Similar tasks:                                          │  │
│  │ • Implement user authentication                         │  │
│  │ • Add search functionality                              │  │
│  │ • Create dashboard layout                               │  │
│  ╰─────────────────────────────────────────────────────────╯  │
│                                                                 │
│  Press Enter to create • Esc to cancel                         │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications

```typescript
interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreate: (task: NewTaskData) => void
}

interface NewTaskData {
  title: string
  type: TaskType
  template?: string
  isParent?: boolean
}

type TaskType = 'feature' | 'bug' | 'chore' | 'documentation' | 'test' | 'spike'
```

### Interaction Patterns

1. **Opening**: 
   - Cmd+K from anywhere in the app
   - Click "New Task" button
   - Press "N" when focused on task list

2. **Navigation**:
   - Arrow keys to navigate options
   - Tab to move between sections
   - Single letter shortcuts (F, B, C, D, T, S)

3. **Creation**:
   - Select type → Enter title → Enter to create
   - Escape at any point to cancel
   - Loading state while creating

## 2. section-based editor design
### Visual Mockup - View Mode

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ## Instruction                                          [E] │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Implement the authentication flow for the application     │ │
│ │ including login, logout, and session management.          │ │
│ │                                                           │ │
│ │ ### Requirements:                                         │ │
│ │ - Support email/password authentication                   │ │
│ │ - Include JWT token management                            │ │
│ │ - Add remember me functionality                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ## Tasks                                                [E] │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ - [x] Design authentication schema                        │ │
│ │ - [ ] Implement login endpoint                            │ │
│ │ - [ ] Add JWT token generation                            │ │
│ │ - [ ] Create logout functionality                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Mockup - Edit Mode

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ## Instruction                                              │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ┌───────────────────────────────────────────────────────┐ │ │
│ │ │ Implement the authentication flow for the application │ │ │
│ │ │ including login, logout, and session management.      │ │ │
│ │ │                                                       │ │ │
│ │ │ ### Requirements:                                     │ │ │
│ │ │ - Support email/password authentication               │ │ │
│ │ │ - Include JWT token management                        │ │ │
│ │ │ - Add remember me functionality                       │ │ │
│ │ │ |                                                     │ │ │
│ │ └───────────────────────────────────────────────────────┘ │ │
│ │                                                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ✓ Save  ✕ Cancel                         Shift+Enter │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Hover State Behavior

```css
/* Card hover state */
.section-card:hover {
  border-color: var(--atlas-light);
  transform: translateY(-2px);
  transition: all 200ms ease;
}

/* Show edit hint on hover */
.edit-hint {
  opacity: 0;
  transition: opacity 200ms;
}

.section-card:hover .edit-hint {
  opacity: 1;
}
```

### Component Structure

```typescript
interface SectionEditorProps {
  section: 'instruction' | 'tasks' | 'deliverable' | 'log'
  content: string
  onSave: (newContent: string) => Promise<void>
  readOnly?: boolean
}

// Adapted from DualUseMarkdown
const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  content,
  onSave,
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const [isHovering, setIsHovering] = useState(false)
  
  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isHovering && !isEditing && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setIsEditing(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isHovering, isEditing])
  
  // Rest of implementation...
}
```

## 3. inline metadata editor design
### Visual Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ Task Metadata                                                   │
│                                                                 │
│ ┌─────────────┬─────────────┬─────────────┬─────────────────┐ │
│ │ STATUS      │ PRIORITY    │ ASSIGNEE    │ TAGS            │ │
│ │ ● In Progress│ ⬆ High      │ @davidp     │ #auth #backend  │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Hover/Edit States

```
┌─────────────────┐
│ STATUS          │
│ ● In Progress ▼ │  ← Hover: Show dropdown arrow
└─────────────────┘

┌─────────────────┐
│ ● To Do         │
│ ● In Progress ✓ │  ← Dropdown open
│ ● Done          │
│ ● Blocked       │
└─────────────────┘
```

### Tag Input Design

```
┌─────────────────────────────────────┐
│ TAGS                                │
│ #auth #backend +                    │  ← Click "+" to add
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ TAGS                                │
│ #auth #backend #security|           │  ← Typing mode
│ ┌─────────────────────────────────┐ │
│ │ Suggestions:                    │ │
│ │ #security-audit                 │ │
│ │ #security-review                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Component Specifications

```typescript
interface MetadataEditorProps {
  taskId: string
  metadata: TaskMetadata
  onUpdate: (field: keyof TaskMetadata, value: any) => Promise<void>
}

interface TaskMetadata {
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'highest' | 'high' | 'medium' | 'low'
  assignee?: string
  tags: string[]
}

// Optimistic update pattern
const useOptimisticUpdate = <T,>(initialValue: T) => {
  const [value, setValue] = useState(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const update = async (newValue: T, updateFn: () => Promise<void>) => {
    setValue(newValue) // Optimistic update
    setIsUpdating(true)
    
    try {
      await updateFn()
    } catch (error) {
      setValue(initialValue) // Rollback on error
      throw error
    } finally {
      setIsUpdating(false)
    }
  }
  
  return { value, isUpdating, update }
}
```

## 4. keyboard shortcuts documentation
### Global Shortcuts
- `Cmd+K` - Open command palette
- `N` - New task (when focused on task list)
- `/` - Focus search
- `?` - Show keyboard shortcuts help

### Command Palette
- `↑/↓` - Navigate options
- `Enter` - Select option
- `Esc` - Close palette
- `F/B/C/D/T/S` - Quick select task type

### Section Editor
- `E` - Edit section (when hovering)
- `Shift+Enter` - Save and exit edit mode
- `Esc` - Cancel editing
- `Cmd+Enter` - Save and continue editing

### Metadata Editor
- `Tab` - Move between fields
- `Space` - Open dropdown (when focused)
- `↑/↓` - Navigate dropdown options
- `Enter` - Select option
- `,` - Add tag (in tag input)

## 5. atlas theme adaptation guide
### Color Usage
```scss
// Primary backgrounds
--background-primary: var(--terminal-black);     // #121212
--background-secondary: var(--terminal-dark);    // #1A1A1A

// Text colors
--text-primary: var(--cream);                    // #F2EFE1
--text-muted: rgba(242, 239, 225, 0.6);         // 60% cream

// Interactive elements
--accent-primary: var(--atlas-navy);             // #0A2647
--accent-secondary: var(--atlas-light);          // #3A8BD1

// Status colors
--status-active: var(--connection-teal);         // #2E8A99
--status-warning: var(--bridge-orange);          // #E57C23
--status-error: var(--forge-rust);               // #8B4513
```

### Component Styling Patterns

1. **Cards & Panels**
   ```css
   .atlas-card {
     background: var(--background-secondary);
     border: 1px solid rgba(255, 255, 255, 0.1);
     border-radius: 8px;
     transition: all 200ms ease;
   }
   
   .atlas-card:hover {
     border-color: var(--accent-secondary);
     transform: translateY(-2px);
   }
   ```

2. **Buttons**
   ```css
   .atlas-button {
     background: var(--accent-primary);
     color: var(--text-primary);
     font-family: 'JetBrains Mono';
     font-weight: 500;
     text-transform: uppercase;
     position: relative;
   }
   
   .atlas-button::after {
     content: '>';
     color: var(--accent-secondary);
     margin-left: 8px;
   }
   ```

3. **Input Fields**
   ```css
   .atlas-input {
     background: transparent;
     border: 1px solid rgba(255, 255, 255, 0.1);
     color: var(--text-primary);
     font-family: 'JetBrains Mono';
   }
   
   .atlas-input:focus {
     border-color: var(--accent-secondary);
     outline: none;
   }
   ```

### Implementation Notes

1. **Font Usage**
   - Use JetBrains Mono for all UI elements
   - System labels in uppercase
   - Regular text in normal case

2. **Spacing**
   - Follow 8px grid system
   - Consistent padding: 16px for cards, 8px for compact elements

3. **Animation**
   - Use 200ms ease for hover transitions
   - Subtle transform effects (translateY(-2px) on hover)
   - No animation on mobile devices

4. **Dot Grid Background**
   ```css
   .dot-grid {
     background-image: radial-gradient(
       circle at center,
       rgba(255, 255, 255, 0.03) 1px,
       transparent 1px
     );
     background-size: 16px 16px;
   }
   ```

## 6. design review presentation
### Executive Summary

This design implements a hybrid approach for task creation and editing in the V2 Atlas UI:

1. **Command Palette** for quick task creation (Cmd+K)
2. **Section-based inline editing** adapted from DualUseMarkdown
3. **Inline metadata editing** with optimistic updates

### Key Design Decisions

#### 1. Hybrid Pattern Rationale
- **Modal for creation**: Fast, focused, keyboard-driven
- **Inline for editing**: Context-aware, immediate feedback
- **Best of both worlds**: Speed for creation, context for editing

#### 2. DualUseMarkdown Adaptation
- **Kept**: Hover-to-edit, keyboard shortcuts (E, Shift+Enter)
- **Removed**: AI actions (not needed for MVP)
- **Added**: Atlas theme styling, optimistic updates

#### 3. Atlas Theme Integration
- **Colors**: Terminal black background, cream text, atlas-navy accents
- **Typography**: JetBrains Mono throughout, uppercase for system labels
- **Interactions**: Subtle hover effects, 200ms transitions

### User Experience Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cmd+K     │ --> │ Select Type │ --> │ Enter Title │ --> Task Created
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Hover Card  │ --> │ Press 'E'   │ --> │ Edit Inline │ --> Auto-save
└─────────────┘     └─────────────┘     └─────────────┘
```

### Technical Implementation Path

1. **Phase 1: Command Palette**
   - Install `cmdk` library
   - Create CommandPalette component
   - Integrate with task creation API

2. **Phase 2: Section Editor**
   - Extract DualUseMarkdown core logic
   - Create SectionEditor component
   - Add keyboard event handlers

3. **Phase 3: Metadata Editor**
   - Build dropdown components
   - Implement optimistic update hook
   - Add tag autocomplete

### MVP Scope

**Included:**
- Command palette with type selection
- Section-based editing for all fields
- Inline metadata editing
- Keyboard navigation throughout
- Atlas theme styling

**Excluded (Future):**
- AI-powered suggestions
- Template library
- Bulk operations
- Advanced filtering in command palette

### Success Metrics

1. **Speed**: Task creation in < 5 seconds
2. **Accuracy**: 90%+ successful first-time saves
3. **Adoption**: 80%+ users using keyboard shortcuts
4. **Satisfaction**: Reduced clicks by 60%

### Next Steps

1. **Review & Feedback**: Gather team input on designs
2. **Prototype**: Build interactive prototype for testing
3. **User Testing**: Validate with 5-10 users
4. **Implementation**: Begin Phase 1 development

### Questions for Review

1. Should we add more task types to the command palette?
2. Is the hover-to-edit pattern discoverable enough?
3. Do we need visual indicators for keyboard shortcuts?
4. Should metadata editing have a "batch edit" mode?

### Appendix: Component Hierarchy

```
TaskManagementView
├── CommandPalette
│   ├── CommandDialog
│   ├── TypeSelector
│   └── TitleInput
├── TaskDetailView
│   ├── SectionEditor (Instruction)
│   ├── SectionEditor (Tasks)
│   ├── SectionEditor (Deliverable)
│   ├── SectionEditor (Log)
│   └── MetadataEditor
│       ├── StatusDropdown
│       ├── PriorityDropdown
│       ├── AssigneeInput
│       └── TagInput
└── KeyboardShortcutHelp
```
