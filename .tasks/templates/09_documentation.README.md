# Documentation: Template `09_documentation.md`

## Purpose

This template is used for creating general project documentation, such as user guides, technical explanations, overviews, or specific feature documentation. These documents typically reside in the `.ruru/docs/` directory or its subdirectories.

## Usage

1.  Copy `.ruru/templates/toml-md/09_documentation.md` to the appropriate documentation directory (e.g., `.ruru/docs/` or `.ruru/docs/guides/`).
2.  Rename the file descriptively (e.g., `api_overview.md`, `user_guide_authentication.md`).
3.  Fill in the TOML frontmatter fields according to the schema below.
4.  Replace the placeholder content in the Markdown body with the actual documentation content, using clear headings and structure.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier or slug for the document.
    *   Example: `"DOC-API-OVERVIEW"`, `"user-guide-auth"`

*   `title` (String, Required):
    *   The human-readable title of the document.

*   `status` (String, Required):
    *   The current status of the documentation.
    *   Options: `"draft"`, `"published"`, `"needs_review"`, `"deprecated"`.

*   `doc_version` (String, Required):
    *   The version of the feature, system, or API being documented. Use "N/A" if not applicable.
    *   Example: `"v1.0"`, `"v2.1.3"`, `"N/A"`

*   `content_version` (Float, Required):
    *   The revision number of this specific document's content (e.g., 1.0, 1.1, 2.0). Increment when significant content changes are made.

*   `audience` (Array of Strings, Required):
    *   Specifies the intended audience(s) for this documentation.
    *   Example: `["developers"]`, `["end_users"]`, `["developers", "qa_team"]`

*   `last_reviewed` (String, Required):
    *   The date the content was last reviewed for accuracy and relevance, in `YYYY-MM-DD` format.

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/09_documentation.README.md"`

*   `owner` (String, Optional):
    *   The team or individual responsible for maintaining the accuracy of this document.
    *   Example: `"Team:Docs"`, `"🧑‍💻 User:LeadDev"`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization.
    *   Example: `["authentication", "api", "user-guide", "setup", "overview"]`

*   `parent_doc` (String, Optional):
    *   Path or ID of a parent document, useful for creating hierarchical documentation (e.g., linking a specific API guide back to an API overview).
    *   Example: `".ruru/docs/api/index.md"`

*   `related_tasks` (Array of Strings, Optional):
    *   List of MDTM task IDs related to the creation or update of this documentation.
    *   Example: `["DOCS-README-003"]`

*   `related_context` (Array of Strings, Optional):
    *   List of IDs or paths to related AI context source files.

## Markdown Body

The section below the `+++` TOML block contains the main documentation content:

*   `# << HUMAN_READABLE_DOCUMENT_TITLE >>`: Replace with the document title.
*   `(Optional) Version/Review Line`: Display key version/review info.
*   `## Introduction / Overview 🎯`: Explain the document's purpose and audience.
*   `## Section 1: << Title >> 📝`, `## Section 2: << Title >> ✅`, etc.: Structure the main content using descriptive headings. Use standard Markdown features like lists, code blocks, tables.
*   `## Diagrams / Visuals 📊 (Optional)`: Embed Mermaid diagrams or link to images.
*   `## Summary / Key Takeaways 💡 (Optional)`: Summarize the main points.
*   `## Related Links / Further Reading 🔗 (Optional)`: Link to other relevant resources.