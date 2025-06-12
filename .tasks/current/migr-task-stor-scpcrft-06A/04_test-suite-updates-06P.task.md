# Test suite updates

---
type: test
status: todo
area: test
---


## Instruction
Update all test suites to work with the new centralized storage structure at `~/.scopecraft/projects/{encoded}/`.

**CONTEXT**: The core storage implementation (03_core-storage-implementation-06W) will have created the new storage infrastructure. This task focuses on ensuring all tests work correctly with the new structure.

**Key Test Suites Requiring Updates**:

1. **E2E Test Files** (all ~600-700 lines each):
   - `/test/e2e/cli-integration.test.ts`
   - `/test/e2e/dispatch-command.test.ts`
   - `/test/e2e/env-commands.test.ts`
   - `/test/e2e/work-command.test.ts`

2. **Unit Tests**:
   - `/test/unit/core/environment/*.test.ts`
   - `/test/unit/mcp/section-sanitization.test.ts`

**Critical Changes Needed**:

1. **Test Project Setup**
   - Current: Creates temp projects with `.tasks/` directories
   - New: Must create proper storage structure in test-specific location
   - Ensure tests use isolated storage (e.g., `~/.scopecraft-test/`)

2. **Path Assertions**
   - Update all assertions checking for `.tasks/` paths
   - Use TaskStoragePathEncoder for expected paths
   - Verify both old and new locations during transition

3. **Cleanup Logic**
   - Clean up centralized test storage after each test
   - Prevent test data from polluting user's ~/.scopecraft
   - Ensure no cross-test contamination

4. **Feature Flag Testing**
   - Test with migration flag enabled and disabled
   - Verify backward compatibility behavior
   - Test dual-location resolution

**Example Pattern**:
```typescript
// Old pattern
const TEST_PROJECT = join(process.env.TMPDIR, 'scopecraft-test-*');
expect(existsSync(join(TEST_PROJECT, '.tasks/current/task.md'))).toBe(true);

// New pattern
const STORAGE_ROOT = join(os.homedir(), '.scopecraft-test');
const encoded = TaskStoragePathEncoder.encode(TEST_PROJECT);
expect(existsSync(join(STORAGE_ROOT, 'projects', encoded, 'tasks/current/task.md'))).toBe(true);
```

**IMPORTANT**:
- Leverage existing test patterns and helpers
- Ensure tests can run in CI/CD environments
- Maintain test isolation and reproducibility
- Consider parallel test execution safety

## Tasks
- [ ] Set up test-specific storage root (~/.scopecraft-test)
- [ ] Update E2E test project initialization for new storage
- [ ] Fix path assertions in cli-integration.test.ts
- [ ] Fix path assertions in dispatch-command.test.ts
- [ ] Fix path assertions in env-commands.test.ts
- [ ] Fix path assertions in work-command.test.ts
- [ ] Update unit tests for environment resolution
- [ ] Update MCP section sanitization tests
- [ ] Implement proper test cleanup for centralized storage
- [ ] Add tests for feature flag behavior
- [ ] Add tests for dual-location resolution
- [ ] Add tests for migration scenarios
- [ ] Ensure test isolation (no user data pollution)
- [ ] Verify CI/CD compatibility
- [ ] Run full test suite to verify no regressions

## Deliverable
All test suites updated and passing with:
- Proper test isolation using ~/.scopecraft-test
- Updated path assertions for new storage structure
- Comprehensive cleanup logic
- Feature flag testing
- Migration scenario coverage
- Full backward compatibility verification
- CI/CD ready test environment

## Log
