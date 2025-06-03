# Analyze and fix CLI impact of core inconsistencies

---
type: bug
status: done
area: cli
tags:
  - cli-consistency
  - 'team:backend'
  - 'execution:autonomous'
  - analysis
---


## Instruction
Analyze if CLI has similar inconsistencies to those we fixed in MCP. The goal is ensuring both CLI and MCP present data consistently to users. Since CLI is primarily for human consumption, some display formatting differences are acceptable, but the underlying data access patterns should be consistent.

**Focus Areas:**
- Does CLI use same confusing field names (location vs workflowState)?
- Does CLI have complex parent task detection logic?
- Are CLI formatters accessing core data efficiently?
- Do CLI and MCP use the same core data transformation patterns?
- Could CLI benefit from the same Zod schema approach for validation?

**Note:** CLI can keep emoji prefixes for display if that improves UX, but underlying data access should be consistent.

## Tasks
- [ ] Review CLI formatters in src/cli/ for task and parent commands
- [ ] Analyze CLI's data access patterns from core V2
- [ ] Check if CLI uses same confusing field names as old MCP
- [ ] Document CLI's parent task detection logic complexity
- [ ] Compare CLI and MCP transformation patterns
- [ ] Identify opportunities for shared transformation utilities
- [ ] Assess if CLI would benefit from Zod validation
- [ ] Document CLI vs MCP data access consistency
- [ ] Implement shared utilities if beneficial
- [ ] Create CLI-specific fixes if needed
- [ ] Ensure both interfaces use core data efficiently

## Deliverable
✅ **Analysis Complete** - Created comprehensive report: `cli-mcp-consistency-analysis.md`

**Key Findings:**
- CLI already uses core V2 properly - no major inconsistencies
- Field names are consistent (uses workflowState correctly)
- Parent task detection is simple (single boolean check)
- Emojis are presentation-only in formatters
- Data access is direct and efficient

**Recommendations:**
- No major refactoring needed
- Create shared utilities for progress calculation
- Optional Zod integration for input validation
- Document CLI as example of correct core V2 usage

## Log
- 2025-05-30: Started analysis phase - reviewing CLI formatters and data access patterns
- 2025-05-30: Completed analysis phase. Found that CLI is already well-structured and uses core V2 properly. No major consistency issues like MCP had. Main opportunity is creating shared utilities.
- 2025-05-30: Analysis complete. CLI is already well-structured with no major issues. Created separate enhancement task for shared utilities: cret-sha-uti-for-cli-and-mcp-05A
