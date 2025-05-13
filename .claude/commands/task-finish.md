# Task Finish

Complete a task's workflow by performing a merge, updating implementation logs, and cleaning up.

## Context

I'm finishing task $ARGUMENTS which provides:
- taskId: The ID of the task being finished 
- mergePreference: Either "local" or "pr" to determine merge strategy
- worktreeDir: Path to the git worktree directory

## Process

**IMPORTANT: Follow these steps EXACTLY in order. Do not deviate.**

First, stay in the main repository directory where you are already running. Do NOT navigate to the worktree directory.

### 1. Verify current state

```bash
# Verify we're on main branch in the main repo
git branch --show-current

# Check worktree existence
git worktree list | grep ${taskId}

# Get task title for commit messages
TASK_TITLE=$(grep "title" .tasks/*/${taskId}.md | head -1 | cut -d "=" -f2 | tr -d '"' | xargs)
```

### 2. Merge workflow (we are already on main branch)

If mergePreference is "local":

```bash
# Ensure main branch is up to date
git pull origin main

# Merge the branch - DO NOT checkout the branch
git merge --no-ff ${taskId} -m "Merge task ${taskId}: ${TASK_TITLE}"

# Verify merge was successful
git log -1

# Push the merge to remote
git push origin main
```

If mergePreference is "pr":

```bash
# Push the branch to remote
git push -u origin ${taskId}

# Create pull request
gh pr create --base main --head ${taskId} --title "Task ${taskId}: ${TASK_TITLE}" --body "Completes task ${taskId}"
```

### 3. Update task status after merge (local merge only)

For local merge only:

```bash
# Make sure we have the latest changes after pushing the merge
git pull origin main

# Find task file
TASK_FILE=$(find .tasks -name "${taskId}.md" | head -1)
if [ -z "$TASK_FILE" ]; then
  echo "Could not find task file for ${taskId}"
  # Try searching more broadly
  TASK_FILE=$(find . -name "${taskId}.md" | head -1)
  if [ -z "$TASK_FILE" ]; then
    echo "ERROR: Task file not found. Skipping status update."
    # Continue with cleanup to avoid leaving the worktree
    return 0
  fi
fi

echo "Found task file at: ${TASK_FILE}"

# Update task status to completed if needed
if ! grep -q "status = \"🟢 Done\"" "${TASK_FILE}"; then
  # Use sed to update status line
  sed -i '' 's/status = ".*"/status = "🟢 Done"/' "${TASK_FILE}"
  
  # Update the updated_date field
  TODAY=$(date +%Y-%m-%d)
  sed -i '' 's/updated_date = ".*"/updated_date = "'${TODAY}'"/' "${TASK_FILE}"
  
  echo "Updated task status to completed"
  
  # Commit and push the task status update
  echo "Committing task status update..."
  git add "${TASK_FILE}"
  git commit -m "Mark task ${taskId} as completed"
  git push origin main
fi
```

### 4. Clean up

For local merge:

```bash
# Remove the worktree
git worktree remove "${worktreeDir}"

# Delete the branch since it's merged
git branch -d ${taskId}

# Verify cleanup
git worktree list
```

For PR:

```bash
# Nothing to clean up now - worktree will be removed after PR is merged
echo "Pull request created. Worktree will be removed after PR is merged."
```

### 5. Report completion

For local merge:
```bash
echo "Task ${taskId} has been merged to main, marked as completed, and worktree removed."
```

For PR:
```bash
echo "Pull request created for task ${taskId}. Remember to remove the worktree after merging."
```