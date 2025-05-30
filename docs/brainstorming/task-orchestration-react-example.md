# Task Orchestration Brainstorming: React App Example

*Date: 2025-01-29*
*Participants: Human, Claude*

## Overview

This document captures our brainstorming session about using the Scopecraft task system to orchestrate AI prompts for a complete project lifecycle. We used a React app development example to test and refine the model.

## Key Insight

**The task system should exist BEFORE prompts are run** - Tasks orchestrate prompts, not the other way around. This enables:
- Persistence of planning before execution
- Parallel execution management
- Human review gates
- Clear traceability

## The React App Example: Full Project Flow

### Initial Concept
"Build a task management UI like Linear but terminal-themed for developers who prefer dark mode and keyboard shortcuts"

### Phase 1: Initial Ideation (Morning)
```bash
# Instead of calling channelcoder directly, create a task
sc task create --type idea --title "Terminal Task UI" \
  --mode brainstorm \
  --prompt explore-idea \
  --inputs '{"context": "For developers who prefer dark mode and keyboard shortcuts"}'

# Task created: EXPLORE-TASKUI-001
# Human can review, adjust, then execute
```

### Phase 2: Parallel Research Burst
```yaml
# Parent task creates multiple research subtasks
terminal-task-ui/
  _overview.md
  01_research-linear-01A.task.md       # mode: research, parallelizable: true
  01_research-height-01B.task.md       # mode: research, parallelizable: true
  01_research-react-state-01C.task.md  # mode: research, parallelizable: true
  01_research-terminal-ui-01D.task.md  # mode: research, parallelizable: true
  01_research-kbd-patterns-01E.task.md # mode: research, parallelizable: true
```

Each task contains:
```yaml
mode: research
prompt: research-competitors  # or research-tech
team: ui
expertise: ux-researcher
parallelizable: true
inputs:
  product: Linear
  focus: keyboard navigation
```

### Phase 3: Synthesis and Planning
```yaml
02_create-prd-01F.task.md
  mode: planning
  prompt: create-prd
  dependencies: [01_*]  # Wait for all research
  inputs:
    template: "@template/PRD.md"
    sources: ["@task:01_research-linear-01A", "@task:01_research-height-01B", ...]
```

### Phase 4: Technical Design
```yaml
03_technical-design-01G.task.md
  mode: design
  prompt: technical-design
  dependencies: [02_create-prd-01F]
  approval_required: true  # Human gate
```

### Phase 5: Implementation Breakdown
```yaml
04_plan-implementation-01H.task.md
  mode: planning
  prompt: plan-feature
  outputs_tasks: true  # This task creates more tasks
```

### Phase 6: Parallel Implementation
```yaml
05_impl-setup-01I.task.md           # Must complete first
06_impl-ui-foundation-01J.task.md   # Can run in parallel
06_impl-state-mgmt-01K.task.md      # Can run in parallel
07_impl-task-list-01L.task.md       # Depends on 06_*
07_impl-kbd-nav-01M.task.md         # Depends on 06_*
08_impl-api-integration-01N.task.md # Depends on 07_*
09_testing-suite-01O.task.md        # Depends on 08_*
10_documentation-01P.task.md        # Can start anytime
```

## Enhanced Task Metadata Requirements

Based on this example, tasks need additional fields for orchestration:

### Required for Orchestration
```yaml
# Prompt execution
mode: brainstorm|research|planning|design|implementation|diagnosis|evolution
prompt: specific-prompt-template  # e.g., "explore-idea", "research-competitors"

# Team and expertise (for composition)
team: ui|core|api|infra
expertise: ux-researcher|architect|developer|tester

# Execution hints
parallelizable: true|false
dependencies: [task-ids]  # When this can run
approval_required: true|false  # Human gate

# Prompt inputs
inputs:
  # Any variables the prompt needs
  product: "Linear"
  focus: "keyboard navigation"
  additionalInstructions: "Focus on accessibility"
```

### Task States for Orchestration
```yaml
# Execution states (different from status)
execution_state: 
  - not_ready      # Dependencies not met
  - ready          # Can be executed
  - queued         # Scheduled for execution
  - executing      # Currently running
  - awaiting_review # Needs human input
  - completed      # Finished execution

# Spec stability
spec_state:
  - draft          # Still being defined
  - stable         # Ready to execute
  - provisional    # Can start but might change
```

