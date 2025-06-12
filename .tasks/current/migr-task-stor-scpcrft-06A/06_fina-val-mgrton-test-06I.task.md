# Final validation and migration test

---
type: test
status: todo
area: test
---


## Instruction
Perform comprehensive end-to-end validation of the storage migration system, including testing the actual migration process.

**CONTEXT**: All implementation work is complete (core storage, test updates, integrations, migration tooling). This final validation ensures everything works together correctly.

**Part 1: System Integration Testing**

1. **Full Workflow Testing**
   - Create a new task with new storage enabled
   - List tasks from centralized storage
   - Update task metadata and content
   - Promote task through workflows (backlog → current → archive)
   - Delete tasks
   - Verify all operations work seamlessly

2. **Cross-Component Validation**
   - CLI creates task → MCP can read it
   - MCP updates task → CLI sees changes
   - Sessions created via UI → stored correctly
   - Templates/modes accessible from new location

3. **Backward Compatibility Testing**
   - Disable feature flag → verify .tasks/ still works
   - Enable dual mode → verify both locations checked
   - Test graceful degradation scenarios

**Part 2: Migration Process Testing**

1. **Test Migration Command**
   ```bash
   # Set up test project with .tasks/ data
   # Run migration
   sc migrate --project .
   # Verify all data migrated correctly
   # Test rollback
   sc migrate --rollback
   ```

2. **Migration Scenarios**
   - Fresh migration (no existing centralized data)
   - Conflict resolution (centralized data exists)
   - Partial migration recovery
   - Large project migration (stress test)

3. **Data Integrity Verification**
   - All tasks present after migration
   - Metadata preserved correctly
   - File permissions maintained
   - No data corruption

**Part 3: User Experience Testing**

1. **Path Display Verification**
   - CLI shows user-friendly paths (not storage paths)
   - Error messages reference correct locations
   - Help text updated throughout

2. **Performance Testing**
   - Compare operation speed (old vs new storage)
   - Ensure no significant degradation
   - Test with many tasks (100+)

**Part 4: Documentation Validation**

1. **Migration Guide Testing**
   - Follow the migration guide step-by-step
   - Ensure all instructions are clear
   - Verify troubleshooting steps work

2. **API Documentation**
   - Verify all code examples work
   - Ensure new methods documented

**IMPORTANT**:
- This is the final gate before migration
- Focus on real-world usage patterns
- Document any issues for fix before migration
- Create confidence in the migration process

## Tasks
- [ ] Test full task lifecycle with new storage
- [ ] Verify workflow operations (promote/archive)
- [ ] Test CLI ↔ MCP interoperability
- [ ] Validate session storage in new location
- [ ] Test template/mode access
- [ ] Verify backward compatibility with feature flag off
- [ ] Test dual-location resolution
- [ ] Set up test project with .tasks/ data
- [ ] Test migration command end-to-end
- [ ] Test migration rollback functionality
- [ ] Test conflict resolution scenarios
- [ ] Verify data integrity after migration
- [ ] Check file permissions preservation
- [ ] Validate user-friendly path display
- [ ] Performance comparison testing
- [ ] Test with large number of tasks
- [ ] Follow migration guide step-by-step
- [ ] Create final validation report

## Deliverable
Comprehensive validation report confirming:
- All features work with new storage
- Migration process is reliable and safe
- Performance is acceptable
- User experience is smooth
- Documentation is accurate
- System is ready for production migration

Any issues found should be documented with severity and fix recommendations.

## Log
