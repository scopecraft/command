+++
id = "FEAT-REFACTORPHASE-0524-4C"
title = "Refactor phase metadata from .phase.toml files to _overview.md pattern"
type = "mdtm_feature"
status = "🟡 To Do"
priority = "▶️ Medium"
created_date = "2025-05-24"
updated_date = "2025-05-24"
assigned_to = ""
phase = "release-v1"
subdirectory = "AREA_Core"
tags = [ "refactoring", "consistency", "phase-management", "cleanup" ]
+++

# Refactor phase metadata from .phase.toml files to _overview.md pattern

## Overview

Refactor phase metadata storage to use the same `_overview.md` pattern as features and areas, eliminating the need for separate `.phase.toml` configuration files. This will provide consistency across all organizational structures and reduce the number of configuration formats.

## Background & Motivation

### Current State
- **Phases**: Use `.phase.toml` files to store metadata (name, description, status, order)
- **Features**: Use `FEATURE_*/\_overview.md` files with YAML frontmatter
- **Areas**: Use `AREA_*/\_overview.md` files with YAML frontmatter

### Problems
1. **Inconsistency**: Different patterns for similar organizational structures
2. **Multiple formats**: Phase metadata in TOML while everything else uses YAML
3. **Complexity**: Special handling needed for `.phase.toml` files
4. **Hidden files**: Dot-prefix makes phase metadata less discoverable

### Solution
Adopt the `_overview.md` pattern for phases, storing metadata in YAML frontmatter within a markdown file at the phase root level.

## Technical Design

### New Phase Structure
```
.tasks/
├── release-v1/
│   ├── _overview.md          # Phase overview (NEW)
│   ├── FEATURE_Auth/
│   │   └── _overview.md
│   ├── AREA_Core/
│   │   └── _overview.md
│   └── TASK-001.md
└── release-v2/
    └── _overview.md          # Phase overview (NEW)
```

### Phase Overview File Format
```yaml
---
id: release-v1
title: Release 1.0
type: mdtm_phase
status: 🔵 In Progress
order: 1
created_date: 2025-01-15
updated_date: 2025-05-24
---

# Release 1.0

## Overview
First major release focusing on core functionality and MCP integration.

## Goals
- Complete core task management features
- Implement MCP server
- Establish MDTM standard

## Timeline
- Start: 2025-01-15
- Target: 2025-06-01
```

## Implementation Steps

### 1. Update Phase Type Definition
- Add `type: 'mdtm_phase'` to identify phase overview files
- Ensure Phase interface matches Task interface where appropriate
- Add phase-specific fields if needed

### 2. Create Migration Logic
```typescript
// In phase-crud.ts or separate migration file
async function migratePhaseTomlToOverview(phaseDir: string): Promise<void> {
  const tomlPath = path.join(phaseDir, '.phase.toml');
  const overviewPath = path.join(phaseDir, '_overview.md');
  
  if (fs.existsSync(tomlPath)) {
    // Read TOML data
    const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
    const phaseData = parseToml(tomlContent);
    
    // Create overview content
    const metadata = {
      ...phaseData,
      type: 'mdtm_phase',
      is_overview: true,
      created_date: phaseData.created_date || new Date().toISOString().split('T')[0],
      updated_date: new Date().toISOString().split('T')[0]
    };
    
    const content = `# ${phaseData.name || phaseData.id}

${phaseData.description || 'Phase description goes here.'}`;
    
    // Write overview file
    const task = { metadata, content };
    fs.writeFileSync(overviewPath, formatTaskFile(task));
    
    // Remove old TOML file
    fs.unlinkSync(tomlPath);
  }
}
```

### 3. Update phase-crud.ts

