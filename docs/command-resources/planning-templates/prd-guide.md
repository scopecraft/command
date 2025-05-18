# Product Requirements Document (PRD) Guide

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
7. **Rollout Strategy** - How to deploy safely
8. **Task Breakdown Preview** - Rough task list

## Tips for LLM-Friendly PRDs
- Be explicit about file paths and component names
- Include code snippets for complex logic
- Reference existing patterns to follow
- Note security or performance considerations
- Add links to related documentation

## What to Avoid
- Vague requirements like "improve performance"
- Over-architecting for future possibilities
- Lengthy background explanations
- Business justifications (save for proposal)
- Speculative features

## Template Checklist
Before finalizing a PRD, ensure it:
- [ ] Has clear, numbered requirements
- [ ] Identifies all affected components
- [ ] Includes implementation hints
- [ ] Previews task breakdown
- [ ] Notes testing approach
- [ ] Addresses edge cases
- [ ] References existing code patterns