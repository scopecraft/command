# Git Worktree Mode Guide

Git worktree mode enables parallel development by running Claude in isolated git worktrees. This allows you to work on multiple features simultaneously without switching branches or stashing changes.

## Overview

Worktrees provide:
- **Parallel Development**: Work on multiple features without context switching
- **Clean Experiments**: Test changes in isolation
- **Branch Safety**: Each worktree has its own working directory
- **Session Integration**: Combine with sessions for branch-specific conversations

## Quick Start

### Simple Worktree Usage

```typescript
import { claude, worktree } from 'channelcoder';

// Auto-create worktree if it doesn't exist
await claude('Implement authentication', { 
  worktree: 'feature/auth' 
});

// Explicit worktree function
await worktree('feature/payments', async (wt) => {
  console.log(`Working in: ${wt.path}`);
  await claude('Design payment system');
  return 'completed';
});
```

### CLI Usage

```bash
# Manage worktrees
channelcoder worktree list                    # List all worktrees
channelcoder worktree create feature/new       # Create new worktree
channelcoder worktree remove feature/old       # Remove worktree
channelcoder worktree cleanup                  # Clean orphaned worktrees

# Run Claude in a worktree
channelcoder run "Implement feature" --worktree feature/auth
```

## Understanding Git Worktrees

Git worktrees allow multiple working directories for a single repository:

```
your-project/              # Main worktree
├── src/
├── package.json
└── .git/

.worktrees/               # Additional worktrees
├── feature-auth/         # Feature branch worktree
│   ├── src/
│   └── package.json
└── bugfix-memory/        # Bugfix branch worktree
    ├── src/
    └── package.json
```

## Worktree Options

```typescript
interface WorktreeOptions {
  // Branch name (required for creation)
  branch?: string;
  
  // Base branch for new worktree
  base?: string;
  
  // Custom path (auto-generated if not provided)
  path?: string;
  
  // Remove worktree after execution
  cleanup?: boolean;  // default: true for worktree()
  
  // Force creation vs. use existing
  create?: boolean;   // default: false (upsert behavior)
}
```

## Advanced Usage

### Creating from Specific Base

```typescript
await worktree('feature/v2-ui', async () => {
  await claude('Redesign user interface');
}, {
  base: 'develop',      // Branch from develop
  cleanup: false        // Keep worktree after
});
```

### Custom Worktree Paths

```typescript
await claude('Experimental changes', {
  worktree: {
    branch: 'experiment/neural-net',
    path: '/tmp/nn-experiment'  // Custom location
  }
});
```

### Persistent Worktrees

```typescript
// Create and keep worktree
await worktreeUtils.create('feature/long-term', {
  base: 'main',
  path: '.worktrees/long-term-feature'
});

// Work in it multiple times
await claude('Start feature', { worktree: 'feature/long-term' });
// ... days later ...
await claude('Continue feature', { worktree: 'feature/long-term' });
```

## Worktree Utilities

```typescript
import { worktreeUtils } from 'channelcoder';

// List all worktrees
const worktrees = await worktreeUtils.list();
/*
[{
  path: '/path/to/.worktrees/feature-auth',
  branch: 'feature/auth',
  commit: 'abc123',
  isMain: false
}]
*/

// Check existence
if (await worktreeUtils.exists('feature/auth')) {
  console.log('Worktree exists');
}

// Manual management
await worktreeUtils.create('feature/new', { base: 'main' });
await worktreeUtils.remove('feature/old');

// Clean up orphaned worktrees
const cleaned = await worktreeUtils.cleanup();
console.log(`Removed ${cleaned} orphaned worktrees`);
```

## Combining with Other Features

### Worktree + Sessions

Perfect for feature-specific conversation histories:

```typescript
const s = session();

// First conversation
await s.claude('Start OAuth implementation', { 
  worktree: 'feature/oauth' 
});
await s.save('oauth-implementation');

// Continue later in same worktree
const saved = await session.load('oauth-implementation');
await saved.claude('Add refresh token support');
```

