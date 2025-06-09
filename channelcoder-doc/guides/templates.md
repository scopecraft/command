# Template System Guide

ChannelCoder provides a powerful template system for dynamic prompt generation with variable interpolation, conditional logic, and default values.

## Basic Variable Interpolation

### Simple Variables

Use curly braces `{}` to interpolate variables into your prompts:

```typescript
import { claude } from 'channelcoder';

const response = await claude(
  'Analyze this code: {code}',
  { code: 'console.log("Hello")' }
);
```

### Multiple Variables

```typescript
const response = await claude(
  'Compare {language1} and {language2} for {useCase}',
  {
    language1: 'Python',
    language2: 'JavaScript',
    useCase: 'web development'
  }
);
```

## Advanced Interpolation Syntax

### Nested Object Access

Access nested properties using dot notation:

```typescript
const response = await claude(
  'User {user.name} from {user.location.city}',
  {
    user: {
      name: 'Alice',
      location: {
        city: 'New York',
        country: 'USA'
      }
    }
  }
);
```

### Array Access

Access array elements by index:

```typescript
const response = await claude(
  'First item: {items.0}, Last item: {items.2}',
  {
    items: ['apple', 'banana', 'orange']
  }
);
```

### Default Values

Provide fallback values using the `||` operator:

```typescript
const response = await claude(
  'Hello {name || "there"}!',
  {} // No name provided, will use "there"
);
```

### Ternary Expressions

Use conditional expressions for dynamic content:

```typescript
const response = await claude(
  'Status: {isActive ? "Active" : "Inactive"}',
  { isActive: true }
);
```

### JavaScript Expressions

Complex expressions are supported:

```typescript
const response = await claude(
  'Items: {items.length}, Total: {items.reduce((a,b) => a + b.price, 0)}',
  {
    items: [
      { name: 'Book', price: 10 },
      { name: 'Pen', price: 2 }
    ]
  }
);
```

## Conditional Blocks

### Basic Conditionals

Use `{#if}` blocks for conditional content:

```markdown
{#if hasData}
Analyze this data: {data}
{#else}
No data available for analysis.
{#endif}
```

### Nested Conditionals

```markdown
{#if user}
  Welcome {user.name}!
  {#if user.isPremium}
    You have access to premium features.
  {#else}
    Consider upgrading to premium.
  {#endif}
{#else}
  Please log in to continue.
{#endif}
```

### Multiple Conditions

```markdown
{#if environment === "production"}
  Using production settings
{#elseif environment === "staging"}
  Using staging settings
{#else}
  Using development settings
{#endif}
```

## Escaping

### Literal Braces

Escape braces with backslash to include them literally:

```typescript
const response = await claude(
  'The syntax is \\{variable\\}',
  {}
);
// Output: The syntax is {variable}
```

### Dollar Sign Variables

Both `{var}` and `${var}` syntax are supported:

```typescript
// These are equivalent:
'Hello {name}'
'Hello ${name}'
```

## File-Based Templates

### Markdown with Frontmatter

Create reusable templates in markdown files:

```markdown
---
tools:
  - Bash
  - Read
schema:
  repository: string
  branch?: string
---

# Code Review for {repository}

Please review the code in {repository} on branch {branch || "main"}.

{#if specific_files}
Focus on these files:
{specific_files}
{#endif}
```

### Using File Templates

```typescript
const response = await claude(
  './prompts/code-review.md',
  {
    repository: 'user/repo',
    branch: 'feature/new-api',
    specific_files: ['src/api.ts', 'src/utils.ts']
  }
);
```

## Complex Data Structures

### Working with Arrays

