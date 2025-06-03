# Remove normalization from CLI and MCP layers after core integration

---
type: chore
status: done
area: core
---


## Instruction
Clean up normalization logic from CLI and MCP layers after core integration is complete. Since core will now handle all normalization consistently, other layers should pass through raw user input and trust core to normalize before storage.

## Tasks
- [x] Remove normalizePriority() calls from CLI commands.ts create/update functions
- [x] Remove any manual status/type normalization from CLI
- [x] Review MCP transformers.ts - keep format conversion but remove input normalization
- [x] Update MCP to pass raw user input to core for normalization
- [x] Test that CLI still works correctly (core handles normalization)
- [x] Test that MCP API still works correctly (core handles normalization)
- [x] Verify no double-normalization is happening
- [ ] Update any documentation that references layer-specific normalization

## Deliverable
Successfully centralized all normalization in core layer:
- Enhanced core normalizeFrontmatter to use schema service
- Added normalizeTaskType function using schema service
- Removed normalizePriority calls from CLI
- Fixed CLI to pass tags directly instead of via customMetadata
- Removed all denormalization from MCP handlers
- Added priority to task creation output schema
- Fixed MCP location parameter mapping to workflowState
- All normalization now happens in one place: core layer
- Clean separation achieved: core=normalize, CLI=display, MCP=API format

## Log
- 2025-06-03: Starting implementation - will first analyze current normalization patterns and create a plan
- 2025-06-03: Completed comprehensive analysis of normalization patterns across all layers
- 2025-06-03: Created normalization-analysis.md document with current state, data flow diagrams, and refactoring plan
- 2025-06-03: Identified key issues: double normalization, inconsistent responsibility, and core not normalizing on input
- 2025-06-03: Next step: Update core layer to handle all normalization on create/update operations
- 2025-06-03: 2025-06-03: Completed normalization refactoring:
- Core now normalizes all input using schema service
- CLI passes raw input directly to core
- MCP validates but doesn't transform input
- Fixed several bugs: location filter, priority in output
- Created validation enhancement proposal for future work
- Tested that various input formats work correctly
- 2025-06-03: 2025-06-03: Added validation to normalizeFrontmatter:
- Now validates normalized values against schema
- Throws clear errors with valid options if invalid
- Follows architecture intent but as inline implementation
- Created proposal for future ValidationService extraction
- This provides the validation expected from schema system
- 2025-06-03: 2025-06-03: Implemented proper validation that distinguishes between missing and invalid values:
- Updated normalizers to throw errors for invalid values instead of defaulting
- Defaults now only apply when no value is provided
- Successfully validates: Invalid type "completely-invalid-type" throws error with valid options
- Successfully accepts defaults: Missing priority defaults to "medium"

Remaining work identified:
- Current normalizers use hardcoded patterns instead of schema aliases
- Need to add aliases to default-schema.json
- Need to refactor normalizers to use schema-driven approach
- Chosen approach: Build lookup Map once when schema loads with all variations (name, label, emoji, aliases)
- This makes normalization a simple Map.get() operation

Next steps:
1. Add aliases arrays to default-schema.json for all enum values
2. Create buildNormalizer() function that builds Map from schema values
3. Replace hardcoded patterns in normalizeTaskType, normalizeTaskStatus, normalizePriority
4. Keep partial string matching as final fallback before throwing error
5. Update documentation to explain the normalization approach
