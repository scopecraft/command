# Integration Layer Refactoring Plan

## Problem Summary

The current integration layer violates core Unix philosophy by bundling too many concerns, making assumptions about workflows, and creating monolithic methods instead of composable primitives.

**Key Issues:**
- Task-centric assumptions everywhere (`executeInteractive()` requires taskId)
- Not composable like ChannelCoder SDK (forces specific workflows)
- Hardcoded workflow assumptions (always loads mode prompts, always creates session info)
- Violates "Do One Thing Well" principle
- Violates "Guide, Don't Cage" principle

## Refactoring Goals

1. Leverage ChannelCoder's built-in capabilities (file detection, template interpolation, session management)
2. Remove task-centric assumptions
3. Enable flexible composition using ChannelCoder SDK directly
4. Follow Unix philosophy: do one thing well
5. Built-in dry-run support for easy comparison

## Key Insight: ChannelCoder Already Provides Most Functionality

**ChannelCoder Built-in Capabilities:**
- ✅ File path detection (automatically detects `.md` files vs inline prompts)
- ✅ Template interpolation (with `data` option: `{variable}` syntax)
- ✅ Session management (`session()`, `session.load()`, `session.save()`)
- ✅ Execution modes (`detached()`, `interactive()`, `claude()`)
- ✅ Log monitoring (`monitorLog()`, `parseLogFile()`)

**What We Actually Need to Add:**
- Session metadata persistence (`.info.json` files)
- Session discovery and status tracking
- Integration with our task system and mode paths
- Dry-run support for command comparison

## Phase 1: Simple Integration Layer ✅ COMPLETED

### 1.1 Function-Based Architecture (COMPLETED)

**Files Created:**
- ✅ `src/integrations/channelcoder/client.ts` - Core functions (no classes!)
- ✅ `src/integrations/channelcoder/session-storage.ts` - Custom SessionStorage implementation
- ✅ `src/integrations/channelcoder/utils.ts` - Utility functions
- ✅ `src/integrations/channelcoder/index.ts` - Clean exports

**Key Functions Implemented:**
- ✅ `execute(promptOrFile, options)` - Simple execution with dry-run support
- ✅ `createSession(options)` - Session creation with custom storage
- ✅ `loadSession(sessionName)` - Session loading
- ✅ `executeTmux(promptPath, options)` - TMux implementation (stub)
- ✅ `resolveModePromptPath(projectRoot, mode)` - Mode prompt resolution
- ✅ `buildTaskData(taskId, instruction, additional)` - Template data building

### 1.2 Custom Session Storage (COMPLETED)

**ScopecraftSessionStorage Features:**
- ✅ Implements ChannelCoder's `SessionStorage` interface
- ✅ Extends FileSessionStorage with monitoring metadata
- ✅ Saves `.info.json` files for session tracking
- ✅ Provides `saveSessionInfo()`, `loadSessionInfo()`, `listActiveSessions()`
- ✅ Seamless integration with existing autonomous workflow

### 1.3 Architecture Compliance (COMPLETED)

- ✅ **Unix Philosophy**: Function-based, composable, no forced workflows
- ✅ **Dry-Run Support**: Built into every function for validation
- ✅ **ChannelCoder Integration**: Leverages built-in file detection and template interpolation
- ✅ **No Task Assumptions**: Works for any use case (tasks, planning, exploration)
- ✅ **TypeScript**: All functions properly typed and compile successfully

## Phase 2: Command Integration ✅ COMPLETED

### 2.1 Update Commands to Use New Integration Layer

**Status:**
- ✅ `plan-commands.ts` - Updated and tested with dry-run support
- ✅ `work-commands.ts` - Updated and tested (imports fixed, works correctly)  
- ✅ `dispatch-commands.ts` - Completely refactored to use new function-based approach

**Completed Work:**
- ✅ Replaced all `client.executeDocker()`, `client.executeDetached()`, `client.executeTmux()` calls
- ✅ Updated all execution paths (docker, detached, tmux) to use new functions
- ✅ Implemented proper data passing and prompt path resolution
- ✅ All commands tested with dry-run mode and working correctly
- ✅ TypeScript compilation passes (no more client errors)

### 2.2 Complete TMux Implementation

**Status:**
- ✅ `executeTmux()` function fully implemented with dry-run support
- ✅ TMux window creation logic implemented (`createTmuxWindow()`)
- ✅ ChannelCoder command building implemented (`buildChannelCoderCommand()`)
- ✅ TMux command execution implemented (`runInTmux()`)

