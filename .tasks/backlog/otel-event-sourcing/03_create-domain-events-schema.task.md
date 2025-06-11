---
type: feature
status: To Do
priority: High
assignee: ""
tags: ["schema", "events", "types"]
area: core
created: 2025-06-11
parent: otel-event-sourcing
---

# Create Domain Events Schema

## Instruction

Define the domain event types and schema for Scopecraft operations. This establishes the contract between OpenTelemetry instrumentation and the event sourcing system, ensuring consistent and meaningful event data.

Focus on events for:
1. Task lifecycle (created, status changed, moved)
2. Session operations (queued, started, completed, failed)
3. Worktree management (created, recycled, conflicts)
4. System operations (configuration changes, errors)

## Tasks

- [ ] Define base DomainEvent interface with required fields
- [ ] Create TaskCreated, TaskStatusChanged, TaskMoved event types
- [ ] Create SessionQueued, SessionStarted, SessionCompleted event types
- [ ] Create WorktreeCreated, WorktreeRecycled event types
- [ ] Add SystemError, ConfigurationChanged event types
- [ ] Define metadata fields for correlation and causation
- [ ] Create TypeScript type definitions
- [ ] Add JSON schema validation for events
- [ ] Document event naming conventions and best practices

## Deliverable

Complete domain event schema including:
- TypeScript interfaces for all event types
- JSON schema definitions for validation
- Documentation of event structure and usage
- Examples of each event type
- Naming and versioning conventions

## Log

- 2025-06-11: Task created as part of OTel event sourcing integration