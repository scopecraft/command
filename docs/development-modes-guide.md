# Development Modes Guide

This guide describes the mode system used in Scopecraft for organizing different types of development work. Each mode represents a specific mindset and set of activities.

## Current Status

**We are currently in Exploration Mode** - investigating how to build the orchestration system itself.

## Mode System Design Matrix

### Core Modes (Based on Intent)

**1. Planning Mode**
- **Trigger**: "Break this down into..."
- **Input**: Feature/epic/large task
- **Output**: Subtasks with dependencies, sequencing, mode assignments
- **Human Involvement**: Collaborative (review breakdown)
- **Transitions to**: Multiple parallel/sequential modes

**2. Exploration Mode** *(CURRENT MODE)*
- **Trigger**: "I need to understand..."
- **Input**: Question/area to investigate
- **Output**: Findings, patterns, recommendations
- **Human Involvement**: Autonomous
- **Transitions to**: Any mode (based on findings)

**3. Design Mode**
- **Trigger**: "I need to decide how to..."
- **Input**: Problem/feature requirements
- **Output**: Architecture decision, approach, trade-offs
- **Human Involvement**: Collaborative (review options)
- **Transitions to**: Planning (if complex) or Implementation

**4. Implementation Mode**
- **Trigger**: "Build this..."
- **Input**: Clear requirements/design
- **Output**: Working code + tests
- **Human Involvement**: Autonomous → Guided → Collaborative
- **Transitions to**: Diagnosis (if issues) or Evolution

**5. Diagnosis Mode**
- **Trigger**: "Fix/debug this..."
- **Input**: Issue description/symptoms
- **Output**: Root cause, fix approach, preventions
- **Human Involvement**: Guided (validate findings)
- **Transitions to**: Implementation (for fix)

**6. Evolution Mode**
- **Trigger**: "Improve/refactor this..."
- **Input**: Current code + improvement goals
- **Output**: Refactored code maintaining behavior
- **Human Involvement**: Guided (approve approach)
- **Transitions to**: Implementation (if new features emerge)

## Complexity/Involvement Matrix

|                | Autonomous | Guided | Collaborative | Exploratory |
|----------------|------------|--------|---------------|-------------|
| **Planning** | Simple feature | Multi-component | System-wide | New product area |
| **Exploration** | Pattern search | Architecture review | New domain research | Spike unknown tech |
| **Design** | - | Standard features | System architecture | Greenfield design |
| **Implementation** | CRUD/forms | Feature with choices | Core system changes | Proof of concept |
| **Diagnosis** | Simple bugs | Complex issues | System failures | Intermittent issues |
| **Evolution** | Code cleanup | Module refactor | Architecture migration | Tech stack change |

## Planning Mode Output Structure

```
Feature: [Original feature]

Subtasks:
1. [Task] - Mode: Exploration - Find existing auth patterns
2. [Task] - Mode: Design - Choose OAuth strategy  
3. [Task] - Mode: Implementation - Build auth service
4. [Task] - Mode: Implementation - Build UI components
5. [Task] - Mode: Evolution - Refactor user model

Dependencies:
- Task 2 requires Task 1
- Tasks 3,4 can run parallel after Task 2
- Task 5 after Tasks 3,4

Suggested Sequence:
- Phase 1: Exploration (Task 1)
- Phase 2: Design (Task 2) 
- Phase 3: Parallel Implementation (Tasks 3,4)
- Phase 4: Evolution (Task 5)
```

## Mode Flow Patterns

**Linear**: Planning → Design → Implementation
**Exploratory**: Planning → Multiple Explorations → Design → Implementation  
**Iterative**: Planning → Implementation cycles with Diagnosis/Evolution
**Parallel**: Planning → Spawn multiple Implementation tracks

## Mode Switching Triggers

- **Natural Flow**: Design → Implementation → Diagnosis (if needed)
- **Iterative**: Implementation ↔ Diagnosis ↔ Evolution
- **Research Branch**: Any mode → Exploration → Resume
- **Escalation**: Autonomous → Guided → Collaborative (as complexity emerges)

## Context Persistence

Each mode:
- Reads task context from Scopecraft
- Updates task with findings/decisions
- Suggests next mode based on outcomes
- Maintains history for future modes

## Key Principles

1. **Mode = Mindset**, not rigid phase
2. **Human decides** mode switches
3. **Complexity determines** involvement level
4. **Task is memory** across all modes
5. **Output templates** ensure consistency
6. **Questions are first-class** (formal protocol)

## Implementation Notes

The mode system is implemented using:
- **channelcoder**: For structured prompt execution
- **Scopecraft tasks**: For persistent context across modes
- **Shared instructions**: Common patterns across all modes
- **Question protocol**: Formal way to request human input

## Future Enhancements

- Parallel mode execution using tmux
- Automatic mode suggestion based on task analysis
- Mode-specific tool restrictions
- Cross-mode context sharing improvements