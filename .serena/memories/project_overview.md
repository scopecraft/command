# Scopecraft Command Project Overview

## Purpose
Scopecraft Command is a powerful command-line tool and MCP server for managing Markdown-Driven Task Management (MDTM) files. It helps organize tasks, features, and development workflows with a structured approach.

## Key Features
- Workflow-based task organization (backlog → current → archive)
- Parent tasks with subtask sequencing and parallel execution
- Supports MDTM format with TOML/YAML frontmatter
- Provides both CLI and MCP server interfaces
- Works with any AI IDE (Cursor, Claude Desktop, etc.)
- Multi-project support with easy switching
- Automated project type detection

## Project Structure
- `/src/core/` - Core business logic for task management
- `/src/cli/` - Command-line interface implementation
- `/src/mcp/` - Model Context Protocol server implementation
- `/tasks-ui/` - Web UI for task management
- `/docs/` - Comprehensive documentation
- `/scripts/` - Development and utility scripts
- `/test/` - Test files

## Development Philosophy
The system is designed to be versatile:
- Works both with and without Roo Commander
- Provides direct CRUD operations without requiring LLM processing
- Automatically detects project type and adapts accordingly
- Dogfoods its own tools for task management