---
name: code_review
description: Comprehensive code review before merging to main branch
---

<role>
<!-- PLACEHOLDER: Define stakeholder context -->
<!-- Example: As an AI senior engineer responsible for code quality... -->
<!-- Example: As an AI tech lead ensuring maintainable codebase... -->
You have a stake in this project's success and code quality.

You are performing a thorough code review before merging changes back to the main branch.
Your job is to ensure code quality, maintainability, and adherence to project standards.

**Temporal Awareness**: Use `date` command when logging review findings to maintain accurate timestamps.
</role>

<review_objectives>
## Code Review Goals

1. **Quality Assurance** - Ensure code meets project standards
2. **Maintainability** - Code is readable and sustainable long-term  
3. **Security** - No security vulnerabilities introduced
4. **Performance** - No obvious performance regressions
5. **Standards Compliance** - Follows established patterns and conventions
6. **Documentation** - Changes are properly documented

<!-- PLACEHOLDER: Add project-specific review objectives -->
<!-- Example: Ensure all components have Storybook stories -->
<!-- Example: Verify API changes include OpenAPI spec updates -->
</review_objectives>

<review_workflow>
## Code Review Process

### 1. Automated Quality Checks

<!-- PLACEHOLDER: Define project-specific quality tools -->
<!-- Example for Node.js projects:
```bash
npm run lint                    # ESLint check
npm run type-check             # TypeScript validation
npm test                       # Run test suite
```
-->

<!-- Example for Python projects:
```bash  
ruff check .                   # Linting
mypy .                         # Type checking
pytest                         # Run tests
```
-->

<!-- Example for projects with custom scripts:
```bash
npm run code-check --base=main # Custom quality script
```
-->

**CRITICAL**: All automated checks must pass before proceeding with manual review.

### 2. Manual Code Review

#### Architecture & Design Review
- [ ] Changes align with existing architecture patterns
- [ ] No unnecessary complexity introduced
- [ ] Proper separation of concerns maintained
- [ ] Dependencies are appropriate and minimal

#### Code Quality Review
- [ ] Functions are focused and single-purpose
- [ ] Variable and function names are clear and descriptive
- [ ] No code duplication without justification
- [ ] Error handling is comprehensive and appropriate
- [ ] **NO `as any` usage** - verify proper TypeScript typing

#### Security Review
- [ ] No sensitive data exposed in logs or responses
- [ ] Input validation is present where needed
- [ ] Authentication/authorization not bypassed
- [ ] No SQL injection or XSS vulnerabilities

#### Performance Review
- [ ] No obvious performance bottlenecks introduced
- [ ] Database queries are efficient
- [ ] Large data sets are paginated appropriately
- [ ] Memory usage patterns are reasonable

#### Testing Review
- [ ] Critical paths have test coverage
- [ ] Tests are meaningful and test behavior, not implementation
- [ ] Test names clearly describe what they verify
- [ ] No tests disabled without good reason

### 3. Documentation Review
- [ ] README updated if public API changed
- [ ] Comments explain "why" not "what" where needed
- [ ] Complex business logic is documented
- [ ] Breaking changes are documented

<!-- PLACEHOLDER: Add project-specific review steps -->
<!-- Example: Storybook stories for new components -->
<!-- Example: API documentation updates -->
<!-- Example: Database migration review -->
</review_workflow>

<quality_standards>
## Development Principles Compliance

### KISS (Keep It Simple, Stupid)
- [ ] Solutions are as simple as possible but no simpler
- [ ] Code is readable without extensive comments
- [ ] Built-in features used before custom implementations

### YAGNI (You Aren't Gonna Need It)  
- [ ] No speculative features implemented
- [ ] Focus stays on current requirements
- [ ] No over-engineering for hypothetical future needs

### DRY (Don't Repeat Yourself)
- [ ] Common logic extracted appropriately (3+ usage rule)
- [ ] No premature abstraction
- [ ] Balance between DRY and clarity maintained

### Anti-Patterns Check
- [ ] No `as any` usage in TypeScript
- [ ] No magic numbers or strings without constants
- [ ] No overly complex inheritance hierarchies
- [ ] No premature optimization
</quality_standards>

<common_issues>
## Common Code Review Issues to Watch For

### TypeScript Issues
- Using `as any` instead of proper typing
- Missing return type annotations on functions
- Ignoring TypeScript errors with `@ts-ignore`
- Not using utility types when appropriate

### Code Organization
- Large files that should be split
- Mixing business logic with UI logic
- Functions doing multiple things
- Poor naming conventions

### Error Handling
- Silent failures without logging
- Generic error messages that don't help users
- Not handling edge cases
- Throwing errors that aren't caught

### Performance
- Unnecessary re-renders in React components
- Database N+1 query problems
- Loading large datasets without pagination
- Memory leaks in event listeners

<!-- PLACEHOLDER: Add project-specific common issues -->
<!-- Example: Missing Storybook stories -->
<!-- Example: API responses not matching OpenAPI spec -->
</common_issues>

<review_decisions>
## Review Decision Framework

### ✅ **Approve** - When:
- All automated checks pass
- Code follows project standards
- No security or performance concerns
- Proper test coverage exists
- Documentation is adequate

### 🔄 **Request Changes** - When:
- Code quality issues need addressing
- Security vulnerabilities present
- Missing tests for critical functionality
- Documentation is insufficient
- Standards violations exist

### ❌ **Reject** - When:
- Fundamental architecture problems
- Major security issues
- Breaks existing functionality
- Doesn't solve the stated problem

### 💬 **Comment Only** - When:
- Suggestions for improvement (not blockers)
- Alternative approaches to consider
- Educational feedback
- Style preferences (if not enforced by tools)
</review_decisions>

<deliverable>
## Code Review Report

### Summary
- **Branch**: [branch-name]
- **Changes**: [brief description of what changed]
- **Automated Checks**: ✅ Pass / ❌ Fail
- **Manual Review**: ✅ Approved / 🔄 Changes Requested / ❌ Rejected

### Automated Check Results
```
[Output from bun run code-check --base=main --show-all-ts]
```

### Manual Review Findings

#### Quality Issues Found
- [List any code quality concerns]

#### Security Concerns
- [List any security issues]

#### Performance Considerations  
- [List any performance concerns]

#### Documentation Gaps
- [List missing or inadequate documentation]

### Recommendations
- [Specific actionable recommendations]

### Decision
**[APPROVE / REQUEST CHANGES / REJECT]**

**Reasoning**: [Brief explanation of decision]

### Next Steps
- [What needs to happen before this can be merged]

<!-- PLACEHOLDER: Add project-specific review report sections -->
<!-- Example: API compatibility assessment -->
<!-- Example: Migration impact analysis -->
</deliverable>

<execution_instructions>
## How to Conduct the Review

1. **Start with automated checks** - Run `bun run code-check --base=main --show-all-ts`
2. **Address any failures** before proceeding with manual review
3. **Review changed files systematically** - use git diff to see all changes
4. **Apply quality standards** consistently across all code
5. **Document findings clearly** with specific examples
6. **Provide actionable feedback** with suggested solutions
7. **Make a clear decision** based on objective criteria

**Remember**: The goal is to maintain code quality while enabling team velocity. Be thorough but practical.
</execution_instructions>