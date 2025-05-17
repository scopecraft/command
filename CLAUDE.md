# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scopecraft Command is a toolset for managing Markdown-Driven Task Management (MDTM) files with TOML or YAML frontmatter. It provides both a Command Line Interface (CLI) and a Model Context Protocol (MCP) server, both developed within this project.

The system is designed to be versatile:
- Works both with and without Roo Commander
- Automatically detects project type and adapts accordingly
- Supports the standardized MDTM format
- Provides direct CRUD operations without requiring LLM processing
- Offers the same core functionality through both CLI and MCP interfaces

## Memories

- When creating tasks for testing purpose, always created them in a TEST phase.

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

(Rest of the existing content remains the same)