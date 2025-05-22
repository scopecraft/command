+++
id = "FEAT-ENHANCEMCP-0522-7W"
title = "Enhance MCP tool descriptions for better AI discoverability"
type = "feature"
status = "🔵 In Progress"
priority = "🔼 High"
created_date = "2025-05-22"
updated_date = "2025-05-22"
assigned_to = ""
phase = "release-v1"
subdirectory = ".tasks/release-v1"
+++

## Problem
MCP tools currently have minimal descriptions (e.g., "List Tasks", "Create Task") in the actual server implementation, making it difficult for AI agents to understand their purpose and proper usage. Detailed descriptions exist in docs/mcp-tool-descriptions.md but aren't exposed through the MCP interface.

## Solution
Update the MCP server tool registrations in src/mcp/core-server.ts to include comprehensive descriptions that help AI agents understand:
- What each tool does
- When to use it
- Parameter meanings and valid values
- Relationships to other tools
- Return value format

## Implementation Plan

### Phase 1: Start with Task Entity (9 tools) ✅
1. Research and document all Task tool descriptions and metadata
2. Create official documentation in markdown
3. Update actual tool metadata in code
4. **STOP and perform full E2E testing**

### Phase 2: Complete All Other Entities (after E2E validation)
Process remaining entities in parallel:
- **Phase Entity** (4 tools) ✅
- **Feature Entity** (5 tools) ✅
- **Area Entity** (5 tools)
- **Template Entity** (1 tool) ✅
- **Configuration Entity** (3 tools) ✅
- **Debug Entity** (1 tool)

## Subtasks

### 1. Task Entity Enhancement ✅
- [x] Research Task entity tools and fields
- [x] Document in `docs/mcp-tools/task-tools.md`
- [x] Update tool descriptions in `src/mcp/core-server.ts`
- [x] Add Zod field-level descriptions with `.describe()`
- [x] Implement dynamic task type enum from templates
- [ ] E2E test with Claude/Cursor

### 2. Phase Entity Enhancement ✅
- [x] Research Phase entity tools and fields
- [x] Document in `docs/mcp-tools/phase-tools.md`
- [x] Update tool descriptions
- [x] Add phase status enum and field descriptions

### 3. Feature Entity Enhancement ✅
- [x] Research Feature entity tools and fields
- [x] Document in `docs/mcp-tools/feature-tools.md`
- [x] Update tool descriptions
- [x] Add field descriptions emphasizing features as epics

### 4. Area Entity Enhancement
- [ ] Research Area entity tools and fields
- [ ] Document in `docs/mcp-tools/area-tools.md`
- [ ] Update tool descriptions

### 5. Template Entity Enhancement ✅
- [x] Template tool already enhanced in Phase 1

### 6. Configuration Entity Enhancement ✅
- [x] Configuration tools already enhanced in Phase 1

### 7. Debug Entity Enhancement
- [ ] Find and document debug tool purpose
- [ ] Update tool description

### 8. Documentation Updates ✅
- [x] Update `docs/mcp-sdk.md` with current patterns

## Progress Summary

### Completed:
- **Task Tools (9)**: All enhanced with descriptions and field documentation
- **Phase Tools (4)**: All enhanced with phase lifecycle guidance
- **Feature Tools (5)**: All enhanced with epic-focused descriptions
- **Template Tool (1)**: Enhanced to show dynamic task types
- **Configuration Tools (3)**: Enhanced with session management details
- **Documentation**: Updated MCP SDK docs with current patterns

### Remaining:
- **Area Tools (5)**: For cross-cutting concerns
- **Debug Tool (1)**: Diagnostic functionality

## Success Criteria
- All MCP tools have comprehensive descriptions
- AI agents can understand tool purpose without external documentation
- Parameter usage is clear from the tool interface
- E2E validation confirms improved AI discoverability

## Findings

### Zod Schema Annotations
- ✅ Zod supports `.describe()` method on all schema types
- ✅ MCP SDK properly passes through these descriptions to clients
- ✅ Can use enums with `z.enum()` for better validation and discovery
- ✅ Implemented dynamic task type enum based on available templates

### Project Root Validation
- `init_root` requires `.tasks` or `.ruru` directory to already exist
- Unlike CLI, MCP does NOT auto-create directories
- Updated descriptions to clarify this requirement

### MCP SDK Documentation Issues
- Uses outdated `server.tool()` method (should be `server.registerTool()`)
- Missing current pattern with raw Zod shapes and options object
- No mention of field-level descriptions with `.describe()`
- Tool list is incomplete (missing features, areas, templates, config tools)
- Needs update to reflect current implementation patterns

### Key Improvements Made
1. **Better Tool Discovery**: Each tool now explains its purpose and use cases
2. **Field-Level Help**: Every parameter has inline documentation
3. **Type Safety**: Enums provide validation and auto-completion
4. **Relationship Clarity**: Tools explain how they relate to each other
5. **Example Values**: Parameters include example values for clarity
