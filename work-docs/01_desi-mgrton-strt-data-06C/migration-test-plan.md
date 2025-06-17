# Migration Test Plan

## Test Scenarios

### 1. Simple Task Migration
- Create simple tasks in backlog/
- Run migration
- Verify tasks moved to current/ with phase: 'backlog'

### 2. Parent Task Migration
- Create parent task folder in backlog/
- Add _overview.md and multiple subtasks
- Verify entire folder moves together
- Verify all files get phase metadata

### 3. Mixed Workflow States
- Have tasks in backlog/, current/, and archive/
- Verify only backlog tasks are migrated
- Verify current and archive remain untouched

### 4. Error Handling
- Test with read-only files
- Test with missing permissions
- Verify rollback works correctly

### 5. Dry Run Mode
- Run with --dry-run
- Verify no actual changes
- Verify accurate preview

### 6. Backup and Restore
- Create backup
- Simulate failure
- Restore from backup
- Verify data integrity

## Test Data Structure

```
~/.scopecraft/projects/test-project/tasks/
├── backlog/
│   ├── simple-task-123.task.md
│   ├── another-task-456.task.md
│   └── parent-task-789/
│       ├── _overview.md
│       ├── 01_subtask-abc.task.md
│       └── 02_subtask-def.task.md
├── current/
│   └── existing-task-999.task.md
└── archive/
    └── 2025-01/
        └── completed-task-111.task.md
```

## Expected Results

After migration:
```
~/.scopecraft/projects/test-project/tasks/
├── current/
│   ├── simple-task-123.task.md      # phase: backlog
│   ├── another-task-456.task.md     # phase: backlog
│   ├── parent-task-789/             # moved intact
│   │   ├── _overview.md             # phase: backlog
│   │   ├── 01_subtask-abc.task.md   # phase: backlog
│   │   └── 02_subtask-def.task.md   # phase: backlog
│   └── existing-task-999.task.md    # unchanged
└── archive/
    └── 2025-01/
        └── completed-task-111.task.md  # unchanged
```

## Rollback Strategy

The migration script provides several rollback mechanisms:

### 1. Automatic Backup
- Created before any changes
- Timestamped for identification
- Complete copy of tasks directory

### 2. Manual Rollback Steps
```bash
# Remove migrated state
rm -rf ~/.scopecraft/projects/{encoded}/tasks

# Restore from backup
mv ~/.scopecraft/projects/{encoded}/tasks-backup-{timestamp} \
   ~/.scopecraft/projects/{encoded}/tasks
```

### 3. Partial Rollback
- If migration fails partway, backup can be used to restore
- Script tracks which tasks succeeded/failed
- Can manually fix specific issues

### 4. Prevention Measures
- Dry run mode for preview
- Verbose logging for debugging
- Atomic operations where possible

## Validation Checklist

After migration:
- [ ] All backlog tasks moved to current/
- [ ] All tasks have phase: 'backlog' in frontmatter
- [ ] Parent tasks remain intact with subtasks
- [ ] No data loss or corruption
- [ ] Current and archive tasks unchanged
- [ ] Backlog directory removed
- [ ] Backup created successfully