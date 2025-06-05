# Explore modern UI patterns for CRUD operations

---
type: spike
status: done
area: ui
priority: high
tags:
  - research
  - ui
  - design
  - 'team:ux'
  - 'execution:autonomous'
  - 'parallel-group:research'
---


## Instruction
Research modern UI patterns for CRUD operations to identify best practices for the V2 create/edit functionality.

### Important Context Documents:
- @docs/SCOPECRAFT_STYLE_GUIDE.md - Visual design system with dark terminal aesthetic
- @docs/specs/scopecraft-vision.md - Unix philosophy and overall system architecture
- @docs/specs/metadata-architecture.md - Schema-driven metadata and configuration system
- @docs/specs/ai-first-knowledge-system-vision.md - Task structure and section-based documents
- @docs/brainstorming/document-editor-analysis.md - Analysis of existing prototype with recommendations

### Document Editor Prototype:
A prototype exists in the `reference/document-editor/` folder that demonstrates:
- Section-based markdown editing
- AI-powered actions (tone, improve, diagram, extract)
- Inline editing with hover actions
- Resizable panel layout

### Areas to explore:
- Inline editing patterns (see document-editor prototype)
- Modal-based forms
- Slide-out panels
- Auto-save vs explicit save
- Optimistic updates
- Form state management approaches
- Section-based editing (per document structure)
- Hybrid approaches (modal for creation, inline for editing)

## Tasks
- [x] Review linked vision and architecture documents for context
- [x] Analyze document-editor prototype in reference folder
- [x] Research inline editing patterns (pros/cons, use cases)
- [x] Analyze modal dialog patterns for creation/editing
- [x] Explore slide-out panel patterns
- [x] Study auto-save implementations vs save buttons
- [x] Research optimistic UI update patterns
- [x] Review form state management (controlled vs uncontrolled)
- [x] Look at markdown editor integrations for section editing
- [x] Find examples from similar task management tools
- [x] Consider section-based editing patterns (per unified document model)

## Deliverable
# UI Patterns for CRUD Operations in Scopecraft V2

## Log
- 2025-06-05: 2025-06-04: Updated to reference document-editor in reference/ folder
- 2025-06-05: 2025-06-05: Updated document-editor-analysis path to docs/brainstorming/
- 2025-06-05: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_expl-mod-ui-pat-for-cru-oprtns-06Q
  - Analysis: type:spike, tags include 'research', 'ui', 'design', area:ui
  - Selected Mode: exploration
  - Reasoning: type:spike + 'research' tag + exploration focus in title
  - Loading: exploration mode for UI pattern research
- 2025-06-05: Completed context analysis:
  - Reviewed vision documents and style guide
  - Analyzed document editor prototype
  - Extracted key patterns: section-based editing, dual-mode interface, AI actions
  - Identified adaptation opportunities for task CRUD
- 2025-06-05: Completed UI patterns research:
  - Analyzed 4 major patterns: inline, modal, slide-out, full-page
  - Created comprehensive comparison matrix
  - Provided detailed implementation recommendations
  - Delivered hybrid approach recommendation
  - Key recommendation: Modal for creation, inline for editing, optimistic updates throughout
=== EXECUTION COMPLETE ===
  - Mode Used: exploration
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: 0 (see Tasks section)
  - Follow-up: None required

## Executive summary
Based on research of modern UI patterns, analysis of the existing document editor prototype, and Scopecraft's design principles, this document presents a comprehensive comparison of CRUD UI patterns and recommendations for the V2 implementation.

**Key Recommendation**: Adopt a hybrid approach that combines:
- **Modal dialogs** for task creation (quick, focused, template-driven)
- **Inline editing** for task updates (contextual, efficient, keyboard-friendly)
- **Slide-out panels** for bulk operations and complex workflows
- **Optimistic updates** with auto-save for seamless user experience

