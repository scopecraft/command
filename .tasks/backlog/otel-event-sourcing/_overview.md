---
type: feature
status: To Do
priority: High
assignee: ""
tags: ["observability", "telemetry", "event-sourcing", "otel", "metrics"]
area: core
created: 2025-06-11
---

# Implement OpenTelemetry Event Sourcing Integration

## Problem Statement

Scopecraft currently lacks comprehensive observability and telemetry capabilities. Without proper metrics collection, distributed tracing, and event tracking, it's difficult to:
- Monitor system performance and health
- Debug issues across worktrees and sessions
- Understand usage patterns and bottlenecks
- Provide operational insights for production deployments
- Track the success/failure rates of AI sessions

## User Story

As a Scopecraft user, I want comprehensive observability into system operations so that I can monitor performance, debug issues, and understand how the system is being used across different environments.

## Proposed Solution

Implement a hybrid OpenTelemetry (OTel) and Event Sourcing architecture that:
1. Uses OTel SDK for standardized telemetry collection (traces, metrics, logs)
2. Exports telemetry data to Scopecraft's file-based event store (JSONL)
3. Optionally exports to external observability backends (Jaeger, Prometheus, etc.)
4. Maintains Unix philosophy with file-based storage while providing modern telemetry capabilities

## Goals

- Implement OTel SDK integration for traces, metrics, and logs
- Create custom exporters that write to JSONL event store
- Instrument core Scopecraft operations (task CRUD, session lifecycle, worktree management)
- Provide CLI commands for viewing telemetry data
- Support optional export to external observability backends
- Maintain zero dependencies for core functionality (OTel is optional)

## Non-Goals

- Replace existing file-based architecture
- Require external databases or services for basic operation
- Add significant runtime overhead
- Make OTel mandatory for Scopecraft to function

## Technical Breakdown

### Area: Core
- [ ] **01_design-event-sourcing-architecture**: Design the event store interface and file-based implementation
- [ ] **02_implement-otel-sdk-integration**: Set up OTel SDK with custom exporters
- [ ] **03_create-domain-events-schema**: Define domain event types for Scopecraft operations
- [ ] **04_implement-event-store**: Build file-based event store with JSONL format

### Area: Instrumentation  
- [ ] **05_instrument-task-operations**: Add OTel spans to task CRUD operations
- [ ] **06_instrument-session-lifecycle**: Track session start/complete with telemetry
- [ ] **07_instrument-worktree-management**: Add telemetry to worktree operations
- [ ] **08_add-custom-metrics**: Implement business metrics (tasks/hour, success rates, etc.)

### Area: CLI
- [ ] **09_add-telemetry-cli-commands**: Commands to view events, metrics, traces
- [ ] **10_add-config-management**: Configuration for telemetry levels and exporters

### Area: MCP
- [ ] **11_add-mcp-telemetry-tools**: MCP tools for accessing telemetry data
- [ ] **12_instrument-mcp-operations**: Add telemetry to MCP server operations

### Area: Export
- [ ] **13_implement-otlp-exporter**: Optional export to external OTLP backends
- [ ] **14_add-prometheus-metrics**: Prometheus-compatible metrics export
- [ ] **15_add-jaeger-tracing**: Jaeger-compatible trace export

### Area: Docs
- [ ] **16_document-telemetry-architecture**: Document the telemetry system design
- [ ] **17_create-usage-examples**: Examples of viewing and analyzing telemetry data

## Dependencies

- OpenTelemetry SDK packages (optional dependency)
- Existing event sourcing architecture design (from brainstorming docs)
- Current task and session management systems

## Risks & Open Questions

- [ ] **Performance Impact**: OTel overhead on system performance
- [ ] **Storage Growth**: JSONL files growing large over time
- [ ] **Configuration Complexity**: Making OTel optional but still useful
- [ ] **Data Correlation**: Properly correlating events across async operations
- [ ] **Backwards Compatibility**: Ensuring existing functionality continues to work

## Success Criteria

- [ ] OTel instrumentation provides actionable insights into system behavior
- [ ] Telemetry data stored in human-readable JSONL format
- [ ] Zero performance impact when telemetry is disabled
- [ ] CLI commands allow easy querying of telemetry data
- [ ] Optional export to external backends works seamlessly
- [ ] All core Scopecraft operations properly instrumented
- [ ] Event sourcing enables system state reconstruction from events

## Implementation Notes

The implementation follows a hybrid approach:

1. **OTel for Collection**: Use industry-standard OTel SDK for instrumentation
2. **File-based Storage**: Custom exporters write to JSONL files maintaining Unix philosophy
3. **Optional External Export**: Users can enable OTLP export if they have external backends
4. **Event Sourcing Layer**: Convert OTel spans/metrics to domain events for business logic
5. **Graceful Degradation**: System works fully without OTel enabled

This approach provides professional observability while maintaining Scopecraft's simplicity and file-based design principles.

## Human Review Required

Planning decisions to verify:
- [ ] Complexity assessment (feature vs simple tasks)
- [ ] Task granularity appropriate for AI sessions
- [ ] Sequential dependencies identified correctly
- [ ] Integration approach with existing systems
- [ ] Performance impact mitigation strategies
- [ ] Configuration and deployment considerations

Technical assumptions:
- [ ] OTel SDK integration approach
- [ ] Event store schema design decisions
- [ ] File storage format and organization
- [ ] Backwards compatibility requirements
- [ ] Security considerations for telemetry data