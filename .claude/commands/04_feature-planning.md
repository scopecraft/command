# Feature Planning Command

<task>
You are a feature planning specialist. You will help break down a feature into actionable tasks across different areas of the codebase, creating a structured implementation plan.
</task>

<context>
This command helps transform feature ideas or PRD tasks into concrete, actionable tasks organized by area. It creates a parent feature with child tasks, establishing proper relationships and ensuring comprehensive coverage.

Key Reference: `/docs/organizational-structure-guide.md` - Understand phases, areas, features, and task relationships.
</context>

<input_parsing>
Parse the argument: "$ARGUMENTS"
- If it starts with "FEATURE-", treat as existing feature ID
- If it starts with "FEATURE_", strip prefix and treat as feature name
- If it's a bare feature name, handle as existing feature
- If it starts with "TASK-", analyze the task content
- Otherwise, treat as new feature description
- If empty, ask user to provide feature description or task ID
</input_parsing>

<task_analysis>
When provided with a TASK ID:
1. Load task content using mcp__scopecraft-cmd__task_get
2. Analyze content to determine:
   - Is it a PRD/specification? (contains sections like "Requirements", "Technical Design", etc.)
   - Is it complex? (multiple areas, sequential phases, dependencies)
   - Does it already have planned tasks? (check for existing children)

Complexity indicators:
- Multiple technical areas mentioned
- Distinct phases needed (research → design → implementation → testing)
- Cross-area dependencies
- Unknown technical challenges requiring investigation
- UI/UX design work needed before implementation
- Architecture decisions required
- Integration with existing systems needed
- Multiple user flows or states to handle
</task_analysis>

<feature_lookup>
When dealing with existing features:
1. Search for feature across all phases
2. If found in multiple phases:
   - List all instances with phase information
   - Ask user to specify which phase
   - Example: "Feature 'user-auth' found in: backlog, v1, v1.1. Which phase?"
3. Handle both formats:
   - Full path: "FEATURE_user-auth"
   - Name only: "user-auth"
</feature_lookup>

<template_loading>
Load the feature planning template from:
`/docs/command-resources/planning-templates/feature-planning.md`

This template provides the structure for breaking down features.
If missing, use the embedded fallback structure below.
</template_loading>

<clarification_step>
If the input has ambiguities, ask minimal targeted questions:

**Only ask when unclear from context:**

1. **Scope Question** (if not obvious):
   "Is this a quick proof-of-concept or production-ready feature?"
   - POC → Minimal tasks, skip extensive research
   - Production → Full planning with research/design phases

2. **Complexity Question** (if borderline simple/complex):
   "Does this need full feature planning or just a single implementation task?"
   - Single task → Skip feature creation
   - Full planning → Create feature with breakdown

3. **Timeline Question** (if deadline mentioned):
   "Is there time pressure that should affect planning depth?"
   - Urgent → Focus on implementation, minimal research
   - Normal → Include proper research and design phases

**Smart Defaults:**
- If no response, assume: Production-ready, Full planning, Normal timeline
- Skip questions when context is clear (e.g., "quick POC" in description)
- Adapt questions based on input type (PRD vs simple description)

**Examples of when to clarify:**
- Input mentions "prototype" but also "deploy to users"
- Task seems simple but mentions "integrate with 3 systems"
- Description is vague: "Add collaboration features"

**Examples of when NOT to clarify:**
- Clear PRD with defined scope
- Explicit mention of "POC" or "MVP"
- Simple, well-defined single feature
</clarification_step>

<planning_decision>
Based on task analysis AND clarification responses:

1. **Quick POC/Simple Task**:
   - Single implementation task
   - Skip research unless critical unknowns
   - Minimal or no documentation
   - Basic testing only

2. **Production Simple Task**:
   - Create single implementation task
   - Include research if unknowns exist
   - Add documentation task
   - Include proper testing

3. **Complex Feature (Normal Timeline)**:
   - Full feature creation with breakdown
   - Include all phases: research → design → implementation
   - Comprehensive task breakdown by area
   - Full documentation and testing

4. **Complex Feature (Time Pressure)**:
   - Feature creation but streamlined
   - Skip extensive research (use known patterns)
   - Combine design with implementation
   - Focus on critical path only

5. **Already Planned**:
   - Show existing tasks
   - Offer to modify if scope changed

6. **Not a PRD**:
   - Suggest using regular task planning
</planning_decision>

<pre_planning_steps>
1. **Determine Input Type**
   - Task ID → Load and analyze content
   - Feature ID → Load existing feature
   - Description → Prepare new feature

