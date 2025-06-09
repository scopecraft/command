# API Reference

This document provides a comprehensive reference for all functions exported by the ChannelCoder SDK.

## Core Functions

### `claude()`

The main function for interacting with Claude through the SDK. All execution modes (run, stream, interactive, detached) can be accessed through this single function by setting the appropriate options.

```typescript
function claude(
  promptOrFile: string,
  options?: ClaudeOptions
): Promise<CCResult>
```

#### Parameters

- **promptOrFile** `string` - Either a prompt string or path to a markdown file with frontmatter
- **options** `ClaudeOptions` (optional) - Configuration options including data and execution mode

#### File Path Detection

The SDK automatically detects when the first parameter is a file path versus an inline prompt:

**Recognized as file paths:**
- `'prompt.md'` - Files ending with .md
- `'./prompts/analyze.md'` - Relative paths starting with ./
- `'../templates/review.md'` - Relative paths starting with ../
- `'/abs/path/prompt.md'` - Absolute Unix paths
- `'C:\\prompts\\task.md'` - Windows absolute paths
- `'folder/file.txt'` - Any path with separators and file extension

**Treated as inline prompts:**
- `'What is TypeScript?'` - Plain text
- `'Debug this: const x = null'` - Code snippets
- `'Review PR #123'` - Any string not matching file patterns

#### Returns

`Promise<CCResult>` - Result object containing response or error

#### Options

```typescript
interface ClaudeOptions {
  // Data & Prompts
  data?: InterpolationData; // Variable interpolation
  system?: string; // System prompt (inline or .md file)
  appendSystem?: string; // Append to system prompt
  
  // Tools
  tools?: string[]; // Allowed tools (maps to --tools)
  disallowedTools?: string[]; // Disallowed tools
  mcpConfig?: string; // MCP server config file
  permissionTool?: string; // MCP permission tool
  
  // Session Management
  resume?: string; // Resume session by ID
  continue?: boolean; // Continue most recent session
  
  // Execution Control
  mode?: 'run' | 'stream' | 'interactive'; // Execution mode (default: 'run')
  maxTurns?: number; // Limit agentic turns
  includeEvents?: boolean; // Include event tracking
  
  // Detached Mode
  detached?: boolean; // Run in detached mode (background)
  logFile?: string; // Log file path for detached mode output
  stream?: boolean; // Enable streaming output in detached mode
  
  // Output Control
  verbose?: boolean; // Verbose output
  outputFormat?: 'json' | 'text'; // Output format
  parse?: boolean; // Parse JSON messages in stream mode (default: false)
  
  // Process Control
  timeout?: number; // Timeout in milliseconds
  dryRun?: boolean; // Return command instead of executing
  
  // Docker execution
  docker?: boolean | DockerOptions; // Run in Docker container
  
  // Worktree execution
  worktree?: boolean | string | WorktreeOptions; // Run in git worktree
}
```

#### Example

```typescript
import { claude } from 'channelcoder';

// Simple prompt
const response = await claude('What is 2+2?');

// With variables
const analysis = await claude(
  'Analyze this code: {code}',
  { data: { code: 'console.log("Hello")' } }
);

// Stream mode directly through claude()
const streamResult = await claude(
  'Tell me a story',
  { mode: 'stream' }
);

// Interactive mode directly through claude()
await claude(
  'Help me debug this',
  { mode: 'interactive' } // Replaces current process
);

// Detached mode directly through claude()
const detachedResult = await claude(
  'Long running task',
  { 
    detached: true,
    logFile: 'output.log',
    stream: true // Enable streaming in detached mode
  }
);

// File-based prompt with frontmatter
const result = await claude(
  './prompts/analyze.md',
  { 
    data: { repository: 'user/repo' },
    mode: 'run',
    tools: ['Read', 'Bash'],
    timeout: 30000
  }
);
```

### Execution Modes

The `claude()` function supports different execution modes through the `mode` and `detached` options:

- **`mode: 'run'`** (default) - Execute and return the complete response
- **`mode: 'stream'`** - Stream response chunks in real-time
- **`mode: 'interactive'`** - Replace current process with interactive Claude session
- **`detached: true`** - Run in background, optionally with logging

The convenience functions below (`stream()`, `interactive()`, `run()`, `detached()`) are just syntactic sugar that call `claude()` with the appropriate mode set.

