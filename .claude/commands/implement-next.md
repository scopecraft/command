# Feature Implementation Automation

<task>
You are implementing the next available task in a feature. You will:
1. Identify the feature (from arguments or context)
2. Find the first task that needs work
3. Automatically call the implement command for that task
</task>

<context>
This command streamlines feature implementation by automatically selecting the next task to work on based on dependencies, status, and area priorities.

Key Reference: `/docs/organizational-structure-guide.md` - Understand task areas, phases, and relationships.
</context>

<input_handling>
Input: "$ARGUMENTS"
- If provided: Use as feature ID or feature description
- If empty: Try to detect current feature from context
</input_handling>

<process>
1. **Identify Feature**
   - If argument looks like FEATURE-* or FEATURE_* pattern, use directly
   - If natural language, search for matching feature
   - If no argument, check current worktree directory name (pwd)
   
2. **Get Feature Tasks**
   Use mcp__scopecraft-cmd__feature_get to retrieve the feature and its tasks
   
3. **Find Next Task**
   Use mcp__scopecraft-cmd__task_list with filters:
   - subdirectory: {feature.id} (from feature get)
   - phase: {feature.phase}
   - include_content: false
   - include_completed: false
   
   Then apply additional filtering logic:
   - Exclude tasks with status containing "Done", "Complete", or "🟢"
   - Check for unmet dependencies
   - Exclude blocked tasks
   
   Prioritize by:
   1. Tasks with status "🔵 In Progress" or "implementation" (continue existing work)
   2. Tasks with status "🟡 To Do" or "planning"
   3. Tasks with all dependencies already met
   4. Tasks ordered by ID (chronological creation)

4. **Determine Implementation Mode**
   Based on the task's area or subdirectory property:
   - area contains "cli" → mode: "cli"
   - area contains "mcp" → mode: "mcp"  
   - area contains "ui" → mode: "ui"
   - area contains "core" → mode: "typescript"
   - area contains "devops" → mode: "devops"
   - default → mode: "typescript"

5. **Execute Implementation**
   Call the implementation command with:
   ```
   /project:05_implement {mode} {task_id}
   ```
</process>

<dependency_checking>
When checking task dependencies:
1. Get the full task list for the feature
2. For each task, check if depends_on array exists and has items
3. For each dependency, verify if the dependent task has status "Done" or similar
4. Only consider a task available if ALL dependencies are complete
</dependency_checking>

<error_handling>
- If no feature found: "Error: Cannot identify feature from '$ARGUMENTS'. Please provide a feature ID (e.g., FEATURE_auth) or run from a feature worktree."
- If no tasks available: "All tasks in feature {feature_id} are either completed or blocked. Feature status: {overall_status}"
- If all tasks blocked: "All available tasks are blocked by dependencies. Next task waiting on: {blocking_tasks}"
- If feature not found: "Feature '$ARGUMENTS' not found. Use 'sc feature list' to see available features."
</error_handling>

<example_usage>
# With feature ID
/project:implement-next FEATURE_auth
/project:implement-next FEATURE-20250518-auth

# With natural language (searches feature names/titles)
/project:implement-next "authentication feature"
/project:implement-next auth

# Auto-detect from worktree directory
/project:implement-next
</example_usage>

<output_format>
When finding the next task, provide brief status:
```
Feature: {feature_id} - {feature.title}
Total Tasks: {total} ({completed} done, {in_progress} in progress, {todo} to do)
Next Task: {task_id} - {task.title}
Area: {task.area}
Mode: {selected_mode}

Executing: /project:05_implement {mode} {task_id}
```
</output_format>

<human_review_tracking>
Document implementation decisions in task logs:

### Automated Task Selection
- Selected {task_id} based on:
  - [ ] Status priority (in progress > to do)
  - [ ] Dependency completion
  - [ ] Chronological order
  - [ ] Area-based mode mapping

### Human Review Needed
- [ ] Task selection logic assumptions
- [ ] Mode determination based on area
- [ ] Dependency resolution interpretations
</human_review_tracking>