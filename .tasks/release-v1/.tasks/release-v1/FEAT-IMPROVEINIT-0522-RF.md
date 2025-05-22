+++
id = "FEAT-IMPROVEINIT-0522-RF"
title = "Improve init flow with better guidance and uninitialized project handling"
type = "feature"
status = "🟡 To Do"
priority = "🔼 High"
created_date = "2025-05-22"
updated_date = "2025-05-22"
assigned_to = ""
phase = "release-v1"
subdirectory = ".tasks/release-v1"
+++

## Problem
Current init flow has two main issues:
1. When running commands in an uninitialized project, users get generic errors without guidance
2. When running `sc init`, output is minimal (3 lines) with no onboarding or next steps

## Current Behavior
```bash
$ sc list  # in uninitialized project
Error: Tasks directory not found

$ sc init
Project initialized
Tasks directory: /path/to/.tasks
Configuration directory: /path/to/.tasks/.config
```

## Priority 1: Uninitialized Project Detection (CRITICAL FOR ALPHA)

### Implementation Options (implementer should choose based on Commander.js capabilities):

#### Option A: Global Middleware Approach
- Intercept ALL commands before execution
- Check if .tasks directory exists
- Show helpful message and exit gracefully
```bash
$ sc list
⚠️  No Scopecraft project found in this directory.

Run 'sc init' to initialize a new project here.
```

#### Option B: Interactive Init Offer
- Detect uninitialized state
- Prompt user to initialize
```bash
$ sc list
⚠️  No Scopecraft project found in this directory.

Would you like to initialize a project here? (y/N)
> y
[runs sc init automatically]
```

#### Option C: Command-level Checks
- Add initialization check to each command handler
- More work but gives command-specific messages
```bash
$ sc list
⚠️  Cannot list tasks - no Scopecraft project found.

To get started:
  sc init     - Initialize a new project here
  sc list --root-dir /path/to/project  - Use existing project
```

### Technical Considerations
- Commander.js may support global hooks/middleware
- Consider using `.hook('preAction')` or similar
- Ensure --help and --version still work without init
- Handle --root-dir flag properly (shouldn't require local init)

## Priority 2: Enhanced Init Output (Nice to Have for Alpha)
```bash
$ sc init

🚀 Welcome to Scopecraft Command!

Initializing project in: /path/to/project
✓ Created .tasks directory structure
✓ Installed 6 task templates
✓ Generated quick start guide

📁 Project Structure:
  .tasks/
  ├── 📋 Your tasks will live here
  ├── .config/ (configuration files)
  └── .templates/ (customizable templates)

🎯 Next Steps:
  1. Create your first task: sc create --type feature --title "My Feature"
  2. View available templates: sc list-templates
  3. See all tasks: sc list

📚 Resources:
  - Quick Start: .tasks/QUICKSTART.md
  - Templates: .tasks/.templates/
  - Documentation: https://github.com/scopecraft/scopecraft-command

💡 Tip: Use your AI assistant to customize templates in .tasks/.templates/
```

## Implementation Approach
1. **Research Commander.js capabilities** for global command interception
2. **Implement the simplest working solution** from options above
3. **Test with all commands** to ensure consistent behavior
4. **Special cases to handle**:
   - Commands that should work without init (help, version, init itself)
   - Commands with --root-dir flag
   - MCP server mode (different error handling)

## Success Criteria for Alpha
- Users never see "Tasks directory not found" error
- Clear guidance on how to initialize project
- All commands handle uninitialized state gracefully
- No confusion about what to do next