## File-Based Prompts

ChannelCoder supports loading prompts from markdown files with YAML frontmatter. This enables reusable, configurable prompts with built-in validation and tool specifications.

### Basic File Structure

```markdown
---
allowedTools: [Read, Write]
systemPrompt: "You are a code analysis assistant."
input:
  repository: string
  branch?: string
---

# Code Analysis for {repository}

Please analyze the repository {repository} on branch {branch}.

Focus on code quality, security, and performance.
```

### Frontmatter Configuration

The YAML frontmatter can specify:

- **allowedTools/disallowedTools**: Tool restrictions for Claude
- **systemPrompt/appendSystemPrompt**: System message configuration  
- **mcpConfig/permissionPromptTool**: MCP server settings
- **input/output**: Schema validation for data and responses
- **session**: Session requirements

### Input Schema Validation

File-based prompts can validate input data:

```markdown
---
input:
  taskId: string
  priority: string
  tags: string[]
---

Task {taskId} has priority {priority}
Tags: {tags}
```

When used with data, the SDK validates against the schema:

```typescript
const result = await claude('./prompts/task.md', {
  data: {
    taskId: 'FEAT-123',
    priority: 'high',
    tags: ['backend', 'api']
  }
});
// Input validation passes - all required fields provided
```

### Option Merging

File configuration merges with passed options (options override file settings):

```typescript
// File specifies: allowedTools: [Read]
// This adds Write to the tools and sets verbose mode
const result = await claude('./prompts/analyze.md', {
  tools: ['Read', 'Write'], // Combined with file's tools
  verbose: true // Added to file's config
});
```

### File Path Examples

All execution modes support file-based prompts:

```typescript
// Regular execution
const result = await claude('./prompts/analyze.md', {
  data: { repo: 'user/project' }
});

// Streaming
for await (const chunk of stream('./prompts/explain.md', {
  data: { topic: 'async/await' }
})) {
  console.log(chunk.content);
}

// Interactive mode
interactive('./prompts/debug.md', {
  data: { issue: 'memory leak' }
});

// Detached mode
detached('./prompts/long-task.md', {
  data: { dataset: 'large.csv' },
  logFile: 'analysis.log'
});
```

### `stream()`

Stream Claude's response in real-time chunks. This is equivalent to calling `claude()` with `mode: 'stream'`.

```typescript
function stream(
  promptOrFile: string,
  options?: ClaudeOptions
): AsyncGenerator<StreamChunk>
```

#### Parameters

Same as `claude()` function.

#### Returns

`AsyncGenerator<StreamChunk>` - Async generator yielding stream chunks

#### StreamChunk Types

```typescript
type StreamChunk =
  | { type: 'content'; content: string }
  | { type: 'error'; error: string }
  | { type: 'warning'; warning: string }
  | { type: 'usage'; usage: UsageInfo }
  | { type: 'thinking'; thinking: string }
  | { type: 'line'; line: string };
```

#### Example

```typescript
import { stream } from 'channelcoder';

for await (const chunk of stream('Tell me a story')) {
  if (chunk.type === 'content') {
    process.stdout.write(chunk.content);
  }
}
```

### `interactive()`

Launch an interactive session with Claude (replaces current process). This is equivalent to calling `claude()` with `mode: 'interactive'`.

```typescript
function interactive(
  promptOrFile: string,
  options?: ClaudeOptions
): Promise<LaunchResult>
```

#### Parameters

Same as `claude()` function.

#### Returns

Never returns - replaces the current process with Claude CLI.

#### Example

```typescript
import { interactive } from 'channelcoder';

// Start interactive session with initial prompt
interactive('Help me debug this code: {code}', {
  data: {
    code: fs.readFileSync('app.js', 'utf-8')
  }
});
```

### `run()`

Execute a prompt and return both the response and process information. This is equivalent to calling `claude()` with `mode: 'run'` (which is the default).

```typescript
function run(
  promptOrFile: string,
  options?: ClaudeOptions
): Promise<CCResult>
```

#### Parameters

Same as `claude()` function.

#### Returns

`Promise<CCResult>` - Result object containing response or error

#### LaunchResult Structure

```typescript
interface LaunchResult {
  response: string;
  processResult: {
    success: boolean;
    code: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
  };
}
```

#### Example

