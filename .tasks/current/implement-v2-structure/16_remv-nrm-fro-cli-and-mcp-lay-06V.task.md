# Remove normalization from CLI and MCP layers after core integration

---
type: chore
status: To Do
area: core
---


## Instruction
Clean up normalization logic from CLI and MCP layers after core integration is complete. Since core will now handle all normalization consistently, other layers should pass through raw user input and trust core to normalize before storage.

## Tasks
- [ ] Remove normalizePriority() calls from CLI commands.ts create/update functions
- [ ] Remove any manual status/type normalization from CLI
- [ ] Review MCP transformers.ts - keep format conversion but remove input normalization
- [ ] Update MCP to pass raw user input to core for normalization
- [ ] Test that CLI still works correctly (core handles normalization)
- [ ] Test that MCP API still works correctly (core handles normalization)
- [ ] Verify no double-normalization is happening
- [ ] Update any documentation that references layer-specific normalization

## Deliverable
- CLI and MCP layers cleaned of normalization logic
- All normalization centralized in core layer
- All input paths (CLI, MCP) tested and working
- Clean separation of concerns: core=normalize, CLI=display, MCP=API format

## Log
