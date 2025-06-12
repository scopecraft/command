# Documentation and init updates

---
type: documentation
status: todo
area: docs
---


## Instruction
Update all documentation and ensure project initialization works correctly with the new centralized storage architecture.

**CONTEXT**: The storage migration implementation is complete. This task ensures all documentation reflects the new architecture and that new project initialization creates the correct structure.

**Part 1: Architecture Documentation Updates**

1. **System Architecture Docs**
   - Update `/docs/02-architecture/system-architecture.md`
   - Update `/docs/02-architecture/service-architecture.md`
   - Document the new storage layer architecture
   - Update diagrams showing task storage location

2. **Code Organization Docs**
   - Update `/docs/02-architecture/code-organization.md`
   - Document new modules: TaskStoragePathEncoder, storage-utils
   - Update module dependency diagrams

3. **Project Configuration Guide**
   - Update any docs mentioning `.tasks/` directory
   - Document the new `~/.scopecraft/projects/` structure
   - Add migration guide for existing users

**Part 2: Project Initialization Updates**

1. **Init Command (`/src/cli/init.ts`)**
   - Currently creates `.tasks/` directory structure
   - Update to handle both modes based on feature flag
   - When centralized storage enabled:
     - Create project entry in ~/.scopecraft/projects/
     - Initialize directory structure there
     - Create .scopecraft/ directory in project with config
   - Maintain backward compatibility for legacy mode

2. **Project Structure Documentation**
   - Update README.md with new project structure
   - Document what goes in repo vs centralized storage
   - Explain work documents location (docs/work/)

**Part 3: Developer Documentation**

1. **API Documentation**
   - Document new ConfigurationManager methods
   - Document TaskStoragePathEncoder API
   - Update examples to show both storage modes

2. **CLAUDE.md Updates**
   - Update project instructions for AI agents
   - Document new storage locations
   - Update task management examples

3. **Migration Guide**
   - Create `/docs/03-guides/storage-migration.md`
   - Step-by-step migration instructions
   - Troubleshooting common issues
   - Rollback procedures

**IMPORTANT**:
- Ensure all code examples work with new storage
- Update any diagrams showing file structure
- Keep documentation clear about feature flag usage
- Test that `sc init` works correctly in both modes

## Tasks
- [ ] Review all architecture documentation for .tasks/ references
- [ ] Update system-architecture.md with new storage layer
- [ ] Update service-architecture.md with storage service details
- [ ] Update code-organization.md with new modules
- [ ] Create/update architecture diagrams
- [ ] Update init.ts to support centralized storage mode
- [ ] Test project initialization in both modes
- [ ] Update README.md project structure section
- [ ] Update CLAUDE.md with new storage information
- [ ] Create storage-migration.md guide
- [ ] Document all new APIs (ConfigurationManager, PathEncoder)
- [ ] Update CLI documentation with new commands
- [ ] Review and update all code examples
- [ ] Ensure work documents location is documented
- [ ] Test documentation accuracy with actual implementation

## Deliverable
Comprehensive documentation updates:
- All architecture docs updated for new storage
- Project init command working in both modes
- Migration guide created
- API documentation complete
- CLAUDE.md updated for AI agents
- All code examples tested and working
- Clear explanation of feature flags and migration process

## Log
