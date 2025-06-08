# Implement env command

---
type: feature
status: todo
area: cli
tags:
  - environment
  - cli
  - command
  - typescript
  - worktree
---


## Instruction
Implement the `env` command for managing development environments (worktrees). This command provides direct control over worktree creation, listing, and cleanup.

## Command Structure

```bash
sc env <taskId>              # Create/switch to environment
sc env list                  # List active environments  
sc env close <taskId>        # Close environment and cleanup
sc env path <taskId>         # Output path for shell integration
```

## Implementation Requirements

1. **Command Registration** (`src/cli/entity-commands.ts`)
   - Add `setupEnvironmentCommands` function
   - Register main command and subcommands
   - Follow existing command patterns

2. **Command Handlers** (`src/cli/commands/env-commands.ts`)
   - `handleEnvCreateCommand`: Create/switch to worktree
   - `handleEnvListCommand`: Show active worktrees
   - `handleEnvCloseCommand`: Remove worktree safely
   - `handleEnvPathCommand`: Output path for shell scripts

3. **Integration with Core Utilities**
   - Use EnvironmentResolver from Phase 3 utilities
   - Use WorktreeManager for git operations
   - Respect centralized path resolution

4. **User Experience**
   - Clear success/error messages
   - Helpful hints (e.g., "cd to path" after create)
   - Show branch status before closing
   - Prevent accidental data loss

## Technical Details

- Use Zod for input validation
- Handle parent/subtask logic via EnvironmentResolver
- Output formats suitable for shell integration
- Follow existing CLI error handling patterns

## Tasks
- [ ] Create env-commands.ts with command handlers
- [ ] Update entity-commands.ts to register env command
- [ ] Implement create/switch handler with environment resolution
- [ ] Implement list handler with formatted output
- [ ] Implement close handler with safety checks
- [ ] Implement path handler for shell integration
- [ ] Add Zod schemas for command validation
- [ ] Handle edge cases (missing task, existing worktree)
- [ ] Add integration tests for all subcommands
- [ ] Update CLI help text

## Deliverable
Fully functional `env` command that:
- Creates worktrees for any task (handles parent/subtask logic)
- Lists active environments with clear formatting
- Safely closes environments with status checks
- Provides path output for shell integration
- Clear error messages and user guidance
- Integration tests covering all scenarios
- Updated CLI documentation

## Log
