# Analyze integration impacts

---
type: spike
status: in_progress
area: core
---


## Instruction
Analyze how the storage migration impacts existing integrations and workflows.

Key integration points:
1. **Worktree workflows**: How worktrees will share task visibility
2. **Docker execution**: Container access to ~/.scopecraft
3. **Session management**: Impact on .sessions/ storage (should it move too?)
4. **MCP server**: Changes needed for AI agents to access external paths
5. **CLI commands**: Impact on task listing, creation, updates
6. **Fish shell integration**: Updates to tw-start.fish and related scripts

**Important**: Review task refc-env-config-fnctnlcmpsble-06A which is refactoring the ConfigurationManager/env system. Their regression tests and patterns will be crucial for our migration.

Focus on identifying breaking changes and mitigation strategies.

## Tasks
- [ ] Map all code touching .tasks/ directory
- [ ] Review refc-env-config-fnctnlcmpsble-06A implementation and tests
- [ ] Analyze worktree service integration points
- [ ] Review Docker mode implementation for volume mounting
- [ ] Check MCP permission model for external file access
- [ ] List affected CLI commands and their changes
- [ ] Review fish shell scripts that assume .tasks/ location
- [ ] Identify test suite impacts

## Deliverable
Impact analysis document including:
- Complete list of affected modules/files
- Breaking changes for each integration
- Mitigation strategies
- Testing requirements (including refc-env tests)
- Rollback considerations

## Log
