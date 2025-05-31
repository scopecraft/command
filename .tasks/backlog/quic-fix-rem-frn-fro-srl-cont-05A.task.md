# Quick fix: Remove frontmatter from serialized content

---
type: bug
status: todo
area: core
priority: high
tags:
  - quick-fix
  - content-handling
  - 'execution:autonomous'
---


## Instruction
Modify the `serializeTaskDocument()` function in `src/core/v2/task-parser.ts` to return only the content after the frontmatter, excluding the title line and frontmatter block.

This is a quick fix to prevent frontmatter from being displayed in UIs when they request task content. The frontmatter should only be accessible through the metadata/frontmatter fields, not in the content itself.

### Current Behavior
- `serializeTaskDocument()` returns full markdown including title and frontmatter
- This causes UIs to display metadata that should be hidden

### Expected Behavior
- Return only the sections content (Instruction, Tasks, Deliverable, Log, and any custom sections)
- No title line
- No frontmatter block

### Implementation Note
- This is a temporary fix while we redesign the content API
- Keep the existing function signature to avoid breaking changes

## Tasks
- [ ] Modify serializeTaskDocument() to skip title line
- [ ] Modify serializeTaskDocument() to skip frontmatter block
- [ ] Ensure all sections (including custom ones) are still included
- [ ] Run existing tests to ensure no breakage
- [ ] Test with a task that has custom sections

## Deliverable
- Modified `serializeTaskDocument()` that returns only content sections
- No breaking changes to existing API
- All tests passing

## Log
