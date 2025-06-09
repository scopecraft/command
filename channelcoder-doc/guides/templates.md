# Template System Guide

ChannelCoder provides a simple but powerful template system for variable interpolation in prompts. This guide covers the actual implemented features.

## Basic Variable Interpolation

### Simple Variables

Use curly braces `{}` or `${}` to interpolate variables:

```typescript
import { claude } from 'channelcoder';

const response = await claude(
  'Analyze this code: {code}',
  { data: { code: 'console.log("Hello")' } }
);

// Also supports ${} syntax
const response2 = await claude(
  'Analyze this code: ${code}',
  { data: { code: 'console.log("Hello")' } }
);
```

### Multiple Variables

```typescript
const response = await claude(
  'Task {taskId} with priority {priority}',
  { 
    data: {
      taskId: 'FEAT-123',
      priority: 'high'
    }
  }
);
```

### Missing Variables

Variables without values render as empty strings:

```typescript
const response = await claude(
  'Hello {name}!',
  { data: {} }
);
// Result: "Hello !"
```

## Nested Property Access

Access nested properties using dot notation:

```typescript
const response = await claude(
  'User {user.name} has role {user.role}',
  {
    data: {
      user: {
        name: 'Alice',
        role: 'admin'
      }
    }
  }
);
// Result: "User Alice has role admin"
```

### Deep Nesting

```typescript
const response = await claude(
  'User from {user.location.city}, {user.location.country}',
  {
    data: {
      user: {
        location: {
          city: 'New York',
          country: 'USA'
        }
      }
    }
  }
);
```

## Ternary Expressions

Simple conditional expressions are supported:

```typescript
const response = await claude(
  'Status: {isActive ? "Active" : "Inactive"}',
  { data: { isActive: true } }
);
// Result: "Status: Active"
```

### With Variable References

```typescript
const response = await claude(
  'Display: {count ? count : "none"}',
  { data: { count: 5 } }
);
// Result: "Display: 5"
```

### Equality Comparisons

```typescript
const response = await claude(
  'State: {status === "running" ? "Online" : "Offline"}',
  { data: { status: 'running' } }
);
// Result: "State: Online"
```

### Negation

```typescript
const response = await claude(
  'Access: {!isBlocked ? "Allowed" : "Denied"}',
  { data: { isBlocked: false } }
);
// Result: "Access: Allowed"
```

## Supported Comparison Operators

- `===` - Strict equality
- `==` - Equality  
- `!==` - Strict inequality
- `!=` - Inequality

```typescript
const response = await claude(
  '{value === 42 ? "Answer" : "Question"}',
  { data: { value: 42 } }
);
```

## Object and Array Formatting

Objects and arrays are automatically JSON-formatted:

```typescript
const response = await claude(
  'Config: {config}',
  {
    data: {
      config: {
        port: 3000,
        host: 'localhost'
      }
    }
  }
);
// Result: "Config: {\n  \"port\": 3000,\n  \"host\": \"localhost\"\n}"

const response2 = await claude(
  'Items: {items}',
  { data: { items: ['a', 'b', 'c'] } }
);
// Result: "Items: [\n  \"a\",\n  \"b\",\n  \"c\"\n]"
```

## Escaping

### Literal Braces

Escape braces with backslash to include them literally:

```typescript
const response = await claude(
  'Syntax: \\{variable\\}',
  { data: {} }
);
// Result: "Syntax: {variable}"
```

### Literal Dollar Signs

```typescript
const response = await claude(
  'Price: \\${price}',
  { data: { price: 100 } }
);
// Result: "Price: ${price}"
```

### Mixed Escaping

```typescript
const response = await claude(
  'Code: \\{var} Value: {var}',
  { data: { var: 'test' } }
);
// Result: "Code: {var} Value: test"
```

## File-Based Templates

### Markdown with Frontmatter

Create reusable templates in markdown files:

