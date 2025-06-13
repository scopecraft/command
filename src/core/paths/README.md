# Path Resolution System

⚠️ **THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL PATH RESOLUTION** ⚠️

## Overview

This module provides centralized path resolution for all Scopecraft features. It handles the complexity of:
- Git worktrees vs main repository
- Centralized vs repository storage
- Future: Precedence and override paths

## Quick Reference

```typescript
import { resolvePath, createPathContext, PATH_TYPES } from './path-resolver';

// Create context (usually done once at entry point)
const context = createPathContext(projectRoot);

// Resolve any path
const templateDir = resolvePath(PATH_TYPES.TEMPLATES, context);
const modesDir = resolvePath(PATH_TYPES.MODES, context);
const tasksDir = resolvePath(PATH_TYPES.TASKS, context);
```

## Path Storage Locations

| Feature | Storage Location | Why |
|---------|-----------------|-----|
| Tasks | `~/.scopecraft/projects/{encoded}/tasks/` | Centralized - execution logs |
| Sessions | `~/.scopecraft/projects/{encoded}/sessions/` | Centralized - shared across worktrees |
| Templates | `.tasks/.templates/` | Repository - project configuration |
| Modes | `.tasks/.modes/` | Repository - project configuration |
| Config | `~/.scopecraft/projects/{encoded}/config/` | Centralized - project metadata |

## API Reference

### Core Functions

- `createPathContext(projectRoot)` - Create context from project root
- `resolvePath(type, context)` - Get single path (highest precedence)
- `resolvePathWithPrecedence(type, context)` - Get all paths in order
- `resolveExistingPath(type, context)` - Get first existing path

### Path Types

Use the `PATH_TYPES` constant for type safety:
- `PATH_TYPES.TEMPLATES`
- `PATH_TYPES.MODES`
- `PATH_TYPES.TASKS`
- `PATH_TYPES.SESSIONS`
- `PATH_TYPES.CONFIG`

## Adding New Path Types

1. Add to `PATH_TYPES` in `types.ts`
2. Create strategy function(s) in `strategies.ts`
3. Add to `pathStrategies` mapping in `strategies.ts`
4. Document here

## Migration Guide

### Old Pattern (DO NOT USE)
```typescript
import { join } from 'path';
const templatePath = join(projectRoot, '.tasks', '.templates');
```

### New Pattern (USE THIS)
```typescript
import { resolvePath, createPathContext, PATH_TYPES } from '../paths/path-resolver';
const context = createPathContext(projectRoot);
const templatePath = resolvePath(PATH_TYPES.TEMPLATES, context);
```

## Migration Checklist

Track files as they are migrated to use the new resolver:

- [ ] src/core/directory-utils.ts
- [ ] src/core/template-manager.ts
- [ ] src/integrations/channelcoder/utils.ts
- [ ] src/integrations/channelcoder/constants.ts
- [ ] src/core/project-init.ts
- [ ] src/cli/init.ts

## Future Enhancements

- [ ] Local overrides (`.local/.tasks/`)
- [ ] Environment-based paths
- [ ] User preference for storage locations
- [ ] Path validation and security checks