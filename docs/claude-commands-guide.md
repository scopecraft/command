# Creating Claude Commands: A Complete Guide

This guide explains how to create custom slash commands for Claude Code. If you're an LLM reading this, pay special attention to the "Key Concepts" section - it contains critical information that's often misunderstood.

## Table of Contents
1. [Key Concepts](#key-concepts)
2. [File Structure](#file-structure)
3. [How $ARGUMENTS Works](#how-arguments-works)
4. [Creating Your First Command](#creating-your-first-command)
5. [Command Design Patterns](#command-design-patterns)
6. [Best Practices](#best-practices)
7. [Common Mistakes](#common-mistakes)
8. [Testing Commands](#testing-commands)
9. [Advanced Patterns](#advanced-patterns)
10. [Workflow Commands](#workflow-commands)

## Key Concepts

### CRITICAL: The Entire File IS the Prompt

The **entire content** of your command file becomes the prompt sent to Claude. This includes:
- Every line of text
- All XML tags
- Any markdown formatting

### What Gets Sent to Claude

When a user runs `/project:mycommand`, Claude receives the **complete content** of `.claude/commands/mycommand.md` with any `$ARGUMENTS` replaced.

### HTML Comments Are Also Part of the Prompt

HTML comments are included in the prompt just like everything else in the file:

```markdown
<!-- This comment will be seen by Claude -->

<task>
This is also part of the prompt that Claude will see
</task>

<!-- This comment is also sent to Claude -->
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
```

### Step 2: Test It

- Run `/project:simple-review utils.ts`
- Claude receives the prompt with `$ARGUMENTS` replaced by `utils.ts`

## Command Design Patterns

When building commands for Scopecraft, we use two main approaches based on the nature of the commands:

### Hybrid Approach: Specialized vs Generic Commands

**1. Specialized Commands (Major Workflow Differences)**

Use specialized commands for operations with fundamentally different purposes:
- `/project:01_brainstorm-feature` - Interactive ideation (Step 1)
- `/project:02_feature-proposal` - Formal documentation (Step 2)
- `/project:03_feature-to-prd` - Detailed specifications (Step 3)
- `/project:04_feature-planning` - Task breakdown (Step 4)

These commands have distinct prompts tailored to their specific workflows.

**2. Generic Commands with Modes (Technical Variations)**

Use generic commands with mode detection for technical domain variations:
- `/project:05_implement typescript TASK-123`
- `/project:05_implement ui TASK-123`
- `/project:05_implement mcp TASK-123`
- `/project:test TASK-123`
- `/project:integrate TASK-123`

These share common patterns but apply domain-specific guidance.

### Mode Detection Pattern

```markdown
<mode_detection>
Parse arguments: "$ARGUMENTS"
Extract mode (first word) and remaining parameters
</mode_detection>

<guidance_loading>
Based on mode "{mode}", load:
- Domain-specific patterns from /docs/command-resources/implement-modes/{mode}.md
- Apply specialized knowledge for that technical area
</guidance_loading>
```

### Resource Organization

Store command resources in a structured directory:
```
/docs/command-resources/
├── implement-modes/       # Mode-specific guidance
├── planning-templates/    # Template documents
└── README.md             # Resource documentation
```

This enables:
- Future tooling integration
- Project-specific overrides
- Consistent patterns across commands

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

### 5. Include Human Review Sections

For complex commands, add sections to track assumptions and decisions:

```markdown
<human_review_needed>
Flag decisions needing verification:
- [ ] Assumptions about workflows
- [ ] Technical approach choices
- [ ] Pattern-based suggestions
</human_review_needed>
```

### 6. Reference Organizational Structure

Commands should understand Scopecraft's organizational model:

```markdown
<context>
Key Reference: /docs/organizational-structure-guide.md
- Phases = releases (v1, v1.1), NOT task statuses
- Statuses = task lifecycle (planning, implementation, done)
- Areas = technical domains
- Features = user-facing capabilities
</context>
```

### 7. Update Task State Appropriately

Commands that work with tasks should update their status and logs:

```markdown
<task_updates>
After implementation:
1. Update task status to appropriate state
2. Add implementation log entries
3. Mark checklist items as complete
4. Document any decisions made
</task_updates>
```

## Common Mistakes

### Mistake 1: Not Escaping Special Characters

❌ **Wrong:**
```markdown
<task>
Process file: $ARGUMENTS
Note: Be careful with regex patterns that contain $
</task>
```

✅ **Correct:**
```markdown
<task>
Process file: $ARGUMENTS
Note: Be careful with regex patterns that contain \$
</task>
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
</parse_input>
```

### Pattern 3: Combining with System Context

```markdown
<task>
Review code changes for: $ARGUMENTS
</task>

<context>
Use available tools to understand the codebase context
</context>
```

## Workflow Commands

Scopecraft includes specialized commands for feature development workflow:

### Feature Development Lifecycle

1. **Brainstorming**: `/project:01_brainstorm-feature`
   - Interactive exploration of problems and solutions
   - Generates ideas ready for proposal

2. **Proposal**: `/project:02_feature-proposal`
   - Creates formal feature proposals
   - Documents the "why" and high-level "how"

3. **PRD Creation**: `/project:03_feature-to-prd`
   - Expands proposals into detailed specifications
   - Includes technical design and requirements

4. **Planning**: `/project:04_feature-planning`
   - Breaks features into actionable tasks
   - Creates task hierarchy with dependencies

5. **Implementation**: `/project:05_implement {mode} {task-id}`
   - Mode-specific guidance (typescript, ui, mcp, cli)
   - Follows domain best practices

### Example Workflow

```bash
# Step 1: Start with an idea
/project:01_brainstorm-feature "better task filtering"

# Step 2: Create formal proposal
/project:02_feature-proposal

# Step 3: Expand to detailed PRD
/project:03_feature-to-prd TASK-20250517-123456

# Step 4: Break down into tasks
/project:04_feature-planning FEATURE-20250517-123456

# Implement specific tasks
/project:05_implement ui TASK-20250517-234567
/project:05_implement core TASK-20250517-345678
```

### Command Patterns

All workflow commands follow consistent patterns:
- Reference organizational structure guide
- Use MCP tools for task operations
- Include human review sections
- Update task states appropriately
- Create proper documentation trails

## Versioning and Release Command

Creating a release involves several standardized steps. Here's a command for managing this workflow:

### Command Purpose

This command guides through the release process, ensuring consistent versioning and changelog updates.

### Command Template (`.claude/commands/release.md`)

```markdown
<task>
Help me prepare a release of version $ARGUMENTS for this project. If no version is provided, determine next version based on changes.
</task>

<context>
Release management for this project follows these key principles:
1. Semantic versioning (MAJOR.MINOR.PATCH)
2. Changelog-driven release notes
3. Consistent commit messages for release
4. Automated version reference updates
5. Local package validation before publishing
</context>

<version_determination>
If no explicit version is provided in "$ARGUMENTS", determine the next version by:

1. Examine the scope of changes since last release:
   - Bug fixes only = PATCH bump (0.10.0 → 0.10.1)
   - New features = MINOR bump (0.10.0 → 0.11.0)
   - Breaking changes = MAJOR bump (0.10.0 → 1.0.0)

2. Look at commit messages to determine change type:
   - "fix:", "bugfix:", "patch:" → PATCH
   - "feat:", "feature:", "minor:" → MINOR
   - "BREAKING CHANGE:", "breaking:" → MAJOR

3. Propose and confirm the suggested version with the user
</version_determination>

<release_steps>
Follow these steps in sequence:

1. **Determine Version**
   - Current version: Check package.json
   - Next version: Determine based on changes

2. **Update Package Metadata**
   - Update version in package.json
   - Run version update script: `bun run update-version`
   - Verify CLI version references are updated

3. **Update Changelog**
   - Follow Keep a Changelog format (https://keepachangelog.com/)
   - Group changes by type: Added, Changed, Fixed, Removed, Security
   - Include precise date with correct format: [x.y.z] - YYYY-MM-DD
   - Describe changes in user-friendly language
   - Highlight important changes first
   - Use bullet points consistently
   - Link to relevant issues if applicable

4. **Build and Validate**
   - Run build process: `bun run build`
   - Verify build outputs are generated correctly
   - Run tests: `bun test`

5. **Create Local Package**
   - Run `bun run publish:local` to create and copy package
   - Run `bun run install:local` to test local installation

6. **Commit Changes**
   - Stage changes: package.json, CHANGELOG.md, version reference files
   - Create standardized commit message:
     ```
     Bump version to x.y.z

     - Update version in package.json to x.y.z
     - Update CLI version references in source files
     - Add CHANGELOG entry for x.y.z release
     - [Summary of key changes in this release]

     🤖 Generated with [Claude Code](https://claude.ai/code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

7. **Publish Package (when ready)**
   - Summarize final steps for NPM publishing
   - Recommend creating a GitHub release
   - Document post-release verification
</release_steps>

<changelog_guidelines>
CHANGELOG entries should follow these rules:

1. **Entry Format**
   ```markdown
   ## [1.2.3] - YYYY-MM-DD

   ### Added
   - **User-facing feature name**: Description of what it does and why it matters
   
   ### Fixed
   - **Issue area**: Description of what was broken and how it's fixed
   
   ### Changed
   - **Component name**: Description of what changed and impact on users
   ```

2. **Language Guidelines**
   - Write from user perspective (what they get, not how you coded it)
   - Focus on value and impact
   - Use present tense, active voice
   - Bold the feature/area name for scanability
   - Keep entries concise but informative
   - Avoid technical implementation details unless relevant to users

3. **Grouping Logic**
   - Added: New features and capabilities (things users couldn't do before)
   - Fixed: Bug fixes, corrections (things that should have worked but didn't)
   - Changed: Modifications to existing functionality (things that work differently now)
   - Removed: Features taken away (things users could do before but can't now)
   - Security: Security-related changes (always highlight these)
   - Deprecated: Features that will be removed in future releases
</changelog_guidelines>

<examples>
**Example 1: Patch Release (Bug Fix)**

```markdown
## [0.10.1] - 2025-05-19

### Fixed
- **Path Parsing Bug**: Fixed an issue where using relative paths with `--root-dir` would cause incorrect subdirectory extraction
- **System Directory Filtering**: Improved filtering of system directories (dot-prefixed) from phase listings

### Improved
- **Configuration Management**: Better support for runtime configuration propagation throughout the application
```

**Example 2: Minor Release (New Features)**

```markdown
## [0.11.0] - 2025-06-02

### Added
- **Task Templates**: Added support for creating tasks from custom templates
- **Multiple Phase Selection**: Now supporting selection of multiple phases in task listings
- **Export Formats**: Added CSV and JSON export options for task lists

### Fixed
- **Search Performance**: Improved search speed for large task collections
- **UI Rendering**: Fixed display issues in task detail view
```

**Example 3: Major Release (Breaking Changes)**

```markdown
## [1.0.0] - 2025-07-15

### Added
- **REST API**: Complete HTTP API for all task management operations
- **Authentication**: Support for API keys and role-based access control
- **Plugins System**: Extensible architecture for custom workflows

### Changed
- **Command Structure**: Reorganized CLI commands for consistency (see migration guide)
- **Configuration Format**: New JSON schema for configuration (requires migration)

### Removed
- **Legacy Import Format**: Removed support for v0.x import formats
```
</examples>

<human_review_needed>
Flag these aspects for verification:
- [ ] Correct version bump based on changes (PATCH/MINOR/MAJOR)
- [ ] Completeness of CHANGELOG entries
- [ ] Build and test results
- [ ] Package validation results
- [ ] Final release approval
</human_review_needed>
```

### Using the Release Command

```bash
# For automatic version determination
/project:release

# For specific version
/project:release 0.11.0

# For specific version type
/project:release patch
```

## Summary

1. **The entire file is the prompt** - everything in the file becomes the prompt
2. **$ARGUMENTS is literally replaced** throughout the entire file
3. **Use XML tags** for clear structure
4. **Use MCP tools**, not CLI commands
5. **Design commands with hybrid approach** - specialized for workflows, generic with modes for variations
6. **Include human review tracking** for assumptions and decisions
7. **Update task states** during command execution
8. **Test with and without arguments** to ensure robustness

Remember: When creating a command, you're writing the exact prompt that Claude will receive, with `$ARGUMENTS` as a placeholder for user input. Follow the established patterns for consistency and maintainability.