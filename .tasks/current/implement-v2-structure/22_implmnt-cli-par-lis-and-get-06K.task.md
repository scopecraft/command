# Implement CLI parent list and get commands

---
type: feature
status: todo
area: cli
priority: medium
tags:
  - feature
  - cli-parity
---


## Instruction
Implement the missing CLI parent list and get commands.

**Current State**:
- Functions exist in commands.ts but only print "not yet implemented"
- handleFeatureListCommand (line 611)
- handleFeatureGetCommand (line 615)

**Implementation Notes**:
- Use core.parent() methods for functionality
- Follow existing CLI patterns for output formatting
- Support various format options (table, json, etc.)

## Tasks
- [ ] Implement handleFeatureListCommand using core parent list
- [ ] Support workflow filters (--backlog, --current, --archive)
- [ ] Support format options (table, json)
- [ ] Implement handleFeatureGetCommand using core parent get
- [ ] Test both commands with various options

## Deliverable

## Log
