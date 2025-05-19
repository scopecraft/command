# Command Resources

This directory contains resources used by Claude commands, organized for future tooling integration.

## Structure

```
command-resources/
├── implement-modes/      # Mode-specific guidance for /project:05_implement
├── planning-templates/   # Templates for planning commands
└── README.md            # This file
```

## Purpose

These resources are referenced by Claude commands to provide:
- Consistent patterns and best practices
- Domain-specific guidance
- Planning templates
- Reusable structures

## Available Commands

The following commands use these resources:
- `/project:01_brainstorm-feature` - Uses planning templates
- `/project:02_feature-proposal` - Uses planning templates
- `/project:03_feature-to-prd` - Uses planning templates 
- `/project:04_feature-planning` - Uses planning templates
- `/project:05_implement` - Uses mode-specific guidance from implement-modes/
- `/project:implement-next` - Automated feature implementation that uses implement modes

## Customization

Projects can override these defaults by creating a parallel structure in:
```
/.scopecraft/patterns/
├── implement-modes/
├── planning-templates/
└── ...
```

Commands will check project-specific patterns first, then fall back to these defaults.

## Adding Resources

When adding new resources:
1. Create appropriate subdirectory if needed
2. Add clear documentation in a README
3. Update relevant commands to reference new paths
4. Consider future tooling needs

## Future Integration

This structure is designed to be:
- Easily parseable by tools
- Configurable per project
- Extensible for new command types
- Versionable with the codebase