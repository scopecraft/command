# Documentation: Template `04_mdtm_documentation.md`

## Purpose

This template is used for defining and tracking tasks specifically focused on writing or updating documentation within the Markdown-Driven Task Management (MDTM) system. This could include creating READMEs, user guides, API references, tutorials, or updating existing documentation.

## Usage

1.  Copy `.ruru/templates/toml-md/04_mdtm_documentation.md` to the appropriate task directory (e.g., `.ruru/tasks/DOCS/` or `.ruru/tasks/FEATURE_XXX/`).
2.  Rename the file following MDTM conventions (e.g., `003_📖_update_readme_installation.md`).
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Replace the placeholder content in the Markdown body with specific details about the documentation required, its audience, scope, and acceptance criteria.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "DOCS-README-003").

*   `title` (String, Required):
    *   A concise, human-readable description of the documentation task.
    *   Example: `"Document Login API"`, `"Update README Installation Section"`

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"📖 Documentation"`):
    *   Indicates the task type. Do not change this value for documentation tasks.

*   `priority` (String, Required):
    *   The priority level of the documentation task.
    *   Options: `"🔥 Highest"`, `"🔼 High"`, `"▶️ Medium"`, `"🔽 Low"`, `"🧊 Lowest"`.

*   `created_date` (String, Required):
    *   The date the task was created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the task was last significantly updated, in `YYYY-MM-DD` format.

*   `due_date` (String, Optional):
    *   Target completion date in `YYYY-MM-DD` format.

*   `estimated_effort` (String, Optional):
    *   An estimate of the effort required (e.g., "S", "M", "L").

*   `assigned_to` (String, Optional):
    *   Who is currently assigned to write/update the documentation.
    *   Examples: `"🤖 AI:technical-writer"`, `"🧑‍💻 User:DocsLead"`.

*   `reporter` (String, Optional):
    *   Who requested this documentation task.

*   `parent_task` (String, Optional):
    *   Path or ID of a related feature, epic, or main documentation file.

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs (e.g., feature implementation) that must be completed before documentation can be finalized.

*   `related_docs` (Array of Strings, Required):
    *   **Crucial for context.** List relative paths or URLs to the features, code, APIs, or existing documents being documented or updated.
    *   Example: `["TASK-FEAT-001", "src/api/auth.js", ".ruru/docs/user-guide.md"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant topics, document types, or areas.
    *   Example: `["api", "user-guide", "readme", "technical-writing", "auth"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/04_mdtm_documentation.README.md"`

*   `target_audience` (Array of Strings, Optional):
    *   Specifies the intended audience for the documentation.
    *   Example: `["developers", "end_users", "qa_team"]`

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants (e.g., `technical-writer` mode).

*   `review_checklist` (Array of Strings, Optional):
    *   A predefined checklist for documentation reviewers.
    *   Example: `["[ ] Content Accurate", "[ ] Content Clear", "[ ] Grammar/Spelling OK"]`

*   `reviewed_by` (String, Optional):
    *   Who performed the review (if applicable).

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE DOCS TASK >>`: Replace with the task title.
*   `## Description ✍️`: Detail what needs documenting, why, the target audience, and scope.
*   `## Acceptance Criteria ✅`: List specific criteria for considering the documentation complete and accurate.
*   `## Implementation Notes / Content Outline 📝`: (Optional) Outline the document structure or key points to cover.
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback during review.