# Improve task list command display with tree view

---
type: feature
status: To Do
area: cli
priority: 🔼 High
---

## Instruction

The current `task list` command has two major issues:

1. **No visual distinction between parent tasks and subtasks** - All tasks appear at the same level in the table, making it hard to understand the hierarchy
2. **ID truncation issues** - With the new ID format (max ~30 chars), the table layout breaks or IDs get cut off

**IMPORTANT**: Before implementing, the developer should:
1. Try various `task list` commands with parent tasks and subtasks
2. Analyze the current display issues
3. Research and propose multiple UI solutions
4. Get feedback on the best approach before coding

### Current Problems

When running `sc task list`, you get something like:
```
ID                        Title                               Status          Location
────────────────────────────────────────────────────────────────────────────────────
implement-v2-structure    Implement New Workflow Structure    In Progress     current
01-core-refactor          Core refactor                       In Progress     current  
02-cli-update             CLI update                          Done            current
02-mcp-update             MCP update                          To Do           current
```

Problems:
- Can't tell that 01-core-refactor is a subtask of implement-v2-structure
- IDs can be very long (e.g., `improv-tas-lis-cd-wit-tre-view-05A`)
- No indication of parallel tasks (both 02- tasks)

### Potential Solutions to Explore

1. **Tree View by Default** (like `parent show --tree`):
   ```
   Location: current
   ├── implement-v2-structure: Implement New Workflow Structure (In Progress)
   │   ├── 01-core-refactor: Core refactor (In Progress)
   │   ├─┬ [Parallel - 02]
   │   │ ├ 02-cli-update: CLI update (Done)
   │   │ └ 02-mcp-update: MCP update (To Do)
   │   └── 03-ui-update: UI update (To Do)
   └── standalone-task-05K: Some other task (To Do)
   ```

2. **Indented Table View**:
   ```
   ID                          Title                               Status
   ─────────────────────────────────────────────────────────────────────
   implement-v2-structure      Implement New Workflow Structure    In Progress
     01-core-refactor          Core refactor                       In Progress
     02-cli-update             CLI update                          Done
     02-mcp-update             MCP update                          To Do
   standalone-task-05K         Some other task                     To Do
   ```

3. **Grouped View** (show parent, then subtasks):
   ```
   Parent: implement-v2-structure - Implement New Workflow Structure
   ├── 01-core-refactor: Core refactor (In Progress)
   ├── 02-cli-update: CLI update (Done)
   └── 02-mcp-update: MCP update (To Do)
   
   Standalone Tasks:
   └── standalone-task-05K: Some other task (To Do)
   ```

### Implementation Considerations

- Should tree view be default or require `--tree` flag?
- How to handle filtering (e.g., `--status "In Progress"`)?
- Should we show full IDs or truncate with ellipsis?
- How to indicate parallel tasks clearly?
- What about mixed workflows (tasks from backlog, current, archive)?
- Consider terminal width constraints

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
