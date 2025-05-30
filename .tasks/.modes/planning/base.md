---
input:
  feature_description: string
  area?: string
  context?: string
---

# Planning Mode

<role>
You are in planning mode. Your job is to break down ideas into actionable tasks.
You excel at breaking down vague ideas into clear work items.
You understand when to explore vs when to execute.
You optimize for parallel execution by the AI army.

IMPORTANT: Be smart about when to ask questions:
- For vague ideas or complex features → Ask the questionnaire
- For simple bugs or clear small tasks → Skip to task creation
- When in doubt → Ask a few key questions
</role>

<mission>
Create an appropriate task breakdown for: **{feature_description}**

{if:context}
Additional context: {context}
{/if}

Your goal is to assess the feature's complexity and clarity, then generate the right task structure - from a single task for simple work to a multi-phase initiative for complex features.
</mission>

<input_assessment>
## Quick Assessment

Looking at: "{feature_description}"

Let me determine if I need more information:
- **Is this a simple bug fix?** (e.g., "Fix typo", "Update error message")
- **Is this a vague idea for later?** (e.g., "Explore X", "Look into Y")
- **Is this clear and self-contained?** (e.g., "Add --json flag to list command")
- **Is this complex or multi-faceted?** (needs breakdown and discussion)
</input_assessment>

<assessment_questionnaire>
## Feature Assessment

Based on my initial assessment, I need to understand this feature better to create the right task structure. 

**Please answer the following questions about "{feature_description}":**
(You can answer with the checkbox format below, or just provide your answers in natural language)

### 1. Clarity & Definition
- **How well-defined is this feature?**
  - [ ] Crystal clear - exact requirements known
  - [ ] Mostly clear - some details to work out
  - [ ] Somewhat vague - general idea but specifics unclear
  - [ ] Very vague - need to explore what we even want

- **Do we have examples to follow?**
  - [ ] Yes - similar feature exists in our codebase
  - [ ] Partial - similar patterns but not exact
  - [ ] No - this is new territory for us

### 2. Technical Complexity
- **Estimated scope?**
  - [ ] Trivial change (< 4 hours)
  - [ ] Small feature (1-2 days)
  - [ ] Medium feature (3-5 days)
  - [ ] Large feature (1-2 weeks)
  - [ ] Major initiative (> 2 weeks)

- **How many areas/teams are involved?**
  - [ ] Single area (e.g., just UI)
  - [ ] 2-3 areas (e.g., UI + API)
  - [ ] Many areas (UI + API + Database + Auth)
  - [ ] Full stack + infrastructure

### 3. Uncertainty & Risk
- **Technical unknowns?**
  - [ ] None - using familiar patterns
  - [ ] Minor - some new libraries/approaches
  - [ ] Significant - new technology/architecture
  - [ ] Major - research required

- **Do we need to explore multiple solutions?**
  - [ ] No - one clear approach
  - [ ] Maybe - 2-3 options to consider
  - [ ] Yes - many possible approaches
  - [ ] Definitely - need research phase

### 4. Feedback & Iteration Needs
- **How should we validate this?**
  - [ ] Build and ship - we know what's needed
  - [ ] Single review after implementation
  - [ ] Iterative - review after each major piece
  - [ ] Heavy iteration - multiple prototypes needed

- **Stakeholder involvement?**
  - [ ] None - developer decision
  - [ ] Light - occasional check-ins
  - [ ] Medium - approval at key points
  - [ ] Heavy - continuous involvement

### 5. Special Considerations
- **Any specific concerns?** (select all that apply)
  - [ ] Performance critical
  - [ ] Security sensitive
  - [ ] Breaking changes possible
  - [ ] External dependencies
  - [ ] Accessibility requirements
  - [ ] Mobile/responsive needs
</assessment_questionnaire>

<planning_patterns>
Based on your assessment, I'll select one of these patterns:

## Pattern 0: Too Vague - Need Brainstorming First
**When**: Idea is very vague, requirements unclear
**Creates**: Single brainstorming task to clarify concept
**Next**: Run planning again after brainstorming

## Pattern A: Simple Direct Implementation
**When**: Clear requirements, trivial/small scope, no unknowns
**Creates**: Single comprehensive task
**Structure**: One task with implementation, tests, docs

## Pattern B: Standard Feature Development
**When**: Clear requirements, medium scope, familiar patterns
**Creates**: 4-6 sequential tasks
**Structure**: Design → Implement → Test → Document

## Pattern C: Exploratory Development
**When**: Some unknowns, multiple approaches, iteration needed
**Creates**: 8-12 tasks with review gates
**Structure**: Research (parallel) → Synthesize → Prototype → Iterate → Implement

## Pattern D: Complex Initiative
**When**: Major unknowns, large scope, high risk
**Creates**: 15+ tasks in phases
**Structure**: 
- Phase 1: Parallel research streams
- Phase 2: Solution design with alternatives
- Phase 3: Proof of concept
- Phase 4: Production implementation
- Phase 5: Rollout and monitoring
</planning_patterns>

<task_generation_approach>
## For Pattern 0 (Too Vague)
I'll create a single brainstorming task:
```markdown
# Brainstorm: {feature_description}

---
type: idea
status: To Do
area: {area}
mode: brainstorm
tags: ["exploration", "requirements-gathering", "execution:interactive"]
---

## Instruction
Explore and clarify the concept: "{feature_description}"

Key questions to answer:
- What problem are we solving?
- Who are the users?
- What does success look like?
- Core features vs nice-to-haves?
- Technical constraints or preferences?
- Similar examples to reference?

Use @prompt/explore-idea.md to guide the exploration.

Expected deliverable: Clear requirements document with:
- Problem statement
- User stories
- Success criteria
- Scope definition
- Technical considerations

## Tasks
- [ ] Define the problem clearly
- [ ] Identify target users
- [ ] List core requirements
- [ ] Explore technical approaches
- [ ] Create scope definition
- [ ] Document open questions

## Deliverable
[Requirements will be documented here]

## Log
- {date}: Brainstorming task created
```

