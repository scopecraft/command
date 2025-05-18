# Feature Proposal Guide

## What Makes a Good Proposal
A good feature proposal for a solo pre-v1 project:
- Clearly defines the problem
- Proposes a specific solution
- Sets realistic scope
- Identifies risks early
- Provides enough detail to start work

## Section-by-Section Guide

### Problem Statement
- Be specific about what's broken or missing
- Explain why it matters now
- Keep it to 2-3 sentences

### Proposed Solution
- Describe what you'll build in plain language
- Focus on user-visible changes
- Mention key technical approach

### Key Benefits
- List 2-3 concrete improvements
- Focus on immediate value
- Avoid hypothetical future benefits

### Scope
- Explicitly state what's included
- More importantly, what's NOT included
- Helps prevent scope creep

### Technical Approach
- High-level strategy (not implementation details)
- Which parts of the system are affected
- Any new dependencies or patterns

### Implementation Estimate
- Rough time in days or weeks
- Include testing and documentation
- Be pessimistic rather than optimistic

### Dependencies
- What must exist before starting
- External libraries or services needed
- Related features that might conflict

### Risks
- Technical challenges anticipated
- Potential blockers or unknowns
- Things that could extend timeline

### Open Questions
- Decisions that need to be made
- Design choices still unclear
- Technical approaches to research

## Common Mistakes
- Writing a wishlist instead of a plan
- Over-complicating the solution
- Underestimating implementation time
- Ignoring existing code patterns
- Not considering edge cases

## Example Structure
```markdown
# Feature Proposal: Task Quick Actions

## Problem Statement
Currently need multiple clicks to update task status. This slows down workflow when processing many tasks.

## Proposed Solution
Add keyboard shortcuts for common task actions when viewing task details.

## Key Benefits
- Faster task processing
- Better keyboard-driven workflow
- Reduced clicking fatigue

## Scope
### Included
- 's' key to cycle status
- 'e' key to edit
- 'a' key to assign

### Not Included
- Custom keybinding configuration
- Shortcuts in list view
- Batch operations

...etc
```

## Tips for Solo Developers
- Keep proposals short (1-2 pages max)
- Focus on what helps ship features faster
- Document just enough to remember context
- Use proposals to think through implementation
- Update proposal if scope changes significantly