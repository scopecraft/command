# Task Implementation Guide - V2 Structure

<task>
You are implementing a development task. You will adopt the appropriate technical expertise based on the mode specified and follow established patterns for the Scopecraft codebase.
</task>

<v2_structure_notice>
## IMPORTANT: New Task Structure

We're migrating to a new task organization system. Tasks are now in:
- `.tasks/backlog/` - Future work
- `.tasks/current/` - Active work
- `.tasks/archive/` - Completed work

Complex tasks (features) are folders with `_overview.md` and subtasks.

Example: `.tasks/current/implement-v2-structure/` contains:
- `_overview.md` - Main description
- `01-core-refactor.task.md` - First subtask (must be completed first)
- `02-cli-update.task.md` - Parallel subtask (can be done after core)
- `02-mcp-update.task.md` - Parallel subtask (can be done after core)
- `03-ui-update.task.md` - Depends on MCP completion

Task IDs are just filenames without paths. References work as `@task:implement-v2-structure`.

**CRITICAL**: When working on v2 implementation tasks, read files directly from the filesystem instead of using MCP commands, as we're updating the MCP server itself.
</v2_structure_notice>

<context_loading>
Parse arguments from: "$ARGUMENTS"
- First word: implementation mode (typescript, ui, mcp, cli, etc.)
- Remaining: task ID or path

For V2 tasks, manually read from filesystem:
- Check `.tasks/current/` first
- Look for complex task folders
- Read the specific subtask file
</context_loading>

<v2_implementation_guidance>
## V2 Implementation Tasks

The current v2 implementation has these dependencies:
1. **01-core-refactor.task.md** - MUST be completed first
2. **02-cli-update.task.md** - Can be done after core
3. **02-mcp-update.task.md** - Can be done after core (parallel with CLI)
4. **03-ui-update.task.md** - Requires MCP to be complete

Each task includes:
- An IMPORTANT note that the plan isn't complete
- Instructions to review the codebase first
- Specific areas to investigate
- Encouragement to ask questions

Reference documents:
- @doc:specs/task-system-v2-specification - Technical specification
- @doc:specs/ai-first-knowledge-system-vision - Philosophy
- @doc:specs/scopecraft-vision - Overall vision
- @doc:specs/mode-system-design - Mode interactions
</v2_implementation_guidance>

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
   - For V2 tasks: Read directly from filesystem
   - For other tasks: Use mcp__scopecraft-cmd__task_get
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
   - For V2 tasks: Review the entire affected codebase first
   - Document all files that need changes
   - Identify potential issues or questions

2. **Implement incrementally**
   - Make small, focused changes
   - Keep the codebase in a working state
   - For V2: Focus on clean break, no backwards compatibility

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
- ❌ Using MCP commands when working on MCP implementation itself
- ❌ Starting to code without understanding the full context
- ❌ Ignoring existing patterns in the area
- ❌ Skipping code quality checks
- ❌ Making changes without running tests
- ❌ Forgetting to update task status and logs
- ❌ Not considering how changes affect other areas
- ❌ For V2: Trying to maintain backwards compatibility
</common_pitfalls>

<task_management>
Throughout implementation:

1. **Update task regularly**
   - For V2: Update the .task.md file directly
   - For others: Use mcp__scopecraft-cmd__task_update
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
- **ui**: Use Scopecraft UI components, update for v2 structure
- **mcp**: Follow MCP protocol, remove phase handlers, add workflow support
- **cli**: Update commands for new structure, remove phase commands
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
- [ ] For V2: Old structure code removed
</completion_checklist>

<example_usage>
/project:05_implement_v2 core 01-core-refactor
/project:05_implement_v2 cli 02-cli-update
/project:05_implement_v2 mcp 02-mcp-update
/project:05_implement_v2 ui 03-ui-update
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
- [ ] V2 structure interpretation decisions

Technical assumptions:
- [ ] API design decisions
- [ ] Component structure choices
- [ ] State management approach
- [ ] Integration patterns used
- [ ] Testing strategy decisions
- [ ] Migration approach decisions

Include this section in task updates to flag items for later review.
</human_review_tracking>