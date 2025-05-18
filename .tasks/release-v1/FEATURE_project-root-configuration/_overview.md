+++
id = "_overview"
title = "Enable Project Root Configuration for AI IDE Support"
type = "🌟 Feature"
status = "🟡 To Do"
created_date = "2025-05-18"
updated_date = "2025-05-18"
phase = "release-v1"
subdirectory = "FEATURE_project-root-configuration"
is_overview = true
assigned_to = ""
+++

# Feature: Enable Project Root Configuration for AI IDE Support

## Problem Statement
Scopecraft is completely unusable in AI IDEs other than Claude Code (Cursor, Claude Desktop, etc.) because MCP servers are spawned from the application location rather than the project directory. This blocks 50% of beta testers and limits development to a single IDE.

## User Story
As a developer using Cursor or other AI IDEs, I want to be able to use Scopecraft by configuring the project root directory, so I can manage my tasks effectively regardless of my IDE choice.

## Proposed Solution
Implement a flexible root directory override system that accepts project path configuration through multiple methods with clear precedence order. Start with CLI parameters and an init_root command, building a foundation for future worktree support and multi-project workflows.

## Goals & Non-Goals

### Goals
- Enable Scopecraft to work in all major AI IDEs (Cursor, Claude Desktop, etc.)
- Support multiple configuration methods with clear precedence
- Provide multi-project support from day one
- Maintain backward compatibility with existing functionality
- Create foundation for future worktree management

### Non-Goals
- Full worktree management UI (future enhancement)
- Automatic project switching based on context
- Claude Desktop project confusion resolution (lower priority)
- Complex project discovery mechanisms

## Technical Breakdown

### Research/Spike Tasks
1. Research MCP client behaviors and configuration capabilities
2. Investigate how different AI IDEs handle MCP server spawning

### Core Implementation
1. Design and implement core configuration system with precedence logic
2. Add root directory validation and error handling

### MCP Implementation
1. Implement init_root command for runtime configuration
2. Add per-request root override support (if protocol allows)

### CLI Implementation
1. Add --root-dir parameter support to MCP server startup
2. Implement config file parsing for project registry

### Documentation & Testing
1. Create comprehensive documentation for configuration methods
2. Implement tests for all configuration scenarios

## Risks & Dependencies
- Different MCP clients may have varying configuration capabilities
- Need to research specific behaviors of Cursor and Claude Desktop
- MCP protocol limitations for per-request overrides
- Unknown edge cases with different AI IDE integrations

## Success Criteria
- Scopecraft works successfully in Cursor
- Functions in at least one other AI IDE beyond Claude Code
- Can switch between multiple projects in same session
- All beta testers can use the tool
- Clear documentation on all configuration methods
- No breaking changes to existing functionality

## Task Flow
Research → Core Design → Core Implementation → MCP/CLI Implementation (parallel) → Testing → Documentation

## Human Review Required
Planning decisions to verify:
- [ ] Correct complexity assessment for the feature
- [ ] Appropriate task granularity for AI sessions
- [ ] Sequential dependencies identified correctly
- [ ] Original proposal properly converted to feature

Technical assumptions:
- [ ] MCP protocol can support per-request overrides
- [ ] Different AI IDE behaviors are researchable
- [ ] Config file approach is appropriate for multi-project support
