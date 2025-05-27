# Scopecraft Task System Specification v2.0

## 1. Overview

This specification defines the technical requirements for Scopecraft's workflow-based task system. It provides precise implementation details for the concepts outlined in the vision documents.

### 1.1 Scope
This specification covers:
- File system structure and organization
- Task document format and sections
- ID generation and resolution
- Task lifecycle and operations
- Backwards compatibility requirements

### 1.2 Terminology
- **Task**: A unit of work represented by a `.task.md` file
- **Workflow State**: One of backlog, current, or archive
- **Section**: A named part of a task document (e.g., Instruction, Tasks)
- **Complex Task**: A task represented by a folder containing subtasks

## 2. File System Structure

### 2.1 Root Structure
The `.tasks/` directory MUST contain exactly three subdirectories:

```
.tasks/
  backlog/     # Future work not yet started
  current/     # Active work in progress
  archive/     # Completed work
```

### 2.2 Workflow State Folders

#### 2.2.1 Backlog Folder
- Contains tasks that are planned but not yet started
- No special structure requirements
- Tasks MAY be organized in subfolders by theme/area

#### 2.2.2 Current Folder
- Contains actively worked on tasks
- Complex tasks MAY be represented as folders
- No nested workflow states (no current/backlog/)

#### 2.2.3 Archive Folder
- Contains completed tasks
- SHOULD be organized by date: `archive/YYYY-MM/`
- Date folders are OPTIONAL but recommended
- Archived tasks SHOULD NOT be modified

### 2.3 Complex Task Folders
A task MAY be represented as a folder when it contains subtasks:

```
current/
  dashboard-redesign/              # Complex task folder
    _overview.md                   # Required: describes the complex task
    01-user-research.task.md       # Subtask
    02-implement-ui.task.md        # Subtask
    mockups/                       # Supporting materials (non-task)
```

Rules:
- Complex task folders MUST contain `_overview.md`
- Subtasks SHOULD use sequence prefixes (01-, 02-)
- Same prefix indicates parallel execution capability
- Non-task materials MAY be included

## 3. Task File Format

### 3.1 Filename Convention

#### 3.1.1 Standard Tasks
Pattern: `{descriptive-name}-{MMDD}-{XX}.task.md`

- `{descriptive-name}`: Kebab-case, alphanumeric plus hyphens
- `{MMDD}`: Month and day of creation
- `{XX}`: Two random alphanumeric characters for uniqueness
- Extension: MUST be `.task.md`

Examples:
- `implement-oauth-0127-AB.task.md`
- `fix-login-bug-0202-7K.task.md`

#### 3.1.2 Subtasks in Complex Tasks
Pattern: `{NN}-{descriptive-name}.task.md`

- `{NN}`: Two-digit sequence number (01, 02, etc.)
- Same number indicates parallel execution capability

Examples:
- `01-research.task.md`
- `02-design.task.md`
- `02-implement.task.md` (parallel with design)

### 3.2 Document Structure

Every task document MUST follow this structure:

```markdown
# {Human Readable Title}

---
type: {task-type}
status: {status-emoji} {status-text}
area: {product-area}
{additional-metadata}
---

## Instruction
{What needs to be done - required, may be empty initially}

## Tasks
{Checklist of subtasks - required, may be empty}
- [ ] Subtask 1
- [x] Completed subtask

## Deliverable
{Work outputs - required, initially empty}

## Log
{Execution history - required, may be empty initially}
- YYYY-MM-DD HH:MM: {Entry}
```

### 3.3 Frontmatter Fields

#### 3.3.1 Required Fields
- `type`: One of: feature, bug, chore, spike, idea
- `status`: Status emoji + text (see section 3.4)
- `area`: Product area (e.g., auth, billing, ui)

#### 3.3.2 Optional Fields
Teams may add custom fields:
- `sprint`: Current sprint identifier
- `version`: Target version
- `priority`: Priority level
- `assignee`: Assigned person
- Custom fields as needed

### 3.4 Status Values
Standard status values with emoji prefixes:
- `🟡 To Do`: Not started
- `🔵 In Progress`: Currently being worked on
- `🟢 Done`: Completed
- `🔴 Blocked`: Cannot proceed
- `⚪ Archived`: No longer relevant

## 4. Section Specifications

### 4.1 Required Sections

#### 4.1.1 Instruction Section
- Purpose: Defines what needs to be done
- Format: Freeform markdown
- Initial state: MAY be empty for ideas/exploration
- Should answer: What is the goal?

#### 4.1.2 Tasks Section
- Purpose: Breakdown of work items
- Format: Markdown checkbox list
- Initial state: MAY be empty
- Operations: Check/uncheck, reorder, add/remove

Example:
```markdown
## Tasks
- [x] Research authentication methods
- [ ] Implement JWT tokens
- [ ] Add refresh token support
```

#### 4.1.3 Deliverable Section
- Purpose: Contains work outputs
- Format: Freeform markdown
- Initial state: MUST be empty
- Grows as work progresses

#### 4.1.4 Log Section
- Purpose: Execution history and notes
- Format: Timestamped entries
- Initial state: MAY be empty
- Append-only (no deletion of history)

