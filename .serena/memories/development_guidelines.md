# Development Guidelines

## Project-Specific Requirements

### Task Management Philosophy
- **ALWAYS** use the CLI to manage tasks in this project (dogfooding)
- Create tasks immediately when issues are discovered
- Update task logs with significant changes
- Mark tasks as "In Progress" when starting work
- Use parent tasks for work with 3+ subtasks

### File Naming and IDs
- Task IDs follow pattern: `title-abbreviation-monthsuffix`
- Month suffixes use base-26 encoding (e.g., 06A = June, first iteration)
- Workflow states: backlog/ → current/ → archive/
- Parent tasks contain subtasks as numbered files

### Testing Approach
- Use Bun test framework
- E2E tests for core functionality
- Create test tasks with `test-` prefix or in TEST workflow
- Run tests before major changes

### MCP Development
- Follow Model Context Protocol specifications
- Maintain compatibility with Claude Desktop and Cursor
- Support both HTTP/SSE and STDIO transports
- Keep request/response schemas in sync

### UI Development
- Use Storybook for component development
- Follow the Scopecraft design system
- Maintain TypeScript types for all components
- Keep API and UI in sync

## Best Practices

### Code Organization
1. Keep modules focused and cohesive
2. Export public API through index.ts
3. Use dependency injection where appropriate
4. Avoid circular dependencies

### Error Handling
1. Use custom error classes
2. Provide actionable error messages
3. Handle edge cases explicitly
4. Log errors appropriately

### Performance
1. Use streaming for large operations
2. Implement caching where beneficial
3. Avoid blocking operations
4. Profile before optimizing

### Security
1. Validate all inputs
2. Sanitize file paths
3. Use environment variables for secrets
4. Run security checks regularly

## Contribution Workflow
1. Create a task for your work
2. Mark task as "In Progress"
3. Make changes following style guide
4. Run `bun run code-check`
5. Update task log with changes
6. Create PR with meaningful description
7. Mark task as complete after merge