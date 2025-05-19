# E2E Test Plan: CLI Root Directory Configuration

This plan documents comprehensive end-to-end testing for the CLI root directory configuration feature.

## Test Directory Structure

Create the following test directory structure:
```
e2e_test/
├── worktree-test/           # Simulates a single worktree
│   └── .tasks/
│       ├── templates/       # Template directory for testing
│       │   ├── 01_mdtm_feature.md
│       │   └── 02_mdtm_bug.md
│       └── TEST/
│           ├── TEST-ROOTCONFIG-001.md
│           └── FEATURE_Auth/
│               └── AUTH-001.md
├── main-branch/             # Simulates main branch worktree
│   └── .tasks/
│       └── PROD/
│           └── PROD-001.md
├── feature-branch/          # Simulates feature branch worktree
│   └── .tasks/
│       └── DEV/
│           └── DEV-001.md
└── config.json             # Test configuration file
```

## Test Cases

### 1. CLI Parameter (`--root-dir`)

**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list`

**Expected Output**:
- Shows "Using project root from CLI: ./e2e_test/worktree-test"
- Lists tasks from the specified directory
- Should show TEST-ROOTCONFIG-001 and AUTH-001

### 2. Environment Variable (`SCOPECRAFT_ROOT`)

**Command**: `SCOPECRAFT_ROOT=./e2e_test/worktree-test bun run ./src/cli/cli.ts task list`

**Expected Output**:
- Uses the environment variable path
- Lists tasks from the specified directory
- No "Using project root from CLI" message

### 3. Configuration File (`--config`)

**Setup**: Create `e2e_test/config.json`:
```json
{
  "version": "1.0.0",
  "projects": [
    {
      "name": "worktree-test",
      "path": "/full/path/to/e2e_test/worktree-test"
    }
  ],
  "defaultProject": "worktree-test"
}
```

**Command**: `bun run ./src/cli/cli.ts --config ./e2e_test/config.json task list`

**Expected Output**:
- Shows "Using config file: ./e2e_test/config.json"
- Lists tasks from the configured project

### 4. Auto-detection

**Command**: `cd e2e_test/worktree-test && bun run ../../src/cli/cli.ts task list`

**Expected Output**:
- Automatically detects .tasks directory in current path
- Lists tasks without showing any "Using..." message

### 5. Precedence Testing

#### CLI > Environment
**Command**: `SCOPECRAFT_ROOT=./ bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list`

**Expected Output**:
- Shows "Using project root from CLI: ./e2e_test/worktree-test"
- Uses CLI parameter, ignoring environment variable

#### CLI > Config
**Command**: `bun run ./src/cli/cli.ts --config ./e2e_test/config.json --root-dir ./e2e_test/main-branch task list`

**Expected Output**:
- Shows both "Using config file" and "Using project root from CLI"
- Actually uses the CLI parameter path

### 6. CRUD Operations

#### Get Task
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task get TEST-ROOTCONFIG-001`

**Expected Output**:
- Shows task details from the specified root
- Includes phase, status, and content

#### Update Task
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task update TEST-ROOTCONFIG-001 --status "🟢 Done"`

**Expected Output**:
- Shows "Using project root from CLI"
- Updates the task in the correct location

#### List with Filters
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --phase TEST`

**Expected Output**:
- Shows only tasks in TEST phase
- Respects the root directory

### 7. Worktree Simulation

#### Main Branch
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/main-branch task list`

**Expected Output**:
- Shows PROD-001 task
- No tasks from other directories

#### Feature Branch
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/feature-branch task list`

**Expected Output**:
- Shows DEV-001 task
- No tasks from other directories

### 8. Subdirectory Operations

**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --subdirectory FEATURE_Auth`

**Expected Output**:
- Shows only AUTH-001 task
- Correctly filters by subdirectory within the root

### 9. Template Operations

#### Create Task with Template
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create \"Template Test Feature\" --type "🌟 Feature" --template feature --phase TEST`

**Expected Output**:
- Shows "Using project root from CLI"
- Uses the feature template from the correct templates directory
- Creates task with template structure
- Task includes template content and correct metadata

#### List Templates
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test list-templates`

**Expected Output**:
- Shows templates from the configured root's templates directory
- Lists feature and bug templates
- Doesn't show templates from other directories

#### Create Task Without Template
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create "Manual Task" --type "🌟 Feature" --phase TEST`

**Expected Output**:
- Creates task without template
- Still respects the root directory configuration
- Uses default task structure

### 10. Error Cases

#### Invalid Root
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/nonexistent task list`

**Expected Output**:
- Error message about invalid project root
- Exits with error code

#### Missing .tasks Directory
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test task list`

**Expected Output**:
- Error message about missing .tasks directory
- Falls back to auto-detection or fails

#### Template Not Found
**Command**: `bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create "Test" --type "🌟 Feature" --template nonexistent`

**Expected Output**:
- Error message about template not found
- Shows available templates from list-templates command

## Test Script

Create a test script `test/run-root-dir-e2e.sh`:
```bash
#!/bin/bash
set -e

echo "=== CLI Root Directory E2E Tests ==="

# Setup test directories
mkdir -p e2e_test/worktree-test/.tasks/TEST/FEATURE_Auth
mkdir -p e2e_test/main-branch/.tasks/PROD
mkdir -p e2e_test/feature-branch/.tasks/DEV

# Create test tasks
cat > e2e_test/worktree-test/.tasks/TEST/TEST-ROOTCONFIG-001.md << 'EOF'
+++
id = "TEST-ROOTCONFIG-001"
title = "Test Root Configuration"
type = "test"
status = "🟡 To Do"
phase = "TEST"
+++

# Test Root Configuration
Test task for root configuration
EOF

# Run tests...
echo "Test 1: CLI Parameter"
bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list

echo "Test 2: Environment Variable"
SCOPECRAFT_ROOT=./e2e_test/worktree-test bun run ./src/cli/cli.ts task list

# ... continue with all test cases
```

## Success Criteria

1. All configuration methods work independently
2. Precedence order is respected (CLI > ENV > Config > Auto)
3. CRUD operations respect the configured root
4. No cross-contamination between different roots
5. Error handling works appropriately
6. Relative and absolute paths both work
7. Worktree-like scenarios function correctly

## Notes

- Always run from the project root directory unless testing auto-detection
- Clean up test directories between runs if testing isolation
- Consider creating a cleanup script to reset test state
- Test both relative and absolute paths where applicable