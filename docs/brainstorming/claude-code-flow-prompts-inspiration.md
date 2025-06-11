# Claude-Code-Flow Prompts and Patterns for Inspiration

## Overview

This document captures interesting prompts, patterns, and approaches from the Claude-Code-Flow project that could inspire enhancements to Scopecraft's orchestration and automation capabilities.

## 1. Multi-Terminal Orchestration Prompts

### Lightweight Multi-Terminal Helper (from research.md)

```bash
# run_multi_term "cmd1;cmd2;cmd3"
run_multi_term() {
  IFS=';' read -r -a cmds <<< "$1"
  for cmd in "${cmds[@]}"; do
    # open a new integrated terminal
    code --command workbench.action.terminal.new
    # send the command (with Enter) into that terminal
    code --command workbench.action.terminal.sendSequence "{\"text\":\"${cmd}\\u000D\"}"
    # small pause so VS Code can spin up each terminal
    sleep 0.3
  done
}
```

**Inspiration for Scopecraft**: This pattern could be adapted for launching multiple worktree terminals or coordinating parallel task execution in different environments.

## 2. Agent Coordination Patterns

### Status Markers System (from coordinator.md)

```markdown
* 🟢 COMPLETE – Task finished and verified
* 🟡 IN_PROGRESS – Actively being worked on
* 🔴 BLOCKED – Dependent or paused
* ⚪ TODO – Unclaimed or unstarted
* 🔵 REVIEW – Awaiting validation
```

**Inspiration for Scopecraft**: While Scopecraft has its own status system, the visual emoji markers could enhance readability in terminal output or logs.

### Update Format for Agent Communication

```markdown
## [Timestamp] Agent: [Agent_ID]  
**Task**: [Brief summary]  
**Status**: [Status marker]  
**Details**: [Progress, issues, discoveries]  
**Next**: [Planned follow-up action]  
```

**Inspiration for Scopecraft**: This structured format could be adapted for the event sourcing system to capture agent actions and decisions.

## 3. Claude Instance Spawning Configuration

### Workflow File Format (from claude-spawning.md)

```json
{
  "name": "Development Workflow",
  "description": "Multi-task development workflow",
  "parallel": true,
  "tasks": [
    {
      "id": "task-1",
      "name": "Research Task",
      "description": "Research authentication best practices",
      "tools": ["WebFetchTool", "View", "Edit"],
      "skipPermissions": true,
      "config": ".roo/mcp.json"
    },
    {
      "id": "task-2", 
      "name": "Implementation Task",
      "description": "Implement authentication system",
      "tools": "View,Edit,Replace,GlobTool,GrepTool,LS,Bash",
      "mode": "backend-only",
      "coverage": 90
    }
  ]
}
```

**Inspiration for Scopecraft**: This declarative workflow format could inspire a similar approach for defining complex task sequences with specific tool permissions and configurations.

## 4. SPARC Integration Approach

### Phase-Based Multi-Terminal Triggering

From the research document, they integrate multi-terminal launching at specific SPARC phases:

```bash
if [[ "$MULTI_TERM" = true ]]; then
    launch_vscode_terminals "$PROJECT_DIR" "${MULTI_TERM_CONFIG:-$PROJECT_DIR/.multi-term.json}"
fi
```

**Inspiration for Scopecraft**: This pattern of phase-based hooks could be adapted for Scopecraft's workflow states (backlog → current → archive) to trigger specific actions at transition points.

## 5. Development Mode Patterns

### Tool Presets for Different Scenarios

```bash
# Research preset
RESEARCH_TOOLS="WebFetchTool,View,Edit,GrepTool"

# Development preset
DEV_TOOLS="View,Edit,Replace,GlobTool,GrepTool,LS,Bash,BatchTool"

# Minimal preset
MIN_TOOLS="View,Edit"
```

**Inspiration for Scopecraft**: Create similar presets for different task types (feature, bug, spike) with appropriate tool configurations.

## 6. Coordination Protocol Rules

### Critical Rules from coordinator.md

1. **No Uncoordinated Edits** – Avoid editing shared files without claiming
2. **Always Test Before Completion** – Validate outputs before status updates
3. **Log All Failures** – Negative results are part of the process
4. **Share Tunings and Fixes** – Parameters, configs, and tricks belong in memory_bank
5. **Commit in Small Units** – Make atomic, reversible changes

**Inspiration for Scopecraft**: These rules could be formalized as part of Scopecraft's event sourcing system, with automatic enforcement and tracking.

## 7. Memory Bank Structure

```
memory_bank/
├── calibration_values.md      # Tuned parameters or heuristics
├── test_failures.md           # Known issues and failed experiments
└── dependencies.md            # Environment setup notes
```

**Inspiration for Scopecraft**: This organized approach to shared knowledge could enhance Scopecraft's knowledge system design, particularly for:
- Storing task-specific calibrations
- Tracking failed approaches
- Documenting environment quirks

## 8. Environment Variables for Context

```bash
CLAUDE_INSTANCE_ID      # Unique identifier for the Claude instance
CLAUDE_FLOW_MODE       # Development mode (full/backend-only/etc)
CLAUDE_FLOW_COVERAGE   # Test coverage target percentage
CLAUDE_FLOW_COMMIT     # Commit frequency setting
CLAUDE_TASK_ID         # Task ID (for batch execution)
CLAUDE_TASK_TYPE       # Task type (for batch execution)
```

**Inspiration for Scopecraft**: Similar environment variables could be set for worktree contexts:
- `SCOPECRAFT_WORKTREE_ID`
- `SCOPECRAFT_TASK_ID`
- `SCOPECRAFT_WORKFLOW_STATE`
- `SCOPECRAFT_PARENT_TASK`

## 9. Advanced Scheduling Strategies

From the coordination implementation, they use multiple scheduling approaches:

- **Capability-based scheduling**: Match tasks to agents with required skills
- **Round-robin scheduling**: Fair distribution
- **Least-loaded scheduling**: Balance workload
- **Affinity-based scheduling**: Prefer agents that handled similar tasks

**Inspiration for Scopecraft**: While Scopecraft is more human-centered, these patterns could inspire:
- Suggesting which developer should take a task based on past work
- Automatic task assignment based on expertise areas
- Load balancing across team members

## 10. Conditional Task Execution

```json
{
  "tasks": [
    {
      "id": "test-task",
      "description": "Run unit tests",
      "tools": "Bash,View",
      "onSuccess": "deploy-task",
      "onFailure": "debug-task"
    }
  ]
}
```

**Inspiration for Scopecraft**: This conditional workflow pattern could enhance Scopecraft's task dependencies, allowing:
- Automatic task creation based on outcomes
- Workflow branching based on results
- Smart task sequencing

## Key Takeaways for Scopecraft

1. **Visual Status Indicators**: Use emoji markers for quick status recognition
2. **Declarative Workflows**: JSON-based task orchestration configurations
3. **Tool Presets**: Pre-defined tool combinations for common scenarios
4. **Phase-Based Hooks**: Trigger actions at workflow state transitions
5. **Structured Communication**: Standardized formats for updates and logs
6. **Environment Context**: Rich environment variables for task execution
7. **Memory Organization**: Structured approach to shared knowledge
8. **Conditional Execution**: Smart task flows based on outcomes

These patterns from Claude-Code-Flow demonstrate sophisticated orchestration approaches that could enhance Scopecraft's capabilities while maintaining its Unix philosophy and file-based simplicity.