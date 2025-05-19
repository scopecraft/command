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

# Test 5: Task Create with New Signatures
run_test "Task Create with Options" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task create --title 'Test Task' --type 'feature' --subdirectory 'TEST'" \
    "created successfully"

# Test 6: Task Update with New Signatures  
run_test "Task Update with Options" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task update TEST-ROOTCONFIG-001 --status 'Done' --search-phase TEST" \
    "successfully"
run_test "Auto-detection" \
    "cd e2e_test/worktree-test && bun run ../../src/cli/cli.ts task list" \
    "TEST-ROOTCONFIG-001"

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

# Test 8: List with Phase Filter
run_test "List with Phase Filter" \
    "bun run ./src/cli/cli.ts --root-dir ./e2e_test/worktree-test task list --phase TEST" \
    "TEST-ROOTCONFIG-001"

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

# Test 17: Invalid Root
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