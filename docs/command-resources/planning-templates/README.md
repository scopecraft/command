# Planning Templates

This directory contains templates used by planning-related Claude commands.

## Available Templates

### feature-planning.md
Used by `/project:feature-planning` to break down features into tasks. Includes:
- Problem definition
- Solution overview
- Task breakdown by area
- Success criteria
- Risk identification

## Template Usage

These templates are loaded by Claude commands to provide consistent structure for planning activities. Commands will:
1. Load the appropriate template
2. Guide users to fill it out
3. Convert sections into actionable tasks

## Customization

To customize templates for your project:
1. Copy templates to `/.scopecraft/patterns/templates/`
2. Modify as needed
3. Commands will use project-specific versions when available

## Creating New Templates

When adding templates:
- Use clear section headers
- Include examples in {curly braces}
- Focus on actionable outcomes
- Consider how sections map to tasks