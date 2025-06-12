# Integration updates and migration tooling

---
type: feature
status: todo
area: cli
---


## Instruction
Update all integration points and create migration tooling for the storage migration to `~/.scopecraft/projects/{encoded}/`.

**CONTEXT**: Core storage implementation and tests are complete. This task handles remaining integrations and creates the actual migration command.

**Part 1: Integration Updates**

1. **MCP Server Updates**
   - Update all handlers in `/src/mcp/handlers/` for new paths
   - Ensure normalized handlers work with new storage
   - Update parameter transformers if needed
   - Maintain backward compatibility

2. **CLI Output Formatting**
   - Update `/src/cli/formatters.ts` to show user-friendly paths
   - Task paths should appear relative to project, not storage root
   - Update help text and examples throughout CLI
   - Ensure consistent user experience

3. **Command Updates**
   - Review all commands that display or reference task paths
   - Update path display logic to hide storage complexity
   - Ensure workflow commands (promote/archive) work correctly

**Part 2: Migration Tooling**

1. **Migration Command**
   ```bash
   sc migrate --project .  # Migrate current project
   sc migrate --status     # Check migration status
   sc migrate --rollback   # Restore from backup
   ```

2. **Migration Process**
   - Create backup of existing .tasks/ directory
   - Copy all files to new centralized location
   - Verify integrity (file count, checksums)
   - Update project configuration
   - Optional: Clean up old .tasks/ directory

3. **Conflict Handling**
   - If centralized location already has data, prompt user
   - Offer merge, replace, or abort options
   - Log all migration actions for rollback

4. **User Documentation**
   - Create migration guide in docs/
   - Include troubleshooting steps
   - Document rollback process

**Part 3: Docker Integration** (separate subtask)
   - Create simple task for Docker mounting strategy
   - Document how to mount ~/.scopecraft in containers
   - This can be done after main migration

**IMPORTANT**:
- This is a single-project migration (this repo only)
- Keep migration simple and direct
- Focus on user experience and safety
- Ensure clear communication during migration

## Tasks
- [ ] Update MCP handlers for new storage paths
- [ ] Update MCP normalized handlers and transformers
- [ ] Update CLI formatters to show project-relative paths
- [ ] Update help text and examples in all commands
- [ ] Review and update all path display logic
- [ ] Create migration command (sc migrate)
- [ ] Implement backup creation before migration
- [ ] Implement file copying with progress feedback
- [ ] Add integrity verification (checksums, file counts)
- [ ] Implement conflict detection and resolution
- [ ] Create rollback functionality
- [ ] Add migration status tracking and reporting
- [ ] Create user migration guide documentation
- [ ] Test migration with various edge cases
- [ ] Create separate Docker mounting strategy task

## Deliverable
Complete integration updates and migration tooling:
- All MCP/CLI integrations updated for new storage
- User-friendly path display throughout system
- Working `sc migrate` command with:
  - Backup creation
  - Safe migration process
  - Conflict handling
  - Rollback capability
- Migration guide documentation
- Docker task created for follow-up

## Log
