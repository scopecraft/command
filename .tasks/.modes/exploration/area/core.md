# Core Area - Exploration Mode

## Storage System Specifics

When exploring storage-related code:
- Path resolution is centralized in `src/core/paths/`
- Tasks are stored outside the repository in `~/.scopecraft/projects/{encoded}/tasks/`
- All worktrees share the same task storage
- Use `createPathContext()` and `resolvePath()` for all path operations

**IF** you need deep understanding of storage architecture:
- `docs/02-architecture/system-architecture.md#storage-architecture` - Full architecture
- `src/core/paths/README.md` - Path resolution implementation details