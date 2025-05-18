---
id: TEST-MERMAID-001
title: Test Mermaid Diagrams
type: test
status: 🔵 In Progress
priority: ▶️ Medium
created_date: 2025-05-18
updated_date: 2025-05-18
assigned_to: ""
phase: tests
tags:
  - mermaid
  - ui-test
---

# Test Mermaid Diagrams

This task contains various Mermaid diagrams to test the rendering.

## Flowchart Test

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Sequence Diagram Test

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Backend
    User->>UI: Click button
    UI->>Backend: API Request
    Backend-->>UI: Response
    UI-->>User: Show result
```

## State Diagram Test

```mermaid
stateDiagram-v2
    [*] --> State1
    State1 --> State2
    State2 --> State3
    State3 --> [*]
```

## Pie Chart Test

```mermaid
pie title Pet Ownership
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
```

This task should properly render all these Mermaid diagrams with appropriate dark/light theme support.