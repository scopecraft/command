# Documentation: Template `03_mdtm_chore.md`

## Purpose

This template is used for defining and tracking chores within the Markdown-Driven Task Management (MDTM) system. Chores represent tasks that are necessary for project health but don't directly deliver new user-facing features, such as maintenance, refactoring, dependency updates, build process improvements, or addressing technical debt.

## Usage

1.  Copy `.ruru/templates/toml-md/03_mdtm_chore.md` to the appropriate task directory (e.g., `.ruru/tasks/` or `.ruru/tasks/REFACTORING/`).
2.  Rename the file following MDTM conventions (e.g., `012_🧹_update_npm_dependencies.md`).
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Replace the placeholder content in the Markdown body with specific details about the chore, its motivation, and acceptance criteria.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the task, often generated (e.g., "CHORE-DEPS-012").

*   `title` (String, Required):
    *   A concise, human-readable description of the chore.
    *   Example: `"Update NPM Dependencies"`, `"Refactor Authentication Service"`

*   `status` (String, Required):
    *   The current status of the task.
    *   Standard MDTM values: `"🟡 To Do"`, `"🔵 In Progress"`, `"🟣 Review"`, `"🟢 Done"`, `"⚪ Blocked"`, `"🧊 Archived"`, `"🤖 Generating"`.

*   `type` (String, Fixed: `"🧹 Chore"`):
    *   Indicates the task type. Do not change this value for chore tasks.

*   `priority` (String, Required):
    *   The priority level of the chore.
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
    *   Who is currently assigned to perform the chore.
    *   Examples: `"🤖 AI:refactor-specialist"`, `"🧑‍💻 User:DevOpsLead"`, `"👥 Team:Platform"`.

*   `reporter` (String, Optional):
    *   Who requested or identified the need for this chore.

*   `parent_task` (String, Optional):
    *   Path or ID of a related feature, epic, or technical debt tracking file.

*   `depends_on` (Array of Strings, Optional):
    *   List of task IDs that must be completed before this chore can start.

*   `related_docs` (Array of Strings, Optional):
    *   List relative paths or URLs to relevant documentation, tech debt logs, performance reports, etc.
    *   Example: `[".ruru/docs/tech-debt.md", ".ruru/reports/performance/run-01.log"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering. Include relevant technologies, areas, or reasons.
    *   Example: `["refactoring", "dependencies", "performance", "tech-debt", "backend", "auth"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/03_mdtm_chore.README.md"`

*   `ai_prompt_log` (String, Optional, Multiline):
    *   A multiline string (`"""..."""`) to log key prompts given to AI assistants.

*   `review_checklist` (Array of Strings, Optional):
    *   A predefined checklist for reviewers.
    *   Example: `["[ ] Chore Completed", "[ ] No Regressions Introduced", "[ ] Tests Pass"]`

*   `reviewed_by` (String, Optional):
    *   Who performed the review (if applicable).

*   `key_learnings` (String, Optional, Multiline):
    *   A space to summarize challenges, improvements, or insights gained.

## Markdown Body

The section below the `+++` TOML block contains the human-readable details:

*   `# << CONCISE CHORE DESCRIPTION >>`: Replace with the chore title.
*   `## Description ✍️`: Detail what needs doing, why, and the scope.
*   `## Acceptance Criteria ✅`: List specific, measurable criteria for completion.
*   `## Implementation Notes / Sub-Tasks 📝`: (Optional) Break down technical steps.
*   `## Diagrams 📊 (Optional)`: Embed Mermaid diagrams if helpful (e.g., before/after architecture).
*   `## AI Prompt Log 🤖 (Optional)`: Alternative space for logging AI interactions.
*   `## Review Notes 👀 (For Reviewer)`: Space for feedback during review.
*   `## Key Learnings 💡 (Optional)`: Document insights after completion.