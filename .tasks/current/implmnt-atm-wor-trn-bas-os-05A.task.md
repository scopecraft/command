# Implement automatic workflow transitions based on status changes

---
type: feature
status: done
area: general
priority: medium
---


## Instruction
Implement smart workflow transitions that automatically move tasks between workflow states based on status changes, improving the natural flow of work.

## Tasks
- [x] Explore current workflow and status system implementation
- [x] Design automatic workflow transition logic and rules
- [x] Implement core workflow transition functions
- [x] Integrate transitions into task update operations
- [x] Add comprehensive tests for automatic workflow transitions
- [x] Update documentation and task log

## Deliverable
Automatic workflow transitions that move tasks between workflow states based on status changes:
- **backlog** + "In Progress" → **current**
- **archive** + ("In Progress" or "To Do") → **current** (re-opening archived tasks)
- Configurable via `autoWorkflowTransitions: boolean` in V2Config
- No automatic archiving (tasks stay in current when marked "Done")

## Log
- 2025-05-28: Implemented automatic workflow transition system
  - Added `shouldAutoTransition()` function with conservative transition rules
  - Added `autoWorkflowTransitions` config option to V2Config type
  - Integrated auto-transition logic into `updateTask()` function
  - Preserves status changes while moving files between workflow directories
  - Added comprehensive test suite with 6 test cases covering all scenarios
  - Tests verify both positive cases (transitions happen) and negative cases (no unwanted transitions)