#### Update listPhases()
```typescript
export async function listPhases(options?: {
  config?: RuntimeConfig;
}): Promise<OperationResult<Phase[]>> {
  try {
    const tasksDir = getTasksDirectory(options?.config);
    const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
    const phases: Phase[] = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !isSystemDirectory(entry.name)) {
        const phaseDir = path.join(tasksDir, entry.name);
        const overviewPath = path.join(phaseDir, '_overview.md');
        
        let phase: Phase = {
          id: entry.name,
          name: entry.name,
          status: '🟡 Pending',
        };

        // Try to load phase info from _overview.md
        if (fs.existsSync(overviewPath)) {
          try {
            const content = fs.readFileSync(overviewPath, 'utf-8');
            const parsed = parseTaskFile(content);
            
            if (parsed.metadata.type === 'mdtm_phase') {
              phase = {
                id: parsed.metadata.id || entry.name,
                name: parsed.metadata.title || parsed.metadata.name || entry.name,
                description: parsed.metadata.description,
                status: parsed.metadata.status || '🟡 Pending',
                order: parsed.metadata.order,
              };
            }
          } catch (error) {
            logger.warn(`Error parsing phase overview for ${entry.name}`);
          }
        }
        
        // Count tasks
        phase.task_count = countTasksInPhase(phaseDir);
        phases.push(phase);
      }
    }

    // Sort phases
    phases.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return (a.id || '').localeCompare(b.id || '');
    });

    return { success: true, data: phases };
  } catch (error) {
    return { success: false, error: `Error listing phases: ${error}` };
  }
}
```

#### Update createPhase()
```typescript
export async function createPhase(
  phase: Phase,
  options?: { config?: RuntimeConfig }
): Promise<OperationResult<Phase>> {
  try {
    const tasksDir = getTasksDirectory(options?.config);
    const phaseDir = path.join(tasksDir, phase.id);

    if (fs.existsSync(phaseDir)) {
      return {
        success: false,
        error: `Phase directory already exists: ${phaseDir}`,
      };
    }

    // Create phase directory
    fs.mkdirSync(phaseDir, { recursive: true });

    // Create _overview.md file
    const overviewPath = path.join(phaseDir, '_overview.md');
    const task = {
      metadata: {
        id: phase.id,
        title: phase.name || phase.id,
        type: 'mdtm_phase',
        status: phase.status || '🟡 Pending',
        order: phase.order,
        created_date: new Date().toISOString().split('T')[0],
        updated_date: new Date().toISOString().split('T')[0],
        is_overview: true,
      },
      content: `# ${phase.name || phase.id}

${phase.description || 'Phase description goes here.'}

## Goals

- Goal 1
- Goal 2

## Timeline

