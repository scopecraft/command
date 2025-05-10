# Documentation: Template `00_boilerplate.md`

## Purpose

This template serves as a generic starting point for creating new TOML+Markdown document types within the workspace. It includes common metadata fields applicable to many document types. Adapt this boilerplate when a more specific template is not available.

## Usage

1.  Copy `.ruru/templates/toml-md/00_boilerplate.md` to a new file in the appropriate directory (e.g., `.ruru/docs/`, `.ruru/processes/`, or `.ruru/templates/toml-md/` if creating a new reusable template type).
2.  Rename the file according to the conventions for the document type or the new template type.
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Customize the "Document Type Specific Fields" section in the TOML block with fields relevant to the new document type.
5.  Replace the placeholder content in the Markdown body (`# << HUMAN_READABLE_TITLE >>`, `## Overview / Purpose 🎯`, etc.) with the actual content.

## TOML Schema

The following fields are defined within the `+++` delimiters:

### Basic Metadata

*   `id` (String, Required):
    *   A unique identifier for the document. Use a consistent format, often `TYPE-SCOPE-NNN`.
    *   Example: `"DOC-PLANNING-001"`, `"TASK-FEATUREX-003"`

*   `title` (String, Required):
    *   A human-readable title for the document.

*   `status` (String, Required):
    *   The current lifecycle status of the document.
    *   Example values: `"draft"`, `"active"`, `"published"`, `"deprecated"`, `"proposed"`, `"accepted"`, `"rejected"`. Choose appropriate values based on the document type.

*   `created_date` (String, Required):
    *   The date the document was initially created, in `YYYY-MM-DD` format.

*   `updated_date` (String, Required):
    *   The date the document was last significantly updated, in `YYYY-MM-DD` format. Should be updated whenever meaningful changes are made.

*   `version` (String, Optional):
    *   Version of the document's content or the related software/concept it describes.
    *   Example: `"1.0"`, `"v2.1.3"`

*   `tags` (Array of Strings, Required):
    *   A list of relevant keywords for searching, filtering, and categorization.
    *   Example: `["planning", "roadmap", "q3"]`, `["task", "ui", "login"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to the `.README.md` file that documents the schema for this template (or the template it was derived from).
    *   Example: `".ruru/templates/toml-md/00_boilerplate.README.md"`

### Ownership & Context (Optional)

*   `author` (String, Optional):
    *   The user or entity who originally created the document.
    *   Example: `"🧑‍💻 User:JaneDoe"`

*   `owner` (String, Optional):
    *   The team or individual responsible for maintaining the document.
    *   Example: `"Team:Frontend"`

*   `related_docs` (Array of Strings, Optional):
    *   List of file paths or URLs to related documents, specifications, or resources.
    *   Example: `[".ruru/docs/requirements.md", "https://example.com/api-spec"]`

*   `related_tasks` (Array of Strings, Optional):
    *   List of related MDTM task IDs (e.g., from `.tasks/`).
    *   Example: `["TASK-FEATUREX-001", "TASK-BUGFIX-015"]`

*   `parent_doc` (String, Optional):
    *   Path or ID of a parent document, useful for creating hierarchical structures.
    *   Example: `".ruru/templates/toml-mddocs/architecture/overview.md"`

### Document Type Specific Fields (Placeholder)

*   This section in the TOML block is intended to be customized when creating a *new template type* based on this boilerplate. Add fields specific to the new document type here.
*   Examples (for a hypothetical "Guide" type):
    *   `difficulty = "beginner"` (String, Optional. Options: "beginner", "intermediate", "advanced")
    *   `estimated_time = "~15 minutes"` (String, Optional)
    *   `prerequisites = ["Basic knowledge of X"]` (Array of Strings, Optional)
    *   `learning_objectives = ["Understand Y", "Be able to Z"]` (Array of Strings, Optional)

### AI Interaction Hints (Optional)

These fields provide guidance to AI assistants on how to interpret and use the document's content.

*   `context_type` (String, Optional):
    *   The primary nature of the content.
    *   Example values: `"reference"`, `"tutorial"`, `"conceptual"`, `"best_practices"`, `"rules"`, `"configuration"`, `"plan"`, `"report"`, `"decision_record"`.

*   `target_audience` (Array of Strings, Optional):
    *   Specifies the intended audience (AI modes or user roles).
    *   Example: `["all"]`, `["react-specialist", "junior-developer"]`, `["project-manager"]`.

*   `granularity` (String, Optional):
    *   The level of detail provided in the content.
    *   Example values: `"overview"`, `"detailed"`, `"specific_example"`, `"ruleset"`.

## Markdown Body

The section below the `+++` TOML block is for the main human-readable content using standard Markdown. The boilerplate includes suggested headings:

*   `# << HUMAN_READABLE_TITLE >>`: Replace with the document title.
*   `## Overview / Purpose 🎯`: Explain the document's goal.
*   `## Content Section 1 📝`, `## Content Section 2 ✅`: Structure the main content. Use more sections as needed.
*   `## Diagrams / Visuals 📊 (Optional)`: Embed Mermaid diagrams if applicable.
*   `## Key Learnings / Summary 💡 (Optional)`: Summarize key points.
*   `## Related Links 🔗 (Optional)`: Add relevant links.

Adapt or remove these sections as appropriate for the specific document type being created.