# Codebase Structure

## Core Architecture

### `/src/core/` - Business Logic
- **config/** - Configuration management
  - `configuration-manager.ts` - Runtime config handling
  - `types.ts` - Config type definitions
- **metadata/** - Schema and normalization
  - `schema-service.ts` - Metadata schema management
  - `normalizer-builder.ts` - Field normalization
- **worktree/** - Git worktree integration
  - `worktree-service.ts` - Worktree operations
  - `task-correlation-service.ts` - Task-worktree mapping
- Core files:
  - `task-parser.ts` - MDTM file parsing/serialization
  - `task-crud.ts` - CRUD operations
  - `parent-tasks.ts` - Parent task management
  - `id-generator.ts` - Task ID generation
  - `directory-utils.ts` - File system operations

### `/src/cli/` - Command Line Interface
- `cli.ts` - Entry point and command setup
- `commands.ts` - Command implementations
- `entity-commands.ts` - Entity-specific commands
- `formatters.ts` - Output formatting
- `validation-helpers.ts` - Input validation

### `/src/mcp/` - Model Context Protocol Server
- `server.ts` - HTTP server setup
- `stdio-server.ts` - STDIO transport
- `handlers/` - Request handlers
  - `read-handlers.ts` - Query operations
  - `write-handlers.ts` - Mutation operations
  - `shared/` - Shared utilities
- `schemas.ts` - Zod schemas for validation
- `transformers.ts` - Data transformation

### `/tasks-ui/` - Web Interface
- React-based dashboard
- WebSocket support for real-time updates
- Storybook for component development

### `/docs/` - Documentation
- Architecture and design docs
- Development guides
- Style guides and conventions

### `/scripts/` - Development Scripts
- `code-check.ts` - Quality checks
- `release.ts` - Release automation
- `task-worktree.ts` - Git worktree helpers

## Key Design Patterns
1. **Separation of Concerns**: Core logic separate from UI/transport
2. **Schema-First**: Zod schemas for validation
3. **Functional Core**: Pure functions in core module
4. **Type Safety**: Strict TypeScript throughout
5. **Modular Structure**: Clear module boundaries