### Worktree + Docker

Maximum isolation for experiments:

```typescript
await claude('Test risky changes', {
  worktree: 'experiment/dangerous',
  docker: true
});
```

### Worktree + Streaming

Real-time output in isolated branch:

```typescript
await worktree('feature/docs', async () => {
  for await (const chunk of stream('Generate API docs')) {
    process.stdout.write(chunk.content);
  }
});
```

## Best Practices

### 1. Naming Conventions

```typescript
// Good: Descriptive branch names
await claude('...', { worktree: 'feature/user-authentication' });
await claude('...', { worktree: 'bugfix/memory-leak' });
await claude('...', { worktree: 'experiment/new-algorithm' });

// Avoid: Generic names
await claude('...', { worktree: 'test1' });  // Not descriptive
```

### 2. Cleanup Strategy

```typescript
// Temporary experiments - auto cleanup
await worktree('experiment/test', async () => {
  await claude('Try new approach');
}); // Automatically removed after

// Long-term features - manual cleanup
await claude('Major feature', {
  worktree: {
    branch: 'feature/v2',
    cleanup: false  // Keep it
  }
});
```

### 3. Base Branch Selection

```typescript
// Feature from main
await worktree('feature/new', handler, { base: 'main' });

// Hotfix from production
await worktree('hotfix/urgent', handler, { base: 'production' });

// Experiment from current
await worktree('experiment/idea', handler);  // Uses current branch
```

## Common Workflows

### Feature Development

```typescript
// Start new feature
await worktree('feature/shopping-cart', async () => {
  await claude('Implement shopping cart functionality');
  await claude('Add unit tests');
  await claude('Update documentation');
}, { 
  base: 'develop',
  cleanup: false  // Keep for PR
});
```

### Bug Investigation

```typescript
// Isolate bug reproduction
await worktree('debug/issue-123', async () => {
  await claude('Reproduce bug from issue #123');
  await claude('Find root cause');
}, {
  base: 'production'  // Start from production state
});
```

### Parallel Development

```typescript
// Work on multiple features simultaneously
const features = ['auth', 'payments', 'notifications'];

await Promise.all(features.map(feature =>
  worktree(`feature/${feature}`, async () => {
    await claude(`Implement ${feature} system`);
  }, { base: 'main', cleanup: false })
));
```

## Troubleshooting

### Common Issues

1. **"Worktree already exists"**
   ```typescript
   // Use the existing worktree
   await claude('...', { worktree: 'feature/exists' });
   
   // Or remove and recreate
   await worktreeUtils.remove('feature/exists');
   await worktreeUtils.create('feature/exists');
   ```

2. **"Branch already exists"**
   ```bash
   # Delete remote branch
   git push origin --delete feature/old
   # Delete local branch
   git branch -D feature/old
   ```

3. **Path conflicts**
   ```typescript
   // Use custom paths to avoid conflicts
   await claude('...', {
     worktree: {
       branch: 'feature/new',
       path: '.worktrees/feature-new-v2'
     }
   });
   ```

### Debugging

```typescript
// List all worktrees with details
const worktrees = await worktreeUtils.list();
console.log(JSON.stringify(worktrees, null, 2));

// Verbose mode
await claude('Debug task', {
  worktree: 'debug/issue',
  verbose: true  // Shows git commands
});
```

## Performance Tips

1. **Location Matters**: Keep worktrees on same filesystem
2. **Cleanup Regularly**: Remove unused worktrees
3. **Shallow Clones**: Use `--depth` for large repos
4. **Local Storage**: Use fast local storage, not network drives

## Next Steps

- Explore [Session Management](./session-management.md) for conversation persistence
- Learn about [Docker Mode](./docker-mode.md) for enhanced isolation
- See [Examples](/examples/worktree-usage.ts) for practical usage