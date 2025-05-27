# Knowledge System Design

*Part of the [Scopecraft Vision](./scopecraft-vision.md)*

## Overview

The Knowledge System is Scopecraft's long-lived repository of wisdom, patterns, and decisions. Unlike the tactical Task System, the Knowledge System grows incrementally over time, capturing architectural decisions, design patterns, API contracts, and other reference material that transcends individual features or sprints.

## Role: The Archivist

The Knowledge System acts as an organizational archivist, preserving and organizing:
- **Architectural Patterns**: How we build things
- **Design Decisions**: Why we built them that way  
- **API Specifications**: Contracts between systems
- **Domain Models**: Business logic and rules
- **Standards & Guidelines**: Team conventions
- **Technical References**: Libraries, tools, integrations

## Design Philosophy

### 1. Stability Over Speed
Knowledge artifacts are designed to last. They're updated deliberately, versioned carefully, and referenced frequently. A pattern documented today should still be valuable in two years.

### 2. Discovery Over Structure
Rather than imposing rigid taxonomies, the Knowledge System uses natural language and entity linking to create organic relationships. AI agents discover connections through content, not through folder hierarchies.

### 3. Context Over Isolation
Every piece of knowledge exists in relation to others. Patterns reference decisions, decisions link to standards, standards connect to examples. This web of relationships provides rich context for both humans and AI.

### 4. Evolution Over Revolution
Knowledge grows through accretion and refinement. New insights extend existing knowledge rather than replacing it. Historical context is preserved to understand how thinking evolved.

## Structure

### Directory Organization

```
knowledge/
├── patterns/
│   ├── authentication/
│   │   ├── jwt-tokens.md
│   │   ├── oauth-flow.md
│   │   └── session-management.md
│   ├── error-handling/
│   │   ├── api-errors.md
│   │   └── user-feedback.md
│   └── data-access/
│       ├── repository-pattern.md
│       └── query-optimization.md
├── architecture/
│   ├── decisions/
│   │   ├── ADR-001-microservices.md
│   │   ├── ADR-002-event-sourcing.md
│   │   └── ADR-003-api-versioning.md
│   ├── diagrams/
│   │   ├── system-overview.md
│   │   └── data-flow.md
│   └── principles.md
├── apis/
│   ├── rest/
│   │   ├── user-service.md
│   │   └── payment-service.md
│   └── graphql/
│       └── schema.md
├── domains/
│   ├── user-management/
│   │   ├── models.md
│   │   └── rules.md
│   └── billing/
│       ├── concepts.md
│       └── calculations.md
└── standards/
    ├── code-style.md
    ├── testing-guidelines.md
    └── security-checklist.md
```

### Document Structure

Each knowledge document follows a consistent pattern:

```markdown
---
id: pattern-jwt-auth
type: pattern
domain: authentication
tags: [security, stateless, api]
related:
  - pattern-oauth-flow
  - decision-api-security
  - standard-token-expiry
created: 2024-01-15
updated: 2024-03-20
stability: stable  # experimental | stable | deprecated
---

# JWT Authentication Pattern

## Context
When building stateless APIs, we need a way to authenticate requests...

## Pattern
[Clear description of the pattern]

## Implementation
[Code examples and guidance]

## Trade-offs
[Pros, cons, and alternatives]

## Examples in Use
- `@module:auth-service` implements this for user authentication
- `@feature:api-gateway` uses this for service-to-service auth

## Related Decisions
- See `@decision:ADR-001` for why we chose JWT over sessions
- See `#standard:token-expiry` for rotation policies
```

## Entity Relationships

### Natural Linking Syntax

Knowledge documents use the same entity linking as the rest of Scopecraft:

```markdown
This `#pattern:repository` is used by `@module:user-service` 
based on `@decision:ADR-004-data-access`. 

For implementation details, see `@task:IMPL-USER-REPO` which 
applied this pattern to the user domain.
```

### Relationship Types

Knowledge entities commonly form these relationships:

- **Implements**: `@module:auth` implements `#pattern:jwt-auth`
- **Supersedes**: `#pattern:jwt-v2` supersedes `#pattern:jwt-v1`  
- **Justifies**: `@decision:ADR-001` justifies `#pattern:microservices`
- **Exemplifies**: `@feature:login` exemplifies `#pattern:oauth-flow`
- **Extends**: `#pattern:retry-enhanced` extends `#pattern:retry-basic`

### Progressive Formalization

Knowledge often starts informal and becomes formal:

1. **Mentioned in tasks**: "Used retry logic similar to payment service"
2. **Tagged informally**: "Applied `#retry-pattern` here"
3. **Documented pattern**: Create `patterns/error-handling/retry.md`
4. **Formal entity**: `@pattern:exponential-backoff` with full CRUD

## AI Integration

### Context Loading

When AI agents work on tasks, they automatically load relevant knowledge:

```yaml
Working on: @task:IMPL-CACHE
Auto-loaded context:
  - #pattern:cache-aside (tagged in task)
  - @decision:ADR-009-caching (linked from pattern)
  - #standard:cache-keys (referenced in decision)
  - Examples from @module:product-service
```

### Knowledge Discovery

AI agents can discover knowledge through:

1. **Direct References**: Following `@pattern:` and `#standard:` links
2. **Semantic Search**: Finding similar patterns by content
3. **Relationship Traversal**: Following the knowledge graph
4. **Tag Clustering**: Identifying related concepts

### Knowledge Creation

AI agents can suggest new knowledge artifacts:

```markdown
AI: "I notice you've implemented retry logic in 3 different services.
     Should we create a formal pattern document?"