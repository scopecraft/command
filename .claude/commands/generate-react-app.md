# React Application Generator

I need to create a new React application using a structured, phased approach. Follow these steps to research, plan, and implement a solution.

## Initial Setup

Use the scopecraft-cmd MCP tools to create a feature task for this React application with appropriate metadata:

1. Create the main feature task in the Scopecraft task system
2. Create individual tasks for each phase (Research, UX Planning, Component Architecture, Implementation Plan, Final Summary)
3. Link the phase tasks to the main feature task
4. Start with the Research phase task

## Phase-by-Phase Approach

For each phase:
1. Use Claude's TodoWrite tool to create detailed todo items for the CURRENT phase only
2. Complete all todo items for that phase
3. Document results in the phase task
4. Mark the phase task as complete and proceed to the next phase

## Phases Detail

### 1. RESEARCH PHASE 📚

**Use MCP to activate the Research phase task**

Create a todo list with these items:
- [ ] Define core requirements and functionality
- [ ] Identify user problems being solved
- [ ] Research React patterns and hooks appropriate for this application
- [ ] Use WebSearch to find current best practices for similar applications
- [ ] Use WebSearch to research modern React libraries and component libraries
- [ ] Use WebSearch to identify the latest versions of shadcn UI and other relevant packages
- [ ] Research technical challenges and solutions
- [ ] Identify performance considerations

**Required WebSearch topics:**
- Current React state management approaches
- Modern React UI libraries compatible with the required design
- Technical patterns for similar applications
- Performance optimization techniques
- Latest package versions and compatibility

Document all research findings before proceeding.

### 2. UX PLANNING PHASE 🎨

**Use MCP to activate the UX Planning phase task**

Create a todo list with these items:
- [ ] Define optimal user experience for the application
- [ ] Design interface for usability based on shadcn UI components
- [ ] Map user flows and interactions
- [ ] Use WebSearch for modern UI/UX inspiration and design patterns
- [ ] Use WebSearch to research accessibility requirements for the interface
- [ ] Identify edge cases to handle
- [ ] Create wireframes or mockup descriptions

**Required WebSearch topics:**
- UX patterns for similar applications
- Accessibility best practices
- Modern implementations of shadcn UI components
- Mobile responsiveness approaches

Document all UX plans before proceeding.

### 3. COMPONENT ARCHITECTURE PHASE 🏗️

**Use MCP to activate the Component Architecture phase task**

Create a todo list with these items:
- [ ] Design component organization for maintainability
- [ ] Plan custom hooks needed for the application
- [ ] Define state management approach
- [ ] Use WebSearch to research current React architecture patterns
- [ ] Plan data flow between components
- [ ] Identify opportunities for code reuse and abstraction
- [ ] Design for future scaling

**Required WebSearch topics:**
- React component architecture best practices
- Custom hooks patterns
- State management approaches for similar applications
- File/folder organization strategies

Document the complete component architecture before proceeding.

### 4. IMPLEMENTATION PLAN 📋

**Use MCP to activate the Implementation Plan phase task**

Create a todo list with these items:
- [ ] Create detailed roadmap for development
- [ ] Break down implementation into logical phases with dependencies
- [ ] Use WebSearch to identify modern CI/CD practices
- [ ] Use WebSearch to research current testing strategies
- [ ] Plan for error handling and edge cases
- [ ] Design performance optimization strategy
- [ ] Create specific implementation steps with time estimates

**Required WebSearch topics:**
- React testing best practices
- Modern React error handling patterns
- Code splitting and performance optimization
- CI/CD approaches for React applications

Document the complete implementation plan before proceeding.

### 5. FINAL SUMMARY 📝

**Use MCP to activate the Final Summary phase task**

Create a todo list with these items:
- [ ] Compile all findings from previous phases
- [ ] Create comprehensive development plan
- [ ] Highlight key decisions and rationale
- [ ] Identify potential risks and mitigation strategies
- [ ] Create prioritized feature roadmap
- [ ] Outline specific next steps for development

Document the final summary, completing the planning process.

## Styling Guidelines

Refer to the Scopecraft Style Guide (/docs/SCOPECRAFT_STYLE_GUIDE.md) for styling information. The application should follow these guidelines:
- Dark theme using Scopecraft's color palette
- JetBrains Mono as the primary font
- Clean, minimal UI with appropriate spacing
- Terminal-inspired design elements
- shadcn UI components customized to match Scopecraft design

## Development Guidelines

- Start with shadcn UI and Tailwind CSS as the foundation
- Configure Tailwind according to the Scopecraft color system
- Add specialized packages based on research findings
- Use WebSearch to find appropriate libraries for specific needs
- Stay lean with dependencies - only add when they provide significant value
- Consider bundle size and performance
- Ensure the application maintains the Scopecraft visual identity

## User Requirements

The specific requirements for this React application are:

$ARGUMENTS

## Confirmation Required

After reading these instructions, please acknowledge that:

1. You understand the phased approach (Research, UX Planning, Component Architecture, Implementation Plan, Final Summary)
2. You will create all required tasks in the Scopecraft task system before proceeding
3. You will work through each phase completely before moving to the next
4. You are waiting for the user to provide specific requirements before applying this plan

DO NOT begin implementation or create general todo lists until you have:
1. Confirmed your understanding of this process
2. Received the specific application requirements from the user
3. Created the appropriate tasks in the Scopecraft system