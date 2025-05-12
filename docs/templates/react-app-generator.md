# React Application Generator Prompt

This prompt guides thorough research, planning, and development of a new React application with a structured thinking approach.

## Objective

I need to create a new React application for [PURPOSE] that will [DESCRIBE CORE FUNCTIONALITY]. Using a systematic approach, help me thoroughly research, plan, and design this application.

## Process

Please follow this structured thinking approach, documenting your thought process at each stage:

1. **RESEARCH PHASE**:
   - What are the core requirements and functionality needed?
   - What user problems does this application solve?
   - Which React patterns and hooks would be most appropriate?
   - Which libraries could enhance development efficiency?
     - Start with shadcn UI and Tailwind CSS as the foundation
     - Research additional libraries that might add value
   - Use WebSearch to research similar applications, technical approaches, or best practices
   - Identify potential technical challenges and how to address them

2. **UX PLANNING PHASE**:
   - What user experience would best serve the application's purpose?
   - How should the interface be designed for optimal usability?
   - What user flows and interactions are needed?
   - Which edge cases should be handled?
   - What accessibility considerations are important?
   - Use WebSearch for UI/UX inspiration and design patterns

3. **COMPONENT ARCHITECTURE PHASE**:
   - How should components be organized for maintainability?
   - What custom hooks might improve code organization?
   - How will data flow between components?
   - What state management approach makes the most sense?
   - Are there opportunities for code reuse through abstractions?
   - How can we ensure the architecture supports future scaling?

4. **IMPLEMENTATION PLAN**:
   - Create a detailed roadmap for development
   - Break down the implementation into logical phases
   - Identify technical dependencies between components
   - Plan for error handling and edge cases
   - Consider performance optimization strategies
   - Design a testing approach for the application

5. **FINAL SUMMARY**:
   - Compile all insights into a comprehensive development plan
   - Highlight key decisions and their rationale
   - Identify potential risks and mitigation strategies
   - Create a prioritized feature roadmap
   - Outline next steps for development

## Styling Guidelines

Refer to the [Scopecraft Style Guide](/docs/SCOPECRAFT_STYLE_GUIDE.md) for complete styling information. The application should follow these guidelines to maintain consistency with the Scopecraft ecosystem.

Key style elements include:
- Dark theme using Scopecraft's color palette
- JetBrains Mono as the primary font
- Clean, minimal UI with appropriate spacing
- Terminal-inspired design elements
- Consistent component styling

## Development Guidelines

- Start with shadcn UI and Tailwind CSS for rapid development
- Configure Tailwind according to the Scopecraft color system
- Add additional packages as needed (don't limit yourself to a predefined set)
- Use search tools to find appropriate libraries for specific needs
- Stay lean - only add dependencies when they provide significant value
- Consider bundled size and performance implications when adding libraries
- Ensure the application maintains the distinct Scopecraft visual identity