```typescript
const prompt = `
Analyze these metrics:
{#each metrics as metric}
- {metric.name}: {metric.value} ({metric.change > 0 ? "↑" : "↓"})
{/each}
`;

const response = await claude(prompt, {
  metrics: [
    { name: 'CPU', value: 45, change: 5 },
    { name: 'Memory', value: 78, change: -3 }
  ]
});
```

### JSON Interpolation

Objects are automatically stringified:

```typescript
const response = await claude(
  'Parse this config: {config}',
  {
    config: {
      server: { port: 3000, host: 'localhost' },
      database: { url: 'postgresql://...' }
    }
  }
);
```

## Best Practices

### 1. Use Meaningful Variable Names

```typescript
// Good
'Analyze {sourceCode} written in {programmingLanguage}'

// Avoid
'Analyze {sc} written in {lang}'
```

### 2. Provide Defaults for Optional Values

```typescript
'Review PR #{prNumber || "latest"} by {author || "unknown"}'
```

### 3. Validate Before Interpolation

```typescript
import { validateInput } from 'channelcoder';

const schema = z.object({
  code: z.string(),
  language: z.string()
});

const validated = validateInput(data, schema);
if (validated.success) {
  const response = await claude(prompt, validated.data);
}
```

### 4. Keep Templates Readable

Break complex templates into multiple lines:

```typescript
const prompt = `
{#if analysis_type === "security"}
  Perform security analysis on:
  - Repository: {repo}
  - Branch: {branch}
  - Focus: {security_focus || "OWASP Top 10"}
{#else}
  Perform code quality analysis on {repo}
{#endif}
`;
```

### 5. Use File Templates for Reusability

Store complex prompts in markdown files:

```bash
prompts/
├── analyze.md
├── review.md
├── debug.md
└── optimize.md
```

## Common Patterns

### Multi-line Content

```typescript
const response = await claude(
  'Review this code:\n\n{code}\n\nFocus on: {aspects}',
  {
    code: fs.readFileSync('app.js', 'utf-8'),
    aspects: ['performance', 'security', 'readability']
  }
);
```

### Dynamic Lists

```typescript
const prompt = 'Check these URLs: {urls.join(", ")}';
const response = await claude(prompt, {
  urls: ['https://example.com', 'https://test.com']
});
```

### Conditional Tool Selection

```markdown
---
tools: {requiresBash ? ["Bash", "Read"] : ["Read"]}
---

{#if requiresBash}
Execute and analyze the script: {script}
{#else}
Review the code: {script}
{#endif}
```

## Debugging Templates

### Dry Run Mode

Test template interpolation without calling Claude:

```typescript
const result = await claude(
  'Complex template: {data}',
  { data: complexObject },
  { dryRun: true }
);

console.log('Processed template:', result);
```

### Template Validation

Check for missing variables:

```typescript
const template = 'Hello {name}, your score is {score}';
const data = { name: 'Alice' }; // Missing 'score'

// This will show the template with missing variable
const result = await claude(template, data, { dryRun: true });
```

## Error Handling

### Missing Variables

Variables without values show as-is:

```typescript
'Hello {name}' + {} → 'Hello {name}'
```

### Invalid Expressions

Invalid expressions are caught during interpolation:

```typescript
try {
  await claude('{value.toUpperCase()}', { value: 123 });
} catch (error) {
  // Error: toUpperCase is not a function
}
```

### Circular References

Avoid circular references in data:

```typescript
const data = { a: {} };
data.a.circular = data; // Will cause issues
```

## Performance Tips

1. **Pre-compile Templates**: For frequently used templates, consider caching
2. **Minimize Expressions**: Complex expressions in templates can slow interpolation
3. **Use File Templates**: File-based templates are cached after first load
4. **Batch Operations**: Process multiple similar prompts together

## Migration Guide

### From Plain Strings

```typescript
// Before
const prompt = `Analyze ${code} in ${language}`;

// After
const response = await claude(
  'Analyze {code} in {language}',
  { code, language }
);
```

### From Template Literals

```typescript
// Before
const prompt = `
${hasTests ? 'Run tests first' : ''}
Analyze the code
`;

// After
const template = `
{#if hasTests}Run tests first{#endif}
Analyze the code
`;
```