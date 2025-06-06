# Code Style and Conventions

## TypeScript Conventions
- **Strict mode** enabled
- **No explicit any** - always use proper types
- **No non-null assertions** - handle null/undefined properly
- **No unused variables**
- Use template literals instead of string concatenation
- Interfaces for object shapes, types for unions/aliases

## Code Formatting (Biome)
- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing commas**: ES5 style
- **File organization**: Imports organized automatically

## Naming Conventions
- **Files**: kebab-case (e.g., `task-parser.ts`)
- **Classes**: PascalCase (e.g., `TaskManager`)
- **Functions/Variables**: camelCase (e.g., `createTask`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_WORKFLOW_FOLDERS`)
- **Types/Interfaces**: PascalCase with descriptive names

## Module Structure
- Export public API from index.ts files
- Keep implementation details private
- Use .js extensions in import statements (ESM)
- Group related functionality in subdirectories

## Error Handling
- Use custom error classes for domain errors
- Always provide meaningful error messages
- Handle edge cases explicitly
- Return Result types for operations that can fail

## Comments
- **DO NOT ADD COMMENTS** unless explicitly requested
- Code should be self-documenting through clear naming
- Use TypeScript types for documentation