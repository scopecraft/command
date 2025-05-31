# Update CLI to use new content API

---
type: feature
status: To Do
area: cli
tags:
  - cli
  - implementation
---


## Instruction
Update the CLI to use the new content API, ensuring consistent behavior with core changes.

### Changes Required
1. Update `task get` command to use new content fields
2. Add options for content format (--content-only, --with-sections)
3. Update `task update` to support custom sections
4. Ensure formatters handle new content structure
5. Maintain backward compatibility

### Files to Update
- `src/cli/commands-v2.ts`: Command implementations
- `src/cli/entity-commands-v2.ts`: Entity command handlers
- `src/core/formatters-v2.ts`: Output formatting

## Tasks
- [ ] Add content format options to task get command
- [ ] Update task show output to use new fields
- [ ] Add custom section support to task update
- [ ] Update formatters for new content structure
- [ ] Add CLI tests for content options
- [ ] Update help text and documentation
- [ ] Test backward compatibility

## Deliverable
- Updated CLI with new content options
- Backward compatible command behavior
- Updated help documentation
- CLI integration tests

## Log