```typescript
import { run } from 'channelcoder';

const result = await run('Explain this concept', {
  timeout: 30000
});

if (result.success) {
  console.log('Response:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### `detached()`

Run Claude in detached mode, saving output to JSONL file. This is equivalent to calling `claude()` with `detached: true`.

```typescript
function detached(
  promptOrFile: string,
  options?: ClaudeOptions
): Promise<CCResult>
```

#### Parameters

Same as `claude()` function, but `detached: true` is automatically set.

#### Returns

`Promise<CCResult>` - Result containing process information

#### Example

```typescript
import { detached } from 'channelcoder';

// Run in background
const result = await detached('prompt.md');
console.log('Started with PID:', result.data.pid);

// Run with logging
await detached('long-task.md', {
  logFile: 'output.log',
  data: { taskId: '123' }
});

// Run with real-time streaming to log file
await detached('long-task.md', {
  logFile: 'output.log',
  stream: true,
  data: { taskId: '123' }
});
```

## Utility Functions

### `loadPromptFile()`

Load and parse a markdown file with YAML frontmatter.

```typescript
function loadPromptFile(
  filePath: string
): CCResult<{
  content: string;
  metadata: Record<string, any>;
}>
```

#### Parameters

- **filePath** `string` - Path to the markdown file

#### Returns

Result containing content and parsed frontmatter metadata.

#### Example

```typescript
import { loadPromptFile } from 'channelcoder';

const result = loadPromptFile('./prompts/analyze.md');
if (result.success) {
  console.log('Content:', result.data.content);
  console.log('Metadata:', result.data.metadata);
}
```

### `validateInput()`

Validate input data against a Zod schema.

```typescript
function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): CCResult<T>
```

#### Parameters

- **data** `unknown` - Data to validate
- **schema** `z.ZodSchema<T>` - Zod schema for validation

#### Returns

`CCResult<T>` - Validated data or error

#### Example

```typescript
import { validateInput } from 'channelcoder';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number()
});

const result = validateInput({ name: 'John', age: 30 }, schema);
if (result.success) {
  console.log('Valid data:', result.data);
}
```

### `validateOutput()`

Validate Claude's response against an expected schema.

```typescript
function validateOutput<T>(
  output: string,
  schema: z.ZodSchema<T>
): CCResult<T>
```

#### Parameters

- **output** `string` - Claude's response to parse and validate
- **schema** `z.ZodSchema<T>` - Expected output schema

#### Returns

`CCResult<T>` - Parsed and validated data or error

#### Example

```typescript
import { claude, validateOutput } from 'channelcoder';
import { z } from 'zod';

const schema = z.object({
  summary: z.string(),
  score: z.number()
});

const response = await claude('Analyze this text and return JSON');
const result = validateOutput(response, schema);
```

## Types

### `CCResult<T>`

Result type for operations that can fail.

```typescript
type CCResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

### `InterpolationData`

Data for template variable interpolation.

```typescript
type InterpolationValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | InterpolationValue[]
  | { [key: string]: InterpolationValue };

type InterpolationData = Record<string, InterpolationValue>;
```

### `StreamChunk`

Chunk types emitted during streaming.

```typescript
type StreamChunk =
  | { type: 'content'; content: string }
  | { type: 'error'; error: string }
  | { type: 'warning'; warning: string }
  | { type: 'usage'; usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    }}
  | { type: 'thinking'; thinking: string }
  | { type: 'line'; line: string };
```

## Error Handling

All functions that can fail return a `CCResult<T>` type or throw errors for critical failures.

### Common Errors

- **File not found**: When prompt file doesn't exist
- **Invalid template**: Template syntax errors
- **Validation failed**: Input/output schema validation errors
- **Process errors**: Claude CLI failures
- **Timeout**: Operation exceeded timeout

### Example Error Handling

```typescript
import { claude } from 'channelcoder';

try {
  const result = await claude('./prompt.md', data);
  console.log(result);
} catch (error) {
  if (error.message.includes('ENOENT')) {
    console.error('Prompt file not found');
  } else if (error.message.includes('validation')) {
    console.error('Validation error:', error);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

1. **Use file-based prompts** for complex, reusable prompts
2. **Validate inputs** with schemas for type safety
3. **Handle errors** appropriately for production use
4. **Set timeouts** for long-running operations
5. **Use streaming** for real-time output display
6. **Leverage dry-run** mode for testing templates