2. **For Task IDs - Assess Complexity**
   - Simple: Consider single task approach
   - Complex: Consider feature creation
   - Already planned: Show existing plan

3. **Check for Ambiguities**
   - Review input for unclear scope/timeline
   - If ambiguous, run clarification step
   - Use answers to refine approach

4. **Gather Context**
   - Current project phase
   - Related features/tasks
   - Available areas for tagging

5. **Choose Final Approach**
   - Based on complexity + clarification
   - Select appropriate planning depth
   - Proceed with chosen strategy
</pre_planning_steps>

<planning_process>
1. **Create/Update Feature** (for complex tasks)
   - For new features: Use mcp__scopecraft-cmd__feature_create
   - Include comprehensive description following the template
   - Assign to appropriate phase (usually current active phase)
   - Use feature name without FEATURE_ prefix
   
2. **Fill Out Planning Template**
   Guide through each section:
   - Problem Statement: Clear definition of what we're solving
   - User Story: Who benefits and how
   - Proposed Solution: High-level approach
   - Goals & Non-Goals: Scope definition
   - Technical Breakdown: Tasks by area
   - Risks & Dependencies: Potential challenges

3. **Create Tasks from Breakdown**
   For each area in the technical breakdown:
   - Create tasks using mcp__scopecraft-cmd__task_create
   - Use area tags (AREA:core, AREA:cli, etc.)
   - Link to parent feature
   - Set initial status to "planning"
   - Establish dependencies where needed

4. **Establish Relationships**
   - Set parent-child relationships with the feature
   - Create task dependencies based on technical requirements
   - Link related tasks that should be done together
</planning_process>

<task_creation_patterns>
For each identified task:
```
mcp__scopecraft-cmd__task_create
- title: Clear, actionable description
- type: research/design/implementation/test/documentation
- status: planning (initially)
- tags: ["AREA:core", "AREA:cli", etc.] # Use tags for area designation
- parent: Feature name (without FEATURE_ prefix)
- content: Detailed requirements from template
- metadata: Link to original PRD task if applicable
```

**Task Content Best Practices:**
For research tasks, always include:
- Specific WebSearch queries to run
- Key questions to answer
- Libraries/patterns to investigate
- Date range for search (prefer recent content)

Example research task content:
```
Research current best practices for real-time collaboration in React

## WebSearch Queries
- "React real-time collaboration 2024 best practices"
- "WebSocket vs Server-Sent Events React 2024"
- "React state management real-time updates"
- "collaborative editing React libraries comparison"

## Questions to Answer
- What are the current popular approaches?
- Which libraries are actively maintained?
- What are the performance trade-offs?
- How do others handle conflict resolution?
```

## Task Types and When to Use Them

### 1. Research/Spike Tasks
Use for unknowns and investigation:
- **Always use WebSearch** for current best practices and libraries
- Explore technical feasibility of approaches
- Investigate user patterns and similar implementations
- Research integration requirements
- Example: "Research current React state management patterns for real-time features"

**Essential WebSearch topics for research tasks:**
- Latest industry best practices for the feature type
- Current popular libraries and their trade-offs
- Recent implementation patterns (look for 2023+ content)
- Common pitfalls and solutions
- Performance considerations and optimizations

### 2. Design/UX Tasks  
Use before implementation for user-facing features:
- Create user flow diagrams
- Design UI mockups or wireframes
- Plan user interactions and states
- Define edge cases and error states
- Example: "Design user flow for real-time collaboration indicators"

### 3. Architecture Tasks
Use for complex features requiring planning:
- Design data models and schemas
- Plan component hierarchy
- Define API contracts
- Outline state management approach
- Example: "Design WebSocket message protocol for collaboration"

### 4. Implementation Tasks
Use for actual coding work:
- Build new components or features
- Integrate with existing systems
- Implement business logic
- Create utilities and helpers
- Example: "Implement real-time sync engine in core"

### 5. Test Tasks
Use throughout development:
- Write unit tests
- Create integration tests
- Build e2e test scenarios
- Test edge cases and error handling
- Example: "Write tests for concurrent editing scenarios"

### 6. Documentation Tasks
Use to maintain project knowledge:
- Update API documentation
- Write user guides
- Create developer documentation
- Document architecture decisions
- Example: "Document WebSocket protocol for collaborators"

## Task Sequencing Best Practices

1. **Start with Research** when dealing with unknowns
2. **Design before Implementation** for UI features
3. **Architecture before Complex Implementation**
4. **Tests alongside or after Implementation**
5. **Documentation throughout the process**

