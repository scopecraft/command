# Task Finish

Complete a task's workflow by performing a merge, updating implementation logs, and cleaning up.

## Context

I'm finishing task $ARGUMENTS which provides:
- taskId: The ID of the task being finished
- mergePreference: Either "local" or "pr" to determine merge strategy
- worktreeDir: Path to the git worktree directory

## Process

1. Verify the worktree exists
   - Use `git worktree list | grep $taskId` to confirm the worktree exists
   - If not found, report error and exit

2. Execute merge strategy FIRST (we're already on main branch)
   - If mergePreference is "local":
     ```bash
     # Perform local merge directly to main
     git merge --no-ff $taskId -m "Merge task $taskId: [task title]"
     git push origin main
     ```
   - If mergePreference is "pr":
     ```bash
     # Create pull request
     git push -u origin $taskId
     gh pr create --base main --head $taskId --title "Task $taskId: [task title]" --body "[PR description based on commits]"
     ```

3. Update implementation log AFTER merge (only for local merge)
   - If mergePreference is "local":
     - Analyze git history: `git log --pretty=format:"%h %s" HEAD~10..HEAD | grep $taskId`
     - Summarize changed files from merge commit
     - Create/update implementation log in the task file
     - Commit documentation update: `git commit -am "Update implementation log for task $taskId"`
     - Push update: `git push origin main`

4. Clean up
   - For local merge:
     - Remove worktree: `git worktree remove "${worktreeDir}"`
     - Remove branch if locally merged: `git branch -d $taskId`
   - For PR:
     - The worktree will be removed after PR is merged

5. Report completion status
   - For local merge: "Task $taskId has been merged to main and documentation updated"
   - For PR: "Pull request created for task $taskId"

Remember to use proper error handling and provide clear status messages at each step.