# Fix orchestration flow not displaying in Task UI Deliverable section

---
type: bug
status: todo
area: ui
tags:
  - markdown-rendering
  - section-parser
  - deliverable-section
  - 'execution:autonomous'
priority: high
---


## Instruction
Fix the issue where orchestration flow diagrams in parent task Deliverable sections are not displaying in the Task UI, despite being present in the raw markdown files.

### Problem Description
- Orchestration flow ASCII diagrams exist in `_overview.md` files (e.g., lines 279-359 in reds-tas-cre-and-edi-ui-for-v2-06A)
- These diagrams are not visible in the Task UI with the new SectionEditor
- This affects the ability to visualize task orchestration flows

### Investigation Starting Points
1. **Core section parser** (`src/core/task-parser.ts`):
   - Check if Deliverable section content is being parsed correctly
   - Verify handling of code blocks within sections
   - Look for issues with multi-line content parsing

2. **MCP section handling** (`src/mcp/handlers/`):
   - Verify sections are passed through correctly
   - Check if content is being truncated or filtered

3. **UI markdown rendering** (`tasks-ui/src/components/`):
   - Check TaskContent or SectionEditor markdown rendering
   - Verify code block rendering (triple backticks)
   - Look for CSS that might hide content

### Success Criteria
- Orchestration flow diagrams display correctly in Deliverable sections
- ASCII art and box-drawing characters render properly
- Code blocks within sections maintain formatting
- No regression in other section rendering

## Tasks
- [ ] Reproduce the issue locally with a parent task
- [ ] Trace content flow from file → parser → MCP → UI
- [ ] Identify where content is lost or incorrectly rendered
- [ ] Implement fix at the appropriate layer
- [ ] Test with various parent task Deliverable sections
- [ ] Verify other sections still render correctly

## Deliverable
Fixed rendering of orchestration flow diagrams in Task UI Deliverable sections.

## Log
- 2025-06-06: Created bug task for missing orchestration flow rendering
