# Task Completion Checklist

## Before Committing Code

### 1. Run Code Quality Checks
```bash
bun run code-check
```
This command will:
- Auto-detect whether to check staged or changed files
- Run Biome linting on the appropriate files
- Run TypeScript type checking on the full project
- Report results in a clear format

Options:
- `--staged`: Check only staged files
- `--changed`: Check only changed files
- `--all`: Check all files
- `--format=json`: Output results in JSON format

### 2. Run Tests (if applicable)
```bash
bun test
```

### 3. Update Task Status
When working on a task:
```bash
# Mark task as complete when done
bun run dev:cli task complete <task-id>

# Update the task log section with changes made
bun run dev:cli task get <task-id> --format full
# Then manually edit to add log entry like:
# - 2025-05-28: Implemented feature X
```

### 4. Verify Build
For distribution changes:
```bash
bun run build
```

## Important Notes
- The build will FAIL if code-check doesn't pass
- Always update task logs with significant changes
- Use `bun run dev:cli` for immediate changes (no compilation needed)
- Never commit without running code-check first