## Observations from the Exercise

### What Works Well
1. **Parallel Research** - Multiple investigations without blocking
2. **Progressive Refinement** - Each phase builds on previous outputs
3. **Clear Handoffs** - Research → PRD → Design → Implementation
4. **Team Boundaries** - Tasks assigned to appropriate teams
5. **Non-blocking Flow** - Human reviews when available
6. **Full Traceability** - Everything planned before execution

### Gaps Identified

#### 1. Cross-Phase Feedback
- Implementation discovers design issues
- Need feedback channel without starting over
- Solution: Feedback tasks that update parent specs

#### 2. Partial Starts
- Some implementation can begin before full design
- Need "provisional" execution state
- Tasks can start with understanding they might need updates

#### 3. Discovery During Implementation
- Task discovers multiple approach options
- Need mini-research within implementation
- Solution: Tasks can spawn research subtasks

#### 4. Validation Checkpoints
- After setup: verify tech stack works
- After UI: get visual approval
- Solution: Approval gates in task metadata

#### 5. Scope Creep Management
- PRD says "basic" but implementation finds needs
- Solution: Change request tasks that update PRD

## Model Enhancements

### 1. Feedback Channels
```yaml
# Implementation task finds issue
06_impl-ui-foundation-01J.task.md:
  discovered_issues:
    - description: "Need state management for theme"
      impacts: ["03_technical-design-01G"]
      creates_task: "06_revise-state-design-01Q"
```

### 2. Task Spawning
```yaml
# Task can create child tasks during execution
07_impl-kbd-nav-01M.task.md:
  spawns_research: true
  # Creates: 07_research-kbd-libs-01R.task.md
```

### 3. Continuous Planning
Not just one planning phase but:
- Initial planning (rough breakdown)
- Refined planning (after design)
- Adaptive planning (during implementation)

## Orchestration Execution

### Simple Execution
```bash
# Execute a single task
sc task execute EXPLORE-TASKUI-001

# This would:
# 1. Read task metadata
# 2. Construct channelcoder command
# 3. Execute with proper inputs
# 4. Write results to task deliverable
# 5. Update task status and log
```

### Parallel Execution
```bash
# Execute all ready tasks in parallel
sc task execute --ready --parallel

# This would:
# 1. Find all tasks with execution_state: ready
# 2. Group by parallelizable flag
# 3. Execute parallel groups simultaneously
# 4. Manage outputs and status updates
```

### Orchestrated Flow
```bash
# Execute entire feature with gates
sc task orchestrate terminal-task-ui/

# This would:
# 1. Execute in sequence/parallel as defined
# 2. Pause at approval_required gates
# 3. Handle dependencies automatically
# 4. Provide progress updates
```

## Discussion: Refining the Metadata Model

After reviewing the initial proposal, we discussed simplifications and clarifications:

### 1. Mode Field ✓
**Needed** - Which prompt family to use (research, implementation, etc.)

### 2. Prompt Field → Use Instructions Instead
**Initial idea**: `prompt: research-competitors`

**Better approach**: The instruction section contains the prompt guidance:
```markdown
## Instruction
Load and execute @prompt/research-competitors.md with focus on keyboard navigation patterns in Linear.
```

Or even more directly in natural language:
```markdown
## Instruction
Research Linear's keyboard navigation implementation. Focus on:
- Command palette patterns
- Keyboard shortcuts
- Navigation flow
```

### 3. Inputs Field → Natural Language in Instructions
**Initial idea**: 
```yaml
inputs:
  product: Linear
  focus: keyboard navigation
```

**Better approach**: Just write naturally in instruction:
```markdown
## Instruction
Research **Linear's** approach to **keyboard navigation**, comparing with our requirements...
```

### 4. Team/Expertise → Area + Tags
**Initial idea**: Separate fields for team and expertise

**Better approach**: Use existing systems
```yaml
area: ui
tags: ["team:ux", "expertise:researcher"]
```

Note: We initially included "sprint:2024-S1" but removed it - sprints don't make sense for AI execution context.

### 5. Parallelization → Sequence Numbers + Execution Mode
**Initial idea**: `parallelizable: true/false`

