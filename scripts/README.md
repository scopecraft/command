# Scopecraft Scripts

This directory contains utility scripts for Scopecraft operations.

## migrate-to-centralized-storage.ts

Migrates tasks from local `.tasks/` directory to the new centralized storage location at `~/.scopecraft/projects/{encoded}/tasks/`.

### Usage

```bash
# Preview what will be migrated (recommended first step)
bun scripts/migrate-to-centralized-storage.ts --dry-run

# Perform the actual migration
bun scripts/migrate-to-centralized-storage.ts

# Force overwrite any conflicts without prompting
bun scripts/migrate-to-centralized-storage.ts --force
```

### Features

- Migrates tasks from `backlog/`, `current/`, and `archive/` workflows
- Preserves directory structure including parent task folders
- Detects conflicts and shows task metadata (title, status, type) for resolution
- Interactive conflict resolution with options to:
  - Keep local version (overwrite central)
  - Keep central version (skip local)
  - Skip the file entirely
- Works correctly from worktrees (detects main repository)
- Provides migration summary with counts

### What it migrates

- All `.task.md` files
- Parent task `_overview.md` files
- Preserves the complete directory structure

### What it doesn't migrate (yet)

- Templates (`.tasks/.templates/`)
- Modes (`.tasks/.modes/`)
- Session data (`.sessions/`)

These require special handling due to potential sharing models (user-level vs project-level).

### After migration

Once migration is complete and verified, you can safely remove the local `.tasks/` directory:

```bash
rm -rf .tasks/
```