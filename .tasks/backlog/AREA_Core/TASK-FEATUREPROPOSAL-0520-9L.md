+++
id = "TASK-FEATUREPROPOSAL-0520-9L"
title = "Feature Proposal: Hide Completed Items by Default"
type = "proposal"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-20"
updated_date = "2025-05-20"
assigned_to = ""
phase = "backlog"
subdirectory = "AREA_Core"
tags = [ "proposal", "Core", "UI" ]
+++

# Feature Proposal: Hide Completed Items by Default

## Problem Statement
As users dogfood the system and accumulate more tasks and features, the UI becomes cluttered with completed items that remain visible by default. This makes it harder to focus on active work and reduces productivity, especially when the number of completed tasks grows significantly.

## Proposed Solution
Implement a consistent "Hide Completed Items" feature across all three clients (CLI, MCP, and UI) that filters out completed tasks, features, areas, and phases by default. The backend already supports this capability with the `include_completed` flag, but the UI client always sets it to `true` and the CLI doesn't expose this option to users.

## Key Benefits
- Reduces visual clutter in the UI, improving focus on active work
- Creates consistent behavior across all three clients (CLI, MCP, UI)
- Improves performance by reducing data transfer and rendering requirements
- Provides users with explicit control over their view preferences

## Scope

### Included
- Add `--show-completed` flag to CLI listing commands (task, feature, area, phase)
- Make the UI respect the `include_completed` flag from the server
- Add toggle control in the UI with visual indicator and persistent preference
- Add count badge showing how many completed items are hidden
- Update documentation to explain this preference

### Not Included
- Different filters for different entity types (tasks vs features vs phases)
- Custom time-based filters for "recently completed" items
- Visual redesign of completed items display
- Analytics on completion rates or productivity metrics

## Technical Approach

The implementation will leverage the existing backend support for `include_completed` while making the following changes:

### CLI Changes
- Add `--show-completed` flag to all list commands in `entity-commands.ts`
- Default to hiding completed items (flag needed to show them)
- Ensure consistent help text documenting this behavior

### UI Changes
- Update UI client's API calls to respect user preference for `include_completed`
- Add toggle in filters panel and quick toggle in task list header
- Store preference in UIContext with localStorage persistence
- Add visual cues to indicate when items are filtered
- Add count badge showing number of hidden items

### MCP Changes
- Document the `include_completed` parameter in API docs
- Ensure consistent behavior between clients

## Complexity Assessment

**Overall Complexity**: Medium

Factors considered:
- Backend already supports filtering; minimal server-side changes needed
- Moderate UI changes required for toggle controls and visual indicators
- Need to ensure consistency across three different clients
- User preference persistence requires proper state management
- Visual indicators and count badges add some complexity

## Dependencies & Risks
- Need to ensure changes to CLI don't break existing scripts
- Risk of inconsistent behavior between clients if not properly aligned
- Performance impact of counting completed items for badges may require optimization
- State persistence might need cross-browser testing

## Open Questions
- Should the preference be global or per-entity-type?
- What visual indicators work best for completed items when they are shown?
- Should we add shortcuts to temporarily show completed items?
- Is the default "hide completed" preference right for all users?

## Human Review Required
- [ ] Scope decision: Default to hiding completed items may not match all user preferences
- [ ] Technical approach: Need to verify the impact on CLI usage patterns
- [ ] Area assignment: This spans Core, UI, and CLI areas - primary area assignment may need adjustment
- [ ] Complexity assessment: User preference persistence may be more complex than estimated