**Better approach**: 
- Use existing sequence numbers (same number = parallel)
- Add execution mode as tag:
```yaml
tags: ["execution:autonomous"]  # Can run in background
# vs
tags: ["execution:interactive"] # Needs human interaction
```

Human decides execution mode at runtime:
```bash
sc task execute 01_research-linear-01A --autonomous
sc task execute 03_technical-design-01G --interactive
```

### 6. Approval Points → Explicit Review Tasks
**Initial idea**: Hidden breakpoints or gates in metadata

**Evolution**: 
- First thought: `tags: ["awaiting-review", "blocks:03_*"]`
- Then: Instructions like "await human review before proceeding"
- **Final (better) approach**: Create explicit review tasks!

Instead of hidden instructions, create actual tasks:

```markdown
# 02_compile-research-findings-01F.task.md

## Instruction
Compile all research findings from tasks 01_* into a cohesive report for human review.

Create a summary that includes:
1. **Executive Summary** - Key findings in 3-5 bullets
2. **What We Learned** - Main insights
3. **Recommendations** - Concrete suggestions
4. **Open Questions** - Things that need human decision
5. **How to Test** - Prototypes or demos to try

Format for easy review - human should be able to decide in 10-15 minutes.
```

This is better because:
- Explicit tasks are visible in task list
- AI can focus on making review efficient
- No hidden complexity or missed instructions
- Clear dependencies for subsequent tasks

## Simplified Task Example (After Discussion)

```markdown
# Research Linear Keyboard Navigation

---
type: spike
status: To Do
area: ui
mode: research
tags: ["team:ux", "expertise:researcher", "execution:autonomous", "parallel-group:research"]
---

## Instruction
Research Linear's keyboard navigation implementation using @prompt/research-competitors.md approach.

Focus areas:
- Command palette (Cmd+K) behavior
- Navigation shortcuts (J/K for up/down, etc.)
- Modal and panel management

Expected deliverable: Comprehensive findings report with:
- Full shortcut documentation
- Navigation flow diagrams  
- Best practices identified
- Recommendations for our implementation

## Tasks
- [ ] Document all keyboard shortcuts
- [ ] Map navigation flows
- [ ] Analyze modal behavior
- [ ] Create comparison matrix

## Deliverable
[Research findings will be documented here]

## Log
- 2024-01-29: Task created from brainstorming session
```

## Key Insights from Discussion

1. **Instructions are powerful** - They can contain prompt references, variables, and all context needed
2. **Tags are flexible** - Better than fixed fields for team, expertise, execution mode
3. **Explicit > Implicit** - Review tasks are better than hidden gates
4. **Human control** - Let humans decide execution mode per task at runtime
5. **No sprints in AI context** - AI executes "now", not in future sprints

## Benefits of Task-First Orchestration

1. **Visibility** - See entire plan before execution
2. **Flexibility** - Adjust tasks before running
3. **Resumability** - Stop/start anytime, state persisted
4. **Parallelism** - System manages concurrent execution
5. **Auditability** - Clear record of plan vs execution
6. **Reusability** - Task templates for common patterns

## Next Steps

1. **Define Metadata Schema** - Formalize orchestration fields
2. **Build Orchestrator** - Tool to execute based on metadata
3. **Create Templates** - Common task patterns
4. **Test with Real Project** - Validate the model
5. **Document Patterns** - Best practices guide

## Adaptive Planning Prompt

Based on our discussion about needing different levels of planning based on complexity, here's a planning prompt that starts with a questionnaire:

### Planning Prompt with Adaptive Questionnaire

