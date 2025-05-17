# Code Quality Guide

This project uses Biome for linting/formatting and TypeScript for type checking. We've created a unified command to run all quality checks.

## Quick Start

Run quality checks on your code:

```bash
# Auto-detect mode (checks staged files if any, otherwise changed files)
bun run code-check

# Check specific files
bun run code-check --staged   # Only staged files
bun run code-check --changed  # Only changed files  
bun run code-check --all      # All project files

# Get JSON output for tooling
bun run code-check --format=json
```

## How It Works

1. **Auto-detection**: By default, the script checks if you have staged files. If yes, it checks those. Otherwise, it checks changed files from your default branch.

2. **Biome**: Uses native VCS integration to check only the relevant files
   - `--staged`: Checks files in git staging area
   - `--changed`: Checks files changed from the default branch
   - `--all`: Checks all files

3. **TypeScript**: Always checks the full project to catch cross-file dependency errors

## Configuration

### Biome VCS Setup

The `biome.json` includes VCS configuration:

```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  }
}
```

### Package Scripts

Key scripts in `package.json`:

```json
{
  "scripts": {
    "check": "biome check .",
    "check:staged": "biome check --staged",
    "check:changed": "biome check --changed",
    "typecheck": "tsc --noEmit",
    "code-check": "bun scripts/code-check.ts",
    "ci": "bun run code-check --all && bun test"
  }
}
```

## Integration Points

### Build Process

Both root and tasks-ui builds now run quality checks:

```json
// tasks-ui/package.json
{
  "build": "bun run ../code-check --all && bun run check-imports && vite build",
  "deploy": "bun run ../code-check --all && bun run check-imports && bun run build && bun run start"
}
```

### CI Pipeline

The CI script runs full checks:

```json
{
  "ci": "bun run claude-check --all && bun test"
}
```

## Orchestrator Ready

This setup is designed to be orchestrator-friendly:

- Machine-readable JSON output
- Granular file targeting
- Proper exit codes
- Can be called programmatically

Future orchestrator can call:
```typescript
const result = await Bun.spawn(['bun', 'run', 'code-check', '--format=json']);
const report = JSON.parse(await result.stdout.text());
```

## Common Issues

1. **Biome staged files error**: If you get "No files were processed", ensure you have actually staged files
2. **TypeScript cross-file errors**: Even if checking staged files, TypeScript checks everything to catch dependency issues
3. **Performance**: TypeScript full check can be slow on large projects

## For Claude Code Sessions

When using Claude Code, always run `bun run code-check` before committing. This is documented in `CLAUDE.md` for the AI assistant's reference.