# Product Requirements Document (PRD) Guide

## Solo Developer Context
This guide is optimized for solo pre-v1 development with AI assistance. PRDs are created as DRAFTS for review and discussion.

### Draft PRD Philosophy
- PRDs are starting points for discussion, not final specs
- Assumptions should be validated with the user
- Technical decisions need human review
- Iteration is expected and encouraged

### What to Avoid
- Time estimates (they don't apply to LLM development)
- Rollout strategies and deployment plans
- Over-engineered platform requirements
- Complex architectural patterns
- Business justifications

## PRD Best Practices for Solo Developers
- Focus on technical clarity for LLM sessions
- Include implementation hints and gotchas
- Document decisions to avoid re-thinking
- Keep it actionable, not theoretical

## Technical Specification Guidelines

### Requirements Section
- List specific, testable requirements
- Number them for easy reference
- Include edge cases and error states
- Mark MVP vs nice-to-have features

### UI/UX Design
- Describe user flow step-by-step
- Note which components to reuse
- Include keyboard shortcuts if applicable
- Mention accessibility considerations

### Technical Design
- Identify affected components/modules
- Document data model changes
- List new API endpoints
- Note integration points

### Implementation Notes
- Include lessons from brainstorming
- Document technical decisions made
- Highlight potential gotchas
- Suggest implementation order

## Task Breakdown Preview
- Group tasks by area (UI, Core, API, etc.)
- Estimate relative complexity
- Identify dependencies between tasks
- Note which tasks can be parallel

## Examples

### Good Requirement
```
1. When user presses 's' key while viewing a task, cycle through status values: 
   todo → in_progress → done → todo
```

### Good Technical Note
```
Implementation Note: Use existing KeyboardShortcut hook from ui/hooks. 
Status cycling logic already exists in core/task-status.ts - reuse cycleStatus() function.
```

### Good Task Preview
```
UI Tasks:
- Add keyboard event listener to TaskDetail component
- Update help modal with new shortcuts

Core Tasks:
- Expose cycleStatus function via MCP tools
- Add status transition validation

Test Tasks:
- Unit test keyboard handler
- E2E test status cycling flow
```

## Common Sections to Include

1. **Overview** - One paragraph summary
2. **Requirements** - Numbered list of features
3. **UI/UX Design** - User interaction details
4. **Technical Design** - Architecture decisions
5. **Implementation Notes** - Helpful hints
6. **Testing Approach** - What needs testing
7. **Task Breakdown Preview** - Rough task list
8. **Human Review Required** - Track assumptions

## Tips for LLM-Friendly PRDs
- Be explicit about file paths and component names
- Include code snippets for complex logic
- Reference existing patterns to follow
- Note security or performance considerations
- Add links to related documentation
- Mark TypeScript interfaces as conceptual examples
- Avoid time estimates and deadlines

## What to Avoid
- Vague requirements like "improve performance"
- Over-architecting for future possibilities
- Lengthy background explanations
- Business justifications (save for proposal)
- Speculative features
- Treating the PRD as final - it's a draft!

## Template Checklist
Before sharing a DRAFT PRD, ensure it:
- [ ] Has clear, numbered requirements
- [ ] Identifies all affected components
- [ ] Includes implementation hints
- [ ] Previews task breakdown
- [ ] Notes testing approach
- [ ] Addresses edge cases
- [ ] References existing code patterns
- [ ] Includes human review section
- [ ] Flags key assumptions for discussion
- [ ] Invites feedback on technical approach