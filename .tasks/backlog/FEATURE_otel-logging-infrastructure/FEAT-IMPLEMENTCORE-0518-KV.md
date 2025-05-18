+++
id = "FEAT-IMPLEMENTCORE-0518-KV"
title = "Implement Core OTEL Infrastructure"
type = "implementation"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-18"
updated_date = "2025-05-18"
assigned_to = ""
phase = "backlog"
parent_task = "otel-logging-infrastructure"
previous_task = "RESEARCH-RESEARCHOTEL-0518-F5"
tags = [ "AREA:core", "implementation", "otel" ]
next_task = "FEAT-MIGRATECLI-0518-3V"
subdirectory = "FEATURE_otel-logging-infrastructure"
+++

# Implement Core OTEL Infrastructure

## Objective
Build the core OpenTelemetry logging infrastructure based on research findings, providing a unified logging solution for all modules.

## Implementation Tasks

### 1. Project Setup
- [ ] Create `src/core/observability/` directory structure
- [ ] Add OTEL dependencies to package.json
- [ ] Set up TypeScript types for OTEL

### 2. Provider Configuration
- [ ] Implement LoggerProvider with service resource
- [ ] Configure environment-based settings
- [ ] Set up diagnostic logging for development
- [ ] Create provider singleton pattern

### 3. Module Logger Factory
- [ ] Implement `getLogger(moduleName)` function
- [ ] Create module namespace conventions
- [ ] Add logger caching for performance
- [ ] Support logger configuration per module

### 4. Exporters Implementation
- [ ] Set up ConsoleLogRecordExporter for development
- [ ] Implement rotating file exporter
- [ ] Configure batch processors for efficiency
- [ ] Add exporter selection based on environment

### 5. Configuration System
- [ ] Create configuration schema with Zod
- [ ] Support environment variables
- [ ] Implement default configurations
- [ ] Add configuration validation

### 6. Testing
- [ ] Unit tests for logger factory
- [ ] Integration tests for exporters
- [ ] Performance benchmarks
- [ ] Configuration tests

## Code Structure

```typescript
// src/core/observability/index.ts
export { getLogger } from './logger-factory';
export { configureLogging } from './configuration';

// src/core/observability/logger-factory.ts
export function getLogger(moduleName: string): Logger;

// src/core/observability/configuration.ts
export interface LoggingConfig {
  level: LogLevel;
  exporters: ExporterConfig[];
  // ...
}

// src/core/observability/exporters/file.ts
export class RotatingFileExporter implements LogRecordExporter;
```

## Acceptance Criteria

- [ ] OTEL SDK properly initialized with provider
- [ ] Module-specific loggers with namespaces
- [ ] Console and file exporters working
- [ ] Environment-based configuration
- [ ] All tests passing
- [ ] Performance under 5ms per log call
- [ ] No breaking changes to existing code

## Dependencies
- Depends on: RESEARCH-RESEARCHOTEL-0518-F5 (research findings)
- Blocks: All migration tasks

## Technical Notes
- Follow the pragmatic OTEL guide from research
- Use existing task-ui OTEL code as reference
- Ensure Bun.js compatibility throughout
- Maintain backward compatibility during development

## Links to Context
- **Original Proposal**: TASK-FEATUREPROPOSAL-0518-CZ
- Feature: OpenTelemetry Logging Infrastructure for All Modules
