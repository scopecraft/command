---
title: "Feedback Loops & Expert Collaboration"
description: "How feedback and questions work as first-class features in Scopecraft"
version: "1.0"
status: "draft"
category: "concept"
updated: "2025-01-07"
authors: ["system"]
related:
  - philosophy.md
  - ../02-architecture/system-architecture.md
  - task-system.md
---

# Feedback Loops & Expert Collaboration

## Table of Contents

1. [Overview](#overview)
2. [Why Feedback is First-Class](#why-feedback-is-first-class)
3. [The Expert Collaboration Model](#the-expert-collaboration-model)
4. [Feedback Mechanisms](#feedback-mechanisms)
5. [Question-Driven Development](#question-driven-development)
6. [Decision Tracking](#decision-tracking)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices](#best-practices)

## Overview

Scopecraft treats feedback and questions as first-class citizens, not afterthoughts. This reflects how experts actually collaborate - through continuous back-and-forth, questions, clarifications, and iterative refinement.

## Why Feedback is First-Class

### Traditional vs Scopecraft Approach

```
Traditional Development:          Scopecraft Development:
───────────────────────          ──────────────────────
Linear progression        →      Iterative refinement
Hidden questions         →      Explicit uncertainties
Lost context            →      Preserved decisions
Solo problem solving    →      Expert collaboration
```

### The Reality of Expert Work

Real expert collaboration involves:
- Asking clarifying questions
- Challenging assumptions  
- Proposing alternatives
- Building on each other's ideas
- Learning from attempts

Scopecraft makes this natural pattern explicit and trackable.

### Uncertainty as a Signal, Not a Weakness

The critical insight: **Uncertainty is valuable information that must be communicated**. When AI agents can:

1. **Clearly indicate questions** to other expert agents OR humans
2. **Receive feedback** to correct, adjust, and improve
3. **Maintain context** through the feedback loop

This creates a much stronger system than one that hides uncertainty or makes assumptions without flagging them. The feedback system isn't just a nice-to-have - it's the mechanism that enables true expert collaboration between humans and AI.

## The Expert Collaboration Model

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXPERT COLLABORATION FLOW                       │
│                                                                  │
│     Human Expert                           AI Expert            │
│          │                                     │                │
│          ▼                                     ▼                │
│    ┌─────────────┐                      ┌─────────────┐       │
│    │   PROPOSE   │                      │   EXECUTE   │       │
│    │  • Ideas    │                      │  • Code     │       │
│    │  • Design   │                      │  • Research │       │
│    │  • Goals    │                      │  • Analysis │       │
│    └──────┬──────┘                      └──────┬──────┘       │
│           │                                     │               │
│           ▼                                     ▼               │
│    ┌─────────────────────────────────────────────────┐        │
│    │              FEEDBACK & QUESTIONS               │        │
│    │                (First-Class!)                   │        │
│    │                                                 │        │
│    │  • "This approach won't scale because..."      │        │
│    │  • "Should we use pattern X or Y?"            │        │
│    │  • "I need clarification on requirement Z"     │        │
│    │  • "Consider this alternative..."              │        │
│    └─────────────────────────────────────────────────┘        │
│           │                                     │               │
│           ▼                                     ▼               │
│    ┌─────────────┐                      ┌─────────────┐       │
│    │   REFINE    │                      │   ADAPT     │       │
│    │  • Iterate  │                      │  • Learn    │       │
│    │  • Improve  │                      │  • Adjust   │       │
│    │  • Decide   │                      │  • Retry    │       │
│    └─────────────┘                      └─────────────┘       │
│                                                                 │
│                     Continuous Loop                             │
└─────────────────────────────────────────────────────────────────┘
```

## Feedback Mechanisms

### 1. In-Task Questions

Questions live directly in task documents:

```markdown
## Questions
- [ ] Should we implement caching at the API or database level?
- [ ] Is 100ms response time acceptable for this endpoint?
- [x] Use PostgreSQL? (Approved by @john)
- [ ] Need to support real-time updates?

## To Investigate
- Performance impact of JSON aggregation
- Security implications of direct S3 access
- Cost comparison: Redis vs PostgreSQL caching
```

### 2. Session Continuations

AI sessions can be paused for human feedback:

```typescript
// AI reaches decision point
session.pause({
  reason: "architectural_decision",
  question: "Should we use event sourcing or CRUD for order management?",
  context: {
    pros_event_sourcing: ["Full audit trail", "Time travel"],
    pros_crud: ["Simpler", "Well understood"],
    recommendation: "CRUD for MVP, event sourcing later"
  }
})

// Human provides feedback
session.continue({
  decision: "Use CRUD for now",
  rationale: "Speed to market is priority",
  future_consideration: "Revisit after launch"
})
```

### 3. Stream Monitoring & Intervention

Real-time observation and course correction:

```
┌─────────────────────────────────────────────────────────────────┐
│                    STREAM MONITORING                             │
│                                                                  │
│  AI: "Implementing user authentication..."                      │
│  AI: "Installing passport-jwt..."                               │
│  Human: [INTERVENE] "We use AWS Cognito for auth"             │
│  AI: "Switching to AWS Cognito implementation..."              │
│                                                                  │
│  Continuous observation enables timely intervention             │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Approval Gates

Explicit checkpoints for human review:

```yaml
workflow:
  - step: design_api
    output: api_spec.yaml
    approval_required: true
    
  - step: implement_api
    depends_on: design_api.approved
    
  - step: deploy_staging
    approval_required: true
    approvers: ["tech_lead", "security_team"]
```

## Handling Uncertainty in Different Modes

### Interactive Mode
In interactive sessions, uncertainty is handled naturally:
- AI asks questions directly
- Human provides immediate feedback
- Context adjusts in real-time
- Decisions are made collaboratively

### Autonomous Mode
In autonomous execution, uncertainty requires different strategies:

```markdown
## When Uncertain, Document and Continue

1. **Flag the uncertainty**
   "QUESTION: Should we use Redis or PostgreSQL for caching?"
   
2. **Document assumptions**
   "ASSUMPTION: Using PostgreSQL for consistency with existing stack"
   
3. **Mark for review**
   "REVIEW NEEDED: Performance implications of this choice"
   
4. **Continue progress**
   Don't let uncertainty block all work

## The Autonomous Protocol
- Make reasonable assumptions
- Document them clearly
- Flag for human review
- Enable easy correction later
```

This approach ensures:
- Work continues despite uncertainty
- Decisions are traceable
- Humans know what needs review
- Context is preserved for corrections

### Multi-Agent Collaboration
When agents work together, questions flow between them:

```
Research Agent → "Found 3 approaches, unclear which fits best"
                          ↓
Design Agent   → "Based on constraints, approach B is optimal"
                          ↓
Implement Agent → "Approach B has edge case X, how to handle?"
                          ↓
Human Gate     → "Use fallback pattern Y for edge case"
```

## Question-Driven Development

### Questions as Work Drivers

Questions naturally drive development:

```markdown
## Current Questions
1. How should we handle authentication?
   → Research task: Evaluate auth providers
   
2. What's our scaling strategy?
   → Spike task: Load testing scenarios
   
3. How do we ensure GDPR compliance?
   → Task: Implement data privacy controls
```

### Question States

Questions evolve through states:

```
Open → Under Investigation → Proposed Answer → Decided → Implemented
  │            │                    │              │            │
  │            │                    │              │            └─ Solution in code
  │            │                    │              └────────────── Decision made
  │            │                    └───────────────────────────── Answer proposed
  │            └────────────────────────────────────────────────── Research active
  └─────────────────────────────────────────────────────────────── Needs attention
```

### Question Templates

Common question patterns:

```markdown
## Technical Questions
- [ ] Performance: Can this scale to X users?
- [ ] Security: What are the attack vectors?
- [ ] Cost: What's the monthly AWS bill?
- [ ] Maintenance: How hard is this to debug?

## Product Questions  
- [ ] User Impact: Does this solve the real problem?
- [ ] Priority: Is this P0 or can it wait?
- [ ] Scope: MVP or full feature?
- [ ] Success Metric: How do we measure this?
```

## Decision Tracking

### Decision Records

Every significant decision is captured:

```markdown
## Decisions

### 2024-01-15: Database Selection
**Decision**: Use PostgreSQL over MongoDB
**Rationale**: 
- Strong consistency requirements
- Complex relational queries needed
- Team expertise with PostgreSQL
**Trade-offs**:
- Less flexible schema
- Requires upfront design
**Revisit**: After 6 months of production data

### 2024-01-20: API Authentication  
**Decision**: JWT with refresh tokens
**Rationale**:
- Stateless authentication
- Mobile app compatibility
- Industry standard
**Implementation**: See AUTH-001
```

### Decision Impact Tracking

Link decisions to outcomes:

```markdown
## Decision Outcomes

### Database Selection (2024-01-15)
**Result**: ✅ Successful
- Query performance excellent
- No schema migration issues
- Would make same choice again

### API Rate Limiting (2024-02-01)
**Result**: ⚠️ Partial Success
- Prevented abuse as intended
- But: Too restrictive for power users
- Adjustment: Implement tiered limits
```

## Implementation Examples

### Task with Active Feedback

```markdown
---
type: feature
status: in_progress
---

# Implement Real-time Notifications

## Questions
- [x] WebSockets or Server-Sent Events? → WebSockets (approved)
- [ ] How to handle offline messages?
- [ ] Rate limiting strategy?

## Current Blockers
- Waiting on security review for WebSocket implementation
- Need decision on message retention policy

## Feedback from Review
- @alice: "Consider fallback to polling for corporate firewalls"
- @bob: "Message ordering must be guaranteed"
- @ai: "Implemented acknowledgment system for ordering"

## Next Steps
1. Address security feedback
2. Implement fallback mechanism
3. Load test with 10k concurrent connections
```

### Session with Intervention

```typescript
// orchestration/session-123.log
[2024-01-15 10:00:00] Session started: implement-notifications
[2024-01-15 10:05:00] AI: Installing socket.io...
[2024-01-15 10:05:30] Human: FEEDBACK: Use our existing WebSocket service
[2024-01-15 10:05:31] AI: Acknowledged. Switching to existing service...
[2024-01-15 10:10:00] AI: Implementing message queue...
[2024-01-15 10:15:00] Human: QUESTION: How are you handling duplicates?
[2024-01-15 10:15:30] AI: Using message IDs with 5-minute dedup window
[2024-01-15 10:15:45] Human: APPROVED: Good approach
```

## Best Practices

### 1. Make Uncertainty Visible

```markdown
## Assumptions
- Users have stable internet (needs validation)
- 1GB memory is sufficient (needs load testing)
- API response <200ms is acceptable (needs user research)
```

### 2. Track Question Resolution

```markdown
## Question Log
- [2024-01-15] Q: Best caching strategy? A: Redis with 5min TTL
- [2024-01-16] Q: Handle concurrent edits? A: Last-write-wins + conflicts UI
- [2024-01-17] Q: GDPR compliance? A: Pending legal review
```

### 3. Link Feedback to Changes

```markdown
## Feedback Integration
- Feedback: "API too slow for mobile" → Implemented pagination
- Feedback: "Confusing error messages" → Added error code mapping
- Feedback: "Missing audit trail" → Added event logging
```

### 4. Preserve Context

```markdown
## Why Decisions Were Made
- Chose REST over GraphQL because:
  - Team knows REST well
  - Simpler caching strategy
  - Better tooling support
  - (Context: 3-person team, 3-month deadline)
```

### 5. Enable Async Collaboration

```markdown
## Open for Feedback
- [ ] @frontend: Is this API shape convenient?
- [ ] @security: Any concerns with token approach?
- [ ] @ops: Can you review the scaling approach?
```

## Summary

Feedback loops in Scopecraft:
1. **Are first-class** - Built into every layer
2. **Drive development** - Questions become tasks
3. **Preserve knowledge** - Decisions are tracked
4. **Enable collaboration** - Human and AI as peers
5. **Improve outcomes** - Continuous refinement

This approach acknowledges that software development is rarely linear and that the best solutions emerge from iterative collaboration between experts.

## Next Steps

- Learn about [Task System](task-system.md) to see feedback in practice
- Explore [Session Management](../02-architecture/orchestration-architecture.md) for AI feedback loops
- Read [Philosophy](philosophy.md) for deeper understanding of principles