## Pattern comparison matrix
| Pattern | Best For | Pros | Cons | Scopecraft Fit |
|---------|----------|------|------|----------------|
| **Inline Editing** | Quick edits, metadata updates | • Contextual<br>• Fast<br>• No context switch<br>• Keyboard-friendly | • Complex for new items<br>• Limited space<br>• Can clutter UI | ⭐⭐⭐⭐⭐ Perfect for task editing |
| **Modal Dialogs** | Creation, complex forms | • Focused attention<br>• Clean slate<br>• Template support<br>• Clear save/cancel | • Context switch<br>• Blocks background<br>• Extra clicks | ⭐⭐⭐⭐ Great for creation |
| **Slide-out Panels** | Detailed editing, previews | • Maintains context<br>• More space<br>• Can compare<br>• Progressive disclosure | • Screen real estate<br>• Animation overhead<br>• Mobile challenges | ⭐⭐⭐ Good for complex edits |
| **Full Page Forms** | Complex creation flows | • Maximum space<br>• Step-by-step flows<br>• No distractions | • Complete context loss<br>• Navigation required<br>• Overkill for simple tasks | ⭐⭐ Only for parent task creation |

## Detailed pattern analysis
### 1. Inline Editing Pattern

**Implementation Approach** (Based on document editor):
```typescript
// Adapt DualUseMarkdown pattern
<InlineField
  value={task.status}
  onSave={(value) => updateTask({ status: value })}
  editor={<StatusDropdown />}
  viewer={<StatusBadge />}
/>
```

**Best Practices**:
- Hover to reveal edit affordances
- Single-click to activate edit mode
- Escape to cancel, Enter/Tab to save
- Visual feedback during save (loading state)
- Validation messages inline

**Use Cases in Scopecraft**:
- Status updates
- Priority changes
- Tag management
- Section content editing
- Title/description updates

### 2. Modal Dialog Pattern

**Implementation Approach**:
```typescript
// Command palette style creation
<CommandDialog>
  <TemplateSelector />
  <MinimalForm>
    <TitleInput autofocus />
    <TypeSelector />
    <AdvancedToggle />
  </MinimalForm>
</CommandDialog>
```

**Best Practices**:
- Progressive disclosure (start simple)
- Template-driven defaults
- Keyboard navigation throughout
- Clear primary action
- Smart defaults from context

**Use Cases in Scopecraft**:
- New task creation
- Parent task initialization
- Bulk import operations
- Template selection

### 3. Slide-out Panel Pattern

**Implementation Approach**:
```typescript
// Resizable panel from prototype
<SlidePanel position="right" size="40%">
  <TaskDetails>
    <MetadataForm />
    <SectionEditors />
    <RelatedTasks />
  </TaskDetails>
</SlidePanel>
```

**Best Practices**:
- Preserve main view context
- Resizable for user preference
- Keyboard shortcut to toggle
- Auto-close on task completion
- Remember size preference

**Use Cases in Scopecraft**:
- Detailed task editing
- Parent-subtask management
- Batch operations
- Task relationships

### 4. Auto-save vs Save Button

**Recommendation**: Hybrid approach

**Auto-save for**:
- Inline field edits
- Status changes
- Priority updates
- Tag additions

**Explicit save for**:
- Long-form content (sections)
- Bulk metadata changes
- Complex relationships
- Destructive operations

**Implementation**:
```typescript
// Debounced auto-save for fields
const debouncedSave = useMemo(
  () => debounce((updates) => {
    saveTask(updates);
    showToast("Saved");
  }, 1000),
  []
);

// Explicit save for sections
<SectionEditor
  onSave={(content) => {
    saveSection(content);
    setEditing(false);
  }}
/>
```

### 5. Optimistic Updates

**Implementation Pattern**:
```typescript
// Update UI immediately, rollback on error
const updateTaskOptimistic = async (updates) => {
  // 1. Update local state immediately
  setTask(prev => ({ ...prev, ...updates }));
  
  // 2. Show saving indicator
  setIsSaving(true);
  
  try {
    // 3. Persist to backend
    await api.updateTask(task.id, updates);
  } catch (error) {
    // 4. Rollback on failure
    setTask(prev => ({ ...prev, ...rollback }));
    showError("Failed to save");
  } finally {
    setIsSaving(false);
  }
};
```

**Benefits**:
- Instant feedback
- Reduced perceived latency
- Better for collaborative environments
- Aligns with "guide, don't cage" philosophy

### 6. Form State Management

**Recommendation**: Controlled forms with schema validation

