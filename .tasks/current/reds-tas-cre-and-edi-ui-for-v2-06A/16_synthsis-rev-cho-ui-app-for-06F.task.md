# Synthesis Review: Choose UI approach for task creation/editing

---
type: chore
status: done
area: ui
---


## Instruction
Review the research findings from the UI patterns exploration and make a decision on the approach for task creation and editing in V2.

### Input Required
- Research document from 01_expl-mod-ui-pat-for-cru-oprtns-06Q
- Pattern comparison matrix
- Recommendations from the research phase

### Decision Points
1. **Primary Pattern Choice**:
   - Modal-based creation/editing
   - Inline editing (like document-editor prototype)
   - Hybrid approach (modal for create, inline for edit)
   - Slide-out panel approach

2. **Technical Approach**:
   - Reuse document-editor components directly
   - Build new components inspired by document-editor
   - Create completely new approach

3. **Feature Scope**:
   - MVP: Basic create/edit functionality
   - Enhanced: Include AI-assisted features from prototype
   - Full: Section-based editing with all document-editor features

### Success Criteria
- Clear decision on UI pattern to implement
- Technical approach defined
- Scope boundaries established
- Design phase tasks can be created based on decisions

## Tasks
- [x] Review research findings from 01_expl-mod-ui-pat-for-cru-oprtns-06Q
- [x] Evaluate pattern recommendations against V2 design goals
- [x] Consider technical constraints and existing components
- [x] Make decision on primary UI pattern
- [x] Define technical implementation approach
- [x] Set feature scope for initial implementation
- [x] Document decisions with rationale
- [x] Update parent task orchestration plan with decisions

## Deliverable
### Decision Record

**UI Pattern Decision**: Hybrid Approach (Modal for Create, Inline for Edit)
- Rationale: 
  - Aligns with research recommendation and modern best practices (Linear-style)
  - Modal creation enables sub-10 second task creation with templates
  - Inline editing maintains context and speeds up updates
  - Matches existing V2 patterns (detail views already have edit mode)
  - Optimizes for both new users (guided creation) and power users (keyboard shortcuts)

**Technical Approach**: Extract and adapt DualUseMarkdown core pattern
- Rationale:
  - MCP API already exposes tasks as section-based documents (instruction, tasks, deliverable, log)
  - DualUseMarkdown has the exact UX pattern we need (hover-to-edit, keyboard shortcuts)
  - For MVP: Extract just the dual-mode editing behavior, remove AI actions
  - Make it composable: accept section name, content, onSave callback
  - Perfect match: MCP's section-based API ↔ DualUseMarkdown's editing pattern

**Implementation Constraints**: Use existing component libraries
- **IMPORTANT**: Favor shadcn/ui components wherever possible
- Command palette → Use shadcn/ui Command component (don't recreate)
- Form controls → Use shadcn/ui form components
- Modals/Dialogs → Use shadcn/ui Dialog
- If a needed component doesn't exist in shadcn, that becomes a Phase 2+ requirement
- This constraint ensures faster MVP delivery and consistency

**Feature Scope**: Focused MVP
- MVP features:
  - Command palette modal for task creation (Cmd+K) - using shadcn/ui Command
  - Template selection with smart defaults
  - Simplified DualUseMarkdown for each task section:
    - Hover to reveal edit button
    - E to edit, Shift+Enter to save
    - View/Edit mode toggle
    - NO AI actions in MVP
  - Inline metadata editing in detail views
  - Wire section saves to MCP API calls
  - Style adaptation to V2 Atlas theme
  
- Future enhancements (Phase 2+):
  - AI-powered section improvements
  - Restore AI actions (Tone, Improve, Diagram, Extract)
  - Drag & drop for subtask management
  - Bulk operations
  - Inline editing directly in TaskTable
  - Any custom components not available in shadcn/ui

**Implementation Note**: 
The key is to start simple - we need the proven editing UX pattern from DualUseMarkdown without the complexity of AI integration. The component needs to be refactored to:
1. Remove all AI action code
2. Make it properly composable (props for section, content, callbacks)
3. Keep the core hover/keyboard/save functionality
4. Integrate with MCP's task_update API for section saves
5. Use shadcn/ui components for all standard UI elements

**Next Steps**:
- Design tasks to be created:
  1. Design command palette modal using shadcn/ui Command
  2. Extract and simplify DualUseMarkdown core
  3. Create composable TaskSectionEditor component
  4. Create metadata field editors using shadcn/ui form components
  5. Wire up section updates to MCP API methods

## Log
- 2025-06-05: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 02_synthsis-rev-cho-ui-app-for-06F
  - Analysis: type:chore, 'Synthesis Review' in title, decision-making task
  - Selected Mode: design
  - Reasoning: This is a synthesis and decision task that requires technical choices
  - Loading: design mode for architectural decisions
- 2025-06-05: Analyzed context:
  - Reviewed research recommendations: hybrid approach (modal for create, inline for edit)
  - Evaluated V2 goals: 10-second creation, AI assistance, dark terminal aesthetic
  - Examined existing V2 components: TaskTable, TaskManagementView, detail views
  - Identified integration points: onRowClick handler, Create Task button
- 2025-06-05: Made architectural decisions:
  - Hybrid UI pattern chosen for optimal UX
  - Component-based approach for consistency with V2
  - MVP scope defined with clear enhancement path
  - Parent task updated with decisions
=== EXECUTION COMPLETE ===
  - Mode Used: design
  - Status: COMPLETED
  - Deliverable: READY
  - Questions: 0
  - Follow-up: Phase 2 design tasks ready to be created
- 2025-06-05: REVISION: Changed technical approach based on key insight:
  - MCP API structure (section-based) perfectly matches DualUseMarkdown design
  - Direct reuse is better than building "inspired by" components
  - Faster implementation with proven UX patterns
- 2025-06-05: CLARIFICATION: Simplified technical approach:
  - MVP focuses on core editing pattern only
  - AI actions removed for initial implementation
  - Component needs extraction and composability refactor
- 2025-06-05: Added implementation constraint: Use shadcn/ui components for MVP
  - Speeds up development by reusing existing components
  - Command palette, forms, dialogs already available
  - Custom components become Phase 2 requirements
- 2025-06-05: === HUMAN REVIEW APPROVED ===
  - Reviewer: David Paquet
  - Decision: Approved synthesis decisions
  - Key approvals:
    - Hybrid UI pattern confirmed
    - DualUseMarkdown adaptation approach validated
    - shadcn/ui component constraint agreed
    - Focused MVP scope accepted
  - Ready to proceed with Phase 2 design tasks