- Start: ${new Date().toISOString().split('T')[0]}
- Target: TBD
`,
    };

    fs.writeFileSync(overviewPath, formatTaskFile(task));

    return {
      success: true,
      data: phase,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error creating phase: ${error}`,
    };
  }
}
```

#### Update updatePhase()
```typescript
export async function updatePhase(
  id: string,
  updates: Partial<Phase>,
  options?: { config?: RuntimeConfig }
): Promise<OperationResult<Phase>> {
  try {
    const tasksDir = getTasksDirectory(options?.config);
    const phaseDir = path.join(tasksDir, id);
    const overviewPath = path.join(phaseDir, '_overview.md');

    if (!fs.existsSync(phaseDir)) {
      return { success: false, error: `Phase not found: ${id}` };
    }

    // Read existing overview
    let task: Task;
    if (fs.existsSync(overviewPath)) {
      const content = fs.readFileSync(overviewPath, 'utf-8');
      task = parseTaskFile(content);
    } else {
      // Create overview if it doesn't exist
      task = {
        metadata: {
          id,
          title: id,
          type: 'mdtm_phase',
          is_overview: true,
          created_date: new Date().toISOString().split('T')[0],
        },
        content: `# ${id}\n\nPhase description goes here.`,
      };
    }

    // Apply updates
    if (updates.name !== undefined) {
      task.metadata.title = updates.name;
    }
    if (updates.status !== undefined) {
      task.metadata.status = updates.status;
    }
    if (updates.order !== undefined) {
      task.metadata.order = updates.order;
    }
    if (updates.description !== undefined) {
      // Update content if description provided
      const lines = task.content.split('\n');
      const titleIndex = lines.findIndex(line => line.startsWith('#'));
      if (titleIndex >= 0) {
        lines.splice(titleIndex + 1, 0, '', updates.description);
        task.content = lines.join('\n');
      }
    }

    task.metadata.updated_date = new Date().toISOString().split('T')[0];

    // Handle phase renaming
    if (updates.id && updates.id !== id) {
      const newPhaseDir = path.join(tasksDir, updates.id);
      if (fs.existsSync(newPhaseDir)) {
        return { success: false, error: `Phase already exists: ${updates.id}` };
      }

      // Update metadata
      task.metadata.id = updates.id;
      
      // Write to new location
      const newOverviewPath = path.join(newPhaseDir, '_overview.md');
      fs.mkdirSync(newPhaseDir, { recursive: true });
      fs.writeFileSync(newOverviewPath, formatTaskFile(task));
      
      // Move all contents
      // ... (existing move logic)
      
      // Remove old directory
      fs.rmSync(phaseDir, { recursive: true });
    } else {
      // Just update the overview file
      fs.writeFileSync(overviewPath, formatTaskFile(task));
    }

    return {
      success: true,
      data: {
        id: task.metadata.id,
        name: task.metadata.title,
        status: task.metadata.status,
        order: task.metadata.order,
        description: updates.description,
      },
    };
  } catch (error) {
    return { success: false, error: `Error updating phase: ${error}` };
  }
}
```

### 4. Remove TOML Dependencies
- Remove `parseToml` and `stringifyToml` imports from phase-crud.ts
- Remove any references to `.phase.toml` files
- Update tests to work with new structure

### 5. Update Documentation
- Update any documentation that references `.phase.toml` files
- Add migration guide for existing projects
- Update examples to show phase `_overview.md` files

### 6. Add Migration Command (Optional)
Create a command to migrate existing projects:
```typescript
export async function migratePhaseFiles(): Promise<void> {
  const tasksDir = getTasksDirectory();
  const entries = fs.readdirSync(tasksDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !isSystemDirectory(entry.name)) {
      const phaseDir = path.join(tasksDir, entry.name);
      await migratePhaseTomlToOverview(phaseDir);
    }
  }
  
  console.log('Phase migration completed');
}
```

## Testing Checklist

- [ ] Test creating new phase creates `_overview.md` instead of `.phase.toml`
- [ ] Test listing phases reads from `_overview.md` files
- [ ] Test updating phase metadata updates `_overview.md`
- [ ] Test phase renaming moves `_overview.md` correctly
- [ ] Test backward compatibility with existing `.phase.toml` files
- [ ] Test migration from `.phase.toml` to `_overview.md`
- [ ] Verify phase sorting by order still works
- [ ] Ensure no TOML dependencies remain in phase-crud.ts

## Acceptance Criteria

- [ ] Phases use `_overview.md` files with YAML frontmatter
- [ ] No new `.phase.toml` files are created
- [ ] Existing functionality is preserved
- [ ] Migration path for existing projects is provided
- [ ] All tests pass with new structure
- [ ] Documentation is updated

## Migration Path

1. **Phase 1**: Add support for reading from `_overview.md` (backward compatible)
2. **Phase 2**: Update create/update to use `_overview.md`
3. **Phase 3**: Add migration command
4. **Phase 4**: Remove `.phase.toml` support entirely

## Benefits

1. **Consistency**: All organizational structures use the same pattern
2. **Single format**: Everything uses YAML frontmatter
3. **Discoverability**: Overview files are visible and editable
4. **Simplicity**: Removes special handling for phase metadata
5. **Extensibility**: Phases can have rich markdown content like features/areas

## Risks & Mitigations

- **Risk**: Breaking existing projects
  - **Mitigation**: Provide migration tool and backward compatibility period
  
- **Risk**: Performance impact from parsing markdown
  - **Mitigation**: Already parsing markdown for features/areas, minimal impact

## Dependencies

- Depends on YAML frontmatter support (already implemented)
- No new dependencies required

## Future Considerations

- Consider adding phase templates like task templates
- Could support phase-level configuration in overview frontmatter
- Potential for phase progress tracking based on task completion
