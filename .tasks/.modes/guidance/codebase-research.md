# Codebase Research Guidance

## When This Applies
When exploring existing code to understand patterns, find similar implementations, or research how something currently works.

## Key Considerations

### Understanding Code Organization
- How is the codebase structured?
- What are the main modules and their responsibilities?
- Where do different types of code live?
- What naming conventions are used?

### Finding Patterns
- Are there established patterns for this type of feature?
- How are similar problems solved elsewhere?
- What abstractions or utilities already exist?
- Are there anti-patterns to avoid?

### Dependency Analysis  
- What depends on this code?
- What does this code depend on?
- What's the impact radius of changes?
- Are there circular dependencies?

### Historical Context
- Why was it built this way?
- What alternatives were considered?
- Have there been attempts to change it?
- What issues have been reported?

## Recommended Tools

### For Pattern Discovery
- **Glob**: Start broad, find files by pattern
  ```bash
  # Find all authentication related files
  "**/*auth*" 
  "**/*login*"
  "**/session*"
  
  # Find test files for patterns
  "**/*.test.{ts,tsx}"
  "**/*.spec.{ts,tsx}"
  
  # Find similar components
  "**/components/*Table*"
  "**/components/*Modal*"
  ```

- **Grep**: Search for specific patterns
  ```bash
  # Find function/class definitions
  "function handleAuth"
  "class.*Auth.*{"
  "interface.*Props"
  
  # Find usage patterns
  "import.*from.*auth"
  "useAuth|UseAuth"
  "AuthContext|AuthProvider"
  
  # Find TODO/FIXME comments
  "TODO|FIXME|HACK|XXX"
  ```

### For Deep Understanding
- **Read**: Examine key files thoroughly
  - Start with interfaces/types for contracts
  - Read tests to understand intended behavior
  - Check implementation for actual behavior
  - Review related documentation

- **Context7**: Look up library documentation when you encounter unfamiliar imports or patterns

- **Task Tools**: Find related work using MCP task tools

## Research Strategies

### Top-Down Exploration
1. Start with entry points (main, index, routes)
2. Follow imports to understand structure
3. Map out high-level architecture
4. Drill into specific areas

### Bottom-Up Investigation
1. Find specific functionality
2. Trace up to see how it's used
3. Understand the context
4. Find related code

### Pattern Matching
1. Find one good example
2. Search for similar patterns
3. Extract common approaches
4. Note variations and why

### Historical Research
1. Check git history for evolution
2. Read commit messages for context
3. Find related issues/PRs
4. Look for documentation updates

## Code Analysis Patterns

### Understanding a Module
```markdown
## Module: [Name]
- **Purpose**: What it does
- **Entry Points**: How it's accessed
- **Dependencies**: What it needs
- **Dependents**: What uses it
- **Key Files**:
  - types.ts - Type definitions
  - index.ts - Public API
  - core.ts - Main logic
  - utils.ts - Helper functions
```

### Mapping Relationships
```markdown
## Component Relationships
ComponentA
  ├── uses: ComponentB (for X)
  ├── uses: ServiceC (for Y)
  └── provides: InterfaceD

ComponentB
  ├── uses: UtilityE
  └── provides: InterfaceF
```

### Pattern Documentation
```markdown
## Pattern: [Name]
- **Where Used**: List of files/modules
- **Purpose**: Why this pattern exists
- **Example**:
  ```typescript
  // Code example
  ```
- **Variations**: Different implementations
- **Notes**: Important considerations
```

## Common Research Tasks

### Finding Similar Code
1. Identify key characteristics
2. Search for class/function names
3. Look for similar file structures
4. Check for shared dependencies

### Understanding Data Flow
1. Find where data originates
2. Trace transformations
3. Identify consumers
4. Map the complete flow

### Analyzing Dependencies
1. Check import statements
2. Build dependency graph
3. Identify tight coupling
4. Find abstraction boundaries

### Investigating Issues
1. Reproduce the problem
2. Find relevant code paths
3. Check error handling
4. Review recent changes

## Scopecraft Codebase Specifics

### Project Structure
```
src/
  core/         # Business logic
  cli/          # Command-line interface
  mcp/          # Model Context Protocol
  tasks-ui/     # React UI
  templates/    # Task templates
```

### Key Patterns to Know
- Entity-command pattern in CLI
- MCP handler organization
- Task file structure (frontmatter + sections)
- UI component organization

### Where to Look For Examples
- Task CRUD: `src/core/task-crud.ts`
- CLI Commands: `src/cli/commands.ts`
- MCP Handlers: `src/mcp/handlers/`
- UI Components: `tasks-ui/src/components/`

### File Naming Conventions
- Kebab-case for files: `task-crud.ts`
- PascalCase for components: `TaskCard.tsx`
- Interfaces prefixed with 'I': `ITaskData`
- Types in separate files: `types.ts`