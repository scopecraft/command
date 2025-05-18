# Feature Brainstorming Guide

## Overview
This guide helps conduct effective feature brainstorming sessions for solo developers. Focus on understanding the problem deeply before jumping to solutions.

## Effective Brainstorming Techniques

### 1. Problem First
- Start with the pain point, not the solution
- Ask "why" multiple times to get to root cause
- Consider who experiences this problem

### 2. Multiple Perspectives
- User perspective: What's frustrating?
- Developer perspective: What's inefficient?
- System perspective: What's breaking?

### 3. Solution Exploration
- Generate 2-3 different approaches
- Consider trade-offs of each
- Think about implementation complexity

## Key Questions to Ask

### Understanding the Problem
1. What specific problem are we solving?
2. How often does this occur?
3. What's the current workaround?
4. What's the impact of not solving it?

### Exploring Solutions
1. What's the simplest solution?
2. What's the ideal solution?
3. What's the pragmatic middle ground?
4. What are the technical constraints?

### Evaluating Approaches
1. How long would each take to build?
2. Which areas of code would be affected?
3. What could go wrong?
4. What dependencies exist?

## Common Pitfalls to Avoid
- Jumping to complex solutions too quickly
- Not considering existing code patterns
- Ignoring technical debt implications
- Over-engineering for future scenarios

## Output Format
A good brainstorming session produces:
- Clear problem statement
- 2-3 solution options with trade-offs
- Recommended approach with rationale
- List of technical considerations
- Rough implementation estimate

## Example
**Problem**: "It's hard to see what tasks I worked on yesterday"

**Explored Solutions**:
1. Add timestamp to task list view
2. Create activity log feature
3. Add "recently modified" filter

**Recommendation**: Option 3 - simplest to implement, solves core need

**Technical Considerations**:
- Need to track last modified date
- Add filter to task list component
- ~1 day of work