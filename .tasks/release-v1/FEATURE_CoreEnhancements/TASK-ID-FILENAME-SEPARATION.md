+++
id = "TASK-ID-FILENAME-SEPARATION"
title = "Implement Separation Between Task IDs and Filenames"
type = "🌟 Feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-11"
updated_date = "2025-05-11"
assigned_to = ""
is_overview = false
phase = "release-v1"
tags = ["core", "refactoring", "id-management"]
related_docs = ["docs/specs/mdtm_standard.md", "docs/specs/mdtm_workflow-init.md"]
+++

# Implement Separation Between Task IDs and Filenames

## Description ✍️

Currently, the task management system directly uses task IDs for filenames (e.g., `TASK-20250511T140853.md`). This limits flexibility, especially when integrating with systems like Roo Commander that have specific filename requirements. This task involves implementing a separation between task IDs and filenames to support both:

1. Human-readable, semantic IDs (e.g., `FEAT-AUTH-001`) as per MDTM standard
2. Flexible filename generation with options for timestamp-based formats (e.g., `TASK-MODE-20250511-140853.md`)

This separation will provide a more flexible foundation that supports both standalone usage and integration with Roo Commander, while allowing us to build more advanced features in the future.

## Acceptance Criteria ✅

- [ ] Task IDs and filenames can be specified independently
- [ ] Add a default ID generation system that creates semantic IDs (e.g., `{TYPE_PREFIX}-{COUNTER}` or `{TYPE_PREFIX}-{FEATURE_ABBR}-{COUNTER}`)
- [ ] Add a configurable filename generation system with support for different patterns
- [ ] Maintain a bidirectional mapping between IDs and filenames
- [ ] Update file operations to work with the new ID/filename separation
- [ ] Ensure task relationships continue to work correctly with the new system
- [ ] Provide backward compatibility for existing timestamp-based IDs
- [ ] Add validation for both IDs and filenames
- [ ] Update CLI and MCP interfaces to support the new ID/filename separation
- [ ] Add necessary configuration options for filename patterns
- [ ] Update documentation to explain the new ID/filename system
- [ ] Add tests for the new ID generation and validation logic

## Implementation Plan 📝

### 1. Core Data Structures and Configuration (src/core/types.ts)

- [ ] Update `TaskMetadata` to include an optional `filename` property
- [ ] Create a new `IdGenerationOptions` interface with properties for customization
- [ ] Create a new `FilenameGenerationOptions` interface with properties for pattern templates
- [ ] Update project configuration to include ID and filename generation settings

### 2. ID Generation Enhancements (src/core/task-parser.ts)

- [ ] Create a new semantic ID generator that supports:
  - [ ] Type-based prefixes (e.g., `FEAT-`, `BUG-`, `CHORE-`)
  - [ ] Feature/area abbreviation extraction from subdirectory
  - [ ] Sequence-based numbers with auto-increment (e.g., 001, 002)
  - [ ] Validation for proper ID format
- [ ] Implement a counter storage system for tracking sequence numbers
  - [ ] Store counters per prefix or prefix+feature combination
  - [ ] Handle persistence of counters across program runs
  - [ ] Add functions to read/write counter state
- [ ] Update the existing `generateTaskId` function to support different formats
- [ ] Create a new `generateFilename` function with support for patterns
  - [ ] Add support for timestamps in filenames
  - [ ] Add support for ID-based filenames (default)
  - [ ] Add support for custom patterns

### 3. File Operations Updates (src/core/task-manager.ts)

- [ ] Modify `createTask` to handle separate ID and filename
  - [ ] Generate ID if not provided
  - [ ] Generate filename if not provided
  - [ ] Store both in the appropriate places
- [ ] Update `getTask` to support lookup by both ID and filename
  - [ ] First try direct ID lookup
  - [ ] If not found, try filename lookup
  - [ ] Enhance the search function to check both
- [ ] Modify `updateTask` to handle filename changes
  - [ ] Check if filename needs to be updated
  - [ ] Handle file moving correctly
- [ ] Update `deleteTask` to work with the new ID/filename system

### 4. Path Resolution (src/core/project-config.ts)

- [ ] Update `getTaskFilePath` to support looking up by either ID or filename
- [ ] Enhance `parseTaskPath` to extract task ID from filenames
- [ ] Add bidirectional mapping utilities between IDs and filenames
- [ ] Update path handling across the codebase to use the new abstractions

### 5. Interface Updates (CLI and MCP)

- [ ] Update CLI command handling to support separate ID and filename:
  - [ ] Add a `--filename` option to the `create` command
  - [ ] Update the `list` command to display both ID and filename
  - [ ] Enhance the `get` command to support lookup by filename
- [ ] Update MCP interface to support the new parameters:
  - [ ] Add filename parameter to task creation methods
  - [ ] Update response formats to include both ID and filename
  - [ ] Add documentation for the new parameters

### 6. Documentation Updates

- [ ] Update code comments to explain the ID/filename system
- [ ] Add examples showing the new ID patterns in templates
- [ ] Create usage documentation for the new ID/filename options
- [ ] Add migration guide for existing projects

### 7. Testing

- [ ] Add unit tests for ID generation
- [ ] Add unit tests for filename generation
- [ ] Add tests for bidirectional mapping
- [ ] Add tests for task operations with different ID/filename combinations
- [ ] Test backward compatibility with existing timestamp-based IDs

### 8. Backward Compatibility

- [ ] Implement detection for existing ID format
- [ ] Handle transition for projects with existing tasks
- [ ] Provide migration utility if needed

## Implementation Considerations 💭

### 1. ID Format Options

We'll support multiple ID formats:
- Semantic: `{TYPE_PREFIX}-{COUNTER}` (e.g., `FEAT-001`)
- Semantic with feature: `{TYPE_PREFIX}-{FEATURE_ABBR}-{COUNTER}` (e.g., `FEAT-AUTH-001`)
- Legacy timestamp: `TASK-{TIMESTAMP}` (e.g., `TASK-20250511T140853`)

### 2. Filename Format Options

We'll support multiple filename patterns:
- ID-based (default): `{ID}.md`
- Timestamp-based: `TASK-{YYYYMMDD-HHMMSS}.md`
- Roo Commander format: `TASK-{MODE}-{YYYYMMDD-HHMMSS}.md`
- Custom pattern with placeholders

### 3. Storage Considerations

To maintain the ID-filename mapping:
- For most cases, the mapping is implicit (ID is stored in file content)
- For advanced cases, we might need an explicit mapping mechanism

### 4. Performance Impact

The implementation should maintain the current performance levels:
- Lookup operations should remain efficient
- ID generation should not significantly impact task creation speed
- Counters persistence should be optimized

### 5. Migration Path

For existing users:
- Current ID system continues to work
- New features are opt-in
- Clear documentation for transitioning to semantic IDs

