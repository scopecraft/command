# Investigate worktree execution context propagation bug

---
type: bug
status: done
area: core
tags:
  - critical-bug
  - worktree
  - context-propagation
  - channelcoder
  - root-cause-analysis
priority: highest
assignee: debug-agent
---


## Instruction
Investigate the critical worktree execution context propagation bug where tasks appear to execute in worktrees but actually run on main branch.

### Problem Statement

**Expected**: When dispatching tasks to worktrees, they should execute IN the worktree
**Actual**: Tasks show "Working in: worktree-path" but changes happen on main branch
**Impact**: All orchestrated tasks are modifying the wrong branch

### Evidence

When running `./auto 07_stud-actu-impl-real-06X refc-env-config-fnctnlcmpsble-06A`:
```
✓ Environment ready: /Users/davidpaquet/Projects/scopecraft-v2.worktrees/refc-env-config-fnctnlcmpsble-06A
✓ Working in: /Users/davidpaquet/Projects/scopecraft-v2.worktrees/refc-env-config-fnctnlcmpsble-06A
Detached PID: 16449
```

BUT the actual execution happens on main branch!

### Investigation Requirements

Follow the Root Cause Analysis methodology from `.claude/commands/root_cause.md`:

#### Phase 1: Create Investigation Todo List
```markdown
- [ ] Check file system - verify worktree actually exists
- [ ] Test direct dispatch API to isolate the issue
- [ ] Examine dispatch-commands.ts logic
- [ ] Trace execution context flow through channelcoder
- [ ] Create visual ASCII diagram of the bug
- [ ] Determine if bug is in scopecraft or channelcoder
```

#### Phase 2: Systematic Investigation

1. **Verify Worktree Setup**
   - Check if worktree exists at claimed path
   - Verify git worktree configuration
   - Test manual cd into worktree

2. **Trace Execution Flow**
   - How does ./auto script work?
   - How does dispatch-commands.ts handle worktree context?
   - Where does channelcoder get execution directory?
   - When/where does context get lost?

3. **Test Direct Execution**
   - Try running commands directly in worktree
   - Compare with dispatch execution
   - Identify the divergence point

#### Phase 3: Required Deliverables

1. **ASCII Flow Diagram** showing:
   ```ascii
   USER: ./auto taskId parentId
       │
       ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  AUTO SCRIPT                                                │
   │  📁 ./auto                                                  │
   │                                                             │
   │  1️⃣ Detects worktree path correctly                        │
   │  2️⃣ Sets up environment                                    │
   │  3️⃣ Calls bun dispatch with correct path                   │
   └─────────────────────────────────────────────────────────────┘
       │
       ▼
   [Continue tracing where context is lost...]
   ```

2. **Root Cause Identification**
   - Exact file and line where bug occurs
   - Is it in scopecraft code or channelcoder?
   - Why does the context not propagate?

3. **Bug Report** (if channelcoder issue):
   - Clear reproduction steps
   - Expected vs actual behavior
   - Suggested fix if possible

### Key Files to Investigate

- `./auto` - The dispatch script
- `/src/cli/commands/dispatch-commands.ts` - Dispatch logic
- `/src/integrations/channelcoder/` - Context handling
- `.worktrees/` directory structure

### Success Criteria

1. Clear ASCII diagram showing exact failure point
2. Definitive answer: scopecraft bug or channelcoder bug?
3. If channelcoder: Detailed bug report ready to submit
4. If scopecraft: Specific fix recommendation
5. Validation steps to verify fix works

## Tasks

## Deliverable
### Root Cause Analysis: Worktree Execution Context Propagation Bug

### Executive Summary

**Problem**: Tasks appear to execute in worktrees but actually run on main branch  
**Root Cause**: Detached execution mode doesn't change working directory to worktree  
**Location**: `src/integrations/channelcoder/client.ts:70`  
**Impact**: All autonomous tasks modify wrong branch, breaking isolation  
**Fix Required**: Implement worktree directory change for detached mode (similar to tmux)  

### Flow Diagram

```ascii
USER: ./auto 07_stud-actu-impl-real-06X refc-env-config-fnctnlcmpsble-06A
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  AUTO SCRIPT                                                │
│  📁 ./auto                                                  │
│                                                             │
│  1️⃣ Calls: bun run dev:cli dispatch <taskId> --mode auto   │
│  2️⃣ --exec detached                                        │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  DISPATCH COMMAND                                           │
│  📁 src/cli/commands/dispatch-commands.ts:84-88            │
│                                                             │
│  1️⃣ ✅ Resolves environment correctly                        │
│  2️⃣ ✅ Gets envInfo.path = worktree path                    │
│  3️⃣ ✅ Prints "Working in: {envInfo.path}"                 │
│  4️⃣ ✅ Passes worktree info to executeAutonomousTask       │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  EXECUTE AUTONOMOUS TASK                                    │
│  📁 src/integrations/channelcoder/helpers.ts:72            │
│                                                             │
│  1️⃣ ✅ Receives worktree option correctly                   │
│  2️⃣ ✅ Passes through: worktree: options.worktree          │
│  3️⃣ ✅ Calls execute(promptOrFile, enhancedOptions)        │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  CLIENT EXECUTE FUNCTION                                    │
│  📁 src/integrations/channelcoder/client.ts:70             │
│                                                             │
│  1️⃣ ✅ Receives worktree option in options parameter       │
│  2️⃣ ✅ Creates session correctly                           │
│  3️⃣ 🔥 PROBLEM: Calls s.claude(promptOrFile, options)      │
│     → Still in MAIN directory (/scopecraft-v2)            │
│     → ChannelCoder gets worktree info but can't change     │
│       the Node.js process working directory               │
│  4️⃣ 💥 Claude executes in main, modifies main branch      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  CHANNELCODER EXECUTION                                     │
│  📁 External: channelcoder package                         │
│                                                             │
│  1️⃣ ❌ Receives worktree option but ignores it             │
│  2️⃣ ❌ Spawns Claude in current directory (main)           │
│  3️⃣ ❌ All file operations happen on main branch           │
│  4️⃣ ❌ Shows "Working in: worktree" but actually in main   │
└─────────────────────────────────────────────────────────────┘

🔍 COMPARISON: TMux Mode (WORKING CORRECTLY)
┌─────────────────────────────────────────────────────────────┐
│  TMUX EXECUTION                                             │
│  📁 src/integrations/channelcoder/client.ts:159            │
│                                                             │
│  1️⃣ ✅ createTmuxWindow(windowName, options.worktree)       │
│  2️⃣ ✅ Uses spawn with '-c workingDir' flag                │
│  3️⃣ ✅ Command includes cd "${options.worktree}"           │
│  4️⃣ ✅ Claude actually executes IN the worktree            │
└─────────────────────────────────────────────────────────────┘
```

