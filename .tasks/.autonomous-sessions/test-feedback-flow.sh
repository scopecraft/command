#!/bin/bash

# Test script for autonomous feedback flow
# This script demonstrates the complete feedback flow cycle

echo "🧪 Autonomous Feedback Flow Test"
echo "================================"
echo ""

# Test task ID
TASK_ID="test-feedback-scenario-task-05A"

echo "📋 Test Task: $TASK_ID"
echo ""

# Step 1: Show initial task state
echo "1️⃣ Initial Task State:"
echo "----------------------"
bun run dev:cli task get $TASK_ID --format summary
echo ""

# Step 2: Start autonomous execution
echo "2️⃣ Starting Autonomous Execution:"
echo "---------------------------------"
echo "Command: ./implement-auto $TASK_ID"
echo ""
echo "This will:"
echo "  - Create a new session"
echo "  - Start detached execution"
echo "  - Save session info to .tasks/.autonomous-sessions/"
echo "  - Begin logging to .tasks/.autonomous-sessions/logs/"
echo ""

# Step 3: Monitor instructions
echo "3️⃣ Monitoring Options:"
echo "---------------------"
echo "  a) Web UI: http://localhost:5174/autonomous"
echo "  b) Session files: ls -la .tasks/.autonomous-sessions/"
echo "  c) Logs: tail -f .tasks/.autonomous-sessions/logs/task-$TASK_ID-*.log"
echo ""

# Step 4: Feedback instructions
echo "4️⃣ Providing Feedback:"
echo "---------------------"
echo "When the task needs feedback, use:"
echo "  ./implement-auto --continue $TASK_ID \"Your feedback message\""
echo ""
echo "Example feedback messages:"
echo "  - \"Use Option B with comprehensive testing\""
echo "  - \"Go with the simple approach (Option A)\""
echo "  - \"Option C - integrate with existing framework\""
echo ""

# Step 5: Expected flow
echo "5️⃣ Expected Flow:"
echo "----------------"
echo "1. Task analyzes codebase"
echo "2. Task documents decision point in markdown"
echo "3. Task adds question to Tasks section"
echo "4. Task either pauses or continues with assumption"
echo "5. Human provides feedback via continue command"
echo "6. Task processes feedback and completes work"
echo ""

# Step 6: Verification
echo "6️⃣ Verification:"
echo "---------------"
echo "After execution, check:"
echo "  - Task markdown file for updates"
echo "  - Session status in UI"
echo "  - Log file for execution trace"
echo "  - Questions documented in Tasks section"
echo ""

echo "✅ Test setup complete. Run the commands above to test the feedback flow."