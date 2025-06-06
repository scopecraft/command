# Tech Stack

## Languages & Runtime
- **TypeScript** - Primary development language
- **Bun** - JavaScript runtime and package manager (preferred)
- **Node.js** - Supported runtime (16.0.0+)

## Core Dependencies
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `commander` - CLI framework
- `express` - HTTP server for MCP and UI
- `gray-matter` - YAML/TOML frontmatter parsing
- `zod` - Schema validation
- `simple-git` - Git operations for worktree features
- `chalk` - Terminal styling

## Development Tools
- **Biome** - Linting and formatting (replaces ESLint/Prettier)
- **TypeScript** - Type checking with strict mode
- **Bun Test** - Testing framework
- **Storybook** - Component development and documentation

## Build Configuration
- Target: ES2020
- Module: NodeNext
- Strict TypeScript enabled
- Source maps generated
- Declaration files generated

## Package Management
- Primary: Bun (bun install)
- Also supports: npm, yarn
- Global installation supported