# React Feature Iteration Prompt

This prompt guides thorough research, planning, and implementation of a new feature for an existing or planned React application.

## Objective

I need to add a new feature to a React application: [FEATURE_NAME]. This feature should [DESCRIBE FUNCTIONALITY]. Help me think through all aspects of adding this feature, from analysis to implementation.

## Process

Please follow this structured thinking approach, documenting your thought process at each stage:

1. **ANALYSIS PHASE**:
   - What problem does this feature solve for users?
   - How does this feature align with the application's overall purpose?
   - What are the essential requirements for this feature?
   - What are the expected user interactions and outcomes?
   - What existing components or patterns could be leveraged?
   - What technical challenges might arise in implementation?
   - Use WebSearch to research similar feature implementations if needed

2. **DESIGN PHASE**:
   - How should the feature be presented in the UI?
   - What user experience would be most intuitive?
   - How will this feature integrate visually with the existing design?
   - What states and transitions should be considered?
   - How should edge cases and errors be handled visually?
   - What accessibility considerations are important?
   - Use WebSearch for UI/UX inspiration and patterns

3. **ARCHITECTURE PHASE**:
   - Which existing components will need modification?
   - What new components will need to be created?
   - How should state be managed for this feature?
   - What data flow design makes the most sense?
   - Are there opportunities for custom hooks or utilities?
   - Will this feature require additional dependencies?
     - Research potential libraries that could help implementation
     - Evaluate cost/benefit of adding new dependencies vs custom code
   - How can we ensure the implementation is maintainable and extensible?

4. **IMPLEMENTATION PLAN**:
   - Break down implementation into logical, sequenced steps
   - Identify component changes needed (additions, modifications)
   - Plan state management and data flow implementations
   - Outline API integration or data requirements
   - Consider performance optimizations
   - Create a testing strategy for the feature

5. **TESTING & INTEGRATION STRATEGY**:
   - What test cases should be covered?
   - How can we ensure proper integration with existing functionality?
   - What potential regressions should we guard against?
   - How will we validate the feature meets requirements?
   - What monitoring or analytics should be added?

## Application Context (if known)

If the application already exists or has been planned, please provide:
- Core application purpose and key functionality
- Current component structure and patterns
- State management approach
- UI component library and styling approach
- Key dependencies and architectural decisions

If this is for a planned application that hasn't been implemented yet, please note that and we can design the feature to fit the planned architecture.

## Styling Guidelines

Refer to the [Scopecraft Style Guide](/docs/SCOPECRAFT_STYLE_GUIDE.md) for complete styling information. The feature should follow these guidelines to maintain consistency with the Scopecraft ecosystem.

Key considerations include:
- Match the terminal-inspired dark theme aesthetic
- Use JetBrains Mono font consistently
- Follow the established color system
- Maintain component styling patterns
- Apply consistent spacing and layout principles

## Development Approach

- Ensure feature implementation matches Scopecraft's visual identity
- Consider all components in the style guide when designing new UI elements
- Research and select the best libraries for the job when needed
- Maintain a balance between:
  - Adding dependencies for efficiency vs custom implementations
  - Feature completeness vs complexity
  - Current needs vs future extensibility
- Consider performance implications of all implementation choices
- Ensure thorough documentation as part of the implementation

## Final Deliverable

The result of this process should be:
- Comprehensive feature analysis
- Clear design direction with user experience considerations
- Well-structured component architecture plan
- Detailed implementation roadmap
- Testing and validation strategy