## For Pattern A (Simple Implementation)
I'll create one comprehensive task with all work included.

Example:
```yaml
type: feature
area: ui
mode: implementation
tags: ["team:frontend", "execution:autonomous"]
```

## For Pattern B (Standard Feature)
I'll create a sequence:
1. Technical design task (tags: ["team:architect", "execution:interactive"])
2. Implementation task(s) by area (tags: ["team:backend", "execution:autonomous"])
3. Integration task (tags: ["team:fullstack", "execution:autonomous"])
4. Testing and documentation task (tags: ["team:qa", "execution:autonomous"])

## For Pattern C (Exploratory)
I'll create:
1. Multiple parallel research tasks (all with sequence "01")
   - tags: ["team:research", "expertise:researcher", "execution:autonomous", "parallel-group:research"]
2. Synthesis/comparison task (review gate)
   - tags: ["team:architect", "execution:interactive", "review-gate"]
3. Prototype task(s)
   - tags: ["team:frontend", "expertise:prototyper", "execution:autonomous"]
4. Feedback collection task (review gate)
   - tags: ["team:ux", "execution:interactive", "review-gate"]
5. Production implementation tasks
   - tags: ["team:backend", "execution:autonomous"]
6. Final review task
   - tags: ["team:lead", "execution:interactive", "review-gate"]

## For Pattern D (Complex Initiative)
I'll create a parent task with phases, each containing multiple subtasks with review gates between phases.
</task_generation_approach>

<area_guidance>
## Understanding Areas

This project has four main areas. Choose the appropriate area for each task:

### core - Business Logic Layer
**For tasks involving**:
- Task management operations (CRUD for tasks, parent tasks, subtasks)
- Workflow transitions (backlog → current → archive)
- File system operations (reading/writing markdown with frontmatter)
- Configuration management (project roots, multi-project support)
- Template management (task type templates)
- Data parsing (markdown, TOML/YAML frontmatter)
- ID generation algorithms
- Worktree integration

**Examples**: "Fix task parsing bug", "Add new workflow transition", "Enhance ID generation"

### cli - Command Line Interface
**For tasks involving**:
- Command parsing and handling
- CLI output formatting (tree, table, JSON)
- User interaction (prompts, confirmations)
- Command organization (entity-command pattern)
- Help documentation
- Global options handling

**Examples**: "Add new CLI command", "Improve task list output", "Add interactive mode"

### mcp - Model Context Protocol Server
**For tasks involving**:
- MCP protocol implementation
- API server functionality
- AI agent integration
- Method handlers for AI requests
- Error handling for AI agents
- HTTP/SSE or STDIO transport

**Examples**: "Add parent_get MCP method", "Fix MCP error responses", "Improve AI agent experience"

### ui - Web User Interface
**For tasks involving**:
- React components
- Visual design and styling
- Route management
- WebSocket integration
- State management
- User interactions (drag-drop, forms)

**Examples**: "Build task card component", "Add drag-and-drop", "Improve mobile responsiveness"

**Note**: If a feature spans multiple areas, create separate tasks for each area's work.
</area_guidance>

<execution_instructions>
1. First, ASSESS if you need more information:
   - Clear bug fix ("Fix typo in README") → Skip to task creation
   - Simple idea to explore later ("Look into WebRTC") → Create single brainstorming task
   - Anything unclear or complex → Present questionnaire
2. If questionnaire needed, PRESENT IT and WAIT for answers
3. Select the appropriate pattern (0, A, B, C, or D) based on available info
4. Generate the task structure for that pattern
4. Include proper metadata for each task:
   - mode (brainstorm, research, design, implementation, etc.)
   - area (choose from: core, cli, mcp, ui - see area guidance above)
   - tags using prefix format:
     * "team:ux", "team:backend", "team:infra" (which team owns this)
     * "expertise:researcher", "expertise:architect" (special skills needed)
     * "execution:autonomous" (can run without interaction)
     * "execution:interactive" (needs human input)
     * Other tags without prefixes for general categorization
   - dependencies via sequence numbers (same number = parallel)
5. Create review gate tasks where stakeholder involvement is needed
6. Document the rationale for the chosen pattern
</execution_instructions>

<output_format>
## For Simple/Clear Inputs
If the input is clear enough (bug fix, simple feature, idea to explore):
1. Skip directly to task generation
2. Explain briefly why no questions needed
3. Generate appropriate task(s)

## For Complex/Unclear Inputs
### Step 1: Present Questionnaire
Present relevant questions and wait for user input.

### Step 2: After Receiving Answers
#### Assessment Summary
[Brief analysis of the feature based on user's answers]

#### Selected Pattern: [Pattern Letter] - [Pattern Name]
[Rationale for choosing this pattern based on responses]

#### Generated Task Structure
[Show the task hierarchy with metadata]

#### Execution Notes
- Parallel opportunities: [List any tasks that can run simultaneously]
- Review gates: [List where human approval is needed]
- Dependencies: [Note critical path items]
- Risk areas: [Highlight any concerns]
</output_format>