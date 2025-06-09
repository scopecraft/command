# Architecture Patterns Guidance

General architectural patterns and principles for Scopecraft development.

## Core Architectural Principles

### Domain Logic Placement
- **Business logic belongs in `core/`**, not in UI or CLI utilities
- Core should have no external dependencies
- Core defines interfaces, adapters implement them

### Service-Oriented Design
- Design interfaces as services even in monolithic code
- Define clear service boundaries
- Make it easy to extract services later
- Each service should do one thing well

### Dependency Management
- **Wrap external dependencies** in integration layers
- Never let external APIs leak into core
- Make dependencies replaceable
- Use dependency injection patterns

### Configuration Strategy
- **Single source of truth** for all configuration values
- No magic strings scattered through code
- Centralize in services/classes
- Make it easy to add configuration later

## Common Patterns

### Integration Wrapper Pattern
```typescript
// Good: Wrapped external dependency
export interface SessionManager {
  startSession(prompt: string): Promise<Session>;
}

export class ChannelCoderSessionManager implements SessionManager {
  // ChannelCoder-specific implementation
}
```

### Path Resolution Pattern
```typescript
// Good: Centralized path logic
export class PathResolver {
  getBasePath(): string { /* logic in ONE place */ }
}

// Bad: Scattered path logic
const path = `../${projectName}.worktrees/${taskId}`;
```

### Validation Pattern
- Use Zod schemas for runtime validation
- Validate at system boundaries
- Provide helpful error messages
- Co-locate schemas with their usage

## Red Flags to Avoid

### ❌ Business Logic in Wrong Layer
- Domain logic in CLI handlers
- Core logic in UI components
- Validation in transport layer

### ❌ Tight Coupling
- Direct use of external libraries in core
- No abstraction between layers
- Circular dependencies

### ❌ Scattered Configuration
- Magic values throughout code
- Hardcoded paths and URLs
- Environment-specific values in code

### ❌ No Migration Path
- Design that requires rewrite to scale
- Monolithic structure with no boundaries
- No clear service extraction points

## Examples of Good Architectural Decisions

### ✅ "Put this in core because..."
- It's business logic
- It's reusable across interfaces
- It has no external dependencies
- It defines the domain model

### ✅ "Wrap this dependency because..."
- We might want to swap providers
- It's an external service
- We need to control the interface
- It helps with testing

### ✅ "Create a service for this because..."
- It's a distinct responsibility
- Multiple components need it
- It could be extracted later
- It encapsulates complexity

### ✅ "Use this pattern because..."
- It's established in the codebase
- It solves our specific problem
- It enables future flexibility
- It's simple and clear

## Architecture Review Checklist

When reviewing architecture:
- [ ] Is domain logic in the right place?
- [ ] Are external dependencies wrapped?
- [ ] Can this evolve without rewrites?
- [ ] Are service boundaries clear?
- [ ] Is configuration centralized?
- [ ] Are patterns consistent?
- [ ] Is there a migration path?

## Remember

Architecture is about:
- **Enabling change** without rewrites
- **Managing complexity** through boundaries
- **Guiding implementation** without over-constraining
- **Building toward the vision** incrementally