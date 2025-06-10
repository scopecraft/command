# Rewrite TRD with clearer execution context concepts

---
type: chore
status: done
area: core
assignee: design-agent
tags:
  - design-refinement
  - simplification
  - 'execution:autonomous'
---


## Instruction
Rewrite the TRD to reflect clearer execution context concepts based on sensible defaults and composable overrides.

### Context

The current TRD overengineers ExecutionContext. The user has clarified a simpler model:

1. **Project Root**: Set by central tools (like Claude Desktop) via existing MCP tool
2. **Execution Rules**: Sensible defaults that can be overridden
3. **Composability**: Pass information without dictating behavior

### TRD Location

**Document to Rewrite**: `TRD-ExecutionContext-Functional-API-Design.md` in this parent task folder

### Core Concepts to Implement

#### 1. Simplified Execution Model

**Default Rules**:
- Single/Parent tasks → Create/use worktree named by task ID
- Subtasks → Execute in parent's context
- No location specified → System applies defaults

**Override Capability**:
- Can force execution on specific branch (e.g., main)
- Can specify alternate worktree
- Settings control default behavior

#### 2. Context Resolution (Simplified)

Instead of complex ExecutionContext, use simple rules:

```typescript
interface ExecutionLocation {
  worktreePath?: string;    // Where to execute
  branchName?: string;      // Branch to use
  inheritFromParent?: boolean; // Use parent context
}

// Dispatch doesn't require location
function dispatch(taskId: string, instructions: string, location?: ExecutionLocation);

// System determines location based on:
// 1. Explicit location if provided
// 2. Parent context for subtasks
// 3. Task-specific worktree for single/parent tasks
// 4. Main branch if configured as default
```

#### 3. Project Root Management

Keep existing pattern:
- Central tools use `setProjectRoot()` MCP call
- Project root persists for session
- Worktrees are relative to project root

#### 4. Docker Flexibility

Support both patterns:
- Mount worktree (current approach)
- Pass branch name for checkout (future option)

The system passes information, Docker decides implementation.

### What to Change

1. **Replace Complex ExecutionContext**
   - Remove all the fields
   - Replace with simple location/branch info
   - Focus on WHERE not HOW

2. **Simplify Context Resolution**
   - Default rules, not complex priority
   - Simple overrides, not elaborate inheritance
   - Let components decide behavior

3. **Remove Orchestration Complexity**
   - No orchestrationState
   - No session coordination
   - Just simple parent/child relationships

4. **Focus on Composability**
   - Functions pass minimal info
   - Receivers decide behavior
   - Settings control defaults

### Key Principle

**"Context is where you are"** - If you're in a worktree, that's your context. The system provides sensible defaults but doesn't enforce rigid rules.

### Deliverable

**Direct edits** to the TRD:
1. Replace ExecutionContext with simple location concepts
2. Document default execution rules
3. Show override mechanisms
4. Emphasize composability over complexity
5. Keep focus on fixing dual-context bug with simple solution

## Tasks

## Deliverable
**TRD Rewrite Complete**: Completely rewrote `TRD-ExecutionContext-Functional-API-Design.md` with simplified execution context model.

**Key Changes Made**:
1. **Replaced Complex ExecutionContext** - Removed 12+ field interface, replaced with simple 3-field `ExecutionLocation`
2. **Simplified Context Resolution** - Replaced complex priority chains with 5 simple default rules
3. **Removed Orchestration Complexity** - Eliminated orchestrationState, session coordination, complex inheritance
4. **Focused on Composability** - Functions pass minimal info (WHERE not HOW), receivers decide behavior

**Core Architecture**:
- **Default Rules**: Single/Parent tasks → own worktree, Subtasks → inherit from parent
- **Override Capability**: Force main branch, specify alternate worktree, settings control defaults
- **Simple APIs**: `dispatch(taskId, instructions, location?)` vs complex context creation
- **Composable Design**: Pass `ExecutionLocation`, let components interpret

**Key Principle Implemented**: "Context is where you are" - system provides sensible defaults but doesn't enforce rigid rules.

**Document Structure**:
- Executive Summary with core principle
- Simplified interfaces (ExecutionLocation vs ExecutionContext)
- Default execution rules with clear override mechanisms
- Implementation patterns emphasizing composability
- Migration path from complex to simple
- Future extensibility through settings and location extensions

**Result**: TRD now reflects clearer execution context concepts based on sensible defaults and composable overrides, eliminating over-engineering while maintaining flexibility.

## Log
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
- Task: 06_rewr-clea-excton-cont-06N
- Analysis: Design refinement task for TRD rewrite, type: chore, area: core, tags: design-refinement, simplification
- Selected Mode: Design Mode (technical requirements documentation)
- Reasoning: Task involves rewriting TRD for architectural simplification
- Target: TRD-ExecutionContext-Functional-API-Design.md in parent task folder
- 2025-06-09: Located and analyzed current TRD - found over-engineered ExecutionContext with complex orchestration. Starting rewrite with simplified execution model.
- 2025-06-09: === EXECUTION COMPLETE ===
- Completely rewrote TRD with simplified execution context model
- Replaced complex ExecutionContext (12+ fields) with simple ExecutionLocation (3 fields)
- Implemented sensible default rules: Single/Parent tasks → own worktree, Subtasks → inherit
- Added composable override mechanisms through settings and runtime parameters
- Focused on "WHERE not HOW" principle - pass minimal info, let components decide behavior
- Status: COMPLETED
- Deliverable: READY
