#!/bin/bash
# E2E Test Script for CLI Root Directory Configuration
set -e

echo "=== CLI Root Directory E2E Tests ==="
echo "Running from: $(pwd)"
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "${YELLOW}Test: $test_name${NC}"
    echo "Command: $command"
    
    # Run command and capture output
    output=$(eval "$command" 2>&1) || true
    
    # Check if expected pattern is in output
    if echo "$output" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✓ PASSED${NC} - Found expected pattern: $expected_pattern"
    else
        echo -e "${RED}✗ FAILED${NC} - Expected pattern not found: $expected_pattern"
        echo "Output was:"
        echo "$output"
    fi
    echo
}

# Cleanup previous test data
echo "Cleaning up previous test data..."
rm -rf e2e_test
mkdir -p e2e_test

# Setup test directories
echo "Setting up test directory structure..."
mkdir -p e2e_test/worktree-test/.tasks/TEST/FEATURE_Auth
mkdir -p e2e_test/worktree-test/.tasks/templates
mkdir -p e2e_test/main-branch/.tasks/PROD
mkdir -p e2e_test/feature-branch/.tasks/DEV

# Create test tasks
echo "Creating test tasks..."
cat > e2e_test/worktree-test/.tasks/TEST/TEST-ROOTCONFIG-001.md << 'EOF'
+++
id = "TEST-ROOTCONFIG-001"
title = "Test Root Configuration"
type = "test"
status = "🟡 To Do"
phase = "TEST"
+++

# Test Root Configuration
This task tests that root configuration works correctly.
EOF

# Create feature overview file
cat > e2e_test/worktree-test/.tasks/TEST/FEATURE_Auth/_overview.md << 'EOF'
+++
id = "_overview"
title = "Authentication"
type = "🌟 Feature"
status = "🟡 To Do"
phase = "TEST"
+++

# Authentication Feature
Overview of the authentication feature.
EOF

cat > e2e_test/worktree-test/.tasks/TEST/FEATURE_Auth/AUTH-001.md << 'EOF'
+++
id = "AUTH-001"
title = "Authentication Feature Task"
type = "feature"
status = "🔴 To Do"
phase = "TEST"
+++

# Authentication Feature Task
Task in a subdirectory
EOF

cat > e2e_test/main-branch/.tasks/PROD/PROD-001.md << 'EOF'
+++
id = "PROD-001"
title = "Production Task"
phase = "PROD"
type = "task"
status = "🟡 To Do"
+++

Task in main branch
EOF

cat > e2e_test/feature-branch/.tasks/DEV/DEV-001.md << 'EOF'
+++
id = "DEV-001"
title = "Development Task"
phase = "DEV"
type = "task"
status = "🟡 To Do"
+++

Task in feature branch
EOF

# Copy template files
echo "Setting up template files..."
cat > e2e_test/worktree-test/.tasks/templates/01_mdtm_feature.md << 'EOF'
+++
id = ""               # Will be auto-generated if not provided
title = ""            # REQUIRED: Human-readable title
status = "🟡 To Do"    # Current status
type = "🌟 Feature"    # Type of task
priority = "▶️ Medium" # Priority level
created_date = ""     # Will be auto-filled
updated_date = ""     # Will be auto-filled
assigned_to = ""      # Who is responsible for this task
tags = []             # Relevant keywords
+++

# [Title]

## Description ✍️
Describe the feature in detail.

## Acceptance Criteria ✅
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes 📝
Add any technical details or implementation considerations here.
EOF

cat > e2e_test/worktree-test/.tasks/templates/02_mdtm_bug.md << 'EOF'
+++
id = ""               # Will be auto-generated if not provided
title = ""            # REQUIRED: Human-readable title
status = "🟡 To Do"    # Current status
type = "🐞 Bug"        # Type of task
priority = "🔼 High"   # Priority level
created_date = ""     # Will be auto-filled
updated_date = ""     # Will be auto-filled
assigned_to = ""      # Who is responsible for this task
tags = []             # Relevant keywords
+++

# [Title]

## Description ✍️
Describe the bug in detail.

## Steps to Reproduce 🔄
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior ✓
What should happen?

## Actual Behavior ✗
What actually happens?

## Fix Implementation 🔧
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add regression test
EOF

# Create test config file
cat > e2e_test/config.json << EOF
{
  "version": "1.0.0",
  "projects": [
    {
      "name": "worktree-test",
      "path": "$(pwd)/e2e_test/worktree-test"
    }
  ],
  "defaultProject": "worktree-test"
}
EOF

echo "Starting tests..."
echo "================="

# Test 1: CLI Parameter
run_test "CLI Parameter" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list" \
    "Using project root from CLI"

# Test 2: Environment Variable
run_test "Environment Variable" \
    "SCOPECRAFT_ROOT=./e2e_test/worktree-test bun run ./src/cli/cli.ts task list" \
    "TEST-ROOTCONFIG-001"

# Test 3: Configuration File
run_test "Configuration File" \
    "bun run ./src/cli/cli.ts --config ./e2e_test/config.json task list" \
    "Using config file"

