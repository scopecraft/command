# Template: Feature Proposal (`17_feature_proposal.md`)

This document outlines the schema and usage guidelines for the `17_feature_proposal.md` template. This template is designed for creating structured feature planning proposals, typically stored in the `.ruru/planning/` directory.

## Purpose

To provide a standardized format for proposing new features, outlining the problem, proposed solution, goals, non-goals, technical considerations, and potential risks. This structure facilitates clear communication, evaluation, and decision-making regarding new feature development.

## TOML Frontmatter Schema

The following TOML fields are defined for this template:

### Basic Metadata

*   `id` (String, Required): A unique identifier for the proposal document (e.g., `PLAN-FEAT-001`).
*   `title` (String, Required): A concise, human-readable title for the feature proposal.
*   `status` (String, Required): The current status of the proposal.
    *   **Options:** `draft`, `proposed`, `accepted`, `rejected`, `implemented`, `deferred`. Default: `draft`.
*   `created_date` (String, Required): The date the proposal was initially created (Format: `YYYY-MM-DD`).
*   `updated_date` (String, Required): The date the proposal was last significantly updated (Format: `YYYY-MM-DD`).
*   `version` (String, Required): The version of the proposal document itself (e.g., "1.0", "1.1"). Default: `1.0`.
*   `tags` (Array of Strings, Required): Keywords for categorization and searching. Include `planning`, `proposal`, `feature` by default. Add others as relevant (e.g., `ui`, `api`, `performance`).
*   `template_schema_doc` (String, Required): Points to this documentation file. Value: `.ruru/templates/toml-md/17_feature_proposal.README.md`.

### Ownership & Context

*   `proposed_by` (String, Required): The user, role, or team submitting the proposal (e.g., `"User: John Doe"`, `"Team: Frontend"`).
*   `owner` (String, Optional): The user, role, or team responsible for the feature if the proposal is accepted.
*   `related_docs` (Array of Strings, Optional): Paths or URLs to related documents (e.g., market research, technical specifications, design mockups).
*   `related_tasks` (Array of Strings, Optional): IDs of related MDTM tasks (e.g., initial spike tasks, user research tasks).
*   `parent_doc` (String, Optional): Path or ID of a higher-level planning document or initiative this proposal belongs to.

### Proposal Specific Fields

*   `priority` (String, Required): The proposed priority level for the feature.
    *   **Options:** `low`, `medium`, `high`, `critical`. Default: `medium`.
*   `estimated_effort` (String, Optional): A rough estimate of the effort required (e.g., `"Small"`, `"Medium"`, `"Large"`, `"XL"`, `"2 Story Points"`).
*   `target_release` (String, Optional): The intended release version or timeframe if known (e.g., `"v2.1"`, `"Q3 2025"`).

### AI Interaction Hints (Optional)

*   `context_type` (String): Describes the nature of the content for AI. Value: `planning`.
*   `target_audience` (Array of Strings): Specifies which AI roles might find this relevant. Default: `["all"]`.
*   `granularity` (String): Indicates the level of detail. Value: `detailed`.

## Markdown Body Structure

The Markdown body should follow these sections:

1.  **`# << HUMAN_READABLE_TITLE_OF_PROPOSAL >>`**: Repeat the title from the TOML frontmatter.
2.  **`## 1. Overview / Purpose 🎯`**: A brief summary of the feature and its primary goal. Answer: What is it? Why build it?
3.  **`## 2. Problem Statement 🤔`**: Describe the current pain points or unmet needs this feature addresses. Explain the impact and importance.
4.  **`## 3. Proposed Solution ✨`**: Detail the proposed feature. Describe the user experience, functionality, and key aspects. Use lists, mockups (links or embedded), or user flows.
5.  **`## 4. Goals ✅`**: List specific, measurable objectives. How will success be defined and measured?
6.  **`## 5. Non-Goals ❌`**: Explicitly state what is *not* included in this proposal to manage scope.
7.  **`## 6. Technical Design / Implementation Sketch 🛠️ (Optional)`**: High-level technical approach, key components, potential system impacts.
8.  **`## 7. Alternatives Considered 🔄 (Optional)`**: Other solutions explored and why the proposed one was chosen.
9.  **`## 8. Open Questions / Risks ❓`**: List unknowns, dependencies, or potential challenges.
10. **`## 9. Diagrams / Visuals 📊 (Optional)`**: Include Mermaid diagrams or links to other visuals.
11. **`## 10. Related Links 🔗 (Optional)`**: Links to supporting documents, research, etc.

## Usage

1.  Copy this template (`17_feature_proposal.md`) to the `.ruru/planning/` directory (or a relevant subdirectory).
2.  Rename the file appropriately (e.g., `PLAN-FEAT-001_Enhanced_Git_Integration.md`).
3.  Fill in the TOML frontmatter fields, replacing placeholders and comments. Ensure `id`, `title`, `status`, `created_date`, `updated_date`, `version`, `tags`, `template_schema_doc`, `proposed_by`, and `priority` are set correctly.
4.  Write the detailed proposal content in the Markdown body, following the section structure.
5.  Commit the new proposal file to the repository.