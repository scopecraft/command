# Mode Prompt Design Guide

This document codifies the learnings about creating effective mode prompts for Scopecraft. Use this when creating or refining modes.

## Core Philosophy Balance

### "Guide, Don't Cage" vs "Be Prescriptive"

Not all guidance should be equally flexible:

```
FLEXIBLE (Guide):           PRESCRIPTIVE (Enforce):
- Creative approaches       - System rules
- Strategic decisions       - Tool requirements  
- Problem-solving methods   - Process handoffs
- Output structures         - Metadata standards
```

### New Project Adoption Strategy

**Challenge**: Projects adopting modes may not have exact same tools/setup.

**Solution**: Two-tier approach:
1. **RECOMMEND**: Universal best practices all projects should adopt
2. **SPECIFY**: Project-specific implementations via placeholders

**Pattern**:
```
RECOMMENDED for all: "Always run lint + quality tools"
FOR THIS PROJECT: "Run `bun run code-check`" (via placeholder)
```

This guides new projects toward good practices while being specific for configured projects.

## Critical Context Areas

### 0. Stakeholder Context (Essential)

**Problem**: AI without stake in project success tends toward mechanical execution.

**Solution**: Define AI's role as invested stakeholder with ownership.

**Template Pattern**:
```markdown
<role>
<!-- PLACEHOLDER: Define stakeholder context -->
<!-- Example: As an AI co-founder, you balance shipping with quality -->
<!-- Example: As the AI lead architect, you own system scalability -->
<!-- Example: As the AI product owner, you optimize user value -->
You have a stake in this project's success. [Specific role]

[Rest of role definition...]
</role>
```

**Why**: This shifts AI from "task executor" to "invested partner" mindset.

**Guidelines**:
- Default to "AI co-founder" when project type unclear
- Match stakeholder role to project domain:
  - Startup → AI co-founder (balance speed and quality)
  - Enterprise → AI architect (focus on scalability/reliability)  
  - Research → AI principal investigator (depth over speed)
  - Agency → AI tech lead (client value and maintainability)

## Prescriptive Areas (MUST be explicit)

### 1. External Tool Usage Requirements

**Problem**: AI leans on stale training data (months old) instead of current information.

**Challenge**: New projects may not have same MCP tools (Context7, etc.).

**Solution**: Recommend best practices + specify available tools.

**Template Pattern**:
```markdown
<external_tools>
**REQUIRED for accuracy (your training is months old):**
- Use WebSearch for current information, trends, recent changes
- Use external documentation sources (not just memory)
- Verify library versions and recent updates

**AVAILABLE in this project:**
<!-- PLACEHOLDER: Add project-specific tools -->
<!-- Example: Context7 for library documentation -->
<!-- Example: mcp__playwright for browser testing -->

**Why**: Technology changes rapidly. Always verify with current sources.
</external_tools>
```

### 2. System Process Handoffs

**Problem**: Modes work in sequences (Planning → Orchestration → Autonomous). If metadata isn't created correctly, downstream modes fail.

**Challenge**: New projects may use different task management approaches.

**Solution**: Define core handoff protocol + allow project customization.

**Template Pattern**:
```markdown
<process_requirements>
**CORE workflow integration:**
- Use consistent task metadata for downstream processing
- Specify execution type: autonomous vs interactive
- Include area/component information for routing

**THIS PROJECT uses:**
<!-- PLACEHOLDER: Add project-specific task metadata -->
<!-- Example: type, area, mode, assignee, tags -->
<!-- Example: sequence numbers for dependencies: "01", "02" -->
<!-- Example: "execution:autonomous" vs "execution:interactive" -->

**Why**: Downstream modes depend on this metadata to function.
</process_requirements>
```

### 3. Project-Specific Rules

**Problem**: Each project has non-negotiable constraints that must be followed.

**Challenge**: New projects adopting modes may not have exact same tools/setup.

**Solution**: Recommend best practices + provide specific commands when available.

