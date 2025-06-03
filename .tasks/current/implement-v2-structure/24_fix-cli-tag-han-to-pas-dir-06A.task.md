# Fix CLI tag handling to pass directly not via customMetadata

---
type: bug
status: done
area: cli
priority: low
tags:
  - bug-fix
---


## Instruction
Fix CLI tag handling to ensure tags are stored as proper arrays.

**Root Cause**:
- CLI passes tags to customMetadata (commands.ts:215)
- Core expects tags as direct option in createOptions
- When tags come through customMetadata, they might be stored incorrectly

**Fix Required**:
- Move tags from customMetadata to direct createOptions.tags
- Ensure tags are passed as array of individual strings
- Verify storage format is correct

## Tasks
- [ ] Move tags assignment from customMetadata to createOptions.tags
- [ ] Ensure tags remain as array throughout the flow
- [ ] Test that tags are stored correctly in frontmatter
- [ ] Verify tag filtering works after fix

## Deliverable

## Log
- 2025-06-03: Task completed - verified that CLI now passes tags directly via createOptions.tags (commands.ts:214) instead of via customMetadata
