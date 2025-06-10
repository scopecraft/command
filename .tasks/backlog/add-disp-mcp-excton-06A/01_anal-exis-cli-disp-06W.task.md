# Analyze existing CLI work and dispatch commands

---
type: chore
status: done
area: mcp
assignee: research-agent
tags:
  - research
  - cli-analysis
  - mcp-design
  - 'execution:autonomous'
---


## Instruction
Analyze the existing CLI work and dispatch commands to understand their behavior and requirements for MCP adaptation.

### Research Objectives

1. **Work Command Analysis**
   - Location: `/src/cli/commands/work-commands.ts`
   - Understand all options and modes
   - Focus on tmux option for parallel sessions
   - Document session management behavior
   - Note what doesn't make sense for MCP context

2. **Dispatch Command Analysis**
   - Location: `/src/cli/commands/dispatch-commands.ts`
   - Understand all supported modes (auto, interactive, etc.)
   - Document execution context handling
   - Analyze ./auto script usage patterns
   - Note integration with channelcoder

3. **Execution Context Understanding**
   - How commands determine WHERE to execute
   - Default behavior for worktree selection
   - Override mechanisms
   - Context inheritance for subtasks

4. **MCP Adaptation Requirements**
   - Identify what changes for MCP context
   - Document parameter mappings
   - Note session management differences
   - Consider error handling in MCP context

### Key Differences to Document

**Work Tool for MCP**:
- Only tmux option (interactive parallel sessions)
- No "replace current process" option
- Clear naming for human-interactive sessions
- How to handle terminal output in MCP

**Dispatch Tool for MCP**:
- All mode support requirement
- Programmatic execution from MCP clients
- Return value/status handling
- Integration with existing MCP session context

### Deliverable Format

Create a comprehensive analysis document with:
1. **Command Behavior Summary** - How each command works
2. **MCP Adaptation Matrix** - What changes, what stays same
3. **Interface Requirements** - Parameters, returns, errors
4. **Integration Points** - How MCP tools interact with existing system
5. **Implementation Recommendations** - Best approach for MCP tools

## Tasks

## Deliverable
# CLI Command Analysis for MCP Adaptation

### 1. Command Behavior Summary

### Work Command (`work-commands.ts`)

**Purpose**: Interactive Claude sessions with environment management  
**Execution**: Always interactive (never Docker per PRD)  
**Key Features**:
- Task selection interface if no taskId provided  
- Session resume capability via `--session` option
- Environment resolution and worktree management
- Mode selection (defaults to 'auto')
- Data parameter support via `--data` option
- Dry-run capability

**Options Structure**:
```typescript
interface WorkCommandOptions {
  mode?: string;           // Execution mode (default: 'auto')
  docker?: boolean;        // Legacy option (always false for work)
  session?: string;        // Session ID to resume
  dryRun?: boolean;        // Preview without execution
  data?: string | Record<string, unknown>; // Additional data merge
}
```

**Execution Flow**:
1. Task selection (interactive if no taskId)
2. Environment resolution (parent/subtask logic)
3. Worktree creation/validation
4. ChannelCoder interactive execution

### Dispatch Command (`dispatch-commands.ts`)

**Purpose**: Autonomous Claude sessions for background execution  
**Execution**: Autonomous with multiple execution types  
**Key Features**:
- Required taskId (unless resuming with `--session`)
- Multiple execution types: docker, detached, tmux
- Environment resolution and Docker configuration
- Session resume capability
- Real-time log file generation for monitoring
- Data parameter support

**Options Structure**:
```typescript
interface DispatchCommandOptions {
  mode?: string;           // Execution mode (default: 'auto')
  exec?: ExecutionType;    // 'docker' | 'detached' | 'tmux'
  rootDir?: string;        // Override project root
  session?: string;        // Session ID to resume
  dryRun?: boolean;        // Preview without execution
  data?: string | Record<string, unknown>; // Additional data merge
}
```

**Execution Flow**:
1. Task validation and loading
2. Environment resolution and creation
3. Log file setup (autonomous sessions only)
4. ChannelCoder autonomous execution with monitoring

### 2. MCP Adaptation Matrix

| Feature | Work Command | Dispatch Command | MCP Adaptation |
|---------|-------------|------------------|----------------|
| **Task Selection** | Interactive UI | Required taskId | MCP parameter validation |
| **Session Management** | Resume support | Resume support | Session tracking in MCP context |
| **Environment Resolution** | Full resolution | Full resolution | **Keep unchanged** |
| **Execution Types** | Interactive only | docker/detached/tmux | **Focus on tmux for MCP** |
| **Data Parameters** | JSON merge | JSON merge | **Keep unchanged** |
| **Dry Run** | Preview mode | Preview mode | **Keep unchanged** |
| **Error Handling** | CLI exit codes | CLI exit codes | MCP error responses |
| **Progress Feedback** | Console output | Console + logs | MCP progress events |

