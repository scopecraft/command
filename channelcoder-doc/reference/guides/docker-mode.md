# Docker Mode Guide

Docker mode allows you to run Claude in an isolated Docker container, providing enhanced security when working with potentially dangerous permissions or untrusted code.

## Overview

When Docker mode is enabled, ChannelCoder:
1. Runs Claude CLI inside a Docker container
2. Mounts your working directory as `/workspace`
3. Isolates execution from your host system
4. Provides controlled access to system resources

## Quick Start

### Simple Docker Mode

```typescript
// Auto-detect Dockerfile and build image
await claude('Risky operation', { docker: true });

// Specify a pre-built image
await claude('Analyze system', { 
  docker: { image: 'my-claude:latest' } 
});
```

### CLI Usage

```bash
# Using auto-detection (looks for Dockerfile)
channelcoder run "Analyze this" --docker

# Using specific image
channelcoder run "Process data" --docker-image claude-sandbox
```

## Setting Up Docker Mode

### 1. Create a Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:20-slim

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Set working directory
WORKDIR /workspace

# Optional: Install additional tools
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -s /bin/bash claude
USER claude
```

### 2. Build Your Image

```bash
docker build -t my-claude .
```

### 3. Use with ChannelCoder

```typescript
await claude('Task requiring isolation', {
  docker: { image: 'my-claude' }
});
```

## Docker Options

```typescript
interface DockerOptions {
  // Auto-detect Dockerfile (default: true)
  auto?: boolean;
  
  // Docker image to use
  image?: string;
  
  // Path to Dockerfile (default: ./Dockerfile)
  dockerfile?: string;
  
  // Additional volume mounts
  mounts?: string[];  // Format: "host:container:mode"
  
  // Environment variables
  env?: Record<string, string>;
}
```

## Advanced Usage

### Custom Mounts

```typescript
await claude('Process sensitive data', {
  docker: {
    image: 'claude-sandbox',
    mounts: [
      './data:/data:ro',           // Read-only data mount
      './output:/output:rw',       // Read-write output
      '/tmp/cache:/cache:rw'       // Temporary cache
    ]
  }
});
```

### Environment Variables

```typescript
await claude('Production analysis', {
  docker: {
    image: 'claude-prod',
    env: {
      NODE_ENV: 'production',
      API_KEY: process.env.API_KEY,
      DEBUG: 'false'
    }
  }
});
```

### Complex Example

```typescript
// Development environment with full isolation
await claude('Debug production issue', {
  docker: {
    image: 'claude-debug',
    mounts: [
      './logs:/logs:ro',
      './src:/workspace/src:ro',
      './debug-output:/output:rw'
    ],
    env: {
      DEBUG: '*',
      LOG_LEVEL: 'verbose'
    }
  },
  tools: ['Read', 'Grep', 'Bash(grep:*)', 'Bash(cat:*)'],
  system: 'You are debugging a production issue. Analyze logs and source code.'
});
```

## Auto-Detection Feature

When using `docker: true`, ChannelCoder will:

1. Look for `Dockerfile` in the project root
2. Build an image with caching (tag: `channelcoder-auto:<hash>`)
3. Mount current directory to `/workspace`
4. Use sensible defaults

```typescript
// Simplest usage - auto-detects everything
await claude('Analyze codebase', { docker: true });
```

## Security Considerations

### Benefits

1. **Isolation**: Claude runs in a container, separated from host
2. **Limited Access**: Only explicitly mounted directories are accessible
3. **Resource Limits**: Can set CPU/memory limits via Docker
4. **Network Isolation**: Container network can be restricted

### Best Practices

1. **Minimal Images**: Use slim base images
2. **Read-Only Mounts**: Mount source code as read-only when possible
3. **Non-Root User**: Run Claude as non-root user in container
4. **Explicit Permissions**: Only mount necessary directories

## Combining with Other Features

### Docker + Sessions

```typescript
const s = session();
await s.claude('Start analysis', { docker: true });
await s.claude('Continue analysis'); // Reuses same Docker config
```

### Docker + Worktree

```typescript
await claude('Test in isolation', {
  worktree: 'experiment/risky',
  docker: true
});
```

### Docker + Streaming

```typescript
for await (const chunk of stream('Generate report', { docker: true })) {
  process.stdout.write(chunk.content);
}
```

## Troubleshooting

### Common Issues

1. **Image not found**
   ```bash
   docker images  # Check available images
   docker build -t my-claude .  # Build if missing
   ```

2. **Permission denied**
   - Ensure Docker daemon is running
   - Check user has Docker permissions
   - Verify mount paths exist

3. **Path mounting issues**
   - Use absolute paths for mounts
   - Ensure host paths exist
   - Check Docker Desktop file sharing settings

### Debug Mode

```typescript
// Enable verbose output
await claude('Debug task', {
  docker: { image: 'my-claude' },
  verbose: true  // Shows Docker commands
});
```

## Performance Tips

1. **Pre-build Images**: Build images ahead of time
2. **Layer Caching**: Structure Dockerfile for optimal caching
3. **Volume Performance**: Use delegated mounts on macOS
4. **Minimal Images**: Smaller images start faster

## Example Dockerfile Templates

### Minimal Claude

```dockerfile
FROM node:20-alpine
RUN npm install -g @anthropic-ai/claude-code
WORKDIR /workspace
```

### Development Environment

```dockerfile
FROM node:20
RUN npm install -g @anthropic-ai/claude-code
RUN apt-get update && apt-get install -y \
  git curl vim jq ripgrep
WORKDIR /workspace
```

### Python + Claude

```dockerfile
FROM python:3.11-slim
RUN pip install numpy pandas
RUN npm install -g @anthropic-ai/claude-code
WORKDIR /workspace
```

## Next Steps

- Learn about [Git Worktree Mode](./worktree-mode.md) for parallel development
- Explore [Session Management](./session-management.md) for long conversations
- See [Examples](/examples/docker-usage.ts) for more Docker mode usage