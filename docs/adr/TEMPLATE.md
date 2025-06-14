# ADR-XXX: [Title of Decision]

**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-YYY]  
**Date:** YYYY-MM-DD  
**Authors:** [Who wrote this]  
**Reviewers:** [Who reviewed/approved]  

## Context

[Brief description of the problem/situation requiring a decision. Include relevant background and constraints. 2-3 paragraphs max.]

### Research Foundation (if applicable)

[If this decision is based on research tasks, list them here]

## Decision

[State the decision clearly and concisely. One paragraph.]

### Key Decision Factors

[List the main factors that influenced this decision]
- Factor 1: explanation
- Factor 2: explanation
- Factor 3: explanation

## Architecture Decisions Matrix (if comparing options)

| Decision Point | Options Considered | Selected | Rationale |
|---|---|---|---|
| **Main Choice** | Option A, Option B, Option C | Option B | Why this was best |

## Technical Approach

[High-level technical approach ONLY. No implementation details.]
- Architectural pattern chosen
- Integration strategy
- Storage/deployment approach

## Risk Assessment

[Identify key risks and mitigation strategies. Keep high-level.]

### Risk Category
1. **Risk Name**
   - Description: What could go wrong
   - Mitigation: How we'll handle it
   - Fallback: Alternative if mitigation fails

## Success Metrics

[How we'll know if this decision was correct]
- Metric 1: measurable target
- Metric 2: measurable target

## Consequences

### Positive
- [What improves with this decision]

### Negative
- [What trade-offs we're accepting]

### Neutral
- [What stays the same]

## Alternatives Considered

[Brief description of alternatives and why they weren't chosen. One paragraph per alternative.]

## Dependencies

[What this decision depends on or affects]
- Dependency 1: status
- Dependency 2: status

## Related Documents

[Links to related ADRs, research tasks, or documentation]

---

## ADR Writing Guidelines

**DO:**
- Focus on the decision and rationale
- Keep it high-level and architectural
- Document trade-offs honestly
- Make the status clear
- Link to research/evidence

**DON'T:**
- Include implementation details (that's for TRDs)
- Add code examples or file structures
- Create detailed task breakdowns
- Specify exact components or classes
- Plan development phases

**Remember:** ADRs are historical records of decisions, not implementation guides. Keep them focused on WHAT was decided and WHY, not HOW to implement it.