### Root Cause Details

**Exact Issue**: Line 70 in `src/integrations/channelcoder/client.ts`
```typescript
const result = await s.claude(promptOrFile, options);
```

**Why This Fails**:
1. The `options` parameter contains the worktree info
2. But the `claude()` call happens from the current Node.js process
3. Current working directory is `/Users/davidpaquet/Projects/scopecraft-v2` (main)
4. ChannelCoder cannot change the working directory of an already-running process
5. Even though worktree option is passed, execution stays in main directory

**Why TMux Works**:
1. TMux spawns a NEW process with explicit working directory: `spawn('tmux', ['new-window', '-n', windowName, '-c', workingDir])`
2. The `-c` flag sets the initial working directory to the worktree
3. Commands are sent to that tmux session running IN the worktree

### Bug Classification

**Answer**: This is a **Scopecraft bug**, not a ChannelCoder bug.

**Reasoning**:
- ChannelCoder correctly accepts the worktree option
- The issue is in our integration - we need to handle directory change before calling ChannelCoder
- TMux mode shows the correct pattern: explicitly manage working directory

### Recommended Fix

Modify `src/integrations/channelcoder/client.ts` to handle working directory change for detached mode:

```typescript
// For detached execution with worktree, spawn a new process
if (options.detached && options.worktree?.path) {
  // Similar to tmux approach but for detached mode
  return await spawnDetachedInWorktree(promptOrFile, options);
}
```

Or modify the approach to spawn ChannelCoder as a subprocess with explicit working directory, similar to how tmux mode works.

### Validation Steps

1. **Reproduce**: Run `./auto <taskId> <parentId>` and verify files are modified in main
2. **Test Fix**: After implementing fix, verify files are modified in worktree
3. **Verify Isolation**: Confirm main branch remains unchanged during worktree execution

## Log
- 2025-06-09: === AUTONOMOUS EXECUTION STARTED ===
- Task: invstgte-work-excton-prpgton-06A
- Analysis: type:bug, area:core, tags:['critical-bug', 'root-cause-analysis'], priority:highest
- Selected Mode: Diagnosis (Root Cause Analysis)
- Reasoning: Bug type + explicit root-cause-analysis tag + task references RCA methodology
- Loading: .claude/commands/root_cause.md methodology
- Approach: Systematic RCA with ASCII flow diagrams and exact failure point identification
- 2025-06-09: 🔥 ROOT CAUSE IDENTIFIED!
- Problem: Detached execution doesn't change working directory to worktree
- Unlike tmux mode which explicitly uses 'cd' and '-c' flag, detached mode passes worktree option but stays in main directory
- ChannelCoder receives worktree info but can't change process working directory after spawn
- File: src/integrations/channelcoder/client.ts:70 - claude() called from main directory
- Comparison: tmux implementation (lines 142-176) handles worktree correctly with explicit cd
- 2025-06-09: === EXECUTION COMPLETE ===
- Mode Used: Diagnosis (Root Cause Analysis)
- Status: COMPLETED
- Deliverable: READY
- Questions: None - clear root cause identified
- Follow-up: Implementation needed in client.ts to spawn detached processes with explicit working directory
- Key Finding: Scopecraft bug, not ChannelCoder - detached mode needs directory change like tmux mode
- Validation: TMux mode works correctly as comparison point
- All investigation todos completed successfully
- 2025-06-10: 2025-06-09 20:55: ✅ **INVESTIGATION RESOLVED - CHANNELCODER 2.8.3 FIX CONFIRMED**
     - Previous analysis identified bug in Scopecraft code (client.ts:70)
     - BUT: channelcoder team released 2.8.3 with context propagation fix
     - ✅ VALIDATION: Test dispatch successful with worktree isolation
     - ✅ Test: fix-chn-com-syn-in-atn-mon-ui-06A executed in worktree branch
     - ✅ Confirmed: Changes isolated from main branch
     - ✅ Working directory propagation now functional
     - **RESOLUTION**: ChannelCoder fix worked, investigation complete
     - Task Status: Can be moved to archive - bug resolved externally
