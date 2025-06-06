# Suggested Commands for Development

## Core Development Commands

### Running the Application
```bash
# CLI (development mode - no compilation needed)
bun run dev:cli <command>

# MCP Server
bun run dev:mcp              # HTTP/SSE mode
bun run dev:mcp:stdio        # STDIO mode

# Web UI
bun run ui:dev               # Full stack dev mode
bun run ui:dev:api           # API server only
bun run ui:dev:ui            # UI only
```

### Task Management (Dogfooding)
```bash
# List tasks
bun run dev:cli task list --current
bun run dev:cli task list --backlog
bun run dev:cli parent list

# Task operations
bun run dev:cli task start <task-id>
bun run dev:cli task complete <task-id>
bun run dev:cli task block <task-id>
bun run dev:cli task create --title "Fix bug" --type bug

# Parent task operations
bun run dev:cli parent show <parent-id> --tree
bun run dev:cli parent create --title "New Feature" --type feature
bun run dev:cli parent add-subtask <parent-id> --title "Subtask"
```

### Code Quality
```bash
# MUST run before committing
bun run code-check

# Individual checks
bun run lint                 # Biome linting
bun run format              # Check formatting
bun run format:fix          # Fix formatting
bun run typecheck           # TypeScript checking
bun run security-check      # Security scan
```

### Testing
```bash
bun test                    # Run all tests
bun run test:api           # API tests only
```

### Building & Release
```bash
bun run build              # Build for distribution
bun run release:dry        # Dry run release
bun run release:run        # Execute release
bun run install:local      # Install locally for testing
```

### Storybook
```bash
bun run storybook          # Start Storybook dev server
bun run build-storybook    # Build static Storybook
```

### Git Worktree Commands
```bash
bun run tw-start <task-id>      # Start work on task
bun run tw-finish              # Finish current task
bun run tw-list                # List worktrees
bun run tw-feat-start <name>   # Start feature worktree
```

## System Commands (Darwin/macOS)

### Git Operations
```bash
gh pr create                    # Create pull request
gh pr list                      # List pull requests
gh issue create                 # Create issue
git status                      # Check status
git diff                        # View changes
```

### File System
```bash
ls -la                         # List files with details
find . -name "*.ts"            # Find TypeScript files
rg "pattern"                   # Search with ripgrep (faster than grep)
```

### Process Management
```bash
lsof -i :3500                  # Check port usage
ps aux | grep node             # Find node processes
kill -9 <pid>                  # Force kill process
```

## Environment Setup
- Use Fish shell (user preference)
- Bun is the preferred package manager
- Use `gh` CLI for GitHub operations
- Ripgrep (`rg`) installed for fast searching