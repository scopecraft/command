# Documentation: Template `01_mdtm_feature.md`

## Purpose

This template is used for defining and tracking new user-facing features within the Markdown-Driven Task Management (MDTM) system. Feature tasks typically reside in `.ruru/tasks/FEATURE_XXX/` directories.

## Usage

1.  Copy `.ruru/templates/toml-md/01_mdtm_feature.md` to the appropriate feature directory (e.g., `.ruru/tasks/FEATURE_Authentication/`).
2.  Rename the file following MDTM conventions (e.g., `001_➕_login_ui.md`).
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Replace the placeholder content in the Markdown body with specific details about the feature, acceptance criteria, and implementation notes.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "FEAT-AUTH-001").

*   `title` (String, Required):
    *   A concise, human-readable title for the feature.

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"🌟 Feature"`):
    *   Indicates the task type. Do not change this value for feature tasks.

*   `priority` (String, Required):
    *   The priority level of the task.
    *   Options: `"🔥 Highest"`, `"🔼 High"`, `"▶️ Medium"`, `"🔽 Low"`, `"🧊 Lowest"`.

*   `created_date` (String, Required):
    *   The date the task was created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the task was last significantly updated, in `YYYY-MM-DD` format.

*   `due_date` (String, Optional):
    *   Target completion date in `YYYY-MM-DD` format.

*   `estimated_effort` (String, Optional):
    *   An estimate of the effort required (e.g., "S", "M", "L", "XL" or Story Points like "3", "5").

*   `assigned_to` (String, Optional):
    *   Who is currently responsible for the task.
    *   Examples: `"🤖 AI:react-specialist"`, `"🧑‍💻 User:JaneDoe"`, `"👥 Team:Backend"`.

*   `reporter` (String, Optional):
    *   Who initially requested or reported this feature.

*   `parent_task` (String, Optional):
    *   Path or ID of a parent epic or feature overview file.
    *   Example: `"FEATURE_Authentication/_overview.md"`

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs that must be completed before this task can start.
    *   Example: `["TASK-API-005", "TASK-DB-002"]`

*   `related_docs` (Array of Strings, Required):
    *   **Crucial for context.** List relative paths or URLs to relevant requirements documents, design mockups, API specifications, etc.
    *   Example: `[".ruru/docs/prd/feature-x.md", ".ruru/designs/feature-x/mockup.png"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant technologies, components, or functional areas.
    *   Example: `["ui", "backend", "auth", "react", "login"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/01_mdtm_feature.README.md"`

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants during task execution.

*   `review_checklist` (Array of Strings, Optional):
    *   A predefined checklist for reviewers.
    *   Example: `["[ ] Meets all AC", "[ ] Code Style OK", "[ ] Tests Added/Pass"]`

*   `reviewed_by` (String, Optional):
    *   Who performed the review (if applicable).

*   `key_learnings` (String, Optional, Multiline):
    *   A space to summarize important discoveries or challenges encountered upon task completion.

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE FEATURE TITLE >>`: Replace with the feature title.
*   `## Description ✍️`: Detail what the feature is, why it's needed, and its scope.
*   `## Acceptance Criteria ✅`: List specific, testable criteria for completion. Use GFM checklists (`- [ ]`).
*   `## Implementation Notes / Sub-Tasks 📝`: (Optional) Break down technical steps.
*   `## Diagrams 📊 (Optional)`: Embed Mermaid diagrams or link to visuals.
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback during review.
*   `## Key Learnings 💡 (Optional)`: Document insights after completion.