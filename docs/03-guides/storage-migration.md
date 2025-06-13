---
title: "Storage Migration Guide"
description: "How to migrate from legacy .tasks/ storage to centralized storage"
version: "1.0"
status: "draft"
category: "guide"
updated: "2025-06-13"
authors: ["system"]
related:
  - ../02-architecture/system-architecture.md
  - ../02-architecture/code-organization.md
---

# Storage Migration Guide

## Overview

Scopecraft v2.1 introduces centralized task storage to solve common issues with git-based task storage:
- Prevents merge conflicts in task files
- Enables task sharing across git worktrees
- Keeps task data private (not in version control)
- Improves performance for large task archives

## Migration Checklist

### Before Migration

1. **Backup Your Tasks**
   ```bash
   # Create a backup of your current tasks
   cp -r .tasks/ .tasks.backup/
   ```

2. **Commit Any Pending Changes**
   ```bash
   git add .
   git commit -m "Backup before storage migration"
   ```

3. **Check Current Task Status**
   ```bash
   sc task list --all
   ```

### Running the Migration

The migration happens automatically when you use Scopecraft commands. The system detects your current storage mode and migrates as needed.

1. **Update Scopecraft**
   ```bash
   npm update -g @scopecraft/cmd
   ```

2. **Initialize Centralized Storage**
   ```bash
   # This creates the new structure while preserving existing tasks
   sc init
   ```

3. **Verify Migration**
   ```bash
   # Check that tasks are accessible
   sc task list
   
   # Verify specific tasks
   sc task get <task-id>
   ```

### Post-Migration

1. **Update .gitignore**
   ```bash
   # Add to .gitignore if not already present
   echo ".tasks/backlog/" >> .gitignore
   echo ".tasks/current/" >> .gitignore
   echo ".tasks/archive/" >> .gitignore
   ```

2. **Remove Old Task Files from Git**
   ```bash
   # Only if you're sure migration succeeded
   git rm -r --cached .tasks/backlog/ .tasks/current/ .tasks/archive/
   git commit -m "Remove task data from version control"
   ```

## Understanding the New Structure

### What Stays in Your Repository

```
.tasks/
├── .templates/    # Task templates (version controlled)
└── .modes/        # AI execution modes (version controlled)
```

### What Moves to Centralized Storage

```
~/.scopecraft/projects/{encoded-project-path}/
└── tasks/
    ├── backlog/   # Pending tasks
    ├── current/   # Active tasks
    └── archive/   # Completed tasks
```

### Project Path Encoding

Your project path is encoded to create a unique storage location:
- `/Users/alice/projects/myapp` → `users-alice-projects-myapp`
- This ensures each project has isolated task storage
- All worktrees of the same repository share task storage

## Common Scenarios

### Multiple Worktrees

If you use git worktrees:
```bash
# Main repository
cd /projects/myapp
sc init

# Worktree - automatically uses same task storage
cd /projects/myapp-feature-branch
sc task list  # Shows same tasks as main
```

### Team Collaboration

Since tasks are no longer in git:
- Each team member has their own local task copies
- Use `docs/work/` for shared design documents
- Consider using project management tools for team-wide task tracking

### CI/CD Integration

For CI environments:
- Tasks are not available (not in git)
- Use environment detection to skip task-dependent operations
- Consider future cloud storage options for CI access

## Troubleshooting

### "Tasks not found" after migration

1. Check storage location:
   ```bash
   ls ~/.scopecraft/projects/
   ```

2. Verify project detection:
   ```bash
   sc env info
   ```

### Duplicate tasks appearing

This can happen if both legacy and centralized storage exist:
1. Check for legacy tasks: `ls .tasks/`
2. Remove legacy tasks after confirming migration: `rm -rf .tasks/{backlog,current,archive}`

### Wrong project path detected

If tasks appear in wrong location:
1. Check main repository root: `git rev-parse --show-toplevel`
2. Ensure you're not in a submodule or nested repository

## Rollback Procedure

If you need to revert to legacy storage:

1. **Copy tasks back to repository**
   ```bash
   cp -r ~/.scopecraft/projects/*/tasks/* .tasks/
   ```

2. **Restore from backup**
   ```bash
   cp -r .tasks.backup/* .tasks/
   ```

3. **Downgrade Scopecraft**
   ```bash
   npm install -g @scopecraft/cmd@2.0.0
   ```

## Future Considerations

### Planned Features

- **Storage Mode Configuration**: Toggle between legacy and centralized
- **Cloud Storage**: Optional cloud backup for team sharing
- **Migration Tools**: Dedicated migration commands
- **Storage Analytics**: Track storage usage and optimization

### Best Practices

1. **Regular Backups**: Export important tasks periodically
2. **Documentation**: Keep design docs in `docs/work/` (version controlled)
3. **Task Hygiene**: Archive completed tasks monthly
4. **Team Coordination**: Establish clear ownership of tasks

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/scopecraft/scopecraft-command/issues)
2. Join our Discord community
3. Review the [Architecture Documentation](../02-architecture/system-architecture.md)

## Summary

The centralized storage migration is designed to be transparent and automatic. Most users won't need to take any action beyond updating Scopecraft. The new architecture provides better performance, prevents conflicts, and enables new workflows while maintaining the same CLI interface you're familiar with.