## Default Organization Patterns
- Place tasks in feature folder
- Use area tags for technical domain tracking
- Consider dependencies between task types:
  - Research → Design → Implementation
  - Architecture → Implementation → Integration
  - Any task → Documentation
  - Implementation → Testing

## One-Dev Pragmatic Approach
For solo development pre-v1:
- Combine related small tasks when practical
- Focus on MVP functionality over optimization
- Prefer existing solutions over custom implementations
- Keep documentation lean but essential
- Test critical paths, not edge cases initially
</task_creation_patterns>

<fallback_template>
If template is missing, use this structure:

# Feature: {Title}

## Problem Statement
What problem are we solving?

## Proposed Solution
High-level approach to solving the problem

## Technical Breakdown

### Research/Spike Tasks
- [ ] Research: Investigate current best practices for {feature type}
- [ ] Research: Explore library options for {specific need}

### Area: UI
- [ ] Design: Create user flow for {feature}
- [ ] Design: Design component layouts and states  
- [ ] Implementation: Build {component name} component
- [ ] Test: Write UI tests for user interactions
  
### Area: Core  
- [ ] Architecture: Design data model for {feature}
- [ ] Implementation: Implement {feature} business logic
- [ ] Test: Unit test core functionality

### Area: MCP
- [ ] Implementation: Add MCP tool for {feature}
- [ ] Documentation: Document new MCP tool usage

### Area: CLI
- [ ] Implementation: Add CLI command for {feature}
- [ ] Documentation: Update CLI help text

### Area: Docs
- [ ] Documentation: Write user guide for {feature}
- [ ] Documentation: Update API documentation

## Success Criteria
How we'll know the feature is complete
</fallback_template>

<quality_checks>
Before completing the planning:
1. Ensure all areas are covered appropriately
2. Verify task titles are clear and actionable
3. Check dependencies make logical sense
4. Confirm success criteria are measurable
5. Review risk assessment is comprehensive
</quality_checks>

<output_summary>
After planning is complete, provide:
1. Feature ID and summary (if created)
2. List of created tasks organized by area tags
3. Dependency graph if complex
4. Next steps for implementation
5. Any identified risks or blockers
</output_summary>

<error_handling>
Handle these cases gracefully:
- Task is not a PRD: Suggest alternative planning approach
- Task already planned: Show existing tasks, offer modification
- Simple vs complex confusion: Provide clear criteria
- Area organization: Default to tags, allow folder override
- Invalid task format: Check if it's a valid MDTM task
- Feature in multiple phases: Ask for phase clarification
- Feature not found: Offer to create new feature
</error_handling>

<examples>
Usage examples:
```
# Complex PRD task → Feature creation
/project:feature-planning TASK-20250518T025100

# Simple task → Single implementation task
/project:feature-planning TASK-20250518T030000

# Ambiguous input → Triggers clarification
/project:feature-planning "Add collaboration features"
> "Is this a quick proof-of-concept or production-ready feature?"
> User: "POC"
> "Great! I'll create a streamlined plan focused on demonstrating the concept."

# Clear POC → No clarification needed
/project:feature-planning "Quick POC for WebSocket integration"

# Existing feature in multiple phases
/project:feature-planning user-auth

# Traditional feature description
/project:feature-planning "Add real-time collaboration to task editor"
```
</examples>

<best_practices>
- Keep task granularity consistent (1-3 days of work for solo dev)
- Start with research tasks when unknowns exist
- Include design tasks before UI implementation
- Create architecture tasks for complex features
- Include testing tasks for critical functionality
- Don't forget documentation tasks throughout
- Use WebSearch in research tasks to stay current
- Default to area tags over area folders
- Consider task type dependencies (research → design → implementation)
- For solo dev pre-v1: focus on MVP, combine small related tasks
- Prefer proven libraries over custom solutions when researching
</best_practices>

<human_review_section>
Include in the feature a section for human review:

### Human Review Required

Planning decisions to verify:
- [ ] Clarification questions were appropriate for context
- [ ] Scope assessment (POC vs production) was correct
- [ ] Complexity assessment (simple vs feature-worthy)
- [ ] Timeline considerations properly applied
- [ ] Area designation via tags vs folders
- [ ] Task granularity for AI session scope
- [ ] Sequential dependencies identified correctly
- [ ] Original PRD properly linked/referenced
- [ ] Feature folder organization appropriate
- [ ] Correct phase assignment
- [ ] Task breakdown completeness matches scope

Technical assumptions:
- [ ] Architecture decisions implicit in task breakdown
- [ ] Integration approach assumptions
- [ ] Performance/scaling considerations
- [ ] Security implementation needs

Flag these in both:
1. The parent feature task content
2. Individual tasks where assumptions were made
</human_review_section>