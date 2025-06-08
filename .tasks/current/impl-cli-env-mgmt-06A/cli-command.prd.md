# Product Requirements Document: Composable CLI Commands

## Executive Summary

This PRD outlines the implementation of three new CLI commands for Scopecraft that provide composable, Unix-philosophy-aligned tools for environment management and work execution. The commands separate concerns clearly: `env` manages environments, `work` handles interactive sessions, and `dispatch` manages automated execution.

## Problem Statement

Current prototype scripts (`plan`, `dispatch`, `auto`, etc.) evolved organically and lack:
- Consistent worktree management
- Clear separation between environment setup and work execution
- Unified approach to parent/subtask handling
- Composable architecture for different execution modes

## Goals

1. **Simplify common workflows** with intuitive commands
2. **Enable composability** following Unix philosophy
3. **Provide clear execution modes** (interactive vs automated)
4. **Abstract environment management** for future extensibility
5. **Maintain backwards compatibility** with existing workflows

## User Stories

### As a developer, I want to:
1. Quickly start interactive work on any task without thinking about worktrees
2. Explicitly manage environments when needed for manual work
3. Run automated sessions in Docker for safety
4. Have subtasks automatically use their parent's environment
5. Compose commands for custom workflows

## Proposed Solution

### Command Structure

#### 1. `sc env` - Environment Management
```bash
sc env <taskId>              # Create or enter environment (upsert)
sc env close <taskId>        # Merge changes and cleanup
sc env list                  # List active environments
sc env path <taskId>         # Output path for scripting
```

**Purpose**: Manage development environments (worktrees initially, extensible to Docker/cloud)

**Key behaviors**:
- Upsert semantics: creates if missing, uses if exists
- NO Claude/AI execution - pure environment management
- Outputs path for shell integration
- Parent task aware (subtasks use parent environment)

#### 2. `sc work` - Interactive Work Sessions
```bash
sc work [taskId] [additionalPrompt...] [options]
  -m, --mode <mode>     # Override inferred mode: implement|explore|orchestrate|diagnose
  --no-docker           # Force interactive even if Docker normally used
  
# Short alias for common use
sc w [taskId] [additionalPrompt...]
```

**Purpose**: Start interactive Claude sessions for development work

**Key behaviors**:
- If no taskId, show interactive selector (current tasks only)
- Automatically creates/uses appropriate environment via ChannelCoder
- Mode inference based on task type
- Additional prompt as trailing arguments (natural language feel)
- Always interactive (never Docker)
- Leverages ChannelCoder's native worktree support

#### 3. `sc dispatch` - Automated Execution
```bash
sc dispatch <taskId> [options]
  -m, --mode <mode>     # Override inferred mode
  -e, --exec <type>     # docker|detached (default: docker)
  
# Short alias
sc d <taskId> [options]
```

**Purpose**: Run automated/background work sessions

**Key behaviors**:
- Always requires taskId (no interactive selection)
- Defaults to Docker execution for safety using `my-claude:authenticated` image
- Can run detached for long-running tasks
- Uses same environment resolution as `work`
- Worktree automatically mounted as Docker volume

### Interactive UI Components

#### Task Selection (Using @inquirer/prompts)
When no taskId is provided to `sc work`, show an interactive selector:

```typescript
const taskId = await select({
  message: 'Select a task to work on:',
  choices: [
    // Only show CURRENT tasks
    { name: 'implement-auth-05A - Implement OAuth authentication [in_progress]', value: 'implement-auth-05A' },
    { name: 'dashboard-redesign-05B - Redesign user dashboard [todo]', value: 'dashboard-redesign-05B' },
    // ... more current tasks
  ]
});
```

**Design decisions**:
- Only show tasks from `current/` workflow (not backlog) to keep list focused
- Display format: `{id} - {title} [{status}]`
- Sort by status (in_progress first, then todo)
- No pagination initially (assume reasonable number of current tasks)

### Shared Components

#### Environment Resolution
```typescript
interface EnvironmentResolver {
  // Resolves environment ID (parent for subtasks)
  resolveEnvironmentId(taskId: string): Promise<string>
  
  // Ensures environment exists
  ensureEnvironment(envId: string): Promise<WorktreeInfo>
  
  // Gets environment info
  getEnvironmentInfo(envId: string): Promise<EnvironmentInfo>
}
```

#### Mode Inference
```typescript
function inferMode(task: Task): WorkMode {
  if (task.isParent) return 'orchestrate';
  switch (task.type) {
    case 'bug': return 'diagnose';
    case 'spike': return 'explore';
    default: return 'implement';
  }
}
```

### Implementation Phases

#### Phase 1: Core Implementation (Week 1)
1. Environment resolution utilities
2. Basic `env` command
3. Basic `work` command
4. Update `dispatch` script
5. Integration tests

