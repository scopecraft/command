# Development Principles Guidance

## When This Applies
Load this guidance when working on implementation tasks, code reviews, architectural decisions, or any software development work that requires balancing quality with pragmatism.

## Core Development Principles

### KISS (Keep It Simple, Stupid)
- Choose the most straightforward solution that addresses the requirements
- Favor readability over cleverness - code is read more than it's written
- Minimize complexity by using built-in features before custom implementations
- Ask: "Could a new developer understand this code without extensive explanation?"

### YAGNI (You Aren't Gonna Need It)
- Don't implement functionality until it's actually needed
- Avoid speculative features based on what "might be needed later"
- Focus on the current requirements, not hypothetical future ones
- If a feature isn't explicitly requested, don't build it

### DRY (Don't Repeat Yourself), But Not Obsessively
- Extract common logic into utility functions when you see the pattern 3+ times
- Balance DRY with readability - sometimes duplication is clearer than the wrong abstraction
- Don't over-abstract prematurely - wait for patterns to emerge naturally

## Quality Standards

### Code Quality
- Follow existing codebase patterns and conventions
- Write self-documenting code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Handle errors gracefully with proper logging and user feedback

### Architecture Principles
- Favor composition over inheritance
- Build functionality by combining simple, focused pieces
- Maintain clear boundaries between modules and components
- Use explicit patterns rather than implicit behavior

### Testing Approach
- Test as you build, don't defer testing to the end
- Focus on testing behavior, not implementation details
- Write tests that document how the system should work
- Prioritize tests for critical paths and edge cases

## Decision Framework

When making implementation decisions, ask these questions in order:

1. **Necessity**: Does this solve the actual requirement?
2. **Simplicity**: Is this the simplest approach that works?
3. **Clarity**: Will others understand this code easily?
4. **Maintainability**: How hard will this be to change or debug later?
5. **Performance**: Does this meet performance requirements without over-optimization?

## Anti-Patterns to Avoid

### Premature Optimization
- Don't optimize code until performance issues are identified
- Focus on correct functionality before optimizing
- Measure before optimizing - don't guess where bottlenecks are

### Over-Engineering
- Don't create complex abstraction layers "just in case"
- Avoid design patterns that don't clearly improve the codebase
- Prefer simple functions over complex class hierarchies

### Magic Numbers and Strings
- Use named constants for values that have business meaning
- But don't create constants for values used only once
- Make the code self-explanatory wherever possible

## Practical Application

### Code Review Mindset
- Focus on correctness, readability, and maintainability
- Suggest improvements, but distinguish between preferences and problems
- Consider the business context - perfect code that ships late may be worse than good code that ships on time

### Technical Debt Management
- Acknowledge when taking shortcuts for business reasons
- Document technical debt clearly for future resolution
- Don't let perfect be the enemy of good, but don't ignore quality entirely

### Error Handling Strategy
- Fail fast when inputs are invalid
- Provide clear error messages that help users understand what went wrong
- Log errors with enough context for debugging
- Handle expected failures gracefully

## Remember

The goal is to create a maintainable solution that solves real problems, not to create the most elegant or sophisticated possible solution.

Good code is code that:
1. Works correctly for the intended use cases
2. Can be understood by other humans (including your future self)
3. Can be maintained and modified as requirements change
4. Follows established team and project conventions

Prioritize these qualities over technical brilliance or advanced patterns that don't serve the project's actual needs.