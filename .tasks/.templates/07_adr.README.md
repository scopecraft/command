# Documentation: Template `07_adr.md`

## Purpose

This template is used for documenting significant Architecture Decision Records (ADRs). ADRs capture important architectural decisions, their context, rationale, and consequences, providing a historical record for the project team. ADR files are typically stored in the `.ruru/decisions/` directory.

## Usage

1.  Copy `.ruru/templates/toml-md/07_adr.md` to the `.ruru/decisions/` directory.
2.  Rename the file following a convention like `ADR-NNN_short_description.md` (e.g., `ADR-001_message_queue_choice.md`).
3.  Fill in the TOML frontmatter fields according to the schema below, ensuring `id` and `title` are set.
4.  Replace the placeholder content in the Markdown body with the specific details of the architectural decision, context, rationale, and consequences.

## TOML Schema

The following fields are defined within the `+++` delimiters:

*   `id` (String, Required):
    *   A unique identifier for the ADR, typically sequential (e.g., "ADR-001", "ADR-002").

*   `title` (String, Required):
    *   A short, descriptive title summarizing the decision.
    *   Example: `"Choice of Message Queue Technology"`, `"Adoption of Monorepo Structure"`

*   `status` (String, Required):
    *   The current status of the decision.
    *   Allowed values: `"proposed"`, `"accepted"`, `"rejected"`, `"deprecated"`, `"superseded"`.

*   `decision_date` (String, Required):
    *   The date the decision was finalized (status moved to accepted/rejected/etc.), in `YYYY-MM-DD` format.

*   `authors` (Array of Strings, Required):
    *   List of individuals or roles who authored or significantly contributed to the decision.
    *   Example: `["🧑‍💻 User:ArchitectName", "🤖 technical-architect", "Team:Platform"]`

*   `template_schema_doc` (String, Required):
    *   A relative path pointing to this documentation file.
    *   Value: `".ruru/templates/toml-md/07_adr.README.md"`

*   `affected_components` (Array of Strings, Optional):
    *   List of system components, modules, or features significantly impacted by this decision.
    *   Example: `["auth-service", "order-processing", "frontend-app"]`

*   `tags` (Array of Strings, Required):
    *   Keywords for searching and filtering ADRs.
    *   Example: `["architecture", "backend", "messaging", "database", "monorepo", "performance"]`

*   `supersedes_adr` (String, Optional):
    *   The `id` of another ADR that this decision replaces or makes obsolete.
    *   Example: `"ADR-001"`

## Markdown Body

The section below the `+++` TOML block contains the standard sections for an ADR:

*   `# ADR-XXX: << SHORT_DESCRIPTION_OF_DECISION >>`: Replace XXX and the description with the ADR's ID and title.
*   `**Status:**`: Repeat the status from the TOML frontmatter.
*   `**(Optional) Date:**`: Repeat the decision date from the TOML frontmatter.
*   `## Context 🤔`: Describe the problem, challenge, constraints, and background leading to this decision.
*   `## Decision ✅ / ❌`: Clearly state the decision made.
*   `## Rationale / Justification 💡`: Explain *why* the decision was made, including pros/cons of alternatives and supporting evidence.
*   `## Consequences / Implications ➡️`: Detail the expected outcomes, impacts (positive and negative), required follow-up work (link to tasks), and risks.
*   `## Alternatives Considered (Optional Detail) 📝`: (Optional) Provide more in-depth discussion of rejected alternatives.
*   `## Related Links 🔗 (Optional)`: Link to relevant research spikes, prototypes, external documentation, or implementation tasks.