#### Phase 2: Enhancement (Week 2)
1. Interactive task selection
2. Advanced options
3. Documentation
4. Migration guide

## Key Design Decisions

### 1. Command Naming
- **`work`** instead of `chat`: Professional, implies substance
- **`dispatch`** maintained: Familiar term, clearly indicates automated execution  
- **`env`** for environment: Future-proof for Docker-only, cloud environments

### 2. Execution Mode Clarity
Interactive vs automated execution is a conscious choice:
- `work` = always interactive (human in the loop)
- `dispatch` = always automated (Docker by default)
- No ambiguity about execution mode

### 3. Parent/Subtask Handling
- **Worktree mapping**: Parent tasks own worktrees, subtasks share parent's
- **Automatic resolution**: System determines correct worktree without user intervention
- **Example**: `work 01_research-users` → uses `dashboard-redesign-05B` worktree

### 4. Additional Prompt as Trailing Args
Natural language feel without flag:
```bash
sc work implement-auth-05A "Focus on error handling and edge cases"
# NOT: sc work implement-auth-05A --prompt "Focus on..."
```

### 5. No Session Management (v1)
- Skip session continuation features for initial version
- Focus on environment + execution
- Session features can be added later (`--continue` flag)

## Technical Specifications

### Environment Naming Convention
- Single/Parent tasks: `../worktrees/{taskId}`
- Branch naming: `task/{taskId}`
- Subtasks use parent's environment

### ChannelCoder Integration

ChannelCoder SDK provides native support for worktrees and Docker execution:

```typescript
// For work command (interactive)
await claude(prompt, {
  worktree: {
    branch: `task/${worktreeId}`,
    path: `../worktrees/${worktreeId}`,
    create: true  // Auto-create if missing
  },
  interactive: true
});

// For dispatch command (Docker)
await claude(prompt, {
  worktree: `task/${worktreeId}`,  // Automatically mounted
  docker: {
    image: 'my-claude:authenticated',
    // Worktree mounted automatically by ChannelCoder
  }
});
```

**Key features leveraged**:
- Automatic worktree creation
- Native Docker volume mounting
- Session persistence
- Stream monitoring capabilities

### Error Handling
- Clear messages for missing tasks
- Graceful handling of git errors
- Worktree conflicts resolution

## Success Metrics

1. **Usability**: Reduce keystrokes for common operations by 50%
2. **Reliability**: Zero worktree conflicts or confusion
3. **Adoption**: Team migrates from old scripts within 2 weeks
4. **Extensibility**: Easy to add new environment types

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|---------|------------|
| Breaking existing workflows | High | Keep old scripts working during transition |
| Worktree naming conflicts | Medium | Clear conventions and conflict detection |
| Learning curve | Low | Comprehensive examples and help text |

## Future Considerations

1. **Session Management**: Add `--continue` flag for resuming sessions
2. **Environment Templates**: Pre-configured environments
3. **Cloud Environments**: Extend beyond local worktrees
4. **Multi-user**: Coordinate shared environments

## Command Execution Flow

### `sc work` Flow
```
1. Parse command arguments
   ├─> taskId provided?
   │   ├─> Yes: Validate task exists
   │   └─> No: Show interactive task selector (current tasks only)
   │
2. Resolve environment
   ├─> Get task info
   ├─> Determine worktree ID (parent for subtasks)
   └─> Let ChannelCoder create/use worktree
   
3. Infer or use mode
   ├─> Mode specified via --mode?
   │   └─> Use specified mode
   └─> Infer from task type
       ├─> Parent task → orchestrate
       ├─> bug → diagnose
       ├─> spike → explore
       └─> feature/chore → implement
       
4. Build prompt
   ├─> Base: task instruction
   └─> Append: additional prompt from args
   
5. Execute via ChannelCoder
   └─> Interactive session with worktree
```

### `sc dispatch` Flow
```
1. Require taskId (no interactive mode)
2. Same environment resolution as work
3. Same mode inference
4. Execute in Docker with worktree mounted
```

### `sc env` Flow
```
1. Resolve environment ID
2. Ensure worktree exists (create if needed)
3. Output path for shell integration
4. NO Claude execution
```

## Appendix: Example Workflows

### Starting Fresh Work
```bash
# Quick start
sc work implement-auth-05A

# With specific instructions
sc work implement-auth-05A "Focus on OAuth2 flow"
```

### Manual Environment Control
```bash
# Create environment
sc env implement-auth-05A

# Do manual work
npm install
npm test

# Start Claude when ready
sc work implement-auth-05A
```

### Automated Testing
```bash
# Run in Docker
sc dispatch test-suite-05B --mode diagnose
```

### Parent Task Orchestration
```bash
# Orchestrate subtasks
sc work dashboard-redesign-05B  # Automatically uses orchestrate mode
```

---

*Last Updated: 2025-01-08*
*Status: In Review*
*Author: David Paquet & Claude*