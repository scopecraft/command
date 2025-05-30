# Clean up core V1 code and rename project structure

---
type: feature
status: To Do
area: core
---


## Instruction

Clean up all V1 legacy code from the core module and prepare for the final project structure rename. Remove phase-based code, old configuration files, and any V1-specific implementations that are no longer needed.

## Tasks

### Core Module Cleanup
- [ ] Remove phase-related code from `/src/core/`
- [ ] Clean up old configuration files
- [ ] Remove legacy task manager implementations
- [ ] Simplify core types to V2 workflow structure only
- [ ] Remove any unused imports and dependencies

### Configuration Cleanup  
- [ ] Update project configuration files for new structure
- [ ] Clean up package.json scripts that reference V1
- [ ] Remove old development configuration
- [ ] Update documentation references

### Validation
- [ ] Ensure all V2 functionality still works
- [ ] Run tests to confirm no regressions
- [ ] Verify CLI still works with cleaned core

## Deliverable

Clean core module with:
- No V1 legacy code remaining
- Simplified V2-only structure
- Updated configuration files
- Working V2 functionality

## Log
