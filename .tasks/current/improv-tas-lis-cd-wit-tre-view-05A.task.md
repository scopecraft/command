# Improve task list command display with tree view

---
type: feature
status: Done
area: cli
priority: High
---


## Instruction
The current `task list` command has two major issues:

1. **No visual distinction between parent tasks and subtasks** - All tasks appear at the same level in the table, making it hard to understand the hierarchy
2. **ID truncation issues** - With the new ID format (max ~30 chars), the table layout breaks or IDs get cut off

## Tasks
- [ ] Test current `task list` with various parent/subtask combinations
- [ ] Document all display issues with screenshots/examples
- [ ] Research tree view libraries or implementations
- [ ] Create mockups of different display options
- [ ] Get user feedback on preferred approach
- [ ] Implement chosen solution
- [ ] Update help text and documentation
- [ ] Add tests for new display format

## Deliverable
An improved `task list` command that:
1. Clearly shows parent-subtask relationships
2. Handles long IDs gracefully
3. Indicates parallel tasks
4. Works well with existing filters
5. Provides option for flat view if needed

The solution should prioritize clarity and usability over trying to show every detail.

## Log
- 2025-05-28: Created based on issues discovered during v2 implementation

## Chosen solution: tree view with status symbol first
After reviewing multiple options, we've decided on this format:

```
CURRENT:
├── 📁 → Implement New Workflow Structure [implement-v2-structure] • In Progress • 1/4 done
│   ├── → Core refactor [01-core-refactor] • In Progress • High • @david
│   ├─┬ [Parallel execution - 02]
│   │ ├─ ✓ CLI update [02-cli-update] • Done
│   │ └─ ○ MCP update [02-mcp-update] • To Do • @sarah • #cli #api
│   └── ○ UI update [03-ui-update] • To Do • Medium • #frontend
├── ○ Fix status display in task list [fix-status-display-05K] • To Do • High
└── → Some subtask without parent [orphaned-subtask-02] • In Progress (⚠️ no parent)

BACKLOG:
├── 📁 ○ Improve task list display [improv-tas-lis-cd-wit-tre-view-05A] • To Do • @team
└── ○ Fix memory leak in parser [bug-fix-memory-leak] • To Do • High • #performance #bug

ARCHIVE (2025-01):
└── 📁 ✓ Completed feature [old-feature-01] • Done • 5/5 done
    ├── ✓ First task [01-task] • Done
    └── ✓ Second task [02-task] • Done

Legend: ✓ Done  → In Progress  ○ To Do  ⊗ Blocked  • High ↑  Low ↓
```

### Key Design Decisions:
- **Status symbol first** for quick scanning (✓ → ○ ⊗)
- **Title before ID** for better readability
- **IDs in brackets** for reference without clutter
- **Full status text** kept for clarity
- **Metadata on same line** with • separators
- **No color emojis** to reduce visual noise
- **Tree structure** clearly shows hierarchy and parallel tasks

### Implementation Plan:
1. Make tree view the default format
2. Add `--format table` for old format (with indentation)
3. Add `--format compact` for minimal view (later)
4. Ensure all filters work with new format
5. Review and update help text for outdated options

### Still To Decide:
- Should we remove deprecated/invalid command options from help?
- How to handle very long titles that might wrap?
- Should archived tasks show by default or require a flag?