**Template Pattern**:
```markdown
<project_rules>
**RECOMMENDED for all projects:**
- Always run lint + code quality tools before completing code tasks
- Define and respect area boundaries (ui/api/core/etc.)
- Run tests for any code changes

**FOR THIS PROJECT specifically:**
<!-- PLACEHOLDER: Add project-specific commands -->
<!-- Example: Run `bun run code-check` before completing code tasks -->
<!-- Example: Respect area boundaries: core/cli/mcp/ui -->

**Why**: Quality gates prevent technical debt and integration issues.
</project_rules>
```

## Mode Structure Template

```markdown
---
name: mode_name
description: One-line description
---

<role>
<!-- PLACEHOLDER: Define stakeholder context -->
<!-- Example: As an AI co-founder, you balance shipping features with quality -->
<!-- Example: As the AI lead architect, you ensure scalable system design -->
<!-- Example: As the AI data scientist, you deliver actionable insights -->
You have a stake in this project's success. [Define specific role].

<!-- PLACEHOLDER: Define core mindset -->
Core role statement (concise)
</role>

<principles>
- Principle 1 (flexible guideline)
- Principle 2 (flexible guideline)
<!-- PLACEHOLDER: Add domain-specific principles -->
</principles>

<external_tools>
**REQUIRED for accuracy:**
- [Specific tool requirements with reasoning]
</external_tools>

<process_requirements>
**REQUIRED for system integration:**
- [Specific metadata/handoff requirements]
</process_requirements>

<project_rules>
**NON-NEGOTIABLE project requirements:**
- [Project-specific mandates]
<!-- PLACEHOLDER: Add project-specific rules -->
</project_rules>

<approach>
<!-- PLACEHOLDER: Customize workflow -->
High-level workflow (flexible)
</approach>

<deliverable>
<!-- PLACEHOLDER: Define output format -->
Expected output format
</deliverable>
```

## Token Efficiency Guidelines

### Concise but Complete
- Principles: 1 line each maximum
- Requirements: Specific but brief
- Examples: Inline, not separate sections
- Placeholders: Clear but short

### What to Include vs Exclude

**Include**:
- Essential principles
- Non-negotiable requirements
- Critical tool usage
- Process handoffs
- Project constraints

**Exclude**:
- Verbose explanations
- Multiple examples
- Detailed step-by-step workflows
- Philosophical justifications
- Redundant information

## Testing Approach

When creating/updating modes:

1. **Test with real task**: Create actual task using the mode
2. **Check downstream flow**: Verify handoffs work (planning → orchestration → autonomous)
3. **Validate requirements**: Ensure all prescriptive elements are followed
4. **Measure tokens**: Keep modes concise but complete

## Common Anti-Patterns

### ❌ Being prescriptive about creative work
```markdown
## Phase 1: Research
Do exactly these steps:
1. Search for X
2. Analyze Y
3. Document Z
```

### ✅ Being prescriptive about system requirements
```markdown
<process_requirements>
**REQUIRED**: Create tasks with type, area, mode, assignee tags
**Why**: Orchestration mode needs this metadata to route properly
</process_requirements>
```

### ❌ Verbose explanations
```markdown
<role>
You are a senior software engineer with 10+ years of experience who understands the importance of writing clean, maintainable code that follows best practices and considers long-term maintenance...
</role>
```

### ✅ Concise but clear
```markdown
<role>
<!-- PLACEHOLDER: Define implementation mindset -->
Build working features with appropriate quality.
</role>
```

## Mode-Specific Guidance

### Exploration Mode
- **Critical**: External tool requirements (WebSearch, Context7)
- **Reason**: Research needs current information, not stale training data

### Planning Mode  
- **Critical**: Metadata creation requirements for orchestration
- **Reason**: Orchestration mode depends on proper task metadata

### Implementation Mode
- **Critical**: Code quality requirements, area boundaries
- **Reason**: System integration and code standards

### Orchestration Mode
- **Critical**: Metadata reading protocols, status tracking
- **Reason**: Autonomous execution depends on proper routing

## Evolution Strategy

### When to Update This Guide
- New anti-patterns discovered
- Process handoff failures
- Tool usage issues
- Project rule violations

### Update Process
1. Document the problem
2. Identify root cause (missing prescription vs over-prescription)
3. Update relevant section
4. Test with mode updates
5. Commit changes

This guide should evolve as we learn more about effective mode design.