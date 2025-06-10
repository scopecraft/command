# Design storage architecture

---
type: spike
status: in_progress
area: core
---


## Instruction
Design the new storage architecture for tasks in ~/.scopecraft/projects/.

Key design decisions:
1. **Directory structure**: Mirror current .tasks/ structure or optimize?
2. **Work documents**: Where in repo should they live? How to make them discoverable?
3. **Migration strategy**: How to move existing tasks safely
4. **Backwards compatibility**: Support both locations during transition?
5. **Configuration**: How to configure storage location per project

Consider how this integrates with existing ConfigurationManager and project root resolution.

## Tasks
- [ ] Design ~/.scopecraft/projects/{encoded-path}/ structure
- [ ] Define work documents location and naming convention in repo
- [ ] Create migration algorithm (handling conflicts, preserving history)
- [ ] Design configuration schema for storage location
- [ ] Plan abstraction layer changes in core modules
- [ ] Consider caching strategy for performance

## Deliverable
Architecture design document with:
- Directory structure diagrams
- Work documents organization strategy
- Migration flowchart
- Configuration schema
- API changes required in core layer

## Log
