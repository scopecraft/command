---
id: EXAMPLE-MERMAID-001
title: Mermaid Diagram Examples
type: documentation
status: 📋 Ready
priority: ▶️ Medium
created_date: 2025-05-18
updated_date: 2025-05-18
assigned_to: ""
phase: documentation
tags:
  - mermaid
  - examples
  - documentation
---

# Mermaid Diagram Examples

This document showcases various Mermaid diagram types that are now supported in Scopecraft's UI.

## Flowchart

```mermaid
flowchart TB
    A[User Creates Task] -->|CLI| B[Task Manager]
    A -->|UI| B
    B --> C{Valid Task?}
    C -->|Yes| D[Save to MDTM]
    C -->|No| E[Show Error]
    D --> F[Update Index]
    E --> A
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant C as CLI
    participant TM as Task Manager
    participant FS as File System
    
    U->>C: task create --title "New Feature"
    C->>TM: CreateTask(metadata)
    TM->>FS: WriteTaskFile()
    FS-->>TM: Success
    TM-->>C: Task Created
    C-->>U: Display Task ID
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> InProgress: Start Work
    InProgress --> Blocked: Hit Blocker
    InProgress --> Completed: Finish Work
    Blocked --> InProgress: Unblock
    Completed --> [*]
```

## Gantt Chart

```mermaid
gantt
    title Task Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research           :done,    des1, 2025-05-01, 3d
    Implementation     :active,  des2, 2025-05-04, 5d
    Testing           :         des3, after des2, 3d
    section Phase 2
    Documentation     :         des4, after des3, 2d
    Release          :         des5, after des4, 1d
```

## Class Diagram

```mermaid
classDiagram
    Task <|-- FeatureTask
    Task <|-- BugTask
    Task : +string id
    Task : +string title
    Task : +string status
    Task : +create()
    Task : +update()
    class FeatureTask{
        +string[] requirements
        +estimate()
    }
    class BugTask{
        +string severity
        +reproduce()
    }
```

## Git Graph

```mermaid
gitGraph
    commit
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit
```

## Pie Chart

```mermaid
pie title Task Distribution
    "Features" : 45
    "Bugs" : 30
    "Documentation" : 15
    "Chores" : 10
```

## Journey Diagram

```mermaid
journey
    title Developer's Task Workflow
    section Creating Task
      Think of idea: 5: Developer
      Open CLI: 3: Developer
      Create task: 5: Developer
    section Implementation
      Write code: 4: Developer
      Run tests: 3: Developer
      Fix issues: 2: Developer
    section Review
      Submit PR: 5: Developer
      Get feedback: 3: Developer, Reviewer
      Merge: 5: Developer
```

## Mindmap

```mermaid
mindmap
  root((Scopecraft))
    Tasks
      Features
      Bugs
      Chores
    UI
      React
      Tailwind
      Mermaid
    CLI
      Commands
      Options
      Config
    MCP
      Handlers
      Tools
      Protocol
```

All these diagrams support both light and dark themes and will automatically adapt to your UI preference.