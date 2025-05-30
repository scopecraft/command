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
Analyze how the core layer inconsistencies affect CLI output and user experience. If the same issues exist in CLI (field naming, emoji prefixes, parent detection complexity), implement fixes to ensure consistency across all interfaces.

## Tasks
- [ ] Review CLI formatters for task list and parent list commands
- [ ] Check if CLI has similar inconsistencies (location vs workflow_state, etc.)
- [ ] Analyze CLI's parent task detection logic
- [ ] Document how CLI currently handles type field emojis
- [ ] Identify if CLI users face similar complexity issues
- [ ] Create fixes for any CLI-specific inconsistencies
- [ ] Ensure CLI and MCP present consistent data format

## Deliverable
- Analysis report of CLI inconsistencies
- List of required CLI fixes
- Implementation of CLI normalization if needed

## Log