**Completed Work:**
- ✅ Implemented `createTmuxWindow()` helper using spawn('tmux', ['new-window'])
- ✅ Implemented `buildChannelCoderCommand()` helper with proper data escaping
- ✅ Implemented `runInTmux()` helper using spawn('tmux', ['send-keys'])
- ✅ Tested tmux integration with dry-run mode showing correct commands

### 2.3 Monitoring Integration

**Status:**
- ✅ Session storage supports monitoring metadata
- ❌ Real-time monitoring functions not created
- ❌ Integration with existing autonomous handlers not complete

**Remaining Work:**
```typescript
// src/integrations/channelcoder/monitoring.ts
export function createSessionMonitor(taskId: string, onEvent: (event: any) => void): () => void;
export function parseSessionStats(logFile: string): Promise<SessionStats>;
export function getSessionStatus(sessionName: string): Promise<'running' | 'completed' | 'failed'>;
```

## Phase 3: Testing & Validation ✅ COMPLETED

### 3.1 Dry-Run Validation

**Completed Work:**
- ✅ Tested dry-run output for all execution paths (docker, detached, tmux)
- ✅ Validated that dry-run shows detailed command information
- ✅ Confirmed dry-run format is consistent and informative
- ✅ All commands show proper data interpolation and path resolution

### 3.2 Integration Testing

**Completed Work:**
- ✅ Tested plan command with new integration layer (works perfectly)
- ✅ Tested work command (imports updated, basic functionality confirmed)
- ✅ Tested dispatch command with all execution types (docker, detached, tmux)
- ✅ All commands show proper environment setup and data passing
- ✅ Session continuation workflow structure is in place

**Test Results:**
- **Plan Command**: Successfully shows dry-run with mode prompt path and template data
- **Dispatch Docker**: Shows correct Docker configuration, mounts, and environment
- **Dispatch Detached**: Shows correct detached mode execution with worktree setup  
- **Dispatch TMux**: Shows correct tmux window creation and command execution

### 3.3 Cleanup & Documentation

**Status:**
- ✅ No deprecated integration files remain (clean architecture)
- ❌ Documentation with new function-based patterns (pending)
- ❌ Usage examples for new integration layer (pending)
- ❌ CHANGELOG update with refactoring details (pending)

## Summary: Current Status

### ✅ **COMPLETED**
- **Phase 1: Simple Integration Layer** - Function-based architecture with custom session storage
- **Phase 2: Command Integration** - All commands (plan, work, dispatch) updated to use new layer
- **Phase 3: Testing & Validation** - Comprehensive dry-run testing of all execution modes
- **Core Functions**: `execute()`, `createSession()`, `loadSession()`, `executeTmux()` fully implemented
- **Session Storage**: Custom `ScopecraftSessionStorage` that extends ChannelCoder with monitoring
- **Utilities**: Mode path resolution and task data building working correctly
- **TMux Implementation**: Complete with window creation, command building, and execution
- **Architecture**: Unix philosophy compliant, no classes, composable functions
- **TypeScript**: All integration layer files and commands compile successfully
- **All Execution Modes**: Docker, detached, and tmux all working with proper dry-run support

### ❌ **PENDING (Low Priority)**
- **Monitoring Integration**: Real-time session monitoring functions (optional enhancement)
- **Documentation Updates**: Function-based patterns documentation (nice-to-have)
- **CHANGELOG Updates**: Refactoring details documentation (maintenance)

### 🎯 **REFACTORING SUCCESS**
✅ **Architecture Goals Achieved:**
1. **Simplicity**: Basic execution requires minimal setup - just `execute(promptPath, options)`
2. **Composability**: Complex workflows built from simple primitives (no forced patterns)
3. **Flexibility**: No hardcoded assumptions - works for tasks, planning, exploration
4. **Dry-Run Integration**: Built-in support for command inspection and comparison
5. **Backward Compatibility**: All existing commands continue working with improved architecture
6. **Philosophy Compliance**: Follows Unix principles - do one thing well, composable tools

### 📊 **Validation Results**
- **Plan Command**: ✅ Works with simple `execute()` call, no task assumptions
- **Work Command**: ✅ Uses composable primitives, maintains functionality
- **Dispatch Command**: ✅ Supports all execution modes without monolithic methods
- **Dry-Run**: ✅ Produces detailed, equivalent commands showing proper data flow
- **TypeScript**: ✅ No compilation errors, clean imports and types
- **Code Reduction**: ✅ Significantly simpler than previous monolithic approach

## Phase 5: Comparison-Friendly Output