**Approach**:
```typescript
// Schema-driven form generation
const TaskForm = ({ schema, initialValues }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  // Generate fields from schema
  const fields = generateFieldsFromSchema(schema);
  
  // Progressive validation
  const validate = (field, value) => {
    const error = schema.validate(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  return fields.map(field => (
    <SchemaField
      key={field.name}
      {...field}
      value={values[field.name]}
      error={errors[field.name]}
      onChange={(value) => {
        setValues(prev => ({ ...prev, [field.name]: value }));
        validate(field.name, value);
      }}
    />
  ));
};
```

## Recommendations for scopecraft v2
### 1. Task Creation Flow

**Pattern**: Modal + Progressive Enhancement

```
[Cmd+K] → Quick Create Modal
         → Select Template (feature/bug/etc)
         → Minimal Fields (title, type)
         → [Create & Edit] → Full Editor
         → [Create] → Return to list
```

**Key Features**:
- Template-driven structure
- Keyboard navigation
- Smart defaults from context
- Optional immediate editing

### 2. Task Editing Flow

**Pattern**: Inline + Section-based

```
Task View → Hover metadata → Click to edit inline
         → Hover section → Edit button → DualUseMarkdown
         → Complex edit → Slide panel for full form
```

**Key Features**:
- Progressive disclosure
- Contextual editing
- Section independence
- Keyboard shortcuts

### 3. Parent Task Management

**Pattern**: Slide Panel + Drag & Drop

```
Parent View → [Manage Subtasks] → Slide panel
           → Drag to reorder
           → Inline create new
           → Batch operations toolbar
```

### 4. Implementation Priorities

1. **Phase 1**: Basic CRUD
   - Modal creation with templates
   - Inline metadata editing
   - Section-based content editing
   
2. **Phase 2**: Enhanced UX
   - Optimistic updates
   - Auto-save for fields
   - Keyboard navigation
   
3. **Phase 3**: Advanced Features
   - Bulk operations
   - Drag & drop
   - AI-powered actions
   - Collaborative editing

## Example implementations
### From Similar Tools

**Linear** (Best practices we should adopt):
- Single-key shortcuts (C for create, E for edit)
- Inline everything with hover states
- Optimistic updates everywhere
- Minimal modals, maximum context

**Notion** (Patterns to consider):
- Slash commands for quick actions
- Block-based editing (similar to our sections)
- Inline property editing
- Template gallery

**ClickUp** (What to avoid):
- Over-complex modals
- Too many options upfront
- Nested modals
- Slow, non-optimistic updates

## Decision criteria
When choosing between patterns:

1. **User Intent**
   - Quick edit → Inline
   - New item → Modal
   - Complex edit → Panel
   
2. **Data Complexity**
   - Single field → Inline
   - Multiple related → Panel
   - Fresh start → Modal
   
3. **Frequency of Use**
   - High frequency → Inline + shortcuts
   - Medium → Modal with templates
   - Low → Full page if needed
   
4. **User Expertise**
   - Beginner → Modal with guidance
   - Intermediate → Inline with tooltips
   - Expert → Keyboard + minimal UI

## Technical implementation guide
### Component Architecture

```typescript
// Core components needed
<TaskCreationModal />
<InlineFieldEditor />
<SectionEditor />
<TaskPanel />
<OptimisticProvider />
<SchemaFormBuilder />
```

### State Management

```typescript
// Optimistic state layer
const useOptimisticTask = (taskId) => {
  const [optimistic, setOptimistic] = useState(null);
  const [server, setServer] = useState(null);
  
  return {
    task: optimistic || server,
    updateOptimistic,
    syncWithServer
  };
};
```

### Keyboard Shortcuts

```typescript
// Global shortcuts
const shortcuts = {
  'cmd+k': openQuickCreate,
  'e': editCurrentTask,
  'escape': cancelCurrentEdit,
  'cmd+enter': saveAndClose,
  'tab': nextField,
  'shift+tab': previousField
};
```

## Conclusion
The recommended hybrid approach leverages the strengths of each pattern while maintaining Scopecraft's philosophy of "guide, don't cage." By combining modal creation, inline editing, and progressive enhancement, we can create an interface that is both powerful for experts and approachable for beginners.

Key success factors:
1. Start simple, enhance progressively
2. Maintain context whenever possible
3. Optimize for keyboard users
4. Use optimistic updates for responsiveness
5. Let the schema drive the UI
6. Follow the dark terminal aesthetic consistently

This approach aligns with Scopecraft's Unix philosophy while providing a modern, efficient user experience for task management.