# Test 4: Auto-detection
run_test "Auto-detection" \
    "cd e2e_test/worktree-test && bun run ../../src/cli/cli.ts task list" \
    "TEST-ROOTCONFIG-001"

# Test 5: Task Create with New Signatures
run_test "Task Create with Options" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --title 'Test Task' --type 'feature' --subdirectory 'TEST'" \
    "created successfully"

# Test 6: Task Update with New Signatures  
run_test "Task Update with Options" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task update TEST-ROOTCONFIG-001 --status 'Done' --search-phase TEST" \
    "successfully"

# Test 5: CLI > ENV Precedence
run_test "CLI > ENV Precedence" \
    "SCOPECRAFT_ROOT=./ bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list" \
    "Using project root from CLI"

# Test 6: Get Task
run_test "Get Task" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task get TEST-ROOTCONFIG-001" \
    "Test Root Configuration"

# Test 7: Update Task
run_test "Update Task" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task update TEST-ROOTCONFIG-001 --status \"🟢 Done\"" \
    ""

# Verify update worked
run_test "Verify Update" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task get TEST-ROOTCONFIG-001" \
    "🟢 Done"

# Create a new task for phase filter test that isn't done
run_test "Create Task for Phase Filter" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --id 'TEST-PHASE-001' --title 'Phase Filter Test' --type 'test' --phase TEST" \
    "created successfully"

# Test 8: List with Phase Filter  
run_test "List with Phase Filter" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --phase TEST" \
    "TEST-PHASE-001"

# Test 9: List with Subdirectory Filter
run_test "List with Subdirectory Filter" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --subdirectory FEATURE_Auth" \
    "AUTH-001"

# Test 10: Main Branch Worktree
run_test "Main Branch Worktree" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/main-branch task list" \
    "PROD-001"

# Test 11: Feature Branch Worktree
run_test "Feature Branch Worktree" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/feature-branch task list" \
    "DEV-001"

# Test 12: Template Operations - List Templates
run_test "List Templates" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test template list" \
    "feature"

# Test 13: Create Task with Template
run_test "Create Task with Template" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --title \"Template Test Feature\" --type \"🌟 Feature\" --template feature --phase TEST" \
    "created successfully"

# Test 14: Verify Template Content
run_test "Verify Template Task" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --phase TEST" \
    "Template Test Feature"

# Test 15: Create Task without Template  
run_test "Create Task without Template" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --title \"Manual Task\" --type \"🌟 Feature\" --phase TEST" \
    "created successfully"

# Test 16: Template Not Found
run_test "Template Not Found (Should Fail)" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --title \"Test\" --type \"🌟 Feature\" --template nonexistent" \
    "not found"

# Test 17: Feature Create
run_test "Feature Create" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test feature create --name 'TestFeature' --title 'Test Feature' --phase TEST" \
    "successfully"

# Test 18: Feature List
run_test "Feature List" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test feature list --phase TEST" \
    "FEATURE_"

# Test 19: Feature Get
run_test "Feature Get" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test feature get FEATURE_Auth --phase TEST" \
    "Authentication"

# Test 20: Feature Update
run_test "Feature Update" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test feature update FEATURE_Auth --title 'Updated Auth' --phase TEST" \
    "successfully"

# Test 21: Area Create
run_test "Area Create" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area create --name 'TestArea' --title 'Test Area' --phase TEST" \
    "successfully"

# Test 22: Area List
run_test "Area List" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area list --phase TEST" \
    "AREA_"

# Test 21: Feature Delete with Force
run_test "Feature Delete with Force" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test feature delete FEATURE_TestFeature --phase TEST --force" \
    "deleted successfully"

# Test 23: Area Create
run_test "Area Create" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area create --name 'TestArea' --title 'Test Area' --phase TEST" \
    "successfully"

# Test 24: Area List
run_test "Area List" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area list --phase TEST" \
    "AREA_"

# Test 25: Area Get
run_test "Area Get" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area get AREA_TestArea --phase TEST" \
    "Test Area"

# Test 26: Area Update
run_test "Area Update" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area update AREA_TestArea --title 'Updated Area' --phase TEST" \
    "successfully"

# Test 27: Area Delete
run_test "Area Delete" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test area delete AREA_TestArea --phase TEST --force" \
    "successfully"

# Test 28: Phase Create
run_test "Phase Create" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test phase create --id 'test-phase' --name 'Test Phase'" \
    "Phase test-phase created successfully"

# Test 29: Phase List
run_test "Phase List" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test phase list" \
    "test-phase"

# Test 30: Phase Update
run_test "Phase Update" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test phase update test-phase --name 'Updated Phase'" \
    "Phase test-phase updated successfully"

# Test 31: Phase Delete
run_test "Phase Delete" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test phase delete test-phase --force" \
    "successfully"

# Test 32: Invalid Root
run_test "Invalid Root (Should Fail)" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/nonexistent task list" \
    "Invalid project root"

echo "=== Test Summary ==="
echo "All tests completed. Review output above for any failures."
echo

# Optional: Clean up test data
read -p "Do you want to clean up test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf e2e_test
    echo "Test data cleaned up."
fi