# Core Area - Design Mode

## Storage Architecture Constraints

When designing core features:
- Tasks must be stored in centralized location (`~/.scopecraft/projects/{encoded}/`)
- All path resolution goes through `src/core/paths/path-resolver.ts`
- Worktrees share storage by using main repository root
- Templates and modes stay in repository (`.tasks/`)