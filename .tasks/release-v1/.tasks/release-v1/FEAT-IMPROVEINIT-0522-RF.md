+++
id = "FEAT-IMPROVEINIT-0522-RF"
title = "Improve init flow with better guidance and uninitialized project handling"
type = "feature"
status = "🟢 Done"
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

## Priority 1: Uninitialized Project Detection (CRITICAL FOR ALPHA) ✅

### Implementation Options (implementer should choose based on Commander.js capabilities):

#### Option A: Global Middleware Approach ✅ IMPLEMENTED
- Intercept ALL commands before execution
- Check if .tasks directory exists
- Show helpful message and exit gracefully
```bash
$ sc list
⚠️  No Scopecraft project found in this directory.

To get started:
  sc init               - Initialize a new project here
  sc --root-dir <path>  - Use an existing project

Learn more: https://github.com/scopecraft/scopecraft-command
```

## Priority 2: Enhanced Init Output (Nice to Have for Alpha) ✅ IMPLEMENTED
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

## Additional Work Completed

### 3. Fixed Template System Issues ✅
- **Problem**: Only feature and bug templates were being created (out of 6 available)
- **Solution**: Updated `createBasicTemplates()` to include all 6 MDTM templates:
  - Feature, Bug, Chore, Documentation, Test, Spike/Research
- **Result**: All templates now properly installed during init

### 4. Template Refactoring ✅
- **Problem**: Templates had TOML frontmatter causing "Required field 'id' is not set" warnings
- **Solution**: 
  - Moved templates from hardcoded strings to individual files in `src/templates/`
  - Removed TOML frontmatter from all templates (now markdown-only)
  - Updated `applyTemplate()` to handle both legacy and new formats
  - Updated build process to include templates in distribution
- **Benefits**:
  - No more confusing warnings
  - Cleaner code without complex string concatenation
  - Templates are easier to maintain and extend
  - Better editor support for template files

### 5. Created Comprehensive QUICKSTART.md ✅
- Auto-generated during init with:
  - Basic command examples
  - Task type descriptions
  - Workflow tips
  - Customization guidance
  - Pro tips for power users

## Implementation Summary
1. **Improved error messages** for uninitialized projects
2. **Enhanced init command** with detailed welcome message and guidance
3. **Fixed template issues** - all 6 templates now included
4. **Refactored template system** - removed frontmatter, cleaner implementation
5. **Added QUICKSTART.md** generation for better onboarding

## Testing Results
- ✅ Uninitialized project shows helpful error
- ✅ Init command shows enhanced output
- ✅ All 6 templates are created
- ✅ No more "Required field 'id'" warnings
- ✅ Template content is properly preserved
- ✅ Tasks can be created with and without templates

## Success Criteria for Alpha ✅
- Users never see "Tasks directory not found" error ✅
- Clear guidance on how to initialize project ✅
- All commands handle uninitialized state gracefully ✅
- No confusion about what to do next ✅
- All 6 task templates available ✅
- No template-related warnings ✅
