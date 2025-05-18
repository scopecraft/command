+++
id = "FEAT-MIGRATECLI-0518-3V"
title = "Migrate CLI and Core Modules"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-18"
updated_date = "2025-05-18"
assigned_to = ""
phase = "backlog"
parent_task = "otel-logging-infrastructure"
previous_task = "FEAT-IMPLEMENTCORE-0518-KV"
tags = [ "AREA:cli", "AREA:core", "migration" ]
next_task = "FEAT-ADDMCP-0518-5R"
subdirectory = "FEATURE_otel-logging-infrastructure"
+++

# Migrate CLI and Core Modules

## Objective
Replace all console.* usage with OTEL loggers in CLI and core modules, establishing the pattern for module-specific logging with proper namespaces.

## Migration Tasks

### 1. CLI Module Migration
- [ ] Create CLI logger instance using `getLogger('cli')`
- [ ] Replace console.log with logger.info
- [ ] Replace console.error with logger.error
- [ ] Replace console.warn with logger.warn
- [ ] Add debug logging for verbose mode

### 2. Core Module Migration
- [ ] Identify all core modules needing migration
- [ ] Create logger instances per module
- [ ] Replace console.* calls systematically
- [ ] Add contextual attributes to logs
- [ ] Preserve existing log messages

### 3. Namespace Configuration
- [ ] Define naming convention for modules
- [ ] Create logger instances with proper names
- [ ] Document namespace hierarchy
- [ ] Verify namespace separation in logs

### 4. Testing
- [ ] Test all CLI commands with new logging
- [ ] Verify log output format
- [ ] Check log levels work correctly
- [ ] Ensure no console.* calls remain
- [ ] Performance testing

### 5. Configuration Integration
- [ ] Add CLI flags for log level control
- [ ] Support environment variables
- [ ] Document configuration options
- [ ] Test different configurations

## Migration Checklist

### CLI Commands to Migrate
- [ ] `cli.ts` main entry point
- [ ] `commands.ts` base commands
- [ ] `entity-commands.ts` entity operations
- [ ] `config-commands.ts` configuration
- [ ] `debug-command.ts` debug utilities

### Core Modules to Migrate
- [ ] `project-config.ts`
- [ ] `task-manager/*.ts`
- [ ] `template-manager.ts`
- [ ] `formatters.ts`
- [ ] `field-normalizers.ts`

## Code Examples

```typescript
// Before
console.log('Task created:', taskId);
console.error('Failed to create task:', error);

// After
const logger = getLogger('cli.task');
logger.info('Task created', { taskId });
logger.error('Failed to create task', { error });
```

## Acceptance Criteria

- [ ] All console.* calls replaced in CLI
- [ ] All console.* calls replaced in core
- [ ] Proper module namespaces used
- [ ] Log levels configurable via CLI
- [ ] No breaking changes to functionality
- [ ] All tests passing

## Dependencies
- Depends on: FEAT-IMPLEMENTCORE-0518-KV (core infrastructure)
- Blocks: MCP module migration

## Technical Notes
- Start with one CLI command as proof of concept
- Use automated search/replace where possible
- Add structured attributes for better context
- Maintain existing error handling behavior

## Links to Context
- **Original Proposal**: TASK-FEATUREPROPOSAL-0518-CZ
- Feature: OpenTelemetry Logging Infrastructure for All Modules
