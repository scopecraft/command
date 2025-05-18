# Feature PRD Creator

<task>
Transform a feature proposal into a DRAFT Product Requirements Document (PRD) that provides clear technical specifications for implementation. This draft is meant for review and discussion before finalization.
</task>

<context>
Purpose: Create an actionable PRD optimized for LLM implementation sessions.
References:
- Template: `/docs/command-resources/planning-templates/feature-prd.md`
- Guide: `/docs/command-resources/planning-templates/prd-guide.md`
- Organizational Structure: `/docs/organizational-structure-guide.md`
</context>

<input_parsing>
Input: "$ARGUMENTS"
Expected: Task ID of an existing proposal (e.g., "TASK-20250517-123456")
If empty: Ask for proposal task ID or feature to detail
</input_parsing>

<prd_creation_process>

## Step 1: Load Existing Proposal
1. Use mcp__scopecraft-cmd__task_get to retrieve proposal
2. Extract key information:
   - Problem statement
   - Proposed solution
   - Technical approach
   - Scope

## Step 2: Expand to PRD
Load PRD template from:
`/docs/command-resources/planning-templates/feature-prd.md`

## Step 3: Detail Each Section

### Title Update
- Remove "Feature Proposal:" prefix if present
- Keep the descriptive feature name
- The title should be clear and action-oriented

### Overview
- One paragraph summary
- Reference original problem

### Requirements
- Convert scope into numbered requirements
- Make each requirement testable
- Include edge cases
- Separate MVP from nice-to-have

### UI/UX Design
- Step-by-step user flow
- Identify which components to modify
- Note keyboard shortcuts if applicable
- Consider accessibility

### Technical Design
- Map to specific components/files
- Detail data model changes
- List API modifications
- Integration points

### Implementation Notes
- Include helpful hints for LLMs
- Reference existing patterns
- Warn about potential gotchas
- Suggest implementation order

### Testing Approach
- Unit test requirements
- Integration test scenarios
- Manual testing checklist

### Task Breakdown Preview
- Group by area (UI, Core, MCP, cli, docs, etc.)
- Use areas from organizational structure
- Estimate relative complexity
- Note dependencies
- ~3-7 tasks total for most features

## Step 4: Create or Update Task
If proposal was a task:
- Use mcp__scopecraft-cmd__task_update to convert to PRD
- Update type to "prd" or "specification"
- Update title by removing "Feature Proposal:" prefix
- Update content with expanded PRD
- Maintain phase and area assignments
- Add relevant tags

If new:
- Use mcp__scopecraft-cmd__task_create
- Link to original proposal if exists
- Assign to correct phase and primary area
- Add comprehensive tags
</prd_creation_process>

<prd_principles>
For solo pre-v1 project:
- Focus on "what" and "how" not "why"
- Include implementation hints
- Reference specific files/components
- Keep it actionable, not theoretical
- Optimize for LLM understanding

AVOID enterprise patterns:
- NO rollout strategies or deployment plans
- NO time estimates or deadlines
- NO platform-agnostic requirements unless critical
- NO over-architected solutions
- Keep testing approach practical

Remember: This is a DRAFT for discussion
- Flag assumptions for validation
- Note decisions that need review
- Invite user feedback on approach
</prd_principles>

<example_expansion>
**From Proposal**:
"Add Recently Modified filter showing tasks changed in last 24h"

**To PRD Requirements**:
```markdown
### Functional Requirements
1. Add "Recently Modified" option to task filter dropdown in TaskListView component
2. When selected, display only tasks where last_modified >= (now - 24 hours)
3. Sort results by last_modified descending (most recent first)
4. Show relative time in task list (e.g., "2 hours ago")
5. Include visual indicator for tasks modified in last hour
6. Maintain filter state in URL query params

### Technical Requirements
- Reuse existing FilterDropdown component
- Add last_modified field to Task type if not present
- Extend existing filter logic in useTaskFilter hook
- Use dayjs for time calculations (already in project)
```
</example_expansion>

<quality_checklist>
Before finalizing PRD:
- [ ] Title updated (removed "Feature Proposal:" prefix)
- [ ] All requirements are numbered and specific
- [ ] Technical design references actual components
- [ ] Implementation notes include helpful hints
- [ ] Edge cases are addressed
- [ ] Task breakdown is realistic
- [ ] Testing approach is clear
- [ ] Human review section included
</quality_checklist>

<output_format>
DRAFT PRD created/updated:
- Task ID: {ID}
- Title: {Feature Title}
- Type: specification
- Status: Draft - Ready for Review

Key sections completed:
- ✓ Requirements (functional & technical)
- ✓ UI/UX design
- ✓ Technical specifications
- ✓ Implementation notes
- ✓ Task breakdown preview
- ✓ Human review section

Key assumptions to discuss:
- {List 2-3 major technical assumptions}
- {List any architectural decisions made}
- {Note any scope interpretations}

Please review the PRD and provide feedback on:
1. Technical approach appropriateness
2. Missing requirements or edge cases
3. Implementation complexity assessment
4. Any assumptions that need correction

Once reviewed and refined:
Create implementation tasks: `/project:04_feature-planning {ID}`
</output_format>

<mcp_usage>
Always use MCP tools:
- mcp__scopecraft-cmd__task_get to load proposal
- mcp__scopecraft-cmd__task_update to convert to PRD
- mcp__scopecraft-cmd__task_create if new PRD
- mcp__scopecraft-cmd__phase_list for current phase
- mcp__scopecraft-cmd__area_list to verify areas
</mcp_usage>

<human_review_section>
Include in PRD content a section for human review:

### Human Review Required

Technical decisions needing verification:
- [ ] Component architecture assumptions
- [ ] Data model design choices
- [ ] API interface decisions
- [ ] Performance optimization approaches
- [ ] Security implementation details

Design decisions to confirm:
- [ ] UI/UX flow assumptions
- [ ] User interaction patterns
- [ ] Error handling strategies
- [ ] Edge case coverage

Implementation concerns:
- [ ] Task breakdown completeness
- [ ] Dependency identification
- [ ] Risk assessment accuracy
- [ ] Testing strategy adequacy

This section ensures critical decisions are reviewed before implementation begins.
</human_review_section>