### What Changes for MCP Context

**Work Tool for MCP**:
- ❌ No interactive task selection (MCP client provides taskId)
- ❌ No console output formatting (MCP responses instead)
- ✅ Only tmux execution option (human-interactive sessions)
- ✅ Session naming for human clarity
- ✅ Terminal output handling via tmux attach instructions

**Dispatch Tool for MCP**:
- ❌ No console output formatting (MCP responses instead) 
- ✅ All execution mode support (docker, detached, tmux)
- ✅ Programmatic status/result reporting
- ✅ Return session info for monitoring integration
- ✅ Error details in structured format

### What Stays the Same

- Environment resolution logic (parent/subtask)
- ChannelCoder integration patterns
- Session management and resume capability
- Data parameter parsing and merging
- Worktree creation and branch management
- Mode prompt path resolution

### 3. Interface Requirements

### MCP Work Tool Interface

```typescript
interface MCPWorkToolParams {
  taskId: string;                    // Required (no interactive selection)
  mode?: string;                     // Optional, defaults to 'auto'
  session?: string;                  // Resume existing session
  additionalPrompt?: string;         // Additional instructions
  data?: Record<string, unknown>;    // Structured data (no JSON parsing)
  dryRun?: boolean;                  // Preview mode
}

interface MCPWorkToolResult {
  success: boolean;
  sessionName?: string;              // For future resume
  tmuxWindow?: string;               // Window name for attach
  attachCommand?: string;            // tmux attach command
  worktreePath?: string;             // Environment path
  error?: string;                    // Error details
}
```

### MCP Dispatch Tool Interface

```typescript
interface MCPDispatchToolParams {
  taskId: string;                    // Required task identifier
  mode?: string;                     // Execution mode (default: 'auto')
  execType?: 'docker' | 'detached' | 'tmux'; // Default: 'docker'
  session?: string;                  // Resume existing session
  data?: Record<string, unknown>;    // Additional data
  dryRun?: boolean;                  // Preview mode
}

interface MCPDispatchToolResult {
  success: boolean;
  sessionName?: string;              // Session identifier
  pid?: number;                      // Process ID (detached mode)
  logFile?: string;                  // Log file path for monitoring
  tmuxWindow?: string;               // TMux window (tmux mode)
  attachCommand?: string;            // TMux attach command
  worktreePath?: string;             // Environment path
  dockerImage?: string;              // Docker image (docker mode)
  error?: string;                    // Error details
}
```

### Error Handling Requirements

**MCP Error Response Format**:
```typescript
interface MCPErrorResponse {
  code: 'TASK_NOT_FOUND' | 'ENVIRONMENT_ERROR' | 'EXECUTION_FAILED';
  message: string;
  details?: {
    taskId?: string;
    originalError?: string;
    suggestions?: string[];
  };
}
```

### 4. Integration Points

### Existing System Integration

**Shared Components** (no changes needed):
- `EnvironmentResolver` - resolves task → environment ID
- `WorktreeManager` - creates/manages git worktrees  
- `ConfigurationManager` - project root and settings
- `ScopecraftSessionStorage` - session persistence
- ChannelCoder `execute` functions - core execution logic

**MCP Tool Integration Points**:
1. **Parameter Validation** - MCP schema validation vs CLI parsing
2. **Response Formatting** - MCP structured responses vs console output
3. **Session Context** - MCP session tracking integration
4. **Error Propagation** - MCP error objects vs process.exit()

### ChannelCoder Integration Patterns

**Work Tool → ChannelCoder**:
```typescript
// Use existing executeInteractiveTask helper
const result = await executeInteractiveTask(promptPath, {
  taskId,
  instruction: taskInstruction,
  session,
  worktree: envInfo,
  data: mergedData
});
```

**Dispatch Tool → ChannelCoder**:
```typescript
// Use existing executeAutonomousTask helper
const result = await executeAutonomousTask(promptPath, {
  taskId,
  parentId,
  execType,
  session,
  worktree: envInfo,
  docker: dockerConfig,
  data: mergedData
});
```

### Session Management Integration

**Session Storage** (already implemented):
- File-based session persistence in `.sessions/`
- Metadata tracking (taskId, parentId, status, type)
- Log file association for monitoring

**MCP Session Coordination**:
- MCP tools can query existing sessions
- Resume capability preserves task context
- Session naming includes execution context