```markdown
# Adaptive Feature Planning

---
type: planning
area: {area}
mode: planning
tags: ["team:product", "execution:interactive"]
---

## Instruction

I need to create an appropriate task breakdown for: **{feature_description}**

Before I create tasks, let me assess this feature to determine the right approach.

<assessment_questionnaire>
## Feature Assessment

Please answer these questions (or I'll make reasonable assumptions):

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

Based on your answers (or my assessment), I'll create one of these structures:

### Planning Patterns

**Pattern 0: Too Vague - Need Brainstorming First**
- Creates a single brainstorming task
- Output: Clarified requirements and scope
- Then run planner again with clear requirements

**Pattern A: Simple Direct Implementation**
- Single task with clear instructions
- Built-in testing and documentation
- Suitable for trivial/small changes

**Pattern B: Standard Feature Development**
- Research → Design → Implement → Test
- 4-6 tasks with clear handoffs
- Suitable for clear, medium features

**Pattern C: Exploratory Development**
- Multiple research tasks (parallel)
- Comparison/decision task
- Prototype → Feedback → Iterate cycle
- 8-12 tasks with review gates

**Pattern D: Complex Initiative**
- Phase 1: Research all unknowns (parallel)
- Phase 2: Solution design with alternatives
- Phase 3: Proof of concept
- Phase 4: Production implementation
- Phase 5: Rollout and monitoring
- 15+ tasks with multiple review gates

## Task Generation Approach

<if:pattern="0">
This idea needs clarification first. I'll create a brainstorming task to:
- Expand on the concept
- Identify key requirements
- Define success criteria
- Surface important questions

Once that task is complete, run planning again with the clarified requirements.
</if>

<if:pattern="A">
I'll create a single comprehensive task that includes implementation, testing, and documentation.
</if>

<if:pattern="B">
I'll create a standard feature flow:
1. Technical design task
2. Implementation task(s) by area
3. Integration task
4. Testing and documentation
</if>

<if:pattern="C">
I'll create an exploratory flow:
1. Multiple research tasks (can run in parallel)
2. Synthesis and comparison task
3. Decision/review gate task
4. Prototype task(s)
5. Feedback collection task
6. Refined implementation tasks
</if>

<if:pattern="D">
I'll create a phased approach with multiple review gates and parallel exploration paths.
Each phase will have its own parent task for organization.
</if>

## Tasks
- [ ] Complete assessment questionnaire
- [ ] Generate appropriate task structure
- [ ] Create all subtasks with proper metadata
- [ ] Set up review gate tasks where needed
- [ ] Document dependencies and parallel execution opportunities

## Deliverable
[Generated task structure will appear here]

## Log
- [Date]: Planning session initiated
```

### Example Usage: React Terminal UI

#### Attempt 1: Initial Vague Idea
**Input**: "Build a task management UI like Linear but terminal-themed"

**Assessment Results:**
- Clarity: Very vague
- Scope: Unknown

**Selected Pattern: 0 - Need Brainstorming**

Creates single task:
```markdown
# Brainstorm Terminal Task UI Concept

## Instruction
Explore and clarify the concept of a "terminal-themed task management UI like Linear".

Key questions to answer:
- What aspects of Linear do we want to replicate?
- What does "terminal-themed" mean specifically?
- Who is the target user?
- Core features vs nice-to-haves?
- Technical constraints?

Deliverable: Clear requirements document with scope definition.
```

#### Attempt 2: After Brainstorming
**Input**: Clarified requirements from brainstorming task

**Assessment Results:**
- Clarity: Mostly clear (specific features identified)
- Scope: Large feature (1-2 weeks)
- Technical unknowns: Significant (keyboard nav patterns)
- Multiple solutions: Yes (different UI approaches)
- Validation: Iterative with prototypes
- Stakeholders: Medium involvement

**Selected Pattern: C - Exploratory Development**

This would generate our multi-phase structure:
```
terminal-task-ui/
  01_research-linear-01A.task.md
  01_research-height-01B.task.md
  01_research-terminal-ui-01C.task.md
  02_compile-research-01D.task.md        # Review gate
  03_create-ui-prototypes-01E.task.md
  04_prototype-review-01F.task.md         # Review gate
  05_technical-design-01G.task.md
  06_implement-mvp-01H.task.md
  07_mvp-demo-review-01I.task.md         # Review gate
  ...
```

### Benefits of Adaptive Planning

1. **Right-sized plans** - Simple tasks don't get over-engineered
2. **Appropriate exploration** - Complex tasks get research phases
3. **Clear review gates** - Generated based on stakeholder needs
4. **Parallel opportunities** - Identified based on dependencies
5. **Risk mitigation** - More gates for higher risk features

The questionnaire ensures the AI understands the context before generating tasks, preventing both under-planning and over-planning.

## Conclusion

The task system as orchestration layer is powerful because:
- Tasks are persistent, versionable, and shareable
- All context exists before execution
- Human remains in control with clear review points
- Parallel execution is manageable
- The entire project lifecycle is visible and traceable

This transforms Scopecraft from a task tracker into a **programmable workflow engine** for AI-assisted development.