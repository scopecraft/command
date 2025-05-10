# Documentation: Template `15_sop.md`

## Purpose

This template is used for defining *simple* Standard Operating Procedures (SOPs). SOPs document routine processes or workflows to ensure consistency and repeatability. This template is suitable for straightforward procedures; for more complex, multi-agent workflows with detailed validation, consider using the template in `.ruru/templates/workflows/`. SOPs are typically stored in `.ruru/processes/` or `.ruru/docs/standards/`.

## Usage

1.  Copy `.ruru/templates/toml-md/15_sop.md` to the appropriate directory (e.g., `.ruru/processes/`).
2.  Rename the file descriptively (e.g., `sop_code_review_process.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, clearly defining the `objective`, `scope`, and `roles`.
4.  Replace the placeholder content in the Markdown body with the specific steps of the procedure, including roles, actions, inputs/outputs, tools, and decision points.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the SOP.
    *   Example: `"SOP-CODE-REVIEW-001"`

*   `title` (String, Required):
    *   The human-readable title of the SOP.
    *   Example: `"Standard Code Review Process"`

*   `status` (String, Required):
    *   The current status of the SOP.
    *   Options: `"draft"`, `"active"`, `"deprecated"`, `"under-review"`.

*   `created_date` (String, Required):
    *   The date the SOP was initially created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the SOP was last significantly updated, in `YYYY-MM-DD` format.

*   `version` (String, Required):
    *   The version number of this SOP document (e.g., "1.0", "1.1").

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Should include `"sop"` and often `"workflow"`.
    *   Example: `["sop", "workflow", "code-review", "quality", "process"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/15_sop.README.md"`

*   `author` (String, Optional):
    *   Who originally drafted the SOP.
    *   Example: `"🧑‍💻 User:LeadDev"`, `"🤖 project-manager"`

*   `owner` (String, Required):
    *   The team or role responsible for maintaining and ensuring adherence to the SOP. Often the coordinator or a lead role.
    *   Example: `"Roo Commander"`, `"Team:Platform"`

*   `related_docs` (Array of Strings, Optional):
    *   Links to related specifications, guidelines, or tools mentioned in the SOP.

*   `related_tasks` (Array of Strings, Optional):
    *   List of MDTM task IDs related to the creation or update of this SOP.

*   `objective` (String, Required):
    *   A clear statement of what this SOP aims to achieve.

*   `scope` (String, Required):
    *   Defines the boundaries – what processes, agents, or situations this SOP applies to.

*   `roles` (Array of Strings, Required):
    *   List of agent roles involved in executing the procedure.
    *   Example: `["Developer Agent", "Code Reviewer Agent", "QA Agent"]`

*   `context_type` (String, Optional):
    *   AI Hint: Typically `"process_definition"`.

*   `target_audience` (Array of Strings, Optional):
    *   AI Hint: Often `["all"]` or specific roles involved.

*   `granularity` (String, Optional):
    *   AI Hint: Typically `"detailed"`.

## Markdown Body

The section below the `+++` TOML block contains the standard structure for an SOP:

*   `# << SOP_TITLE >>`: Replace with the SOP title.
*   `## 1. Objective 🎯`: State the goal of the procedure.
*   `## 2. Scope Boundaries ↔️`: Define where it applies and does not apply.
*   `## 3. Roles & Responsibilities 👤`: List roles (from TOML) and their responsibilities within this SOP.
*   `## 4. Reference Documents 📚`: List essential documents needed to follow the SOP.
*   `## 5. Procedure Steps 🪜`: Provide clear, numbered steps, including responsible role, actions, inputs, tools, outputs, decision points, and context requirements for each step. Use the example format provided in the template.
*   `## 6. Error Handling & Escalation ⚠️`: Describe how to handle common errors and when/how to escalate issues.
*   `## 7. Validation (PAL) ✅`: Reference the Process Assurance Lifecycle and record validation efforts.
*   `## 8. Revision History Memento 📜 (Optional)`: Track changes to the SOP document.