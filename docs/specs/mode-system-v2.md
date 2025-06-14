# Mode System V2: Composable AI-Driven Guidance

*Evolution of the [Mode System Design](./mode-system-design.md)*

## ⚗️ Experimental Status

**This is an active experiment in AI-driven workflow orchestration.** We're testing whether AI agents can intelligently compose guidance, execute autonomous workflows, and orchestrate complex multi-phase work. The patterns documented here are emerging from real usage - expect evolution and refinement.

## Overview

Mode System V2 embraces AI intelligence for dynamic guidance composition and autonomous execution. Instead of complex configuration systems, we leverage the AI's ability to understand context, compose relevant guidance, and execute work with minimal human intervention.

## Core Philosophy

### 1. **AI-Driven Composition**
The AI agent reads task metadata and intelligently selects relevant guidance snippets, rather than following hardcoded rules.

### 2. **Simple File Structure** 
- Base mode files provide mindset and core guidance
- Guidance snippets offer universal patterns
- Area files contain project-specific details
- AI composes them based on task context

### 3. **Autonomous Orchestration**
- Single tasks execute autonomously with full documentation
- Parent tasks orchestrate complex multi-phase work
- Humans intervene only at decision gates

### 4. **Progressive Enhancement**
Start with minimal structure, let patterns emerge through usage, formalize what proves valuable.

## Architecture Evolution

### Current Architecture (Transitional)
```
.tasks/
  .modes/
    exploration/
      base.md           # Core exploration mindset and process
    planning/
      base.md           # Planning approach (existing)
    implementation/
      base.md           # Implementation guidance
      autonomous.md     # Autonomous implementation mode
      area/             # Project-specific details
        ui.md           # UI tech stack, conventions
        core.md         # Core patterns, structure
        mcp.md          # MCP implementation details
        cli.md          # CLI patterns, tools
    design/
      base.md           # Design decision process
    orchestration/      # Orchestration modes
      base.md           # Interactive orchestration
      autonomous.md     # Autonomous task router
    guidance/           # General, reusable patterns
      react-patterns.md
      ui-research.md
      frontend-tools.md
      codebase-research.md
      ...
```

### Future Architecture (Simplified)
```
.tasks/
  .templates/             # Task type = execution approach
    feature.md            # Implementation mindset
    bug.md                # Diagnosis mindset
    spike.md              # Exploration mindset
    chore.md              # Direct execution
    test.md               # Testing approach
    docs.md               # Documentation approach
    parent.md             # Orchestration mindset
    planning.md           # Planning sessions
    area.md               # Template for areas
    guidance.md           # Template for guidance
  .modes/                 # Project-specific only
    area/
      ui.md               # This project's UI patterns
      core.md             # This project's core patterns
      mcp.md              # This project's MCP patterns
    guidance/
      react-patterns.md   # Reusable patterns
      security-checks.md  # Domain guidance
```

The key simplification: **Task type directly determines execution approach**, eliminating the redundancy between task types (feature, bug, spike) and mode types (implementation, diagnosis, exploration).

## Guidance vs Area Split

### Guidance Files (General Patterns)
Located in `.tasks/.modes/guidance/`, these files contain:
- **Universal patterns** applicable across projects
- **General best practices** for technologies/domains
- **Research strategies** that work anywhere
- **Pattern categories** without implementation specifics

Examples:
- React composition patterns (not specific router)
- Security research approaches (not specific tools)
- API design principles (not specific framework)

### Area Files (Project-Specific)
Located in `.tasks/.modes/[mode]/area/`, these files contain:
- **Exact tech stack** used in this project
- **File locations** and project structure
- **Project conventions** and standards
- **Specific tools and commands**
- **Do's and Don'ts** for this codebase

Examples:
- "We use TanStack Router with file-based routing"
- "API server runs on Bun at port 8899"
- "Always create Storybook stories first"
- "Use these specific React Query hooks"