Format:
```markdown
## Log
- 2024-01-27 09:00: Started research phase
- 2024-01-27 14:00: Completed OAuth provider analysis
```

### 4.2 Optional Sections

Teams MAY add additional sections as patterns emerge:

- `## Context`: Related work and dependencies
- `## Decisions`: Choices made with rationale
- `## Questions`: Items needing human input
- `## Progress`: Detailed status beyond checkboxes

## 5. ID System and Resolution

### 5.1 Task ID Definition
A task ID is the filename without the `.task.md` extension.

Examples:
- File: `implement-oauth-0127-AB.task.md`
- ID: `implement-oauth-0127-AB`

### 5.2 ID Resolution Algorithm

When resolving `@task:{id}`:

1. Search `current/{id}.task.md`
2. If not found, search `backlog/{id}.task.md`
3. If not found, search `archive/**/{id}.task.md` (recursive)
4. If not found, return error

### 5.3 Explicit Path References
Users MAY specify explicit paths:
- `@task:current/implement-oauth-0127-AB`
- `@task:archive/2024-01/old-task-1223-XY`

### 5.4 Section References
Format: `@task:{id}#{section}`

Examples:
- `@task:implement-oauth-0127-AB#deliverable`
- `@task:research-task-0115-CD#decisions`

## 6. Task Operations

### 6.1 Create Operation
- Default location: `backlog/`
- Generates ID using current date + random suffix
- Creates file with all required sections
- Initializes frontmatter with minimal fields

### 6.2 Move Operation
Moving between workflow states:

```bash
# Move from backlog to current
mv backlog/task-0127-AB.task.md current/

# Move to archive with date organization
mkdir -p archive/2024-01
mv current/task-0127-AB.task.md archive/2024-01/
```

Rules:
- ID remains unchanged
- References remain valid
- Update status field appropriately

### 6.3 Update Operations

#### 6.3.1 Section Update
- Tools SHOULD support updating individual sections
- Section boundaries are `## {Section Name}` lines
- Updates SHOULD preserve other sections

#### 6.3.2 Metadata Update
- Frontmatter can be updated independently
- Status changes SHOULD be reflected in moves

### 6.4 List Operations
List commands MUST:
- Search all workflow folders by default
- Support filtering by location
- Support filtering by metadata fields
- Return results in a consistent order

Default search order: current → backlog → archive

## 7. Migration from V1

### 7.1 Clean Break Approach
This specification assumes a clean break from v1:
- No requirement to support both structures simultaneously
- No automatic migration provided
- Users must manually reorganize if needed

### 7.2 Manual Migration Guide
For users migrating from v1:
1. Create new workflow folders: backlog/, current/, archive/
2. Move active work to current/
3. Move completed work to archive/
4. Move future work to backlog/
5. Rename files to remove FEATURE_ and TASK- prefixes
6. Update file contents to new section structure

### 7.3 V1 Structure (Reference Only)
The old v1 structure for reference:
- Phase folders at root level (release-v1/)
- FEATURE_ prefixed folders
- TASK- prefixed files
- Mixed tasks and work documents

## 8. Implementation Requirements

### 8.1 Error Handling
- Invalid workflow state → Clear error message
- Duplicate IDs → Prevent creation
- Missing sections → Create with empty content
- Malformed frontmatter → Preserve content, warn user

### 8.2 Performance Considerations
- ID resolution SHOULD be optimized for current/ folder
- Archive searches MAY be slower
- Consider caching for large archives

### 8.3 Validation
Tools SHOULD validate:
- Filename format on creation
- Required sections present
- Frontmatter structure
- No duplicate IDs across workflow states

## 9. Examples

### 9.1 Simple Task Creation
```bash
$ sc task create "Implement OAuth"
Created: backlog/implement-oauth-0127-AB.task.md
```

File contents:
```markdown
# Implement OAuth

---
type: feature
status: 🟡 To Do
area: auth
---

## Instruction
Implement OAuth authentication

## Tasks

## Deliverable

## Log
- 2024-01-27 09:00: Task created
```

### 9.2 Task Lifecycle
```bash
# Create in backlog
$ sc task create "Research caching"
Created: backlog/research-caching-0127-CD.task.md

# Start work - move to current
$ sc task start research-caching-0127-CD
Moved: backlog/ → current/

# Complete - move to archive
$ sc task complete research-caching-0127-CD
Moved: current/ → archive/2024-01/
```

### 9.3 Complex Task Structure
```
current/
  payment-integration/
    _overview.md
    01-research-providers.task.md
    02-implement-stripe.task.md
    02-implement-paypal.task.md    # Parallel with stripe
    03-integration-tests.task.md
    stripe-docs/                   # Supporting materials
      api-reference.pdf
```

## 10. Future Considerations

This specification focuses on core functionality. Future versions may add:
- Section-specific schemas
- Workflow customization
- Advanced querying
- Relationship tracking
- Plugin architecture

However, these are NOT part of v2.0 requirements.

---

*This specification is version 2.0, published 2024-01-27. Updates require RFC process.*