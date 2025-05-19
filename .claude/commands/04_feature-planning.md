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
   - Link sequential tasks using previous/next parameters
   - Group parallel tasks that can be done together
</planning_process>

<task_creation_patterns>
For each identified task:
```
mcp__scopecraft-cmd__task_create
- title: Clear, actionable description
- type: research/design/implementation/test/documentation
- status: planning (initially)
- phase: backlog  # REQUIRED - always specify explicitly
- tags: ["AREA:core", "AREA:cli", etc.] # Use tags for area designation
- parent: Feature name (without FEATURE_ prefix)
- previous: ID of task that must complete before this one
- next: ID of task that follows this one (update after creation)
- depends: [Array of task IDs that are prerequisites]
- content: Detailed requirements with todo lists
```

**Task Linking Examples:**

```
# Sequential tasks (research → design → implement)
mcp__scopecraft-cmd__task_create
- title: "Research authentication patterns"
- type: "research"
- phase: "backlog"
- parent: "user-authentication"

# Returns: TASK-001

mcp__scopecraft-cmd__task_create  
- title: "Design authentication flow"
- type: "design"
- phase: "backlog"
- parent: "user-authentication"
- previous: "TASK-001"  # Must come after research

# Returns: TASK-002

# Parallel tasks (CLI and UI can be done simultaneously)
mcp__scopecraft-cmd__task_create
- title: "Implement authentication CLI"
- type: "implementation"
- phase: "backlog"
- parent: "user-authentication"
- depends: ["TASK-002"]  # Needs design but not sequential

mcp__scopecraft-cmd__task_create
- title: "Implement authentication UI"
- type: "implementation"
- phase: "backlog"  
- parent: "user-authentication"
- depends: ["TASK-002"]  # Also needs design

# Task with multiple dependencies
mcp__scopecraft-cmd__task_create
- title: "Integration testing for authentication"
- type: "test"
- phase: "backlog"
- parent: "user-authentication"
- depends: ["TASK-003", "TASK-004"]  # Needs both implementations
```

**IMPORTANT: Phase Assignment**
- Always specify the `phase` parameter when creating tasks
- Tasks must belong to a phase for proper file organization
- Child tasks do NOT automatically inherit parent feature's phase
- If unsure, use the current active phase or "backlog"

**Note on subdirectory**: The `subdirectory` parameter places the task in a metadata field only, not a physical folder. Always use `phase` to control file location.

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
- "React real-time collaboration 2025 best practices"
- "WebSocket vs Server-Sent Events React 2025"
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
- Recent implementation patterns (look for 2024+ content)
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

## Task Granularity: When to Use Todo Lists vs Separate Tasks

**Create SEPARATE tasks when:**
- Work spans different technical domains (CLI vs MCP vs UI)
- Different expertise is required
- Work could be done in parallel by different team members
- Clear architectural boundaries exist

**Use TODO LISTS within a task when:**
- Activities are sequential and related
- Same technical context applies
- Natural progression of work (research → implement → test → document)
- Combined work fits within one AI session

### Examples:

**Good - Single Task with Todos:**
```
Task: Research and Design Authentication System
## Todo List
- [ ] Research OAuth2 best practices
- [ ] Research JWT implementation patterns
- [ ] Design authentication schema
- [ ] Create architecture diagram
- [ ] Document design decisions
```

**Good - Separate Tasks for Different Domains:**
```
Task 1: Implement CLI Authentication Commands
Task 2: Implement MCP Authentication Tools
Task 3: Create UI Login Components
```

**Bad - Too Granular:**
```
Task 1: Research OAuth2 patterns
Task 2: Research JWT patterns  
Task 3: Design auth schema
Task 4: Write design docs
```

## Working Example for Feature Planning:

Instead of creating 14 separate tasks, organize as:

1. **Research/Design Phase** (1-2 tasks)
   - Combined research task with multiple queries
   - Combined design task for architecture/schema

2. **Implementation Phase** (3-4 tasks)
   - One task per client (CLI, MCP, UI)
   - Separate core implementation task

3. **Testing/Documentation** (1-2 tasks)
   - Integration testing task
   - Comprehensive documentation task

Remember: Each task creates a new AI context. Minimize context switches by combining related work into todo lists.

## Task Sequencing Best Practices

1. **Start with Research** when dealing with unknowns
2. **Design before Implementation** for UI features
3. **Architecture before Complex Implementation**
4. **Tests alongside or after Implementation**
5. **Documentation throughout the process**

## Creating Task Chains and Dependencies

### When to Use Previous/Next vs Dependencies

**Use Previous/Next for:**
- Sequential workflows where one task must complete before the next
- Linear progression through phases (research → design → implementation)
- When order matters for logical flow
- Example: Research must finish before Design can start

**Use Dependencies for:**
- Tasks that need multiple prerequisites
- Cross-area dependencies (UI needs Core API)
- Non-linear relationships
- Example: Documentation depends on Implementation AND Testing

### Creating Linked Task Sequences

