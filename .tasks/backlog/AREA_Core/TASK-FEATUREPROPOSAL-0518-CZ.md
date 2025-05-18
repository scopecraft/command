+++
id = "TASK-FEATUREPROPOSAL-0518-CZ"
title = "Feature Proposal: OpenTelemetry Logging Infrastructure for All Modules"
type = "proposal"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-18"
updated_date = "2025-05-18"
assigned_to = ""
phase = "backlog"
subdirectory = "AREA_Core"
tags = [ "proposal", "Core", "logging", "otel" ]
+++

# Feature Proposal: OpenTelemetry Logging Infrastructure for All Modules

## Problem Statement
Logging is inconsistent across the codebase: task-ui uses a custom SimpleLogger, core/cli/mcp modules use console.*, and an incomplete OTEL implementation exists but isn't used. This makes debugging difficult and prevents unified error tracking across modules.

## Proposed Solution
Build a proper OpenTelemetry (OTEL) logging infrastructure in the core module following industry standards, then incrementally migrate all components to use it. This provides a standardized, future-proof logging solution with module separation and configurable verbosity.

## Key Benefits
- Standardized logging across all project modules
- Better debugging capabilities with structured, contextual logs
- Future-proof solution that supports tracing and metrics expansion
- Module-specific logging with proper namespace separation
- Environment-based configuration for development and production

## Scope
### Included
- OTEL-based logging implementation in `src/core/observability/`
- Module-specific logger instances using namespaces
- Rotating file exporter with configurable size limits
- Console exporter for development
- Basic log viewer utility for local development
- Configuration support for different environments
- Incremental migration from console.* to OTEL

### Not Included
- External log collectors or backends (Jaeger, etc.)
- Advanced tracing implementation
- Metrics collection
- Complete removal of SimpleLogger (deferred)
- Browser-based log viewing UI

## Technical Approach
Follow the pragmatic OTEL guide to implement logging infrastructure in the core module. Use the existing partial OTEL implementation as reference but rebuild properly. Create module-specific loggers through a single provider instance. Maintain backward compatibility during migration.

Key implementation areas:
- `src/core/observability/` for the main implementation
- Module-specific loggers via `getLogger(moduleName)`
- Configuration through environment variables
- Rotating file support using community exporters

## Complexity Assessment
**Overall Complexity**: Medium

Factors:
- OTEL is well-documented with clear patterns
- Partial implementation exists as reference
- Incremental migration reduces risk  
- Main complexity in proper configuration
- Testing across all modules required
- Log viewer utility is straightforward

## Dependencies & Risks
- Requires OTEL SDK packages (already partially added)
- Bun compatibility for file operations
- Performance overhead in production (minimal if configured properly)
- Risk of breaking existing logging during migration
- Learning curve for OTEL patterns and best practices

## Open Questions
- Should we maintain SimpleLogger compatibility layer?
- What default log levels per module?
- File rotation policies (size, count)?
- How to handle browser environment in the future?
- Migration timeline for each module?

## Migration Strategy
1. Build complete OTEL implementation in core
2. Test with one CLI command as proof of concept
3. Migrate MCP server (high value target)
4. Migrate remaining core modules
5. Finally migrate task-ui from SimpleLogger

## Success Criteria
- All modules use unified OTEL logging interface
- Each module has distinct logger namespace
- Log levels configurable per environment
- File rotation works without filling disk
- Zero breaking changes during migration
- Performance impact under 5ms per log call
- Clear documentation for configuration

### Human Review Required
- [ ] Assumption: Current logging (SimpleLogger and console.*) is sufficient for short-term needs
- [ ] Assumption: Module separation at the logger level provides enough granularity
- [ ] Success criteria: Verify that rotating file logs with configurable size limits meet operational needs
- [ ] Assumption: Bun's file system APIs are sufficient for the rotating file exporter
- [ ] Technical approach: Confirm OTEL is the right choice over simpler alternatives
- [ ] Migration strategy: Validate the proposed order of module migration
