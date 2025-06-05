# UI Research Guidance

## When This Applies
When researching user interface patterns, design systems, component libraries, or user experience approaches.

## Key Considerations

### User Experience Research
- Who are the end users and what are their goals?
- What's the context of use (desktop, mobile, both)?
- What are the accessibility requirements?
- How does this fit into the overall user journey?

### Design System Alignment
- Does this follow our existing design patterns?
- Are we introducing new patterns that need documentation?
- How does this maintain visual consistency?
- What's the impact on our component library?

### Technical Feasibility
- Can this be built with our current tech stack?
- What's the performance impact of this approach?
- How maintainable is this solution long-term?
- Does this work across all supported browsers/devices?

### Competitive Analysis
- How do similar products solve this problem?
- What patterns have users learned from other tools?
- Where can we differentiate vs follow conventions?
- What's considered best-in-class for this feature?

## Research Approaches

### Finding Patterns
- **External Research**: Look up UI patterns, UX best practices, and design examples
- **Library Documentation**: Use Context7 for any UI library or component library you encounter
- **Competitive Analysis**: Study how similar products handle the feature
- **Documentation Review**: Check design system docs and component libraries

### Internal Analysis Tools
- **Glob**: Find similar components by pattern (e.g., `"**/*Modal*"`, `"**/*Table*"`)
- **Read**: Examine existing implementations for structure and patterns
- **Grep**: Search for specific patterns or usage across the codebase

## Research Approaches

### Component Research Flow
1. **Identify the Need**
   - What problem does this UI solve?
   - What are the user's goals?
   - What are the technical constraints?

2. **Explore Existing Solutions**
   - Internal: How have we solved similar problems?
   - External: What patterns exist in the wild?
   - Libraries: Are there existing components we can use?

3. **Evaluate Options**
   - Usability: How learnable and efficient is each approach?
   - Feasibility: How complex is implementation?
   - Maintenance: How easy to modify and extend?
   - Performance: What's the render/interaction cost?

4. **Prototype if Needed**
   - Create quick mockups for complex interactions
   - Test with stakeholders early
   - Validate technical approach with POC

### Design System Research
When researching for design system alignment:
- Review existing component documentation
- Check for similar patterns already in use
- Consider composability with other components
- Think about theming and customization needs

## Patterns to Document

### When researching UI patterns, capture:
```markdown
### Pattern: [Name]
- **Use Case**: When to use this pattern
- **Example**: Where it's used well (with screenshots if helpful)
- **Implementation**: High-level technical approach
- **Pros**: Benefits of this approach
- **Cons**: Drawbacks or limitations
- **Accessibility**: A11y considerations
- **Alternatives**: Other patterns considered
```

### Component Comparison Matrix
```markdown
| Approach | Complexity | Flexibility | Performance | Accessibility | Notes |
|----------|------------|-------------|-------------|---------------|-------|
| Option A | Low        | Medium      | High        | Good          | ...   |
| Option B | Medium     | High        | Medium      | Excellent     | ...   |
```

## Common UI Research Areas

### Form Patterns
- Inline validation vs submit validation
- Single page vs multi-step wizards
- Field grouping and progressive disclosure
- Error messaging and recovery

### Data Display
- Tables vs cards vs lists
- Pagination vs infinite scroll vs virtualization
- Filtering and sorting approaches
- Empty states and loading states

### Navigation Patterns
- Sidebar vs top nav vs command palette
- Breadcrumbs vs back buttons
- Tab interfaces vs accordion
- Mobile navigation patterns

### Interaction Patterns
- Drag and drop implementations
- Inline editing vs modal editing
- Bulk actions and selections
- Keyboard shortcuts and accessibility

## Developer-Focused UI Considerations

When building for technical audiences:
- Consider keyboard-first navigation
- Think about power user workflows
- Balance information density with clarity
- Support both light and dark themes
- Use appropriate fonts for code/data
- Progressive disclosure for complexity