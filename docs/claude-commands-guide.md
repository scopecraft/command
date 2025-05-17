# Creating Claude Commands: A Complete Guide

This guide explains how to create custom slash commands for Claude Code. If you're an LLM reading this, pay special attention to the "Key Concepts" section - it contains critical information that's often misunderstood.

## Table of Contents
1. [Key Concepts](#key-concepts)
2. [File Structure](#file-structure)
3. [How $ARGUMENTS Works](#how-arguments-works)
4. [Creating Your First Command](#creating-your-first-command)
5. [Best Practices](#best-practices)
6. [Common Mistakes](#common-mistakes)
7. [Testing Commands](#testing-commands)

## Key Concepts

### CRITICAL: The Entire File IS the Prompt

The **entire content** of your command file becomes the prompt sent to Claude. This includes:
- Every line of text
- All XML tags
- Any markdown formatting
- Everything except HTML comments

### What Gets Sent to Claude

When a user runs `/project:mycommand`, Claude receives the **complete content** of `.claude/commands/mycommand.md` with any `$ARGUMENTS` replaced.

### HTML Comments for Documentation

To include documentation that shouldn't be part of the prompt, use HTML comments:

```markdown
<!-- This is documentation for humans, not part of the prompt -->

<task>
This is the actual prompt that Claude will see
</task>

<!-- More documentation that won't be sent to Claude -->
```

## File Structure

### Project Commands
```
.claude/
└── commands/
    ├── review.md           # Becomes /project:review
    ├── test.md            # Becomes /project:test
    └── deploy/
        └── staging.md     # Becomes /project:deploy:staging
```

### Personal Commands
```
~/.claude/
└── commands/
    ├── security.md        # Becomes /user:security
    └── optimize.md        # Becomes /user:optimize
```

## How $ARGUMENTS Works

### The Replacement Mechanism

`$ARGUMENTS` is a **literal string** that gets replaced **everywhere** in your command file:

1. User runs: `/project:review TASK-123`
2. System replaces ALL instances of `$ARGUMENTS` with `TASK-123`
3. Claude receives the modified content

### Visual Example

**Command file content:**
```markdown
<task>
Review the task with ID: $ARGUMENTS
</task>

<instructions>
Find the task $ARGUMENTS and check if $ARGUMENTS is complete.
</instructions>
```

**What Claude sees when user runs `/project:review TASK-789`:**
```markdown
<task>
Review the task with ID: TASK-789
</task>

<instructions>
Find the task TASK-789 and check if TASK-789 is complete.
</instructions>
```

**What Claude sees when user runs `/project:review` (no arguments):**
```markdown
<task>
Review the task with ID: 
</task>

<instructions>
Find the task  and check if  is complete.
</instructions>
```

## Creating Your First Command

Let's create a simple code review command step by step:

### Step 1: Create the File

Create `.claude/commands/simple-review.md`:

```markdown
<task>
You are a code reviewer. Review the recent changes in this project.
</task>

<focus>
Focus on file: $ARGUMENTS
</focus>

<instructions>
1. Check for syntax errors
2. Look for security issues
3. Verify code style
</instructions>

<!-- Usage: /project:simple-review filename.ts -->
```

### Step 2: Test It

- Run `/project:simple-review utils.ts`
- Claude receives the prompt with `$ARGUMENTS` replaced by `utils.ts`

## Best Practices

### 1. Use XML Tags for Structure

```markdown
<task>Define Claude's role</task>
<context>Provide background information</context>
<instructions>Step-by-step directions</instructions>
<output_format>Expected output structure</output_format>
<example>Concrete examples</example>
```

### 2. Handle Empty Arguments

```markdown
<task_identification>
Check if task ID provided: "$ARGUMENTS"
If empty, auto-detect the current task
</task_identification>
```

### 3. Include Examples

```markdown
<example>
Input: Review file utils.ts
Output: 
- No syntax errors found
- Security: No hardcoded credentials
- Style: Missing JSDoc comments
</example>
```

### 4. Use MCP Tools, Not CLI Commands

```markdown
<!-- WRONG - Don't use CLI commands -->
Run: scopecraft task list

<!-- CORRECT - Use MCP tools -->
Use tool: mcp__scopecraft-cmd__task_list
```

## Common Mistakes

### Mistake 1: Documenting Usage Inside the Prompt

❌ **Wrong:**
```markdown
<usage>
To use this command: /project:review TASK-123
</usage>
```

✅ **Correct:**
```markdown
<!-- Usage: /project:review TASK-123 -->
```

### Mistake 2: Not Understanding $ARGUMENTS Scope

❌ **Wrong:**
```markdown
The $ARGUMENTS placeholder will be replaced...
```

If user runs `/project:example TEST`, Claude sees:
```markdown
The TEST placeholder will be replaced...
```

✅ **Correct:**
```markdown
<!-- Documentation: $ARGUMENTS gets replaced -->
<task>
Process the input: $ARGUMENTS
</task>
```

### Mistake 3: Using CLI Commands Instead of Tools

❌ **Wrong:**
```markdown
Run command: git status
Use: scopecraft task list
```

✅ **Correct:**
```markdown
Use Bash tool: git status
Use MCP tool: mcp__scopecraft-cmd__task_list
```

## Testing Commands

### 1. Test with Arguments
```bash
# In Claude Code:
/project:review TASK-123
```

### 2. Test without Arguments
```bash
# In Claude Code:
/project:review
```

### 3. Check What Claude Receives

To debug, create a test command that shows what it receives:

`.claude/commands/debug.md`:
```markdown
<debug>
Received argument: "$ARGUMENTS"
Argument length: $ARGUMENTS characters
</debug>
```

## Advanced Patterns

### Pattern 1: Optional Arguments with Fallback

```markdown
<task_selection>
Target: "$ARGUMENTS"
If no target specified above, analyze all recent changes
</task_selection>
```

### Pattern 2: Multiple Argument Parsing

```markdown
<parse_input>
Input received: "$ARGUMENTS"
<!-- Claude will parse this, e.g., "type:bug priority:high" -->
</parse_input>
```

### Pattern 3: Combining with System Context

```markdown
<task>
Review code changes for: $ARGUMENTS
</task>

<context>
<!-- Claude has access to git status, file contents, etc. -->
Use available tools to understand the codebase context
</context>
```

## Summary

1. **The entire file is the prompt** - everything except HTML comments
2. **$ARGUMENTS is literally replaced** throughout the entire file
3. **Use XML tags** for clear structure
4. **Document usage in HTML comments** to keep it out of the prompt
5. **Use MCP tools**, not CLI commands
6. **Test with and without arguments** to ensure robustness

Remember: When creating a command, you're writing the exact prompt that Claude will receive, with `$ARGUMENTS` as a placeholder for user input.