# Implementation Mode Guidelines

This directory contains mode-specific implementation guidance for the `/project:05_implement` command.

## Structure

Each mode has its own file:
- `typescript.md` - Core TypeScript development patterns
- `ui.md` - React/UI component implementation
- `mcp.md` - MCP server and tool development
- `cli.md` - CLI command implementation
- etc.

## Creating New Modes

To add a new implementation mode:

1. Create a file named `{mode}.md` in this directory
2. Include:
   - Mode-specific best practices
   - Common patterns and utilities
   - Testing approaches
   - Documentation requirements
   - Integration considerations

## General Implementation Patterns

When mode-specific guidance doesn't exist, these general patterns apply:

### 1. Code Organization
- Follow existing directory structure
- Keep related code together
- Use clear, descriptive names

### 2. Error Handling
- Handle errors gracefully
- Provide meaningful error messages
- Log errors appropriately

### 3. Testing
- Write tests for new functionality
- Follow existing test patterns
- Consider edge cases

### 4. Documentation
- Document complex logic
- Update README files as needed
- Include usage examples

### 5. Integration
- Consider impact on other areas
- Maintain backwards compatibility
- Test integration points

## Mode Detection

The `/project:05_implement` command will:
1. Look for `/docs/implement-modes/{mode}.md`
2. If found, use mode-specific guidance
3. If not found, apply general patterns and assume the role

This allows the command to work with any mode, even those not yet documented.