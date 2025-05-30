# Archive tasks-ui V1 and rename task-ui-2 to tasks-ui

---
type: feature
status: To Do
area: core
---


## Instruction

Archive the old tasks-ui V1 directory and rename task-ui-2 to tasks-ui to become the primary UI. Ensure all references are updated and no traces of V1 UI remain in the active codebase.

## Tasks

### Archive V1 UI
- [ ] Move `tasks-ui/` to `tasks-ui-v1-archive/` (temporary archive)
- [ ] Ensure V1 UI is completely disconnected from build/dev scripts
- [ ] Document what was archived for future reference

### Rename V2 to Primary
- [ ] Rename `task-ui-2/` to `tasks-ui/`
- [ ] Update all package.json scripts to point to new location
- [ ] Update root-level commands (ui:dev, ui:build, storybook, etc.)
- [ ] Update documentation and README files

### Update References
- [ ] Update all import paths in other modules that reference UI
- [ ] Update MCP server API paths if needed
- [ ] Update development scripts and configurations
- [ ] Update .gitignore and other config files

### Clean Documentation
- [ ] Update README with new UI structure
- [ ] Remove V1 UI references from documentation
- [ ] Update development setup instructions
- [ ] Clean up any V1-specific documentation

### Validation
- [ ] Test that all UI functionality works with new paths
- [ ] Verify development and build scripts work
- [ ] Ensure Storybook still works correctly
- [ ] Test MCP integration with renamed paths

## Deliverable

Clean project structure with:
- V1 UI safely archived
- task-ui-2 renamed to tasks-ui as primary
- All references updated
- Working development environment
- Clean documentation

## Log
