# Fix MCP input validation to support schema aliases

---
type: bug
status: done
area: mcp
---


## Instruction
Fix MCP input validation to support schema aliases while maintaining AI guidance with canonical values.

**Problem**:
MCP SDK validates inputs against strict Zod enums before our handlers run, rejecting aliases like "feat" → "feature", "wip" → "in_progress", "p2" → "high".

**Solution**:
Implement flexible string input schemas with dynamic descriptions from schema registry:
- Input schemas: Accept any string with canonical examples for AI guidance
- Descriptions: Generated dynamically from schema registry (no hardcoding)
- Core normalization: Handles all validation and alias resolution
- Output schemas: Remain strict for canonical responses

**Architecture**:
AIs get clear guidance on canonical values, humans get alias support, schema registry remains single source of truth.

## Tasks
- [ ] Update TaskTypeInputSchema description using getTypeValues().map(t => t.name)
- [ ] Update TaskStatusInputSchema description using getStatusValues().map(s => s.name)
- [ ] Update TaskPriorityInputSchema description using getPriorityValues().map(p => p.name)
- [ ] Ensure all MCP tools use flexible input schemas (task_create, task_update, parent_create)
- [ ] Remove any remaining strict enum usage in input validation
- [ ] Test that aliases work: feat→feature, wip→in_progress, p2→high
- [ ] Verify AIs get clear canonical value guidance in descriptions
- [ ] Ensure core normalization handles invalid values with proper error messages

## Deliverable
MCP API accepts aliases like CLI does, with schema-driven descriptions providing AI guidance on canonical values. Core handles all normalization consistently across both interfaces.

## Log
- 2025-06-03: Created task to address MCP input validation blocking alias functionality
- 2025-06-03: Successfully implemented schema-driven MCP input validation with alias support. Key changes: 1) Updated TaskCreateInputSchema in schemas.ts to use flexible input schemas instead of strict enums, 2) Removed redundant validation layers in core-server.ts, 3) Made all tool registration use TaskTypeInputSchema, TaskStatusInputSchema, TaskPriorityInputSchema with schema-driven descriptions, 4) Removed forced default area in task_create for better flexibility. Aliases now work: feat→feature, wip→in_progress, p2→high, etc. Architecture is clean with single source of truth in schema registry.
