# CLI Area Guide

## Quick Architecture Overview
The CLI provides a command-line interface for task management using Commander.js. It follows an entity-command pattern where commands are organized by the entity they operate on (task, parent, workflow, etc.).

## Key Files and Utilities

### CLI Structure

- `src/cli/cli.ts` - Main entry point, command setup
- `src/cli/entity-commands.ts` - Entity command registration
- `src/cli/commands.ts` - Command implementations
- `src/cli/init.ts` - Project initialization command
- `src/cli/formatters.ts` - Output formatting utilities

### Command Pattern
```typescript
// Entity-based command structure
program
  .command('task')
  .description('Task operations')
  .command('list')
  .option('--current', 'Show current tasks')
  .action(async (options) => {
    // Implementation
  });
```

### Formatting Utilities
```typescript
import { 
  formatTaskList, 
  formatTaskTree, 
  printSuccess,
  printError,
  printWarning 
} from './formatters';
```

### Display Patterns

```typescript
// Show relative paths when possible
const displayPath = path.relative(process.cwd(), taskPath) || taskPath;

// Use ~ for home directory
const homePath = taskPath.replace(os.homedir(), '~');

// Good error messages
if (!tasksFound) {
  console.error('No tasks found. Run "sc init" to initialize project.');
}

// Keep paths simple in output
// Instead of: "Error reading /Users/alice/.scopecraft/projects/xyz/tasks/..."
// Show: "Task not found: auth-05A"
```

**IF** you're working on storage-related CLI features, see:
- `docs/03-guides/storage-migration.md` for user-facing storage info
- `src/cli/init.ts` for how initialization handles storage

## Common Patterns

### Command Implementation
```typescript
export async function handleTaskList(options: ListOptions) {
  try {
    // 1. Parse options
    const filters = parseFilters(options);
    
    // 2. Call core function
    const tasks = await taskOperations.listTasks(filters);
    
    // 3. Format output
    if (options.format === 'json') {
      console.log(JSON.stringify(tasks, null, 2));
    } else {
      console.log(formatTaskList(tasks, options));
    }
  } catch (error) {
    printError(error.message);
    process.exit(1);
  }
}
```

### Option Handling
```typescript
// Boolean flags
.option('--all', 'Show all tasks')

// Value options
.option('--status <status>', 'Filter by status')

// Multiple values
.option('--tags <tags...>', 'Filter by tags')

// Global options (in every command)
.option('--root-dir <path>', 'Project root directory')
```

### Output Formatting
```typescript
// Success messages
printSuccess(`Task ${taskId} created`);

// Warnings
printWarning('No tasks found matching criteria');

// Tables
console.table(tasks.map(t => ({
  ID: t.id,
  Title: t.title,
  Status: t.status
})));

// Trees (for hierarchical data)
console.log(formatTaskTree(parentTask));
```

## Do's and Don'ts

### Do's
- ✅ Provide helpful command descriptions
- ✅ Include examples in help text
- ✅ Validate inputs before calling core
- ✅ Use consistent option names
- ✅ Support both flags and explicit values
- ✅ Provide clear error messages
- ✅ Support --json format for scripting
- ✅ Use colors for better readability
- ✅ Use relative paths in output when possible

### Don't's
- ❌ Mix business logic in CLI layer
- ❌ Use console.log directly (use formatters)
- ❌ Exit without error messages
- ❌ Forget to handle edge cases
- ❌ Use inconsistent option patterns
- ❌ Ignore global options
- ❌ Show complex internal paths to users

## Testing Approach

### E2E Command Testing
```bash
# Test command execution
bun run dev:cli task list --current
bun run dev:cli parent show test-parent --tree

# Test error handling
bun run dev:cli task get non-existent-id

# Test option combinations
bun run dev:cli task list --status "In Progress" --area cli
```

### Integration Tests
```typescript
// Test command output
const output = execSync('bun run dev:cli task list --json');
const tasks = JSON.parse(output);
expect(tasks).toHaveLength(5);
```

## Related Documentation
- CLI Reference: `docs/04-reference/cli.md`
- Storage Migration: `docs/03-guides/storage-migration.md`
- Storage Architecture: `docs/02-architecture/system-architecture.md#storage-architecture`

## Common Tasks for CLI Area
- Adding new commands
- Improving help text
- Adding command options
- Enhancing output formats
- Adding interactive prompts
- Improving error messages
- Adding command aliases
- Supporting new filters