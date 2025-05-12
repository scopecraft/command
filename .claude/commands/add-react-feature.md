# React Feature Iteration

I need to add a new feature to an existing React application using a structured, phased approach. Follow these steps to analyze, design, and implement the feature.

## Initial Setup

Use the scopecraft-cmd MCP tools to create a feature task for this React feature with appropriate metadata:

1. Create the main feature task in the Scopecraft task system
2. Create individual tasks for each phase (Analysis, Design, Architecture, Implementation Plan, Testing & Integration Strategy)
3. Link the phase tasks to the main feature task
4. Start with the Analysis phase task

## Phase-by-Phase Approach

For each phase:
1. Use Claude's TodoWrite tool to create detailed todo items for the CURRENT phase only
2. Complete all todo items for that phase
3. Document results in the phase task
4. Mark the phase task as complete and proceed to the next phase

## Phases Detail

### 1. ANALYSIS PHASE 🔍

**Use MCP to activate the Analysis phase task**

Create a todo list with these items:
- [ ] Define the problem this feature solves for users
- [ ] Analyze how this feature aligns with the application's overall purpose
- [ ] Identify essential requirements for this feature
- [ ] Map expected user interactions and outcomes
- [ ] Use WebSearch to research similar feature implementations
- [ ] Identify existing components or patterns that could be leveraged
- [ ] Research potential technical challenges in implementation
- [ ] Define success criteria for the feature

**Required WebSearch topics:**
- Similar feature implementations in modern React applications
- Best practices for the specific feature type
- User experience patterns for similar features
- Technical considerations specific to this type of feature

Document all analysis findings before proceeding.

### 2. DESIGN PHASE 🎨

**Use MCP to activate the Design phase task**

Create a todo list with these items:
- [ ] Design the feature presentation in the UI
- [ ] Define the most intuitive user experience
- [ ] Plan visual integration with existing design
- [ ] Use WebSearch for UI/UX inspiration and patterns
- [ ] Identify all states and transitions for the feature
- [ ] Design handling of edge cases and errors
- [ ] Define accessibility requirements
- [ ] Create wireframes or mockup descriptions

**Required WebSearch topics:**
- Current UX patterns for similar features
- Accessibility best practices for this feature type
- Modern implementations of similar UI components
- Edge case handling in similar features

Document all design plans before proceeding.

### 3. ARCHITECTURE PHASE 🏗️

**Use MCP to activate the Architecture phase task**

Create a todo list with these items:
- [ ] Identify existing components needing modification
- [ ] Plan new components to be created
- [ ] Design state management approach for the feature
- [ ] Map data flow architecture
- [ ] Use WebSearch to research component patterns
- [ ] Plan custom hooks or utilities needed
- [ ] Evaluate necessary dependencies
- [ ] Design for maintainability and extensibility

**Required WebSearch topics:**
- React component patterns for similar features
- State management approaches for this feature type
- Custom hooks that could simplify implementation
- Libraries that might provide relevant functionality

Document the complete architecture plan before proceeding.

### 4. IMPLEMENTATION PLAN 📋

**Use MCP to activate the Implementation Plan phase task**

Create a todo list with these items:
- [ ] Break down implementation into sequential steps
- [ ] Detail component changes needed (modifications and additions)
- [ ] Plan specific state management implementations
- [ ] Use WebSearch to research implementation techniques
- [ ] Outline API integration or data requirements
- [ ] Design performance optimization strategy
- [ ] Create step-by-step implementation roadmap with dependencies

**Required WebSearch topics:**
- Implementation techniques for specific components
- Performance optimization for this feature type
- API integration patterns if applicable
- Error handling strategies

Document the complete implementation plan before proceeding.

### 5. TESTING & INTEGRATION STRATEGY 🧪

**Use MCP to activate the Testing phase task**

Create a todo list with these items:
- [ ] Define comprehensive test cases for the feature
- [ ] Plan integration testing with existing functionality
- [ ] Use WebSearch to research testing best practices
- [ ] Identify potential regression risks
- [ ] Design validation approach for requirements
- [ ] Plan monitoring or analytics for the feature
- [ ] Create quality assurance checklist

**Required WebSearch topics:**
- Testing strategies for similar React features
- Integration testing techniques
- Test libraries for specific feature requirements
- Analytics implementation for feature usage tracking

Document the complete testing strategy, completing the planning process.

## Styling Guidelines

Refer to the Scopecraft Style Guide (/docs/SCOPECRAFT_STYLE_GUIDE.md) for styling information. The feature should follow these guidelines:
- Terminal-inspired dark theme aesthetic
- JetBrains Mono font usage
- Established color system
- Consistent component styling patterns
- Appropriate spacing and layout principles

## Development Guidelines

- Ensure feature implementation matches Scopecraft's visual identity
- Use shadcn UI components where appropriate
- Research and select the best libraries based on research findings
- Balance adding dependencies vs. custom implementations
- Consider performance implications of implementation choices
- Include thorough documentation in the implementation

## Application Context

If you have information about the existing application, include:
- Core application purpose and key functionality
- Current component structure and patterns
- State management approach
- UI component library and styling approach
- Key dependencies and architectural decisions

## Feature Requirements

The specific requirements for this React feature are:

$ARGUMENTS

Incorporate these requirements into each phase of the planning process.