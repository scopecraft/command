# Error Handling Guide

This guide covers error handling patterns, common issues, and debugging strategies when using ChannelCoder.

## Error Types

### CCResult Type

Most ChannelCoder functions return a `CCResult<T>` type for explicit error handling:

```typescript
type CCResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

### Using CCResult

```typescript
import { run } from 'channelcoder';

const result = await run('Analyze this code');

if (result.success) {
  console.log('Response:', result.data.response);
} else {
  console.error('Error:', result.error.message);
}
```

## Common Error Scenarios

### 1. File Not Found

When a prompt file doesn't exist:

```typescript
try {
  await claude('./prompts/missing.md');
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Prompt file not found:', error.path);
  }
}
```

### 2. Template Syntax Errors

Invalid template expressions:

```typescript
try {
  await claude('{user.name.toUpperCase()}', { user: null });
} catch (error) {
  if (error.message.includes('Cannot read properties of null')) {
    console.error('Template error: user is null');
  }
}
```

### 3. Validation Errors

Schema validation failures:

```typescript
import { validateInput } from 'channelcoder';
import { z } from 'zod';

const schema = z.object({
  age: z.number().min(0).max(150)
});

const result = validateInput({ age: 200 }, schema);
if (!result.success) {
  console.error('Validation error:', result.error.message);
  // "age must be less than or equal to 150"
}
```

### 4. Process Errors

Claude CLI failures:

```typescript
const result = await run('Analyze code', {}, {
  tools: ['InvalidTool'] // Wrong tool name
});

if (!result.success) {
  // Check stderr for CLI error messages
  console.error(result.error);
}
```

### 5. Timeout Errors

Operations exceeding time limit:

```typescript
try {
  await claude('Generate a long story', {}, {
    timeout: 5000 // 5 seconds
  });
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Operation timed out');
  }
}
```

## Error Recovery Patterns

### Retry Logic

Implement exponential backoff for transient failures:

```typescript
async function claudeWithRetry(
  prompt: string,
  data: any = {},
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await claude(prompt, data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000;
      console.log(`Retry ${i + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Fallback Strategies

Provide alternative approaches:

```typescript
async function analyzeCode(code: string) {
  try {
    // Try with advanced tools
    return await claude('Analyze: {code}', { code }, {
      tools: ['Bash', 'Read', 'Grep']
    });
  } catch (error) {
    // Fallback to basic analysis
    return await claude('Review this code: {code}', { code });
  }
}
```

### Graceful Degradation

Handle partial failures:

```typescript
async function processFiles(files: string[]) {
  const results = [];
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const analysis = await claude('Analyze: {content}', { content });
      results.push({ file, analysis, success: true });
    } catch (error) {
      results.push({ 
        file, 
        error: error.message, 
        success: false 
      });
    }
  }
  
  return results;
}
```

## Debugging Strategies

### 1. Enable Dry Run Mode

Test template processing without API calls:

```typescript
const processed = await claude(
  'Complex template: {data}',
  { data: complexData },
  { dryRun: true }
);

console.log('Processed template:', processed);
```

### 2. Stream Debug Information

Use streaming to see real-time output:

```typescript
import { stream } from 'channelcoder';

for await (const chunk of stream(prompt, data)) {
  console.log(`[${chunk.type}]`, chunk);
  
  if (chunk.type === 'error') {
    console.error('Stream error:', chunk.error);
  }
}
```

### 3. Inspect Process Output

Check stdout/stderr for CLI issues:

```typescript
const result = await run(prompt, data);

if (!result.success) {
  console.error('Exit code:', result.data?.processResult.code);
  console.error('Stderr:', result.data?.processResult.stderr);
}
```

### 4. Validate Inputs Early

Catch issues before API calls:

```typescript
function validatePromptData(data: any) {
  const errors = [];
  
  if (!data.code || typeof data.code !== 'string') {
    errors.push('code must be a non-empty string');
  }
  
  if (data.language && !['js', 'py', 'go'].includes(data.language)) {
    errors.push('language must be js, py, or go');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}
```

## Error Messages Reference

### Template Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'x' of undefined` | Missing nested property | Use optional chaining or defaults |
| `{variable} is not defined` | Missing variable in data | Provide all required variables |
| `Unexpected token` | Invalid JavaScript expression | Check expression syntax |

### Process Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Command failed with exit code 1` | Claude CLI error | Check stderr for details |
| `ENOENT: claude not found` | Claude CLI not installed | Install Claude CLI |
| `Invalid tool specification` | Wrong tool format | Use correct tool names |

### Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Expected string, received number` | Type mismatch | Fix data types |
| `Invalid enum value` | Value not in allowed list | Use valid enum values |
| `Required field missing` | Missing required property | Provide all required fields |

## Best Practices

### 1. Always Handle Errors

```typescript
// Don't do this
const response = await claude(prompt);

// Do this
try {
  const response = await claude(prompt);
  // Use response
} catch (error) {
  // Handle error appropriately
}
```

### 2. Use Type-Safe Error Handling

```typescript
function isNetworkError(error: unknown): error is Error {
  return error instanceof Error && 
    error.message.includes('ECONNREFUSED');
}

try {
  await claude(prompt);
} catch (error) {
  if (isNetworkError(error)) {
    // Handle network error
  }
}
```

### 3. Provide Context in Errors

```typescript
class PromptError extends Error {
  constructor(
    message: string,
    public promptFile: string,
    public variables: any
  ) {
    super(message);
    this.name = 'PromptError';
  }
}

throw new PromptError(
  'Failed to process prompt',
  './prompts/analyze.md',
  { code: userCode }
);
```

### 4. Log Errors Appropriately

```typescript
function logError(error: Error, context: any) {
  console.error({
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  });
}
```

### 5. Clean Up on Errors

```typescript
const tempFile = './temp-analysis.md';

try {
  await fs.writeFile(tempFile, content);
  const result = await claude(tempFile);
  return result;
} finally {
  // Always clean up
  await fs.unlink(tempFile).catch(() => {});
}
```

## Testing Error Scenarios

### Unit Testing Errors

```typescript
import { expect, test } from 'bun:test';

test('handles missing file', async () => {
  try {
    await claude('./missing.md');
    expect(true).toBe(false); // Should not reach
  } catch (error) {
    expect(error.code).toBe('ENOENT');
  }
});
```

### Integration Testing

```typescript
test('handles timeout', async () => {
  const result = await run('Long task', {}, {
    timeout: 1 // 1ms timeout
  });
  
  expect(result.success).toBe(false);
  expect(result.error.message).toContain('timeout');
});
```

## Recovery Checklist

When encountering errors:

1. ✓ Check error message and type
2. ✓ Verify input data and schemas
3. ✓ Confirm file paths are correct
4. ✓ Validate Claude CLI is installed
5. ✓ Check network connectivity
6. ✓ Review template syntax
7. ✓ Examine process stdout/stderr
8. ✓ Try with simplified inputs
9. ✓ Enable dry-run mode for debugging
10. ✓ Check for rate limits or quotas