# Feature Proposal Creator

<task>
You are creating a pragmatic feature proposal for a solo developer's pre-v1 project. Transform brainstorming results or initial ideas into a clear, actionable proposal document.
</task>

<context>
Purpose: Create a lightweight feature proposal that documents the decision to build something.
References:
- Template: `/docs/command-resources/planning-templates/feature-proposal.md`
- Guide: `/docs/command-resources/planning-templates/proposal-guide.md`
- Organizational Structure: `/docs/organizational-structure-guide.md`
</context>

<input_parsing>
Input: "$ARGUMENTS"
- If contains task ID: Check if existing proposal/brainstorm
- If contains "phase:X": Use specified phase
- If contains "area:X": Use specified area
- If contains brainstorming summary: Use as starting point
- If contains rough idea: Conduct mini-brainstorming first
- If empty: Ask for feature idea or problem to solve
</input_parsing>

<proposal_creation_process>

## Step 1: Gather Information
If not provided in input:
1. Identify the problem being solved
2. Understand the proposed solution
3. Clarify scope and constraints

## Step 2: Load Template
Load the proposal template from:
`/docs/command-resources/planning-templates/feature-proposal.md`

## Step 3: Fill Template Sections

### Problem Statement
- Make it specific and relatable
- Explain why it matters now
- Keep to 2-3 sentences

### Proposed Solution  
- Describe what will be built
- Focus on user-visible changes
- Mention key technical approach

### Key Benefits
- List 2-3 concrete improvements
- Focus on immediate value
- Avoid speculative benefits

### Scope Definition
- Explicitly state what's included
- More importantly, what's NOT included
- Prevents scope creep

### Technical Approach
- High-level strategy only
- Which areas are affected
- Reuse existing patterns where possible

### Implementation Estimate
- Be realistic (lean pessimistic)
- Include testing and documentation
- Use days/weeks for pre-v1 project

### Dependencies & Risks
- Technical challenges expected
- External dependencies
- Potential blockers

### Open Questions
- Decisions still needed
- Technical unknowns
- Design choices

## Step 3.5: Determine Entity Type
Analyze the proposal scope to decide between task or feature:

### Create as Feature if:
- Multiple sub-tasks or implementation phases needed
- Spans multiple technical areas significantly
- Requires 5+ days of work
- Has distinct sub-features or components

### Create as Task if:
- Can be completed as a single unit of work
- Focused on one primary area
- Less than 5 days of work
- No logical sub-divisions

Use mcp__scopecraft-cmd__feature_create for features, task_create for single tasks.

## Step 4: Create Proposal Entity

Based on the entity type decision:

### For Single Task Proposals:
Use mcp__scopecraft-cmd__task_create:
- Type: "proposal"
- Status: "🟡 To Do"
- Phase: "backlog" (unless user specified otherwise)
- subdirectory: Primary area affected (use actual area ID from mcp__scopecraft-cmd__area_list)
- Content: The filled template
- Title: Clear, descriptive proposal title
- Tags: ["proposal", affected area names]

### For Feature Proposals:
Use mcp__scopecraft-cmd__feature_create:
- Name: Short identifier (e.g., "command-discovery")
- Title: Full descriptive title
- Phase: "backlog" (unless user specified otherwise)
- Status: "🟡 To Do"
- Type: "proposal"
- Description: The filled template content
- Tags: ["proposal", affected areas]

### Phase Selection:
- Default to "backlog" unless:
  - User explicitly mentions a phase
  - Proposal is urgent/time-sensitive (then current active phase)
  - Connected to existing work in specific phase
</proposal_creation_process>

<validation_steps>
Before creating the entity:
1. Check if proposal already exists (search for similar titles)
2. Verify area exists using mcp__scopecraft-cmd__area_list
3. Confirm phase exists (default to backlog if unsure)
4. For features, validate if breakdown into tasks is needed
</validation_steps>

<quality_checks>
Before finalizing:
1. Is the problem clearly defined?
2. Is the solution specific enough to implement?
3. Is the scope realistic for solo dev?
4. Are estimates reasonable?
5. Are risks acknowledged?
</quality_checks>

<example_transformation>
**From Brainstorming**:
"Need to see what tasks were modified recently for standups"

**To Proposal**:
```markdown
# Feature Proposal: Recent Tasks Filter

## Problem Statement
Currently difficult to track which tasks were modified in the last day, making standup preparation time-consuming. Users must manually check multiple tasks to remember recent work.

## Proposed Solution
Add a "Recently Modified" filter to the task list view that shows all tasks changed in the last 24 hours. Reuse existing filter infrastructure with new date-based criteria.

## Key Benefits
- Quick task review for standups
- Better work tracking
- Minimal UI disruption

## Scope
### Included
- "Recently Modified" filter option
- 24-hour time window
- Sort by modification time

### Not Included
- Customizable time ranges
- Activity log view
- Modification history details

[... continued ...]
```
</example_transformation>

<output_format>
Created proposal with:
- Entity Type: {Task or Feature}
- ID: {ID}
- Title: {Proposal Title}
- Status: To Do
- Phase: {Selected Phase}

Summary:
{Brief description of the proposed feature}

Next steps:
1. Review the proposal: `scopecraft {task/feature} get {ID}`
2. If approved, create PRD: `/project:03_feature-to-prd {ID}`
3. Or jump to planning: `/project:04_feature-planning {ID}`
</output_format>

<mcp_usage>
Always use MCP tools:
- mcp__scopecraft-cmd__task_create for single task proposals
- mcp__scopecraft-cmd__feature_create for feature proposals
- mcp__scopecraft-cmd__task_update for task revisions
- mcp__scopecraft-cmd__feature_update for feature revisions
- mcp__scopecraft-cmd__phase_list to find active phase
- mcp__scopecraft-cmd__area_list to verify areas
</mcp_usage>

<human_review_needed>
Include in the proposal task a section for human review:

### Human Review Required
Flag decisions that need verification:
- [ ] Scope decisions made without explicit requirements
- [ ] Technical approach assumptions
- [ ] Area assignments that span multiple domains
- [ ] Risk assessments based on limited information
- [ ] Effort estimates without detailed analysis

This section will be included in the task content for later review.
</human_review_needed>