### Composition Benefits
This split enables:
1. **Reusable guidance** across projects
2. **Project customization** without duplication
3. **Clear separation** of concerns
4. **Easy onboarding** with both general and specific knowledge

## Autonomous Execution Model

### Single Task Execution
Individual tasks can execute completely autonomously using the router pattern:

```bash
# The autonomous router reads task metadata and loads appropriate mode
./auto task-id [parent-id]
```

The router (`orchestration/autonomous.md`):
1. Loads task context via MCP
2. Analyzes tags, type, area to determine mode
3. Loads appropriate guidance (base + area + general)
4. Executes with full documentation
5. Handles questions by making assumptions and flagging for review

### Multi-Phase Orchestration
Parent tasks coordinate complex work through orchestration flows:

```bash
# Autonomous orchestration (interactive sc mode doesn't exist yet)
./auto parent-task-id
```

The orchestrator (`orchestration/base.md`):
1. Reads orchestration flow from parent task
2. Identifies current phase and ready work
3. Actually dispatches tasks using `./auto task-id parent-id`
4. Updates parent task log with orchestration actions
5. Handles gates (automated, human review, decision points)

### Task States and Flow
```
Individual Task: draft → ready → executing → done/blocked
Parent Task: orchestrating → waiting-for-gate → continuing → complete
```

## Composition Mechanism

### Base Mode Structure
```markdown
<role>
Define the mindset for this mode
</role>

<compose_guidance>
Instructions for the AI to intelligently load relevant guidance:
- Check task tags, area, type
- Look for keywords in instruction
- Load matching guidance snippets
- Use judgment about relevance
</compose_guidance>

<mission>
Core guidance for the mode
</mission>
```

### AI Composition Logic
The AI analyzes:
1. **Task Metadata**
   - Tags (e.g., "react", "security", "performance")
   - Area (e.g., "ui", "core", "mcp", "cli")
   - Type (e.g., "feature", "bug", "spike")
   - Team/expertise tags

2. **Task Content**
   - Keywords in instruction
   - Problem domain
   - Technical context

3. **Intelligent Selection**
   - Load only relevant guidance
   - Adapt approach based on context
   - Combine guidance naturally

## Guidance Snippet Structure

```markdown
# [Specific Pattern/Domain] Guidance

## When This Applies
[Conditions or contexts where this guidance is relevant]

## Key Considerations
[Domain-specific questions and thinking points]

## Recommended Tools
[Contextual tool suggestions with usage patterns]

## Patterns to Follow
[Best practices and established patterns]

## Common Pitfalls
[What to avoid or watch out for]
```

## Example Composition Flow

### Task Example
```yaml
title: "Research modern data table patterns for React app"
type: spike
area: ui
tags: ["react", "research", "ui-patterns", "team:frontend"]
```

### AI Composition Process
1. Recognizes: React + research + UI patterns
2. Loads:
   - `react-patterns.md` (matches React tag)
   - `ui-research.md` (matches UI area + research)
   - `frontend-tools.md` (matches team:frontend)
3. Adapts guidance based on "data table" specifics
4. Suggests tools: Context7 for React Table libraries, WebSearch for patterns

## Benefits Over V1

### Simplicity
- No complex configuration files
- No hardcoded composition rules
- Just markdown and AI intelligence

### Flexibility
- AI recognizes patterns we didn't anticipate
- Natural language guidance addition
- Easy to experiment and iterate

### Maintainability
- Add guidance by dropping in markdown files
- No code changes needed
- Human-readable and editable

## Migration Path

### To Current Architecture (Immediate)
1. **Phase 1**: Create base modes with composition instructions
2. **Phase 2**: Add initial guidance snippets
3. **Phase 3**: Test with real tasks, observe AI composition
4. **Phase 4**: Refine guidance based on usage
5. **Phase 5**: Formalize successful patterns

