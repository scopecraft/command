---
type: feature
status: To Do
priority: High
assignee: ""
tags: ["opentelemetry", "sdk", "integration"]
area: core
created: 2025-06-11
parent: otel-event-sourcing
---

# Implement OpenTelemetry SDK Integration

## Instruction

Set up OpenTelemetry SDK integration with custom exporters that write to Scopecraft's file-based event store. This task establishes the foundation for collecting traces, metrics, and logs while maintaining the Unix philosophy of file-based storage.

Key requirements:
1. Optional dependency - core functionality works without OTel
2. Custom exporters write to JSONL files
3. Proper resource attribution and semantic conventions
4. Configuration system for telemetry levels
5. Performance-conscious implementation

## Tasks

- [ ] Add OpenTelemetry SDK dependencies (optional)
- [ ] Create custom span exporter for event store
- [ ] Create custom metrics exporter for event store  
- [ ] Implement OTel SDK initialization with resource detection
- [ ] Add configuration for telemetry levels and sampling
- [ ] Create semantic conventions for Scopecraft operations
- [ ] Add graceful fallback when OTel is disabled
- [ ] Write unit tests for custom exporters

## Deliverable

Working OpenTelemetry integration that:
- Exports spans and metrics to JSONL files
- Uses Scopecraft-specific semantic conventions
- Supports configurable sampling and filtering
- Gracefully handles disabled telemetry
- Includes comprehensive test coverage

## Log

- 2025-06-11: Task created as part of OTel event sourcing integration