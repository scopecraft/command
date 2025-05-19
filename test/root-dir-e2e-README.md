# Root Directory Configuration E2E Tests

This directory contains end-to-end tests for the CLI root directory configuration feature.

## Files

- `root-dir-e2e-plan.md` - Comprehensive test plan documenting all test cases
- `run-root-dir-e2e.sh` - Executable test script that runs all tests
- `root-dir-e2e-README.md` - This file

## Running the Tests

From the project root directory:

```bash
./test/run-root-dir-e2e.sh
```

The script will:
1. Create a test directory structure
2. Generate test tasks
3. Run through all test scenarios
4. Show pass/fail results for each test
5. Optionally clean up test data

## Test Scenarios Covered

1. **CLI Parameter** (`--root-dir`)
2. **Environment Variable** (`SCOPECRAFT_ROOT`)
3. **Configuration File** (`--config`)
4. **Auto-detection** (from current directory)
5. **Precedence Testing** (CLI > ENV > Config)
6. **CRUD Operations** (get, update, list)
7. **Filtering** (by phase, subdirectory)
8. **Worktree Simulation** (multiple roots)
9. **Error Handling** (invalid paths)

## Directory Structure

The tests create the following structure:
```
e2e_test/
├── worktree-test/           # Main test directory
│   └── .tasks/
│       └── TEST/
│           ├── TEST-ROOTCONFIG-001.md
│           └── FEATURE_Auth/
│               └── AUTH-001.md
├── main-branch/             # Simulates main branch
│   └── .tasks/
│       └── PROD/
│           └── PROD-001.md
├── feature-branch/          # Simulates feature branch
│   └── .tasks/
│       └── DEV/
│           └── DEV-001.md
└── config.json             # Test configuration
```

## Adding New Tests

To add a new test:

1. Update `root-dir-e2e-plan.md` with the new test case
2. Add a new `run_test` call in `run-root-dir-e2e.sh`:
   ```bash
   run_test "Test Name" \
       "command to run" \
       "expected pattern in output"
   ```

## Troubleshooting

If tests fail:
1. Check that you're in the project root directory
2. Ensure all dependencies are installed (`bun install`)
3. Make sure the CLI builds successfully (`bun run build`)
4. Check file permissions on the test script
5. Review the test output for specific error messages

## Manual Testing

For manual testing, you can run individual commands from the test plan:

```bash
# Example: Test with custom root
bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list

# Example: Test with environment variable
SCOPECRAFT_ROOT=./e2e_test/worktree-test bun run ./src/cli/cli.ts task list
```

## Clean Up

The test script offers to clean up test data at the end. You can also manually clean up:

```bash
rm -rf e2e_test
```