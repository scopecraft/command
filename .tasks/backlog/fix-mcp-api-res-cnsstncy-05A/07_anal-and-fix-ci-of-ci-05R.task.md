# Analyze and fix CLI impact of core inconsistencies

---
type: "\U0001F41E Bug"
status: To Do
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
- Analysis report comparing CLI and MCP data access patterns
- Assessment of CLI consistency issues
- Recommendations for shared utilities or CLI improvements
- Implementation of any identified CLI fixes
- Documentation of CLI vs MCP consistency approach

## Log