**Step 1: Create Tasks in Order**
```
# Create research task first
Task1_ID = mcp__scopecraft-cmd__task_create(
  title: "Research real-time collaboration patterns",
  type: "research",
  phase: "backlog"
)

# Create design task with previous link
Task2_ID = mcp__scopecraft-cmd__task_create(
  title: "Design collaboration architecture", 
  type: "design",
  phase: "backlog",
  previous: Task1_ID  # Links to research task
)

# Create implementation with previous link
Task3_ID = mcp__scopecraft-cmd__task_create(
  title: "Implement core collaboration engine",
  type: "implementation", 
  phase: "backlog",
  previous: Task2_ID  # Links to design task
)
```

**Step 2: Update First Task with Next Link**
```
mcp__scopecraft-cmd__task_update(
  id: Task1_ID,
  updates: {
    metadata: {
      next_task: Task2_ID
    }
  }
)
```

### Example: Complex Feature with Mixed Dependencies

```
Research Phase:
1. Task: Research WebSocket patterns (TASK-001)
2. Task: Research state sync strategies (TASK-002)
   - No direct link to TASK-001 (parallel research)

Design Phase:
3. Task: Design collaboration architecture (TASK-003)
   - previous: TASK-001 
   - depends: [TASK-001, TASK-002]  # Needs both research tasks

Implementation Phase:
4. Task: Implement core engine (TASK-004)
   - previous: TASK-003
5. Task: Implement CLI commands (TASK-005)
   - depends: [TASK-004]  # Needs core but not previous
6. Task: Implement UI components (TASK-006)
   - depends: [TASK-004]  # Also needs core, parallel to CLI

Testing Phase:
7. Task: Integration testing (TASK-007)
   - depends: [TASK-005, TASK-006]  # Needs both implementations
```

### Best Practices for Task Linking

1. **Create tasks in logical order** - This makes it easier to reference previous tasks
2. **Use previous/next for strict sequences** - When order is mandatory
3. **Use dependencies for prerequisites** - When multiple tasks must complete first
4. **Update bidirectional links** - After creating all tasks, update earlier tasks with next links
5. **Document the flow** - Include a task flow diagram in the feature description

### Common Patterns

**Linear Flow:**
```
Research → Design → Implement → Test → Document
(each with previous/next links)
```

**Branching Flow:**
```
Research → Design → [Core Implementation]
                  ↘ [CLI Implementation] → Integration Test
                  ↘ [UI Implementation]  ↗
```

**Parallel Research:**
```
[Research Option A] ↘
                     Synthesis → Design → Implementation
[Research Option B] ↗
```

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

# Complex feature with proper granularity
/project:feature-planning "Real-time collaboration system"

## Resulting Task Structure with Linking:

1. Task: Research Real-time Collaboration (TASK-001)
   - Todo: Research WebSocket patterns
   - Todo: Research conflict resolution
   - Todo: Research state synchronization
   - Todo: Document findings
   - Next: TASK-002

2. Task: Design Collaboration Architecture (TASK-002)
   - Todo: Design message protocol
   - Todo: Design state management
   - Todo: Create system diagrams
   - Todo: Document architecture
   - Previous: TASK-001
   - Next: TASK-003

3. Task: Implement Core Collaboration Engine (TASK-003)
   - Todo: Create WebSocket server
   - Todo: Implement message handlers
   - Todo: Add state synchronization
   - Todo: Write unit tests
   - Previous: TASK-002
   
4. Task: Add CLI Collaboration Commands (TASK-004)
   - Todo: Implement `collab start`
   - Todo: Implement `collab join`
   - Todo: Write CLI tests
   - Depends: [TASK-003]

5. Task: Build UI Collaboration Features (TASK-005)
   - Todo: Create presence indicators
   - Todo: Add real-time updates
   - Todo: Implement conflict UI
   - Todo: Write component tests
   - Depends: [TASK-003]

6. Task: Integration and Documentation (TASK-006)
   - Todo: Full system testing
   - Todo: Write user guide
   - Todo: Create API docs
   - Depends: [TASK-004, TASK-005]

## Task Flow Visualization:
```
Research (001) → Design (002) → Core Implementation (003)
                                        ↓
                              CLI Commands (004) ⟶
                                                   Integration & Docs (006)
                              UI Features (005)  ⟶
```
```
</examples>

<common_mistakes>
## Common Mistakes to Avoid:

1. **Creating too many granular tasks**
   - Wrong: Separate tasks for research, implement, test, document
   - Right: One task with research→implement→test→document todos

2. **Forgetting to specify phase**
   - Wrong: Relying on parent inheritance
   - Right: Always explicitly set phase parameter

3. **Confusing subdirectory behavior**
   - Wrong: Expecting subdirectory to control file location
   - Right: Use phase for location, subdirectory for metadata

4. **Not considering AI context switches**
   - Wrong: 14 small tasks for one feature
   - Right: 5-6 larger tasks with todo lists
</common_mistakes>

<best_practices>
- Keep task granularity consistent (1-3 days of work for solo dev)
- Group related activities into single tasks with todo lists
- Create separate tasks only for different technical domains
- Always specify phase explicitly - never rely on inheritance
- Use feature subdirectory for grouping metadata, not file placement
- Remember: fewer tasks = fewer context switches = better continuity
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
- **ALWAYS create task links**: Use previous/next for sequences, depends for prerequisites
- Create tasks in logical order to simplify referencing
- Update bidirectional links after all tasks are created
- Include a task flow diagram in the feature description
- Test the workflow by following the task chain
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