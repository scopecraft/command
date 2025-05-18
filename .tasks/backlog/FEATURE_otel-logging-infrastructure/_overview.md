+++
id = "_overview"
title = "OpenTelemetry Logging Infrastructure for All Modules"
type = "feature"
status = "🟡 To Do"
created_date = "2025-05-18"
updated_date = "2025-05-18"
phase = "backlog"
subdirectory = "FEATURE_otel-logging-infrastructure"
is_overview = true
assigned_to = ""
tags = [ "Core", "logging", "otel" ]
+++

# Feature: OpenTelemetry Logging Infrastructure for All Modules

## Problem Statement
Logging is inconsistent across the codebase: task-ui uses a custom SimpleLogger, core/cli/mcp modules use console.*, and an incomplete OTEL implementation exists but isn't used. This makes debugging difficult and prevents unified error tracking across modules.

## User Story
As a developer working on Scopecraft Command, I want to have consistent, structured logging across all modules so that I can effectively debug issues, trace errors, and monitor system behavior in both development and production environments.

## Proposed Solution
Build a proper OpenTelemetry (OTEL) logging infrastructure in the core module following industry standards, then incrementally migrate all components to use it. This provides a standardized, future-proof logging solution with module separation and configurable verbosity.

## Goals & Non-Goals

### Goals
- Implement OTEL-based logging in `src/core/observability/`
- Provide module-specific logger instances with namespaces
- Support console and rotating file exporters
- Enable environment-based configuration
- Maintain backward compatibility during migration
- Create basic log viewer utility for development

### Non-Goals
- External log collectors or backends (Jaeger, etc.)
- Advanced distributed tracing
- Metrics collection (can be added later)
- Browser environment support (future enhancement)
- Complete removal of SimpleLogger (deferred)

## Technical Breakdown

### Tasks (6 total)

1. **Research OTEL Best Practices and Logging Patterns** (AREA:core)
   - Research current OTEL logging patterns for Node.js applications
   - Investigate rotating file exporters and community solutions
   - Analyze configuration patterns for multi-module systems
   - Document findings and recommendations

2. **Implement Core OTEL Infrastructure** (AREA:core)
   - Set up OTEL SDK in `src/core/observability/`
   - Implement provider configuration with environment support
   - Create module-specific logger factory (`getLogger`)
   - Add console and rotating file exporters
   - Unit test the infrastructure

3. **Build Log Viewer Utility** (AREA:core)
   - Create basic log viewer for development
   - Support file watching and tail functionality
   - Format log output for readability
   - Test with different log levels

4. **Migrate CLI and Core Modules** (AREA:cli, AREA:core)
   - Replace console.* with OTEL loggers in CLI
   - Update core modules to use new logging
   - Verify proper namespace separation
   - Test all CLI commands with new logging

5. **Add MCP Server Logging** (AREA:mcp)
   - Integrate OTEL with MCP server
   - Add request/response logging middleware
   - Handle error logging with context
   - Test MCP operations with new logging

6. **Documentation and Migration Guide** (AREA:documentation)
   - Write comprehensive setup guide
   - Document configuration options
   - Create migration guide for task-ui
   - Add examples for common patterns

## Task Flow Visualization

```
Research (F5) → Core Implementation (KV) → CLI/Core Migration (3V) → MCP Server (5R)
                     ↓
            Log Viewer Utility (MB) ⟶ Documentation (VP) ⟵
```

### Task Dependencies
- Research blocks all implementation
- Core implementation blocks all migrations
- Log viewer can be developed in parallel after research
- Documentation depends on all implementation tasks

## Migration Strategy

### Phase 1: Core Implementation
1. Build complete OTEL infrastructure
2. Test with simple CLI command
3. Verify performance meets criteria

### Phase 2: Incremental Migration
1. CLI commands (low risk, high value)
2. MCP server (critical for debugging)
3. Core modules (careful testing)
4. Task-UI (last, has working SimpleLogger)

### Phase 3: Optimization
1. Performance tuning
2. Configuration refinement
3. Documentation updates

## Risks & Dependencies

### Dependencies
1. Research task blocks implementation
2. Core infrastructure blocks all migrations
3. Log viewer enhances development experience

### Risks
- Performance impact in production
- Breaking changes during migration
- Bun compatibility issues
- Complex configuration management
- Learning curve for team

## Success Criteria
- [ ] All modules use unified OTEL interface
- [ ] Each module has distinct namespace
- [ ] Log levels configurable per environment
- [ ] File rotation prevents disk filling
- [ ] Zero breaking changes during migration
- [ ] Performance under 5ms per log
- [ ] Complete documentation exists

## Human Review Required

### Planning Decisions to Verify
- [ ] Task granularity (6 tasks vs potential for more)
- [ ] Area assignment appropriateness
- [ ] Migration order correctness
- [ ] Deferred browser support decision
- [ ] SimpleLogger retention strategy

### Technical Assumptions
- [ ] OTEL is the right choice for this project
- [ ] Rotating file logging sufficient for production
- [ ] Bun file APIs work with community exporters
- [ ] Module-level granularity is appropriate
- [ ] Performance criteria (5ms) is reasonable

### Open Questions from Proposal
- [ ] Should we maintain SimpleLogger compatibility layer?
- [ ] What default log levels per module?
- [ ] File rotation policies (size, count)?
- [ ] How to handle browser environment in the future?
- [ ] Migration timeline for each module?

## Links to Original Context
- **Original Proposal**: TASK-FEATUREPROPOSAL-0518-CZ - Feature Proposal: OpenTelemetry Logging Infrastructure for All Modules
- Created from initial brainstorming session about adapting existing OTEL implementation
- Based on pragmatic OTEL guide shared in brainstorming
