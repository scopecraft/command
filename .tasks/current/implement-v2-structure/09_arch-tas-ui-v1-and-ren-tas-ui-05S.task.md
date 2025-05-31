# Archive tasks-ui V1 and rename task-ui-2 to tasks-ui

---
type: feature
status: Done
area: core
---


## Instruction

Archive the old tasks-ui V1 directory and rename task-ui-2 to tasks-ui to become the primary UI. Ensure all references are updated and no traces of V1 UI remain in the active codebase.

## Tasks

### Archive V1 UI
- [x] Move `tasks-ui/` to `.archive-old-ui/` (made it hidden with dot prefix)
- [x] Ensure V1 UI is completely disconnected from build/dev scripts
- [x] Document what was archived for future reference (ARCHIVED_README.md)

### Rename V2 to Primary
- [x] Rename `task-ui-2/` to `tasks-ui/`
- [x] Update all package.json scripts to point to new location
- [x] Update root-level commands (ui:dev, ui:build, storybook, etc.)
- [x] Update documentation and README files

### Update References
- [x] Update all import paths in other modules that reference UI
- [x] Update MCP server API paths if needed
- [x] Update development scripts and configurations
- [x] Update .gitignore and other config files

### Clean Documentation
- [x] Update README with new UI structure
- [x] Remove V1 UI references from documentation
- [x] Update development setup instructions
- [x] Clean up any V1-specific documentation

### Validation
- [x] Test that all UI functionality works with new paths
- [x] Verify development and build scripts work
- [x] Ensure Storybook still works correctly
- [x] Test MCP integration with renamed paths

## Deliverable

Clean project structure with:
- V1 UI safely archived
- task-ui-2 renamed to tasks-ui as primary
- All references updated
- Working development environment
- Clean documentation

## Log
- 2025-05-31: Archived old tasks-ui to .archive-old-ui (with dot prefix to make it clear it's archived), renamed task-ui-2 to tasks-ui, updated all references in package.json, removed ui2: scripts, fixed imports in server.ts, added ConfigurationManager initialization to fix project root detection. Updated all task-ui-2 references in task files.