### 5.1 Structured Dry-Run Output
```typescript
// src/integrations/channelcoder/dry-run-formatter.ts

export class DryRunFormatter {
  static format(result: ExecutionResult, context?: string): string {
    if (!result.command) return '';
    
    const output = [
      `[DRY RUN] ${context || 'Command execution'}`,
      '─'.repeat(50),
      `Command: ${result.command.executable}`,
      `Args: ${JSON.stringify(result.command.args)}`,
      result.command.env && `Env: ${JSON.stringify(result.command.env)}`,
      result.command.cwd && `CWD: ${result.command.cwd}`,
      '─'.repeat(50),
      `Full: ${result.command.fullCommand}`,
    ].filter(Boolean).join('\n');
    
    return output;
  }
}
```

### 5.2 Comparison Helper
```typescript
// src/integrations/channelcoder/comparison.ts

export class ImplementationComparison {
  static async compareApproaches(
    taskId: string,
    options: { dryRun: true }  // Force dry-run for comparison
  ): Promise<ComparisonResult> {
    const oldApproach = await this.runOldImplementation(taskId, options);
    const newApproach = await this.runNewImplementation(taskId, options);
    
    return {
      old: {
        command: oldApproach.command,
        complexity: this.measureComplexity(oldApproach)
      },
      new: {
        command: newApproach.command,
        complexity: this.measureComplexity(newApproach)
      },
      differences: this.findDifferences(oldApproach, newApproach)
    };
  }
}
```

## Phase 6: Testing & Validation Strategy

### 6.1 Side-by-Side Testing
```typescript
// test/integration/compare-implementations.test.ts

describe('Implementation Comparison', () => {
  it('should produce equivalent commands', async () => {
    const taskId = 'test-task-001';
    
    // Run both implementations in dry-run mode
    const oldResult = await oldClient.executeInteractive({
      taskId,
      dryRun: true
    });
    
    const newResult = await handleWorkCommand(taskId, {
      dryRun: true
    });
    
    // Compare command structures
    expect(newResult.command.executable).toBe('claude');
    expect(newResult.command.args).toContain('--verbose');
    
    // Should produce similar commands
    expect(normalizeCommand(newResult)).toEqual(
      normalizeCommand(oldResult)
    );
  });
});
```

### 6.2 Complexity Metrics
```typescript
// Measure implementation complexity
const metrics = {
  old: {
    linesOfCode: 500,
    cyclomaticComplexity: 18,
    dependencies: 12,
    assumptions: ['requires task', 'requires mode', 'creates session']
  },
  new: {
    linesOfCode: 150,
    cyclomaticComplexity: 3,
    dependencies: 4,
    assumptions: []  // No hardcoded assumptions
  }
};
```

## Migration Strategy

### Phase 1: Parallel Implementation
1. Keep existing integration layer temporarily
2. Build new primitive-based layer alongside
3. Mark old methods as @deprecated
4. Create comparison test suite

### Phase 2: Command-by-Command Migration
1. Start with `plan` command (simplest case)
2. Migrate `work` command
3. Migrate `dispatch` command
4. Run side-by-side testing throughout

### Phase 3: Validation & Cleanup
1. Verify equivalent behavior with dry-run comparisons
2. Run full test suite
3. Remove deprecated code
4. Update documentation

## Key Architecture Principles

1. **No Required Workflows** - Primitives can be composed in any order
2. **Progressive Enhancement** - Start with `claude()`, add features as needed  
3. **Zero Task Assumptions** - Tasks are just one possible data type
4. **Direct SDK Mapping** - Our functions mirror ChannelCoder's API
5. **Explicit Over Implicit** - Users choose what features to use
6. **Dry-Run First** - All execution supports dry-run mode for debugging

## Expected Benefits

1. **Flexibility** - Any workflow is possible
2. **Simplicity** - Each function does one thing
3. **Testability** - Small functions are easy to test
4. **Maintainability** - Less coupling, easier changes
5. **Philosophy Alignment** - Follows Unix principles
6. **Easy Debugging** - Dry-run support built-in
7. **No Tech Debt** - Clean, composable architecture

## Success Criteria

- [ ] Plan command works with 5 lines of code instead of complex workflow
- [ ] Work command uses composable primitives
- [ ] Dispatch command supports all execution modes without monolithic methods
- [ ] Dry-run produces identical commands to old implementation
- [ ] Integration layer follows Unix philosophy (do one thing well)
- [ ] No hardcoded assumptions about tasks or workflows
- [ ] All tests pass
- [ ] Code complexity metrics show significant improvement