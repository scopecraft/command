# Documentation: Template `13_release_notes.md`

## Purpose

This template is used for documenting the changes included in a specific software release. It provides a structured format for communicating new features, improvements, bug fixes, and breaking changes to users and stakeholders. Release notes are typically stored in `.ruru/docs/releases/` or a similar location.

## Usage

1.  Copy `.ruru/templates/toml-md/13_release_notes.md` to the appropriate directory.
2.  Rename the file according to the release version (e.g., `v1.2.0.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, ensuring `version`, `release_date`, and `summary` are set. List the relevant MDTM task IDs in `related_tasks`.
4.  Replace the placeholder content in the Markdown body, summarizing the key changes in each category (Features, Improvements, Bug Fixes, Chores) and linking to the corresponding MDTM tasks. Detail any breaking changes clearly.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `version` (String, Required):
    *   The version number of this release, following semantic versioning (SemVer) where applicable.
    *   Example: `"v1.2.0"`, `"v2.0.0-beta.1"`

*   `release_date` (String, Required):
    *   The date the release was made public, in `YYYY-MM-DD` format.

*   `status` (String, Required):
    *   The status of this release version.
    *   Options: `"planned"`, `"released"`, `"beta"`, `"rc"` (Release Candidate).

*   `codename` (String, Optional):
    *   An internal or fun codename for the release.

*   `summary` (String, Required):
    *   A brief, one-sentence summary highlighting the main theme or key feature of the release.

*   `related_tasks` (Array of Strings, Required):
    *   A list of MDTM task IDs (features, bugs, chores) included in this release. This is crucial for traceability.
    *   Example: `["FEAT-AUTH-001", "BUG-UI-005", "CHORE-DEPS-012"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/13_release_notes.README.md"`

*   `breaking_changes` (Boolean or Array of Strings, Optional):
    *   Set to `true` if there are breaking changes detailed in the Markdown body. Alternatively, list brief descriptions of breaking changes here (though detail is better in the body). Defaults to `false` if omitted.

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and categorization. Should always include `"release"`. Add version number, key features, etc.
    *   Example: `["release", "v1.2", "frontend", "backend", "security"]`

*   `related_docs` (Array of Strings, Optional):
    *   Links to relevant planning documents, major feature documentation, or migration guides.

## Markdown Body

The section below the `+++` TOML block contains the standard structure for release notes:

*   `# Release Notes - << VERSION_NUMBER >>`: Replace with the version from TOML.
*   `**Release Date:** | **Status:**`: Display info from TOML.
*   `**(Optional) Codename:**`: Display if set in TOML.
*   `**Summary:**`: Display the summary from TOML.
*   `## 🚀 New Features`: List significant new features, linking to MDTM tasks.
*   `## ✨ Improvements`: List notable improvements or refactorings, linking to MDTM tasks.
*   `## 🐛 Bug Fixes`: List important bug fixes, linking to MDTM tasks.
*   `## 🧹 Chores / Maintenance`: List significant chores (e.g., dependency updates), linking to MDTM tasks.
*   `## ⚠️ Breaking Changes (If Applicable)`: Detail any changes that break backward compatibility and provide migration instructions. Only include if `breaking_changes` is true or listed in TOML.
*   `## Known Issues (Optional)`: List any known issues in this release and workarounds.
*   `## Installation / Upgrade Notes (Optional)`: Provide specific instructions if needed.
*   `## Credits / Contributors (Optional)`: Acknowledge contributors.