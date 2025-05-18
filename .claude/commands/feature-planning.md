# Feature Planning Command

<task>
You are a feature planning specialist. You will help break down a feature into actionable tasks across different areas of the codebase, creating a structured implementation plan.
</task>

<context>
This command helps transform feature ideas into concrete, actionable tasks organized by area. It creates a parent feature with child tasks, establishing proper relationships and ensuring comprehensive coverage.

Key Reference: `/docs/organizational-structure-guide.md` - Understand phases, areas, features, and task relationships.
</context>

<input_parsing>
Parse the argument: "$ARGUMENTS"
- If it starts with "FEATURE-", treat as existing feature ID
- Otherwise, treat as new feature description
- If empty, ask user to provide feature description
</input_parsing>

<template_loading>
Load the feature planning template from:
`/docs/command-resources/planning-templates/feature-planning.md`

This template provides the structure for breaking down features.
If missing, use the embedded fallback structure below.
</template_loading>

<pre_planning_steps>
1. **Determine Feature Status**
   - If feature ID provided: Use mcp__scopecraft-cmd__feature_get to load existing feature
   - If description provided: Prepare to create new feature
   
2. **Gather Context**
   - Review similar features if they exist
   - Understand current project phase using mcp__scopecraft-cmd__phase_list
   - Check available areas to ensure proper task assignment

3. **Initial Analysis**
   - Analyze which areas will be affected
   - Consider dependencies between tasks
   - Identify potential risks or challenges
</pre_planning_steps>

<planning_process>
1. **Create/Update Feature**
   - For new features: Use mcp__scopecraft-cmd__feature_create
   - Include comprehensive description following the template
   - Assign to appropriate phase (usually current active phase)
   
2. **Fill Out Planning Template**
   Guide through each section:
   - Problem Statement: Clear definition of what we're solving
   - User Story: Who benefits and how
   - Proposed Solution: High-level approach
   - Goals & Non-Goals: Scope definition
   - Technical Breakdown: Tasks by area
   - Risks & Dependencies: Potential challenges

3. **Create Tasks from Breakdown**
   For each area in the technical breakdown:
   - Create tasks using mcp__scopecraft-cmd__task_create
   - Set proper area assignment
   - Link to parent feature
   - Set initial status to "planning"
   - Establish dependencies where needed

4. **Establish Relationships**
   - Set parent-child relationships with the feature
   - Create task dependencies based on technical requirements
   - Link related tasks that should be done together
</planning_process>

<task_creation_patterns>
For each identified task:
```
mcp__scopecraft-cmd__task_create
- title: Clear, actionable description
- type: implementation/test/documentation
- status: planning (initially)
- area: Appropriate technical area
- parent: Feature ID
- content: Detailed requirements from template
```

Consider these patterns:
- UI tasks often depend on Core tasks
- MCP tasks may depend on both UI and Core
- Documentation tasks typically come last
- Testing tasks can be parallel to implementation
</task_creation_patterns>

<fallback_template>
If template is missing, use this structure:

# Feature: {Title}

## Problem Statement
What problem are we solving?

## Proposed Solution
High-level approach to solving the problem

## Technical Breakdown
### Area: UI
- [ ] Task: Specific UI work needed
  
### Area: Core  
- [ ] Task: Core logic implementation

### Area: MCP
- [ ] Task: MCP integration if needed

### Area: Docs
- [ ] Task: Documentation updates

## Success Criteria
How we'll know the feature is complete
</fallback_template>

<quality_checks>
Before completing the planning:
1. Ensure all areas are covered appropriately
2. Verify task titles are clear and actionable
3. Check dependencies make logical sense
4. Confirm success criteria are measurable
5. Review risk assessment is comprehensive
</quality_checks>

<output_summary>
After planning is complete, provide:
1. Feature ID and summary
2. List of created tasks organized by area
3. Dependency graph if complex
4. Next steps for implementation
5. Any identified risks or blockers
</output_summary>

<error_handling>
Handle these cases gracefully:
- Feature already exists: Update instead of create
- Invalid area specified: Suggest correct area
- Missing dependencies: Prompt for clarification
- Ambiguous requirements: Ask for specifics
</error_handling>

<examples>
Usage examples:
```
/project:feature-planning "Add real-time collaboration"
/project:feature-planning FEATURE-20250517-123456
/project:feature-planning "Implement user authentication with OAuth"
```
</examples>

<best_practices>
- Keep task granularity consistent (1-3 days of work)
- Include testing tasks for each area
- Don't forget documentation tasks
- Consider performance and security implications
- Think about backward compatibility
- Include migration tasks if needed
</best_practices>

<human_review_section>
Include in the feature a section for human review:

### Human Review Required

Planning decisions to verify:
- [ ] Task scope and granularity assumptions
- [ ] Area assignments for cross-domain tasks
- [ ] Dependency identification completeness
- [ ] Missing tasks or overlooked requirements
- [ ] Risk assessment accuracy

Technical assumptions:
- [ ] Architecture decisions implicit in task breakdown
- [ ] Integration approach assumptions
- [ ] Performance/scaling considerations
- [ ] Security implementation needs

Flag these in both:
1. The parent feature task content
2. Individual tasks where assumptions were made
</human_review_section>