### To Future Architecture (Long-term)
1. **Move execution approaches to templates**:
   - `exploration/base.md` → `.templates/spike.md`
   - `implementation/base.md` → `.templates/feature.md`
   - `diagnosis/base.md` → `.templates/bug.md`
   - `orchestration/base.md` → `.templates/parent.md`

2. **Simplify router logic**:
   - Router reads task type instead of analyzing for mode
   - Direct mapping: task.type → template file

3. **Keep project-specific in .modes/**:
   - Areas stay as-is
   - Guidance patterns stay as-is

4. **Benefits realized**:
   - No redundant type/mode mapping
   - Clearer mental model
   - Templates serve dual purpose

## Tool Guidance Patterns

### Contextual Tool Selection
Instead of prescribing tools, provide contextual suggestions:

```markdown
## Smart Tool Usage

When researching libraries:
- Context7: When you know specific library names
- WebSearch: When exploring options
- WebFetch: When analyzing implementations

When understanding codebase:
- Grep: Find patterns across files
- Glob: Locate similar structures
- Read: Deep dive into specific files
```

### Tool Chaining Examples
```markdown
Common research flows:
1. WebSearch "React best practices" → Context7 "@tanstack/react-table" → Grep existing tables
2. Grep "auth" → Read implementations → Context7 "passport.js"
3. Glob "**/*.test.*" → Read patterns → WebSearch "testing strategies"
```

## Current Experimental Status

### What We've Built So Far

1. **Core Infrastructure** ✅
   - Exploration mode with composition instructions
   - Guidance vs area file split
   - Autonomous task router (`./auto`)
   - Orchestration mode that can actually dispatch tasks
   - Implementation-only autonomous mode (`implement-auto`)

2. **Guidance Library** ✅
   - `react-patterns.md` - General React patterns and strategies
   - `ui-research.md` - UI research approaches and considerations  
   - `frontend-tools.md` - Frontend tooling and development practices
   - `codebase-research.md` - Internal code exploration strategies
   - All emphasize Context7 for library documentation

3. **Autonomous Scripts** ✅
   - `./auto task-id [parent-id]` - Smart router for any task type
   - `implement-auto task-id parent-id` - Implementation tasks only
   - Both use channelcoder SDK for background execution

### Testing the Concept

#### Current Test Scenarios
- **React UI Research**: Task with tags `["react", "ui", "research"]` → Loads react-patterns + ui-research
- **Task Orchestration**: Parent tasks with orchestration flows → Dispatches autonomous agents
- **Mode Selection**: Autonomous router determines mode from task metadata

#### Early Observations
- ✅ AI successfully composes relevant guidance based on tags
- ✅ Project-specific area guidance works well with general patterns
- ✅ Autonomous documentation protocol produces comprehensive logs
- 🚧 Orchestration flow parsing needs refinement
- 🚧 Gate handling requires more explicit patterns

#### Success Metrics Being Tracked
- AI selects appropriate guidance 90%+ of time
- Composed guidance feels natural and helpful
- Easy to add new guidance snippets
- Clear orchestration patterns emerge
- Autonomous tasks complete with minimal intervention

## Practical Example: UI Redesign Feature

### Task Creation
```yaml
title: "Research modern UI patterns for task creation"
type: spike
area: ui
tags: ["react", "ui-research", "team:ux", "execution:autonomous"]
```

### Autonomous Router Analysis
1. **Reads task**: Tags indicate React + UI research
2. **Selects mode**: Exploration (type:spike + research keywords)
3. **Loads guidance**:
   - `exploration/base.md` (core mindset)
   - `exploration/area/ui.md` (project-specific: TanStack Router, Storybook-first)
   - `guidance/react-patterns.md` (general React patterns)
   - `guidance/ui-research.md` (UI research strategies)

### Execution Flow
1. **Discovery Phase**: Researches React component patterns
2. **Research Phase**: Uses Context7 for TanStack Router docs, WebSearch for UI patterns
3. **Analysis Phase**: Compares findings with existing Scopecraft patterns
4. **Synthesis Phase**: Produces recommendations in deliverable section

### Documentation Output
```markdown
## Log
- 2025-06-04 14:23: === AUTONOMOUS EXECUTION STARTED ===
  - Task: research-ui-patterns-06Q
  - Analysis: React + UI research task
  - Selected Mode: exploration
  - Loading: exploration/base.md, ui.md, react-patterns.md, ui-research.md

