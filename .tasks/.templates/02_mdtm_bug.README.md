# Documentation: Template `02_mdtm_bug.md`

## Purpose

This template is used for reporting, tracking, and resolving bugs within the Markdown-Driven Task Management (MDTM) system. Bug tasks typically reside in `.ruru/tasks/` or feature-specific subdirectories.

## Usage

1.  Copy `.ruru/templates/toml-md/02_mdtm_bug.md` to the appropriate task directory (e.g., `.ruru/tasks/` or `.ruru/tasks/FEATURE_Authentication/`).
2.  Rename the file following MDTM conventions (e.g., `005_🐛_login_fails_on_safari.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, ensuring `reporter` is specified.
4.  Replace the placeholder content in the Markdown body with specific details about the bug, steps to reproduce, expected/actual behavior, and acceptance criteria for the fix.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "BUG-AUTH-005").

*   `title` (String, Required):
    *   A concise, human-readable summary of the bug.

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"🐞 Bug"`):
    *   Indicates the task type. Do not change this value for bug tasks.

*   `priority` (String, Required):
    *   The priority level for fixing the bug.
    *   Options: `"🔥 Highest"`, `"🔼 High"`, `"▶️ Medium"`, `"🔽 Low"`, `"🧊 Lowest"`.

*   `created_date` (String, Required):
    *   The date the bug task was created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the task was last significantly updated, in `YYYY-MM-DD` format.

*   `due_date` (String, Optional):
    *   Target fix date in `YYYY-MM-DD` format.

*   `estimated_effort` (String, Optional):
    *   An estimate of the effort required to fix (e.g., "S", "M", "L").

*   `assigned_to` (String, Optional):
    *   Who is currently assigned to fix the bug.
    *   Examples: `"🤖 AI:bug-fixer"`, `"🧑‍💻 User:JohnDoe"`, `"👥 Team:QA"`.

*   `reporter` (String, Required):
    *   Who reported the bug. Crucial for context.
    *   Examples: `"🧑‍💻 User:JaneDoe"`, `"QA Tester"`, `"Automated Monitoring"`.

*   `parent_task` (String, Optional):
    *   Path or ID of a related feature or epic task file, if applicable.

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs that must be completed before this bug fix can start.

*   `related_docs` (Array of Strings, Optional):
    *   List relative paths or URLs to relevant logs, screenshots, specifications, etc.
    *   Example: `[".ruru/logs/error.log", ".ruru/screenshots/bug-005.png"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant technologies, components, functional areas, and severity/environment if applicable.
    *   Example: `["ui", "backend", "auth", "critical", "safari", "production"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/02_mdtm_bug.README.md"`

*   `environment` (String, Optional):
    *   Description of the environment where the bug was observed.
    *   Example: `"Production"`, `"Staging v1.2"`, `"Browser: Safari 15 on macOS"`

*   `commit_hash` (String, Optional):
    *   The Git commit hash where the bug was observed or potentially introduced.

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants during fixing.

*   `review_checklist` (Array of Strings, Optional):
    *   A predefined checklist for reviewers of the fix.
    *   Example: `["[ ] Bug Fixed", "[ ] Root Cause Identified", "[ ] Regression Test Added"]`

*   `reviewed_by` (String, Optional):
    *   Who performed the review of the fix (if applicable).

*   `key_learnings` (String, Optional, Multiline):
    *   A space to summarize the root cause, fix complexity, or insights gained.

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE BUG SUMMARY >>`: Replace with the bug title.
*   `## Description ✍️`: Detail the problem, location, and impact.
*   `## Steps to Reproduce 🚶‍♀️`: Provide clear, numbered steps to trigger the bug.
*   `## Expected Behavior ✅`: Describe the correct behavior.
*   `## Actual Behavior ❌`: Describe the incorrect behavior (the bug). Include errors/screenshots.
*   `## Environment Details 🖥️ (Optional)`: Add environment details if not in TOML.
*   `## Acceptance Criteria (Definition of Done) ✅`: Define criteria for considering the bug fixed.
*   `## Implementation Notes / Root Cause Analysis 📝`: (Optional) Space for developer/AI notes on the fix.
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback during review.
*   `## Key Learnings 💡 (Optional)`: Document insights after fixing.