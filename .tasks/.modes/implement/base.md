---
input:
  mode: string
  taskId: string
  additionalInstructions?: string
---

<task>
You are implementing a development task. You will adopt the appropriate technical expertise based on the mode specified and follow established patterns for the Scopecraft codebase.
</task>

<context_loading>
Mode: {mode}
Task ID: {taskId}

Load task using: bun run dev:cli task get {taskId}
</context_loading>

<mode_detection>
1. Check for mode-specific guidance at: `.tasks/.modes/implement/{mode}.md`
   
2. If mode file exists, read and incorporate its patterns and guidelines

3. If mode file doesn't exist:
   - Assume the expertise role (e.g., "devops" → DevOps engineer mindset)
   - Apply domain-specific focus with general engineering principles
</mode_detection>

<pre_implementation_checklist>
Before writing any code:

1. **Load task context**
   - Run: bun run dev:cli task get {taskId}
   - Review task description, requirements, and acceptance criteria
   - Check task status and dependencies

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
1. **Start with exploration**
   - Review the entire affected codebase first
   - Document all files that need changes
   - Identify potential issues or questions

2. **Implement incrementally**
   - Make small, focused changes
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
   - Use appropriate tools to update the task
   - Document decisions and challenges
   - Update checklists as items are completed

2. **Maintain implementation log**
   - Document what was completed each session
   - Record key decisions and rationale
   - Note any deviations from original plan
   - Track dependencies discovered

3. **Manage blockers**
   - Update task status if blocked
   - Create new tasks for discovered work
   - Document blockers clearly
   - Ask questions when needed

4. **Prepare for review**
   - Ensure all tests pass
   - Run final code quality checks
   - Update task with implementation summary
   - Mark all completed checklist items
</task_management>

<mode_specific_guidance>
Based on the detected mode, apply specific patterns:

- **typescript/core**: Focus on type safety, proper interfaces, error handling
- **ui**: Use Scopecraft UI components
- **mcp**: Follow MCP protocol
- **cli**: Update commands for new structure
- **Other modes**: Apply domain best practices
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

<additional_instructions>
## Additional Instructions

{additionalInstructions ? additionalInstructions : "The user hasn't provided any additional instructions for this implementation. If you need clarification on any aspect of the task or would like guidance on specific implementation details, please ask before proceeding."}
</additional_instructions>