- 2025-06-04 14:28: Researching React component patterns
  - Found: Compound components pattern in Context7 React docs
  - Found: Render props vs hooks discussion
  - Next: Analyze how this applies to task creation forms

## Deliverable
### Pattern Analysis
- **Compound Components**: Flexible composition for complex forms
- **Controlled vs Uncontrolled**: Recommendations for form state...
```

## Orchestration Example: Multi-Phase Feature

### Parent Task Structure
```markdown
### Phase 1: Research (Parallel) ✓
- [x] Research UI patterns → @research-agent
- [x] Analyze document-editor → @research-agent

### Gate: Synthesis Review ✓
Decision: Use hybrid approach (modal + inline)

### Phase 2: Design (Current)
- [ ] Design UI approach → @design-agent

### Gate: Human Design Review (Pending)
Approval required before implementation
```

### Orchestration Execution
```bash
# Human runs orchestration
./auto ui-redesign-parent-06A

# Orchestrator reads flow, identifies Phase 2 is ready
# Actually dispatches task:
./auto design-task-06E ui-redesign-parent-06A
```

## Future Evolution

### Near Term (Current Focus)
- Refine orchestration flow parsing
- Add more guidance snippets based on usage
- Test autonomous router with diverse task types
- Improve gate handling patterns

### Medium Term  
- Formalize successful orchestration patterns
- Create mode templates for common workflows
- Add team-specific guidance overlays
- Build comprehensive guidance library

### Long Term Vision
- AI learns project-specific patterns
- Suggests new guidance creation from successful tasks
- Community sharing of guidance patterns
- Self-improving orchestration flows

## Guiding Principles

### 1. **Trust AI Intelligence** 
Let the AI figure out what's relevant rather than prescribing every detail. The autonomous router demonstrates this - it reads context and loads appropriate guidance without hardcoded rules.

### 2. **Start Simple, Evolve Naturally**
Minimal structure with maximum flexibility. We're learning what patterns work through real usage rather than designing comprehensive systems upfront.

### 3. **Documentation as Communication**
Since autonomous agents can't interact with humans, the task file becomes the primary communication channel. Everything must be documented comprehensively.

### 4. **Human Readable and Modifiable**
Anyone should be able to understand and modify guidance files. No complex configuration - just markdown and natural language instructions.

### 5. **Composable Over Complete**
Better to combine small, focused guidance snippets than create monolithic guidance. This enables reuse across projects and easier maintenance.

### 6. **Autonomous by Default, Interactive by Choice**
Design for autonomous execution first, with human intervention only at explicit decision points. This maximizes throughput while maintaining quality.

### 7. **Experiment and Measure**
This is an active experiment. We're tracking what works, what doesn't, and evolving the approach based on real usage patterns.

## Implementation Notes

This system represents a significant experiment in AI-driven development workflows. The patterns documented here are emerging from real usage - expect continuous evolution as we learn what works in practice.

Key to success is maintaining the balance between structure (for consistency) and flexibility (for adaptation). The AI-driven composition model allows us to achieve both without complex configuration systems.

The autonomous execution model is particularly experimental - we're testing whether AI agents can maintain project context, make reasonable decisions, and produce high-quality documentation without human intervention. Early results are promising but require continued refinement.

---

*This document serves as both specification and experiment log. As patterns stabilize, they may be formalized into more permanent systems. For now, the focus is on learning and iteration.*