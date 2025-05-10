#!/bin/bash

# This script tests the subdirectory functionality 
# for MDTM directory structure support

echo "Testing MDTM directory structure support"
echo "========================================"

# Init if not already
bun run dev:cli -- init

# Create a phase if not exists
bun run dev:cli -- phase-create --id "test-phase" --name "Test Phase"

# Create a feature overview task
echo "Creating feature overview task..."
bun run dev:cli -- create --title "Authentication Feature" --type "🌟 Feature" \
  --id "_overview" --phase "test-phase" --subdirectory "FEATURE_Authentication" \
  --priority "🔥 Highest"

# Create subtasks within the feature directory
echo "Creating subtasks in feature directory..."
bun run dev:cli -- create --title "Login Form UI" --type "🌟 Feature" \
  --phase "test-phase" --subdirectory "FEATURE_Authentication" \
  --priority "🔼 High"

bun run dev:cli -- create --title "Login Backend API" --type "🌟 Feature" \
  --phase "test-phase" --subdirectory "FEATURE_Authentication" \
  --priority "🔼 High"

# Create a task in a different feature directory
echo "Creating task in another feature directory..."
bun run dev:cli -- create --title "User Profiles Feature" --type "🌟 Feature" \
  --id "_overview" --phase "test-phase" --subdirectory "FEATURE_UserProfiles" \
  --priority "▶️ Medium"

# List tasks in specific subdirectories
echo "Listing tasks in Authentication feature..."
bun run dev:cli -- list --phase "test-phase" --subdirectory "FEATURE_Authentication"

echo "Listing tasks in UserProfiles feature..."
bun run dev:cli -- list --phase "test-phase" --subdirectory "FEATURE_UserProfiles"

# List only overview files
echo "Listing only overview files..."
bun run dev:cli -- list --overview

# Update a task
echo "Updating a task's subdirectory..."
TASK_ID=$(bun run dev:cli -- list --phase "test-phase" --subdirectory "FEATURE_Authentication" | grep -v "_overview" | grep -v "Title" | head -1 | awk '{print $1}')

if [ ! -z "$TASK_ID" ]; then
  echo "Moving task $TASK_ID to new subdirectory..."
  bun run dev:cli -- update "$TASK_ID" --search-phase "test-phase" \
    --search-subdirectory "FEATURE_Authentication" \
    --subdirectory "FEATURE_UserProfiles"
  
  echo "Listing tasks in UserProfiles feature after move..."
  bun run dev:cli -- list --phase "test-phase" --subdirectory "FEATURE_UserProfiles"
fi

echo "Test completed!"