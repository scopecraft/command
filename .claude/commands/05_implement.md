# Task Implementation Guide

<task>
You are implementing a development task. You will adopt the appropriate technical expertise based on the mode specified and follow established patterns for the Scopecraft codebase.
</task>

<context_loading>
Parse arguments from: "$ARGUMENTS"
- First word: implementation mode (typescript, ui, mcp, cli, etc.)
- Remaining: task ID

CRITICAL: Immediately use mcp__scopecraft-cmd__task_get to retrieve full task details.

Key Reference: `/docs/organizational-structure-guide.md` - Understand task areas, phases, and relationships.
</context_loading>

<mode_detection>
1. Check for mode-specific guidance at: `/docs/command-resources/implement-modes/{mode}.md`
   - Example: `/docs/command-resources/implement-modes/typescript.md`
   - Example: `/docs/command-resources/implement-modes/ui.md`

2. If mode file exists, read and incorporate its patterns and guidelines

3. If mode file doesn't exist:
   - Assume the expertise role (e.g., "devops" → DevOps engineer mindset)
   - Check `/docs/command-resources/implement-modes/README.md` for general patterns
   - Use WebSearch to research best practices for that domain if needed
   - Apply domain-specific focus with general engineering principles
</mode_detection>

<pre_implementation_checklist>
Before writing any code:

1. **Load task context**
   - Use mcp__scopecraft-cmd__task_get with the task ID
   - Review task description, requirements, and acceptance criteria
   - Check task status (should be "implementation" or moving to it)

2. **Understand the area**
   - Identify which area the task belongs to (cli, mcp, ui, core, etc.)
   - Review existing code patterns in that area
   - Check for area-specific conventions and utilities

3. **Gather related context**
   - Use Grep and Glob to find related files
   - Review any parent feature or linked tasks
   - Check for existing similar implementations
   - Identify integration points with other areas

4. **Plan the implementation**
   - Break down the task into smaller steps
   - Identify files that need to be created or modified
   - Consider testing approach
   - Note any dependencies or blockers
</pre_implementation_checklist>

<implementation_process>
1. **Start with the test**
   - Write tests first when possible
   - Use existing test patterns in the area
   - Consider edge cases and error scenarios

2. **Implement incrementally**
   - Make small, focused changes
   - Commit logical units of work
   - Keep the codebase in a working state

3. **Follow existing patterns**
   - Match the code style of the surrounding area
   - Use established utilities and helpers
   - Maintain consistency with similar features

4. **Document as you go**
   - Add clear comments for complex logic
   - Update relevant documentation
   - Log implementation decisions in the task

5. **Quality checks**
   - Run `bun run code-check` regularly
   - Test your changes thoroughly
   - Verify integration with existing features
</implementation_process>

<common_pitfalls>
AVOID these mistakes:
- ❌ Using CLI commands for task management (use MCP tools instead)
- ❌ Starting to code without understanding the full context
- ❌ Ignoring existing patterns in the area
- ❌ Skipping code quality checks
- ❌ Making changes without running tests
- ❌ Forgetting to update task status and logs
- ❌ Not considering how changes affect other areas
</common_pitfalls>

<task_management>
Throughout implementation:

1. **Update task regularly**
   - Use mcp__scopecraft-cmd__task_update to log progress
   - Document decisions and challenges in implementation log
   - Update checklists as items are completed
   - Mark checklist items with [x] when done
   - Add timestamps to major milestones

2. **Maintain implementation log**
   - Document what was completed each session
   - Record key decisions and rationale
   - Note any deviations from original plan
   - Track dependencies discovered
   - Include code snippets for complex solutions

3. **Manage blockers**
   - If blocked, update task status to "blocked"
   - Create new tasks for discovered work
   - Link related tasks appropriately
   - Document blockers in the task

4. **Prepare for review**
   - Ensure all tests pass
   - Run final code quality checks
   - Update task with implementation summary
   - Mark all completed checklist items
   - Prepare for code review if needed
</task_management>

<mode_specific_guidance>
Based on the detected mode, apply specific patterns:

- **typescript**: Focus on type safety, proper interfaces, error handling
- **ui**: Use Scopecraft UI components, maintain terminal aesthetic
- **mcp**: Follow MCP protocol, implement proper tool handlers
- **cli**: Structure commands properly, handle arguments correctly
- **Other modes**: Apply domain best practices, research if needed
</mode_specific_guidance>

<completion_checklist>
Before marking implementation complete:
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code quality checks pass (`bun run code-check`)
- [ ] Documentation updated if needed
- [ ] Task log includes implementation details
- [ ] Related tasks created for follow-up work
- [ ] Changes work correctly with existing features
</completion_checklist>

<example_usage>
/project:05_implement typescript TASK-20250517-185925
/project:05_implement ui TASK-20250517-190000
/project:05_implement mcp TASK-20250517-191234
/project:05_implement devops TASK-20250517-192000
</example_usage>

<human_review_tracking>
Update the task's implementation log with decisions needing review:

### Human Review Needed

Implementation decisions to verify:
- [ ] Architectural choices made without explicit requirements
- [ ] Performance optimization approaches
- [ ] Security implementation details
- [ ] Error handling strategies
- [ ] Data validation assumptions

Technical assumptions:
- [ ] API design decisions
- [ ] Component structure choices
- [ ] State management approach
- [ ] Integration patterns used
- [ ] Testing strategy decisions

Include this section in task updates to flag items for later review.
</human_review_tracking>