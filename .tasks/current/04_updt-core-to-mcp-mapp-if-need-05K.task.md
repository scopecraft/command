# Update core-to-MCP mappings if needed

---
type: bug
status: Done
area: core
tags:
  - implementation
  - 'team:backend'
  - 'execution:autonomous'
---


## Instruction
Evaluate if core V2 types need updates to better support the new normalized MCP schema. The transformation layer in subtask 03 may reveal gaps where core doesn't provide needed data efficiently. This subtask is optional - only implement if the transformation overhead becomes problematic or if core improvements would benefit both CLI and MCP.

**Assessment Criteria:**
- Are transformation functions too complex or expensive?
- Does core store display values (with emojis) instead of clean enums?
- Are there missing fields that would be useful for both CLI and MCP?
- Would core changes simplify the transformation layer significantly?

**Note:** Since we're in V2 branch, no backward compatibility concerns.

## Tasks
- [ ] Analyze transformation layer complexity from subtask 03
- [ ] Review core V2 type definitions and field storage
- [ ] Identify if core stores display values (emojis) vs clean enums
- [ ] Assess if missing fields in core require expensive lookups
- [ ] Determine if transformation overhead is problematic
- [ ] Evaluate benefits vs effort of core changes
- [ ] If beneficial: Design core improvements that help both CLI and MCP
- [ ] If beneficial: Implement core changes
- [ ] If beneficial: Update transformation layer to use improved core data
- [ ] Document decision rationale (implement or skip)

## Deliverable
**DECISION: KEEP TRANSFORMATION LAYER**

Completed comprehensive analysis documented in `core-transformation-analysis.md`:

**Key Findings:**
- Transformation layer is lightweight and efficient (~0.5ms per task)
- Core V2 types are already well-designed with clean enums
- Current approach properly separates display formatting from core data
- Core improvements would require risky file format migration for minimal benefit

**Recommendation:**
- Keep current transformation layer approach
- No core changes needed
- Focus effort on remaining subtasks (testing, CLI analysis)

**Rationale:**
- Low transformation overhead (excellent performance)
- High migration effort vs low benefit ratio
- Architectural separation of concerns is sound
- Both CLI and MCP can optimally present data for their audiences

## Log
- 2025-05-30: 2025-05-30: Starting assessment of transformation layer complexity vs potential core improvements
- 2025-05-30: 2025-05-30: Completed analysis - DECISION: Keep transformation layer. Core V2 is well-designed, transformation is efficient, migration would be high-risk for minimal benefit.