```markdown
---
allowedTools:
  - Read
  - Bash
input:
  repository: string
  branch?: string
---

# Code Review for {repository}

Please review the code in {repository} on branch {branch}.

Analysis for: {repository}
```

### Using File Templates

```typescript
const response = await claude(
  './prompts/code-review.md',
  {
    data: {
      repository: 'user/repo',
      branch: 'feature/new-api'
    }
  }
);
```

## Schema Validation in Frontmatter

### Simple Schema

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

### Advanced Schema

```markdown
---
input:
  status:
    type: string
    enum: [active, inactive]
  count:
    type: number
    min: 0
    max: 100
  description:
    type: string
    optional: true
---

Status: {status}
Count: {count}
```

## Frontmatter Options

### Tool Configuration

```markdown
---
allowedTools: [Read, Write, Bash]
disallowedTools: [WebSearch]
---
```

### System Prompts

```markdown
---
systemPrompt: "You are a helpful assistant."
appendSystemPrompt: "Be concise in your responses."
---
```

### MCP Configuration

```markdown
---
mcpConfig: "./mcp-servers.json"
permissionPromptTool: "ask_permission"
---
```

## Error Handling

### Invalid Expressions

Invalid expressions return the original text:

```typescript
const response = await claude(
  '{invalid.expression.that.fails}',
  { data: { invalid: null } }
);
// Result: "{invalid.expression.that.fails}" (unchanged)
```

### Null Safety

Null or undefined values render as empty strings:

```typescript
const response = await claude(
  'Value: {value}',
  { data: { value: null } }
);
// Result: "Value: "
```

## Best Practices

### 1. Use Meaningful Variable Names

```typescript
// Good
'Analyze {sourceCode} in {language}'

// Avoid
'Analyze {sc} in {lang}'
```

### 2. Handle Missing Values

Since there's no built-in default syntax, handle missing values in your data:

```typescript
const data = {
  name: user.name || 'Anonymous',
  status: task.status || 'pending'
};
```

### 3. Validate Input with Schemas

Use frontmatter schemas for type safety:

```markdown
---
input:
  code: string
  language: string
---

Analyze this {language} code: {code}
```

### 4. Use File Templates for Reusability

Store complex prompts in markdown files:

```bash
prompts/
├── analyze.md
├── review.md
├── debug.md
└── optimize.md
```

## Debugging Templates

### Dry Run Mode

Test template interpolation without calling Claude:

```typescript
const result = await claude(
  'Template: {data}',
  { 
    data: { data: 'test' },
    dryRun: true 
  }
);

console.log('Processed template:', result.data.prompt);
```

## Limitations

The current template system does **NOT** support:

- Complex JavaScript expressions (`.length`, `.reduce()`, etc.)
- Array indexing (`{items.0}`)
- Default value operators (`{name || "default"}`)
- Conditional blocks (`{#if}...{#endif}`)
- Loop constructs (`{#each}...{/each}`)
- Mathematical operations (`{a + b}`)
- Comparison operators other than equality (`{a > b}`)

For complex logic, prepare your data before passing it to the template:

```typescript
// Instead of {items.length} in template
const data = {
  items: ['a', 'b', 'c'],
  itemCount: items.length,
  firstItem: items[0],
  hasItems: items.length > 0
};
```

## Migration from Complex Templates

If you need features not supported by the current system:

### Instead of Default Values

```typescript
// Don't use: {name || "Anonymous"}
// Do this:
const data = {
  name: user.name || "Anonymous"
};
```

### Instead of Array Access

```typescript
// Don't use: {items.0}
// Do this:
const data = {
  items: ['a', 'b', 'c'],
  firstItem: items[0],
  lastItem: items[items.length - 1]
};
```

### Instead of Complex Expressions

```typescript
// Don't use: {items.reduce((sum, item) => sum + item.price, 0)}
// Do this:
const data = {
  items: products,
  totalPrice: products.reduce((sum, item) => sum + item.price, 0)
};
```