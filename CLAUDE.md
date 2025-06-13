# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scopecraft is a task management system designed for human-AI collaboration. It manages work as markdown files with YAML frontmatter, providing both CLI and MCP interfaces for task operations.

Key characteristics:
- Tasks are units of work with full context for AI execution
- Everything is markdown: tasks, knowledge, documentation
- Centralized storage prevents git conflicts across worktrees
- Workflow-based organization (backlog → current → archive)
- Parent tasks organize complex work with subtasks

## Storage Architecture

**Important**: Scopecraft uses centralized storage for tasks:
- Tasks are stored in `~/.scopecraft/projects/{encoded-path}/tasks/`
- Templates and modes are stored in `.tasks/` within the repository
- This prevents git conflicts and allows sharing tasks across worktrees

When working with tasks:
- Use the CLI commands - they handle the correct paths automatically
- Don't manually create files in `.tasks/` directories
- The centralized storage is transparent to users

## IMPORTANT: Dogfooding Our Own Tools

**We MUST use our own tools to manage tasks in this project!**  Use scopecraft MCP tools.

## Memories

- When creating tasks for testing purposes, always create them in a TEST workflow location or with test- prefix
- Always mark tasks as "In Progress" when starting work
- Create bug/chore tasks immediately when issues are discovered
- Use parent tasks for any work that has 3+ subtasks
- **Always update the Log section** of tasks when making significant changes or completing work
- Log entries should include date and brief description: `- 2025-05-28: Implemented feature X`
- Use bun commands, never npm commands
- If you create github issues, the only label available are cli, core, mcp, ui and bug or enhancement for the type
- Save work documents (TRD, PRD) that are mostly useful while delivering a task in work-docs/{parentTaskID}/  The /docs/ folder is for permanent documentation, documentation that is always useful. if we put too many implementation details in docs, it become harder to keep up to date and the code can be the reference anyway.
- NEVER save anything at the root of the folder, unless being an explicit request is made, OR it's the only place that this thing can be saved at.

## Code Quality Checks

BEFORE committing any code changes, you MUST run:

```bash
bun run code-check
```

This command will:
1. Auto-detect whether to check staged or changed files
2. Run Biome on the appropriate files
3. Run TypeScript check on the full project (to catch cross-file issues)
4. Report results in a clear format

Options:
- `--staged`: Check only staged files
- `--changed`: Check only changed files
- `--all`: Check all files
- `--format=json`: Output results in JSON format

The build will FAIL if these checks don't pass.

## Documentation

Comprehensive documentation is available in the `/docs` folder, organized for easy navigation:

### Documentation Structure

```
docs/
├── 00-overview/      # Start here - what is Scopecraft
├── 01-concepts/      # Core concepts (tasks, knowledge, feedback)
├── 02-architecture/  # System design and architecture
├── 03-guides/        # How-to guides for users/developers
├── 04-reference/     # API and CLI reference
├── 05-development/   # Contributing and development
└── 06-decisions/     # Architectural decisions (ADRs)
```

### Key Documents for AI Understanding

1. **[System Architecture](docs/02-architecture/system-architecture.md)** - Complete view of how Scopecraft works as a system (process + practices + tooling)
2. **[Philosophy](docs/01-concepts/philosophy.md)** - Unix philosophy and core principles
3. **[Feedback Loops](docs/01-concepts/feedback-loops.md)** - How feedback and questions work as first-class features
4. **[Service Architecture](docs/02-architecture/service-architecture.md)** - Service boundaries and interactions
5. **[Orchestration Architecture](docs/02-architecture/orchestration-architecture.md)** - AI session coordination and automation

### Why This Documentation Exists

The `/docs` folder was created to:
- Provide a clear, navigable structure for understanding Scopecraft
- Separate stable documentation from evolving code
- Enable progressive disclosure (start simple, dive deep as needed)
- Support multiple audiences (users, developers, AI agents)
- Track documentation versions and status

All documents include frontmatter with version, status, and relationships to help navigate the documentation effectively.