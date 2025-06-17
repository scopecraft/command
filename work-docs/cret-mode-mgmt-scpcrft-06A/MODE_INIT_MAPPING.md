# Mode System Init Mapping

This document specifies exactly what files need to be copied by `sc init` when setting up modes for a new project.

## Source → Destination Mapping

### Mode Templates
Copy from `src/templates/modes/` to project's `.tasks/.modes/`:

```
src/templates/modes/exploration/base.md      → .tasks/.modes/exploration/base.md
src/templates/modes/design/base.md           → .tasks/.modes/design/base.md
src/templates/modes/implementation/base.md   → .tasks/.modes/implementation/base.md
src/templates/modes/orchestration/autonomous.md → .tasks/.modes/orchestration/autonomous.md
src/templates/modes/planning/base.md         → .tasks/.modes/planning/base.md
src/templates/modes/meta/base.md             → .tasks/.modes/meta/base.md
src/templates/modes/guidance/project-setup.md → .tasks/.modes/guidance/project-setup.md
```

### Area Directories
Create empty area directories for future customization:
```
.tasks/.modes/exploration/area/
.tasks/.modes/design/area/
.tasks/.modes/implementation/area/
.tasks/.modes/orchestration/area/
.tasks/.modes/planning/area/
.tasks/.modes/meta/area/
```

### Claude Commands (Production Versions)
Copy from `src/templates/claude-commands/` to project's `.claude/commands/`:

```
src/templates/claude-commands/mode-init.md   → .claude/commands/mode-init.md
src/templates/claude-commands/mode-update.md → .claude/commands/mode-update.md
```

**IMPORTANT**: The production claude commands in `src/templates/claude-commands/` should NOT have:
- Test directory warnings
- `.modes-test/` references
- Safety warnings about production directories

They should save directly to `.tasks/.modes/` for production use.

## Files Created in This Task

### Templates Created (7 files):
1. `src/templates/modes/exploration/base.md`
2. `src/templates/modes/design/base.md`
3. `src/templates/modes/implementation/base.md`
4. `src/templates/modes/orchestration/autonomous.md`
5. `src/templates/modes/planning/base.md`
6. `src/templates/modes/meta/base.md`
7. `src/templates/modes/guidance/project-setup.md`

### Claude Commands Created (2 files):
1. `src/templates/claude-commands/mode-init.md`
2. `src/templates/claude-commands/mode-update.md`

### Key Features to Preserve:
- **Stakeholder Context**: All modes include placeholder for AI stakeholder role
- **Placeholder Pattern**: `<!-- PLACEHOLDER: description -->` with examples
- **Minimal Templates**: Except planning/orchestration which are complete
- **External Tool Requirements**: Emphasis on WebSearch for current info
- **Project Rules**: Recommendations + placeholders for specifics

## Init Command Requirements

The `sc init` command should:

1. **Create Directory Structure**: All mode directories with area subdirectories
2. **Copy Mode Templates**: All 7 template files to correct locations
3. **Copy Claude Commands**: Production versions to `.claude/commands/`
4. **Preserve Permissions**: Ensure files are readable/writable
5. **Optional Customization**: Could prompt for project type to pre-fill some placeholders

## Post-Init Instructions

After copying, the user should be instructed to:

1. **Customize Placeholders**: Fill in project-specific information
2. **Define Stakeholder Context**: Choose appropriate AI role for project
3. **Add Project Rules**: Specify linting commands, area boundaries, etc.
4. **Test with Commands**: Use `@mode-init` and `@mode-update` to refine

This ensures the mode system is immediately usable while encouraging project-specific customization.

## Key Design Decisions (from MVP)

### Template Design
- **Placeholder Pattern**: Use `<!-- PLACEHOLDER: description -->` with inline examples
- **Minimal Content**: System modes (orchestration, planning) are complete, others are stubs
- **Progressive Disclosure**: Users can build up complexity over time
- **Stakeholder Context**: All modes include AI stakeholder role placeholder

### Command Format
- **Claude Commands**: Use `$ARGUMENTS` for positional arguments
- **No Frontmatter**: Simple markdown format (not ChannelCoder format)
- **Production vs Test**: Production saves to `.tasks/.modes/`, test versions to `.modes-test/`

## Testing Infrastructure Created

For testing the mode system, we also created:
- `.claude/commands/mode-test.md` - Test scenarios command
- `.claude/commands/mode-baseline.md` - Baseline establishment command
- Enhanced `.claude/commands/mode-init.md` - With test directory support

These are NOT copied by sc init - they're for development/testing only.