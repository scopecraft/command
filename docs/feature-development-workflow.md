# Feature Development Workflow

This guide demonstrates the complete feature development workflow in Scopecraft, from initial idea to implementation.

## Overview

The Scopecraft feature development workflow consists of five main stages:

1. **Brainstorming** - Explore problems and solutions
2. **Proposal** - Create formal feature documentation  
3. **PRD** - Develop detailed specifications
4. **Planning** - Break down into actionable tasks
5. **Implementation** - Execute with domain-specific guidance

## Command Reference

### Stage 1: Brainstorming

**Command**: `/project:01_brainstorm-feature`

**Purpose**: Interactive exploration of problems and potential solutions

**Usage**:
```bash
# With initial idea
/project:01_brainstorm-feature "better task filtering"

# Without arguments (open-ended)
/project:01_brainstorm-feature
```

**Output**: 
- Problem statement
- Solution recommendations
- Technical considerations
- Items flagged for human review

### Stage 2: Feature Proposal

**Command**: `/project:02_feature-proposal`

**Purpose**: Transform ideas into structured proposals

**Usage**:
```bash
# From brainstorming summary
/project:02_feature-proposal

# With direct idea
/project:02_feature-proposal "add real-time collaboration"
```

**Creates**: Task with type "proposal" containing:
- Problem statement
- Proposed solution
- Key benefits
- Scope definition
- Technical approach
- Human review items

### Stage 3: PRD Creation

**Command**: `/project:03_feature-to-prd`

**Purpose**: Expand proposals into detailed specifications

**Usage**:
```bash
# Using proposal task ID
/project:03_feature-to-prd TASK-20250517-123456
```

**Produces**: Comprehensive PRD with:
- Functional requirements
- Technical specifications
- UI/UX design
- Implementation notes
- Task breakdown preview
- Human review sections

### Stage 4: Feature Planning

**Command**: `/project:04_feature-planning`

**Purpose**: Create task hierarchy with proper organization

**Usage**:
```bash
# From feature description
/project:04_feature-planning "implement user authentication"

# From existing feature
/project:04_feature-planning FEATURE-20250517-123456
```

**Creates**:
- Parent feature task
- Child implementation tasks by area
- Proper task relationships
- Dependencies between tasks

### Stage 5: Implementation

**Command**: `/project:05_implement {mode} {task-id}`

**Purpose**: Execute tasks with domain-specific guidance

**Modes**:
- `typescript` - Core logic and type safety
- `ui` - React components and UI
- `mcp` - MCP server and tools
- `cli` - Command-line interface
- `devops` - Build and deployment
- Custom modes as needed

**Usage**:
```bash
# UI implementation
/project:05_implement ui TASK-20250517-234567

# Core logic
/project:05_implement typescript TASK-20250517-345678

# MCP integration
/project:05_implement mcp TASK-20250517-456789
```

## Complete Example: Task Filtering Feature

Here's a complete walkthrough of developing a task filtering feature:

### 1. Start with Brainstorming

```bash
/project:01_brainstorm-feature "I need better ways to filter tasks"
```

**Claude explores**:
- Current pain points
- User workflow
- Technical constraints
- Solution options

**Output**: Recommendation for "Recently Modified" filter

### 2. Create Proposal

```bash
/project:02_feature-proposal
```

**Creates**: TASK-20250517-100000 with:
- Problem: Hard to track recent work
- Solution: Add time-based filter
- Benefits: Faster standup prep
- Scope: 24-hour window only

### 3. Expand to PRD

```bash
/project:03_feature-to-prd TASK-20250517-100000
```

**Updates task with**:
- Requirement: Add filter dropdown option
- UI: Reuse FilterDropdown component
- Technical: Extend useTaskFilter hook
- Testing: Unit and integration tests

### 4. Plan Implementation

```bash
/project:04_feature-planning TASK-20250517-100000
```

**Creates tasks**:
- TASK-001: Add last_modified to Task type (core)
- TASK-002: Implement filter logic (core)
- TASK-003: Add UI dropdown option (ui)
- TASK-004: Add relative time display (ui)
- TASK-005: Write tests (core/ui)
- TASK-006: Update documentation (docs)

### 5. Execute Implementation

```bash
# Start with core logic
/project:05_implement typescript TASK-001

# Then UI changes
/project:05_implement ui TASK-003

# Continue through all tasks...
```

## Key Workflow Principles

### 1. Progressive Refinement
Each stage builds on the previous, adding detail and specificity:
- Brainstorming → High-level ideas
- Proposal → Structured problem/solution
- PRD → Detailed specifications
- Planning → Concrete tasks
- Implementation → Actual code

### 2. Human Review Tracking
At each stage, flag assumptions and decisions:
- Technical assumptions without confirmation
- Design decisions needing validation
- Scope interpretations requiring clarification

### 3. Organizational Awareness
Commands understand Scopecraft structure:
- **Phases**: Release milestones (v1, v1.1)
- **Areas**: Technical domains (ui, core, mcp)
- **Features**: User capabilities
- **Tasks**: Atomic work units

### 4. Consistent Documentation
Every stage creates documentation:
- Brainstorming summaries
- Feature proposals
- PRDs
- Task hierarchies
- Implementation logs

## Best Practices

### Start Small
- Begin with focused problems
- Avoid scope creep
- Iterate based on feedback

### Use Templates
- Leverage provided templates
- Maintain consistency
- Adapt as needed

### Track Progress
- Update task statuses
- Document decisions
- Log implementation details

### Review Regularly
- Check human review items
- Validate assumptions
- Adjust plans as needed

## Command Patterns

All workflow commands share patterns:

### Resource Loading
```markdown
<template_loading>
Load template from: /docs/command-resources/...
</template_loading>
```

### MCP Tool Usage
```markdown
<mcp_usage>
Use mcp__scopecraft-cmd__task_create
Use mcp__scopecraft-cmd__task_update
</mcp_usage>
```

### Human Review
```markdown
<human_review_needed>
Flag for review:
- [ ] Assumption about X
- [ ] Decision regarding Y
</human_review_needed>
```

### Task Updates
```markdown
<task_management>
Update task status
Add implementation logs
Mark checklist items
</task_management>
```

## Troubleshooting

### Missing Templates
Commands will use fallback templates if files are missing. Check:
- `/docs/command-resources/planning-templates/`
- `/docs/command-resources/implement-modes/`

### Mode Not Found
Generic commands handle unknown modes by:
1. Checking for mode-specific file
2. Using general patterns if not found
3. Applying domain expertise

### Task State Issues
Ensure tasks have correct:
- Status for current stage
- Phase assignment
- Area classification
- Feature relationships

## Summary

The Scopecraft workflow provides a structured path from idea to implementation:

1. **Explore** problems interactively
2. **Document** solutions formally
3. **Specify** technical details
4. **Plan** concrete tasks
5. **Execute** with guidance

Each stage builds on previous work, maintaining context and documentation throughout the development lifecycle.