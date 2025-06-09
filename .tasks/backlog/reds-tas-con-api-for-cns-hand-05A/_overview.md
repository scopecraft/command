# Redesign task content API for consistent handling

---
type: feature
status: done
area: core
priority: high
tags:
  - api-design
  - content-handling
  - breaking-change
---


## Instruction
Redesign how task content is handled across the entire system to provide consistent read/write operations and proper separation between metadata and content.

### Problems to Solve
1. **Metadata leakage**: Frontmatter and title are returned as part of content
2. **API asymmetry**: Read returns full content, write only accepts sections
3. **Custom sections**: Can create but cannot update custom sections
4. **No freeform support**: No way to handle unstructured content
5. **Related task**: Need to properly implement add-par-to-get-tas-con-wit-05A

### Goals
- Clear separation between metadata (title, frontmatter) and content
- Symmetric read/write operations
- Support for standard sections, custom sections, and freeform content
- Backward compatibility where possible
- Consistent behavior across CLI, MCP, and UI

### Success Criteria
- Content fields return only body content (no metadata)
- Can update any content type (standard/custom sections, freeform)
- All clients (CLI, MCP, UI) handle content consistently
- Existing integrations continue to work

## Tasks
- [ ] Break down into subtasks
- [ ] Create subtask files
- [ ] Track progress

## Deliverable

## Log
