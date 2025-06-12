# Simplify tests for centralized-only storage

---
type: test
status: todo
area: test
---


## Instruction
Simplify all tests to reflect the centralized-only storage decision and ensure they pass.

**CONTEXT**: Major architecture decision was made in task 09:
- **NO MORE FEATURE FLAGS** - Centralized storage is the only option
- **NO MORE DUAL SUPPORT** - No backward compatibility with `.tasks/`
- All storage goes to `~/.scopecraft/projects/{encoded}/tasks/`
- The ADR has been updated to reflect this decision

**What Was Removed in Task 09**:
- `storage-utils.ts` (all feature flag logic)
- ConfigurationManager storage methods
- All environment variables for feature flags
- The old storage migration test file

**What Stayed**:
- `TaskStoragePathEncoder` class (for path encoding)
- Security validation functions
- Basic directory creation logic

**Test Simplification Required**:

1. **Remove Feature Flag Tests**
   - No more testing with flags on/off
   - No more dual-location tests
   - No more backward compatibility tests

2. **Update Path Expectations**
   - ALL tests should expect `~/.scopecraft/projects/{encoded}/tasks/`
   - Remove any `.tasks/` path expectations
   - Use test-specific root like `~/.scopecraft-test/` to avoid pollution

3. **Simplify Test Setup**
   - No need to set environment variables
   - No need to test migration scenarios
   - Just test that tasks work in centralized location

4. **Fix Broken Imports**
   - Remove imports of deleted modules (storage-utils, etc.)
   - Update to use simplified directory-utils API

**Test Files to Update**:
- `/test/e2e/cli-integration.test.ts`
- `/test/e2e/dispatch-command.test.ts`
- `/test/e2e/env-commands.test.ts`
- `/test/e2e/work-command.test.ts`
- `/test/regression/environment-resolution.test.ts`
- Any other tests that reference storage paths

**Run Full Test Suite**:
After simplification, run `bun test` to ensure all tests pass with the new centralized-only approach.

## Tasks
- [ ] Remove storage-migration.test.ts if it still exists
- [ ] Update cli-integration.test.ts to use centralized paths only
- [ ] Update dispatch-command.test.ts to use centralized paths only
- [ ] Update env-commands.test.ts to use centralized paths only
- [ ] Update work-command.test.ts to use centralized paths only
- [ ] Fix environment-resolution.test.ts for centralized storage
- [ ] Remove all feature flag environment variable usage
- [ ] Remove all dual-location test scenarios
- [ ] Update test helpers to use ~/.scopecraft-test/ root
- [ ] Fix any broken imports from deleted modules
- [ ] Run full test suite and fix any failures
- [ ] Document which tests were simplified and why

## Deliverable
Simplified test suite that:
- Uses centralized storage only (no feature flags)
- All tests pass with new architecture
- No references to `.tasks/` paths
- Clean test isolation with ~/.scopecraft-test/
- Documentation of what was changed
- Full test run results showing success

## Log
