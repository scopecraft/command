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

## Release Pre-flight Checks

The project includes a comprehensive pre-flight check system used by the release automation:

```bash
# Run complete pre-flight checks (used in release process)
bun run precheck
```

This runs three essential checks:

### 1. Code Quality Check
- **Command**: `bun run code-check`
- **Purpose**: Linting, formatting, and TypeScript validation
- **Coverage**: All staged/changed files + full TypeScript check

### 2. Security Check
- **Command**: `bun scripts/security-check.ts`
- **Purpose**: Vulnerability scanning and secret detection
- **Tools**: 
  - OSV Scanner (Google's dependency vulnerability scanner)
  - Secretlint (secret detection in source code)
  - Custom security pattern analysis
- **Requirements**: Docker must be installed and running
- **Coverage**: Dependencies, source files, and configuration

### 3. Unit Tests
- **Command**: `bun test`
- **Purpose**: Verify functionality and prevent regressions
- **Coverage**: All test files in the project

## Security Checks

The security check script (`scripts/security-check.ts`) provides comprehensive security scanning:

```bash
# Run security checks independently
bun run security-check

# Get JSON output for CI/tooling (direct script call needed for args)
bun scripts/security-check.ts --format=json

# Show help and requirements
bun scripts/security-check.ts --help
```

### Security Tools

1. **OSV Scanner**: Google's open-source dependency vulnerability scanner
   - Runs via Docker: `ghcr.io/google/osv-scanner:latest`
   - Scans for known vulnerabilities in dependencies
   - No local installation required

2. **Secretlint**: Secret detection in source code
   - Runs via Docker: `secretlint/secretlint:latest`
   - Scans for accidentally committed secrets
   - Checks source files, scripts, and configuration

3. **Custom Security Patterns**: Project-specific security checks
   - Detects potential `eval()` usage
   - Identifies suspicious credential patterns
   - Flags potential secret logging
   - Finds suspicious admin URLs

### Security Prerequisites

- **Docker**: Must be installed and running
- **Internet Access**: Required for pulling security scanner images
- **File Permissions**: Docker needs access to project directory

### Security Exemptions

Add comments to bypass specific security checks:

```typescript
// Security exemptions (use sparingly)
eval(code); // security-ok - justified usage
console.log("secret status"); // log-ok - not actually a secret
const testUrl = "https://api.admin.example.com"; // url-ok - documentation
```

## For Claude Code Sessions

When using Claude Code, always run quality checks before committing:

```bash
# Quick check during development
bun run code-check

# Full pre-flight check before releases
bun run precheck
```

This is documented in `CLAUDE.md` for the AI assistant's reference.