### 5. Implementation Recommendations

### Best Approach for MCP Tools

#### 1. Wrapper Architecture

**Recommended Pattern**: Create MCP wrapper functions that adapt CLI logic

```typescript
// mcp/handlers/execution-handlers.ts
export async function mcpWorkTool(params: MCPWorkToolParams): Promise<MCPWorkToolResult> {
  try {
    // Validate params (no interactive selection)
    if (!params.taskId) {
      throw new Error('Task ID is required for MCP work tool');
    }

    // Reuse CLI logic with adaptations
    const options: WorkCommandOptions = {
      mode: params.mode,
      session: params.session,
      dryRun: params.dryRun,
      data: params.data,
      docker: false // Always false for work
    };

    // Call existing CLI logic (extract core function)
    const result = await executeWorkCommand(params.taskId, [], options);
    
    // Transform to MCP response format
    return formatMCPWorkResult(result);
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
```

#### 2. Shared Core Functions

**Refactor CLI commands** to extract core logic:

```typescript
// Extract from handleWorkCommand
export async function executeWorkCommand(
  taskId: string,
  additionalPromptArgs: string[],
  options: WorkCommandOptions
): Promise<ExecutionResult> {
  // Core logic without CLI-specific console output
  // Return structured result instead of calling process.exit()
}

// Extract from handleDispatchCommand  
export async function executeDispatchCommand(
  taskId: string,
  options: DispatchCommandOptions
): Promise<ExecutionResult> {
  // Core logic without CLI-specific console output
  // Return structured result instead of calling process.exit()
}
```

#### 3. Response Transformation

**Convert CLI results to MCP format**:

```typescript
function formatMCPWorkResult(result: ExecutionResult): MCPWorkToolResult {
  return {
    success: result.success,
    sessionName: result.sessionName,
    tmuxWindow: result.data?.windowName,
    attachCommand: result.data?.attachCommand,
    error: result.error
  };
}
```

### Key Implementation Principles

1. **Reuse Maximum CLI Logic** - Don't duplicate environment resolution, session management, or ChannelCoder integration

2. **Extract Core Functions** - Separate CLI presentation from business logic

3. **Preserve Session Compatibility** - MCP and CLI sessions should be interoperable

4. **Structured Error Handling** - Convert CLI exit patterns to MCP error responses

5. **Consistent Parameter Semantics** - Same data structures and validation logic

### Development Sequence

1. **Extract CLI Core Functions** - Refactor existing commands to separate logic from presentation

2. **Create MCP Wrappers** - Build MCP tool functions that call core logic

3. **Implement Response Transformation** - Convert CLI results to MCP format

4. **Add MCP Schema Definitions** - Define parameter and response schemas

5. **Integration Testing** - Verify CLI and MCP tools produce equivalent results

### Testing Considerations

**Compatibility Testing**:
- Same taskId should work in both CLI and MCP contexts
- Session resume should work across CLI/MCP boundaries  
- Environment resolution should be identical

**MCP-Specific Testing**:
- Parameter validation without interactive fallbacks
- Structured error responses
- Progress reporting through MCP channels

---

**Summary**: The CLI commands provide a solid foundation for MCP adaptation. The key is to extract the core business logic while adapting the interfaces for MCP's programmatic context. The existing ChannelCoder integration, environment resolution, and session management can be reused directly.

## Log
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
  - Task: 01_anal-exis-cli-disp-06W
  - Analysis: Research task for CLI analysis (type:chore, area:mcp, tags:research/cli-analysis/mcp-design)
  - Selected Mode: Exploration (research and analysis focus)
  - Reasoning: Explicit research tag + analysis objectives + deliverable format indicates exploration mode
  - Loading: General exploration principles (no mode guidance files found)
- 2025-06-09: Completed codebase analysis of work and dispatch commands
  - Analyzed work-commands.ts: Interactive sessions with task selection and tmux options
  - Analyzed dispatch-commands.ts: Autonomous execution with docker/detached/tmux modes
  - Analyzed channelcoder integration: Session management and execution patterns
  - Analyzed environment resolver: Parent/subtask environment resolution logic
  - Ready to create comprehensive MCP adaptation analysis
- 2025-06-09: === EXECUTION COMPLETE ===
  - Mode Used: Exploration (research and analysis)
  - Status: COMPLETED
  - Deliverable: READY
  - Analysis includes: command behavior summary, MCP adaptation matrix, interface requirements, integration points, implementation recommendations
  - All research objectives achieved
  - Core finding: CLI logic can be extracted and reused with MCP wrappers
  - Next step: Implementation based on recommendations
