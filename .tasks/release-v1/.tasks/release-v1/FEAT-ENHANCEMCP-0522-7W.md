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

### Phase 1: Start with Task Entity (9 tools)
1. Research and document all Task tool descriptions and metadata
2. Create official documentation in markdown
3. Update actual tool metadata in code
4. **STOP and perform full E2E testing**

### Phase 2: Complete All Other Entities (after E2E validation)
Process remaining entities in parallel:
- **Phase Entity** (4 tools)
- **Feature Entity** (5 tools) 
- **Area Entity** (5 tools)
- **Template Entity** (1 tool)
- **Configuration Entity** (3 tools)
- **Debug Entity** (1 tool)

## Subtasks

### 1. Task Entity Enhancement
- [ ] Research Task entity tools and fields
- [ ] Document in `docs/mcp-tools/task-tools.md`
- [ ] Update tool descriptions in `src/mcp/core-server.ts`
- [ ] E2E test with Claude/Cursor

### 2. Phase Entity Enhancement
- [ ] Research Phase entity tools and fields
- [ ] Document in `docs/mcp-tools/phase-tools.md`
- [ ] Update tool descriptions

### 3. Feature Entity Enhancement
- [ ] Research Feature entity tools and fields
- [ ] Document in `docs/mcp-tools/feature-tools.md`
- [ ] Update tool descriptions

### 4. Area Entity Enhancement
- [ ] Research Area entity tools and fields
- [ ] Document in `docs/mcp-tools/area-tools.md`
- [ ] Update tool descriptions

### 5. Template Entity Enhancement
- [ ] Research Template tools
- [ ] Document in `docs/mcp-tools/template-tools.md`
- [ ] Update tool descriptions

### 6. Configuration Entity Enhancement
- [ ] Research Configuration tools
- [ ] Document in `docs/mcp-tools/config-tools.md`
- [ ] Update tool descriptions

### 7. Debug Entity Enhancement
- [ ] Document debug tool purpose
- [ ] Update tool description

## Success Criteria
- All MCP tools have comprehensive descriptions
- AI agents can understand tool purpose without external documentation
- Parameter usage is clear from the tool interface
- E2E validation confirms improved AI discoverability
