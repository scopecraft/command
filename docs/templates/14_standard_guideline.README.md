# Documentation: Template `14_standard_guideline.md`

## Purpose

This template is used for defining coding standards, style guides, operational guidelines, or other sets of rules and recommendations for the project. These documents help ensure consistency, maintainability, and quality. They are typically stored in `.ruru/docs/standards/`.

## Usage

1.  Copy `.ruru/templates/toml-md/14_standard_guideline.md` to the `.ruru/docs/standards/` directory or a relevant subdirectory.
2.  Rename the file descriptively (e.g., `python_style_guide.md`, `api_design_guidelines.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, specifying the `scope` and `owner`.
4.  Replace the placeholder content in the Markdown body with the specific rules, rationale, and examples for the standard or guideline.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the standard/guideline document.
    *   Example: `"STD-CODESTYLE-PYTHON-001"`, `"GUIDE-API-DESIGN-001"`

*   `title` (String, Required):
    *   The human-readable name of the standard or guideline.
    *   Example: `"Python Coding Style Guide"`, `"API Design Guidelines"`

*   `version` (Float, Required):
    *   The version number of this standard document (e.g., 1.0, 1.1, 2.0).

*   `status` (String, Required):
    *   The current lifecycle status of the standard.
    *   Options: `"draft"`, `"active"`, `"proposed"`, `"superseded"`, `"deprecated"`.

*   `effective_date` (String, Required for active status):
    *   The date when this version of the standard becomes effective, in `YYYY-MM-DD` format.

*   `scope` (String, Required):
    *   A description or tags indicating where this standard applies.
    *   Example: `"All Python backend services"`, `"Frontend React components"`, `"Git commit messages"`

*   `owner` (String, Required):
    *   The team, committee, or individual responsible for maintaining and enforcing this standard.
    *   Example: `"Technical Standards Committee"`, `"Team:Frontend"`, `"🧑‍💻 User:LeadArchitect"`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/14_standard_guideline.README.md"`

*   `supersedes` (String, Optional):
    *   The `id` or path of a previous standard document that this one replaces.

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Include relevant technologies, areas, and type.
    *   Example: `["coding-style", "python", "backend", "linting", "security", "guideline", "standard"]`

*   `related_docs` (Array of Strings, Optional):
    *   Links to rationale documents, external references (e.g., PEP 8), examples, or related standards.

*   `related_tasks` (Array of Strings, Optional):
    *   List of MDTM task IDs related to the creation, update, or enforcement of this standard.

## Markdown Body

The section below the `+++` TOML block contains the standard structure for guidelines:

*   `# << NAME_OF_THE_STANDARD_OR_GUIDELINE >> (v<< VERSION >>)`: Replace placeholders with title and version from TOML.
*   `**Status:** | **Effective Date:** | **Owner:**`: Display key info from TOML.
*   `## Purpose / Goal 🎯`: Explain why the standard exists and its intended outcome.
*   `## Scope 🗺️`: Define where the standard applies and does not apply.
*   `## Standard / Guideline Details 📜`: Provide the specific rules/recommendations. Use subheadings (`###`) for individual rules. Include rationale and clear "Do/Don't" examples with code blocks.
*   `## Enforcement / Compliance (Optional) 👮`: Describe how compliance is ensured (linters, reviews) and consequences of non-compliance.
*   `## Exceptions (Optional) 🤷`: Detail any allowed exceptions and the process for requesting them.
*   `## Revision History (Optional) ⏳`: Track changes across different versions of the standard.
*   `## Related Links 🔗 (Optional)`: Link to relevant tools or further reading.