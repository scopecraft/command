# Task Finish

Complete a task's workflow by analyzing git history, updating implementation logs, and performing a merge.

## Context

```javascript
const { taskId, mergePreference, worktreeDir, mainRepoPath } = JSON.parse('$ARGUMENTS');
```

## Process

1. Check if task already has a complete implementation log
   - Fetch task details and examine content
   - If implementation log exists and is complete, skip to step 3

2. Create/update implementation log
   - Analyze git history: `git log main..HEAD --pretty=format:"%h %s"`
   - Summarize changed files: `git diff --stat main..HEAD`
   - Create implementation log with:
     ```markdown
     ## Implementation Log
     
     ### Changes
     - [Key changes from commits]
     
     ### Approach
     - [Summary based on commit analysis]
     ```
   - Update acceptance criteria status based on implementation

3. Execute merge strategy
   - For local merge:
     ```bash
     git checkout main
     git merge --no-ff $taskId -m "Merge task $taskId: [task title]"
     git push origin main
     ```
   - For PR creation:
     ```bash
     git push -u origin $taskId
     gh pr create --base main --head $taskId --title "Task $taskId: [task title]" --body "[PR description]"
     ```

4. Clean up
   - Remove worktree only after successful merge
   - Report completion status

Remember to use proper error handling and provide clear status messages.